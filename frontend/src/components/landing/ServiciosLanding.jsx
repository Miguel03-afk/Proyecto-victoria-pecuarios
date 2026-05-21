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

/* Card destacada (feature) — más alta, imagen lado izquierdo, body a la derecha.
   Solo se usa para el primer servicio. Crea jerarquía visual sin repetir el mismo
   patrón 4 veces. */
function ServiceCardFeature({ Cur, n, icon, accent, title, body, img, includes, delay, onClick, ctaLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal variant="vp-reveal-card" delay={delay}>
      <article
        className="vp-srv-feature"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: Cur.surface,
          border: `1px solid ${hovered ? accent + "55" : Cur.border}`,
          borderRadius: 32, padding: 0,
          display: "grid", gridTemplateColumns: "5fr 6fr",
          overflow: "hidden", position: "relative", minHeight: 360,
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease, border-color 350ms ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered ? "0 28px 56px -28px rgba(10,20,38,0.22)" : "0 1px 0 rgba(10,20,38,0.02)",
        }}
      >
        {/* IMAGE (left, full height) */}
        <div style={{
          backgroundImage: `url('${img}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          position: "relative", minHeight: 320,
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${accent}25 0%, rgba(10,20,38,0) 60%)`,
          }}/>
          <span style={{
            position: "absolute", top: 24, left: 24,
            fontSize: 13, fontWeight: 600, color: "#FAF7F0",
            background: "rgba(10,20,38,0.55)", padding: "4px 12px",
            borderRadius: 999, backdropFilter: "blur(8px)",
          }}>
            Servicio destacado
          </span>
          <span style={{
            position: "absolute", bottom: 24, left: 24,
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: Cur.surface, color: accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 22px -10px rgba(10,20,38,0.30)",
          }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: 22 }} />
          </span>
        </div>

        {/* BODY (right) */}
        <div style={{ padding: "40px 40px 36px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: accent, marginBottom: 12 }}>
            {n} · {title.split(" ")[0]}
          </span>
          <h3 className="vp-font-display" style={{
            fontSize: 34, fontWeight: 700, color: Cur.ink,
            lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0,
          }}>
            {title}
          </h3>
          <p style={{ marginTop: 16, fontSize: 16, color: Cur.inkSoft, lineHeight: 1.55, maxWidth: 520 }}>
            {body}
          </p>
          <ul style={{
            listStyle: "none", padding: 0, margin: "24px 0 0",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            {includes.map((inc) => (
              <li key={inc} style={{
                display: 'flex', alignItems: 'center', gap: 10,
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
              marginTop: 28, padding: "12px 22px", borderRadius: 999,
              background: accent, color: Cur.canvas,
              fontSize: 14, fontWeight: 600, border: "none",
              cursor: "pointer", fontFamily: "inherit",
              alignSelf: 'flex-start',
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {ctaLabel}
            <FontAwesomeIcon
              icon={faArrowRight}
              style={{
                fontSize: 11,
                transform: hovered ? "translateX(3px)" : "translateX(0)",
                transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
        </div>
      </article>
    </Reveal>
  );
}

/* Card compacta — usada para servicios secundarios. Imagen arriba, body abajo,
   más densa que la feature pero igual de cuidada. */
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
          borderRadius: 24, padding: 0,
          height: "100%", display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative",
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease, border-color 350ms ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered ? "0 18px 36px -18px rgba(10,20,38,0.16)" : "0 1px 0 rgba(10,20,38,0.02)",
        }}
      >
        <div style={{
          aspectRatio: "5 / 3",
          backgroundImage: `url('${img}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          position: "relative",
          transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(10,20,38,0.0) 55%, rgba(10,20,38,0.5) 100%)",
          }}/>
          <span style={{
            position: "absolute", bottom: 14, left: 16,
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: Cur.surface, color: accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 16px -8px rgba(10,20,38,0.30)",
          }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
          </span>
        </div>

        <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 6 }}>
            {n}
          </span>
          <h3 className="vp-font-display" style={{
            fontSize: 22, fontWeight: 700, color: Cur.ink,
            lineHeight: 1.12, letterSpacing: "-0.02em", margin: 0,
          }}>
            {title}
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: Cur.inkSoft, lineHeight: 1.5 }}>
            {body}
          </p>

          <ul style={{
            listStyle: "none", padding: 0, margin: "18px 0 0",
            display: "flex", flexDirection: "column", gap: 6,
            borderTop: `1px solid ${Cur.border}`, paddingTop: 14,
          }}>
            {includes.slice(0, 2).map((inc) => (
              <li key={inc} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: Cur.inkSoft, fontWeight: 500,
              }}>
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, color: accent }} />
                {inc}
              </li>
            ))}
          </ul>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={onClick}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 20, fontSize: 13, fontWeight: 600,
              color: accent, textDecoration: "none",
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: 0, alignSelf: 'flex-start',
            }}
          >
            {ctaLabel}
            <FontAwesomeIcon
              icon={faArrowRight}
              style={{
                fontSize: 11,
                transform: hovered ? "translateX(3px)" : "translateX(0)",
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
          gap: 48, alignItems: 'flex-end', marginBottom: 72,
        }}>
          <Reveal>
            <div>
              <SectionEyebrow>Nuestros servicios</SectionEyebrow>
              <TypeReveal
                as="h2"
                className="vp-font-display"
                style={{
                  marginTop: 20, marginBottom: 0,
                  fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1.0,
                  fontWeight: 700, color: Cur.ink, maxWidth: 640,
                  letterSpacing: "-0.025em",
                }}
                segments={[
                  { text: "Medicina veterinaria con " },
                  { text: "tiempo, calma", color: Cur.navy },
                  { text: " y criterio." },
                ]}
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ fontSize: 16, color: Cur.inkSoft, maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
                No somos una clínica de turno. Somos un equipo que conoce a tu mascota por su nombre,
                registra cada consulta y te explica cada decisión antes de tomarla.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 36px', fontSize: 13 }}>
                {[
                  { k: "+10", v: "años de experiencia clínica" },
                  { k: "4.8★", v: "promedio en reseñas" },
                  { k: "24/7", v: "atención de urgencias" },
                ].map((s) => (
                  <div key={s.k} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="vp-font-display vp-tabular" style={{
                      fontSize: 24, fontWeight: 700, color: Cur.navy,
                      letterSpacing: "-0.02em",
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

        {/* Bento asimétrico: feature (servicio 01) ancho completo,
            servicios 02-04 en grid de 3 columnas debajo. Rompe la
            monotonía de "4 cards iguales" y crea jerarquía. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ServiceCardFeature Cur={Cur} {...services[0]} delay={0} />

          <div className="vp-srv-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {services.slice(1).map((s, i) => (
              <ServiceCard key={s.title} Cur={Cur} {...s} delay={(i + 1) * 80} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} aria-hidden="true" />

      <style>{`
        /* Tablet: feature card colapsa a 1 columna, grid pasa a 2 columnas. */
        @media (max-width: 1024px) {
          .vp-srv-header  { grid-template-columns: 1fr !important; gap: 28px !important; align-items: flex-start !important; }
          .vp-srv-feature { grid-template-columns: 1fr !important; min-height: auto !important; }
          .vp-srv-feature > div:first-child { min-height: 240px !important; aspect-ratio: 16 / 9; }
          .vp-srv-grid    { grid-template-columns: 1fr 1fr !important; }
        }
        /* Mobile: todo a 1 columna, padding interno reducido. */
        @media (max-width: 640px) {
          .vp-srv-feature > div:last-child { padding: 28px 24px !important; }
          .vp-srv-feature > div:last-child > h3 { font-size: 28px !important; }
          .vp-srv-feature > div:last-child > ul { grid-template-columns: 1fr !important; }
          .vp-srv-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
