import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope, faPills, faDrumstickBite, faMicroscope, faScissors, faTruck,
  faSoap, faTags, faBone, faStore, faImages, faNewspaper, faPhone,
  faCartShopping, faCalendarDays, faLocationDot, faEnvelope, faClock,
  faUser, faBoxOpen, faPlus, faReceipt, faGear, faCheck, faArrowRight, faPaw, faSyringe,
  faChevronLeft, faChevronRight, faStar, faFire, faBolt, faGift,
} from "@fortawesome/free-solid-svg-icons";

import img1 from "../assets/carrusel_proyecto2.jpg";
import img2 from "../assets/carrusel1_proyecto2.jpg";
import img3 from "../assets/carrusel2_proyecto2.jpg";
import img4 from "../assets/carrusel3_proyecto2.jpg";
import imgDesinfectante from "../assets/desinfectante.png";
import imgMeloxican from "../assets/meloxican.jpg";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

/* ─── Paleta VP — sistema unificado verde VP ─────────────────────────────── */
const C = {
  // Verde esmeralda profundo — identidad clínica VP
  brand:       "#0A6B40",
  brandMid:    "#138553",
  brandDark:   "#064E30",
  brandLight:  "#E4F5EC",
  brandBorder: "#95CCAD",

  // Naranja cálido — energía, calidez, impulso de compra
  coral:       "#f97316",
  coralDark:   "#c2410c",
  coralLight:  "#fff7ed",
  coralBorder: "#fed7aa",

  // Lima VP — acción de compra principal
  lime:        "#7AC143",
  limeDark:    "#5a9030",
  limeLight:   "#eef7e3",

  // Ámbar — destacados
  amber:       "#f59e0b",
  amberLight:  "#fffbeb",

  // Rojo — descuentos urgentes
  red:         "#dc2626",
  redLight:    "#fef2f2",

  // Azul — info/confianza (solo soporte, no dominante)
  blue:        "#1B4F8A",
  blueMid:     "#2563EB",
  blueLight:   "#dce8f7",
  blueBorder:  "#93c5fd",

  // Rosa — calidez VP del logo, CTAs emocionales
  rose:        "#D4457A",
  roseMid:     "#E8608A",
  roseDark:    "#A83260",
  roseLight:   "#FFF0F5",
  roseBorder:  "#F9C0D0",

  // Superficies — Green-breath canvas
  canvas:      "#F5FAF7",
  surface:     "#ffffff",
  surfaceAlt:  "#EDF6F1",
  surfaceHov:  "#dff0e6",

  // Texto — temperatura verde
  text:        "#101F16",
  textSec:     "#2D4A38",
  textTer:     "#5A7A65",
  textMuted:   "#8FAA98",

  border:      "rgba(0,0,0,0.07)",
};

const SLIDES = [
  { img: img1, titulo: "Salud Animal de Primera",  sub: "Medicamentos y vacunas certificadas para tu mascota",  badge: "Farmacología" },
  { img: img2, titulo: "Nutrición que Cuida",       sub: "Alimentos balanceados para todas las especies",         badge: "Nutrición" },
  { img: img3, titulo: "Higiene y Bienestar",       sub: "Productos de aseo profesional para mascotas",           badge: "Higiene" },
  { img: img4, titulo: "Equipo Veterinario",         sub: "Instrumentos y equipos para profesionales",             badge: "Equipos" },
];

const SERVICIOS = [
  { fa: faStethoscope,   titulo: "Consulta Veterinaria",   desc: "Atención profesional con veterinarios especializados", stat: "24h",  color: C.brand },
  { fa: faPills,         titulo: "Farmacología Animal",     desc: "Medicamentos con fórmula y de venta libre",            stat: "200+", color: C.coral },
  { fa: faDrumstickBite, titulo: "Nutrición Especializada", desc: "Dietas personalizadas según raza y edad",              stat: "50+",  color: C.amber },
  { fa: faMicroscope,    titulo: "Laboratorio Clínico",     desc: "Exámenes y diagnóstico veterinario completo",          stat: "48h",  color: C.blue },
  { fa: faScissors,      titulo: "Peluquería Canina",       desc: "Baño, corte y cuidado estético profesional",           stat: "5★",   color: C.rose },
  { fa: faTruck,         titulo: "Domicilio Express",        desc: "Entregas rápidas dentro de Ibagué",                    stat: "Free", color: C.lime },
];

const CATEGORIAS_TIENDA = [
  { fa: faPills,         nombre: "Farmacología", color: "#065f46", bg: "#d1fae5", q: "farmacologia" },
  { fa: faBone,          nombre: "Alimentos",    color: "#92400e", bg: "#fef3c7", q: "alimentos" },
  { fa: faSoap,          nombre: "Higiene",      color: "#1e40af", bg: "#dbeafe", q: "higiene" },
  { fa: faTags,          nombre: "Accesorios",   color: "#6b21a8", bg: "#f3e8ff", q: "accesorios" },
  { fa: faMicroscope,    nombre: "Equipos",      color: "#0e7490", bg: "#cffafe", q: "equipos" },
  { fa: faScissors,      nombre: "Peluquería",   color: "#be185d", bg: "#fce7f3", q: "peluqueria" },
];

const BLOG = [
  { cat: "Salud",    titulo: "¿Cada cuánto debe vacunarse mi mascota?",           desc: "Guía completa del calendario de vacunación para perros y gatos en Colombia.", fecha: "02 abr 2026", fa: faSyringe,       accent: C.blue },
  { cat: "Nutrición",titulo: "Cómo elegir el mejor alimento para tu perro",       desc: "Factores clave: raza, tamaño, edad y condición de salud.",                   fecha: "28 mar 2026", fa: faDrumstickBite,  accent: C.brand },
  { cat: "Cuidado",  titulo: "Señales de que tu mascota necesita al veterinario", desc: "10 síntomas que no debes ignorar en perros y gatos.",                        fecha: "20 mar 2026", fa: faPaw,            accent: C.rose },
];

/* ─── Hook de reveal al hacer scroll ─────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ─── Chip de usuario según rol ──────────────────────────────────────────── */
function chipRol(u) {
  const r = u?.rol;
  if (r === "superadmin" || r === "admin")
    return { label: `Admin · ${u.nombre}`, destino: "/admin",       bg: C.amberLight,  border: C.amber,  color: "#92400e", fa: faGear };
  if (r === "cajero")
    return { label: `Caja · ${u.nombre}`,  destino: "/cajero",      bg: C.amberLight,  border: C.amber,  color: "#78350f", fa: faReceipt };
  if (r === "veterinario")
    return { label: `Vet · ${u.nombre}`,   destino: "/veterinario", bg: C.brandLight,  border: C.brand,  color: C.brandDark, fa: faStethoscope };
  return { label: `Hola, ${u.nombre}`,     destino: "/perfil",      bg: "rgba(255,255,255,0.15)", border: "rgba(255,255,255,0.3)", color: "#fff", fa: null };
}

/* ─── Navbar Landing ─────────────────────────────────────────────────────── */
function NavLanding() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuAbierto,  setMenuAbierto]  = useState(false);
  const { usuario, logout } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuAbierto]);

  const cerrar = () => setMenuAbierto(false);
  const chip   = usuario ? chipRol(usuario) : null;

  const navBg = scrolled
    ? "rgba(6,78,59,0.97)"   // verde oscuro esmeralda
    : "transparent";

  const NAV = [
    { href: "#tienda",    label: "Tienda",    fa: faStore },
    { href: "#servicios", label: "Servicios", fa: faStethoscope },
    { href: "#galeria",   label: "Galería",   fa: faImages },
    { href: "#blog",      label: "Blog",      fa: faNewspaper },
    { href: "#contacto",  label: "Contacto",  fa: faPhone },
  ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: navBg,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(110,231,183,0.15)" : "none",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <img src={logoVP} alt="Victoria Pets"
                style={{ height: 42, width: 42, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }}
              />
              <span style={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, background: C.lime, borderRadius: "50%", border: "2px solid rgba(6,78,59,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: C.brandDark }}>✓</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.1, letterSpacing: -0.3 }}>
                Victoria Pets
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.lime, letterSpacing: 2, textTransform: "uppercase", opacity: 0.9 }}>
                Veterinaria · Ibagué
              </div>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="vp-nav-links" style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {NAV.map(l => (
              <a key={l.href} href={l.href} onClick={cerrar}
                style={{ padding: "7px 14px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", transition: "all 0.18s", letterSpacing: 0.1 }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(255,255,255,0.82)"; }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Derecha */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

            {/* Chip usuario (rol-aware) */}
            {chip && (
              <button onClick={() => navigate(chip.destino)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px 6px 7px", borderRadius: 999, cursor: "pointer", background: chip.bg, border: `1.5px solid ${chip.border}`, color: chip.color, fontSize: 12, fontWeight: 700, transition: "all 0.18s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                  {chip.fa ? <FontAwesomeIcon icon={chip.fa} /> : usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="vp-chip-label">{chip.label}</span>
              </button>
            )}

            {/* CTA tienda */}
            <Link to="/tienda" className="vp-cta-desktop"
              style={{ padding: "9px 20px", borderRadius: 10, background: C.lime, color: C.brandDark, textDecoration: "none", fontSize: 13, fontWeight: 800, border: `2px solid ${C.limeDark}`, transition: "all 0.18s", whiteSpace: "nowrap", letterSpacing: 0.2 }}
              onMouseEnter={e => { e.currentTarget.style.background = C.limeDark; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.lime; e.currentTarget.style.color = C.brandDark; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <FontAwesomeIcon icon={faCartShopping} style={{ marginRight: 7 }} /> Ver tienda
            </Link>

            {/* Hamburguesa — 3 líneas → X animado */}
            <button onClick={() => setMenuAbierto(v => !v)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              style={{ width: 44, height: 44, borderRadius: 12, padding: 0, background: menuAbierto ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.22)", cursor: "pointer", transition: "all 0.22s", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 5 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = menuAbierto ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: 20, height: 2.5, borderRadius: 2, background: "#fff",
                  transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
                  transform: menuAbierto
                    ? i === 0 ? "translateY(7.5px) rotate(45deg)"
                    : i === 2 ? "translateY(-7.5px) rotate(-45deg)"
                    : "scaleX(0) rotate(0)"
                    : "none",
                  opacity: menuAbierto && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay fondo ──────────────────────────────────────────────────── */}
      <div onClick={cerrar} style={{
        position: "fixed", inset: 0, zIndex: 210,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        opacity: menuAbierto ? 1 : 0,
        pointerEvents: menuAbierto ? "auto" : "none",
        transition: "opacity 0.38s ease",
      }} />

      {/* ── Panel full-screen desde la derecha ─────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 220,
        width: "min(420px, 92vw)",
        background: `linear-gradient(160deg, ${C.brandDark} 0%, #0a3d2e 50%, #052e1f 100%)`,
        borderLeft: "1px solid rgba(110,231,183,0.12)",
        display: "flex", flexDirection: "column",
        transform: menuAbierto ? "translateX(0)" : "translateX(105%)",
        transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto", overflowX: "hidden",
      }}>
        {/* Decorativo círculo verde */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(5,150,105,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 60, left: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(132,204,22,0.07)", pointerEvents: "none" }} />

        {/* Cabecera */}
        <div style={{ padding: "22px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(110,231,183,0.1)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logoVP} alt="Victoria Pets" style={{ height: 40, width: 40, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(110,231,183,0.3)" }} />
            <div>
              <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.2 }}>Victoria Pets</p>
              <p style={{ margin: 0, fontSize: 9, color: C.lime, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>Veterinaria · Ibagué</p>
            </div>
          </div>
          <button onClick={cerrar}
            style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >×</button>
        </div>

        {/* Usuario */}
        {usuario ? (
          <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid rgba(110,231,183,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 14, background: "rgba(5,150,105,0.15)", border: "1px solid rgba(110,231,183,0.18)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0, border: "2px solid rgba(110,231,183,0.3)" }}>
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#fff" }}>{usuario.nombre} {usuario.apellido}</p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{usuario.email}</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 9px", borderRadius: 999, background: "rgba(132,204,22,0.2)", color: C.lime, textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>
                {usuario.rol}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid rgba(110,231,183,0.1)", display: "flex", gap: 10 }}>
            <Link to="/login" onClick={cerrar} style={{ flex: 1, textAlign: "center", padding: "11px 0", borderRadius: 11, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              Iniciar sesión
            </Link>
            <Link to="/registro" onClick={cerrar} style={{ flex: 1, textAlign: "center", padding: "11px 0", borderRadius: 11, background: `linear-gradient(135deg, ${C.lime}, ${C.limeDark})`, border: "none", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 800 }}>
              Crear cuenta
            </Link>
          </div>
        )}

        {/* Navegación principal — ítems grandes */}
        <div style={{ padding: "18px 16px 0" }}>
          <p style={{ margin: "0 8px 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(110,231,183,0.5)" }}>Navegar</p>
          {NAV.map((l, idx) => (
            <a key={l.href} href={l.href} onClick={cerrar}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 14px", borderRadius: 12, textDecoration: "none",
                color: "rgba(255,255,255,0.82)", fontSize: 16, fontWeight: 600,
                transition: "all 0.2s", marginBottom: 4,
                borderLeft: "3px solid transparent",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,0.2)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderLeftColor = C.lime; e.currentTarget.style.paddingLeft = "18px"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.82)"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.paddingLeft = "14px"; }}
            >
              <span style={{ fontSize: 16, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={l.fa} /></span>
              {l.label}
            </a>
          ))}
        </div>

        {/* Categorías rápidas */}
        <div style={{ padding: "16px 24px 0", borderTop: "1px solid rgba(110,231,183,0.1)", marginTop: 8 }}>
          <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(110,231,183,0.5)" }}>Categorías</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIAS_TIENDA.map(cat => (
              <Link key={cat.q} to={`/tienda?categoria=${cat.q}`} onClick={cerrar}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 12, fontWeight: 600, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = cat.bg + "33"; e.currentTarget.style.borderColor = cat.color + "55"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
              >
                <FontAwesomeIcon icon={cat.fa} /> {cat.nombre}
              </Link>
            ))}
          </div>
        </div>

        {/* Mi cuenta (si autenticado) */}
        {usuario && (
          <div style={{ padding: "16px 16px 0", borderTop: "1px solid rgba(110,231,183,0.1)", marginTop: 12 }}>
            <p style={{ margin: "0 8px 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(110,231,183,0.5)" }}>Mi cuenta</p>
            {[
              { to: "/perfil",       label: "Mi perfil",    fa: faUser },
              { to: "/mis-ordenes",  label: "Mis órdenes",  fa: faBoxOpen },
              { to: "/mis-citas",    label: "Mis citas",    fa: faCalendarDays },
              { to: "/agendar-cita", label: "Agendar cita", fa: faPlus },
            ].map(it => (
              <Link key={it.to} to={it.to} onClick={cerrar}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 12, textDecoration: "none", color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, transition: "all 0.18s", marginBottom: 3, borderLeft: "3px solid transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderLeftColor = C.brandMid; e.currentTarget.style.paddingLeft = "18px"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.paddingLeft = "14px"; }}
              >
                <span style={{ fontSize: 15, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={it.fa} /></span>
                {it.label}
              </Link>
            ))}

            {usuario.rol === "veterinario" && (
              <Link to="/veterinario" onClick={cerrar}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 12, textDecoration: "none", color: C.lime, fontSize: 14, fontWeight: 700, transition: "all 0.18s", marginBottom: 3, borderLeft: "3px solid transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,204,22,0.1)"; e.currentTarget.style.borderLeftColor = C.lime; e.currentTarget.style.paddingLeft = "18px"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.paddingLeft = "14px"; }}
              >
                <span style={{ fontSize: 15, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={faStethoscope} /></span> Panel veterinario
              </Link>
            )}
            {usuario.rol === "cajero" && (
              <Link to="/cajero" onClick={cerrar}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 12, textDecoration: "none", color: C.amber, fontSize: 14, fontWeight: 700, transition: "all 0.18s", marginBottom: 3, borderLeft: "3px solid transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.borderLeftColor = C.amber; e.currentTarget.style.paddingLeft = "18px"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.paddingLeft = "14px"; }}
              >
                <span style={{ fontSize: 15, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={faReceipt} /></span> Punto de venta
              </Link>
            )}
            {(usuario.rol === "admin" || usuario.rol === "superadmin") && (
              <Link to="/admin" onClick={cerrar}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 12, textDecoration: "none", color: C.amber, fontSize: 14, fontWeight: 700, transition: "all 0.18s", marginBottom: 3, borderLeft: "3px solid transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.borderLeftColor = C.amber; e.currentTarget.style.paddingLeft = "18px"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.paddingLeft = "14px"; }}
              >
                <span style={{ fontSize: 15, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><FontAwesomeIcon icon={faGear} /></span> Panel admin
              </Link>
            )}
          </div>
        )}

        {/* Pie del panel */}
        <div style={{ marginTop: "auto", padding: "20px 24px", borderTop: "1px solid rgba(110,231,183,0.1)" }}>
          {usuario ? (
            <button onClick={() => { logout(); cerrar(); }}
              style={{ width: "100%", padding: "12px 0", borderRadius: 11, background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", color: "#fca5a5", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.12)"; }}
            >
              Cerrar sesión
            </button>
          ) : (
            <Link to="/tienda" onClick={cerrar}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", padding: "13px 0", borderRadius: 11, background: `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 800, border: `1px solid ${C.brandBorder}33` }}>
              <FontAwesomeIcon icon={faCartShopping} /> Ir a la tienda
            </Link>
          )}
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            © 2026 Victoria Pets · Ibagué, Tolima 🇨🇴
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Hero carrusel — infinite horizontal slide + Ken Burns + hover-pause ── */
function HeroCarrusel() {
  const N = SLIDES.length;
  const extended = [SLIDES[N - 1], ...SLIDES, SLIDES[0]];

  const [idx,      setIdx]      = useState(1);
  const [animated, setAnimated] = useState(true);
  const timerRef  = useRef(null);

  const INTERVAL = 4000;

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => i + 1), INTERVAL);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const onTransitionEnd = () => {
    if (idx >= N + 1) { setAnimated(false); setIdx(1); }
    else if (idx <= 0) { setAnimated(false); setIdx(N); }
  };

  useEffect(() => {
    if (!animated) {
      const id = setTimeout(() => setAnimated(true), 20);
      return () => clearTimeout(id);
    }
  }, [animated]);

  const goNext = () => { setIdx(i => i + 1); startTimer(); };
  const goPrev = () => { setIdx(i => i - 1); startTimer(); };
  const goTo   = (i) => { setIdx(i + 1);     startTimer(); };

  // Actual visible slide (0-indexed into SLIDES)
  const actual = idx <= 0 ? N - 1 : idx >= N + 1 ? 0 : idx - 1;

  return (
    <div style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>

      {/* Indicador eliminado — carrusel siempre en movimiento */}
      {false && (
        <div style={{ position:"absolute", top:24, right:88, zIndex:20, display:"flex", alignItems:"center", gap:6,
          padding:"5px 12px", borderRadius:999, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:700,
          letterSpacing:0.5, pointerEvents:"none" }}>
          <span style={{ width:8, height:8, display:"flex", gap:2 }}>
            <span style={{ display:"block", width:3, height:8, background:"currentColor", borderRadius:1 }}/>
            <span style={{ display:"block", width:3, height:8, background:"currentColor", borderRadius:1 }}/>
          </span>
          Pausado
        </div>
      )}

      {/* ── Sliding track ── */}
      <div
        onTransitionEnd={onTransitionEnd}
        style={{
          display: "flex",
          height: "100%",
          transform: `translateX(-${idx * 100}%)`,
          transition: animated ? "transform 0.88s cubic-bezier(0.77,0,0.175,1)" : "none",
          willChange: "transform",
        }}
      >
        {extended.map((s, i) => {
          const isActive = i === idx;
          return (
            <div key={i} style={{ width:"100vw", minWidth:"100vw", height:"100%", flexShrink:0, overflow:"hidden", position:"relative" }}>
              <div
                key={isActive ? `kb-${idx}` : `bg-${i}`}
                style={{
                  position:"absolute", inset:"-6%",
                  backgroundImage:`url(${s.img})`,
                  backgroundSize:"cover", backgroundPosition:"center",
                  animationName: isActive ? `kenBurns${(i % 4) + 1}` : "none",
                  animationDuration:"12s",
                  animationTimingFunction:"ease-in-out",
                  animationFillMode:"forwards",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Gradiente verde esmeralda sobre la foto */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(125deg, rgba(6,78,59,0.88) 0%, rgba(5,150,105,0.55) 60%, rgba(0,0,0,0.1) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)" }} />

      {/* Decorativos */}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "rgba(132,204,22,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,0.05)", pointerEvents: "none" }} />

      {/* Contenido */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 10vw", maxWidth: 740 }}>
        {/* Badge slide */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 20, animation: "fadeSlide 0.6s ease" }}>
          <span style={{ width: 28, height: 3, background: C.lime, borderRadius: 2, display: "block" }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: C.lime, letterSpacing: 2, textTransform: "uppercase" }}>
            {SLIDES[actual].badge} · {String(actual + 1).padStart(2,"0")}/{String(SLIDES.length).padStart(2,"0")}
          </span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(36px,5.5vw,70px)", color: "#fff", lineHeight: 1.08, margin: "0 0 20px", textShadow: "0 4px 30px rgba(0,0,0,0.3)", animation: "fadeSlide 0.7s ease" }}>
          {SLIDES[actual].titulo}
        </h1>
        <p style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.75)", margin: "0 0 38px", lineHeight: 1.7, maxWidth: 520, animation: "fadeSlide 0.8s ease" }}>
          {SLIDES[actual].sub}
        </p>

        {/* Botones */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", animation: "fadeSlide 0.9s ease" }}>
          <Link to="/tienda" style={{ display: "inline-flex", alignItems: "center", gap: 11, padding: "16px 40px", borderRadius: 14, background: `linear-gradient(135deg, ${C.lime}, #65a30d)`, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 800, border: `2px solid ${C.limeDark}`, transition: "all 0.22s", letterSpacing: 0.3, boxShadow: `0 8px 24px rgba(122,193,67,0.4)`, animation: "pulseLime 2.4s ease 2s infinite" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 18px 36px rgba(122,193,67,0.5)`; e.currentTarget.style.animation="none"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(122,193,67,0.4)`; e.currentTarget.style.animation="pulseLime 2.4s ease infinite"; }}
          >
            <FontAwesomeIcon icon={faCartShopping} /> Ver tienda
          </Link>
          <Link to="/agendar-cita" style={{ display: "inline-flex", alignItems: "center", gap: 11, padding: "15px 28px", borderRadius: 14, background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, border: `1.5px solid ${C.roseMid}`, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700, transition: "all 0.22s", boxShadow:`0 6px 20px rgba(212,69,122,0.32)` }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 14px 32px rgba(212,69,122,0.48)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";     e.currentTarget.style.boxShadow=`0 6px 20px rgba(212,69,122,0.32)`; }}
          >
            <FontAwesomeIcon icon={faCalendarDays} /> Agendar cita
          </Link>
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", gap: 22, marginTop: 28, flexWrap: "wrap" }}>
          {[
            { t: "Envío gratis +$80K", c: C.lime },
            { t: "Pago seguro",        c: C.blue },
            { t: "Atención 24h",       c: C.lime },
            { t: "Solo Ibagué",        c: C.rose },
          ].map(({ t, c }) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: 0.2 }}>
              <FontAwesomeIcon icon={faCheck} style={{ color: c, fontSize: 10 }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ position:"absolute", bottom:18, left:"10vw", display:"flex", gap:8, alignItems:"center", zIndex:10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ width: i === actual ? 28 : 8, height: 8, borderRadius: 999, background: i === actual ? C.lime : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0 }} />
        ))}
      </div>

      {/* Indicador scroll */}
      <div style={{ position: "absolute", bottom: 32, right: "10vw", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "fadeSlide 1.2s ease 1s both" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Scroll</span>
        <div style={{ width: 24, height: 38, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", justifyContent: "center", paddingTop: 6 }}>
          <div style={{ width: 3, height: 8, borderRadius: 2, background: C.lime, animation: "scrollDot 1.6s ease infinite" }} />
        </div>
      </div>

      {/* Flechas */}
      {[{ dir: -1, fn: goPrev, icon: faChevronLeft }, { dir: 1, fn: goNext, icon: faChevronRight }].map(f => (
        <button key={f.dir} onClick={f.fn}
          style={{ position: "absolute", top: "50%", [f.dir === -1 ? "left" : "right"]: 20, transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontSize: 17, width: 52, height: 52, borderRadius: "50%", cursor: "pointer", transition: "all 0.22s", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
          onMouseEnter={e => { e.currentTarget.style.background = `rgba(10,107,64,0.55)`; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.transform = "translateY(-50%) scale(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
        >
          <FontAwesomeIcon icon={f.icon} />
        </button>
      ))}

      {/* Barra de progreso del slide */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"rgba(255,255,255,0.08)", zIndex:10 }}>
        <div key={actual} style={{ height:"100%", background:`linear-gradient(90deg,${C.lime},${C.rose})`, animation:"slideProgress 4s linear forwards", transformOrigin:"left", transform:"scaleX(0)" }} />
      </div>
    </div>
  );
}

/* ─── Ticker ─────────────────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    { icon: faTruck,         t: "Envío gratis desde $80.000",             hot: false },
    { icon: faFire,          t: "Descuentos hasta 40% en farmacología",   hot: true  },
    { icon: faPills,         t: "Medicamentos veterinarios certificados",  hot: false },
    { icon: faStar,          t: "Atención profesional las 24 horas",      hot: false },
    { icon: faPaw,           t: "Más de 500 productos en stock",           hot: false },
    { icon: faBolt,          t: "¡Últimas unidades disponibles!",          hot: true  },
    { icon: faGift,          t: "Beneficios exclusivos para miembros",     hot: false },
  ];
  return (
    <div style={{ background: `linear-gradient(90deg, ${C.brandDark} 0%, ${C.brand} 50%, ${C.brandDark} 100%)`, overflow: "hidden", padding: "10px 0", borderTop: `2px solid ${C.brandMid}`, borderBottom: `2px solid ${C.brandMid}` }}>
      <div style={{ display: "flex", gap: 44, animation: "ticker 32s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((it, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: it.hot ? 800 : 600, color: it.hot ? C.rose : "rgba(255,255,255,0.82)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={it.icon} style={{ color: it.hot ? C.rose : C.lime, fontSize: 11, opacity: 0.9 }} />
            {it.t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────────────── */
function Stats() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const items = [
    { val: "2.500+", label: "Clientes satisfechos",   color: C.lime },
    { val: "500+",   label: "Productos disponibles",   color: C.rose },
    { val: "8",      label: "Años de experiencia",     color: C.amber },
    { val: "98%",    label: "Calificación de servicio", color: C.blue },
  ];

  return (
    <div ref={ref} style={{ background: C.brandDark, padding: "64px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.lime}, ${C.coral}, ${C.amber}, ${C.brandMid})` }} />
      {/* decorativos */}
      <div style={{ position:"absolute", top:"50%", left:"5%", width:200, height:200, borderRadius:"50%", background:"rgba(122,193,67,0.04)", transform:"translateY(-50%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"50%", right:"5%", width:150, height:150, borderRadius:"50%", background:"rgba(249,115,22,0.04)", transform:"translateY(-50%)", pointerEvents:"none" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 0, textAlign: "center" }}>
        {items.map((it, i) => (
          <div key={i} style={{
            opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 0.65s ${i * 0.13}s, transform 0.65s ${i * 0.13}s`,
            padding: "28px 20px",
            borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: "clamp(36px,5vw,58px)", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: it.color, marginBottom: 10, lineHeight: 1, textShadow: `0 0 50px ${it.color}44` }}>
              {it.val}
            </div>
            <div style={{ width: 32, height: 2, borderRadius: 1, background: it.color, margin: "0 auto 10px", opacity: 0.5 }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 700, lineHeight: 1.5 }}>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Carrusel continuo productos destacados (Landing) ───────────────────── */
const Lcarr_W   = 220;
const Lcarr_GAP = 16;

function LandingCarruselCard({ producto }) {
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
        width: Lcarr_W, flexShrink: 0, cursor: "pointer",
        background: C.surface,
        border: `1.5px solid ${hover ? C.brandBorder : C.border}`,
        borderRadius: 16, overflow: "hidden",
        transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hover
          ? "0 14px 36px rgba(10,107,64,0.14), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        userSelect: "none", position: "relative",
        display: "flex", flexDirection: "column",
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
      {(producto.destacado === 1 || producto.destacado === true) && !descuento && (
        <div style={{ position:"absolute", top:8, right:8, zIndex:2,
          background:`linear-gradient(135deg,${C.lime},${C.limeDark})`,
          color:"#fff", fontSize:9, fontWeight:800,
          padding:"3px 8px", borderRadius:6,
          display:"flex", alignItems:"center", gap:4 }}>
          <FontAwesomeIcon icon={faStar} style={{ fontSize:7 }} /> Destacado
        </div>
      )}
      <div style={{ background: C.surfaceAlt, height: 148, overflow: "hidden", position: "relative" }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            style={{ width:"100%", height:"100%", objectFit:"contain", padding:10,
              transition:"transform 0.35s ease",
              transform: hover ? "scale(1.08)" : "scale(1)" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:40, opacity:0.15 }}>🐾</span>
          </div>
        )}
        {agotado && (
          <div style={{ position:"absolute", inset:0, background:"rgba(245,250,247,0.88)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#dc2626",
              background:"#fef2f2", border:"1px solid rgba(220,38,38,0.2)",
              padding:"3px 9px", borderRadius:6 }}>AGOTADO</span>
          </div>
        )}
      </div>
      <div style={{ padding:"11px 13px 14px", flex:1, display:"flex", flexDirection:"column", gap:3,
        borderTop:`1px solid ${C.border}` }}>
        {producto.marca && (
          <span style={{ fontSize:9, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, fontWeight:700 }}>
            {producto.marca}
          </span>
        )}
        <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, lineHeight:1.35,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:34 }}>
          {producto.nombre}
        </p>
        <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
          <span style={{ fontSize:17, fontWeight:800, color: agotado ? C.textMuted : C.brand,
            fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
            ${precio.toLocaleString("es-CO")}
          </span>
          {precioAntes > precio && (
            <span style={{ fontSize:10, textDecoration:"line-through", fontFamily:"monospace",
              opacity:0.7, color:C.textMuted }}>
              ${precioAntes.toLocaleString("es-CO")}
            </span>
          )}
        </div>
        <button onClick={handleAgregar} disabled={agotado}
          style={{
            marginTop:"auto", padding:"8px 0", borderRadius:10, border:"none",
            background: agotado
              ? C.surfaceAlt
              : agregado
                ? `linear-gradient(135deg,${C.brand},${C.brandMid})`
                : `linear-gradient(135deg,${C.lime},${C.limeDark})`,
            color: agotado ? C.textMuted : "#fff",
            fontSize:12, fontWeight:700, cursor: agotado ? "default" : "pointer",
            transition:"all 0.2s", letterSpacing:0.2,
            boxShadow: agotado ? "none" : "0 4px 12px rgba(10,107,64,0.22)",
          }}>
          {agotado ? "Sin stock" : agregado
            ? <><FontAwesomeIcon icon={faCheck} style={{ marginRight:5 }} />¡Agregado!</>
            : <><FontAwesomeIcon icon={faCartShopping} style={{ marginRight:5 }} />Agregar</>}
        </button>
      </div>
    </div>
  );
}

function LandingDestacadosCarrusel({ productos }) {
  const stripRef  = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);
  const xRef      = useRef(0);
  const SPEED  = 0.6;
  const single = (Lcarr_W + Lcarr_GAP) * productos.length;

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

  const scroll = (dir) => {
    xRef.current += dir * (Lcarr_W + Lcarr_GAP);
    if (xRef.current < 0)       xRef.current += single;
    if (xRef.current >= single) xRef.current -= single;
    if (stripRef.current) stripRef.current.style.transform = `translateX(-${xRef.current}px)`;
  };

  return (
    <div style={{ marginBottom:36, borderRadius:18,
      border:`1px solid ${C.border}`, overflow:"hidden",
      background:C.surface, boxShadow:"0 2px 12px rgba(10,107,64,0.06)" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px 12px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:C.brandLight,
            border:`1px solid ${C.brandBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FontAwesomeIcon icon={faStar} style={{ color:C.brand, fontSize:12 }} />
          </div>
          <div>
            <span style={{ fontSize:13, fontWeight:800, color:C.text, display:"block", lineHeight:1.2 }}>
              Productos destacados
            </span>
            <span style={{ fontSize:10, color:C.textMuted, fontWeight:500 }}>
              Selección premium · Pasa el cursor para pausar
            </span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["‹", -1], ["›", 1]].map(([icon, dir]) => (
            <button key={dir} onClick={() => scroll(Number(dir))}
              style={{ width:32, height:32, borderRadius:9, border:`1.5px solid ${C.border}`,
                background:C.surface, cursor:"pointer", fontSize:19, color:C.textSec,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s", lineHeight:1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.brand; e.currentTarget.style.color=C.brand; e.currentTarget.style.background=C.brandLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSec; e.currentTarget.style.background=C.surface; }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      {/* Strip */}
      <div style={{ position:"relative" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:72, zIndex:3, pointerEvents:"none",
          background:`linear-gradient(to right,${C.surface},transparent)` }}/>
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:72, zIndex:3, pointerEvents:"none",
          background:`linear-gradient(to left,${C.surface},transparent)` }}/>
        <div style={{ overflow:"hidden", padding:"16px 20px 20px" }}>
          <div ref={stripRef} style={{ display:"flex", gap:Lcarr_GAP, willChange:"transform" }}>
            {items.map((p, i) => <LandingCarruselCard key={`${p.id}-${i}`} producto={p}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sección Tienda ─────────────────────────────────────────────────────── */
function SeccionTienda() {
  const [revRef, revVis] = useReveal(0.08);
  const [destacados, setDestacados] = useState([]);
  const [cargando,   setCargando]   = useState(true);

  useEffect(() => {
    api.get("/productos/destacados/lista")
      .then(r => setDestacados(r.data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return (
    <section id="tienda" ref={revRef} style={{ padding: "80px 24px", background: C.canvas }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Encabezado */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16,
          opacity: revVis ? 1 : 0, transform: revVis ? "translateY(0)" : "translateY(22px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 999, background: C.brandLight, border: `1px solid ${C.brandBorder}`, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.brand }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: 1.2 }}>Nuestra tienda</span>
            </div>
            <h2 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(28px,4vw,48px)", color: C.text, lineHeight: 1.1 }}>
              Productos destacados
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: C.textTer, maxWidth: 460, lineHeight: 1.6 }}>
              Selección premium para el cuidado y salud de tu mascota
            </p>
          </div>
          <Link to="/tienda"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", borderRadius: 12, background: C.brand, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, border: `1px solid ${C.brandDark}`, transition: "all 0.2s", boxShadow:`0 4px 16px rgba(10,107,64,0.25)` }}
            onMouseEnter={e => { e.currentTarget.style.background = C.brandMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 24px rgba(10,107,64,0.35)`; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 16px rgba(10,107,64,0.25)`;}}
          >
            Ver catálogo completo <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
          </Link>
        </div>

        {/* Carrusel continuo */}
        {cargando ? (
          <div style={{ height:248, borderRadius:18, marginBottom:36,
            background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#c3ead4 50%,${C.surfaceAlt} 75%)`,
            backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
        ) : destacados.length >= 2 ? (
          <LandingDestacadosCarrusel productos={destacados}/>
        ) : null}

        {/* Chips de categoría */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {CATEGORIAS_TIENDA.map(cat => (
            <Link key={cat.q} to={`/tienda?categoria=${cat.q}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: cat.bg, border: `1.5px solid ${cat.color}30`, textDecoration: "none", transition: "border-color 0.15s, transform 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}77`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${cat.color}30`; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: 13, color: cat.color, display: "flex", alignItems: "center" }}><FontAwesomeIcon icon={cat.fa} /></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.nombre}</span>
            </Link>
          ))}
          <Link to="/tienda"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: C.brandLight, border: `1.5px solid ${C.brandBorder}`, textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.borderColor = C.brand; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.brandLight; e.currentTarget.style.borderColor = C.brandBorder; }}
          >
            <span style={{ fontSize: 13, color: C.brand, display: "flex", alignItems: "center" }}><FontAwesomeIcon icon={faStore} /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>Ver todo</span>
          </Link>
        </div>

        {/* Banner CTA */}
        <div style={{ borderRadius: 24, overflow: "hidden" }}>
          {/* Franja naranja urgencia */}
          <div style={{ background: `linear-gradient(90deg, ${C.coral}, ${C.coralDark})`, padding: "11px 32px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
              ¡Descuentos activos — Stock limitado en productos seleccionados!
            </span>
            <span style={{ fontSize: 14 }}>🔥</span>
          </div>
          {/* Cuerpo verde */}
          <div style={{ background: `linear-gradient(135deg, ${C.brandDark} 0%, #0a5e40 100%)`, padding: "38px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(132,204,22,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.8, color: C.lime }}>Victoria Pets · Ibagué</p>
              <h3 style={{ margin: "0 0 12px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(22px,3vw,36px)", color: "#fff", lineHeight: 1.2 }}>
                Todo lo que tu mascota necesita
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.62)", maxWidth: 420, lineHeight: 1.7 }}>
                Más de 500 productos disponibles. Medicamentos, alimentos, accesorios y equipos veterinarios. Envíos dentro de Ibagué.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", minWidth: 210 }}>
              <Link to="/tienda"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 36px", borderRadius: 14, background: `linear-gradient(135deg, ${C.lime}, #65a30d)`, color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 800, border: `1px solid ${C.limeDark}`, transition: "all 0.2s", textAlign: "center", boxShadow: `0 6px 20px rgba(132,204,22,0.3)` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 28px rgba(132,204,22,0.4)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 20px rgba(132,204,22,0.3)`; }}
              >
                <FontAwesomeIcon icon={faCartShopping} /> Ir a la tienda
              </Link>
              <Link to="/registro"
                style={{ padding: "11px 20px", borderRadius: 11, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.18s", textAlign: "center" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Sección Servicios ──────────────────────────────────────────────────── */
function SeccionServicios() {
  const [ref, vis] = useReveal(0.1);
  return (
    <section id="servicios" ref={ref} style={{ background: C.brandDark, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      {/* Decorativo de fondo */}
      <div style={{ position:"absolute", top:-120, right:-120, width:380, height:380, borderRadius:"50%", background:"rgba(122,193,67,0.04)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-80, left:-80, width:260, height:260, borderRadius:"50%", background:"rgba(10,107,64,0.15)", pointerEvents:"none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", position:"relative" }}>
        <div style={{ textAlign: "center", marginBottom: 52,
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s ease, transform 0.7s ease"
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(122,193,67,0.12)", border: "1px solid rgba(122,193,67,0.25)", marginBottom: 14 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.lime, display:"block" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.lime, letterSpacing: 1.5, textTransform: "uppercase" }}>Nuestros servicios</span>
          </div>
          <h2 style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(28px,4vw,48px)", color: "#fff", lineHeight: 1.1 }}>
            Todo para el bienestar animal
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 480, marginInline: "auto", lineHeight: 1.65 }}>
            Atención veterinaria integral con el respaldo de profesionales especializados en Ibagué
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 18 }}>
          {SERVICIOS.map((s, i) => (
            <div key={i}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "28px 24px", transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                cursor: "default", borderTop: `3px solid ${s.color}55`,
                opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${0.1 + i * 0.08}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderTopColor = s.color; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.25)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderTopColor = `${s.color}55`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:s.color }}><FontAwesomeIcon icon={s.fa} /></div>
                <div style={{ background: `${s.color}18`, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "5px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.stat}</div>
                </div>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing:-0.2 }}>{s.titulo}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Helpers video ──────────────────────────────────────────────────────── */
function esVideoLanding(url = "") {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com") || u.endsWith(".mp4") || u.endsWith(".webm");
}
function ytIdLanding(url)   { const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/); return m ? m[1] : null; }
function ytThumbLanding(url){ const id = ytIdLanding(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; }
function ytEmbedLanding(url){ const id = ytIdLanding(url); return id ? `https://www.youtube.com/embed/${id}` : null; }
function vmEmbedLanding(url){ const m = url.match(/vimeo\.com\/(\d+)/); return m ? `https://player.vimeo.com/video/${m[1]}` : null; }

/* ─── Galería ────────────────────────────────────────────────────────────── */
function SeccionGaleria({ imagenes }) {
  const [gRef, gVis] = useReveal(0.08);
  const [modalVideo, setModalVideo] = useState(null);
  const defaultItems = [
    { url: imgDesinfectante, titulo: "Desinfectante veterinario", categoria: "Higiene",      esVideo: false },
    { url: imgMeloxican,     titulo: "Meloxicam — analgésico",   categoria: "Farmacología", esVideo: false },
  ];
  const items = imagenes && imagenes.length > 0 ? imagenes : defaultItems;

  return (
    <section id="galeria" ref={gRef} style={{ background: C.canvas, padding: "80px 24px" }}>
      {modalVideo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setModalVideo(null)}>
          <div style={{ width: "100%", maxWidth: 720, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.brandBorder}33` }} onClick={e => e.stopPropagation()}>
            {ytEmbedLanding(modalVideo) ? (
              <iframe src={ytEmbedLanding(modalVideo) + "?autoplay=1"} width="100%" height={400} style={{ border: "none", display: "block" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : vmEmbedLanding(modalVideo) ? (
              <iframe src={vmEmbedLanding(modalVideo) + "?autoplay=1"} width="100%" height={400} style={{ border: "none", display: "block" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            ) : (
              <video src={modalVideo} controls autoPlay style={{ width: "100%", maxHeight: 400, background: "#000", display: "block" }} />
            )}
            <div style={{ background: "#0a0a0a", padding: "12px 16px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModalVideo(null)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 48,
          opacity: gVis ? 1 : 0, transform: gVis ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: C.brandLight, border: `1px solid ${C.brandBorder}`, marginBottom: 12 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.brand, display:"block" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: 1.2 }}>Galería</span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: C.text, lineHeight:1.1 }}>
            Nuestros productos en acción
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: C.textTer }}>
            Imágenes y videos del equipo, productos e instalaciones de Victoria Pets
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {items.map((im, i) => {
            const esVid = im.esVideo || esVideoLanding(im.url || "");
            const thumb = esVid ? ytThumbLanding(im.url || "") : null;
            return (
              <div key={i} onClick={() => esVid ? setModalVideo(im.url) : null}
                style={{
                  borderRadius: 18, overflow: "hidden", border: `1px solid ${C.border}`,
                  background: esVid ? "#0f0f0f" : C.surface, cursor: esVid ? "pointer" : "default",
                  opacity: gVis ? 1 : 0, transform: gVis ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.5s ease ${0.08 * i}s, transform 0.5s ease ${0.08 * i}s, border-color 0.2s, box-shadow 0.2s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 14px 36px rgba(10,107,64,0.13)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ height: 210, overflow: "hidden", background: esVid ? "#1a1a1a" : C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {esVid ? (
                    <>
                      {thumb ? <img src={thumb} alt={im.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : <span style={{ fontSize: 48, opacity: 0.5 }}>🎥</span>}
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
                      </div>
                    </>
                  ) : (
                    <img src={im.url} alt={im.titulo || "Victoria Pets"} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s" }} onError={e => { e.target.style.display = "none"; }}
                      onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
                      onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                    />
                  )}
                </div>
                {(im.categoria || im.titulo) && (
                  <div style={{ padding: "13px 15px", background: esVid ? "#0a0a0a" : C.surface }}>
                    {im.categoria && <span style={{ fontSize: 10, color: esVid ? "#6ee7b7" : C.brand, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>{im.categoria}</span>}
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: esVid ? "rgba(255,255,255,0.7)" : C.textSec, fontWeight: 600, lineHeight: 1.35 }}>{im.titulo || "Victoria Pets"}</p>
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
  const [ref, vis] = useReveal(0.1);
  return (
    <section id="blog" ref={ref} style={{ background: C.surfaceAlt, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 48,
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: C.brandLight, border: `1px solid ${C.brandBorder}`, marginBottom: 12 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.brand, display:"block" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: 1.2 }}>Blog</span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: C.text, lineHeight: 1.1 }}>
            Consejos veterinarios
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: C.textTer }}>Guías y recomendaciones de nuestro equipo profesional</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 22 }}>
          {BLOG.map((b, i) => (
            <article key={i}
              style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden",
                transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer", borderTop: `4px solid ${b.accent}`,
                opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(36px)",
                transitionDelay: `${0.1 + i * 0.1}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${b.accent}1a`; e.currentTarget.style.borderColor = `${b.accent}44`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
            >
              <div style={{ height: 140, background: `linear-gradient(135deg,${b.accent}18,${b.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position:"relative", overflow:"hidden", color: b.accent }}>
                <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:`${b.accent}0a` }} />
                <FontAwesomeIcon icon={b.fa} style={{ opacity: 0.75 }} />
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems:"center" }}>
                  <span style={{ fontSize: 10, color: b.accent, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, padding: "3px 10px", borderRadius: 999, background: `${b.accent}14`, border: `1px solid ${b.accent}22` }}>{b.cat}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{b.fecha}</span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{b.titulo}</h3>
                <p style={{ margin: 0, fontSize: 13, color: C.textTer, lineHeight: 1.65 }}>{b.desc}</p>
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
  const [ref, vis] = useReveal(0.08);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 4000);
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <section id="contacto" ref={ref} style={{ background: C.canvas, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 52,
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: C.brandLight, border: `1px solid ${C.brandBorder}`, marginBottom: 12 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.brand, display:"block" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: 1.2 }}>Contáctanos</span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", color: C.text, lineHeight:1.1 }}>
            ¿Tienes alguna pregunta?
          </h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, flexWrap: "wrap",
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}>
          <div>
            {[
              { fa: faLocationDot, label: "Dirección",  val: "Ibagué, Tolima, Colombia" },
              { fa: faPhone,       label: "Teléfono",   val: "+57 300 000 0000" },
              { fa: faEnvelope,    label: "Correo",     val: "info@victoriapets.com" },
              { fa: faClock,       label: "Horario",    val: "Lun–Sáb 8am – 6pm" },
            ].map(it => (
              <div key={it.label} style={{ display: "flex", gap: 16, marginBottom: 26, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.brandLight, border: `1px solid ${C.brandBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: C.brand }}>
                  <FontAwesomeIcon icon={it.fa} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontWeight: 700 }}>{it.label}</div>
                  <div style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>{it.val}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "nombre",  placeholder: "Tu nombre",             type: "text"  },
              { key: "email",   placeholder: "Tu correo electrónico",  type: "email" },
            ].map(f => (
              <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ padding: "12px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, outline: "none", transition: "border-color 0.15s", width: "100%" }}
                onFocus={e => { e.target.style.borderColor = C.brand; }}
                onBlur={e => { e.target.style.borderColor = C.border; }}
              />
            ))}
            <textarea placeholder="¿En qué podemos ayudarte?" value={form.mensaje}
              onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
              rows={4}
              style={{ padding: "12px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, outline: "none", resize: "vertical", transition: "border-color 0.15s" }}
              onFocus={e => { e.target.style.borderColor = C.brand; }}
              onBlur={e => { e.target.style.borderColor = C.border; }}
            />
            <button type="submit"
              style={{ padding: "14px 0", borderRadius: 12, border: "none", background: enviado ? C.brandMid : `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!enviado) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
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
    <footer style={{ background: C.brandDark, color: "rgba(255,255,255,0.55)", padding: "52px 24px 28px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.lime}, ${C.brand}, ${C.coral})` }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 36, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <img src={logoVP} alt="Victoria Pets" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(110,231,183,0.2)" }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#fff", fontStyle: "italic" }}>Victoria Pets</div>
                <div style={{ fontSize: 9, color: C.lime, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>Veterinaria</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0 }}>
              Cuidado veterinario de calidad para tu mascota en Ibagué, Tolima.
            </p>
          </div>
          {[
            { titulo: "Tienda",    links: ["Farmacología", "Alimentos", "Higiene", "Accesorios", "Equipos"] },
            { titulo: "Empresa",   links: ["Nosotros", "Servicios", "Blog", "Contacto"] },
            { titulo: "Mi cuenta", links: ["Iniciar sesión", "Crear cuenta", "Mis pedidos", "Mi perfil"] },
          ].map(col => (
            <div key={col.titulo}>
              <h4 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2 }}>{col.titulo}</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize: 13, color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => { e.target.style.color = C.lime; }} onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.55)"; }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12 }}>© 2026 Victoria Pets. Todos los derechos reservados.</span>
          <span style={{ fontSize: 12 }}>Ibagué, Tolima 🇨🇴</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing principal ──────────────────────────────────────────────────── */
export default function Landing() {
  const [galeriaImagenes, setGaleriaImagenes] = useState([]);

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem("galeria_victoria") || "[]");
      setGaleriaImagenes(guardadas);
    } catch {}
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&family=JetBrains+Mono:wght@600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body, input, button, textarea, select { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
        @keyframes ticker     { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes shimmer    { to { background-position: -200% 0; } }
        @keyframes fadeSlide  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseOrange{ 0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0.5); } 60% { box-shadow:0 0 0 7px rgba(249,115,22,0); } }
        @keyframes scrollDot  { 0%{opacity:1;transform:translateY(0)} 80%{opacity:0;transform:translateY(14px)} 100%{opacity:0} }
        @keyframes pulseLime  { 0%,100%{box-shadow:0 0 0 0 rgba(122,193,67,0.45)} 60%{box-shadow:0 0 0 9px rgba(122,193,67,0)} }
        @keyframes kenBurns1  { from { transform: scale(1.09) translate(1.5%,  0.5%); } to { transform: scale(1)    translate(-1%,   -0.5%); } }
        @keyframes kenBurns2  { from { transform: scale(1)    translate(-1%,   0.5%); } to { transform: scale(1.09) translate(1.5%,  -0.5%); } }
        @keyframes kenBurns3  { from { transform: scale(1.07) translate(0.5%,  1%);   } to { transform: scale(1)    translate(-0.5%, -1%);   } }
        @keyframes kenBurns4  { from { transform: scale(1)    translate(0.5%, -1%);   } to { transform: scale(1.07) translate(-1.5%, 0.5%);  } }
        @keyframes slideProgress { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes pawFloat { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.04} 50%{transform:translateY(-12px) rotate(8deg);opacity:0.07} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.canvas}; }
        ::-webkit-scrollbar-thumb { background: ${C.brand}55; border-radius: 3px; }
        @media (max-width: 768px) {
          .vp-nav-links    { display: none !important; }
          .vp-cta-desktop  { display: none !important; }
          .vp-chip-label   { display: none !important; }
        }
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
