// src/components/landing/CategoriasLanding.jsx
// Layout editorial asimétrico: 1 categoría hero + 3 stack a la derecha.
// Sin gradient negro genérico — fondo con mesh animado sutil.
// Tipografía: número grande estilo magazine que vive DETRÁS del título.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { Reveal, TypeReveal, SectionEyebrow, useLandingPalette } from "./landing.utils.jsx";

import imgAlimento    from "../../assets/landing/hero-2-bottle.png";
import imgMedicamento from "../../assets/landing/p6-pharmacy.png";
import imgAccesorios  from "../../assets/landing/p2-petting.png";
import imgHigiene     from "../../assets/landing/p5-sleep.png";

const FALLBACK_IMGS = [imgAlimento, imgMedicamento, imgAccesorios, imgHigiene];

const FALLBACK_CATEGORIAS = [
  { slug: "alimentos",    nombre: "Alimento",     descripcion: "Concentrado seco, húmedo y snacks por etapa de vida y raza." },
  { slug: "farmacologia", nombre: "Medicamentos", descripcion: "Surtido amplio con trazabilidad de lote." },
  { slug: "accesorios",   nombre: "Accesorios",   descripcion: "Camas, juguetes y útiles diarios." },
  { slug: "higiene",      nombre: "Higiene",      descripcion: "Shampoos, antiparasitarios y cuidado." },
];

/* ─── Card hero (categoría principal) ─────────────────────────────────────── */
function HeroCategoryCard({ Cur, cat, img, accent }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => navigate(`/tienda?categoria=${encodeURIComponent(cat.slug || cat.nombre || '')}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="vp-cat-hero"
      style={{
        position: 'relative', overflow: 'hidden',
        background: Cur.surface,
        border: `1px solid ${hovered ? accent + '55' : Cur.border}`,
        borderRadius: 32, padding: 0,
        height: '100%', width: '100%',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit',
        display: 'grid', gridTemplateColumns: '1fr 1.1fr',
        transition: "border-color 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 28px 56px -28px ${accent}55, 0 4px 12px -6px rgba(10,20,38,0.08)`
          : "0 1px 0 rgba(10,20,38,0.02)",
      }}
    >
      {/* Mesh animado de fondo en la zona de texto */}
      <div aria-hidden="true" className="vp-mesh" style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '46%',
        background: `
          radial-gradient(circle at 20% 30%, ${accent}1F 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, ${Cur.navy}14 0%, transparent 55%)
        `,
        backgroundSize: '200% 200%',
        animation: 'vp-mesh-shift 14s ease infinite',
        pointerEvents: 'none',
      }} />

      {/* ── Lado izquierdo: contenido editorial ── */}
      <div className="vp-cat-hero-body" style={{
        position: 'relative', zIndex: 1,
        padding: '40px 36px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: 380,
      }}>
        {/* Número magazine — italic 200 detrás del título */}
        <div style={{ position: 'relative' }}>
          <span aria-hidden="true" className="vp-font-display" style={{
            position: 'absolute', top: -12, left: -6,
            fontSize: 120, fontWeight: 200, fontStyle: 'italic',
            color: accent, opacity: 0.10, lineHeight: 1,
            letterSpacing: '-0.04em', pointerEvents: 'none',
          }}>
            01
          </span>
          <span style={{
            position: 'relative', zIndex: 1,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700,
            color: accent, letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 18, height: 1, backgroundColor: accent }} />
            Categoría principal
          </span>
          <h3 className="vp-font-display" style={{
            position: 'relative', zIndex: 1,
            marginTop: 16, marginBottom: 0,
            fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700,
            color: Cur.ink, lineHeight: 1.0,
            letterSpacing: "-0.03em", textTransform: 'capitalize',
          }}>
            {cat.nombre || cat.slug}
          </h3>
          {cat.descripcion && (
            <p style={{
              marginTop: 16, fontSize: 15, color: Cur.inkSoft,
              lineHeight: 1.6, maxWidth: 360, fontWeight: 400,
            }}>
              {cat.descripcion}
            </p>
          )}
        </div>

        {/* CTA inline */}
        <div style={{
          marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 700, color: Cur.ink,
          alignSelf: 'flex-start',
          padding: '10px 18px', borderRadius: 999,
          backgroundColor: Cur.surfaceAlt,
          border: `1px solid ${hovered ? accent : Cur.border}`,
          transition: 'border-color 220ms ease, color 220ms ease, background-color 220ms ease',
        }}>
          Explorar {(cat.nombre || cat.slug).toLowerCase()}
          <FontAwesomeIcon
            icon={faArrowRightLong}
            style={{
              fontSize: 12,
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
      </div>

      {/* ── Lado derecho: imagen ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        backgroundImage: `url('${img}')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transition: 'transform 800ms cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
      }}>
        {/* Tinte de color de la categoría en hover */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${accent}10 0%, transparent 55%)`,
          mixBlendMode: 'multiply',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 400ms ease',
          pointerEvents: 'none',
        }} />
      </div>
    </button>
  );
}

/* ─── Card mini (categorías secundarias) ─────────────────────────────────── */
function MiniCategoryCard({ Cur, cat, img, accent, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const n = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => navigate(`/tienda?categoria=${encodeURIComponent(cat.slug || cat.nombre || '')}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: 14, borderRadius: 20,
        backgroundColor: Cur.surface,
        border: `1px solid ${hovered ? accent + '55' : Cur.border}`,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        fontFamily: 'inherit',
        transition: "border-color 280ms ease, box-shadow 280ms ease, transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 16px 32px -16px ${accent}40, 0 2px 6px -2px rgba(10,20,38,0.05)`
          : "0 1px 0 rgba(10,20,38,0.02)",
      }}
    >
      {/* Thumb */}
      <div style={{
        width: 88, height: 88, borderRadius: 14, flexShrink: 0,
        backgroundImage: `url('${img}')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${accent}15 0%, transparent 60%)`,
          mixBlendMode: 'multiply',
        }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          marginBottom: 4,
        }}>
          <span className="vp-font-display" style={{
            fontSize: 13, fontWeight: 200, fontStyle: 'italic',
            color: accent, letterSpacing: '-0.01em',
          }}>
            {n}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: Cur.inkMuted, letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Categoría
          </span>
        </div>
        <h4 className="vp-font-display" style={{
          margin: 0, fontSize: 20, fontWeight: 700, color: Cur.ink,
          lineHeight: 1.1, letterSpacing: '-0.02em', textTransform: 'capitalize',
        }}>
          {cat.nombre || cat.slug}
        </h4>
        {cat.descripcion && (
          <p style={{
            margin: '4px 0 0', fontSize: 12.5, color: Cur.inkSoft,
            lineHeight: 1.45,
            display: '-webkit-box', WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1, overflow: 'hidden',
          }}>
            {cat.descripcion}
          </p>
        )}
      </div>

      {/* Arrow indicator */}
      <FontAwesomeIcon
        icon={faArrowRight}
        style={{
          fontSize: 13, color: hovered ? accent : Cur.inkMuted,
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1), color 200ms ease',
          flexShrink: 0,
        }}
      />
    </button>
  );
}

export default function CategoriasLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/categorias')
      .then(r => {
        const arr = Array.isArray(r.data) ? r.data : (r.data?.categorias || []);
        // Merge: API names + fallback descriptions (si no traen)
        const conDesc = arr.slice(0, 4).map((c, i) => ({
          ...c,
          descripcion: c.descripcion || FALLBACK_CATEGORIAS[i]?.descripcion || null,
        }));
        if (conDesc.length) setCats(conDesc);
        else setCats(FALLBACK_CATEGORIAS);
      })
      .catch(() => setCats(FALLBACK_CATEGORIAS));
  }, []);

  const accents = [Cur.lime, Cur.navy, Cur.red, Cur.purple];

  if (!cats.length) return null;

  const hero = cats[0];
  const minis = cats.slice(1, 4);

  return (
    <section id="categorias" style={{
      backgroundColor: Cur.surfaceAlt,
      transition: "background-color 400ms ease",
    }}>
      <style>{`
        @keyframes vp-mesh-shift {
          0%   { background-position: 0% 50%, 100% 50%; }
          50%  { background-position: 100% 50%, 0% 50%; }
          100% { background-position: 0% 50%, 100% 50%; }
        }
      `}</style>

      <div style={{ height: 32 }} aria-hidden="true" />
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '80px 24px',
      }}>
        {/* Header */}
        <Reveal>
          <div className="vp-cat-header" style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 24, marginBottom: 48,
          }}>
            <div style={{ maxWidth: 620 }}>
              <SectionEyebrow>Categorías</SectionEyebrow>
              <TypeReveal
                as="h2"
                className="vp-font-display"
                style={{
                  marginTop: 14, marginBottom: 12,
                  fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 1.0,
                  fontWeight: 700, color: Cur.ink,
                  letterSpacing: "-0.025em",
                }}
                segments={[
                  { text: "Lo que necesitas, " },
                  { text: "organizado.", color: Cur.navy },
                ]}
              />
              <p style={{
                margin: 0, fontSize: 15, color: Cur.inkSoft,
                lineHeight: 1.55, maxWidth: 480,
              }}>
                Cuatro estantes principales. Cada categoría tiene su propia lógica de surtido —
                desde concentrados premium hasta antiparasitarios con trazabilidad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tienda')}
              className="vp-link-underline"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: Cur.navy,
                fontFamily: 'inherit', padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Ver toda la tienda <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </button>
          </div>
        </Reveal>

        {/* Bento asimétrico */}
        <div className="vp-cat-bento" style={{
          display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20,
          alignItems: 'stretch',
        }}>
          {/* Hero */}
          <Reveal variant="vp-reveal-card">
            <HeroCategoryCard
              Cur={Cur}
              cat={hero}
              img={FALLBACK_IMGS[0]}
              accent={accents[0]}
            />
          </Reveal>

          {/* Stack de 3 */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {minis.map((c, i) => (
              <Reveal key={c.id || c.slug || i} variant="vp-reveal-card" delay={(i + 1) * 80}>
                <MiniCategoryCard
                  Cur={Cur}
                  cat={c}
                  img={FALLBACK_IMGS[i + 1] || FALLBACK_IMGS[0]}
                  accent={accents[i + 1] || Cur.navy}
                  index={i + 1}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 32 }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) {
          .vp-cat-bento  { grid-template-columns: 1fr !important; }
          .vp-cat-hero   { grid-template-columns: 1fr !important; }
          .vp-cat-hero > div:last-child { min-height: 240px; }
          .vp-cat-hero-body { padding: 28px 24px !important; min-height: auto !important; }
        }
      `}</style>
    </section>
  );
}
