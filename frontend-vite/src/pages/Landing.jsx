import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ─── Importar imágenes locales ──────────────────────────────────────────── */
import img1 from "../assets/carrusel_proyecto2.jpg";
import img2 from "../assets/carrusel1_proyecto2.jpg";
import img3 from "../assets/carrusel2_proyecto2.jpg";
import img4 from "../assets/carrusel3_proyecto2.jpg";
import imgDesinfectante from "../assets/desinfectante.png";
import imgMeloxican from "../assets/meloxican.jpg";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const C = {
  brand: "#1a5c1a",
  brandMid: "#2d7a2d",
  brandDark: "#0c180c",
  brandLight: "#e6f3e6",
  brandBorder: "#b8d9b8",
  lime: "#a3e635",
  limeDeep: "#84cc16",
  canvas: "#f6f7f4",
  surface: "#ffffff",
  surfaceAlt: "#f2f3ef",
  text: "#111827",
  textSec: "#374151",
  textTer: "#6b7280",
  textMuted: "#9ca3af",
  border: "rgba(0,0,0,0.08)",
};

const SLIDES = [
  { img: img1, titulo: "Salud Animal de Primera", sub: "Medicamentos y vacunas certificadas para tu mascota", cta: "Explorar farmacología" },
  { img: img2, titulo: "Nutrición que Cuida", sub: "Alimentos balanceados para todas las especies", cta: "Ver alimentos" },
  { img: img3, titulo: "Higiene y Bienestar", sub: "Productos de aseo profesional para mascotas", cta: "Ver higiene" },
  { img: img4, titulo: "Equipo Veterinario", sub: "Instrumentos y equipos para profesionales", cta: "Ver equipos" },
];

const SERVICIOS = [
  { icon: "🏥", titulo: "Consulta Veterinaria", desc: "Atención profesional con veterinarios especializados", stat: "24h", statLabel: "tiempo promedio" },
  { icon: "💊", titulo: "Farmacología Animal", desc: "Medicamentos con fórmula y de venta libre", stat: "200+", statLabel: "productos" },
  { icon: "🥩", titulo: "Nutrición Especializada", desc: "Dietas personalizadas según raza y edad", stat: "50+", statLabel: "marcas" },
  { icon: "🔬", titulo: "Laboratorio Clínico", desc: "Exámenes y diagnóstico veterinario completo", stat: "48h", statLabel: "resultados" },
  { icon: "🐾", titulo: "Peluquería Canina", desc: "Baño, corte y cuidado estético profesional", stat: "5★", statLabel: "calificación" },
  { icon: "🚚", titulo: "Domicilio Express", desc: "Entrega en Bogotá y área metropolitana", stat: "Free", statLabel: "+$80.000" },
];

const CATEGORIAS_TIENDA = [
  { icon: "💊", nombre: "Farmacología", desc: "Medicamentos, vacunas y antiparasitarios", color: "#166534", bg: "#dcfce7", q: "farmacologia" },
  { icon: "🍖", nombre: "Alimentos", desc: "Concentrados, snacks y dietas especiales", color: "#92400e", bg: "#fef3c7", q: "alimentos" },
  { icon: "🧴", nombre: "Higiene", desc: "Shampoos, desinfectantes y cuidado dental", color: "#1e40af", bg: "#dbeafe", q: "higiene" },
  { icon: "🎀", nombre: "Accesorios", desc: "Collares, correas y juguetes", color: "#6b21a8", bg: "#f3e8ff", q: "accesorios" },
  { icon: "🔬", nombre: "Equipos", desc: "Instrumentación y diagnóstico", color: "#0e7490", bg: "#cffafe", q: "equipos" },
  { icon: "🛁", nombre: "Peluquería", desc: "Tijeras, cepillos y accesorios de grooming", color: "#be185d", bg: "#fce7f3", q: "peluqueria" },
];

const BLOG = [
  { cat: "Salud", titulo: "¿Cada cuánto debe vacunarse mi mascota?", desc: "Guía completa del calendario de vacunación para perros y gatos en Colombia.", fecha: "02 abr 2026", emoji: "💉" },
  { cat: "Nutrición", titulo: "Cómo elegir el mejor alimento para tu perro", desc: "Factores clave: raza, tamaño, edad y condición de salud.", fecha: "28 mar 2026", emoji: "🥩" },
  { cat: "Cuidado", titulo: "Señales de que tu mascota necesita al veterinario", desc: "10 síntomas que no debes ignorar en perros y gatos.", fecha: "20 mar 2026", emoji: "🐾" },
];

/* ─── Navbar Landing ─────────────────────────────────────────────────────── */
function NavLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 24px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: scrolled ? C.brand : "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, transition: "all 0.3s",
          }}>🐾</div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 600, fontSize: 17,
              color: scrolled ? C.brand : "#fff",
              lineHeight: 1.1, transition: "color 0.3s",
            }}>Victoria</div>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: scrolled ? C.textTer : "rgba(255,255,255,0.7)",
              letterSpacing: 1.5, textTransform: "uppercase",
              transition: "color 0.3s",
            }}>Pecuarios</div>
          </div>
        </Link>

        {/* Links desktop */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {[
            { href: "#tienda", label: "Tienda" },
            { href: "#servicios", label: "Servicios" },
            { href: "#galeria", label: "Galería" },
            { href: "#blog", label: "Blog" },
            { href: "#contacto", label: "Contacto" },
          ].map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                padding: "8px 14px", borderRadius: 8, textDecoration: "none",
                fontSize: 14, fontWeight: 500,
                color: scrolled ? C.textSec : "rgba(255,255,255,0.85)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.target.style.background = scrolled ? C.surfaceAlt : "rgba(255,255,255,0.12)";
                e.target.style.color = scrolled ? C.text : "#fff";
              }}
              onMouseLeave={e => {
                e.target.style.background = "transparent";
                e.target.style.color = scrolled ? C.textSec : "rgba(255,255,255,0.85)";
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + auth */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {usuario ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: scrolled ? C.textSec : "rgba(255,255,255,0.8)" }}>
                Hola, {usuario.nombre}
              </span>
              {usuario.rol === "admin" || usuario.rol === "superadmin" ? (
                <Link to="/admin" style={ctaSecStyle(scrolled)}>Panel Admin</Link>
              ) : (
                <Link to="/perfil" style={ctaSecStyle(scrolled)}>Mi perfil</Link>
              )}
              <button onClick={logout} style={ctaSecStyle(scrolled)}>Salir</button>
            </div>
          ) : (
            <>
              <Link to="/login" style={ctaSecStyle(scrolled)}>Iniciar sesión</Link>
            </>
          )}
          <Link
            to="/tienda"
            style={{
              padding: "9px 20px", borderRadius: 10,
              background: C.lime, color: C.brandDark,
              textDecoration: "none", fontSize: 13, fontWeight: 700,
              transition: "all 0.15s",
              boxShadow: "0 2px 8px rgba(163,230,53,0.35)",
            }}
            onMouseEnter={e => { e.target.style.background = C.limeDeep; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = C.lime; e.target.style.transform = "translateY(0)"; }}
          >
            Ir a la tienda →
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ctaSecStyle(scrolled) {
  return {
    padding: "8px 14px", borderRadius: 8,
    background: "transparent",
    color: scrolled ? C.textSec : "rgba(255,255,255,0.8)",
    border: `1px solid ${scrolled ? C.border : "rgba(255,255,255,0.25)"}`,
    textDecoration: "none", fontSize: 13, fontWeight: 500,
    cursor: "pointer", transition: "all 0.15s",
  };
}

/* ─── Carrusel Hero ───────────────────────────────────────────────────────── */
function HeroCarrusel() {
  const [actual, setActual] = useState(0);
  const timer = useRef(null);
  const navigate = useNavigate();

  const resetTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setActual(a => (a + 1) % SLIDES.length), 5500);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timer.current);
  }, []);

  const ir = (i) => { setActual(i); resetTimer(); };

  return (
    <div style={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden" }}>
      {SLIDES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            opacity: i === actual ? 1 : 0,
            transition: "opacity 0.8s ease",
            background: `linear-gradient(135deg, ${C.brandDark}ee 0%, ${C.brand}99 100%), url(${s.img}) center/cover`,
          }}
        />
      ))}

      {/* Overlay degradado bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
      }} />

      {/* Contenido */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
        padding: "80px 10vw",
        maxWidth: 700,
      }}>
        <div style={{
          display: "inline-block", background: "rgba(163,230,53,0.2)",
          border: "1px solid rgba(163,230,53,0.4)",
          borderRadius: 999, padding: "4px 14px",
          fontSize: 11, fontWeight: 700, color: C.lime,
          letterSpacing: 1.5, textTransform: "uppercase",
          marginBottom: 16,
        }}>
          {String(actual + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic", fontWeight: 600,
          fontSize: "clamp(32px,5vw,60px)",
          color: "#fff", lineHeight: 1.15,
          margin: "0 0 16px",
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          {SLIDES[actual].titulo}
        </h1>
        <p style={{
          fontSize: "clamp(15px,2vw,18px)",
          color: "rgba(255,255,255,0.78)",
          margin: "0 0 32px", lineHeight: 1.6,
          maxWidth: 500,
        }}>
          {SLIDES[actual].sub}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/tienda"
            style={{
              padding: "14px 32px", borderRadius: 12,
              background: C.lime, color: C.brandDark,
              textDecoration: "none", fontSize: 15, fontWeight: 700,
              boxShadow: "0 4px 20px rgba(163,230,53,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 28px rgba(163,230,53,0.5)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(163,230,53,0.4)"; }}
          >
            Ver tienda →
          </Link>
          <a
            href="#servicios"
            style={{
              padding: "14px 28px", borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", textDecoration: "none",
              fontSize: 15, fontWeight: 500, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.12)"; }}
          >
            Nuestros servicios
          </a>
        </div>
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: 32, left: "10vw",
        display: "flex", gap: 8,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => ir(i)}
            style={{
              width: i === actual ? 28 : 8, height: 8, borderRadius: 999,
              background: i === actual ? C.lime : "rgba(255,255,255,0.35)",
              border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
            }}
          />
        ))}
      </div>

      {/* Flechas */}
      {[{ dir: -1, pos: "left: 24px", sym: "‹" }, { dir: 1, pos: "right: 24px", sym: "›" }].map(f => (
        <button
          key={f.sym}
          onClick={() => ir((actual + f.dir + SLIDES.length) % SLIDES.length)}
          style={{
            position: "absolute", top: "50%", [f.dir === -1 ? "left" : "right"]: 24,
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", fontSize: 28, width: 48, height: 48,
            borderRadius: "50%", cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
        >
          {f.sym}
        </button>
      ))}
    </div>
  );
}

/* ─── Ticker de beneficios ───────────────────────────────────────────────── */
function Ticker() {
  const items = ["🚚 Envío gratis desde $80.000", "💊 Medicamentos certificados", "⭐ Atención veterinaria 24h", "🐾 +500 productos en stock", "🎁 Descuentos para clientes frecuentes", "🔬 Laboratorio clínico propio"];
  return (
    <div style={{ background: C.brand, color: "#fff", overflow: "hidden", padding: "10px 0" }}>
      <div style={{
        display: "flex", gap: 48,
        animation: "ticker 28s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {[...items, ...items].map((it, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 500 }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Stats animados ─────────────────────────────────────────────────────── */
function Stats() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const items = [
    { val: "2.500+", label: "Clientes satisfechos" },
    { val: "500+", label: "Productos disponibles" },
    { val: "8", label: "Años de experiencia" },
    { val: "98%", label: "Calificación de servicio" },
  ];

  return (
    <div ref={ref} style={{
      background: C.brandDark,
      padding: "52px 24px",
    }}>
      <div style={{
        maxWidth: 1000, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 32, textAlign: "center",
      }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ${i * 0.1}s`,
            }}
          >
            <div style={{
              fontSize: "clamp(28px,4vw,42px)", fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: C.lime,
              marginBottom: 6,
            }}>{it.val}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.8 }}>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Sección Tienda ─────────────────────────────────────────────────────── */
function SeccionTienda() {
  const [destacados, setDestacados] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [idx,        setIdx]        = useState(0);
  const autoRef = useRef(null);
  const VISIBLE = 4;

  useEffect(() => {
    api.get("/productos/destacados/lista")
      .then(r => setDestacados(r.data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const maxIdx = Math.max(0, destacados.length - VISIBLE);

  const mover = (dir) => {
    setIdx(prev => Math.max(0, Math.min(maxIdx, prev + dir)));
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setIdx(p => p >= maxIdx ? 0 : p + 1), 2800);
  };

  useEffect(() => {
    if (destacados.length > VISIBLE) {
      autoRef.current = setInterval(() => setIdx(p => p >= maxIdx ? 0 : p + 1), 2800);
    }
    return () => clearInterval(autoRef.current);
  }, [destacados.length, maxIdx]);

  return (
    <section id="tienda" style={{ padding: "72px 24px", background: C.canvas }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Encabezado ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
              🛒 Nuestra Tienda
            </p>
            <h2 style={{
              margin: "0 0 8px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic", fontWeight: 600,
              fontSize: "clamp(26px,4vw,40px)",
              color: C.text, lineHeight: 1.2,
            }}>
              Productos destacados
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: C.textTer, maxWidth: 460 }}>
              Selección de los mejores productos para el cuidado y salud de tu mascota
            </p>
          </div>
          <Link
            to="/tienda"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 24px", borderRadius: 12,
              background: C.brand, color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(26,92,26,0.25)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,92,26,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,92,26,0.25)"; }}
          >
            Ver catálogo completo →
          </Link>
        </div>

        {/* ── CARRUSEL DE DESTACADOS — va primero ── */}
        {cargando ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 240, borderRadius: 14,
                background: `linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`,
                backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
              }}/>
            ))}
          </div>
        ) : destacados.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 14 }}>
              {[{ d: -1, s: "‹" }, { d: 1, s: "›" }].map(b => (
                <button
                  key={b.s}
                  onClick={() => mover(b.d)}
                  disabled={b.d === -1 ? idx === 0 : idx === maxIdx}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1.5px solid ${C.border}`,
                    background: C.surface, cursor: "pointer",
                    fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                    color: (b.d === -1 ? idx === 0 : idx === maxIdx) ? C.textMuted : C.brand,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!(b.d === -1 ? idx === 0 : idx === maxIdx)) { e.currentTarget.style.background = C.brandLight; e.currentTarget.style.borderColor = C.brandBorder; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; }}
                >{b.s}</button>
              ))}
            </div>

            <div
              style={{ overflow: "hidden" }}
              onMouseEnter={() => clearInterval(autoRef.current)}
              onMouseLeave={() => { autoRef.current = setInterval(() => setIdx(p => p >= maxIdx ? 0 : p + 1), 2800); }}
            >
              <div style={{
                display: "flex", gap: 16,
                transform: `translateX(calc(-${idx} * (100% / ${VISIBLE} + ${16 / VISIBLE}px)))`,
                transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}>
                {destacados.map(p => {
                  const precio = Number(p.variantes?.[0]?.precio ?? p.precio ?? 0);
                  const precioAntes = Number(p.variantes?.[0]?.precio_antes ?? p.precio_antes ?? 0);
                  const descuento = precioAntes > precio && precioAntes > 0
                    ? Math.round((1 - precio / precioAntes) * 100) : null;
                  return (
                    <Link
                      key={p.id}
                      to={`/producto/${p.slug}`}
                      style={{
                        flex: `0 0 calc(${100 / VISIBLE}% - ${16 * (VISIBLE - 1) / VISIBLE}px)`,
                        minWidth: 0, textDecoration: "none",
                      }}
                    >
                      <div
                        style={{
                          background: C.surface, border: `1px solid ${C.border}`,
                          borderRadius: 16, overflow: "hidden",
                          transition: "all 0.2s", position: "relative",
                          display: "flex", flexDirection: "column",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(26,92,26,0.12)"; e.currentTarget.style.borderColor = C.brandBorder; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
                      >
                        {descuento && (
                          <div style={{ position:"absolute",top:8,left:8,zIndex:2,background:"#dc2626",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6 }}>
                            -{descuento}%
                          </div>
                        )}
                        <div style={{ height: 168, background: C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {p.imagen_url
                            ? <img src={p.imagen_url} alt={p.nombre}
                                style={{ width:"100%",height:"100%",objectFit:"contain",padding:10,transition:"transform 0.3s" }}
                                onError={e => { e.target.style.display = "none"; }}
                                onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
                                onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                              />
                            : <span style={{ fontSize: 40 }}>🐾</span>}
                        </div>
                        <div style={{ padding: "12px 14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                          {p.marca && <p style={{ margin:0,fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,fontWeight:700 }}>{p.marca}</p>}
                          <p style={{ margin:0,fontSize:13,fontWeight:600,color:C.text,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
                            {p.nombre}
                          </p>
                          <div style={{ display:"flex",alignItems:"baseline",gap:6,marginTop:"auto",paddingTop:6 }}>
                            <span style={{ fontSize:16,fontWeight:800,color:C.brand,fontFamily:"'JetBrains Mono',monospace" }}>
                              ${precio.toLocaleString("es-CO")}
                            </span>
                            {precioAntes > precio && (
                              <span style={{ fontSize:11,color:C.textMuted,textDecoration:"line-through",fontFamily:"monospace" }}>
                                ${precioAntes.toLocaleString("es-CO")}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize:10,color:C.textMuted }}>+ IVA 19%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {maxIdx > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
                {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} style={{
                    width: i === idx ? 20 : 7, height: 7, borderRadius: 999, border: "none",
                    background: i === idx ? C.brand : C.border,
                    cursor: "pointer", padding: 0, transition: "all 0.3s",
                  }}/>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* ── CHIPS de categoría — pequeños y horizontales ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {CATEGORIAS_TIENDA.map(cat => (
            <Link
              key={cat.q}
              to={`/tienda?categoria=${cat.q}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 999,
                background: cat.bg, border: `1.5px solid ${cat.color}33`,
                textDecoration: "none", transition: "all 0.18s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 14px ${cat.color}22`; e.currentTarget.style.borderColor = `${cat.color}66`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${cat.color}33`; }}
            >
              <span style={{ fontSize: 15 }}>{cat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.nombre}</span>
            </Link>
          ))}
          <Link
            to="/tienda"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 999,
              background: C.brandLight, border: `1.5px solid ${C.brandBorder}`,
              textDecoration: "none", transition: "all 0.18s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.borderColor = C.brand; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.brandLight; e.currentTarget.style.borderColor = C.brandBorder; }}
          >
            <span style={{ fontSize: 15 }}>🏪</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>Ver todo</span>
          </Link>
        </div>

        {/* ── BANNER CTA — protagonismo total ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
          borderRadius: 24, padding: "40px 44px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 28,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position:"absolute",right:-30,top:-30,width:180,height:180,background:"rgba(163,230,53,0.09)",borderRadius:"50%",pointerEvents:"none" }}/>
          <div style={{ position:"absolute",left:340,bottom:-40,width:130,height:130,background:"rgba(255,255,255,0.04)",borderRadius:"50%",pointerEvents:"none" }}/>
          <div style={{ position:"relative" }}>
            <p style={{ margin:"0 0 6px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"rgba(163,230,53,0.8)" }}>
              Victoria Pecuarios
            </p>
            <h3 style={{
              margin:"0 0 10px",
              fontFamily:"'Playfair Display',Georgia,serif",
              fontStyle:"italic",fontWeight:600,
              fontSize:"clamp(22px,3vw,32px)",
              color:"#fff",lineHeight:1.2,
            }}>
              Todo lo que tu mascota necesita
            </h3>
            <p style={{ margin:0,fontSize:14,color:"rgba(255,255,255,0.65)",maxWidth:420,lineHeight:1.65 }}>
              Más de 500 productos disponibles. Medicamentos, alimentos, accesorios y equipos veterinarios con envío a toda Bogotá.
            </p>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10,alignItems:"stretch",position:"relative",minWidth:200 }}>
            <Link
              to="/tienda"
              style={{
                padding:"15px 36px",borderRadius:14,
                background:C.lime,color:C.brandDark,
                textDecoration:"none",fontSize:16,fontWeight:800,
                boxShadow:"0 6px 20px rgba(163,230,53,0.45)",
                transition:"all 0.2s",whiteSpace:"nowrap",
                textAlign:"center",letterSpacing:0.2,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04) translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(163,230,53,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1) translateY(0)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(163,230,53,0.45)"; }}
            >
              🛒 Ir a la tienda
            </Link>
            <Link
              to="/registro"
              style={{
                padding:"10px 20px",borderRadius:10,
                background:"rgba(255,255,255,0.1)",
                border:"1px solid rgba(255,255,255,0.2)",
                color:"rgba(255,255,255,0.85)",textDecoration:"none",
                fontSize:13,fontWeight:500,transition:"all 0.2s",
                textAlign:"center",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; }}
            >
              Crear cuenta gratis →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── Sección Servicios ───────────────────────────────────────────────────── */
function SeccionServicios() {
  return (
    <section id="servicios" style={{ background: C.brandDark, padding: "72px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.lime, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Nuestros servicios
          </p>
          <h2 style={{
            margin: "0 0 12px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic", fontWeight: 600,
            fontSize: "clamp(26px,4vw,40px)",
            color: "#fff",
          }}>
            Todo para el bienestar animal
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 480, marginInline: "auto" }}>
            Atención veterinaria integral con el respaldo de profesionales especializados
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {SERVICIOS.map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "28px 24px",
                transition: "all 0.25s",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = `${C.lime}33`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Línea inferior animada */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 2, background: `linear-gradient(90deg, ${C.lime}, transparent)`,
                transform: "scaleX(0)", transformOrigin: "left",
                transition: "transform 0.3s",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{s.icon}</span>
                <div style={{
                  background: "rgba(163,230,53,0.1)",
                  border: "1px solid rgba(163,230,53,0.2)",
                  borderRadius: 8, padding: "4px 10px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.lime, fontFamily: "monospace" }}>{s.stat}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.statLabel}</div>
                </div>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.titulo}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Helpers de video para la landing ──────────────────────── */
function esVideoLanding(url = "") {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") ||
         u.includes("vimeo.com")   ||
         u.endsWith(".mp4") || u.endsWith(".webm") || u.startsWith("data:video/");
}
function ytIdLanding(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
}
function ytThumbLanding(url) {
  const id = ytIdLanding(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
function ytEmbedLanding(url) {
  const id = ytIdLanding(url); return id ? `https://www.youtube.com/embed/${id}` : null;
}
function vmEmbedLanding(url) {
  const m = url.match(/vimeo\.com\/(\d+)/); return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

/* ─── Sección Galería — soporta imágenes y videos ───────────── */
function SeccionGaleria({ imagenes }) {
  const [modalVideo, setModalVideo] = useState(null);

  const defaultItems = [
    { url: imgDesinfectante, titulo: "Desinfectante veterinario", categoria: "Higiene",      esVideo: false },
    { url: imgMeloxican,     titulo: "Meloxicam — analgésico",   categoria: "Farmacología", esVideo: false },
  ];

  const items = imagenes && imagenes.length > 0 ? imagenes : defaultItems;

  return (
    <section id="galeria" style={{ background: C.canvas, padding: "72px 24px" }}>
      {/* Modal video */}
      {modalVideo && (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setModalVideo(null)}>
          <div style={{ width:"100%", maxWidth:720, borderRadius:16, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}>
            {ytEmbedLanding(modalVideo) ? (
              <iframe src={ytEmbedLanding(modalVideo) + "?autoplay=1"} width="100%" height={400}
                style={{ border:"none", display:"block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
            ) : vmEmbedLanding(modalVideo) ? (
              <iframe src={vmEmbedLanding(modalVideo) + "?autoplay=1"} width="100%" height={400}
                style={{ border:"none", display:"block" }}
                allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>
            ) : (
              <video src={modalVideo} controls autoPlay style={{ width:"100%", maxHeight:400, background:"#000", display:"block" }}/>
            )}
            <div style={{ background:"#0a0a0a", padding:"12px 16px", display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => setModalVideo(null)}
                style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Cerrar ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Galería</p>
          <h2 style={{
            margin: "0 0 10px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic", fontWeight: 600,
            fontSize: "clamp(26px,4vw,38px)", color: C.text,
          }}>
            Nuestros productos en acción
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: C.textTer }}>
            Imágenes y videos del equipo, productos e instalaciones de Victoria Pecuarios
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {items.map((im, i) => {
            const esVid = im.esVideo || esVideoLanding(im.url || "");
            const thumb = esVid ? ytThumbLanding(im.url || "") : null;

            return (
              <div
                key={i}
                onClick={() => esVid ? setModalVideo(im.url) : null}
                style={{
                  borderRadius: 16, overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  background: esVid ? "#0f0f0f" : C.surface,
                  transition: "all 0.2s",
                  cursor: esVid ? "pointer" : "default",
                  position: "relative",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(26,92,26,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Media */}
                <div style={{ height: 200, overflow: "hidden", background: esVid ? "#1a1a1a" : C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {esVid ? (
                    <>
                      {thumb
                        ? <img src={thumb} alt={im.titulo} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; }}/>
                        : <span style={{ fontSize:48, opacity:0.5 }}>🎥</span>
                      }
                      {/* Overlay play */}
                      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>▶</div>
                      </div>
                      {/* Badge video */}
                      <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.7)", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:6, textTransform:"uppercase", letterSpacing:0.8, backdropFilter:"blur(4px)" }}>
                        {(im.url||"").includes("youtube") ? "YouTube" : (im.url||"").includes("vimeo") ? "Vimeo" : "Video"}
                      </div>
                    </>
                  ) : (
                    <img
                      src={im.url}
                      alt={im.titulo || "Victoria Pecuarios"}
                      style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.35s" }}
                      onError={e => { e.target.style.display = "none"; }}
                      onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
                      onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                    />
                  )}
                </div>

                {/* Info */}
                {(im.categoria || im.titulo) && (
                  <div style={{ padding: "12px 14px", background: esVid ? "#0a0a0a" : C.surface }}>
                    {im.categoria && (
                      <span style={{ fontSize: 10, color: esVid ? "#6ee7b7" : C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {im.categoria}
                      </span>
                    )}
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: esVid ? "rgba(255,255,255,0.7)" : C.textSec, fontWeight: 500, lineHeight: 1.3 }}>
                      {im.titulo || "Victoria Pecuarios"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Blog ───────────────────────────────────────────────────────────────── */
function SeccionBlog() {
  return (
    <section id="blog" style={{ background: C.surfaceAlt, padding: "72px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Blog</p>
          <h2 style={{
            margin: "0 0 10px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic", fontWeight: 600,
            fontSize: "clamp(26px,4vw,38px)", color: C.text,
          }}>Consejos veterinarios</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
          {BLOG.map((b, i) => (
            <article
              key={i}
              style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, overflow: "hidden",
                transition: "all 0.2s", cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ height: 120, background: C.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                {b.emoji}
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{b.cat}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{b.fecha}</span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{b.titulo}</h3>
                <p style={{ margin: 0, fontSize: 13, color: C.textTer, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Contacto ───────────────────────────────────────────────────────────── */
function SeccionContacto() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 4000);
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <section id="contacto" style={{ background: C.canvas, padding: "72px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Contáctanos</p>
          <h2 style={{
            margin: "0 0 10px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic", fontWeight: 600,
            fontSize: "clamp(26px,4vw,38px)", color: C.text,
          }}>¿Tienes alguna pregunta?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, flexWrap: "wrap" }}>
          <div>
            {[
              { icon: "📍", label: "Dirección", val: "Bogotá, Colombia" },
              { icon: "📞", label: "Teléfono", val: "+57 300 000 0000" },
              { icon: "📧", label: "Correo", val: "info@victoriapecuarios.com" },
              { icon: "🕐", label: "Horario", val: "Lun–Sáb 8am – 6pm" },
            ].map(it => (
              <div key={it.label} style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: C.brandLight, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {it.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{it.label}</div>
                  <div style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>{it.val}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "nombre", placeholder: "Tu nombre", type: "text" },
              { key: "email", placeholder: "Tu correo electrónico", type: "email" },
            ].map(f => (
              <input
                key={f.key}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  padding: "12px 16px", borderRadius: 12, fontSize: 14,
                  border: `1.5px solid ${C.border}`, background: C.surface,
                  color: C.text, outline: "none", transition: "border 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = C.brand; }}
                onBlur={e => { e.target.style.borderColor = C.border; }}
              />
            ))}
            <textarea
              placeholder="¿En qué podemos ayudarte?"
              value={form.mensaje}
              onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
              rows={4}
              style={{
                padding: "12px 16px", borderRadius: 12, fontSize: 14,
                border: `1.5px solid ${C.border}`, background: C.surface,
                color: C.text, outline: "none", resize: "vertical", transition: "border 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = C.brand; }}
              onBlur={e => { e.target.style.borderColor = C.border; }}
            />
            <button
              type="submit"
              style={{
                padding: "13px 0", borderRadius: 12, border: "none",
                background: enviado ? C.brandMid : C.brand,
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {enviado ? "✓ Mensaje enviado" : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.brandDark, color: "rgba(255,255,255,0.6)", padding: "52px 24px 28px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🐾</span>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16, color: "#fff", fontStyle: "italic" }}>Victoria Pecuarios</div>
                <div style={{ fontSize: 10, color: C.lime, letterSpacing: 1.5, textTransform: "uppercase" }}>Veterinaria</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>Cuidado veterinario de calidad para tu mascota en Bogotá, Colombia.</p>
          </div>
          {[
            { titulo: "Tienda", links: ["Farmacología", "Alimentos", "Higiene", "Accesorios", "Equipos"] },
            { titulo: "Empresa", links: ["Nosotros", "Servicios", "Blog", "Contacto"] },
            { titulo: "Mi cuenta", links: ["Iniciar sesión", "Crear cuenta", "Mis pedidos", "Mi perfil"] },
          ].map(col => (
            <div key={col.titulo}>
              <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.8 }}>{col.titulo}</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize: 13, color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => { e.target.style.color = C.lime; }} onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.6)"; }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12 }}>© 2026 Victoria Pecuarios. Todos los derechos reservados.</span>
          <span style={{ fontSize: 12 }}>Bogotá, Colombia 🇨🇴</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Componente principal Landing ───────────────────────────────────────── */
export default function Landing() {
  const [galeriaImagenes, setGaleriaImagenes] = useState([]);

  useEffect(() => {
    // Intentar cargar imágenes de galería desde localStorage (admin las guarda aquí)
    try {
      const guardadas = JSON.parse(localStorage.getItem("galeria_victoria") || "[]");
      setGaleriaImagenes(guardadas);
    } catch {}
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.canvas}; }
        ::-webkit-scrollbar-thumb { background: ${C.brandBorder}; border-radius: 3px; }
      `}</style>

      <NavLanding />
      <HeroCarrusel />
      <Ticker />
      <Stats />
      <SeccionTienda />
      <SeccionServicios />
      <SeccionGaleria imagenes={galeriaImagenes} />
      <SeccionBlog />
      <SeccionContacto />
      <Footer />
    </>
  );
}