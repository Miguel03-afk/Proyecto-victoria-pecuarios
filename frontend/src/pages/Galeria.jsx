// src/pages/Galeria.jsx — página pública /galeria
// Grid masonry de toda la galería + filtros por categoría + paginación.
// Lee localStorage['galeria_victoria'] (mismo storage que GaleriaAdmin).
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages, faPlay, faFilter, faChevronLeft, faChevronRight,
  faArrowRight, faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import {
  Reveal, TypeReveal, SectionEyebrow, useLandingPalette, LANDING_CSS,
} from "../components/landing/landing.utils.jsx";
import GaleriaLightbox from "../components/landing/GaleriaLightbox.jsx";
import FooterLanding from "../components/landing/FooterLanding";

const STORAGE_KEY = "galeria_victoria";
const PAGE_SIZE = 12;

const cargarGaleria = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytThumb = (url) => { const id = ytId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; };

function ItemCard({ Cur, item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const thumb = !item.esVideo ? item.url : (ytThumb(item.url) || null);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: 'avoid', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
        borderRadius: 20, padding: 0, width: '100%',
        backgroundColor: Cur.surfaceAlt,
        border: `1px solid ${Cur.border}`,
        cursor: 'pointer', display: 'block',
        transition: 'transform 280ms ease, box-shadow 280ms ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 18px 36px -20px rgba(10,20,38,0.20)'
          : '0 4px 12px -8px rgba(10,20,38,0.08)',
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
            width: '100%', display: 'block', objectFit: 'cover',
            transition: 'transform 600ms ease',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      ) : item.esVideo ? (
        <video
          src={item.url} muted preload="metadata"
          style={{
            width: '100%', display: 'block', objectFit: 'cover',
            aspectRatio: '4 / 3',
          }}
        />
      ) : (
        <div style={{
          aspectRatio: '4 / 3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: Cur.inkMuted, fontSize: 28,
        }}>
          <FontAwesomeIcon icon={faImages} />
        </div>
      )}

      {item.esVideo && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 52, height: 52, borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.92)',
          color: Cur.navyDeep,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }}>
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 14, paddingLeft: 3 }} />
        </div>
      )}

      {(item.titulo || item.categoria) && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: Cur.surface,
          textAlign: 'left',
        }}>
          {item.categoria && (
            <div style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: Cur.lime, marginBottom: 4,
            }}>
              {item.categoria}
            </div>
          )}
          {item.titulo && (
            <div style={{
              fontSize: 13, fontWeight: 600, color: Cur.ink,
              lineHeight: 1.35,
              display: '-webkit-box', WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2, overflow: 'hidden',
            }}>
              {item.titulo}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default function Galeria() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [filtroCat, setFiltroCat]  = useState(searchParams.get('cat') || 'todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [page, setPage] = useState(Number(searchParams.get('p')) || 1);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Cargar items
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

  // Sincronizar filtros con la URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtroCat !== 'todas') params.set('cat', filtroCat);
    if (page > 1) params.set('p', String(page));
    setSearchParams(params, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroCat, page]);

  const categorias = useMemo(() => {
    const set = new Set(items.map(i => i.categoria).filter(Boolean));
    return ['todas', ...Array.from(set)];
  }, [items]);

  const filtrados = useMemo(() => {
    return items.filter(i => {
      if (filtroCat !== 'todas' && i.categoria !== filtroCat) return false;
      if (filtroTipo === 'imagen' && i.esVideo) return false;
      if (filtroTipo === 'video' && !i.esVideo) return false;
      return true;
    });
  }, [items, filtroCat, filtroTipo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageClamped = Math.min(Math.max(1, page), totalPaginas);
  const visibles = filtrados.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);

  // Mapear índice visible al índice real en filtrados (para lightbox)
  const openLightbox = (idxEnPage) => {
    setLightboxIdx((pageClamped - 1) * PAGE_SIZE + idxEnPage);
  };

  return (
    <>
      <style>{LANDING_CSS}</style>

      <div style={{ minHeight: '100vh', background: Cur.bg, color: Cur.ink }}>
        <Navbar />

        {/* Hero */}
        <section style={{
          padding: '64px 24px 32px',
          backgroundColor: Cur.bg,
          borderBottom: `1px solid ${Cur.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="vp-bg-blob" aria-hidden="true"
            style={{ top: -120, right: -80, width: 420, height: 420,
              backgroundColor: Cur.lime, opacity: 0.08 }}/>
          <div className="vp-bg-blob" aria-hidden="true"
            style={{ bottom: -100, left: -60, width: 360, height: 360,
              backgroundColor: Cur.navy, opacity: 0.06 }}/>

          <div style={{
            maxWidth: 1320, margin: '0 auto', textAlign: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <Reveal>
              <SectionEyebrow centered>Galería</SectionEyebrow>
            </Reveal>
            <TypeReveal
              as="h1"
              className="vp-font-display"
              style={{
                marginTop: 18, marginBottom: 0,
                fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.0,
                fontWeight: 500, color: Cur.ink, maxWidth: 820,
                marginLeft: "auto", marginRight: "auto",
              }}
              segments={[
                { text: "Pacientes que se " },
                { text: "vuelven historia.", italic: true, color: Cur.navy },
              ]}
            />
            <Reveal delay={80}>
              <p style={{
                marginTop: 18, fontSize: 16, color: Cur.inkSoft,
                lineHeight: 1.6, maxWidth: 560,
                marginLeft: "auto", marginRight: "auto",
              }}>
                Mascotas que han pasado por nuestra clínica y los momentos que valen la pena guardar.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Filtros */}
        {items.length > 0 && (
          <section style={{
            padding: '32px 24px 0',
            backgroundColor: Cur.bg,
          }}>
            <div style={{
              maxWidth: 1320, margin: '0 auto',
              display: 'flex', flexWrap: 'wrap', gap: 16,
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              {/* Categorías */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                alignItems: 'center',
              }}>
                <FontAwesomeIcon icon={faFilter}
                  style={{ fontSize: 12, color: Cur.inkMuted, marginRight: 4 }} />
                {categorias.map(cat => {
                  const activo = filtroCat === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setFiltroCat(cat); setPage(1); }}
                      style={{
                        padding: '7px 14px', borderRadius: 999,
                        backgroundColor: activo ? Cur.navy : 'transparent',
                        color: activo ? '#fff' : Cur.ink,
                        border: `1px solid ${activo ? Cur.navy : Cur.border}`,
                        fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                        textTransform: 'capitalize',
                        transition: 'all 200ms ease',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Tipo */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[
                  { key: 'todos',  label: 'Todos' },
                  { key: 'imagen', label: 'Imágenes' },
                  { key: 'video',  label: 'Videos' },
                ].map(t => {
                  const activo = filtroTipo === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => { setFiltroTipo(t.key); setPage(1); }}
                      style={{
                        padding: '7px 14px', borderRadius: 999,
                        backgroundColor: activo ? Cur.surfaceAlt : 'transparent',
                        color: activo ? Cur.ink : Cur.inkSoft,
                        border: `1px solid ${activo ? Cur.lineStrong : 'transparent'}`,
                        fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 200ms ease',
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Grid masonry */}
        <section style={{ padding: '32px 24px 96px', backgroundColor: Cur.bg }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            {items.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '96px 24px',
                backgroundColor: Cur.surface, borderRadius: 28,
                border: `1px dashed ${Cur.border}`,
                maxWidth: 600, margin: '0 auto',
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
                <h2 className="vp-font-display" style={{
                  margin: 0, fontSize: 26, fontWeight: 700, color: Cur.ink,
                  letterSpacing: '-0.025em', lineHeight: 1.1,
                }}>
                  Aún no hay fotos para mostrar.
                </h2>
                <p style={{
                  margin: '8px 0 24px', fontSize: 14, color: Cur.inkSoft,
                  lineHeight: 1.55,
                }}>
                  ¡Pronto vendrán historias de nuestros pacientes!
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/agendar-cita')}
                  style={{
                    padding: '12px 24px', borderRadius: 999,
                    backgroundColor: Cur.navy, color: '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} /> Agendar primera consulta
                </button>
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 24px',
                color: Cur.inkSoft,
              }}>
                <p style={{ fontSize: 14 }}>
                  No hay resultados para los filtros seleccionados.
                </p>
                <button
                  type="button"
                  onClick={() => { setFiltroCat('todas'); setFiltroTipo('todos'); }}
                  style={{
                    marginTop: 12, padding: '10px 20px', borderRadius: 999,
                    backgroundColor: 'transparent', color: Cur.navy,
                    border: `1.5px solid ${Cur.border}`,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  columnCount: 4, columnGap: 16,
                }} className="vp-galeria-masonry">
                  {visibles.map((item, i) => (
                    <ItemCard
                      key={item.id || `${pageClamped}-${i}`}
                      Cur={Cur}
                      item={item}
                      onClick={() => openLightbox(i)}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div style={{
                    marginTop: 48,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: 12,
                  }}>
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pageClamped === 1}
                      style={{
                        width: 40, height: 40, borderRadius: 999,
                        backgroundColor: pageClamped === 1 ? 'transparent' : Cur.surface,
                        color: pageClamped === 1 ? Cur.inkMuted : Cur.ink,
                        border: `1px solid ${Cur.border}`,
                        cursor: pageClamped === 1 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit',
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => {
                      const activo = num === pageClamped;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPage(num)}
                          style={{
                            minWidth: 40, height: 40, padding: '0 12px',
                            borderRadius: 999,
                            backgroundColor: activo ? Cur.navy : 'transparent',
                            color: activo ? '#fff' : Cur.ink,
                            border: `1px solid ${activo ? Cur.navy : Cur.border}`,
                            fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setPage(p => Math.min(totalPaginas, p + 1))}
                      disabled={pageClamped === totalPaginas}
                      style={{
                        width: 40, height: 40, borderRadius: 999,
                        backgroundColor: pageClamped === totalPaginas ? 'transparent' : Cur.surface,
                        color: pageClamped === totalPaginas ? Cur.inkMuted : Cur.ink,
                        border: `1px solid ${Cur.border}`,
                        cursor: pageClamped === totalPaginas ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit',
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
                    </button>
                  </div>
                )}

                <div style={{
                  marginTop: 16, textAlign: 'center', fontSize: 11,
                  color: Cur.inkMuted, fontVariantNumeric: 'tabular-nums',
                }}>
                  Mostrando {(pageClamped - 1) * PAGE_SIZE + 1}–
                  {Math.min(pageClamped * PAGE_SIZE, filtrados.length)} de {filtrados.length}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA agendar */}
        {items.length > 0 && (
          <section style={{
            padding: '64px 24px',
            backgroundColor: Cur.surfaceAlt,
            borderTop: `1px solid ${Cur.border}`,
          }}>
            <div style={{
              maxWidth: 960, margin: '0 auto', textAlign: 'center',
            }}>
              <Reveal>
                <h2 className="vp-font-display" style={{
                  fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 500,
                  color: Cur.ink, lineHeight: 1.1, margin: 0,
                }}>
                  ¿Quieres que tu mascota{' '}
                  <span style={{ color: Cur.navy }}>aparezca aquí</span>?
                </h2>
                <p style={{
                  marginTop: 14, fontSize: 15, color: Cur.inkSoft, lineHeight: 1.6,
                  maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
                }}>
                  Agenda una consulta y forma parte de nuestras historias.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/agendar-cita')}
                  className="vp-cta-primary"
                  style={{
                    marginTop: 28, padding: '14px 26px', borderRadius: 999,
                    backgroundColor: Cur.navy, color: '#fff',
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit',
                    boxShadow: `0 12px 24px -8px ${Cur.navy}55`,
                  }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} /> Agendar cita
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </Reveal>
            </div>
          </section>
        )}

        <FooterLanding />
      </div>

      {/* Lightbox */}
      <GaleriaLightbox
        items={filtrados}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onIndexChange={setLightboxIdx}
      />

      <style>{`
        @media (max-width: 1024px) { .vp-galeria-masonry { column-count: 3 !important; } }
        @media (max-width: 700px)  { .vp-galeria-masonry { column-count: 2 !important; } }
        @media (max-width: 420px)  { .vp-galeria-masonry { column-count: 1 !important; } }
      `}</style>
    </>
  );
}
