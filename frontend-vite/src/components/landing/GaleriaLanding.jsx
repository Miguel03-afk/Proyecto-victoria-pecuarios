// src/components/landing/GaleriaLanding.jsx
// Sección galería: bento grid asimétrico + parallax vanilla.
// Lee de localStorage['galeria_victoria'] (mismo storage que GaleriaAdmin).
// TODO: cuando exista GET /api/galeria/publica, intercambiar la fuente.
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faImages, faPlay,
} from "@fortawesome/free-solid-svg-icons";
import {
  Reveal, TypeReveal, SectionEyebrow, useLandingPalette,
} from "./landing.utils.jsx";
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

/* Helpers de medios para preview */
const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytThumb = (url) => { const id = ytId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; };

function getThumbUrl(item) {
  if (!item) return null;
  if (!item.esVideo) return item.url;
  const yt = ytThumb(item.url);
  if (yt) return yt;
  return null; // video local sin thumb
}

/* Card individual del bento — usado también en parallax */
function GaleriaCard({ Cur, item, onClick, aspectRatio, rotate = 0 }) {
  const [hovered, setHovered] = useState(false);
  const thumb = getThumbUrl(item);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        aspectRatio, width: '100%',
        borderRadius: 24,
        backgroundColor: Cur.surfaceAlt,
        border: `1px solid ${Cur.border}`,
        cursor: 'pointer', padding: 0,
        transform: `rotate(${rotate}deg)`,
        transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms ease',
        boxShadow: hovered
          ? '0 28px 56px -28px rgba(10,20,38,0.35)'
          : '0 8px 20px -16px rgba(10,20,38,0.10)',
        fontFamily: 'inherit',
      }}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={item.titulo || ''}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      ) : item.esVideo ? (
        <video
          src={item.url}
          muted preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: Cur.inkMuted, fontSize: 32,
        }}>
          <FontAwesomeIcon icon={faImages} />
        </div>
      )}

      {/* Halftone overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(10,20,38,0.08) 1px, transparent 1px)',
        backgroundSize: '4px 4px',
        mixBlendMode: 'multiply', pointerEvents: 'none',
        opacity: 0.5,
      }}/>

      {/* Play icon si es video */}
      {item.esVideo && !hovered && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60, height: 60, borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.92)',
          color: Cur.navyDeep,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}>
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 18, paddingLeft: 4 }} />
        </div>
      )}

      {/* Hover overlay con label */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(250,247,240,0.82)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 400ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        {/* Label con gradient border animado */}
        <div style={{
          position: 'relative', padding: 2, borderRadius: 999,
          backgroundSize: '200% 200%',
          background: `linear-gradient(135deg, ${Cur.navy} 0%, ${Cur.lime} 50%, ${Cur.purple} 100%)`,
          animation: 'vp-grad-shift 6s ease infinite',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 999,
            backgroundColor: Cur.surface, color: Cur.ink,
            fontSize: 13, fontWeight: 600,
          }}>
            Ver —{' '}
            <em className="vp-font-display" style={{
              fontStyle: 'italic', color: Cur.navy, fontWeight: 600,
            }}>
              {item.titulo || 'Sin título'}
            </em>
          </span>
        </div>
      </div>
    </button>
  );
}

/* Card con parallax (factor de translateY relativo al scroll) */
function ParallaxCard({ Cur, item, factor, onClick, rotate }) {
  const ref = useRef(null);
  const [translate, setTranslate] = useState(0);

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // Cuando el card está centrado en viewport, offset 0.
        // Cuando se mueve, aplica factor.
        const center = rect.top + rect.height / 2;
        const diff = center - vh / 2;
        setTranslate(-diff * factor);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [factor]);

  return (
    <div ref={ref} style={{
      transform: `translateY(${translate}px)`,
      willChange: 'transform',
      transition: 'transform 80ms linear',
    }}>
      <GaleriaCard
        Cur={Cur} item={item} onClick={onClick}
        aspectRatio="1 / 1" rotate={rotate}
      />
    </div>
  );
}

export default function GaleriaLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Cargar + revalidar (storage event + intervalo bajo)
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

  const total = items.length;
  const bento = items.slice(0, 4);
  const parallax = items.slice(4, 10);

  return (
    <section id="galeria" style={{
      backgroundColor: Cur.bg,
      position: 'relative', overflow: 'hidden',
      scrollMarginTop: 80,
    }}>
      <style>{`
        @keyframes vp-grad-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

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
          <div style={{ maxWidth: 640 }}>
            <Reveal>
              <SectionEyebrow>Galería</SectionEyebrow>
            </Reveal>
            <TypeReveal
              as="h2"
              className="vp-font-display"
              style={{
                marginTop: 14, marginBottom: 0,
                fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05,
                fontWeight: 500, color: Cur.ink,
              }}
              segments={[
                { text: "Momentos que " },
                { text: "cuidamos.", italic: true, color: Cur.navy },
              ]}
            />
            <Reveal delay={80}>
              <p style={{
                marginTop: 14, fontSize: 15, color: Cur.inkSoft,
                lineHeight: 1.6, maxWidth: 460,
              }}>
                Cada visita nos deja una historia. Aquí van algunas de las nuestras —
                pacientes que vuelven con cola feliz y dueños que confían.
              </p>
            </Reveal>
          </div>

          <button
            type="button"
            onClick={() => navigate('/galeria')}
            className="vp-link-underline"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 999,
              backgroundColor: 'transparent', color: Cur.ink,
              border: `1.5px solid ${Cur.border}`,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = Cur.lime; e.currentTarget.style.color = Cur.navy; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = Cur.border; e.currentTarget.style.color = Cur.ink; }}
          >
            Ver galería completa <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
          </button>
        </div>

        {/* Empty state */}
        {total === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            backgroundColor: Cur.surface, borderRadius: 28,
            border: `1px dashed ${Cur.border}`,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${Cur.lime}22 0%, ${Cur.navy}22 100%)`,
              color: Cur.navy,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <FontAwesomeIcon icon={faImages} style={{ fontSize: 24 }} />
            </div>
            <h3 className="vp-font-display" style={{
              margin: 0, fontSize: 22, fontWeight: 500, color: Cur.ink,
              fontStyle: 'italic',
            }}>
              Aún no tenemos fotos para mostrar.
            </h3>
            <p style={{
              margin: '8px auto 0', fontSize: 14, color: Cur.inkSoft,
              maxWidth: 380, lineHeight: 1.55,
            }}>
              ¡Pronto vendrán historias de nuestros pacientes!
              <br/>
              <span style={{ fontSize: 12, color: Cur.inkMuted }}>
                (El admin puede agregarlas desde su panel)
              </span>
            </p>
          </div>
        ) : (
          <>
            {/* BENTO GRID */}
            <div className="vp-bento-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 20,
            }}>
              {bento.map((item, i) => {
                // Spans alternados: 7/5/5/7
                const spans = [7, 5, 5, 7];
                const span = spans[i] || 6;
                const aspect = span === 7 ? "4 / 3" : "1 / 1";
                return (
                  <div
                    key={item.id || i}
                    className={`vp-bento-cell vp-bento-span-${span}`}
                    style={{ gridColumn: `span ${span}` }}
                  >
                    <Reveal variant="vp-reveal-card" delay={(i % 2) * 80}>
                      <GaleriaCard
                        Cur={Cur} item={item}
                        aspectRatio={aspect}
                        onClick={() => setLightboxIdx(i)}
                      />
                    </Reveal>
                  </div>
                );
              })}
            </div>

            {/* PARALLAX (solo si hay ≥10 items) */}
            {total >= 10 && parallax.length === 6 && (
              <div style={{
                marginTop: 96, position: 'relative',
                minHeight: 'min(140vh, 1100px)',
              }}>
                {/* Header sticky centrado */}
                <div style={{
                  position: 'sticky',
                  top: '40vh',
                  textAlign: 'center', zIndex: 5,
                  pointerEvents: 'none',
                }}>
                  <Reveal>
                    <SectionEyebrow centered>Explora más</SectionEyebrow>
                  </Reveal>
                  <TypeReveal
                    as="h3"
                    className="vp-font-display"
                    style={{
                      marginTop: 14, marginBottom: 0,
                      fontSize: "clamp(28px, 3.5vw, 46px)", lineHeight: 1.05,
                      fontWeight: 500, color: Cur.ink,
                    }}
                    segments={[
                      { text: "Detrás de " },
                      { text: "la consulta.", italic: true, color: Cur.navy },
                    ]}
                  />
                  <Reveal delay={80}>
                    <p style={{
                      marginTop: 12, fontSize: 14, color: Cur.inkSoft,
                      lineHeight: 1.55, maxWidth: 440,
                      marginLeft: 'auto', marginRight: 'auto',
                    }}>
                      Lo que pasa cuando la puerta del consultorio se cierra y empieza el cuidado.
                    </p>
                  </Reveal>
                  <Reveal delay={140}>
                    <button
                      type="button"
                      onClick={() => navigate('/galeria')}
                      style={{
                        marginTop: 24,
                        padding: '12px 24px', borderRadius: 999,
                        backgroundColor: Cur.ink, color: '#fff',
                        fontSize: 13, fontWeight: 700, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        pointerEvents: 'auto',
                        boxShadow: '0 12px 24px -10px rgba(10,20,38,0.35)',
                      }}
                    >
                      Ver toda la galería <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                    </button>
                  </Reveal>
                </div>

                {/* Columnas parallax */}
                <div className="vp-parallax-cols" style={{
                  position: 'absolute', inset: 0,
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 'clamp(60px, 12vw, 180px)',
                  paddingTop: 80, paddingBottom: 80,
                  pointerEvents: 'none',
                  maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {[0, 2, 4].map((i) => parallax[i] && (
                      <div key={i} style={{
                        maxWidth: 280, pointerEvents: 'auto',
                        alignSelf: i === 2 ? 'flex-end' : (i === 0 ? 'flex-start' : 'center'),
                      }}>
                        <ParallaxCard
                          Cur={Cur} item={parallax[i]}
                          factor={0.05 + (i * 0.05)}
                          rotate={i % 2 === 0 ? -2 : 2}
                          onClick={() => setLightboxIdx(4 + i)}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 120 }}>
                    {[1, 3, 5].map((i) => parallax[i] && (
                      <div key={i} style={{
                        maxWidth: 280, pointerEvents: 'auto',
                        alignSelf: i === 3 ? 'flex-start' : (i === 1 ? 'flex-end' : 'center'),
                      }}>
                        <ParallaxCard
                          Cur={Cur} item={parallax[i]}
                          factor={0.08 + (i * 0.04)}
                          rotate={i % 2 === 0 ? -2 : 2}
                          onClick={() => setLightboxIdx(4 + i)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Si hay 4-9 items y NO se mostró parallax, CTA para ver más */}
            {total > 4 && total < 10 && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button
                  type="button"
                  onClick={() => navigate('/galeria')}
                  style={{
                    padding: '13px 26px', borderRadius: 999,
                    backgroundColor: Cur.ink, color: '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  Ver las {total} fotos <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <GaleriaLightbox
        items={items}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onIndexChange={setLightboxIdx}
      />

      <style>{`
        @media (max-width: 1024px) {
          .vp-bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vp-bento-cell { grid-column: span 1 !important; }
        }
        @media (max-width: 600px) {
          .vp-bento-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .vp-parallax-cols { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </section>
  );
}
