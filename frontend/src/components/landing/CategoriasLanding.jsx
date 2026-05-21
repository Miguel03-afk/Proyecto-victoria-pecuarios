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

/* Aspect ratios alternados por índice para romper la monotonía visual:
   índices pares (0, 2) son más altos, impares (1, 3) más cortos.
   El skill veta "identical card grids" — variar la silueta crea ritmo
   sin perder la grilla regular. */
function CategoryCard({ Cur, cat, accent, img, delay, index = 0 }) {
  const navigate = useNavigate();
  const aspectRatio = index % 2 === 0 ? "4 / 5.5" : "4 / 4.2";
  return (
    <Reveal variant="vp-reveal-card" delay={delay}>
      <button
        type="button"
        onClick={() => navigate(`/tienda?categoria=${encodeURIComponent(cat.slug || cat.nombre || '')}`)}
        className="vp-category-card"
        style={{
          display: 'block', position: 'relative', overflow: 'hidden',
          aspectRatio, borderRadius: 22,
          backgroundImage: `linear-gradient(0deg, rgba(10,20,38,0.78) 0%, rgba(10,20,38,0.15) 50%, rgba(10,20,38,0) 90%), url('${img}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          textDecoration: "none", color: "#FAF7F0",
          border: 'none', cursor: 'pointer', width: '100%',
          fontFamily: 'inherit', textAlign: 'left',
          transition: "box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 22px 40px -18px rgba(10,20,38,0.40)";
          e.currentTarget.style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: "20px 22px" }}>
          <span aria-hidden="true" style={{
            display: "inline-block",
            fontSize: 13, fontWeight: 600,
            color: accent,
            marginBottom: 8,
            letterSpacing: "-0.01em",
          }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="vp-font-display" style={{
            fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: 0,
            textTransform: 'capitalize',
            letterSpacing: "-0.025em",
          }}>
            {cat.nombre || cat.slug}
          </h3>
          {cat.descripcion && (
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6, lineHeight: 1.4 }}>
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
                  fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 1.0,
                  fontWeight: 700, color: Cur.ink,
                  letterSpacing: "-0.025em",
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
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
          alignItems: 'end',
        }}>
          {cats.map((c, i) => (
            <CategoryCard
              key={c.id || c.slug || i}
              Cur={Cur}
              cat={c}
              accent={accents[i % accents.length]}
              img={FALLBACK_IMGS[i % FALLBACK_IMGS.length]}
              delay={i * 80}
              index={i}
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
