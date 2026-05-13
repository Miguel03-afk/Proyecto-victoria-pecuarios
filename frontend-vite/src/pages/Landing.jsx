// src/pages/Landing.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBone, faPills, faTags, faSoap, faStethoscope, faDrumstickBite,
  faFlask, faScissors, faTruckFast, faCalendarCheck, faCartShopping,
  faCircleCheck, faPaw, faPhone, faLocationDot, faClock,
} from "@fortawesome/free-solid-svg-icons";

import img1 from "../assets/CLINICA-1024x474.jpg";
import img2 from "../assets/Equipo-Clinica-Veterinaria-Ejea-1-480x300.jpeg";
import img3 from "../assets/funciones-veterinarios.jpg";
import img4 from "../assets/coronavirus-y-animales-como-actuar.jpg";

const SLIDES = [
  { img: img1, badge: "Clínica",      titulo: "Atención que enamora",         sub: "Instalaciones modernas para cuidar a tu mejor amigo" },
  { img: img2, badge: "Profesionales", titulo: "Veterinarios certificados",   sub: "Un equipo apasionado por la salud animal" },
  { img: img3, badge: "Servicio",     titulo: "Cuidamos cada detalle",        sub: "Desde la consulta hasta la cirugía especializada" },
  { img: img4, badge: "Prevención",   titulo: "Salud y bienestar primero",    sub: "Vacunación, control y protección integral" },
];

const CATEGORIAS = [
  { key: "alimentos",     nombre: "Alimento",     icon: faBone,  count: "5 productos"  },
  { key: "farmacologia",  nombre: "Medicamentos", icon: faPills, count: "3 productos"  },
  { key: "accesorios",    nombre: "Accesorios",   icon: faTags,  count: "18 productos" },
  { key: "higiene",       nombre: "Higiene",      icon: faSoap,  count: "12 productos" },
];

const SERVICIOS = [
  { icon: faStethoscope,   titulo: "Consulta veterinaria",  desc: "Atención profesional con vets especializados" },
  { icon: faPills,         titulo: "Farmacología animal",   desc: "Medicamentos con fórmula y de venta libre" },
  { icon: faDrumstickBite, titulo: "Nutrición personalizada", desc: "Dietas según raza, edad y condición" },
  { icon: faFlask,         titulo: "Laboratorio clínico",   desc: "Exámenes y diagnóstico veterinario" },
  { icon: faScissors,      titulo: "Peluquería canina",     desc: "Baño, corte y cuidado estético" },
  { icon: faTruckFast,     titulo: "Domicilio express",     desc: "Entregas rápidas dentro de Ibagué" },
];


/* ─── Hook reveal on scroll ──────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ─── HERO con tilt 3D y floating shapes ────────────────────────────────── */
function Hero() {
  const { C, mode } = useTheme();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const imgWrapRef = useRef(null);
  const DURACION = 5000;

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), DURACION);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  // Reiniciar timer al cambiar manualmente
  const irA = (i) => {
    setSlide(i);
    clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), DURACION);
    }
  };

  // Tilt 3D según posición del cursor sobre la imagen
  const handleMove = (e) => {
    const el = imgWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 → 0.5
    const cy = (e.clientY - r.top)  / r.height - 0.5;
    setTilt({ x: cy * -8, y: cx * 10 }); // rotación grados
  };
  const handleLeave = () => { setTilt({ x: 0, y: 0 }); setPaused(false); };
  const handleEnter = () => setPaused(true);

  const s = SLIDES[slide];

  return (
    <section style={{
      padding: '48px 24px 64px',
      background: C.canvas,
      borderBottom: `1px solid ${C.line}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Shapes flotantes decorativos (colores del logo VP) ── */}
      <div className="vp-hero-shape vp-hero-shape-1" style={{
        position: 'absolute', top: '-80px', left: '-60px',
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.brandSoft} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div className="vp-hero-shape vp-hero-shape-2" style={{
        position: 'absolute', top: '40%', right: '-100px',
        width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${mode === 'dark' ? 'rgba(244,114,182,0.10)' : 'rgba(212,69,122,0.08)'} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div className="vp-hero-shape vp-hero-shape-3" style={{
        position: 'absolute', bottom: '-100px', left: '40%',
        width: 240, height: 240, borderRadius: '50%',
        background: `radial-gradient(circle, ${mode === 'dark' ? 'rgba(96,165,250,0.10)' : 'rgba(27,79,138,0.06)'} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)',
        gap: 56, alignItems: 'center',
      }} className="vp-hero-grid">

        {/* Columna texto */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: RADIUS.pill,
            background: C.coralSoft,
            border: `1px solid ${C.coral}33`,
            marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: C.coral,
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: C.coral,
              letterSpacing: 0.3,
            }}>
              Atención veterinaria en Ibagué
            </span>
          </div>

          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 60px)',
            lineHeight: 1.05,
            letterSpacing: -0.5,
            color: C.ink,
            margin: '0 0 18px',
          }}>
            El cuidado que tu mascota{' '}
            <em style={{ color: C.brand, fontStyle: 'italic' }}>merece</em>, a la puerta de tu casa.
          </h1>

          <p style={{
            fontSize: 15, lineHeight: 1.7,
            color: C.ink3,
            margin: '0 0 32px',
            maxWidth: 520,
          }}>
            Productos veterinarios, alimento y servicios profesionales con envío gratis en toda la ciudad. Agenda tu cita en 30 segundos.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link to="/agendar-cita" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '14px 26px', borderRadius: RADIUS.sm,
              background: C.brand, color: '#fff',
              textDecoration: 'none',
              fontSize: 14, fontWeight: 700,
              boxShadow: C.shadowMd,
              transition: 'all 0.2s',
              border: 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.brandMid; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <FontAwesomeIcon icon={faCalendarCheck}/> Agendar cita
            </Link>
            <Link to="/tienda" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '14px 26px', borderRadius: RADIUS.sm,
              background: 'transparent', color: C.ink,
              textDecoration: 'none',
              fontSize: 14, fontWeight: 700,
              border: `1.5px solid ${C.lineStrong}`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.color = C.brand; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.color = C.ink; }}
            >
              <FontAwesomeIcon icon={faCartShopping}/> Ver tienda
            </Link>
          </div>

          {/* Línea divisora sutil */}
          <div style={{ width: 80, height: 1, background: C.lineStrong, margin: '0 0 28px' }} />

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { num: '12+',  label: 'años cuidando' },
              { num: '4.9★', label: '380 reseñas'   },
              { num: '<2h',  label: 'envío en Ibagué' },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: FONT.display,
                  fontSize: 28, fontWeight: 700,
                  color: C.ink, lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontSize: 11, color: C.ink3,
                  letterSpacing: 0.2,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna imagen — con tilt 3D al cursor */}
        <div
          ref={imgWrapRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onMouseMove={handleMove}
          style={{
            position: 'relative', height: 480,
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: RADIUS.xl,
            overflow: 'hidden',
            background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 18px, ${C.surfaceAlt} 18px 36px)`,
            boxShadow: tilt.x === 0 && tilt.y === 0
              ? C.shadowLg
              : `${-tilt.y * 2}px ${-tilt.x * 2}px 40px rgba(0,0,0,0.18), ${C.shadowLg}`,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}>
            {/* Barra de progreso */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 3, zIndex: 5,
              background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden',
            }}>
              <div
                key={`progress-${slide}-${paused ? 'p' : 'a'}`}
                style={{
                  height: '100%',
                  background: C.lime,
                  width: '0%',
                  animation: paused ? 'none' : `vp-progress ${DURACION}ms linear forwards`,
                }}
              />
            </div>
            {SLIDES.map((slideItem, i) => {
              const activo = i === slide;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute', inset: 0,
                    overflow: 'hidden',
                    opacity: activo ? 1 : 0,
                    transition: 'opacity 1.2s ease',
                    filter: mode === 'dark' ? 'brightness(0.85)' : 'none',
                  }}
                >
                  <img
                    src={slideItem.img}
                    alt={slideItem.titulo}
                    key={activo ? `kb-${slide}` : `kb-still-${i}`}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      animation: activo ? `vp-kenburns-${(i % 4) + 1} 8s ease-out forwards` : 'none',
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              );
            })}

            {/* Tarjeta flotante "Próxima cita disponible" */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, right: 20, maxWidth: 280,
              padding: '12px 16px',
              background: mode === 'dark' ? 'rgba(16,34,27,0.92)' : 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(12px)',
              borderRadius: RADIUS.md,
              border: `1px solid ${C.line}`,
              boxShadow: C.shadowMd,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: RADIUS.sm,
                background: C.brandSoft, color: C.brand,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>
                <FontAwesomeIcon icon={faCalendarCheck}/>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.ink3, fontWeight: 500 }}>Próxima cita disponible</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Hoy · 4:30 pm</div>
              </div>
            </div>

            {/* Pill domicilio (top-right) */}
            <div style={{
              position: 'absolute', top: 20, right: 20,
              padding: '6px 14px', borderRadius: RADIUS.pill,
              background: mode === 'dark' ? 'rgba(16,34,27,0.92)' : 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.line}`,
              fontSize: 11, fontWeight: 700, color: C.ink2,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <FontAwesomeIcon icon={faTruckFast} style={{ marginRight: 4 }}/> Domicilio en 90 min
            </div>

            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 14, right: 16,
              display: 'flex', gap: 5, zIndex: 5,
            }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => irA(i)}
                  style={{
                    width: i === slide ? 22 : 6, height: 6,
                    borderRadius: RADIUS.pill,
                    border: 'none',
                    background: i === slide ? '#fff' : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    transition: 'all 0.35s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vp-kenburns-1 { from { transform: scale(1.0) translate(0,0); } to { transform: scale(1.12) translate(-1.5%,-1%); } }
        @keyframes vp-kenburns-2 { from { transform: scale(1.0) translate(0,0); } to { transform: scale(1.10) translate(1.5%,-1%); } }
        @keyframes vp-kenburns-3 { from { transform: scale(1.0) translate(0,0); } to { transform: scale(1.13) translate(-1%,1.5%); } }
        @keyframes vp-kenburns-4 { from { transform: scale(1.0) translate(0,0); } to { transform: scale(1.10) translate(1%,1.5%); } }
        @keyframes vp-progress { from { width: 0%; } to { width: 100%; } }
        @keyframes vp-float-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(40px,30px) scale(1.08); }
        }
        @keyframes vp-float-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-50px,-25px) scale(1.12); }
        }
        @keyframes vp-float-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(30px,-40px) scale(0.95); }
        }
        .vp-hero-shape-1 { animation: vp-float-1 14s ease-in-out infinite; }
        .vp-hero-shape-2 { animation: vp-float-2 18s ease-in-out infinite; }
        .vp-hero-shape-3 { animation: vp-float-3 16s ease-in-out infinite; }
        @keyframes vp-stagger {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vp-hero-text > * { animation: vp-stagger 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .vp-hero-text > *:nth-child(1) { animation-delay: 0.05s; }
        .vp-hero-text > *:nth-child(2) { animation-delay: 0.18s; }
        .vp-hero-text > *:nth-child(3) { animation-delay: 0.30s; }
        .vp-hero-text > *:nth-child(4) { animation-delay: 0.42s; }
        .vp-hero-text > *:nth-child(5) { animation-delay: 0.55s; }
        .vp-hero-text > *:nth-child(6) { animation-delay: 0.65s; }
        @keyframes vp-gradient-text {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        .vp-titulo-gradient {
          background: linear-gradient(90deg, currentColor 0%, currentColor 30%, ${C.brand} 50%, currentColor 70%, currentColor 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: vp-gradient-text 6s ease infinite;
        }
        @keyframes vp-imgIn {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .vp-hero-img-wrap { animation: vp-imgIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        @media (max-width: 900px) {
          .vp-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .vp-hero-grid > div:nth-child(2) { height: 360px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-hero-shape-1, .vp-hero-shape-2, .vp-hero-shape-3 { animation: none !important; }
          .vp-hero-text > *, .vp-hero-img-wrap { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── Categorías ─────────────────────────────────────────────────────────── */
function Categorias() {
  const { C } = useTheme();
  const [ref, vis] = useReveal();

  return (
    <section ref={ref} style={{
      padding: '72px 24px',
      background: C.canvas,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{
            fontFamily: FONT.display,
            fontSize: 32, fontWeight: 700,
            color: C.ink, margin: 0,
            letterSpacing: -0.3,
          }}>
            Compra por categoría
          </h2>
          <Link to="/tienda" style={{
            fontSize: 13, color: C.brand,
            textDecoration: 'none', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            Ver todo →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {CATEGORIAS.map(cat => (
            <Link
              key={cat.key}
              to={`/tienda?categoria=${cat.key}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '20px 22px',
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: RADIUS.lg,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = C.brandBorder;
                e.currentTarget.style.boxShadow = C.shadowMd;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = C.line;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: RADIUS.md,
                background: C.coralSoft,
                color: C.coral,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={cat.icon}/>
              </div>
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: C.ink,
                  marginBottom: 2,
                }}>
                  {cat.nombre}
                </div>
                <div style={{ fontSize: 11, color: C.ink3 }}>
                  {cat.count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Productos destacados (carrusel auto-scroll horizontal) ─────────────── */
function Destacados() {
  const { C } = useTheme();
  const [productos, setProductos] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [paused, setPaused] = useState(false);
  const [ref, vis] = useReveal();
  const trackRef = useRef(null);

  useEffect(() => {
    api.get('/productos/destacados/lista')
      .then(r => setProductos(r.data || []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, []);

  // Auto-scroll horizontal del carrusel
  useEffect(() => {
    if (paused || productos.length === 0) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 260, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(id);
  }, [paused, productos.length]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section ref={ref} style={{
      padding: '24px 24px 80px',
      background: C.canvas,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: C.coral,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Más vendidos
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{
            fontFamily: FONT.display,
            fontSize: 32, fontWeight: 700,
            color: C.ink, margin: 0,
            letterSpacing: -0.3,
          }}>
            Lo que más quieren
          </h2>

          {productos.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => scrollBy(-1)} title="Anterior"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surface, color: C.ink2,
                  cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.brandSoft; e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.color = C.brand; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.color = C.ink2; }}>
                ‹
              </button>
              <button onClick={() => scrollBy(1)} title="Siguiente"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surface, color: C.ink2,
                  cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.brandSoft; e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.color = C.brand; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.color = C.ink2; }}>
                ›
              </button>
            </div>
          )}
        </div>

        {cargando ? (
          <div style={{ display: 'flex', gap: 18, overflow: 'hidden' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                minWidth: 240, height: 320,
                borderRadius: RADIUS.lg,
                background: `linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.surface} 50%, ${C.surfaceAlt} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'vp-shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: RADIUS.lg,
            color: C.ink3,
          }}>
            No hay productos destacados disponibles por ahora.
          </div>
        ) : (
          <div
            ref={trackRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="vp-carrusel-destacados"
            style={{
              display: 'flex',
              gap: 18,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              paddingBottom: 12,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {productos.map(p => (
              <div key={p.id} style={{
                minWidth: 240, maxWidth: 240,
                scrollSnapAlign: 'start',
                flexShrink: 0,
              }}>
                <ProductCard producto={p} />
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/tienda" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: RADIUS.sm,
            background: 'transparent', color: C.ink,
            textDecoration: 'none',
            fontSize: 13, fontWeight: 700,
            border: `1.5px solid ${C.lineStrong}`,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.color = C.brand; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.color = C.ink; }}
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes vp-shimmer { to { background-position: -200% 0; } }
        .vp-carrusel-destacados::-webkit-scrollbar { height: 8px; }
        .vp-carrusel-destacados::-webkit-scrollbar-track { background: transparent; }
        .vp-carrusel-destacados::-webkit-scrollbar-thumb { background: ${C.lineStrong}; border-radius: 4px; }
      `}</style>
    </section>
  );
}

/* ─── Helpers de medios (alineados con GaleriaAdmin) ─────────────────────── */
const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytEmbed     = (url) => { const id = ytId(url); return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null; };
const ytThumbnail = (url) => { const id = ytId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; };
const vmId = (url = "") => { const m = url.match(/vimeo\.com\/(\d+)/); return m ? m[1] : null; };
const vmEmbed = (url) => { const id = vmId(url); return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null; };

const STORAGE_KEY_GAL = "galeria_victoria";

/* ─── Galería (Masonry — conectada con admin localStorage) ───────────────── */
function Galeria() {
  const { C } = useTheme();
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [lightbox, setLightbox] = useState(null);

  const cargar = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GAL);
      const arr = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr : []);
    } catch { setItems([]); }
  };

  useEffect(() => { cargar(); }, []);

  // Refrescar: storage event (otros tabs) + foco (mismo tab) + poll cada 3s
  useEffect(() => {
    const onFocus = () => cargar();
    window.addEventListener("storage", cargar);
    window.addEventListener("focus", onFocus);
    const id = setInterval(cargar, 3000);
    return () => {
      window.removeEventListener("storage", cargar);
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, []);

  // Si no hay items, no renderizar la sección
  if (items.length === 0) return null;

  const categorias = ["todas", ...Array.from(new Set(items.map(i => i.categoria).filter(Boolean)))];
  const visibles = filtro === "todas" ? items : items.filter(i => i.categoria === filtro);

  /* Calcular thumbnail según tipo de medio */
  const getThumb = (it) => {
    if (!it.esVideo) return { type: "img",  src: it.url };
    const ytT = ytThumbnail(it.url);
    if (ytT) return { type: "img", src: ytT, isVideo: true };
    if (vmId(it.url)) return { type: "iframe", src: vmEmbed(it.url), isVideo: true };
    return { type: "video", src: it.url, isVideo: true };
  };

  /* Render del lightbox según tipo */
  const renderLightbox = (it) => {
    if (!it.esVideo) {
      return (
        <img src={it.url} alt={it.titulo || ""}
          style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: RADIUS.lg, objectFit: "contain" }}/>
      );
    }
    const yt = ytEmbed(it.url);
    if (yt) return (
      <iframe src={yt} title={it.titulo || "Video"}
        allow="autoplay; encrypted-media; fullscreen"
        style={{ width: "min(90vw, 960px)", aspectRatio: "16/9", borderRadius: RADIUS.lg, border: "none" }}/>
    );
    const vm = vmEmbed(it.url);
    if (vm) return (
      <iframe src={vm} title={it.titulo || "Video"}
        allow="autoplay; fullscreen"
        style={{ width: "min(90vw, 960px)", aspectRatio: "16/9", borderRadius: RADIUS.lg, border: "none" }}/>
    );
    return (
      <video src={it.url} controls autoPlay
        style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: RADIUS.lg }}/>
    );
  };

  return (
    <section style={{
      padding: '72px 24px',
      background: C.surface,
      borderTop: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 28px' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: C.coral,
            letterSpacing: 1.5, textTransform: 'uppercase',
            display: 'block', marginBottom: 8,
          }}>
            Galería
          </span>
          <h2 style={{
            fontFamily: FONT.display, fontStyle: 'italic',
            fontWeight: 600, fontSize: 'clamp(28px, 4vw, 38px)',
            color: C.ink, margin: '0 0 10px',
            letterSpacing: -0.3,
          }}>
            Pacientes felices, momentos que valen
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.ink3, lineHeight: 1.55 }}>
            Algunas de las mascotas que han pasado por nuestra clínica.
          </p>
        </div>

        {categorias.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
            {categorias.map(cat => {
              const activo = filtro === cat;
              return (
                <button key={cat} onClick={() => setFiltro(cat)} style={{
                  padding: '6px 14px', borderRadius: RADIUS.pill,
                  background: activo ? C.ink : 'transparent',
                  color: activo ? C.canvas : C.ink2,
                  border: `1px solid ${activo ? C.ink : C.lineStrong}`,
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                  fontFamily: FONT.ui,
                }}>{cat}</button>
              );
            })}
          </div>
        )}

        {/* Masonry CSS columns */}
        <div className="vp-masonry" style={{
          columnCount: 4,
          columnGap: 14,
        }}>
          {visibles.map((it, i) => {
            const thumb = getThumb(it);
            return (
              <div key={it.id || i}
                onClick={() => setLightbox(it)}
                className="vp-galeria-item"
                style={{
                  breakInside: 'avoid',
                  marginBottom: 14,
                  borderRadius: RADIUS.lg,
                  overflow: 'hidden',
                  background: C.surfaceAlt,
                  border: `1px solid ${C.line}`,
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative',
                  display: 'block',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = C.shadowMd; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {thumb.type === "img" ? (
                  <img
                    src={thumb.src}
                    alt={it.titulo || ''}
                    loading="lazy"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                    onError={e => {
                      // Si la imagen falla, mostrar placeholder con título
                      e.target.outerHTML = `<div style="aspect-ratio:4/3;background:${C.brandSoft};display:flex;align-items:center;justify-content:center;color:${C.muted};font-size:13px;font-family:monospace;">imagen no disponible</div>`;
                    }}
                  />
                ) : thumb.type === "video" ? (
                  <video
                    src={thumb.src}
                    muted preload="metadata"
                    style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4 / 3' }}
                  />
                ) : (
                  <div style={{
                    aspectRatio: '16 / 9',
                    background: C.surfaceAlt,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.muted,
                  }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace' }}>video</span>
                  </div>
                )}

                {/* Overlay play para videos */}
                {it.esVideo && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45))',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, paddingLeft: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}>▶</div>
                  </div>
                )}

                {(it.titulo || it.categoria) && (
                  <div style={{
                    padding: '10px 14px',
                  }}>
                    {it.categoria && (
                      <p style={{
                        margin: '0 0 2px', fontSize: 9, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1.2,
                        color: C.muted, fontFamily: FONT.mono,
                      }}>
                        {it.categoria}
                      </p>
                    )}
                    {it.titulo && (
                      <p style={{
                        margin: 0, fontSize: 12, color: C.ink2, fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {it.titulo}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, cursor: 'zoom-out',
            }}>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', textAlign: 'center' }}>
              {renderLightbox(lightbox)}
              {(lightbox.titulo || lightbox.descripcion) && (
                <div style={{ marginTop: 14, color: '#fff', maxWidth: 640, marginInline: 'auto' }}>
                  {lightbox.titulo && (
                    <p style={{
                      margin: 0, fontFamily: FONT.display, fontStyle: 'italic',
                      fontWeight: 600, fontSize: 18,
                    }}>
                      {lightbox.titulo}
                    </p>
                  )}
                  {lightbox.descripcion && (
                    <p style={{
                      margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)',
                      fontFamily: FONT.ui, lineHeight: 1.55,
                    }}>
                      {lightbox.descripcion}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setLightbox(null)} style={{
              position: 'absolute', top: 20, right: 20,
              width: 42, height: 42, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 20, cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}>×</button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .vp-masonry { column-count: 3 !important; } }
        @media (max-width: 700px)  { .vp-masonry { column-count: 2 !important; } }
        @media (max-width: 420px)  { .vp-masonry { column-count: 1 !important; } }
      `}</style>
    </section>
  );
}

/* ─── Servicios ──────────────────────────────────────────────────────────── */
function Servicios() {
  const { C } = useTheme();
  const [ref, vis] = useReveal();

  return (
    <section id="servicios" ref={ref} style={{
      padding: '72px 24px',
      background: C.surface,
      borderTop: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      scrollMarginTop: 140,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div style={{ marginBottom: 32, maxWidth: 580 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: C.brand,
            letterSpacing: 1, textTransform: 'uppercase',
            display: 'block', marginBottom: 8,
          }}>
            Nuestros servicios
          </span>
          <h2 style={{
            fontFamily: FONT.display,
            fontSize: 32, fontWeight: 700,
            color: C.ink, margin: '0 0 10px',
            letterSpacing: -0.3,
          }}>
            Todo lo que tu mascota necesita en un solo lugar
          </h2>
          <p style={{ fontSize: 14, color: C.ink3, lineHeight: 1.6, margin: 0 }}>
            Combinamos atención clínica profesional con productos certificados y servicios complementarios.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {SERVICIOS.map((s, i) => (
            <div key={s.titulo} style={{
              padding: '22px 22px 24px',
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: RADIUS.lg,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = C.shadowSm; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: RADIUS.md,
                background: C.brandSoft,
                color: C.brand,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                marginBottom: 14,
              }}>
                <FontAwesomeIcon icon={s.icon}/>
              </div>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: C.ink, margin: '0 0 6px',
              }}>
                {s.titulo}
              </h3>
              <p style={{ fontSize: 13, color: C.ink3, margin: 0, lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA final ──────────────────────────────────────────────────────────── */
function CtaFinal() {
  const { C, mode } = useTheme();
  return (
    <section style={{
      padding: '64px 24px',
      background: C.brandDark,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        textAlign: 'center', position: 'relative', zIndex: 2,
      }}>
        <h2 style={{
          fontFamily: FONT.display,
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          margin: '0 0 14px',
          lineHeight: 1.15,
        }}>
          Tu mascota merece el mejor cuidado.
        </h2>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.75)',
          margin: '0 0 32px', lineHeight: 1.6,
        }}>
          Agenda tu próxima consulta o explora nuestra tienda completa.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/agendar-cita" style={{
            padding: '14px 28px', borderRadius: RADIUS.sm,
            background: C.lime, color: '#06170F',
            textDecoration: 'none',
            fontSize: 14, fontWeight: 800,
          }}>
            <FontAwesomeIcon icon={faCalendarCheck}/> Reservar consulta
          </Link>
          <Link to="/tienda" style={{
            padding: '14px 28px', borderRadius: RADIUS.sm,
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid rgba(255,255,255,0.2)`,
            color: '#fff',
            textDecoration: 'none',
            fontSize: 14, fontWeight: 600,
          }}>
            Ver tienda
          </Link>
        </div>
      </div>

      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -120, right: -100,
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(122,193,67,0.08)',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(122,193,67,0.05)',
      }} />
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  const { C } = useTheme();
  return (
    <footer id="nosotros" style={{
      padding: '40px 24px 24px',
      background: C.surface,
      borderTop: `1px solid ${C.line}`,
      scrollMarginTop: 140,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 28,
          marginBottom: 28,
        }}>
          <div>
            <div style={{
              fontFamily: FONT.display,
              fontStyle: 'italic',
              fontWeight: 600, fontSize: 18,
              color: C.brand,
              marginBottom: 8,
            }}>
              Victoria·Pets
            </div>
            <p style={{ fontSize: 12, color: C.ink3, margin: 0, lineHeight: 1.6 }}>
              Veterinaria y tienda de productos para mascotas en Ibagué, Tolima.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: C.ink2, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Navegar</h4>
            {[
              { to: '/',             label: 'Inicio' },
              { to: '/tienda',       label: 'Tienda' },
              { to: '/agendar-cita', label: 'Agendar cita' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', padding: '4px 0',
                fontSize: 13, color: C.ink3,
                textDecoration: 'none',
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: C.ink2, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Contacto</h4>
            <p style={{ fontSize: 12, color: C.ink3, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faPhone} style={{ fontSize: 10, color: C.brand, width: 12 }}/>
              +57 310 555 4321
            </p>
            <p style={{ fontSize: 12, color: C.ink3, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10, color: C.brand, width: 12 }}/>
              Cra. 5 #34-12, Ibagué
            </p>
            <p style={{ fontSize: 12, color: C.ink3, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: 10, color: C.brand, width: 12 }}/>
              Lun–Sáb 8:00–19:00
            </p>
          </div>
        </div>

        <div style={{
          paddingTop: 20,
          borderTop: `1px solid ${C.line}`,
          textAlign: 'center',
          fontSize: 11,
          color: C.muted,
        }}>
          © 2026 Victoria Pets · Ibagué, Tolima 🇨🇴 · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function Landing() {
  const { C } = useTheme();
  const location = useLocation();

  // Scroll a anchor cuando la URL trae #servicios o #nosotros (incluso desde otra página)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      // Esperar a que renderice todo antes de scrollear
      const tryScroll = (intentos = 0) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (intentos < 10) {
          setTimeout(() => tryScroll(intentos + 1), 80);
        }
      };
      tryScroll();
    }
  }, [location.hash, location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ minHeight: '100vh', background: C.canvas, color: C.ink, fontFamily: FONT.ui }}>
        <Navbar />
        <Hero />
        <Categorias />
        <Destacados />
        <Galeria />
        <Servicios />
        <CtaFinal />
        <Footer />
      </div>
    </>
  );
}
