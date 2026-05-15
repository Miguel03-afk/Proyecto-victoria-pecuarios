// src/components/landing/CategoriasLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { Reveal, TypeReveal, SectionEyebrow, useLandingPalette } from "./landing.utils.jsx";

import imgAlimento     from "../../assets/landing/hero-2-bottle.png";
import imgMedicamento  from "../../assets/landing/p6-pharmacy.png";
import imgAccesorios   from "../../assets/landing/p2-petting.png";
import imgHigiene      from "../../assets/landing/p5-sleep.png";

const FALLBACK_IMGS = [imgAlimento, imgMedicamento, imgAccesorios, imgHigiene];

function CategoryCard({ Cur, cat, accent, img, delay }) {
  const navigate = useNavigate();
  return (
    <Reveal variant="vp-reveal-card" delay={delay}>
      <button
        type="button"
        onClick={() => navigate(`/tienda?categoria=${encodeURIComponent(cat.slug || cat.nombre || '')}`)}
        className="vp-category-card"
        style={{
          display: 'block', position: 'relative', overflow: 'hidden',
          aspectRatio: "1 / 1.15", borderRadius: 24,
          backgroundImage: `linear-gradient(0deg, rgba(10,20,38,0.85) 0%, rgba(10,20,38,0.10) 60%, rgba(10,20,38,0) 100%), url('${img}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          textDecoration: "none", color: "#fff",
          border: 'none', cursor: 'pointer', width: '100%',
          fontFamily: 'inherit', textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 24px 40px -20px rgba(10,20,38,0.45)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
          <span style={{
            display: "inline-block",
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            color: accent,
            padding: "5px 10px", borderRadius: 999,
            marginBottom: 12,
          }}>
            CATEGORÍA
          </span>
          <h3 className="vp-font-display" style={{
            fontSize: 24, fontWeight: 500, lineHeight: 1.1, margin: 0,
            textTransform: 'capitalize',
          }}>
            {cat.nombre || cat.slug}
          </h3>
          {cat.descripcion && (
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
              {cat.descripcion}
            </div>
          )}
        </div>
      </button>
    </Reveal>
  );
}

const FALLBACK_CATEGORIAS = [
  { slug: "alimentos",    nombre: "Alimento" },
  { slug: "farmacologia", nombre: "Medicamentos" },
  { slug: "accesorios",   nombre: "Accesorios" },
  { slug: "higiene",      nombre: "Higiene" },
];

export default function CategoriasLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/categorias')
      .then(r => {
        const arr = Array.isArray(r.data) ? r.data : (r.data?.categorias || []);
        if (arr.length) setCats(arr.slice(0, 4));
        else setCats(FALLBACK_CATEGORIAS);
      })
      .catch(() => setCats(FALLBACK_CATEGORIAS));
  }, []);

  const accents = [Cur.lime, Cur.red, Cur.navy, Cur.purple];

  return (
    <section id="categorias" style={{
      backgroundColor: Cur.surfaceAlt,
      transition: "background-color 400ms ease",
    }}>
      <div style={{ height: 32 }} aria-hidden="true" />
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '80px 24px',
      }}>
        <Reveal>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 16, marginBottom: 48,
          }}>
            <div>
              <SectionEyebrow>Categorías</SectionEyebrow>
              <TypeReveal
                as="h2"
                className="vp-font-display"
                style={{
                  marginTop: 14, marginBottom: 0,
                  fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05,
                  fontWeight: 500, color: Cur.ink,
                }}
                text="Lo que necesitas, organizado."
              />
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

        <div className="vp-cat-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          {cats.map((c, i) => (
            <CategoryCard
              key={c.id || c.slug || i}
              Cur={Cur}
              cat={c}
              accent={accents[i % accents.length]}
              img={FALLBACK_IMGS[i % FALLBACK_IMGS.length]}
              delay={i * 80}
            />
          ))}
        </div>
      </div>
      <div style={{ height: 32 }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) { .vp-cat-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px) { .vp-cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
