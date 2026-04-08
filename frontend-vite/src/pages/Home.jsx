// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCarrito } from "../context/CarritoContext";
import api from "../services/api";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const C = {
  brand:       "#1a5c1a",
  brandMid:    "#2d7a2d",
  brandDark:   "#0c180c",   // ← fix: estaba undefined en versión anterior
  brandLight:  "#e6f3e6",
  brandBorder: "#b8d9b8",
  lime:        "#a3e635",
  canvas:      "#f6f7f4",
  surface:     "#ffffff",
  surfaceAlt:  "#f2f3ef",
  text:        "#111827",
  textSec:     "#374151",
  textTer:     "#6b7280",
  textMuted:   "#9ca3af",
  border:      "rgba(0,0,0,0.08)",
};

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

/* ─── Mapa de colores por categoría ──────────────────────────────────────── */
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

/* ─── Chip de categoría ───────────────────────────────────────────────────── */
function CatChip({ cat, activa, onClick }) {
  const cfg = getCatCfg(cat.nombre);
  return (
    <button
      onClick={() => onClick(activa ? null : cat.id)}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        padding:"6px 14px", borderRadius:999, flexShrink:0,
        border:`1.5px solid ${activa ? cfg.color : C.border}`,
        background: activa ? cfg.bg : C.surface,
        color: activa ? cfg.color : C.textSec,
        fontSize:13, fontWeight: activa ? 700 : 400,
        cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
      }}
      onMouseEnter={e => { if (!activa) { e.currentTarget.style.borderColor = cfg.color + "66"; e.currentTarget.style.background = cfg.bg + "88"; }}}
      onMouseLeave={e => { if (!activa) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}}
    >
      <span style={{fontSize:13}}>{cfg.emoji}</span>
      {cat.nombre}
    </button>
  );
}

/* ─── Tarjeta de producto ─────────────────────────────────────────────────── */
function TarjetaProducto({ producto }) {
  const navigate = useNavigate();
  const { agregar } = useCarrito();  // ← nombre correcto: "agregar", no "agregarAlCarrito"
  const [agregando, setAgregando] = useState(false);
  const [agregado,  setAgregado]  = useState(false);

  // Normalizar precio y stock — soporta productos con o sin variantes
  const precio      = Number(producto.variantes?.[0]?.precio     ?? producto.precio     ?? 0);
  const precioAntes = Number(producto.variantes?.[0]?.precio_antes ?? producto.precio_antes ?? 0);
  const stock       = Number(producto.variantes?.[0]?.stock       ?? producto.stock       ?? 0);
  const agotado     = stock === 0;
  const descuento   = precioAntes > precio && precioAntes > 0
    ? Math.round((1 - precio / precioAntes) * 100) : null;

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (agotado || agregando) return;

    setAgregando(true);
    agregar({
      id:          producto.id,
      nombre:      producto.nombre,
      precio:      precio,
      precio_antes: precioAntes > 0 ? precioAntes : null,
      imagen_url:  producto.imagen_url || null,
      slug:        producto.slug,
      stock:       stock,
    }, 1);

    setAgregado(true);
    setTimeout(() => { setAgregando(false); setAgregado(false); }, 1800);
  };

  return (
    <article
      onClick={() => navigate(`/producto/${producto.slug}`)}
      style={{
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:16, overflow:"hidden", cursor:"pointer",
        transition:"all 0.2s", position:"relative",
        display:"flex", flexDirection:"column", userSelect:"none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(26,92,26,0.12)"; e.currentTarget.style.borderColor=C.brandBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=C.border; }}
    >
      {/* Badge descuento */}
      {descuento && descuento > 0 && (
        <div style={{ position:"absolute",top:10,left:10,zIndex:2, background:"#dc2626",color:"#fff", fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6 }}>
          -{descuento}%
        </div>
      )}
      {/* Badge destacado */}
      {(producto.destacado === 1 || producto.destacado === true) && (
        <div style={{ position:"absolute",top:10,right:10,zIndex:2, background:C.brand,color:"#fff", fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6 }}>
          ⭐ Destacado
        </div>
      )}

      {/* Imagen */}
      <div style={{ background:C.surfaceAlt, height:180, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url} alt={producto.nombre}
            style={{ width:"100%",height:"100%",objectFit:"contain",padding:12,transition:"transform 0.3s" }}
            onError={e => { e.target.style.display="none"; }}
            onMouseEnter={e => { e.target.style.transform="scale(1.05)"; }}
            onMouseLeave={e => { e.target.style.transform="scale(1)"; }}
          />
        ) : (
          <span style={{fontSize:52, opacity:0.35}}>🐾</span>
        )}
        {agotado && (
          <div style={{ position:"absolute",inset:0, background:"rgba(255,255,255,0.75)", display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontSize:11,fontWeight:800,color:"#dc2626", background:"#fef2f2",border:"1.5px solid #fecaca", padding:"4px 10px",borderRadius:8 }}>AGOTADO</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"14px 16px 16px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        {producto.marca && (
          <span style={{ fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8 }}>
            {producto.marca}
          </span>
        )}

        <h3 style={{
          fontSize:13, fontWeight:600, color:C.text, lineHeight:1.4, margin:0,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div style={{ display:"flex", alignItems:"baseline", gap:6, flexWrap:"wrap" }}>
          <span style={{
            fontSize:17, fontWeight:800,
            color: agotado ? C.textMuted : C.brand,
            fontFamily:"'JetBrains Mono','Fira Code',monospace",
          }}>
            {fmt(precio)}
          </span>
          {precioAntes > precio && (
            <span style={{ fontSize:12,color:C.textMuted,textDecoration:"line-through",fontFamily:"monospace" }}>
              {fmt(precioAntes)}
            </span>
          )}
        </div>

        <span style={{ fontSize:10, color:C.textMuted }}>+ IVA 19%</span>

        {!agotado && stock > 0 && stock <= 5 && (
          <span style={{ fontSize:11,color:"#d97706",fontWeight:600 }}>⚠ Últimas {stock} unidades</span>
        )}

        {/* Botón */}
        <button
          onClick={handleAgregar}
          disabled={agotado}
          style={{
            marginTop:"auto", padding:"9px 0", borderRadius:10, border:"none",
            background: agotado ? C.surfaceAlt : agregado ? "#166534" : C.brand,
            color: agotado ? C.textMuted : "#fff",
            fontSize:13, fontWeight:700,
            cursor: agotado ? "default" : "pointer",
            transition:"all 0.2s", letterSpacing:0.2,
          }}
          onMouseEnter={e => { if (!agotado && !agregado) e.currentTarget.style.background = C.brandMid; }}
          onMouseLeave={e => { if (!agotado && !agregado) e.currentTarget.style.background = C.brand; }}
        >
          {agotado ? "Sin stock" : agregado ? "✓ Agregado al carrito" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
      <div style={{ height:180, background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:9 }}>
        {[60,100,50,38].map((w,i) => (
          <div key={i} style={{ height:i===1?26:12, width:`${w}%`, borderRadius:6, background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
        ))}
      </div>
    </div>
  );
}

/* ─── Home principal ──────────────────────────────────────────────────────── */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos,    setProductos]    = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);  // ← total real del backend (fix NaN)
  const [busquedaInput,setBusquedaInput]= useState(searchParams.get("buscar") || "");
  const debounceRef = useRef(null);

  const categoriaActiva  = searchParams.get("categoria") ? Number(searchParams.get("categoria")) : null;
  const busqueda         = searchParams.get("buscar") || "";
  const pagina           = Number(searchParams.get("pagina") || 1);
  const catActivaNombre  = categoriaActiva ? categorias.find(c => c.id === categoriaActiva)?.nombre : null;

  /* Categorías */
  useEffect(() => {
    api.get("/categorias").then(r => setCategorias(r.data || [])).catch(() => {});
  }, []);

  /* Productos */
  useEffect(() => {
    setCargando(true);
    const params = { pagina, limite: 20 };
    if (busqueda)        params.buscar    = busqueda;
    if (categoriaActiva) params.categoria = categoriaActiva;

    api.get("/productos", { params })
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          // Backend devuelve array directo
          setProductos(data);
          setTotalItems(data.length);
          setTotalPaginas(1);
        } else {
          // Backend devuelve { productos, total, totalPaginas }
          setProductos(data.productos || []);
          setTotalItems(Number(data.total ?? data.productos?.length ?? 0));
          setTotalPaginas(Number(data.totalPaginas ?? 1));
        }
      })
      .catch(() => { setProductos([]); setTotalItems(0); setTotalPaginas(1); })
      .finally(() => setCargando(false));
  }, [busqueda, categoriaActiva, pagina]);

  /* Debounce búsqueda */
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

  const cambiarCategoria = (id) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!id) next.delete("categoria");
      else next.set("categoria", id);
      next.delete("pagina");
      return next;
    });
  };

  const limpiarFiltros = () => { setBusquedaInput(""); setSearchParams({}); };
  const hayFiltros     = busqueda || categoriaActiva;

  const irPagina = (n) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    next.set("pagina", n);
    return next;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        * { box-sizing:border-box; }
        @keyframes shimmer { to { background-position:-200% 0; } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .prod-grid { display:grid; gap:16px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:768px)  { .prod-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1024px) { .prod-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1280px) { .prod-grid { grid-template-columns:repeat(5,1fr); } }
        ::-webkit-scrollbar { height:4px; }
        ::-webkit-scrollbar-thumb { background:${C.brandBorder}; border-radius:2px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.canvas }}>
        <Navbar />

        {/* Banner envío gratis */}
        <div style={{
          background:C.brandDark, color:"#fff",
          textAlign:"center", padding:"9px 16px",
          fontSize:13, fontWeight:500, letterSpacing:0.3,
        }}>
          🚚 <strong>Envío gratis</strong> en compras mayores a{" "}
          <span style={{fontFamily:"monospace"}}>$80.000</span> — Bogotá y área metropolitana
        </div>

        {/* Hero tienda */}
        <div style={{
          background:`linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
          padding:"44px 24px 36px",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:-40,right:-40,width:220,height:220,background:"rgba(163,230,53,0.07)",borderRadius:"50%",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-30,left:-30,width:160,height:160,background:"rgba(255,255,255,0.04)",borderRadius:"50%",pointerEvents:"none"}}/>

          <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16, marginBottom:24 }}>
              <div>
                <p style={{ margin:"0 0 4px", fontSize:11, color:"rgba(163,230,53,0.9)", fontWeight:700, textTransform:"uppercase", letterSpacing:1.2 }}>
                  Catálogo completo
                </p>
                <h1 style={{
                  margin:0, fontSize:"clamp(22px,4vw,34px)",
                  fontFamily:"'Playfair Display',Georgia,serif",
                  fontStyle:"italic", fontWeight:600, color:"#fff", lineHeight:1.2,
                }}>
                  Nuestra Tienda
                </h1>
                <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                  Productos veterinarios de calidad para tu mascota
                </p>
              </div>

              {/* Stats rápidas */}
              <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
                {[
                  { val: cargando ? "…" : `+${totalItems}`, label:"Productos" },
                  { val: categorias.length || "…",           label:"Categorías" },
                  { val: "24h",                              label:"Envío" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:C.lime, fontFamily:"monospace", lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:0.8, marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buscador */}
            <div style={{ position:"relative", maxWidth:540 }}>
              <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none" }}>🔍</span>
              <input
                type="text"
                value={busquedaInput}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                style={{
                  width:"100%", padding:"13px 44px 13px 42px",
                  borderRadius:12, border:"2px solid transparent",
                  background:"rgba(255,255,255,0.13)", backdropFilter:"blur(8px)",
                  color:"#fff", fontSize:14, outline:"none", transition:"all 0.2s",
                }}
                onFocus={e => { e.target.style.background="rgba(255,255,255,0.2)"; e.target.style.borderColor=C.lime; }}
                onBlur={e  => { e.target.style.background="rgba(255,255,255,0.13)"; e.target.style.borderColor="transparent"; }}
              />
              {busquedaInput && (
                <button onClick={() => handleBusqueda("")} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%",
                  width:22, height:22, cursor:"pointer", color:"#fff", fontSize:14,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"20px 16px 64px" }}>

          {/* Chips de categoría */}
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:20, scrollbarWidth:"none" }}>
            <button
              onClick={() => cambiarCategoria(null)}
              style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"6px 16px", borderRadius:999, flexShrink:0,
                border:`1.5px solid ${!categoriaActiva ? C.brand : C.border}`,
                background:!categoriaActiva ? C.brandLight : C.surface,
                color:!categoriaActiva ? C.brand : C.textSec,
                fontSize:13, fontWeight:!categoriaActiva ? 700 : 400,
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              🏪 Todos los productos
            </button>
            {categorias.map(cat => (
              <CatChip
                key={cat.id} cat={cat}
                activa={categoriaActiva === cat.id}
                onClick={cambiarCategoria}
              />
            ))}
          </div>

          {/* Barra de resultados — FIX NaN: usa totalItems del backend, no productos.length */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {cargando ? (
                <span style={{ fontSize:13, color:C.textMuted }}>Buscando...</span>
              ) : (
                <span style={{ fontSize:13, color:C.textSec }}>
                  <strong style={{ color:C.text }}>{totalItems}</strong>
                  {" producto"}{totalItems !== 1 ? "s" : ""}
                  {" encontrado"}{totalItems !== 1 ? "s" : ""}
                  {busqueda && <> para <em>"{busqueda}"</em></>}
                  {catActivaNombre && <> en <strong>{catActivaNombre}</strong></>}
                </span>
              )}
              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  style={{ fontSize:12, color:"#dc2626", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"3px 9px", cursor:"pointer", fontWeight:600 }}
                >
                  × Limpiar filtros
                </button>
              )}
            </div>
            {totalPaginas > 1 && (
              <span style={{ fontSize:12, color:C.textMuted }}>Página {pagina} de {totalPaginas}</span>
            )}
          </div>

          {/* Grid de productos */}
          {cargando ? (
            <div className="prod-grid">
              {Array(12).fill(0).map((_,i) => <Skeleton key={i}/>)}
            </div>
          ) : productos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"72px 24px", background:C.surface, borderRadius:20, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:56, marginBottom:14 }}>🔍</div>
              <h3 style={{ fontSize:18, color:C.text, margin:"0 0 8px", fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                Sin resultados
              </h3>
              <p style={{ color:C.textTer, margin:"0 0 20px", fontSize:14 }}>
                {busqueda
                  ? `No encontramos productos para "${busqueda}".`
                  : "No hay productos en esta categoría."}
              </p>
              <button
                onClick={limpiarFiltros}
                style={{ padding:"10px 24px", borderRadius:12, background:C.brand, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer" }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="prod-grid" style={{ animation:"fadeInUp 0.3s ease" }}>
              {productos.map(p => <TarjetaProducto key={p.id} producto={p}/>)}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && !cargando && (
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:40, flexWrap:"wrap" }}>
              <PagBtn onClick={() => irPagina(pagina-1)} disabled={pagina===1}>← Anterior</PagBtn>

              {Array.from({length:totalPaginas},(_,i)=>i+1)
                .filter(n => n===1 || n===totalPaginas || Math.abs(n-pagina)<=2)
                .reduce((acc,n,i,arr)=>{ if(i>0 && n-arr[i-1]>1) acc.push("..."); acc.push(n); return acc; },[])
                .map((n,i) => n==="..." ? (
                  <span key={`e${i}`} style={{padding:"8px 4px",color:C.textMuted,fontSize:13}}>…</span>
                ) : (
                  <PagBtn key={n} activo={n===pagina} onClick={()=>irPagina(n)}>{n}</PagBtn>
                ))
              }

              <PagBtn onClick={() => irPagina(pagina+1)} disabled={pagina===totalPaginas}>Siguiente →</PagBtn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PagBtn({ children, onClick, activo, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || activo}
      style={{
        padding:"8px 14px", borderRadius:8, minWidth:36,
        border:`1.5px solid ${activo ? "#1a5c1a" : "rgba(0,0,0,0.08)"}`,
        background: activo ? "#1a5c1a" : "#fff",
        color: activo ? "#fff" : disabled ? "#9ca3af" : "#374151",
        fontSize:13, fontWeight: activo ? 700 : 400,
        cursor: (disabled || activo) ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1, transition:"all 0.15s",
      }}
    >
      {children}
    </button>
  );
}