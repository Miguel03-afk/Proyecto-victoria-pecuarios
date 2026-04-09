// src/pages/Producto.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

// ── Constantes y helpers ──────────────────────────────────────
const IVA_PCT = 19;

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

// Tokens visuales del proyecto
const C = {
  brand:    "#1a5c1a",
  brandMid: "#2d7a2d",
  brandLight:"#e6f3e6",
  brandBorder:"#b4d9b4",
  canvas:   "#f6f7f4",
  surface:  "#ffffff",
  surfaceAlt:"#f2f3ef",
  text:     "#191c18",
  textSec:  "#48524a",
  textTer:  "#788078",
  textMuted:"#a8b2a8",
  border:   "rgba(0,0,0,0.07)",
  gold:     "#b08a24",
  success:  "#14532d",
  successBg:"#dcfce7",
  danger:   "#7f1d1d",
  dangerBg: "#fee2e2",
  info:     "#1e3a8a",
  infoBg:   "#dbeafe",
};

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl" style={{ background: C.brandLight }} />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl" style={{ background: C.brandLight }} />
            ))}
          </div>
        </div>
        <div className="space-y-5 pt-4">
          {[["w-1/4", "h-3"], ["w-3/4", "h-8"], ["w-1/2", "h-6"],
            ["w-full", "h-14"], ["w-full", "h-12"], ["w-full", "h-14"]
          ].map(([w, h], i) => (
            <div key={i} className={`${h} ${w} rounded-xl`} style={{ background: C.brandLight }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Galería con zoom ──────────────────────────────────────────
function Galeria({ imagenPrincipal, imagenesExtra, nombre }) {
  const [activa, setActiva] = useState(0);
  const [zoom, setZoom]     = useState(false);
  const [pos, setPos]       = useState({ x: 50, y: 50 });
  const ref                 = useRef(null);

  const todas = [imagenPrincipal, ...(imagenesExtra || [])].filter(Boolean);
  if (!todas.length) todas.push(null);

  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div className="space-y-3 lg:sticky lg:top-24">
      {/* Principal */}
      <div
        ref={ref}
        className="relative aspect-square rounded-3xl overflow-hidden border"
        style={{
          background: `linear-gradient(135deg, ${C.brandLight} 0%, #e8f5e8 100%)`,
          borderColor: C.brandBorder,
          cursor: zoom ? "zoom-out" : "zoom-in",
        }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}>
        {todas[activa] ? (
          <img
            src={todas[activa]} alt={nombre}
            className="w-full h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: zoom ? "scale(2.2)" : "scale(1)",
              transformOrigin: `${pos.x}% ${pos.y}%`,
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-8xl select-none">🐾</span>
            <p className="text-sm font-medium" style={{ color: C.textMuted }}>Sin imagen</p>
          </div>
        )}

        {/* Hint zoom */}
        {todas[activa] && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", color: C.textSec }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
            Zoom
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {todas.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {todas.map((img, i) => (
            <button key={i} onClick={() => setActiva(i)}
              className="aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150"
              style={{
                borderColor: i === activa ? C.brand : "transparent",
                boxShadow:   i === activa ? `0 0 0 2px ${C.brandLight}` : "none",
              }}>
              {img ? (
                <img src={img} alt="" className="w-full h-full object-contain" style={{ background: C.surfaceAlt }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: C.surfaceAlt }}>🐾</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Selector de presentaciones (dropdown) ─────────────────────
function SelectorVariante({ variantes, varianteIdx, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const activa = variantes[varianteIdx];

  // Cerrar al click afuera
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <p className="text-xs font-bold uppercase tracking-[0.12em] mb-2" style={{ color: C.textTer }}>
        Presentación
      </p>

      {/* Trigger */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-150"
        style={{
          borderColor: abierto ? C.brand : C.brandBorder,
          background: C.surface,
          color: C.text,
          boxShadow: abierto ? `0 0 0 3px ${C.brandLight}` : "none",
        }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: activa.stock > 0 ? "#22c55e" : "#ef4444" }} />
          <span>{activa.nombre}</span>
          {activa.stock <= activa.stock_minimo && activa.stock > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#fef3c7", color: "#92400e" }}>
              Últimas {activa.stock} uds
            </span>
          )}
          {activa.stock === 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: C.dangerBg, color: C.danger }}>
              Sin stock
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ color: C.brand }}>{fmt(activa.precio)}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            style={{ color: C.textTer }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-30"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.brandBorder}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
          {variantes.map((v, i) => {
            const activo = i === varianteIdx;
            const sinStock = v.stock === 0;
            const dc = descPct(v.precio, v.precio_antes);
            return (
              <button
                key={v.id}
                onClick={() => { if (!sinStock) { onChange(i); setAbierto(false); } }}
                disabled={sinStock}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors duration-100"
                style={{
                  background: activo ? C.brandLight : "transparent",
                  cursor: sinStock ? "not-allowed" : "pointer",
                  borderBottom: i < variantes.length - 1 ? `1px solid ${C.brandLight}` : "none",
                }}
                onMouseEnter={e => { if (!activo && !sinStock) e.currentTarget.style.background = C.surfaceAlt; }}
                onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: sinStock ? "#d1d5db" : activo ? C.brand : "#22c55e" }} />
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: sinStock ? C.textMuted : C.text }}>
                      {v.nombre}
                    </p>
                    {v.sku && (
                      <p className="text-xs font-mono" style={{ color: C.textMuted }}>SKU: {v.sku}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {dc && !sinStock && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                      style={{ background: "#fee2e2", color: "#ef4444" }}>-{dc}%</span>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: sinStock ? C.textMuted : C.brand }}>
                      {fmt(v.precio)}
                    </p>
                    {v.precio_antes && !sinStock && (
                      <p className="text-xs line-through" style={{ color: C.textMuted }}>{fmt(v.precio_antes)}</p>
                    )}
                  </div>
                  {sinStock && (
                    <span className="text-xs font-medium" style={{ color: C.textMuted }}>Agotado</span>
                  )}
                  {activo && !sinStock && (
                    <svg className="w-4 h-4" fill="none" stroke={C.brand} strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Panel de compra ───────────────────────────────────────────
function PanelCompra({ producto, variantes }) {
  const { agregar }   = useCarrito();
  const { usuario }   = useAuth();
  const navigate      = useNavigate();

  const [varIdx, setVarIdx]   = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [error, setError]     = useState("");

  const tieneVariantes = variantes && variantes.length > 0;
  const varActiva      = tieneVariantes ? variantes[varIdx] : null;

  const precio    = tieneVariantes ? Number(varActiva.precio)       : Number(producto.precio);
  const precAntes = tieneVariantes ? Number(varActiva.precio_antes) : Number(producto.precio_antes);
  const stock     = tieneVariantes ? varActiva.stock                : producto.stock;
  const stockMin  = tieneVariantes ? varActiva.stock_minimo         : producto.stock_minimo;
  const hayStock  = stock > 0;
  const dc        = descPct(precio, precAntes);

  const subtotal = precio * cantidad;
  const iva      = subtotal * 0.19;
  const total    = subtotal + iva;

  const handleVariante = (i) => { setVarIdx(i); setCantidad(1); setError(""); };

  const handleAgregar = () => {
    setError("");
    if (!hayStock) return;
    if (cantidad > stock) return setError(`Solo hay ${stock} unidades disponibles.`);
    if (!usuario)  { navigate("/login"); return; }

    agregar({
      id:          tieneVariantes ? `${producto.id}-v${varActiva.id}` : producto.id,
      producto_id: producto.id,
      variante_id: varActiva?.id || null,
      nombre:      tieneVariantes ? `${producto.nombre} — ${varActiva.nombre}` : producto.nombre,
      slug:        producto.slug,
      precio,
      imagen_url:  producto.imagen_url,
      stock,
      activo: 1,
    }, cantidad);

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: C.textMuted }}>
        <Link to="/" className="hover:text-green-700 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/tienda" className="hover:text-green-700 transition-colors">Tienda</Link>
        <span>/</span>
        <Link to={`/tienda?categoria=${producto.categoria_slug}`}
          className="hover:text-green-700 transition-colors capitalize">{producto.categoria}</Link>
        <span>/</span>
        <span className="font-medium truncate max-w-[160px]" style={{ color: C.textSec }}>{producto.nombre}</span>
      </nav>

      {/* Marca */}
      {producto.marca && (
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: C.brand }}>
          {producto.marca}
        </p>
      )}

      {/* Nombre */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight"
        style={{ color: C.text, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {producto.nombre}
      </h1>

      {/* Precio activo */}
      <div className="flex items-end gap-3 flex-wrap">
        <span className="text-3xl font-bold" style={{ color: C.brand, fontFamily: "system-ui, sans-serif" }}>
          {fmt(precio)}
        </span>
        {precAntes > 0 && <span className="text-lg line-through" style={{ color: C.textMuted }}>{fmt(precAntes)}</span>}
        {dc && (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
            style={{ background: "#fee2e2", color: "#dc2626" }}>−{dc}%</span>
        )}
      </div>

      {/* Selector presentaciones */}
      {tieneVariantes && (
        <SelectorVariante
          variantes={variantes}
          varianteIdx={varIdx}
          onChange={handleVariante}
        />
      )}

      {/* Stock sin variantes */}
      {!tieneVariantes && (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: hayStock ? "#22c55e" : "#ef4444" }} />
          {hayStock
            ? stock <= stockMin
              ? <span className="font-semibold" style={{ color: "#d97706" }}>⚠️ Últimas {stock} unidades</span>
              : <span className="font-semibold" style={{ color: C.success }}>{stock} unidades disponibles</span>
            : <span className="font-semibold" style={{ color: C.danger }}>Sin stock</span>}
        </div>
      )}

      {/* Desglose IVA */}
      <div className="rounded-2xl p-4 space-y-2"
        style={{ background: C.brandLight, border: `1px solid ${C.brandBorder}` }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.textTer }}>
          Resumen de precio
        </p>
        <div className="flex justify-between text-xs" style={{ color: C.textSec }}>
          <span>Subtotal ({cantidad} {cantidad === 1 ? "ud" : "uds"})</span>
          <span className="font-semibold tabular-nums">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs" style={{ color: C.info }}>
          <span>IVA incluido (19% · Colombia)</span>
          <span className="font-semibold tabular-nums">{fmt(iva)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: `1px solid ${C.brandBorder}`, color: C.text }}>
          <span>Total</span>
          <span className="tabular-nums" style={{ color: C.brand }}>{fmt(total)}</span>
        </div>
      </div>

      {/* Cantidad */}
      {hayStock && (
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.textTer }}>Cantidad</p>
          <div className="flex items-center rounded-2xl overflow-hidden border-2"
            style={{ borderColor: C.brandBorder }}>
            <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors"
              style={{ color: C.brand }}
              onMouseEnter={e => e.currentTarget.style.background = C.brandLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              −
            </button>
            <span className="w-10 text-center font-bold tabular-nums" style={{ color: C.text }}>{cantidad}</span>
            <button onClick={() => setCantidad(c => Math.min(stock, c + 1))}
              disabled={cantidad >= stock}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30"
              style={{ color: C.brand }}
              onMouseEnter={e => e.currentTarget.style.background = C.brandLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              +
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: C.dangerBg, color: C.danger, border: `1px solid #fca5a5` }}>
          ⚠ {error}
        </div>
      )}

      {/* CTA principal */}
      <div className="space-y-2.5">
        <button onClick={handleAgregar} disabled={!hayStock}
          className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5"
          style={agregado
            ? { background: "#16a34a", color: "#fff" }
            : hayStock
            ? { background: C.brand, color: "#fff", boxShadow: "0 4px 16px rgba(26,92,26,0.25)" }
            : { background: C.surfaceAlt, color: C.textMuted, cursor: "not-allowed" }}>
          {agregado ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              ¡Agregado al carrito!
            </>
          ) : hayStock ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Agregar al carrito · {fmt(total)}
            </>
          ) : "Sin stock disponible"}
        </button>

        <Link to="/tienda"
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ border: `2px solid ${C.brandBorder}`, color: C.brand, background: "transparent" }}
          onMouseEnter={e => e.currentTarget.style.background = C.brandLight}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          ← Seguir comprando
        </Link>
      </div>

      {/* Garantías */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {[
          { icon: "🚚", text: "Envío gratis +$80k" },
          { icon: "🔒", text: "Compra segura" },
          { icon: "↩️", text: "Devolución 15 días" },
          { icon: "💊", text: "Cert. Invima" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{ background: C.surfaceAlt, color: C.textSec }}>
            <span className="text-base">{icon}</span>{text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabs: descripción / detalles / presentaciones ─────────────
function TabsInfo({ producto, variantes }) {
  const [tab, setTab] = useState("descripcion");

  const TABS = [
    { id: "descripcion", label: "Descripción" },
    { id: "detalles",    label: "Especificaciones" },
    ...(variantes?.length ? [{ id: "variantes", label: "Presentaciones" }] : []),
  ];

  const specs = [
    { k: "Marca",            v: producto.marca },
    { k: "Especie / Uso",    v: producto.especie },
    { k: "Unidad de venta",  v: producto.unidad },
    { k: "Proveedor",        v: producto.proveedor_nombre },
    { k: "Requiere fórmula", v: producto.requiere_formula ? "Sí" : "No" },
    { k: "Categoría",        v: producto.categoria },
    { k: "Referencia",       v: producto.slug },
  ].filter(s => s.v && s.v !== "No");

  return (
    <div className="mt-16 pt-10" style={{ borderTop: `1px solid ${C.brandBorder}` }}>
      {/* Tabs */}
      <div className="flex gap-0 mb-8" style={{ borderBottom: `2px solid ${C.brandLight}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-6 py-3 text-sm font-semibold transition-all duration-150 border-b-2 -mb-0.5"
            style={{
              borderColor: tab === t.id ? C.brand : "transparent",
              color: tab === t.id ? C.brand : C.textTer,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Descripción */}
      {tab === "descripcion" && (
        <div className="max-w-2xl">
          {producto.descripcion_corta && (
            <p className="text-base font-semibold mb-4 leading-relaxed" style={{ color: C.textSec }}>
              {producto.descripcion_corta}
            </p>
          )}
          {producto.descripcion ? (
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: C.textSec }}>
              {producto.descripcion.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: C.textMuted }}>Sin descripción disponible.</p>
          )}
        </div>
      )}

      {/* Especificaciones */}
      {tab === "detalles" && (
        <div className="max-w-xl">
          {specs.length ? (
            <table className="w-full">
              <tbody>
                {specs.map(({ k, v }) => (
                  <tr key={k} style={{ borderBottom: `1px solid ${C.brandLight}` }}>
                    <td className="py-3 pr-8 text-xs font-bold uppercase tracking-wider w-40"
                      style={{ color: C.textTer }}>{k}</td>
                    <td className="py-3 text-sm capitalize" style={{ color: C.text }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm" style={{ color: C.textMuted }}>Sin especificaciones registradas.</p>
          )}
        </div>
      )}

      {/* Tabla de presentaciones */}
      {tab === "variantes" && variantes?.length > 0 && (
        <div className="max-w-2xl overflow-hidden rounded-2xl"
          style={{ border: `1px solid ${C.brandBorder}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.brandLight }}>
                {["Presentación", "Precio", "Con IVA (19%)", "Stock", "SKU"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.textTer }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variantes.map((v, i) => {
                const conIva = Number(v.precio) * 1.19;
                const dc = descPct(v.precio, v.precio_antes);
                return (
                  <tr key={v.id} style={{
                    background: i % 2 === 0 ? C.surface : C.surfaceAlt,
                    borderTop: `1px solid ${C.brandLight}`,
                  }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{v.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold tabular-nums" style={{ color: C.brand }}>{fmt(v.precio)}</span>
                      {dc && <span className="ml-2 text-xs px-1.5 rounded font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>-{dc}%</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: C.textSec }}>{fmt(conIva)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold tabular-nums"
                        style={{ color: v.stock <= v.stock_minimo ? C.danger : C.success }}>
                        {v.stock}
                      </span>
                      <span className="text-xs ml-1" style={{ color: C.textMuted }}>uds</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: C.textMuted }}>
                      {v.sku || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Relacionados ──────────────────────────────────────────────
function Relacionados({ productos }) {
  if (!productos?.length) return null;
  return (
    <div className="mt-20 pt-12" style={{ borderTop: `1px solid ${C.brandLight}` }}>
      <h2 className="text-xl font-bold mb-8" style={{ color: C.text, fontFamily: "'Playfair Display', Georgia, serif" }}>
        También te puede interesar
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {productos.map(p => {
          const dc = descPct(p.precio, p.precio_antes);
          return (
            <Link key={p.id} to={`/producto/${p.slug}`}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ background: C.surface, border: `1px solid ${C.brandBorder}` }}>
              <div className="relative aspect-square overflow-hidden" style={{ background: C.brandLight }}>
                {p.imagen_url
                  ? <img src={p.imagen_url} alt={p.nombre}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
                      onError={e => { e.target.style.display = "none"; }} />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>}
                {dc && (
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: "#dc2626", color: "#fff" }}>-{dc}%</span>
                )}
              </div>
              <div className="p-3">
                {p.marca && <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: C.brand }}>{p.marca}</p>}
                <h3 className="text-xs font-semibold line-clamp-2 leading-snug mb-2" style={{ color: C.text }}>{p.nombre}</h3>
                <p className="text-sm font-bold tabular-nums" style={{ color: C.brand }}>{fmt(p.precio)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function Producto() {
  const { slug } = useParams();
  const [data, setData]         = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    api.get(`/productos/${slug}`)
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.error || "Producto no encontrado"))
      .finally(() => setCargando(false));
  }, [slug]);

  if (cargando) return (
    <div className="min-h-screen" style={{ background: C.canvas }}>
      {/* Barra certificación */}
      <div className="py-2.5" style={{ background: C.brand }}>
        <p className="text-center text-xs font-semibold text-white/80">
          🚚 Envíos gratis a partir de <span className="text-lime-300 font-bold">$80.000</span>
        </p>
      </div>
      <Skeleton />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: C.canvas }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: C.dangerBg }}>⚠️</div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: C.text }}>Producto no encontrado</h2>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>{error}</p>
        <Link to="/tienda"
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ background: C.brand }}>
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );

  const { producto, variantes, relacionados } = data;

  return (
    <div className="min-h-screen" style={{ background: C.canvas }}>
      {/* Barra superior */}
      <div className="py-2.5" style={{ background: C.brand }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-6 text-xs text-white/70 font-medium">
          {["✓ Certificado Invima", "🚚 Envío a todo Colombia", "🔒 Compra segura", "👨‍⚕️ Asesoría gratis"].map(t => (
            <span key={t} className="hidden sm:block">{t}</span>
          ))}
          <span className="sm:hidden">✓ Certificado · Envío a Colombia</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Grid producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <Galeria
            imagenPrincipal={producto.imagen_url}
            imagenesExtra={producto.imagenes_extra}
            nombre={producto.nombre}
          />
          <PanelCompra producto={producto} variantes={variantes} />
        </div>

        {/* Tabs info */}
        <TabsInfo producto={producto} variantes={variantes} />

        {/* Relacionados */}
        <Relacionados productos={relacionados} />
      </div>
    </div>
  );
}