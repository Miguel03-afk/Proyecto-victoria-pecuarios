// src/components/landing/GaleriaLanding.jsx
// Pinterest-style masonry (CSS columns) — sin parallax raro.
// Cada tarjeta respeta su aspect ratio natural y fluye en columnas.
// Hover sutil: tinte + zoom mínimo, sin overlays con blur ni gradient borders.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faImages, faPlay, faExpand } from "@fortawesome/free-solid-svg-icons";
import { Reveal, TypeReveal, SectionEyebrow, useLandingPalette } from "./landing.utils.jsx";
import GaleriaLightbox from "./GaleriaLightbox.jsx";

const STORAGE_KEY = "galeria_victoria";

const cargarGaleria = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

/* Helpers de medios */
const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytThumb = (url) => {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};
function getThumbUrl(item) {
  if (!item) return null;
  if (!item.esVideo) return item.url;
  return ytThumb(item.url);
}

/* Pseudo-random pero estable por índice — varía aspect para sentir masonry
   incluso cuando la imagen no carga (placeholder). 4 alturas distintas. */
const ASPECTS = ["3 / 4", "1 / 1", "4 / 5", "3 / 4.5"];

/* ─── Pin individual ──────────────────────────────────────────────────────
   Card editorial Pinterest-style: imagen arriba, info siempre visible abajo,
   botón "Ver" pill que aparece en hover con efecto de slide-in.            */
function Pin({ Cur, item, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const thumb = getThumbUrl(item);
  const aspect = ASPECTS[index % ASPECTS.length];
  const isVideo = item.esVideo;

  // Sublabel — usa fecha si existe, sino tipo de medio
  const sublabel = item.fecha
    ? new Date(item.fecha).toLocaleDateString("es-CO", { month: "short", year: "numeric" })
    : (isVideo ? "Video" : "Foto");

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'block',
        width: '100%', marginBottom: 14,
        breakInside: 'avoid', WebkitColumnBreakInside: 'avoid',
        pageBreakInside: 'avoid',
        borderRadius: 18, overflow: 'hidden',
        backgroundColor: Cur.surface,
        border: `1px solid ${hovered ? Cur.navy + '33' : Cur.border}`,
        cursor: 'pointer', padding: 0,
        fontFamily: 'inherit',
        textAlign: 'left',
        boxShadow: hovered
          ? '0 22px 44px -20px rgba(10,20,38,0.22)'
          : '0 1px 0 rgba(10,20,38,0.02)',
        transition: 'border-color 220ms ease, box-shadow 360ms cubic-bezier(0.16,1,0.3,1), transform 360ms cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* IMAGEN */}
      <div style={{
        aspectRatio: aspect, width: '100%',
        position: 'relative', overflow: 'hidden',
        backgroundColor: Cur.surfaceAlt,
      }}>
        {thumb ? (
          <img
            src={thumb} alt={item.titulo || ''} loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 400ms ease, transform 800ms cubic-bezier(0.16,1,0.3,1)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : isVideo ? (
          <video
            src={item.url} muted preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: Cur.inkMuted,
          }}>
            <FontAwesomeIcon icon={faImages} style={{ fontSize: 28 }} />
          </div>
        )}

        {/* Play overlay si es video — siempre visible */}
        {isVideo && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48, height: 48, borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.94)',
            color: Cur.navyDeep,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
            ...(hovered ? { transform: 'translate(-50%, -50%) scale(1.06)' } : {}),
          }}>
            <FontAwesomeIcon icon={faPlay} style={{ fontSize: 14, paddingLeft: 3 }} />
          </div>
        )}

        {/* Botón "Ver" pill — slide-in desde abajo en hover */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          padding: '7px 14px', borderRadius: 999,
          backgroundColor: Cur.canvas, color: Cur.ink,
          fontSize: 12, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: '0 8px 20px -8px rgba(10,20,38,0.35)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 240ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: 'none',
        }}>
          <FontAwesomeIcon icon={faExpand} style={{ fontSize: 10 }} />
          Ver
        </div>
      </div>

      {/* INFO ABAJO — siempre visible (estilo "Medication Made") */}
      <div style={{
        padding: '12px 14px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 700,
            color: Cur.inkMuted, letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 2,
          }}>
            {sublabel}
          </div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: Cur.ink,
            lineHeight: 1.3, letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.titulo || 'Sin título'}
          </div>
        </div>
        {/* Arrow indicator que se desplaza en hover */}
        <span style={{
          width: 24, height: 24, borderRadius: 999,
          backgroundColor: hovered ? Cur.navy : Cur.surfaceAlt,
          color: hovered ? Cur.canvas : Cur.ink,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 220ms ease, color 220ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1)',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
        }}>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 9 }} />
        </span>
      </div>
    </button>
  );
}

export default function GaleriaLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    const load = () => setItems(cargarGaleria());
    load();
    window.addEventListener('storage', load);
    window.addEventListener('focus', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('focus', load);
    };
  }, []);

  // Mostramos hasta 12 pins en la landing
  const visibles = items.slice(0, 12);
  const total = items.length;

  return (
    <section id="galeria" style={{
      backgroundColor: Cur.bg,
      position: 'relative', overflow: 'hidden',
      scrollMarginTop: 80,
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -120, right: -80, width: 420, height: 420,
          backgroundColor: Cur.lime, opacity: 0.08 }}/>

      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '96px 24px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div className="vp-gal-header" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 24, marginBottom: 48,
          flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: 580 }}>
            <Reveal>
              <SectionEyebrow>Galería</SectionEyebrow>
            </Reveal>
            <TypeReveal
              as="h2"
              className="vp-font-display"
              style={{
                marginTop: 14, marginBottom: 0,
                fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 1.0,
                fontWeight: 700, color: Cur.ink,
                letterSpacing: "-0.025em",
              }}
              segments={[
                { text: "Momentos que " },
                { text: "cuidamos.", color: Cur.navy },
              ]}
            />
            <Reveal delay={80}>
              <p style={{
                marginTop: 14, fontSize: 15, color: Cur.inkSoft,
                lineHeight: 1.55, maxWidth: 440,
              }}>
                Clientes, mascotas y momentos del día a día en la tienda.
              </p>
            </Reveal>
          </div>

          {visibles.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/galeria')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 999,
                backgroundColor: 'transparent', color: Cur.ink,
                border: `1.5px solid ${Cur.border}`,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 200ms ease, color 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = Cur.navy; e.currentTarget.style.color = Cur.navy; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = Cur.border; e.currentTarget.style.color = Cur.ink; }}
            >
              Ver galería completa <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </button>
          )}
        </div>

        {/* Empty state */}
        {visibles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            backgroundColor: Cur.surface, borderRadius: 24,
            border: `1px dashed ${Cur.border}`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `linear-gradient(135deg, ${Cur.lime}22 0%, ${Cur.navy}22 100%)`,
              color: Cur.navy,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <FontAwesomeIcon icon={faImages} style={{ fontSize: 22 }} />
            </div>
            <h3 className="vp-font-display" style={{
              margin: 0, fontSize: 22, fontWeight: 700, color: Cur.ink,
              letterSpacing: '-0.02em',
            }}>
              Aún no tenemos fotos para mostrar.
            </h3>
            <p style={{
              margin: '8px auto 0', fontSize: 13.5, color: Cur.inkSoft,
              maxWidth: 360, lineHeight: 1.55,
            }}>
              Pronto vendrán fotos de nuestros clientes y sus mascotas.
            </p>
          </div>
        ) : (
          <>
            {/* Pinterest masonry — CSS columns */}
            <div className="vp-masonry">
              {visibles.map((item, i) => (
                <Pin
                  key={item.id || i}
                  Cur={Cur}
                  item={item}
                  index={i}
                  onClick={() => setLightboxIdx(i)}
                />
              ))}
            </div>

            {/* CTA inferior si hay más fotos que las visibles */}
            {total > visibles.length && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button
                  type="button"
                  onClick={() => navigate('/galeria')}
                  style={{
                    padding: '12px 24px', borderRadius: 999,
                    backgroundColor: Cur.ink, color: Cur.canvas,
                    fontSize: 13, fontWeight: 700, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'background-color 200ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Ver las {total} fotos <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <GaleriaLightbox
        items={items}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onIndexChange={setLightboxIdx}
      />

      <style>{`
        /* Masonry con CSS columns (sin librería).
           Cada columna recibe sus pins; break-inside: avoid evita cortar. */
        .vp-masonry {
          column-count: 4;
          column-gap: 14px;
        }
        @media (max-width: 1100px) { .vp-masonry { column-count: 3; } }
        @media (max-width: 768px)  { .vp-masonry { column-count: 2; } }
        @media (max-width: 480px)  { .vp-masonry { column-count: 1; } }
      `}</style>
    </section>
  );
}
