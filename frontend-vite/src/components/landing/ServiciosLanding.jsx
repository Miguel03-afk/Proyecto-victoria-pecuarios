// src/components/landing/ServiciosLanding.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope, faPrescriptionBottleMedical, faBowlFood, faTruckFast,
  faCheck, faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Reveal, TypeReveal, SectionEyebrow, useLandingPalette } from "./landing.utils.jsx";

import imgConsulta  from "../../assets/landing/p3-consult.png";
import imgFarmacia  from "../../assets/landing/p6-pharmacy.png";
import imgNutricion from "../../assets/landing/hero-2-bottle.png";
import imgEnvio     from "../../assets/landing/p1-walk.png";

function ServiceCard({ Cur, n, icon, accent, title, body, img, includes, delay, onClick, ctaLabel = "Conocer más" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal variant="vp-reveal-card" delay={delay}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: Cur.surface,
          border: `1px solid ${hovered ? accent + "55" : Cur.border}`,
          borderRadius: 28, padding: 0,
          height: "100%", display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative",
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease, border-color 350ms ease",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hovered ? "0 22px 44px -22px rgba(10,20,38,0.18)" : "0 1px 0 rgba(10,20,38,0.02)",
        }}
      >
        {/* Top accent line */}
        <div aria-hidden="true" style={{
          height: 3,
          background: `linear-gradient(90deg, ${accent} 0%, ${accent}00 100%)`,
          transformOrigin: "left center",
          transform: hovered ? "scaleX(1)" : "scaleX(0.18)",
          transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}/>

        {/* IMAGE header */}
        <div style={{
          aspectRatio: "16 / 9",
          backgroundImage: `url('${img}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          position: "relative",
          transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(10,20,38,0.0) 50%, rgba(10,20,38,0.55) 100%)",
          }}/>
          <span className="vp-font-display" style={{
            position: "absolute", top: 16, left: 20,
            fontStyle: "italic", fontSize: 30, fontWeight: 500,
            color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.35)", lineHeight: 1,
          }}>
            {n}
          </span>
          <span style={{
            position: "absolute", bottom: 16, left: 20,
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: "#fff", color: accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 16px -8px rgba(10,20,38,0.30)",
          }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: 18 }} />
          </span>
        </div>

        {/* BODY */}
        <div style={{ padding: 28, paddingTop: 24, display: "flex", flexDirection: "column", flex: 1 }}>
          <h3 className="vp-font-display" style={{
            fontSize: 24, fontWeight: 500, color: Cur.ink,
            lineHeight: 1.12, letterSpacing: "-0.015em", margin: 0,
          }}>
            {title}
          </h3>
          <p style={{ marginTop: 10, fontSize: 14, color: Cur.inkSoft, lineHeight: 1.55 }}>
            {body}
          </p>

          <ul style={{
            listStyle: "none", padding: 0, margin: "20px 0 0",
            display: "flex", flexDirection: "column", gap: 8,
            borderTop: `1px solid ${Cur.border}`, paddingTop: 16,
          }}>
            {includes.map((inc) => (
              <li key={inc} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: Cur.inkSoft, fontWeight: 500,
              }}>
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: accent }} />
                {inc}
              </li>
            ))}
          </ul>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={onClick}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              marginTop: 22, fontSize: 14, fontWeight: 600,
              color: accent, textDecoration: "none",
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: 0, alignSelf: 'flex-start',
            }}
          >
            {ctaLabel}
            <FontAwesomeIcon
              icon={faArrowRight}
              style={{
                fontSize: 12,
                transform: hovered ? "translateX(4px)" : "translateX(0)",
                transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
        </div>
      </article>
    </Reveal>
  );
}

export default function ServiciosLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();

  const services = [
    {
      n: "01", icon: faStethoscope, accent: Cur.navy,
      title: "Consulta veterinaria",
      body: "Medicina general y especializada con un veterinario asignado. La misma persona en cada visita, para que tu mascota construya confianza.",
      img: imgConsulta,
      includes: ["Receta digital al instante", "Historia clínica unificada", "Seguimiento por WhatsApp"],
      onClick: () => navigate('/agendar-cita'),
      ctaLabel: "Agendar consulta",
    },
    {
      n: "02", icon: faPrescriptionBottleMedical, accent: Cur.red,
      title: "Farmacología",
      body: "Medicamentos formulados por nuestros veterinarios y trazabilidad de cada lote. Solo despachamos lo que está clínicamente justificado.",
      img: imgFarmacia,
      includes: ["+200 referencias en stock", "Despacho con receta digital", "Asesoría de dosis incluida"],
      onClick: () => navigate('/tienda?categoria=farmacologia'),
      ctaLabel: "Ver medicamentos",
    },
    {
      n: "03", icon: faBowlFood, accent: Cur.lime,
      title: "Nutrición y alimentos",
      body: "Plan alimenticio según raza, edad y condición clínica. Si tu mascota tiene una patología, ajustamos la dieta con criterio médico.",
      img: imgNutricion,
      includes: ["Marcas premium y científicas", "Suplementos terapéuticos", "Plan a medida sin costo"],
      onClick: () => navigate('/tienda?categoria=alimentos'),
      ctaLabel: "Ver alimentos",
    },
    {
      n: "04", icon: faTruckFast, accent: Cur.navy,
      title: "Envío express en Ibagué",
      body: "Pedido antes de las 2 p.m. llega el mismo día. Envío gratis sobre $80.000 y empacado para que el alimento llegue como estaba en la bodega.",
      img: imgEnvio,
      includes: ["Entrega misma tarde", "Empaque sellado y trazable", "Tracking en tiempo real"],
      onClick: () => navigate('/tienda'),
      ctaLabel: "Ir a la tienda",
    },
  ];

  return (
    <section id="servicios" style={{
      backgroundColor: Cur.bg, position: "relative", overflow: "hidden",
      scrollMarginTop: 80,
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -120, left: -100, width: 480, height: 480, backgroundColor: Cur.lime, opacity: 0.08 }}/>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ bottom: -160, right: -120, width: 560, height: 560, backgroundColor: Cur.navy, opacity: 0.06 }}/>

      <div style={{ height: 80 }} aria-hidden="true" />

      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '0 24px 112px', position: "relative", zIndex: 1,
      }}>
        <div className="vp-srv-header" style={{
          display: 'grid', gridTemplateColumns: '6fr 5fr',
          gap: 40, alignItems: 'flex-end', marginBottom: 64,
        }}>
          <Reveal>
            <div>
              <SectionEyebrow>Nuestros servicios</SectionEyebrow>
              <TypeReveal
                as="h2"
                className="vp-font-display"
                style={{
                  marginTop: 20, marginBottom: 0,
                  fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.0,
                  fontWeight: 500, color: Cur.ink, maxWidth: 640,
                }}
                segments={[
                  { text: "Medicina veterinaria con " },
                  { text: "tiempo, calma", italic: true, color: Cur.navy },
                  { text: " y criterio." },
                ]}
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 16, color: Cur.inkSoft, maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
                No somos una clínica de turno. Somos un equipo que conoce a tu mascota por su nombre,
                registra cada consulta y te explica cada decisión antes de tomarla.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 32px', fontSize: 13 }}>
                {[
                  { k: "+10", v: "años de experiencia clínica" },
                  { k: "4.8★", v: "promedio en reseñas" },
                  { k: "24/7", v: "atención de urgencias" },
                ].map((s) => (
                  <div key={s.k} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="vp-font-display" style={{
                      fontSize: 22, fontWeight: 500, color: Cur.navy,
                    }}>
                      {s.k}
                    </span>
                    <span style={{ color: Cur.inkSoft }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="vp-srv-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}>
          {services.map((s, i) => (
            <ServiceCard key={s.title} Cur={Cur} {...s} delay={(i % 2) * 100} />
          ))}
        </div>
      </div>

      <div style={{ height: 80 }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) {
          .vp-srv-header { grid-template-columns: 1fr !important; gap: 24px !important; }
          .vp-srv-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
