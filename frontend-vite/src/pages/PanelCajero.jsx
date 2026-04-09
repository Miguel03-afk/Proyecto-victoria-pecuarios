// PanelCajero.jsx — v6 corregido
// Bugs solucionados:
//   1. Pantalla en blanco al seleccionar producto: estado "pedido" inicializado
//      correctamente y función agregarProducto sin mutación directa de estado.
//   2. Navbar duplicada en /perfil: PanelCajero NO importa <Navbar /> —
//      usa su propio sidebar (layout de dos columnas con sidebar oscuro).
//      La duplicación venía de que Perfil.jsx ahora incluye Navbar (fix v6)
//      y compartía algo del layout. PanelCajero es autónomo.

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ─── Design tokens (mirrors admin.tokens.js + T.* del proyecto) ──────────────
const T = {
  // Superficies
  bg:         "#f5f5f4",       // página principal
  sidebar:    "#111816",       // sidebar oscuro
  sidebarAlt: "#1a2420",       // fila hover en sidebar
  surface:    "#ffffff",
  surfaceAlt: "#f9fafb",       // inset inputs

  // Marca
  brand:      "#1a5c1a",
  brandLight: "#22762e",
  brandDim:   "rgba(26,92,26,0.12)",
  accent:     "#a3e635",       // SOLO CTAs importantes

  // Texto
  text:       "#111827",
  textSec:    "#374151",
  textTer:    "#6b7280",
  textMuted:  "#9ca3af",
  textOnDark: "#e9f5e9",
  textOnDarkSec: "#a3c4a3",

  // Bordes (borders-only depth)
  border:     "rgba(0,0,0,0.07)",
  borderMed:  "rgba(0,0,0,0.11)",
  borderStr:  "rgba(0,0,0,0.16)",
  borderBrand:"rgba(26,92,26,0.35)",

  // Semánticos
  success:    "#15803d",
  successBg:  "#f0fdf4",
  warning:    "#b45309",
  warningBg:  "#fffbeb",
  danger:     "#dc2626",
  dangerBg:   "#fef2f2",

  // Métodos de pago
  pagoActive: "#1a5c1a",
  pagoText:   "#ffffff",
};

// ─── Formateo ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

// ─── Hooks de debounce ───────────────────────────────────────────────────────
function useDebounce(value, delay = 280) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Componentes UI ──────────────────────────────────────────────────────────
function Badge({ children, color = T.brand, bg = T.brandDim }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 99,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
      color, background: bg,
    }}>{children}</span>
  );
}

function IconBtn({ onClick, title, children, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 6,
        border: `1px solid ${danger ? "rgba(220,38,38,0.2)" : T.borderMed}`,
        background: danger ? T.dangerBg : T.surfaceAlt,
        color: danger ? T.danger : T.textSec,
        cursor: "pointer", transition: "all 0.15s",
        fontSize: 14,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = danger ? T.danger : T.borderStr;
        e.currentTarget.style.background = danger ? "#fee2e2" : "#f3f4f6";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = danger ? "rgba(220,38,38,0.2)" : T.borderMed;
        e.currentTarget.style.background = danger ? T.dangerBg : T.surfaceAlt;
      }}
    >{children}</button>
  );
}

function QtyControl({ qty, onInc, onDec }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <IconBtn onClick={onDec} title="Quitar uno">−</IconBtn>
      <span style={{
        minWidth: 28, textAlign: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13, fontWeight: 600, color: T.text,
      }}>{qty}</span>
      <IconBtn onClick={onInc} title="Agregar uno">+</IconBtn>
    </div>
  );
}

// ─── Sección: Nueva venta ────────────────────────────────────────────────────
function NuevaVenta({ usuario }) {
  const [queryProd, setQueryProd]       = useState("");
  const [queryCliente, setQueryCliente] = useState("");
  const [resultsProd, setResultsProd]   = useState([]);
  const [resultsCliente, setResultsCliente] = useState([]);
  const [pedido, setPedido]             = useState([]);  // ← FIX: array vacío correcto
  const [clienteSel, setClienteSel]     = useState(null);
  const [notas, setNotas]               = useState("");
  const [metodoPago, setMetodoPago]     = useState(null);
  const [cargandoProd, setCargandoProd] = useState(false);
  const [enviando, setEnviando]         = useState(false);
  const [exito, setExito]               = useState(null);
  const [error, setError]               = useState(null);
  const [showProdList, setShowProdList] = useState(false);
  const [showClienteList, setShowClienteList] = useState(false);

  const debouncedProd    = useDebounce(queryProd, 280);
  const debouncedCliente = useDebounce(queryCliente, 280);

  const prodRef    = useRef(null);
  const clienteRef = useRef(null);

  // Buscar productos
  useEffect(() => {
    if (!debouncedProd.trim()) { setResultsProd([]); setShowProdList(false); return; }
    setCargandoProd(true);
    axios.get(`/api/cajero/productos?buscar=${encodeURIComponent(debouncedProd)}`)
      .then(r => { setResultsProd(r.data || []); setShowProdList(true); })
      .catch(() => setResultsProd([]))
      .finally(() => setCargandoProd(false));
  }, [debouncedProd]);

  // Buscar clientes
  useEffect(() => {
    if (!debouncedCliente.trim()) { setResultsCliente([]); setShowClienteList(false); return; }
    axios.get(`/api/cajero/clientes?buscar=${encodeURIComponent(debouncedCliente)}`)
      .then(r => { setResultsCliente(r.data || []); setShowClienteList(true); })
      .catch(() => setResultsCliente([]));
  }, [debouncedCliente]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (prodRef.current && !prodRef.current.contains(e.target)) setShowProdList(false);
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setShowClienteList(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── FIX PRINCIPAL: agregar producto sin mutar estado ──────────────────────
  const agregarProducto = useCallback((prod) => {
    setQueryProd("");
    setResultsProd([]);
    setShowProdList(false);

    setPedido(prev => {
      // Buscar si ya existe en el pedido
      const idx = prev.findIndex(item => item.producto_id === prod.id);
      if (idx !== -1) {
        // Ya existe: incrementar cantidad con spread (sin mutar)
        return prev.map((item, i) =>
          i === idx ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Nuevo item: agregar al final
      return [
        ...prev,
        {
          producto_id: prod.id,
          nombre:      prod.nombre,
          precio:      Number(prod.precio),
          stock:       prod.stock,
          cantidad:    1,
        },
      ];
    });
  }, []);

  const cambiarCantidad = useCallback((producto_id, delta) => {
    setPedido(prev =>
      prev
        .map(item =>
          item.producto_id === producto_id
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter(item => item.cantidad > 0)
    );
  }, []);

  const eliminarItem = useCallback((producto_id) => {
    setPedido(prev => prev.filter(item => item.producto_id !== producto_id));
  }, []);

  const vaciarPedido = useCallback(() => {
    setPedido([]);
    setClienteSel(null);
    setQueryCliente("");
    setNotas("");
    setMetodoPago(null);
    setError(null);
    setExito(null);
  }, []);

  // Cálculos
  const subtotal = pedido.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const iva      = subtotal * 0.19;
  const total    = subtotal + iva;

  // Registrar venta
  const registrarVenta = async () => {
    if (!pedido.length)  return setError("Agrega al menos un producto.");
    if (!metodoPago)     return setError("Selecciona el método de pago.");
    setError(null);
    setEnviando(true);
    try {
      const payload = {
        usuario_id: clienteSel?.id ?? null,
        items: pedido.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined,
      };
      const { data } = await axios.post("/api/cajero/facturas", payload);
      setExito(data);
      setPedido([]);
      setClienteSel(null);
      setQueryCliente("");
      setNotas("");
      setMetodoPago(null);
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error al registrar la venta.");
    } finally {
      setEnviando(false);
    }
  };

  const METODOS = [
    { id: "efectivo",      label: "Efectivo",      icon: "💵" },
    { id: "tarjeta",       label: "Tarjeta",        icon: "💳" },
    { id: "transferencia", label: "Transferencia",  icon: "🏦" },
    { id: "pse",           label: "PSE",            icon: "🔐" },
  ];

  if (exito) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 20, padding: 48, textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: T.successBg, border: `2px solid ${T.success}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}>✓</div>
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>
            Venta registrada
          </p>
          <p style={{ color: T.textSec, margin: "0 0 4px" }}>
            Código de orden:
          </p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700,
            color: T.brand, letterSpacing: "0.08em", margin: 0,
          }}>{exito.codigo}</p>
        </div>
        <button
          onClick={vaciarPedido}
          style={{
            padding: "10px 28px", borderRadius: 8,
            background: T.brand, color: "#fff", border: "none",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.brandLight}
          onMouseLeave={e => e.currentTarget.style.background = T.brand}
        >Nueva venta</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

      {/* ── Columna izquierda ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Buscador productos */}
        <div ref={prodRef} style={{ position: "relative" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textTer, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Buscar producto
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Nombre del producto..."
              value={queryProd}
              onChange={e => setQueryProd(e.target.value)}
              onFocus={() => resultsProd.length && setShowProdList(true)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px 10px 38px", borderRadius: 8,
                border: `1px solid ${T.borderMed}`,
                background: T.surfaceAlt, color: T.text,
                fontSize: 14, outline: "none", transition: "border-color 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = T.borderBrand; if (resultsProd.length) setShowProdList(true); }}
              onBlur={e => e.target.style.borderColor = T.borderMed}
            />
            {cargandoProd && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 12 }}>…</span>
            )}
          </div>

          {/* Lista de resultados de productos */}
          {showProdList && resultsProd.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: T.surface, borderRadius: 10,
              border: `1px solid ${T.borderStr}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              zIndex: 50, maxHeight: 280, overflowY: "auto",
            }}>
              {resultsProd.map(prod => (
                <button
                  key={prod.id}
                  onMouseDown={e => { e.preventDefault(); agregarProducto(prod); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 14px",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 12, transition: "background 0.1s",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>{prod.nombre}</p>
                    <p style={{ margin: 0, fontSize: 11, color: T.textTer }}>
                      Stock: {prod.stock} · {prod.marca || "—"}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                    fontWeight: 700, color: T.brand, whiteSpace: "nowrap",
                  }}>{fmt(prod.precio)}</span>
                </button>
              ))}
            </div>
          )}
          {showProdList && resultsProd.length === 0 && !cargandoProd && queryProd.trim() && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: T.surface, borderRadius: 10, border: `1px solid ${T.borderMed}`,
              padding: "12px 14px", fontSize: 13, color: T.textTer, zIndex: 50,
            }}>Sin resultados para "{queryProd}"</div>
          )}
        </div>

        {/* Buscador cliente */}
        <div ref={clienteRef} style={{ position: "relative" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textTer, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Cliente (opcional)
          </label>
          {clienteSel ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 8,
              border: `1px solid ${T.borderBrand}`, background: T.brandDim,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>
                  {clienteSel.nombre} {clienteSel.apellido}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: T.textTer }}>{clienteSel.email}</p>
              </div>
              <IconBtn onClick={() => { setClienteSel(null); setQueryCliente(""); }} title="Quitar cliente" danger>✕</IconBtn>
            </div>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 15, pointerEvents: "none" }}>👤</span>
                <input
                  type="text"
                  placeholder="Nombre, doc o email..."
                  value={queryCliente}
                  onChange={e => setQueryCliente(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 12px 10px 38px", borderRadius: 8,
                    border: `1px solid ${T.borderMed}`,
                    background: T.surfaceAlt, color: T.text,
                    fontSize: 14, outline: "none", transition: "border-color 0.15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = T.borderBrand; if (resultsCliente.length) setShowClienteList(true); }}
                  onBlur={e => e.target.style.borderColor = T.borderMed}
                />
              </div>
              {showClienteList && resultsCliente.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: T.surface, borderRadius: 10,
                  border: `1px solid ${T.borderStr}`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  zIndex: 50, maxHeight: 200, overflowY: "auto",
                }}>
                  {resultsCliente.map(c => (
                    <button
                      key={c.id}
                      onMouseDown={e => { e.preventDefault(); setClienteSel(c); setQueryCliente(""); setShowClienteList(false); }}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 14px",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderBottom: `1px solid ${T.border}`, transition: "background 0.1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>
                        {c.nombre} {c.apellido}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: T.textTer }}>{c.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Notas */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textTer, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Notas internas (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Observaciones de la venta..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${T.borderMed}`,
              background: T.surfaceAlt, color: T.text,
              fontSize: 14, resize: "vertical", outline: "none",
              transition: "border-color 0.15s", fontFamily: "inherit",
            }}
            onFocus={e => e.target.style.borderColor = T.borderBrand}
            onBlur={e => e.target.style.borderColor = T.borderMed}
          />
        </div>
      </div>

      {/* ── Columna derecha: resumen del pedido ── */}
      <div style={{
        width: 320, flexShrink: 0,
        background: T.surface,
        borderRadius: 14,
        border: `1px solid ${T.borderMed}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Pedido {pedido.length > 0 && <Badge>{pedido.length}</Badge>}
          </span>
          {pedido.length > 0 && (
            <button
              onClick={vaciarPedido}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 11, color: T.danger, fontWeight: 600, padding: "2px 6px",
                borderRadius: 4, transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.dangerBg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >Vaciar pedido</button>
          )}
        </div>

        {/* Items */}
        <div style={{ maxHeight: 240, overflowY: "auto" }}>
          {pedido.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 28 }}>🛒</p>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: T.textMuted }}>
                Busca y agrega productos
              </p>
            </div>
          ) : (
            pedido.map(item => (
              <div key={item.producto_id} style={{
                padding: "10px 16px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
                    {item.nombre}
                  </p>
                  <IconBtn onClick={() => eliminarItem(item.producto_id)} title="Eliminar" danger>✕</IconBtn>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <QtyControl
                    qty={item.cantidad}
                    onInc={() => cambiarCantidad(item.producto_id, 1)}
                    onDec={() => cambiarCantidad(item.producto_id, -1)}
                  />
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12, fontWeight: 700, color: T.brand,
                  }}>{fmt(item.precio * item.cantidad)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales */}
        {pedido.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.textTer }}>Subtotal</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textSec }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.textTer }}>IVA 19%</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textTer }}>{fmt(iva)}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingTop: 8, borderTop: `1px solid ${T.borderMed}`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: T.brand }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        {/* Método de pago */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Método de pago
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {METODOS.map(m => (
              <button
                key={m.id}
                onClick={() => setMetodoPago(m.id)}
                style={{
                  padding: "8px 6px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${metodoPago === m.id ? T.brand : T.borderMed}`,
                  background: metodoPago === m.id ? T.brand : T.surfaceAlt,
                  color: metodoPago === m.id ? "#fff" : T.textSec,
                  fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}
                onMouseEnter={e => { if (metodoPago !== m.id) e.currentTarget.style.borderColor = T.borderStr; }}
                onMouseLeave={e => { if (metodoPago !== m.id) e.currentTarget.style.borderColor = T.borderMed; }}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error + CTA */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          {error && (
            <p style={{
              margin: 0, padding: "8px 12px", borderRadius: 8,
              background: T.dangerBg, border: `1px solid rgba(220,38,38,0.2)`,
              fontSize: 12, color: T.danger,
            }}>{error}</p>
          )}
          <button
            onClick={registrarVenta}
            disabled={enviando || !pedido.length}
            style={{
              padding: "12px", borderRadius: 8, border: "none",
              background: pedido.length ? T.brand : T.borderMed,
              color: pedido.length ? "#fff" : T.textMuted,
              fontWeight: 700, fontSize: 13, cursor: pedido.length ? "pointer" : "not-allowed",
              transition: "background 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => { if (pedido.length) e.currentTarget.style.background = T.brandLight; }}
            onMouseLeave={e => { if (pedido.length) e.currentTarget.style.background = T.brand; }}
          >
            {enviando ? "Registrando…" : pedido.length
              ? `Registrar venta · ${fmt(total)}`
              : "Registrar venta"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sección: Mis ventas ─────────────────────────────────────────────────────
function MisVentas() {
  const [ventas, setVentas]       = useState([]);
  const [stats, setStats]         = useState({ total: 0, hoy: 0, facturado: 0 });
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    setCargando(true);
    axios.get("/api/cajero/mis-ventas")
      .then(r => {
        const data = r.data || [];
        setVentas(data);
        const hoy = new Date().toDateString();
        const ventasHoy = data.filter(v => new Date(v.created_at).toDateString() === hoy);
        setStats({
          total:      data.length,
          hoy:        ventasHoy.length,
          facturado:  data.reduce((acc, v) => acc + Number(v.total ?? 0) * 1.19, 0),
        });
      })
      .catch(() => setError("No se pudieron cargar las ventas."))
      .finally(() => setCargando(false));
  }, []);

  const ESTADO_COLORS = {
    pendiente:   { color: T.warning, bg: T.warningBg },
    completada:  { color: T.success, bg: T.successBg },
    cancelada:   { color: T.danger,  bg: T.dangerBg },
  };

  if (cargando) return (
    <div style={{ padding: 32, textAlign: "center", color: T.textTer }}>Cargando ventas…</div>
  );
  if (error) return (
    <div style={{ padding: 24, borderRadius: 10, background: T.dangerBg, color: T.danger, fontSize: 13 }}>{error}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Ventas totales",   value: stats.total,     mono: false },
          { label: "Ventas hoy",       value: stats.hoy,       mono: false },
          { label: "Total facturado",  value: fmt(stats.facturado), mono: true },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "16px 20px", borderRadius: 12,
            background: T.surface, border: `1px solid ${T.borderMed}`,
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.label}
            </p>
            <p style={{
              margin: 0, fontSize: 24, fontWeight: 700, color: T.brand,
              fontFamily: s.mono ? "'JetBrains Mono', monospace" : "inherit",
            }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.borderMed}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Historial de ventas</span>
        </div>
        {ventas.length === 0 ? (
          <p style={{ padding: "28px 20px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
            No hay ventas registradas aún.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.surfaceAlt }}>
                  {["Código", "Cliente", "Método", "Total", "Estado", "Fecha"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: T.textTer,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      borderBottom: `1px solid ${T.borderMed}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.map((v, idx) => {
                  const estadoKey = v.estado?.toLowerCase() || "pendiente";
                  const ec = ESTADO_COLORS[estadoKey] || ESTADO_COLORS.pendiente;
                  return (
                    <tr
                      key={v.id}
                      style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.brand, fontWeight: 700 }}>
                          {v.codigo || `#${v.id}`}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", color: T.textSec }}>
                        {v.cliente_nombre ? `${v.cliente_nombre} ${v.cliente_apellido || ""}` : "Sin cliente"}
                      </td>
                      <td style={{ padding: "10px 16px", color: T.textTer, textTransform: "capitalize" }}>
                        {v.metodo_pago || "—"}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.text, fontSize: 12 }}>
                          {fmt(Number(v.total ?? 0) * 1.19)}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <Badge color={ec.color} bg={ec.bg}>{v.estado || "pendiente"}</Badge>
                      </td>
                      <td style={{ padding: "10px 16px", color: T.textTer, whiteSpace: "nowrap" }}>
                        {fmtFecha(v.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function PanelCajero() {
  const { usuario, logout } = useAuth();
  const [seccion, setSeccion] = useState("nueva-venta");

  const NAV = [
    { id: "nueva-venta", label: "Nueva venta",    icon: "🧾" },
    { id: "mis-ventas",  label: "Mis ventas hoy", icon: "📊" },
  ];

  return (
    // ── NOTA: PanelCajero NO incluye <Navbar /> — es un layout autónomo
    // de pantalla completa con sidebar propio. La <Navbar /> vive SOLO en
    // páginas tipo tienda/perfil. Esto elimina la duplicación del header.
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'system-ui', -apple-system, sans-serif",
      background: T.bg,
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: T.sidebar,
        display: "flex", flexDirection: "column",
        borderRight: `1px solid rgba(255,255,255,0.06)`,
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: T.brand, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#fff",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>V</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.textOnDark, lineHeight: 1.2 }}>
                Victoria Pecuarios
              </p>
              <p style={{ margin: 0, fontSize: 10, color: T.textOnDarkSec, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Caja
              </p>
            </div>
          </div>
        </div>

        {/* Info usuario */}
        {usuario && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: T.brand, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
              marginBottom: 8,
            }}>
              {(usuario.nombre?.[0] ?? "C").toUpperCase()}
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.textOnDark }}>
              {usuario.nombre} {usuario.apellido}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: T.textOnDarkSec }}>
              {usuario.rol}
            </p>
          </div>
        )}

        {/* Navegación */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const active = seccion === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSeccion(item.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "9px 12px", borderRadius: 8, border: "none",
                  background: active ? "rgba(26,92,26,0.55)" : "transparent",
                  color: active ? "#fff" : T.textOnDarkSec,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.sidebarAlt; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 4 }}>
          <Link
            to="/"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", borderRadius: 8,
              color: T.textOnDarkSec, fontSize: 12, textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.sidebarAlt; e.currentTarget.style.color = T.textOnDark; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textOnDarkSec; }}
          >
            <span>🏠</span> Ir a la tienda
          </Link>
          <button
            onClick={logout}
            style={{
              width: "100%", textAlign: "left",
              padding: "9px 12px", borderRadius: 8, border: "none",
              background: "transparent", color: T.textOnDarkSec,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontSize: 12, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textOnDarkSec; }}
          >
            <span>↩</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        {/* Header de sección */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 700, color: T.text,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            {NAV.find(n => n.id === seccion)?.label}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textTer }}>
            {seccion === "nueva-venta"
              ? "Registra ventas físicas en caja"
              : "Tu historial de ventas y estadísticas"}
          </p>
        </div>

        {/* Renderizar sección activa */}
        {seccion === "nueva-venta" && <NuevaVenta usuario={usuario} />}
        {seccion === "mis-ventas"  && <MisVentas />}
      </main>
    </div>
  );
}