import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Imports de imágenes ───────────────────────────────────────
import img0 from "../assets/carrusel_proyecto2.jpg";
import img1 from "../assets/carrusel1_proyecto2.jpg";
import img2 from "../assets/carrusel2_proyecto2.jpg";
import img3 from "../assets/carrusel3_proyecto2.jpg";
import imgDesinfectante from "../assets/desinfectante.png";
import imgMeloxican from "../assets/meloxican.jpg";

// ── Datos ─────────────────────────────────────────────────────
const SLIDES = [
  {
    img: img1,
    label: "Tienda veterinaria online",
    h1: "Todo para el bienestar de tus",
    em: "animales",
    p: "Medicamentos certificados, alimentos premium y accesorios. Compra desde casa y recíbelo en tu puerta.",
    btn1: "Ver productos", btn1href: "/tienda",
    btn2: "Conocer más",  btn2href: "#servicios",
  },
  {
    img: img2,
    label: "Farmacología veterinaria",
    h1: "Medicamentos con",
    em: "respaldo profesional",
    p: "Antiparasitarios, antibióticos y vitaminas con registro Invima. Asesoría veterinaria incluida en cada compra.",
    btn1: "Ver medicamentos", btn1href: "/tienda?categoria=farmacologia",
    btn2: "Crear cuenta",     btn2href: "/registro",
  },
  {
    img: img3,
    label: "Nutrición especializada",
    h1: "Alimentación que",
    em: "transforma su vida",
    p: "Royal Canin, Purina Pro Plan y las mejores marcas. Nutrición especializada por especie y etapa de vida.",
    btn1: "Ver alimentos", btn1href: "/tienda?categoria=alimentos",
    btn2: "Explorar",      btn2href: "#categorias",
  },
  {
    img: img0,
    label: "Equipo profesional",
    h1: "Atendidos por",
    em: "expertos veterinarios",
    p: "Nuestro equipo de profesionales está listo para orientarte en cada compra y agendar tu cita veterinaria.",
    btn1: "Contáctanos", btn1href: "#contacto",
    btn2: "Ver servicios", btn2href: "#servicios",
  },
];

const SERVICIOS = [
  { icono:"🚚", titulo:"Envío a domicilio",        desc:"Despachos a todo Colombia. Gratis en compras mayores a $80.000. Seguimiento en tiempo real." },
  { icono:"💊", titulo:"Medicamentos certificados", desc:"Todos nuestros productos farmacológicos cuentan con registro Invima y cadena de frío garantizada." },
  { icono:"👨‍⚕️", titulo:"Asesoría veterinaria",    desc:"Nuestro equipo de profesionales te orienta en la selección del producto adecuado para tu mascota." },
  { icono:"🔒", titulo:"Compra 100% segura",        desc:"Garantía de devolución en 15 días. Pagos protegidos y datos cifrados en todo momento." },
  { icono:"📱", titulo:"Seguimiento de pedidos",    desc:"Rastrea tu orden desde tu perfil. Notificaciones de estado directo a tu correo electrónico." },
  { icono:"🎁", titulo:"Descuentos exclusivos",     desc:"Regístrate y obtén 10% en tu primera compra. Beneficios especiales para clientes frecuentes." },
];

const GALERIA = [
  { img: imgDesinfectante, span:"col-span-2 row-span-2", label:"Desinfectante Olimpia" },
  { img: imgMeloxican,     span:"",                      label:"Meloxic Provet" },
  { emoji:"🐕", bg:"from-green-100 to-emerald-200", span:"", label:"Perros" },
  { emoji:"🐈", bg:"from-teal-100  to-green-200",   span:"", label:"Gatos" },
  { emoji:"🐾", bg:"from-lime-100  to-green-200",   span:"", label:"Mascotas" },
];

const BLOG = [
  { cat:"Nutrición",  fecha:"10 Mar 2026", titulo:"¿Cuántas veces al día debe comer tu perro?",        desc:"La frecuencia varía según la edad, tamaño y condición médica de tu perro.", emoji:"🐕‍🦺", bg:"from-green-100 to-emerald-100" },
  { cat:"Cuidado",    fecha:"2 Mar 2026",  titulo:"Señales de que tu gato podría estar enfermo",        desc:"Los gatos son expertos ocultando el dolor. Aprende a identificar las señales.", emoji:"🐈", bg:"from-teal-100 to-green-100" },
  { cat:"Prevención", fecha:"22 Feb 2026", titulo:"Guía completa de vacunas para perros en Colombia",   desc:"Todo sobre el esquema de vacunación según el Ministerio de Salud.", emoji:"💉", bg:"from-lime-100 to-green-100" },
];

// ── Helpers ───────────────────────────────────────────────────
const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-3">
    <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />{children}
  </span>
);

const SectionTitle = ({ children, center = false }) => (
  <h2 className={`text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4 text-green-950 ${center ? "text-center" : ""}`}
    style={{ fontFamily:"'Playfair Display','Georgia',serif" }}>
    {children}
  </h2>
);

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay:`${delay}ms` }}
      className={`transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {children}
    </div>
  );
}

// ── Navbar landing (con estado de sesión) ─────────────────────
function NavLanding() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => { logout(); setMenuUsuario(false); navigate("/"); };

  const linkCls = scrolled ? "text-green-700 hover:text-green-900" : "text-white/80 hover:text-white";
  const logoCls = scrolled ? "text-green-900" : "text-white";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-green-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-sm">🐾</div>
          <span className={`font-bold text-base transition-colors ${logoCls}`}>Victoria Pecuarios</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {[["#servicios","Servicios"],["#productos","Productos"],["#galeria","Galería"],["#blog","Blog"],["#contacto","Contacto"]].map(([href, label]) => (
            <a key={href} href={href} className={`text-sm font-medium transition-colors ${linkCls}`}>{label}</a>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {usuario ? (
            <div className="relative">
              <button onClick={() => setMenuUsuario(!menuUsuario)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm font-semibold
                  ${scrolled
                    ? "border-green-200 text-green-800 hover:bg-green-50"
                    : "border-white/30 text-white hover:bg-white/10"}`}>
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{usuario.nombre}</span>
                <svg className={`w-3 h-3 transition-transform ${menuUsuario ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {menuUsuario && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuUsuario(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-800 truncate">{usuario.nombre} {usuario.apellido}</p>
                      <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                    </div>
                    <Link to="/tienda"       onClick={() => setMenuUsuario(false)} className="block px-4 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800">🛒 Ir a la tienda</Link>
                    <Link to="/perfil"       onClick={() => setMenuUsuario(false)} className="block px-4 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800">👤 Mi perfil</Link>
                    <Link to="/mis-ordenes"  onClick={() => setMenuUsuario(false)} className="block px-4 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800">📦 Mis órdenes</Link>
                    {(usuario.rol === "admin" || usuario.rol === "superadmin") && (
                      <Link to="/admin"      onClick={() => setMenuUsuario(false)} className="block px-4 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800">⚙️ Panel admin</Link>
                    )}
                    <hr className="my-1 border-gray-50" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50">Cerrar sesión</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"
                className={`hidden sm:block text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${scrolled ? "text-green-700 hover:bg-green-50" : "text-white hover:bg-white/10"}`}>
                Iniciar sesión
              </Link>
              <Link to="/registro"
                className="text-sm font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Hero Carrusel con imágenes reales ─────────────────────────
function Hero() {
  const [cur, setCur] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  const go = (n) => {
    setFade(false);
    setTimeout(() => { setCur(n); setFade(true); }, 350);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go((n + 1) % SLIDES.length), 5500);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCur(p => {
        const next = (p + 1) % SLIDES.length;
        setFade(false);
        setTimeout(() => setFade(true), 350);
        return next;
      });
    }, 5500);
    return () => clearInterval(timerRef.current);
  }, []);

  const s = SLIDES[cur];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Imagen de fondo */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
        <img src={s.img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/70 to-green-800/40" />
      </div>

      {/* Contenido */}
      <div className={`relative z-10 min-h-screen flex items-center transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />{s.label}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5 max-w-2xl"
            style={{ fontFamily:"'Playfair Display','Georgia',serif" }}>
            {s.h1}<br />
            <span className="text-lime-400 italic">{s.em}</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">{s.p}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={s.btn1href}
              className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-green-950 font-bold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-400/30 text-sm">
              🛒 {s.btn1}
            </Link>
            <a href={s.btn2href}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/25 text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm">
              {s.btn2}
            </a>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button onClick={() => go((cur - 1 + SLIDES.length) % SLIDES.length)}
          className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur text-lg">←</button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === cur ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
        <button onClick={() => go((cur + 1) % SLIDES.length)}
          className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur text-lg">→</button>
      </div>

      {/* Indicador slide */}
      <div className="absolute bottom-8 right-6 z-20 text-white/50 text-xs font-mono">
        {String(cur + 1).padStart(2,"0")} / {String(SLIDES.length).padStart(2,"0")}
      </div>
    </section>
  );
}

// ── Ticker ────────────────────────────────────────────────────
function Ticker() {
  const items = ["🐾 Envío gratis +$80.000","💊 Medicamentos con Invima","⭐ +1.200 clientes","🚚 Despachos todo Colombia","👨‍⚕️ Asesoría gratis","🔒 Compra segura"];
  const doubled = [...items, ...items];
  return (
    <div className="bg-green-700 py-3 overflow-hidden">
      <div className="flex whitespace-nowrap" style={{ animation:"ticker 28s linear infinite" }}>
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 text-white text-sm font-medium flex-shrink-0">
            <span className="text-lime-300">·</span>{t}
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────
function Stats() {
  const data = [
    { num:500, suffix:"+", label:"Productos disponibles" },
    { num:1200, suffix:"+", label:"Clientes satisfechos" },
    { num:8, suffix:" años", label:"De experiencia" },
    { num:24, suffix:"/7", label:"Soporte disponible" },
  ];
  const [counts, setCounts] = useState(data.map(() => 0));
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      data.forEach((d, i) => {
        let c = 0; const step = d.num / 60;
        const t = setInterval(() => {
          c += step;
          if (c >= d.num) { c = d.num; clearInterval(t); }
          setCounts(prev => { const n = [...prev]; n[i] = Math.floor(c); return n; });
        }, 25);
      });
      obs.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-green-100 rounded-2xl overflow-hidden shadow-sm">
          {data.map((d, i) => (
            <div key={i} className="bg-green-50 hover:bg-green-100 transition-colors px-8 py-10 text-center">
              <div className="text-4xl font-bold text-green-700 mb-1" style={{ fontFamily:"'Playfair Display','Georgia',serif" }}>
                {counts[i]}{d.suffix}
              </div>
              <div className="text-sm text-green-600 font-medium">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Productos destacados ──────────────────────────────────────
function ProductosDestacados() {
  const [productos, setProductos] = useState([]);
  useEffect(() => {
    api.get("/productos/destacados/lista").then(({ data }) => setProductos(data)).catch(() => {});
  }, []);
  const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
  const descPct = (p) => p.precio_antes ? Math.round(((p.precio_antes - p.precio) / p.precio_antes) * 100) : null;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div><Chip>Destacados</Chip>
              <SectionTitle>Productos más <em className="text-green-600 not-italic">populares</em></SectionTitle>
              <p className="text-green-700/70 max-w-md">Los favoritos de nuestros clientes. Calidad garantizada con asesoría veterinaria.</p>
            </div>
            <Link to="/tienda" className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-500 px-4 py-2 rounded-xl transition-all">
              Ver todo →
            </Link>
          </div>
        </FadeUp>
        {productos.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-green-50 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-green-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-green-100 rounded w-1/3" />
                  <div className="h-4 bg-green-100 rounded w-3/4" />
                  <div className="h-8 bg-green-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {productos.map((p, i) => (
              <FadeUp key={p.id} delay={i * 80}>
                <Link to={`/producto/${p.slug}`}
                  className="group bg-green-50 rounded-2xl overflow-hidden border border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <span className="text-6xl">🐾</span>}
                    {descPct(p) && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{descPct(p)}%</span>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">{p.categoria}</span>
                    <h3 className="text-sm font-semibold text-green-950 line-clamp-2 mb-1 group-hover:text-green-700 transition-colors">{p.nombre}</h3>
                    {p.marca && <p className="text-xs text-green-600/60 mb-3">{p.marca}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-green-700">{fmt(p.precio)}</span>
                        {p.precio_antes && <span className="text-xs text-green-600/50 line-through ml-1">{fmt(p.precio_antes)}</span>}
                      </div>
                      <span className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold group-hover:bg-green-800 transition-colors">Ver →</span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Servicios ─────────────────────────────────────────────────
function Servicios() {
  return (
    <section id="servicios" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Chip>Servicios</Chip>
            <SectionTitle center>Más que una tienda, un <em className="text-green-600 not-italic">aliado veterinario</em></SectionTitle>
            <p className="text-green-700/70 max-w-lg mx-auto">Todo lo que tu mascota necesita con el respaldo de profesionales veterinarios.</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICIOS.map((s, i) => (
            <FadeUp key={s.titulo} delay={i * 70}>
              <div className="bg-white rounded-2xl p-7 border border-green-100 hover:border-green-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-lime-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-5">{s.icono}</div>
                <h3 className="font-bold text-green-950 mb-2 text-base">{s.titulo}</h3>
                <p className="text-sm text-green-700/70 leading-relaxed">{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Galería con imágenes reales ───────────────────────────────
function Galeria() {
  return (
    <section id="galeria" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Chip>Galería</Chip>
            <SectionTitle center>Nuestros productos y <em className="text-green-600 not-italic">mascotas</em></SectionTitle>
            <p className="text-green-700/70 max-w-lg mx-auto">Un vistazo a los productos que manejamos y las mascotas que amamos atender.</p>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ gridTemplateRows:"220px 220px" }}>
            {GALERIA.map((g, i) => (
              <div key={i}
                className={`rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300 ${g.span}
                  ${g.bg ? `bg-gradient-to-br ${g.bg}` : ""}`}>
                {g.img
                  ? <img src={g.img} alt={g.label} className="w-full h-full object-cover" />
                  : <span className="text-5xl">{g.emoji}</span>}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Blog ──────────────────────────────────────────────────────
function Blog() {
  return (
    <section id="blog" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Chip>Blog</Chip>
            <SectionTitle center>Consejos para tu <em className="text-green-600 not-italic">mascota</em></SectionTitle>
            <p className="text-green-700/70 max-w-lg mx-auto">Artículos de nuestros veterinarios para el bienestar de tu compañero.</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BLOG.map((b, i) => (
            <FadeUp key={b.titulo} delay={i * 80}>
              <div className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:border-green-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <div className={`h-44 bg-gradient-to-br ${b.bg} flex items-center justify-center text-6xl`}>{b.emoji}</div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-0.5 rounded-full">{b.cat}</span>
                    <span className="text-xs text-green-600/60">{b.fecha}</span>
                  </div>
                  <h4 className="font-bold text-green-950 mb-2 text-sm leading-snug group-hover:text-green-700 transition-colors">{b.titulo}</h4>
                  <p className="text-xs text-green-700/70 leading-relaxed mb-4">{b.desc}</p>
                  <span className="text-xs font-bold text-green-600 hover:text-green-800 cursor-pointer">Leer más →</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contacto ──────────────────────────────────────────────────
function Contacto() {
  const [form, setForm] = useState({ nombre:"", email:"", asunto:"", mensaje:"" });
  const [enviado, setEnviado] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setEnviado(true);
    setForm({ nombre:"", email:"", asunto:"", mensaje:"" });
    setTimeout(() => setEnviado(false), 4000);
  };

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mb-12">
            <Chip>Contacto</Chip>
            <SectionTitle>Estamos para <em className="text-green-600 not-italic">ayudarte</em></SectionTitle>
            <p className="text-green-700/70 max-w-md">¿Tienes preguntas o quieres agendar una cita veterinaria? Escríbenos o llámanos.</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <FadeUp>
            <div className="space-y-4">
              {[
                { icono:"📍", titulo:"Dirección",           texto:"Cra. 15 #85-23, Chapinero\nBogotá, Colombia" },
                { icono:"📞", titulo:"Teléfono / WhatsApp", texto:"(601) 234-5678\nWhatsApp: 310 123 4567" },
                { icono:"✉️", titulo:"Correo",              texto:"info@victoriapecuarios.com" },
                { icono:"🕐", titulo:"Horario",             texto:"Lun–Vie: 8AM–8PM · Sáb: 9AM–5PM\nUrgencias: 24/7" },
              ].map(({ icono, titulo, texto }) => (
                <div key={titulo} className="flex gap-4 items-start p-4 rounded-2xl border border-green-100 hover:border-green-300 hover:bg-green-50 transition-all">
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icono}</div>
                  <div>
                    <h4 className="font-bold text-green-950 text-sm mb-0.5">{titulo}</h4>
                    <p className="text-sm text-green-700/70 leading-relaxed whitespace-pre-line">{texto}</p>
                  </div>
                </div>
              ))}
              <div className="bg-green-700 rounded-2xl p-5 text-white">
                <p className="font-bold mb-1 text-sm">¿Quieres agendar una cita veterinaria?</p>
                <p className="text-sm text-white/80">Contáctanos por WhatsApp al 310 123 4567 o llámanos. Nuestro equipo te atenderá de inmediato.</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="bg-green-50 rounded-2xl p-7 border border-green-100">
              <h3 className="font-bold text-green-950 text-lg mb-6">Envíanos un mensaje</h3>
              {enviado && <div className="mb-4 px-4 py-3 bg-green-100 border border-green-300 rounded-xl text-green-800 text-sm font-medium">✅ Mensaje enviado. Te responderemos pronto.</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[["Tu nombre","nombre","text","María López"],["Correo","email","email","correo@ejemplo.com"]].map(([label,key,type,ph]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">{label}</label>
                      <input type={type} value={form[key]} onChange={set(key)} placeholder={ph} required
                        className="w-full px-3.5 py-2.5 border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Asunto</label>
                  <input type="text" value={form.asunto} onChange={set("asunto")} placeholder="¿En qué podemos ayudarte?" required
                    className="w-full px-3.5 py-2.5 border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Mensaje</label>
                  <textarea value={form.mensaje} onChange={set("mensaje")} placeholder="Escribe tu mensaje..." required rows={4}
                    className="w-full px-3.5 py-2.5 border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white resize-none" />
                </div>
                <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-green-950 text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-lg">🐾</div>
              <span className="font-bold text-white text-lg">Victoria Pecuarios</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">Tu tienda veterinaria de confianza. Productos de calidad y asesoría profesional.</p>
            <div className="flex gap-2">
              {["f","ig","wa","yt"].map(s => (
                <div key={s} className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 hover:bg-green-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-all">{s}</div>
              ))}
            </div>
          </div>
          {[
            { titulo:"Productos", links:["Farmacología","Alimentos","Higiene","Accesorios","Equipos"] },
            { titulo:"Información", links:["Sobre nosotros","Cómo comprar","Envíos","Devoluciones","Preguntas frecuentes"] },
            { titulo:"Contacto", links:["📞 (601) 234-5678","💬 310 123 4567","✉️ info@victoriapecuarios.com","📍 Bogotá, Colombia","🕐 Lun–Sab 8am–8pm"] },
          ].map(({ titulo, links }) => (
            <div key={titulo}>
              <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{titulo}</h5>
              <ul className="space-y-2.5">
                {links.map(l => <li key={l}><span className="text-sm hover:text-green-400 transition-colors cursor-pointer">{l}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© 2026 Victoria Pecuarios. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            {["Privacidad","Términos","Cookies"].map(l => (
              <span key={l} className="text-xs text-white/40 hover:text-white cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Página completa ───────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen">
      <NavLanding />
      <Hero />
      <Ticker />
      <Stats />
      <ProductosDestacados />
      <Servicios />
      <Galeria />
      <Blog />
      <Contacto />
      <Footer />
    </div>
  );
}
