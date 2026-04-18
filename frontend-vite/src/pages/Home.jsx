// src/pages/Home.jsx
// DISEÑO: borders-only depth, 4 niveles de texto, superficie canvas #f6f7f4
// Navbar única — el hero tiene su propio buscador contextual, no duplica el de Navbar
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import api from "../services/api";

// ─── Sistema de tokens — todos los colores desde aquí, nada hardcodeado ───────
const T = {
  // Superficies — mismo hue, distinta luminosidad (borders-only)
  canvas:      "#f6f7f4",   // L0 base
  surface:     "#ffffff",   // L1 cards
  surfaceAlt:  "#f2f3ef",   // L1 inset / alt
  surfaceHov:  "#edf0ea",   // L1 hover

  // Brand — verde forestal, no menta
  brand:       "#1a5c1a",
  brandMid:    "#2d7a2d",
  brandDark:   "#0c180c",
  brandLight:  "#e6f3e6",
  brandBorder: "#b8d9b8",

  // Acento — lima solo para CTA primarios
  lime:        "#a3e635",

  // Texto — 4 niveles, mismo hue, distinta opacidad
  text:        "#111827",   // primario
  textSec:     "#374151",   // secundario
  textTer:     "#6b7280",   // terciario / metadatos
  textMuted:   "#9ca3af",   // desactivado / placeholder

  // Bordes — escala de opacidad, no sólidos
  border:      "rgba(0,0,0,0.07)",
  borderMed:   "rgba(0,0,0,0.11)",
  borderStr:   "rgba(0,0,0,0.16)",

  // Semánticos
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  warning:     "#d97706",
  warningBg:   "#fffbeb",
  success:     "#16a34a",
};

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

// ─── Mapa categorías ──────────────────────────────────────────────────────────
const CAT_CFG = {
  farmacologia: { color:"#166534", bg:"#dcfce7", emoji:"💊" },
  alimentos:    { color:"#92400e", bg:"#fef3c7", emoji:"🍖" },
  higiene:      { color:"#1e40af", bg:"#dbeafe", emoji:"🧴" },
  accesorios:   { color:"#6b21a8", bg:"#f3e8ff", emoji:"🎀" },
  equipos:      { color:"#0e7490", bg:"#cffafe", emoji:"🔬" },
  default:      { color:"#374151", bg:"#f3f4f6", emoji:"📦" },
};

function getCatCfg(nombre = "") {
  const n = nombre.toLowerCase();
  if (n.includes("farm") || n.includes("medic") || n.includes("vacun") || n.includes("antipar") || n.includes("analg") || n.includes("antibio")) return CAT_CFG.farmacologia;
  if (n.includes("alim") || n.includes("comid") || n.includes("nutri") || n.includes("concentr") || n.includes("húmedo") || n.includes("humedo") || n.includes("seco")) return CAT_CFG.alimentos;
  if (n.includes("higien") || n.includes("aseo") || n.includes("desinfect") || n.includes("shampoo")) return CAT_CFG.higiene;
  if (n.includes("accesor") || n.includes("collar") || n.includes("correa") || n.includes("jugue")) return CAT_CFG.accesorios;
  if (n.includes("equip") || n.includes("instrum") || n.includes("diagnos")) return CAT_CFG.equipos;
  return CAT_CFG.default;
}

// ─── Chip categoría — pill clínica ────────────────────────────────────────────
function CatChip({ cat, activa, onClick }) {
  const cfg = getCatCfg(cat.nombre);
  return (
    <button
      onClick={() => onClick(cat.id)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 13px", borderRadius: 999, flexShrink: 0,
        border: `1px solid ${activa ? cfg.color + "55" : T.border}`,
        background: activa ? cfg.bg : T.surface,
        color: activa ? cfg.color : T.textSec,
        fontSize: 12, fontWeight: activa ? 600 : 400,
        cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
        // Sin sombra — borders-only
      }}
      onMouseEnter={e => {
        if (!activa) {
          e.currentTarget.style.borderColor = cfg.color + "44";
          e.currentTarget.style.background = cfg.bg + "66";
          e.currentTarget.style.color = cfg.color;
        }
      }}
      onMouseLeave={e => {
        if (!activa) {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.background = T.surface;
          e.currentTarget.style.color = T.textSec;
        }
      }}
    >
      <span style={{ fontSize: 11 }}>{cfg.emoji}</span>
      {cat.nombre}
    </button>
  );
}

// ─── Tarjeta producto ─────────────────────────────────────────────────────────
// Depth: border whisper-quiet en reposo, border-brand en hover — sin sombras
function TarjetaProducto({ producto }) {
  const navigate = useNavigate();
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  const precio      = Number(producto.variantes?.[0]?.precio      ?? producto.precio      ?? 0);
  const precioAntes = Number(producto.variantes?.[0]?.precio_antes ?? producto.precio_antes ?? 0);
  const stock       = Number(producto.variantes?.[0]?.stock        ?? producto.stock        ?? 0);
  const agotado     = stock === 0;
  const descuento   = precioAntes > precio && precioAntes > 0
    ? Math.round((1 - precio / precioAntes) * 100) : null;

  const handleAgregar = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (agotado || agregado) return;
    agregar({ id: producto.id, nombre: producto.nombre, precio, precio_antes: precioAntes || null, imagen_url: producto.imagen_url || null, slug: producto.slug, stock }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <article
      onClick={() => navigate(`/producto/${producto.slug}`)}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        position: "relative",
        display: "flex", flexDirection: "column",
        userSelect: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = T.brandBorder;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Badges */}
      {descuento && descuento > 0 && (
        <div style={{ position:"absolute", top:8, left:8, zIndex:2, background:T.danger, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5 }}>
          -{descuento}%
        </div>
      )}
      {(producto.destacado === 1 || producto.destacado === true) && (
        <div style={{ position:"absolute", top:8, right:8, zIndex:2, background:T.brand, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:5, letterSpacing:0.3 }}>
          DESTACADO
        </div>
      )}

      {/* Imagen — fondo surfaceAlt, sin borde extra */}
      <div style={{ background: T.surfaceAlt, height: 172, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            style={{ width:"100%", height:"100%", objectFit:"contain", padding:10, transition:"transform 0.25s" }}
            onError={e => { e.target.style.display = "none"; }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
          />
        ) : (
          <span style={{ fontSize:44, opacity:0.25 }}>🐾</span>
        )}
        {agotado && (
          <div style={{ position:"absolute", inset:0, background:"rgba(246,247,244,0.82)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, color:T.danger, background:T.dangerBg, border:`1px solid rgba(220,38,38,0.2)`, padding:"3px 9px", borderRadius:6, letterSpacing:0.4 }}>AGOTADO</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"12px 14px 14px", flex:1, display:"flex", flexDirection:"column", gap:5, borderTop:`1px solid ${T.border}` }}>
        {/* Marca — texto muted, nivel 4 */}
        {producto.marca && (
          <span style={{ fontSize:9, color:T.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>
            {producto.marca}
          </span>
        )}

        {/* Nombre — nivel 1, dos líneas máx */}
        <h3 style={{
          fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.35, margin: 0,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {producto.nombre}
        </h3>

        {/* Precio — monospace, datos */}
        <div style={{ display:"flex", alignItems:"baseline", gap:5, flexWrap:"wrap", marginTop:2 }}>
          <span style={{ fontSize:16, fontWeight:700, color: agotado ? T.textMuted : T.brand, fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
            {fmt(precio)}
          </span>
          {precioAntes > precio && (
            <span style={{ fontSize:11, color:T.textMuted, textDecoration:"line-through", fontFamily:"monospace" }}>
              {fmt(precioAntes)}
            </span>
          )}
        </div>

        {/* IVA — nivel 4 */}
        <span style={{ fontSize:10, color:T.textMuted }}>+ IVA 19%</span>

        {/* Stock bajo — nivel 3 warning */}
        {!agotado && stock > 0 && stock <= 5 && (
          <span style={{ fontSize:10, color:T.warning, fontWeight:600 }}>Últimas {stock} unidades</span>
        )}

        {/* CTA — sin iconos, sin flechas */}
        <button
          onClick={handleAgregar}
          disabled={agotado}
          style={{
            marginTop: "auto",
            padding: "8px 0",
            borderRadius: 9,
            border: `1px solid ${agotado ? T.border : agregado ? T.brandMid : T.brand}`,
            background: agotado ? T.surfaceAlt : agregado ? T.brandLight : T.brand,
            color: agotado ? T.textMuted : agregado ? T.brand : "#fff",
            fontSize: 12, fontWeight: 600,
            cursor: agotado ? "default" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!agotado && !agregado) { e.currentTarget.style.background = T.brandMid; e.currentTarget.style.borderColor = T.brandMid; }}}
          onMouseLeave={e => { if (!agotado && !agregado) { e.currentTarget.style.background = T.brand; e.currentTarget.style.borderColor = T.brand; }}}
        >
          {agotado ? "Sin stock" : agregado ? "✓ Agregado" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
      <div style={{ height:172, background:`linear-gradient(90deg,${T.surfaceAlt} 25%,${T.surfaceHov} 50%,${T.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
      <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8, borderTop:`1px solid ${T.border}` }}>
        {[55, 95, 48, 36].map((w, i) => (
          <div key={i} style={{ height: i===1 ? 18 : 10, width:`${w}%`, borderRadius:4, background:`linear-gradient(90deg,${T.surfaceAlt} 25%,${T.surfaceHov} 50%,${T.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Paginación — texto limpio, sin flechas ───────────────────────────────────
function PagBtn({ label, onClick, activo, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || activo}
      style={{
        padding: "7px 13px",
        borderRadius: 7,
        minWidth: 34,
        border: `1px solid ${activo ? T.brand : T.border}`,
        background: activo ? T.brand : T.surface,
        color: activo ? "#fff" : disabled ? T.textMuted : T.textSec,
        fontSize: 12,
        fontWeight: activo ? 600 : 400,
        cursor: (disabled || activo) ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!disabled && !activo) e.currentTarget.style.borderColor = T.borderMed; }}
      onMouseLeave={e => { if (!disabled && !activo) e.currentTarget.style.borderColor = T.border; }}
    >
      {label}
    </button>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos,    setProductos]    = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [busquedaInput,setBusquedaInput]= useState(searchParams.get("buscar") || "");
  const debounceRef = useRef(null);

  // Multi-filtro: array de IDs en ?categorias=1,3,5
  const categoriasActivas = (searchParams.get("categorias") || "")
    .split(",").filter(Boolean).map(Number);
  const busqueda = searchParams.get("buscar") || "";
  const pagina   = Number(searchParams.get("pagina") || 1);

  useEffect(() => {
    api.get("/categorias").then(r => setCategorias(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = { pagina, limite: 20 };
    if (busqueda) params.buscar = busqueda;
    if (categoriasActivas.length === 1)    params.categoria  = categoriasActivas[0];
    else if (categoriasActivas.length > 1) params.categorias = categoriasActivas.join(",");

    api.get("/productos", { params })
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          setProductos(data); setTotalItems(data.length); setTotalPaginas(1);
        } else {
          setProductos(data.productos || []);
          setTotalItems(Number(data.total ?? data.productos?.length ?? 0));
          setTotalPaginas(Number(data.totalPaginas ?? 1));
        }
      })
      .catch(() => { setProductos([]); setTotalItems(0); setTotalPaginas(1); })
      .finally(() => setCargando(false));
  }, [busqueda, searchParams.get("categorias"), pagina]);

  const handleBusqueda = (v) => {
    setBusquedaInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (v) next.set("buscar", v); else next.delete("buscar");
        next.delete("pagina");
        return next;
      });
    }, 400);
  };

  const toggleCategoria = (id) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const actuales = (prev.get("categorias") || "").split(",").filter(Boolean).map(Number);
      const nuevas = actuales.includes(id) ? actuales.filter(x => x !== id) : [...actuales, id];
      if (nuevas.length === 0) next.delete("categorias");
      else next.set("categorias", nuevas.join(","));
      next.delete("pagina");
      return next;
    });
  };

  const limpiarFiltros = () => { setBusquedaInput(""); setSearchParams({}); };
  const hayFiltros = busqueda || categoriasActivas.length > 0;

  const irPagina = (n) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    next.set("pagina", String(n));
    return next;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .prod-grid { display:grid; gap:14px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:640px)  { .prod-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1024px) { .prod-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1280px) { .prod-grid { grid-template-columns:repeat(5,1fr); } }
        ::-webkit-scrollbar { height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.brandBorder}; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:T.canvas }}>


        {/* ── Banner envío gratis — superficie brandDark, texto secundario ── */}
        <div style={{ background: T.brandDark, textAlign:"center", padding:"8px 16px", borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)", fontWeight:400 }}>
            🚚 <strong style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>Envío gratis</strong> en compras mayores a{" "}
            <span style={{ fontFamily:"monospace", color:T.lime }}>$80.000</span>
            <span style={{ color:"rgba(255,255,255,0.4)" }}> — Bogotá y área metropolitana</span>
          </span>
        </div>

        {/* ── Hero — gradiente forestal, buscador contextual ─────────────── */}
        <div style={{
          background: `linear-gradient(160deg, ${T.brandDark} 0%, #1a3d1a 60%, ${T.brand} 100%)`,
          padding: "40px 24px 32px",
          position: "relative", overflow: "hidden",
          borderBottom: `1px solid rgba(0,0,0,0.3)`,
        }}>
          {/* Círculos decorativos — color, no forma */}
          <div style={{ position:"absolute", top:-50, right:-50, width:240, height:240, background:"rgba(163,230,53,0.05)", borderRadius:"50%", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-40, left:20, width:180, height:180, background:"rgba(255,255,255,0.03)", borderRadius:"50%", pointerEvents:"none" }}/>

          <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16, marginBottom:22 }}>
              <div>
                {/* Nivel 4 — eyebrow */}
                <p style={{ margin:"0 0 5px", fontSize:10, color:"rgba(163,230,53,0.75)", fontWeight:700, textTransform:"uppercase", letterSpacing:1.5 }}>
                  Catálogo completo
                </p>
                {/* Nivel 1 — display serif */}
                <h1 style={{ margin:0, fontSize:"clamp(20px,3.5vw,32px)", fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontWeight:600, color:"#fff", lineHeight:1.15 }}>
                  Nuestra Tienda
                </h1>
                {/* Nivel 3 */}
                <p style={{ margin:"5px 0 0", fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                  Productos veterinarios · Bogotá, Colombia
                </p>
              </div>

              {/* Stats — datos en monospace */}
              <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                {[
                  { val: cargando ? "—" : `+${totalItems}`, label:"Productos" },
                  { val: categorias.length || "—",           label:"Categorías" },
                  { val: "24h",                              label:"Envío" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:"right" }}>
                    <div style={{ fontSize:20, fontWeight:700, color:T.lime, fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:0.9, marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buscador hero — glass sobre el gradiente, este es el contextual de la tienda */}
            <div style={{ position:"relative", maxWidth:520 }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", opacity:0.5 }}>🔍</span>
              <input
                type="text"
                value={busquedaInput}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                style={{
                  width:"100%", padding:"11px 40px 11px 38px",
                  borderRadius:10,
                  border:`1px solid rgba(255,255,255,0.12)`,
                  background:"rgba(255,255,255,0.10)",
                  color:"#fff", fontSize:13,
                  outline:"none", transition:"all 0.2s",
                  backdropFilter:"blur(6px)",
                }}
                onFocus={e => { e.target.style.background="rgba(255,255,255,0.16)"; e.target.style.borderColor=`${T.lime}66`; }}
                onBlur={e  => { e.target.style.background="rgba(255,255,255,0.10)"; e.target.style.borderColor="rgba(255,255,255,0.12)"; }}
              />
              {busquedaInput && (
                <button onClick={() => handleBusqueda("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:20, height:20, cursor:"pointer", color:"#fff", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Contenido principal ───────────────────────────────────────── */}
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"18px 16px 64px" }}>

          {/* Chips de categoría — flex-wrap para que quepan todos sin scroll */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }}>
            <button
              onClick={limpiarFiltros}
              style={{
                display:"inline-flex", alignItems:"center", gap:5,
                padding:"5px 14px", borderRadius:999,
                border:`1px solid ${categoriasActivas.length===0 && !busqueda ? T.brand : T.border}`,
                background: categoriasActivas.length===0 && !busqueda ? T.brandLight : T.surface,
                color: categoriasActivas.length===0 && !busqueda ? T.brand : T.textSec,
                fontSize:12, fontWeight: categoriasActivas.length===0 && !busqueda ? 600 : 400,
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <CatChip key={cat.id} cat={cat} activa={categoriasActivas.includes(cat.id)} onClick={toggleCategoria}/>
            ))}
          </div>

          {/* Barra de resultados — línea única, jerarquía de texto clara */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {cargando ? (
                <span style={{ fontSize:12, color:T.textMuted }}>Buscando...</span>
              ) : (
                <span style={{ fontSize:12, color:T.textTer }}>
                  {/* Nivel 2 para el número, nivel 3 para el contexto */}
                  <strong style={{ color:T.textSec, fontWeight:600 }}>{totalItems}</strong>
                  {" producto"}{totalItems !== 1 ? "s" : ""}
                  {busqueda && <> · <em style={{ fontStyle:"normal", color:T.textMuted }}>"{busqueda}"</em></>}
                  {categoriasActivas.length > 0 && (
                    <> · <span style={{ color:T.textSec }}>
                      {categoriasActivas.map(id => categorias.find(c => c.id === id)?.nombre).filter(Boolean).join(", ")}
                    </span></>
                  )}
                </span>
              )}
              {categoriasActivas.map(id => {
                const cat = categorias.find(c => c.id === id);
                if (!cat) return null;
                const cfg = getCatCfg(cat.nombre);
                return (
                  <button key={id} onClick={() => toggleCategoria(id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:999, border:`1px solid ${cfg.color}33`, background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600, cursor:"pointer" }}
                  >{cfg.emoji} {cat.nombre} ×</button>
                );
              })}
              {hayFiltros && (
                <button onClick={limpiarFiltros}
                  style={{ fontSize:11, color:T.danger, background:T.dangerBg, border:`1px solid rgba(220,38,38,0.15)`, borderRadius:5, padding:"2px 8px", cursor:"pointer", fontWeight:500 }}>
                  Limpiar todo
                </button>
              )}
            </div>
            {totalPaginas > 1 && (
              <span style={{ fontSize:11, color:T.textMuted }}>Página {pagina} de {totalPaginas}</span>
            )}
          </div>

          {/* Grid */}
          {cargando ? (
            <div className="prod-grid">
              {Array(12).fill(0).map((_, i) => <Skeleton key={i}/>)}
            </div>
          ) : productos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"64px 24px", background:T.surface, borderRadius:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:48, marginBottom:12, opacity:0.4 }}>🔍</div>
              <h3 style={{ fontSize:17, color:T.text, margin:"0 0 6px", fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600 }}>
                Sin resultados
              </h3>
              <p style={{ color:T.textTer, margin:"0 0 18px", fontSize:13 }}>
                {busqueda ? `No encontramos productos para "${busqueda}".` : "No hay productos en esta categoría."}
              </p>
              <button
                onClick={limpiarFiltros}
                style={{ padding:"9px 22px", borderRadius:9, background:T.brand, color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer" }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="prod-grid" style={{ animation:"fadeUp 0.25s ease" }}>
              {productos.map(p => <TarjetaProducto key={p.id} producto={p}/>)}
            </div>
          )}

          {/* Paginación — texto limpio, sin flechas */}
          {totalPaginas > 1 && !cargando && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:36, flexWrap:"wrap" }}>
              <PagBtn label="Anterior" onClick={() => irPagina(pagina - 1)} disabled={pagina === 1}/>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 2)
                .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i-1] > 1) acc.push("…"); acc.push(n); return acc; }, [])
                .map((n, i) => n === "…" ? (
                  <span key={`e${i}`} style={{ padding:"0 2px", color:T.textMuted, fontSize:12 }}>…</span>
                ) : (
                  <PagBtn key={n} label={String(n)} activo={n === pagina} onClick={() => irPagina(n)}/>
                ))
              }

              <PagBtn label="Siguiente" onClick={() => irPagina(pagina + 1)} disabled={pagina === totalPaginas}/>
            </div>
          )}
        </div>
      </div>
    </>
  );
}