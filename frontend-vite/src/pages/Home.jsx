import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills, faBone, faSoap, faTags, faMicroscope, faBox,
  faCartShopping, faCheck, faMagnifyingGlass, faTruck, faBolt,
  faStar, faFilterCircleXmark, faSliders,
} from "@fortawesome/free-solid-svg-icons";

// ─── Sistema de tokens VP — azul institucional ────────────────────────────────
const T = {
  // Superficies — Green-breath signature
  canvas:      "#F5FAF7",
  surface:     "#ffffff",
  surfaceAlt:  "#EDF6F1",
  surfaceHov:  "#dff0e6",

  // Brand — esmeralda profundo VP
  brand:       "#0A6B40",
  brandMid:    "#138553",
  brandDark:   "#064E30",
  brandLight:  "#E4F5EC",
  brandBorder: "#95CCAD",

  // CTA — verde lima VP (sin cambio)
  lime:        "#7AC143",
  limeDark:    "#5a9030",
  limeLight:   "#eef7e3",

  // Texto — temperatura verde
  text:        "#101F16",
  textSec:     "#2D4A38",
  textTer:     "#5A7A65",
  textMuted:   "#8FAA98",

  // Bordes
  border:      "rgba(0,0,0,0.07)",
  borderMed:   "rgba(0,0,0,0.11)",
  borderStr:   "rgba(0,0,0,0.16)",

  // Rosa — calidez del logo VP
  rose:        "#D4457A",
  roseMid:     "#E8608A",
  roseLight:   "#FFF0F5",
  roseBorder:  "#F9C0D0",
  roseDark:    "#A83260",

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
  farmacologia: { color:"#166534", bg:"#dcfce7", fa: faPills },
  alimentos:    { color:"#92400e", bg:"#fef3c7", fa: faBone },
  higiene:      { color:"#1e40af", bg:"#dbeafe", fa: faSoap },
  accesorios:   { color:"#6b21a8", bg:"#f3e8ff", fa: faTags },
  equipos:      { color:"#0e7490", bg:"#cffafe", fa: faMicroscope },
  default:      { color:"#374151", bg:"#f3f4f6", fa: faBox },
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

// ─── Chip categoría ───────────────────────────────────────────────────────────
function CatChip({ cat, activa, onClick }) {
  const cfg = getCatCfg(cat.nombre);
  return (
    <button
      onClick={() => onClick(cat.id)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "8px 16px", borderRadius: 10, flexShrink: 0,
        border: `1.5px solid ${activa ? cfg.color : T.border}`,
        background: activa ? cfg.color : T.surface,
        color: activa ? "#fff" : T.textSec,
        fontSize: 13, fontWeight: activa ? 700 : 500,
        cursor: "pointer", transition: "all 0.17s cubic-bezier(0.16,1,0.3,1)",
        whiteSpace: "nowrap",
        boxShadow: activa ? `0 4px 12px ${cfg.color}40` : "none",
        transform: activa ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={e => {
        if (!activa) {
          e.currentTarget.style.borderColor = cfg.color;
          e.currentTarget.style.background = cfg.bg;
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
      <FontAwesomeIcon icon={cfg.fa} style={{ fontSize: 13 }} />
      {cat.nombre}
    </button>
  );
}

// ─── Tarjeta producto ─────────────────────────────────────────────────────────
function TarjetaProducto({ producto }) {
  const navigate = useNavigate();
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const [hover, setHover]       = useState(false);

  const precio      = Number(producto.variantes?.[0]?.precio      ?? producto.precio      ?? 0);
  const precioAntes = Number(producto.variantes?.[0]?.precio_antes ?? producto.precio_antes ?? 0);
  const stock       = Number(producto.variantes?.[0]?.stock        ?? producto.stock        ?? 0);
  const agotado     = stock === 0;
  const descuento   = precioAntes > precio && precioAntes > 0
    ? Math.round((1 - precio / precioAntes) * 100) : null;
  const catCfg      = getCatCfg(producto.categoria || "");

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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: T.surface,
        border: `1.5px solid ${hover ? T.brandBorder : T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hover ? "0 14px 36px rgba(10,107,64,0.11), 0 2px 8px rgba(10,107,64,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
        position: "relative",
        display: "flex", flexDirection: "column",
        userSelect: "none",
      }}
    >
      {/* Badges */}
      {descuento && descuento > 0 && (
        <div style={{ position:"absolute", top:10, left:10, zIndex:2,
          background:"linear-gradient(135deg,#dc2626,#b91c1c)",
          color:"#fff", fontSize:10, fontWeight:800,
          padding:"4px 10px", borderRadius:7, letterSpacing:0.5,
          boxShadow:"0 2px 10px rgba(220,38,38,0.55)",
          display:"flex", alignItems:"center", gap:4 }}>
          <FontAwesomeIcon icon={faBolt} style={{ fontSize:8 }} />
          -{descuento}%
        </div>
      )}
      {(producto.destacado === 1 || producto.destacado === true) && (
        <div style={{ position:"absolute", top:10, right:10, zIndex:2,
          background:`linear-gradient(135deg,${T.lime},${T.limeDark})`,
          color:"#fff", fontSize:9, fontWeight:800,
          padding:"3px 9px", borderRadius:7, letterSpacing:0.6, display:"inline-flex", alignItems:"center", gap:4 }}>
          <FontAwesomeIcon icon={faStar} style={{ fontSize:8 }} /> Destacado
        </div>
      )}

      {/* Imagen */}
      <div style={{ background: T.surfaceAlt, height:196, position:"relative", overflow:"hidden" }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            style={{ width:"100%", height:"100%", objectFit:"contain", padding:12,
              transition:"transform 0.35s ease",
              transform: hover ? "scale(1.07)" : "scale(1)" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:46, opacity:0.15 }}>🐾</span>
          </div>
        )}

        {/* Overlay "Ver detalle" en hover */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to top, rgba(6,78,48,0.75) 0%, transparent 55%)",
          opacity: hover && !agotado ? 1 : 0,
          transition:"opacity 0.2s",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          paddingBottom:10,
        }}>
          <span style={{ fontSize:11, color:"#fff", fontWeight:700, letterSpacing:0.6,
            padding:"4px 12px", borderRadius:6,
            background:"rgba(255,255,255,0.15)", backdropFilter:"blur(4px)",
            border:"1px solid rgba(255,255,255,0.2)" }}>
            Ver detalle →
          </span>
        </div>

        {agotado && (
          <div style={{ position:"absolute", inset:0, background:"rgba(245,250,247,0.88)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontWeight:800, color:T.danger,
              background:T.dangerBg, border:`1px solid rgba(220,38,38,0.2)`,
              padding:"4px 11px", borderRadius:7, letterSpacing:0.5 }}>
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"13px 14px 15px", flex:1, display:"flex", flexDirection:"column", gap:4, borderTop:`1px solid ${T.border}` }}>

        {/* Marca + categoría en la misma fila */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
          {producto.marca && (
            <span style={{ fontSize:9, color:T.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:1.1 }}>
              {producto.marca}
            </span>
          )}
          {producto.categoria && (
            <span style={{ padding:"3px 8px", borderRadius:5, fontSize:11,
              background:catCfg.bg, color:catCfg.color, flexShrink:0, display:"inline-flex", alignItems:"center" }}>
              <FontAwesomeIcon icon={catCfg.fa} />
            </span>
          )}
        </div>

        {/* Nombre */}
        <h3 style={{ fontSize:13, fontWeight:600, color:T.text, lineHeight:1.4, margin:"1px 0 5px",
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div style={{ display:"flex", alignItems:"baseline", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:19, fontWeight:800, color: agotado ? T.textMuted : T.brand,
            fontFamily:"'JetBrains Mono','Fira Code',monospace", letterSpacing:"-0.5px" }}>
            {fmt(precio)}
          </span>
          {precioAntes > precio && (
            <span style={{ fontSize:11, color:T.rose, textDecoration:"line-through",
              fontFamily:"monospace", opacity:0.85 }}>
              {fmt(precioAntes)}
            </span>
          )}
        </div>
        <span style={{ fontSize:9, color:T.textMuted, marginTop:-2 }}>+ IVA 19%</span>

        {!agotado && stock > 0 && stock <= 5 && (
          <span style={{ fontSize:10, color:T.warning, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}>
            <FontAwesomeIcon icon={faBolt} style={{ fontSize:9 }} /> Últimas {stock} unidades
          </span>
        )}

        {/* CTA — rosa para agregar, verde para confirmación */}
        <button onClick={handleAgregar} disabled={agotado}
          style={{
            marginTop:"auto", paddingTop:9,
            padding:"9px 0", borderRadius:10, border:"none",
            background: agotado
              ? T.surfaceAlt
              : agregado
                ? `linear-gradient(135deg,${T.brand},${T.brandMid})`
                : `linear-gradient(135deg,${T.lime},${T.limeDark})`,
            color: agotado ? T.textMuted : "#fff",
            fontSize:12, fontWeight:700,
            cursor: agotado ? "default" : "pointer",
            transition:"all 0.2s",
            letterSpacing:0.2,
            boxShadow: agotado ? "none" : "0 4px 14px rgba(10,107,64,0.22)",
          }}>
          {agotado ? "Sin stock" : agregado
            ? <><FontAwesomeIcon icon={faCheck} style={{ marginRight:6 }} />Agregado al carrito</>
            : <><FontAwesomeIcon icon={faCartShopping} style={{ marginRight:6 }} />Agregar al carrito</>}
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

// ─── Carrusel productos destacados ───────────────────────────────────────────
const CARR_W   = 210;
const CARR_GAP = 14;

function CarruselCard({ producto }) {
  const navigate = useNavigate();
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const [hover,    setHover]    = useState(false);

  const precio      = Number(producto.variantes?.[0]?.precio      ?? producto.precio      ?? 0);
  const precioAntes = Number(producto.variantes?.[0]?.precio_antes ?? producto.precio_antes ?? 0);
  const stock       = Number(producto.variantes?.[0]?.stock        ?? producto.stock        ?? 0);
  const agotado     = stock === 0;
  const descuento   = precioAntes > precio && precioAntes > 0
    ? Math.round((1 - precio / precioAntes) * 100) : null;

  const handleAgregar = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (agotado || agregado) return;
    agregar({ id: producto.id, nombre: producto.nombre, precio,
      precio_antes: precioAntes || null, imagen_url: producto.imagen_url || null,
      slug: producto.slug, stock }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <div
      onClick={() => navigate(`/producto/${producto.slug}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: CARR_W, flexShrink: 0, cursor:"pointer",
        background: T.surface,
        border: `1.5px solid ${hover ? T.brandBorder : T.border}`,
        borderRadius: 14, overflow:"hidden",
        transition:"all 0.22s cubic-bezier(0.16,1,0.3,1)",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hover
          ? "0 12px 32px rgba(10,107,64,0.13), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        userSelect:"none", position:"relative",
        display:"flex", flexDirection:"column",
      }}
    >
      {descuento && descuento > 0 && (
        <div style={{ position:"absolute", top:8, left:8, zIndex:2,
          background:"linear-gradient(135deg,#dc2626,#b91c1c)",
          color:"#fff", fontSize:9, fontWeight:800,
          padding:"3px 8px", borderRadius:6,
          boxShadow:"0 2px 8px rgba(220,38,38,0.5)",
          display:"flex", alignItems:"center", gap:4 }}>
          <FontAwesomeIcon icon={faBolt} style={{ fontSize:7 }} />
          -{descuento}%
        </div>
      )}
      <div style={{ background:T.surfaceAlt, height:140, overflow:"hidden", position:"relative" }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            style={{ width:"100%", height:"100%", objectFit:"contain", padding:10,
              transition:"transform 0.35s ease",
              transform: hover ? "scale(1.08)" : "scale(1)" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:36, opacity:0.15 }}>🐾</span>
          </div>
        )}
        {agotado && (
          <div style={{ position:"absolute", inset:0, background:"rgba(245,250,247,0.88)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontWeight:800, color:T.danger,
              background:T.dangerBg, border:`1px solid rgba(220,38,38,0.2)`,
              padding:"3px 9px", borderRadius:6 }}>AGOTADO</span>
          </div>
        )}
      </div>
      <div style={{ padding:"11px 13px 13px", flex:1, display:"flex", flexDirection:"column", gap:3, borderTop:`1px solid ${T.border}` }}>
        <p style={{ fontSize:12, fontWeight:600, color:T.text, margin:0, lineHeight:1.35,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:32 }}>
          {producto.nombre}
        </p>
        <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:2 }}>
          <span style={{ fontSize:16, fontWeight:800, color: agotado ? T.textMuted : T.brand,
            fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
            {fmt(precio)}
          </span>
          {precioAntes > precio && (
            <span style={{ fontSize:10, color:T.rose, textDecoration:"line-through", fontFamily:"monospace", opacity:0.85 }}>
              {fmt(precioAntes)}
            </span>
          )}
        </div>
        <button onClick={handleAgregar} disabled={agotado}
          style={{
            marginTop:"auto", padding:"7px 0", borderRadius:9, border:"none",
            background: agotado ? T.surfaceAlt
              : agregado ? `linear-gradient(135deg,${T.brand},${T.brandMid})`
              : `linear-gradient(135deg,${T.lime},${T.limeDark})`,
            color: agotado ? T.textMuted : "#fff",
            fontSize:11, fontWeight:700, cursor: agotado ? "default" : "pointer",
            transition:"all 0.2s",
          }}>
          {agotado ? "Sin stock" : agregado
            ? <><FontAwesomeIcon icon={faCheck} style={{ marginRight:5 }} />¡Agregado!</>
            : <><FontAwesomeIcon icon={faCartShopping} style={{ marginRight:5 }} />Agregar</>}
        </button>
      </div>
    </div>
  );
}

function DestacadosCarrusel({ productos }) {
  const stripRef  = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);
  const xRef      = useRef(0);
  const [paused, setPaused] = useState(false);
  const SPEED  = 0.65;
  const single = (CARR_W + CARR_GAP) * productos.length;

  const items = [...productos, ...productos];

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !productos.length) return;
    xRef.current = 0;
    const tick = () => {
      if (!pausedRef.current) {
        xRef.current += SPEED;
        if (xRef.current >= single) xRef.current -= single;
        strip.style.transform = `translateX(-${xRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [productos.length, single]);

  const handleEnter = () => { pausedRef.current = true;  setPaused(true); };
  const handleLeave = () => { pausedRef.current = false; setPaused(false); };
  const scroll = (dir) => {
    xRef.current += dir * (CARR_W + CARR_GAP);
    if (xRef.current < 0)       xRef.current += single;
    if (xRef.current >= single) xRef.current -= single;
    if (stripRef.current) stripRef.current.style.transform = `translateX(-${xRef.current}px)`;
  };

  return (
    <div style={{ marginBottom:20, background:T.surface, borderRadius:16, padding:"18px 0 0",
      border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <FontAwesomeIcon icon={faStar} style={{ color:T.lime, fontSize:13 }} />
          <span style={{ fontSize:13, fontWeight:800, color:T.text }}>Productos destacados</span>
          {paused && (
            <span style={{ fontSize:10, color:T.textMuted, background:T.surfaceAlt,
              padding:"2px 8px", borderRadius:6, fontWeight:600, border:`1px solid ${T.border}` }}>
              En pausa
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["‹", -1], ["›", 1]].map(([icon, dir]) => (
            <button key={dir} onClick={() => scroll(Number(dir))}
              style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${T.border}`,
                background:T.surface, cursor:"pointer", fontSize:18, color:T.textSec,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s", lineHeight:1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.brand; e.currentTarget.style.color=T.brand; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textSec; }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position:"relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <div style={{ position:"absolute", left:0, top:0, bottom:12, width:64, zIndex:3, pointerEvents:"none",
          background:`linear-gradient(to right,${T.surface},transparent)` }}/>
        <div style={{ position:"absolute", right:0, top:0, bottom:12, width:64, zIndex:3, pointerEvents:"none",
          background:`linear-gradient(to left,${T.surface},transparent)` }}/>
        <div style={{ overflow:"hidden", padding:"0 18px 16px" }}>
          <div ref={stripRef} style={{ display:"flex", gap:CARR_GAP, willChange:"transform" }}>
            {items.map((p, i) => <CarruselCard key={`${p.id}-${i}`} producto={p}/>)}
          </div>
        </div>
      </div>
    </div>
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
  const [destacados,   setDestacados]   = useState([]);

  // Multi-filtro: array de IDs en ?categorias=1,3,5
  const categoriasActivas = (searchParams.get("categorias") || "")
    .split(",").filter(Boolean).map(Number);
  const busqueda = searchParams.get("buscar") || "";
  const pagina   = Number(searchParams.get("pagina") || 1);

  useEffect(() => {
    api.get("/categorias").then(r => setCategorias(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/productos/destacados/lista")
      .then(r => setDestacados(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
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
        @keyframes shimmer  { to { background-position: -200% 0; } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes heroIn   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pawDrift { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.06} 50%{transform:translateY(-16px) rotate(12deg);opacity:0.10} }
        @keyframes catFloat { 0%,100%{transform:translateY(0) scaleX(1);opacity:0.05} 50%{transform:translateY(-10px) scaleX(1);opacity:0.08} }
        @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .prod-grid { display:grid; gap:14px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:640px)  { .prod-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1024px) { .prod-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1280px) { .prod-grid { grid-template-columns:repeat(5,1fr); } }
        ::-webkit-scrollbar { height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.brandBorder}; border-radius: 2px; }
        .vp-hero-content { animation: heroIn 0.5s cubic-bezier(0.16,1,0.3,1); }
        .vp-hero-stats   { animation: fadeIn 0.7s ease 0.2s both; }
      `}</style>

      <div style={{ minHeight:"100vh", background:T.canvas }}>


        {/* ── Banner envío gratis — superficie brandDark, texto secundario ── */}
        <div style={{ background: T.brandDark, textAlign:"center", padding:"8px 16px", borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)", fontWeight:400 }}>
            <FontAwesomeIcon icon={faTruck} style={{ marginRight:6, color:"#7AC143" }} /> <strong style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>Envío gratis</strong> en compras mayores a{" "}
            <span style={{ fontFamily:"monospace", color:T.lime }}>$80.000</span>
            <span style={{ color:"rgba(255,255,255,0.4)" }}> — Solo dentro de Ibagué</span>
          </span>
        </div>

        {/* ── Hero — gradiente forestal con animales decorativos ────────────── */}
        <div style={{
          background: `linear-gradient(150deg, ${T.brandDark} 0%, #0a5c35 45%, ${T.brandMid} 100%)`,
          padding: "48px 24px 36px",
          position: "relative", overflow: "hidden",
          borderBottom: `1px solid rgba(0,0,0,0.3)`,
          minHeight: 200,
        }}>
          {/* ── Siluetas animales decorativas — SVG flotantes ── */}
          {/* Perro grande — derecha */}
          <svg style={{ position:"absolute", right:"3%", bottom:0, width:180, height:180, opacity:0.07, animation:"catFloat 5s ease-in-out infinite", pointerEvents:"none" }} viewBox="0 0 100 100" fill="white">
            <path d="M82 28c0-4-3-8-7-8-1 0-2 0-3 1L60 14c0-3-2-6-5-6-2 0-4 1-5 3L38 8c-1-3-4-5-7-5-4 0-7 3-7 7 0 1 0 2 1 3L18 18c-2 1-3 3-3 5 0 4 4 7 8 6l1 3c-3 2-5 5-5 9v30c0 2 2 4 4 4h4c2 0 4-2 4-4v-8h20v8c0 2 2 4 4 4h4c2 0 4-2 4-4V41c0-3-1-6-3-9l2-3c1 0 2 1 3 1 5 0 9-4 9-9 0-1 0-2-1-3l5-2c3 0 5-3 5-6zM36 14c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4zm-12 0c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z"/>
          </svg>
          {/* Gato — izquierda superior */}
          <svg style={{ position:"absolute", left:"1%", top:10, width:120, height:120, opacity:0.06, animation:"pawDrift 7s ease-in-out 1s infinite", pointerEvents:"none" }} viewBox="0 0 100 100" fill="white">
            <path d="M50 20c-2 0-4 1-5 2-2-2-5-3-8-2-4 1-7 5-6 9 0 2 1 4 3 5-1 2-2 4-2 7 0 8 6 20 18 20s18-12 18-20c0-3-1-5-2-7 2-1 3-3 3-5 1-4-2-8-6-9-1 0-2 0-3 0zM36 18c2-1 4 0 5 2l1 2 2-1c1-1 2-1 4-1 1 0 2 0 3 1l2 1 1-2c1-2 3-3 5-2 2 1 4 3 3 5l-1 3 3 1c1 1 2 3 2 5 0 6-5 16-16 16s-16-10-16-16c0-2 1-4 2-5l3-1-1-3c0-3 1-5 3-6z"/>
            <circle cx="42" cy="36" r="2.5"/>
            <circle cx="58" cy="36" r="2.5"/>
            <path d="M46 44c0 2 4 2 4 0" strokeWidth="1.5" stroke="white" fill="none"/>
            <path d="M20 25l8 5M80 25l-8 5M25 35l7 2M75 35l-7 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          {/* Huellas — centro derecha */}
          {[
            { x:"60%", y:"15%", rot:20, delay:"0s",  size:28 },
            { x:"68%", y:"35%", rot:35, delay:"0.4s", size:22 },
            { x:"55%", y:"55%", rot:15, delay:"0.8s", size:26 },
          ].map((p, i) => (
            <svg key={i} style={{ position:"absolute", left:p.x, top:p.y, width:p.size, height:p.size, opacity:0.08, animation:`pawDrift 4s ease-in-out ${p.delay} infinite`, transform:`rotate(${p.rot}deg)`, pointerEvents:"none" }} viewBox="0 0 40 40" fill="white">
              <ellipse cx="20" cy="26" rx="8" ry="6"/>
              <ellipse cx="10" cy="16" rx="4" ry="5"/>
              <ellipse cx="20" cy="12" rx="4" ry="5"/>
              <ellipse cx="30" cy="16" rx="4" ry="5"/>
            </svg>
          ))}
          {/* Conejo — izquierda media */}
          <svg style={{ position:"absolute", left:"40%", bottom:-10, width:100, height:100, opacity:0.05, animation:"catFloat 6s ease-in-out 2s infinite", pointerEvents:"none" }} viewBox="0 0 100 100" fill="white">
            <ellipse cx="50" cy="65" rx="18" ry="22"/>
            <ellipse cx="50" cy="38" rx="12" ry="15"/>
            <ellipse cx="42" cy="18" rx="5" ry="14"/>
            <ellipse cx="58" cy="18" rx="5" ry="14"/>
            <circle cx="46" cy="36" r="2"/>
            <circle cx="54" cy="36" r="2"/>
          </svg>

          <div style={{ maxWidth:1280, margin:"0 auto", position:"relative", zIndex:2 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16, marginBottom:24 }}>
              <div className="vp-hero-content">
                <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"4px 12px", borderRadius:999,
                  background:"rgba(122,193,67,0.15)", border:"1px solid rgba(122,193,67,0.3)", marginBottom:10 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:T.lime }}/>
                  <span style={{ fontSize:10, color:T.lime, fontWeight:700, textTransform:"uppercase", letterSpacing:1.4 }}>
                    Catálogo completo
                  </span>
                </div>
                <h1 style={{ margin:"0 0 8px", fontSize:"clamp(26px,4vw,42px)", fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontWeight:700, color:"#fff", lineHeight:1.1 }}>
                  Nuestra Tienda
                </h1>
                <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.5 }}>
                  Productos veterinarios de calidad · Ibagué, Colombia
                </p>
              </div>

              {/* Stats — datos en monospace */}
              <div className="vp-hero-stats" style={{ display:"flex", gap:0 }}>
                {[
                  { val: cargando ? "—" : `${totalItems}+`, label:"Productos", icon:"📦" },
                  { val: categorias.length || "—",           label:"Categorías", icon:"🏷️" },
                  { val: "Gratis",                           label:"Envío +$80k", icon:"🚚" },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    textAlign:"center", padding:"12px 20px",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}>
                    <div style={{ fontSize:11, marginBottom:4 }}>{s.icon}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:T.lime, fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:0.9, marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buscador hero — glass con ícono FA */}
            <div style={{ position:"relative", maxWidth:540 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", color:"rgba(255,255,255,0.6)" }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="text"
                value={busquedaInput}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                style={{
                  width:"100%", padding:"13px 44px 13px 42px",
                  borderRadius:12,
                  border:`1.5px solid rgba(255,255,255,0.12)`,
                  background:"rgba(255,255,255,0.10)",
                  color:"#fff", fontSize:14,
                  outline:"none", transition:"all 0.2s",
                  backdropFilter:"blur(8px)",
                }}
                onFocus={e => { e.target.style.background="rgba(255,255,255,0.17)"; e.target.style.borderColor=`${T.lime}88`; e.target.style.boxShadow=`0 0 0 3px rgba(122,193,67,0.15)`; }}
                onBlur={e  => { e.target.style.background="rgba(255,255,255,0.10)"; e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; }}
              />
              {busquedaInput && (
                <button onClick={() => handleBusqueda("")}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"50%",
                    width:24, height:24, cursor:"pointer", color:"#fff", fontSize:14,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Contenido principal ───────────────────────────────────────── */}
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"18px 16px 64px" }}>

          {destacados.length >= 3 && <DestacadosCarrusel productos={destacados}/>}

          {/* ── Layout: sidebar filtros + contenido ── */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>

            {/* ── Sidebar filtros ── */}
            <aside style={{ width:224, flexShrink:0, position:"sticky", top:72 }}>
              <div style={{ background:T.surface, borderRadius:14, border:`1px solid ${T.border}`,
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                {/* Cabecera */}
                <div style={{ padding:"13px 16px", borderBottom:`1px solid ${T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <FontAwesomeIcon icon={faSliders} style={{ color:T.brand, fontSize:11 }} />
                    <span style={{ fontSize:13, fontWeight:700, color:T.text }}>Filtros</span>
                  </div>
                  {hayFiltros && (
                    <button onClick={limpiarFiltros}
                      style={{ fontSize:11, color:T.danger, background:"none", border:"none",
                        cursor:"pointer", fontWeight:600, display:"inline-flex", alignItems:"center", gap:4 }}>
                      <FontAwesomeIcon icon={faFilterCircleXmark} style={{ fontSize:10 }} /> Limpiar
                    </button>
                  )}
                </div>

                {/* Categorías */}
                <div style={{ padding:"12px 10px" }}>
                  <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2,
                    color:T.textMuted, margin:"0 0 8px 6px" }}>Categorías</p>

                  {/* Todos */}
                  <button onClick={limpiarFiltros}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
                      padding:"8px 10px", borderRadius:9, marginBottom:2, border:"none",
                      background: categoriasActivas.length===0&&!busqueda ? T.brandLight : "transparent",
                      color: categoriasActivas.length===0&&!busqueda ? T.brand : T.textSec,
                      fontSize:13, fontWeight: categoriasActivas.length===0&&!busqueda ? 700 : 400,
                      cursor:"pointer", transition:"all 0.14s", textAlign:"left" }}
                    onMouseEnter={e => { if (!(categoriasActivas.length===0&&!busqueda)) e.currentTarget.style.background=T.surfaceAlt; }}
                    onMouseLeave={e => { if (!(categoriasActivas.length===0&&!busqueda)) e.currentTarget.style.background="transparent"; }}>
                    <span style={{ fontSize:12 }}>🌿</span>
                    <span style={{ flex:1 }}>Todos los productos</span>
                    {categoriasActivas.length===0&&!busqueda && (
                      <FontAwesomeIcon icon={faCheck} style={{ fontSize:9, color:T.brand }} />
                    )}
                  </button>

                  {/* Lista categorías */}
                  {categorias.map(cat => {
                    const cfg = getCatCfg(cat.nombre);
                    const activa = categoriasActivas.includes(cat.id);
                    return (
                      <button key={cat.id} onClick={() => toggleCategoria(cat.id)}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
                          padding:"8px 10px", borderRadius:9, marginBottom:2, border:"none",
                          background: activa ? cfg.bg : "transparent",
                          color: activa ? cfg.color : T.textSec,
                          fontSize:13, fontWeight: activa ? 600 : 400,
                          cursor:"pointer", transition:"all 0.14s", textAlign:"left" }}
                        onMouseEnter={e => { if (!activa) e.currentTarget.style.background=T.surfaceAlt; }}
                        onMouseLeave={e => { if (!activa) e.currentTarget.style.background="transparent"; }}>
                        <FontAwesomeIcon icon={cfg.fa} style={{ fontSize:11, opacity:0.7, flexShrink:0 }} />
                        <span style={{ flex:1 }}>{cat.nombre}</span>
                        {activa && <FontAwesomeIcon icon={faCheck} style={{ fontSize:9, color:cfg.color }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ── Contenido principal ── */}
            <div style={{ flex:1, minWidth:0 }}>
              {/* Barra de resultados */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:14, flexWrap:"wrap", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  {cargando ? (
                    <span style={{ fontSize:12, color:T.textMuted }}>Buscando...</span>
                  ) : (
                    <span style={{ fontSize:12, color:T.textTer }}>
                      <strong style={{ color:T.text, fontWeight:700, fontSize:14 }}>{totalItems}</strong>
                      {" producto"}{totalItems !== 1 ? "s" : ""}
                      {busqueda && <> · <em style={{ fontStyle:"normal", color:T.brand }}>"{busqueda}"</em></>}
                    </span>
                  )}
                  {categoriasActivas.map(id => {
                    const cat = categorias.find(c => c.id === id);
                    if (!cat) return null;
                    const cfg = getCatCfg(cat.nombre);
                    return (
                      <button key={id} onClick={() => toggleCategoria(id)}
                        style={{ display:"inline-flex", alignItems:"center", gap:5,
                          padding:"3px 10px", borderRadius:7,
                          border:`1px solid ${cfg.color}44`, background:cfg.bg,
                          color:cfg.color, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        {cat.nombre} ×
                      </button>
                    );
                  })}
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
                <div style={{ textAlign:"center", padding:"64px 24px", background:T.surface,
                  borderRadius:16, border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:48, marginBottom:12, opacity:0.4 }}>🔍</div>
                  <h3 style={{ fontSize:17, color:T.text, margin:"0 0 6px",
                    fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600 }}>
                    Sin resultados
                  </h3>
                  <p style={{ color:T.textTer, margin:"0 0 18px", fontSize:13 }}>
                    {busqueda ? `No encontramos productos para "${busqueda}".` : "No hay productos en esta categoría."}
                  </p>
                  <button onClick={limpiarFiltros}
                    style={{ padding:"9px 22px", borderRadius:9, background:T.brand, color:"#fff",
                      border:"none", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className="prod-grid" style={{ animation:"fadeUp 0.25s ease" }}>
                  {productos.map(p => <TarjetaProducto key={p.id} producto={p}/>)}
                </div>
              )}

              {/* Paginación */}
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
            </div>{/* /flex:1 contenido */}
          </div>{/* /layout sidebar+main */}
        </div>{/* /maxWidth */}
      </div>{/* /minHeight */}
    </>
  );
}