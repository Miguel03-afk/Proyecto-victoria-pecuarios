// src/components/landing/TestimoniosLanding.jsx
// Versión editorial compacta — cita destacada estilo magazine + 3 menciones.
// Antes: marquee horizontal con cards 380×320 (~600px de alto total).
// Ahora: una cita grande en lead + 3 mini quotes en grid (~360px total).
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Reveal, useLandingPalette } from "./landing.utils.jsx";

const TESTIMONIOS = [
  {
    body: "Pedí el alimento un lunes en la mañana, llegó esa misma tarde. Y a mejor precio que la tienda de al lado.",
    name: "Andrés P.",   meta: "Cliente desde 2024", initials: "AP",
  },
  {
    body: "El shampoo antiparasitario que me recomendaron le quitó el problema a Milo en una semana. Muy buen producto.",
    name: "Sara M.",     meta: "Cliente desde 2024", initials: "SM",
  },
  {
    body: "Llevo comprando el concentrado acá hace dos años. Siempre fresco, bien empacado y llega rapidísimo.",
    name: "Carolina B.", meta: "Cliente desde 2023", initials: "CB",
  },
  {
    body: "Encontré el suplemento articular que no había en ningún lado. Me asesoraron y llegó al día siguiente.",
    name: "Valentina C.", meta: "Cliente desde 2024", initials: "VC",
  },
];

export default function TestimoniosLanding() {
  const { Cur } = useLandingPalette();
  const [activo, setActivo] = useState(0);

  const next = () => setActivo((i) => (i + 1) % TESTIMONIOS.length);
  const prev = () => setActivo((i) => (i - 1 + TESTIMONIOS.length) % TESTIMONIOS.length);

  const lead = TESTIMONIOS[activo];

  return (
    <section style={{
      backgroundColor: Cur.surfaceAlt,
      transition: "background-color 400ms ease",
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -120, right: -100, width: 380, height: 380, backgroundColor: Cur.lime, opacity: 0.06 }}/>

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '72px 24px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header sobre la cita — eyebrow inline a la izquierda + controles a la derecha */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 16, marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontSize: 11, fontWeight: 700,
              color: Cur.navy, letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              <span style={{ width: 22, height: 1, backgroundColor: Cur.navy }} />
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <FontAwesomeIcon key={i} icon={faStar} style={{ fontSize: 10, color: Cur.lime }} />
                ))}
              </span>
              4.8 · Lo que cuentan en Ibagué
            </div>
          </Reveal>

          {/* Controles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 12, color: Cur.inkSoft, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(activo + 1).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(TESTIMONIOS.length).padStart(2, '0')}</span>
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { icon: faChevronLeft,  onClick: prev, label: 'Anterior' },
                { icon: faChevronRight, onClick: next, label: 'Siguiente' },
              ].map(({ icon, onClick, label }) => (
                <button
                  key={label} type="button"
                  onClick={onClick} aria-label={label}
                  style={{
                    width: 36, height: 36, borderRadius: 999,
                    backgroundColor: 'transparent',
                    border: `1px solid ${Cur.border}`,
                    color: Cur.ink, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                    transition: 'border-color 180ms ease, color 180ms ease, background-color 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = Cur.navy;
                    e.currentTarget.style.color = Cur.navy;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = Cur.border;
                    e.currentTarget.style.color = Cur.ink;
                  }}
                >
                  <FontAwesomeIcon icon={icon} style={{ fontSize: 11 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lead quote — italic editorial grande */}
        <Reveal>
          <div key={activo} style={{
            position: 'relative',
            padding: '8px 0',
            animation: 'vp-fade-in 320ms cubic-bezier(0.16,1,0.3,1)',
          }}>
            <span aria-hidden="true" className="vp-font-display" style={{
              position: 'absolute', top: -36, left: -8,
              fontSize: 140, lineHeight: 1, fontWeight: 200, fontStyle: 'italic',
              color: Cur.lime, opacity: 0.18,
              pointerEvents: 'none',
            }}>
              “
            </span>
            <blockquote className="vp-font-display" style={{
              margin: 0, paddingLeft: 8,
              fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 400,
              fontStyle: 'italic',
              color: Cur.ink, lineHeight: 1.35,
              letterSpacing: '-0.018em',
              maxWidth: 880,
            }}>
              {lead.body}
            </blockquote>

            <div style={{
              marginTop: 24, paddingLeft: 8,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                backgroundColor: Cur.navy, color: Cur.canvas,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>
                {lead.initials}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: Cur.ink }}>{lead.name}</div>
                <div style={{ fontSize: 11.5, color: Cur.inkSoft, marginTop: 1 }}>{lead.meta}</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Mini menciones — los OTROS testimonios (no el activo), como índice */}
        <div className="vp-testim-mini" style={{
          marginTop: 40,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {TESTIMONIOS.filter((_, i) => i !== activo).slice(0, 3).map((t) => {
            const realIdx = TESTIMONIOS.findIndex(x => x.name === t.name);
            return (
              <button
                key={t.name} type="button"
                onClick={() => setActivo(realIdx)}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: 14,
                  backgroundColor: Cur.surface,
                  border: `1px solid ${Cur.border}`,
                  fontFamily: 'inherit',
                  transition: 'border-color 200ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = Cur.navy + '55';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = Cur.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <p style={{
                  margin: 0, fontSize: 12.5, color: Cur.inkSoft,
                  lineHeight: 1.5,
                  display: '-webkit-box', WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2, overflow: 'hidden',
                }}>
                  “{t.body}”
                </p>
                <div style={{
                  marginTop: 10, fontSize: 11.5, fontWeight: 600,
                  color: Cur.ink,
                }}>
                  — {t.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes vp-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @media (max-width: 720px) {
          .vp-testim-mini { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
