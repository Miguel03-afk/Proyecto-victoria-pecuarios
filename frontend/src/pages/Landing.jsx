// src/pages/Landing.jsx
// Composición del landing rediseño navy + lime (2026-05).
// Cada sección vive en src/components/landing/* — este archivo solo orquesta.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { LANDING_CSS, useLandingPalette } from "../components/landing/landing.utils.jsx";

import HeroLanding         from "../components/landing/HeroLanding";
import ServiciosLanding    from "../components/landing/ServiciosLanding";
import CategoriasLanding   from "../components/landing/CategoriasLanding";
import ProductosLanding    from "../components/landing/ProductosLanding";
import GaleriaLanding      from "../components/landing/GaleriaLanding";
import TestimoniosLanding  from "../components/landing/TestimoniosLanding";
import FooterLanding       from "../components/landing/FooterLanding";

export default function Landing() {
  const { Cur } = useLandingPalette();
  const location = useLocation();

  // Scroll a anchor cuando la URL trae #servicios, #equipo, #tienda, etc.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const tryScroll = (intentos = 0) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (intentos < 10) setTimeout(() => tryScroll(intentos + 1), 80);
    };
    tryScroll();
  }, [location.hash, location.pathname]);

  return (
    <>
      <style>{LANDING_CSS}</style>

      <div style={{ minHeight: '100vh', background: Cur.bg, color: Cur.ink }}>
        <Navbar />

        <HeroLanding />
        <ServiciosLanding />
        <CategoriasLanding />
        <ProductosLanding />
        <GaleriaLanding />
        <TestimoniosLanding />
        <FooterLanding />
      </div>
    </>
  );
}
