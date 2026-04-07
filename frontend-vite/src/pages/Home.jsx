// src/pages/Home.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const ENVIO_GRATIS = 80000;
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

// ── Skeleton card ─────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-green-50 overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50" />
    <div className="p-4 space-y-2.5">
      <div className="h-2.5 bg-green-50 rounded-full w-1/3" />
      <div className="h-4 bg-green-50 rounded-full w-4/5" />
      <div className="h-3 bg-green-50 rounded-full w-1/2" />
      <div className="h-9 bg-green-50 rounded-xl mt-4" />
    </div>
  </div>
);

// ── Barra superior envío gratis ───────────────────────────────
function BarraEnvio() {
  return (
    <div className="bg-green-950 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse flex-shrink-0" />
        <p className="text-xs font-semibold text-white/90 text-center">
          🚚 Envíos gratis a partir de{" "}
          <span className="text-lime-400 font-bold">{fmt(ENVIO_GRATIS)}</span>
          {" "}· Todo Colombia · Recíbelo en casa
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Carrusel destacados autoplay + pause on hover ─────────────
function CarruselDestacados({ productos }) {
  const [idx, setIdx]         = useState(0);
  const [pausado, setPausado] = useState(false);
  const autoRef               = useRef(null);
  const trackRef              = useRef(null);
  const [startX, setStartX]   = useState(0);
  const [dragging, setDragging] = useState(false);

  // Cuántas cards según viewport
  const getVisibles = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 5;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 640)  return 3;
    return 2;
  };
  const [visibles, setVisibles] = useState(getVisibles());
  useEffect(() => {
    const fn = () => setVisibles(getVisibles());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const maxIdx = Math.max(0, productos.length - visibles);

  const siguiente = useCallback(() => {
    setIdx(p => p >= maxIdx ? 0 : p + 1);
  }, [maxIdx]);

  const anterior = () => setIdx(p => p <= 0 ? maxIdx : p - 1);

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (!pausado) autoRef.current = setInterval(siguiente, 2800);
  }, [pausado, siguiente]);

  useEffect(() => {
    if (pausado) { clearInterval(autoRef.current); return; }
    autoRef.current = setInterval(siguiente, 2800);
    return () => clearInterval(autoRef.current);
  }, [pausado, siguiente]);

  const irA = (i) => { setIdx(i); resetAuto(); };
  const prev = () => { anterior(); resetAuto(); };
  const next = () => { siguiente(); resetAuto(); };

  const onDragStart = (x) => { setDragging(true); setStartX(x); };
  const onDragEnd   = (x) => {
    if (!dragging) return;
    setDragging(false);
    const diff = startX - x;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  };

  if (!productos.length) return null;

  const cardW = `calc(${100 / visibles}% - ${((visibles - 1) * 16) / visibles}px)`;

  return (
    <section className="py-12" style={{ background: "linear-gradient(180deg,#f0f9f0 0%,#ffffff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
              <span className="w-4 h-px bg-green-400 inline-block" />
              Más vendidos
              <span className="w-4 h-px bg-green-400 inline-block" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-950"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Productos <em className="text-green-600 not-italic">destacados</em>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev}
              className="w-9 h-9 rounded-xl border-2 border-green-200 flex items-center justify-center text-green-700 hover:bg-green-700 hover:text-white hover:border-green-700 transition-all duration-200 text-sm font-bold">
              ←
            </button>
            <button onClick={next}
              className="w-9 h-9 rounded-xl border-2 border-green-200 flex items-center justify-center text-green-700 hover:bg-green-700 hover:text-white hover:border-green-700 transition-all duration-200 text-sm font-bold">
              →
            </button>
            <Link to="/tienda"
              className="ml-2 flex items-center gap-1.5 text-xs font-bold text-green-700 border-2 border-green-200 hover:border-green-600 hover:bg-green-50 px-4 py-2 rounded-xl transition-all duration-200">
              Ver catálogo
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Track */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseUp={e => onDragEnd(e.clientX)}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX)}
          style={{ cursor: dragging ? "grabbing" : "grab" }}>
          <div
            ref={trackRef}
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${idx * (100 / visibles)}% - ${idx * 16 / visibles}px))` }}>
            {productos.map(p => (
              <div key={p.id} className="flex-shrink-0" style={{ width: cardW }}>
                <ProductCard producto={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {maxIdx > 0 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button key={i} onClick={() => irA(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === idx ? "w-6 h-2 bg-green-600" : "w-2 h-2 bg-green-200 hover:bg-green-400"
                }`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Categorías visuales ───────────────────────────────────────
function CategoriasVisuales({ categorias, categoriaActiva, onFiltrar }) {
  const ICONOS = {
    farmacologia: "💊", alimentos: "🥩", higiene: "🧴",
    accesorios: "🎾", equipos: "🔬",
  };
  const COLORES = {
    farmacologia: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    alimentos:    { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    higiene:      { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    accesorios:   { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
    equipos:      { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  };

  return (
    <div className="bg-white border-b border-green-50 py-3 sticky top-10 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => onFiltrar("")}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
              !categoriaActiva
                ? "bg-green-700 text-white border-green-700 shadow-md shadow-green-200"
                : "bg-white text-green-800 border-green-100 hover:border-green-300"
            }`}>
            🐾 Todos
          </button>
          {categorias.map(cat => {
            const activa = categoriaActiva === cat.slug;
            const col = COLORES[cat.slug] || { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
            return (
              <button key={cat.slug} onClick={() => onFiltrar(cat.slug)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2"
                style={activa
                  ? { background: col.text, color: "#fff", borderColor: col.text, boxShadow: `0 4px 12px ${col.text}30` }
                  : { background: col.bg, color: col.text, borderColor: col.border }}>
                {ICONOS[cat.slug] || "📦"} {cat.nombre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Buscador inline ───────────────────────────────────────────
function Buscador({ valor, onChange }) {
  return (
    <div className="relative">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        value={valor}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar medicamentos, alimentos, accesorios..."
        className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl outline-none transition-all"
        style={{
          border: "1.5px solid #b4d9b4",
          background: "#fff",
          color: "#191c18",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
        onFocus={e => { e.target.style.borderColor = "#1a5c1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,26,0.1)"; }}
        onBlur={e => { e.target.style.borderColor = "#b4d9b4"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
      />
    </div>
  );
}

// ── Grid catálogo ─────────────────────────────────────────────
function CatalogoBanner({ titulo, total, limpiar }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#191c18", fontFamily: "'Playfair Display', Georgia, serif" }}>
          {titulo}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "#a8b2a8" }}>{total} productos encontrados</p>
      </div>
      {limpiar && (
        <button onClick={limpiar}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: "#fee2e2", color: "#7f1d1d", border: "1px solid #fca5a5" }}>
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}

// ── Por qué elegirnos ─────────────────────────────────────────
function BannerConfianza() {
  const items = [
    { icon: "🚚", title: "Envío gratis", desc: `A partir de ${fmt(ENVIO_GRATIS)}` },
    { icon: "💊", title: "Certificados", desc: "Registro Invima" },
    { icon: "👨‍⚕️", title: "Asesoría gratis", desc: "Veterinarios expertos" },
    { icon: "↩️", title: "Devoluciones", desc: "15 días de garantía" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-10">
      {items.map(({ icon, title, desc }) => (
        <div key={title}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
          style={{ background: "#fff", borderColor: "#e6f3e6" }}>
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: "#191c18" }}>{title}</p>
            <p className="text-xs" style={{ color: "#788078" }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Paginación ────────────────────────────────────────────────
function Paginacion({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;
  const pages = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  return (
    <div className="flex justify-center gap-1.5 mt-10">
      <button onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
        style={{ border: "1.5px solid #b4d9b4", color: "#1a5c1a" }}>←</button>
      {pages.map(p => (
        <button key={p} onClick={() => onCambiar(p)}
          className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
          style={p === pagina
            ? { background: "#1a5c1a", color: "#fff", border: "1.5px solid #1a5c1a" }
            : { background: "#fff", color: "#48524a", border: "1.5px solid #e6f3e6" }}>
          {p}
        </button>
      ))}
      <button onClick={() => onCambiar(pagina + 1)} disabled={pagina === totalPaginas}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
        style={{ border: "1.5px solid #b4d9b4", color: "#1a5c1a" }}>→</button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function Home() {
  const [productos, setProductos]   = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [total, setTotal]           = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [buscarLocal, setBuscarLocal]   = useState(searchParams.get("buscar") || "");
  const buscarTimer = useRef(null);

  const buscar   = searchParams.get("buscar") || "";
  const categoria = searchParams.get("categoria") || "";
  const pagina   = Number(searchParams.get("pagina") || 1);

  // Cargar catálogo
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (buscar)   params.set("buscar", buscar);
        if (categoria) params.set("categoria", categoria);
        params.set("pagina", pagina);
        params.set("limite", 12);
        const [rProd, rCat] = await Promise.all([
          api.get(`/productos?${params}`),
          api.get("/categorias"),
        ]);
        setProductos(rProd.data.productos);
        setTotal(rProd.data.total);
        setCategorias(rCat.data.filter(c => !c.parent_id));
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, [buscar, categoria, pagina]);

  // Cargar destacados una sola vez
  useEffect(() => {
    api.get("/productos/destacados/lista").then(({ data }) => setDestacados(data)).catch(() => {});
  }, []);

  // Búsqueda con debounce
  const handleBuscar = (val) => {
    setBuscarLocal(val);
    clearTimeout(buscarTimer.current);
    buscarTimer.current = setTimeout(() => {
      setSearchParams(val ? { buscar: val } : {});
    }, 400);
  };

  const filtrar = (slug) => setSearchParams(slug ? { categoria: slug } : {});
  const cambiarPagina = (p) => setSearchParams({ pagina: p, ...(categoria && { categoria }), ...(buscar && { buscar }) });
  const totalPaginas = Math.ceil(total / 12);

  const tituloCatalogo = buscar
    ? `Resultados para "${buscar}"`
    : categoria
    ? categorias.find(c => c.slug === categoria)?.nombre || "Productos"
    : "Catálogo completo";

  return (
    <div className="min-h-screen" style={{ background: "#f6f7f4" }}>
      {/* Barra envío gratis */}
      <BarraEnvio />

      {/* Hero tienda */}
      <div style={{ background: "linear-gradient(135deg, #0c180c 0%, #1a5c1a 50%, #2d7a2d 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              {/* Chip */}
              <span className="inline-flex items-center gap-2 border border-lime-400/30 bg-lime-400/10 text-lime-400 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                Tienda veterinaria oficial
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Todo lo que tu mascota<br />
                <span className="text-lime-400 italic">necesita, aquí</span>
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
                Más de 500 productos veterinarios. Medicamentos, alimentos y accesorios con respaldo profesional.
              </p>
              {/* Buscador hero */}
              <div className="max-w-md">
                <Buscador valor={buscarLocal} onChange={handleBuscar} />
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {[
                { num: "500+", label: "Productos", icon: "📦" },
                { num: "1.200+", label: "Clientes", icon: "👥" },
                { num: "24/7", label: "Soporte", icon: "💬" },
                { num: "Invima", label: "Certificados", icon: "✓" },
              ].map(({ num, label, icon }) => (
                <div key={label} className="rounded-2xl p-5 text-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xl font-bold text-white">{num}</p>
                  <p className="text-xs text-white/50 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de categoría */}
      <CategoriasVisuales
        categorias={categorias}
        categoriaActiva={categoria}
        onFiltrar={filtrar}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carrusel destacados — solo en la vista "Todos" sin búsqueda */}
        {!buscar && !categoria && destacados.length > 0 && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <CarruselDestacados productos={destacados} />
          </div>
        )}

        {/* Banner confianza */}
        <BannerConfianza />

        {/* Catálogo */}
        <div id="catalogo" className="pb-16">
          <CatalogoBanner
            titulo={tituloCatalogo}
            total={total}
            limpiar={(buscar || categoria) ? () => { setBuscarLocal(""); setSearchParams({}); } : null}
          />

          {/* Buscador móvil (debajo de categories cuando buscas) */}
          {(buscar || categoria) && (
            <div className="mb-5">
              <Buscador valor={buscarLocal} onChange={handleBuscar} />
            </div>
          )}

          {cargando ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto"
                style={{ background: "#f0fdf4" }}>🔍</div>
              <h3 className="text-lg font-bold" style={{ color: "#191c18" }}>Sin resultados</h3>
              <p className="text-sm" style={{ color: "#788078" }}>
                No encontramos productos para "{buscar || categoria}"
              </p>
              <button onClick={() => { setBuscarLocal(""); setSearchParams({}); }}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ background: "#1a5c1a" }}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {productos.map(p => <ProductCard key={p.id} producto={p} />)}
              </div>
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={cambiarPagina} />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#0c180c", borderTop: "1px solid #1a2e1a" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: "#b08a24", color: "#0c180c" }}>V</div>
              <span className="font-bold text-sm" style={{ color: "#c4dcc4" }}>Victoria Pecuarios</span>
            </div>
            <p className="text-xs" style={{ color: "#7aa87a" }}>© 2026 · Bogotá, Colombia</p>
            <div className="flex gap-5 text-xs" style={{ color: "#7aa87a" }}>
              <span>📞 300 000 0000</span>
              <span>✉️ info@victoriapecuarios.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}