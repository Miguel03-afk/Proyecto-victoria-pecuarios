import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { T, shadow, font, fmt, fdoc, estadoStyle } from "../styles/admin.tokens";

// ─── Iconos ───────────────────────────────────────────────────
const Icon = ({ d, size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" stroke={color}
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

const ICONS = {
  venta:    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  historial:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  user:     "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check:    "M5 13l4 4L19 7",
  home:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
};

const METODOS = [
  { id: "efectivo",      label: "Efectivo",      icon: "💵" },
  { id: "tarjeta",       label: "Tarjeta",        icon: "💳" },
  { id: "transferencia", label: "Transferencia",  icon: "🏦" },
  { id: "pse",           label: "PSE",            icon: "🔐" },
];

const NAV = [
  { id: "venta",     label: "Nueva venta",    icon: ICONS.venta },
  { id: "historial", label: "Mis ventas hoy", icon: ICONS.historial },
];

// ─── Componentes base ─────────────────────────────────────────
const Badge = ({ estado }) => {
  const s = estadoStyle(estado);
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {estado}
    </span>
  );
};

// ─── Sección: Nueva Venta ─────────────────────────────────────
function NuevaVenta() {
  const [buscarProd, setBuscarProd]   = useState("");
  const [productos,  setProductos]    = useState([]);
  const [buscandoProd, setBuscandoProd] = useState(false);
  const [cart,       setCart]         = useState([]);
  const [clienteBus, setClienteBus]   = useState("");
  const [clientes,   setClientes]     = useState([]);
  const [clienteSel, setClienteSel]   = useState(null);
  const [metodo,     setMetodo]       = useState("efectivo");
  const [notas,      setNotas]        = useState("");
  const [enviando,   setEnviando]     = useState(false);
  const [exito,      setExito]        = useState(null);
  const [error,      setError]        = useState("");
  const buscarRef = useRef(null);

  // Búsqueda de productos con debounce
  useEffect(() => {
    if (!buscarProd.trim()) { setProductos([]); return; }
    setBuscandoProd(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/cajero/productos", { params: { buscar: buscarProd } });
        setProductos(data);
      } catch { setProductos([]); }
      finally { setBuscandoProd(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [buscarProd]);

  // Búsqueda de clientes con debounce
  useEffect(() => {
    if (!clienteBus.trim()) { setClientes([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/cajero/clientes", { params: { buscar: clienteBus } });
        setClientes(data);
      } catch { setClientes([]); }
    }, 280);
    return () => clearTimeout(t);
  }, [clienteBus]);

  const agregar = (prod) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.producto.id === prod.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
    setBuscarProd("");
    setProductos([]);
    buscarRef.current?.focus();
  };

  const cambiarCantidad = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
    );
  };

  const quitar = (id) => setCart(prev => prev.filter(i => i.producto.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  const iva      = subtotal * 0.19;
  const total    = subtotal + iva;

  const registrar = async () => {
    if (!cart.length) return setError("Agrega al menos un producto.");
    setError(""); setEnviando(true);
    try {
      const { data } = await api.post("/cajero/facturas", {
        usuario_id: clienteSel?.id || null,
        items:      cart.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        metodo_pago: metodo,
        notas:       notas || undefined,
      });
      setExito(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar la venta.");
    } finally {
      setEnviando(false);
    }
  };

  const nueva = () => {
    setExito(null); setCart([]); setClienteSel(null);
    setClienteBus(""); setNotas(""); setError("");
    buscarRef.current?.focus();
  };

  // ── Pantalla de éxito ────────────────────────────────────────
  if (exito) return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: T.successBg, border: `1px solid ${T.successBorder}` }}>✓</div>
      <div className="text-center">
        <p className="text-base font-bold" style={{ color: T.text }}>Venta registrada</p>
        <p className="text-2xl font-bold mt-1 tabular-nums"
          style={{ color: T.brand, fontFamily: font.mono }}>{exito.codigo}</p>
        <p className="text-xs mt-2" style={{ color: T.textMuted }}>
          Total cobrado: <strong style={{ fontFamily: font.mono }}>{fmt(total)}</strong>
        </p>
      </div>
      <button onClick={nueva}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
        style={{ background: T.brand, boxShadow: shadow.sm }}>
        + Nueva venta
      </button>
    </div>
  );

  // ── Layout principal ─────────────────────────────────────────
  return (
    <div className="flex gap-5 h-full min-h-0">

      {/* ── IZQUIERDA: búsqueda de productos ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Buscador de productos */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>
            Buscar producto
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Icon d={ICONS.search} size={14} color={T.textMuted} />
            </div>
            <input
              ref={buscarRef}
              value={buscarProd}
              onChange={e => setBuscarProd(e.target.value)}
              placeholder="Nombre o marca del producto..."
              autoFocus
              className="w-full pl-9 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
              style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }}
              onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.background = T.surface; }}
              onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.background = T.surfaceAlt; }}
            />
            {buscandoProd && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-spin"
                style={{ border: `2px solid ${T.brandLight}`, borderTopColor: T.brand }} />
            )}
          </div>

          {/* Resultados */}
          {productos.length > 0 && (
            <div className="rounded-xl overflow-hidden max-h-64 overflow-y-auto"
              style={{ border: `1px solid ${T.border}` }}>
              {productos.map(p => (
                <button key={p.id} onClick={() => agregar(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{ borderBottom: `1px solid ${T.borderSub}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-base">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: T.text }}>{p.nombre}</p>
                    {p.marca && <p className="text-xs" style={{ color: T.textMuted }}>{p.marca}</p>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold tabular-nums" style={{ color: T.brand, fontFamily: font.mono }}>
                      {fmt(p.precio)}
                    </p>
                    <p className="text-xs" style={{ color: p.stock > 0 ? T.textMuted : T.danger }}>
                      Stock: {p.stock}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {buscarProd && !buscandoProd && !productos.length && (
            <p className="text-xs text-center py-3" style={{ color: T.textMuted }}>
              Sin resultados para "{buscarProd}"
            </p>
          )}
        </div>

        {/* Buscador de cliente */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>
            Cliente <span className="normal-case font-normal">(opcional)</span>
          </label>

          {clienteSel ? (
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: T.brandLight, border: `1px solid ${T.brandBorder}` }}>
              <div>
                <p className="text-xs font-bold" style={{ color: T.brand }}>
                  {clienteSel.nombre} {clienteSel.apellido}
                </p>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  {clienteSel.numero_documento} · {clienteSel.email}
                </p>
              </div>
              <button onClick={() => { setClienteSel(null); setClienteBus(""); }}
                className="text-xs font-semibold" style={{ color: T.danger }}>Quitar</button>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Icon d={ICONS.user} size={14} color={T.textMuted} />
                </div>
                <input value={clienteBus} onChange={e => setClienteBus(e.target.value)}
                  placeholder="Nombre, documento o email..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }}
                  onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.background = T.surface; }}
                  onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.background = T.surfaceAlt; }}
                />
              </div>
              {clientes.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                  {clientes.map(c => (
                    <button key={c.id} onClick={() => { setClienteSel(c); setClienteBus(""); setClientes([]); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ borderBottom: `1px solid ${T.borderSub}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: T.brandLight, color: T.brand }}>
                        {c.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: T.text }}>{c.nombre} {c.apellido}</p>
                        <p className="text-xs truncate" style={{ color: T.textMuted }}>{c.numero_documento} · {c.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Notas */}
        <div className="rounded-2xl p-4"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.textTer }}>
            Notas internas <span className="normal-case font-normal">(opcional)</span>
          </label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones de la venta..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none transition-all"
            style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }}
            onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.background = T.surface; }}
            onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.background = T.surfaceAlt; }}
          />
        </div>
      </div>

      {/* ── DERECHA: pedido en curso ── */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">

        {/* Items del carrito */}
        <div className="rounded-2xl flex flex-col flex-1 overflow-hidden"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>
              Pedido · {cart.length} ítem{cart.length !== 1 ? "s" : ""}
            </p>
          </div>

          {!cart.length ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-2 px-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: T.surfaceAlt }}>🛒</div>
              <p className="text-xs text-center" style={{ color: T.textMuted }}>
                Busca un producto para agregar al pedido
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: T.borderSub }}>
              {cart.map(({ producto, cantidad }) => (
                <div key={producto.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug" style={{ color: T.text }}>
                      {producto.nombre}
                    </p>
                    <p className="text-xs mt-0.5 tabular-nums" style={{ color: T.brand, fontFamily: font.mono }}>
                      {fmt(producto.precio)} c/u
                    </p>
                  </div>
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => cambiarCantidad(producto.id, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                      style={{ background: T.surfaceAlt, color: T.textSec, border: `1px solid ${T.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = T.surfaceAlt}>
                      −
                    </button>
                    <span className="w-7 text-center text-xs font-bold tabular-nums" style={{ color: T.text }}>
                      {cantidad}
                    </span>
                    <button onClick={() => cambiarCantidad(producto.id, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                      style={{ background: T.surfaceAlt, color: T.textSec, border: `1px solid ${T.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = T.surfaceAlt}>
                      +
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="text-xs font-bold tabular-nums" style={{ color: T.text, fontFamily: font.mono }}>
                      {fmt(producto.precio * cantidad)}
                    </p>
                    <button onClick={() => quitar(producto.id)}
                      className="transition-colors"
                      style={{ color: T.textMuted }}
                      onMouseEnter={e => e.currentTarget.style.color = T.danger}
                      onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                      <Icon d={ICONS.trash} size={13} color="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totales */}
          {cart.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="flex justify-between text-xs" style={{ color: T.textTer }}>
                <span>Subtotal</span>
                <span className="tabular-nums" style={{ fontFamily: font.mono }}>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: T.info }}>
                <span>IVA 19%</span>
                <span className="tabular-nums" style={{ fontFamily: font.mono }}>{fmt(iva)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1.5"
                style={{ borderTop: `1px solid ${T.border}`, color: T.text }}>
                <span>Total a cobrar</span>
                <span className="tabular-nums" style={{ color: T.brand, fontFamily: font.mono }}>{fmt(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Método de pago */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>
            Método de pago
          </p>
          <div className="grid grid-cols-2 gap-2">
            {METODOS.map(m => (
              <button key={m.id} onClick={() => setMetodo(m.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={metodo === m.id
                  ? { background: T.brandLight, color: T.brand, border: `1.5px solid ${T.brandBorder}` }
                  : { background: T.surfaceAlt, color: T.textSec, border: `1.5px solid ${T.border}` }}>
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error y botón registrar */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-xs font-medium"
            style={{ background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` }}>
            {error}
          </div>
        )}

        <button onClick={registrar} disabled={enviando || !cart.length}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: T.brand, boxShadow: shadow.sm }}>
          {enviando ? "Registrando..." : `Registrar venta · ${fmt(total)}`}
        </button>

        {cart.length > 0 && (
          <button onClick={() => setCart([])}
            className="w-full py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: T.danger, border: `1px solid ${T.dangerBorder}`, background: T.dangerBg }}>
            Vaciar pedido
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sección: Historial del cajero ────────────────────────────
function Historial() {
  const [ventas,   setVentas]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/cajero/mis-ventas")
      .then(({ data }) => setVentas(data))
      .finally(() => setCargando(false));
  }, []);

  const totalHoy = ventas
    .filter(v => v.created_at?.startsWith(new Date().toISOString().split("T")[0]))
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 rounded-full animate-spin"
        style={{ border: `2px solid ${T.brandLight}`, borderTopColor: T.brand }} />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ventas totales",  value: ventas.length,       mono: false },
          { label: "Ventas hoy",      value: ventas.filter(v => v.created_at?.startsWith(new Date().toISOString().split("T")[0])).length, mono: false },
          { label: "Facturado total", value: fmt(ventas.reduce((acc, v) => acc + Number(v.total || 0), 0)), mono: true },
        ].map(({ label, value, mono }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
            <p className="text-xl font-bold" style={{ color: T.brand, fontFamily: mono ? font.mono : undefined }}>
              {value}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: T.textMuted }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {!ventas.length ? (
        <div className="rounded-2xl p-12 flex flex-col items-center gap-3"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: T.surfaceAlt }}>📋</div>
          <p className="text-sm" style={{ color: T.textMuted }}>Sin ventas registradas aún</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
                {["Código", "Cliente", "Ítems", "Método", "Total", "Estado", "Fecha"].map(col => (
                  <th key={col} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: T.textTer }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.map((v, i) => (
                <tr key={v.id} className="transition-colors"
                  style={{ borderBottom: `1px solid ${T.borderSub}`, background: i % 2 === 0 ? T.surface : T.surfaceAlt }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surface : T.surfaceAlt}>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold" style={{ color: T.brand, fontFamily: font.mono }}>{v.codigo}</span>
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: T.textSec }}>
                    {v.cliente || <span style={{ color: T.textMuted }}>—</span>}
                  </td>
                  <td className="py-3 px-4 text-xs tabular-nums" style={{ color: T.textTer }}>{v.items}</td>
                  <td className="py-3 px-4 text-xs capitalize" style={{ color: T.textTer }}>{v.metodo_pago}</td>
                  <td className="py-3 px-4 text-xs font-bold tabular-nums" style={{ color: T.text, fontFamily: font.mono }}>
                    {fmt(v.total)}
                  </td>
                  <td className="py-3 px-4"><Badge estado={v.estado} /></td>
                  <td className="py-3 px-4 text-xs" style={{ color: T.textMuted }}>{fdoc(v.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Layout principal ─────────────────────────────────────────
export default function PanelCajero() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [seccion, setSeccion] = useState("venta");

  useEffect(() => {
    if (usuario && !["cajero", "admin", "superadmin"].includes(usuario.rol)) {
      navigate("/");
    }
  }, [usuario, navigate]);

  return (
    <div className="min-h-screen flex" style={{ background: T.canvas }}>

      {/* ── Sidebar ── */}
      <aside className="w-52 flex flex-col flex-shrink-0"
        style={{ background: T.sidebar, borderRight: `1px solid ${T.sidebarBorder}` }}>

        {/* Logo */}
        <div className="px-3 py-4" style={{ borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: T.gold, color: "#064E30" }}>V</div>
            <div>
              <p className="text-xs font-bold leading-none" style={{ color: T.sidebarTextHi }}>Victoria</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: T.sidebarText }}>Pets · Caja</p>
            </div>
          </Link>
        </div>

        {/* Usuario */}
        {usuario && (
          <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder}` }}>
            <div className="flex items-center gap-2 rounded-xl px-2.5 py-2"
              style={{ background: T.sidebarActive }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: T.gold, color: "#064E30" }}>
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: T.sidebarTextHi }}>{usuario.nombre}</p>
                <p className="text-xs capitalize" style={{ color: T.gold }}>cajero</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV.map(s => (
            <button key={s.id} onClick={() => setSeccion(s.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${seccion === s.id ? "font-bold" : "font-medium"}`}
              style={{
                background:  seccion === s.id ? T.sidebarActive : "transparent",
                color:       seccion === s.id ? T.sidebarTextHi : T.sidebarText,
                borderLeft:  seccion === s.id ? `2px solid ${T.gold}` : "2px solid transparent",
              }}
              onMouseEnter={e => { if (seccion !== s.id) e.currentTarget.style.background = T.sidebarActive; }}
              onMouseLeave={e => { if (seccion !== s.id) e.currentTarget.style.background = "transparent"; }}>
              <svg width={15} height={15} fill="none" stroke="currentColor"
                strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d={s.icon} />
              </svg>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-2 py-3 space-y-0.5" style={{ borderTop: `1px solid ${T.sidebarBorder}` }}>
          <Link to="/"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ color: T.sidebarText }}
            onMouseEnter={e => e.currentTarget.style.background = T.sidebarActive}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.75}
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={ICONS.home} />
            </svg>
            Ir a la tienda
          </Link>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <h1 className="text-sm font-bold" style={{ color: T.text }}>
            {seccion === "venta" ? "Nueva venta" : "Mis ventas"}
          </h1>
          <p className="text-xs" style={{ color: T.textMuted }}>
            {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {seccion === "venta"     && <NuevaVenta />}
          {seccion === "historial" && <Historial />}
        </div>
      </div>
    </div>
  );
}
