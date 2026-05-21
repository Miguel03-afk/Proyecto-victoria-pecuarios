// src/components/landing/GaleriaLightbox.jsx
// Modal full-screen para visualizar imágenes/videos de la galería.
// Keyboard: ESC cierra, ←/→ navegan. Click en backdrop cierra.
import { useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faChevronLeft, faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

/* Helpers de medios — mismo criterio que GaleriaAdmin */
const ytId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytEmbed = (url) => { const id = ytId(url); return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null; };
const vmId    = (url = "") => { const m = url.match(/vimeo\.com\/(\d+)/); return m ? m[1] : null; };
const vmEmbed = (url) => { const id = vmId(url); return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null; };

function MediaCentral({ item }) {
  if (!item) return null;
  // Imagen
  if (!item.esVideo) {
    return (
      <img
        src={item.url}
        alt={item.titulo || ''}
        style={{
          maxWidth: '90vw', maxHeight: '80vh',
          objectFit: 'contain', borderRadius: 18,
          boxShadow: '0 32px 80px -20px rgba(0,0,0,0.65)',
          display: 'block',
        }}
      />
    );
  }
  // Video YouTube
  const yt = ytEmbed(item.url);
  if (yt) return (
    <iframe
      src={yt}
      title={item.titulo || 'Video'}
      allow="autoplay; encrypted-media; fullscreen"
      style={{
        width: 'min(90vw, 960px)', aspectRatio: '16/9',
        borderRadius: 18, border: 'none',
        boxShadow: '0 32px 80px -20px rgba(0,0,0,0.65)',
      }}
    />
  );
  // Video Vimeo
  const vm = vmEmbed(item.url);
  if (vm) return (
    <iframe
      src={vm}
      title={item.titulo || 'Video'}
      allow="autoplay; fullscreen"
      style={{
        width: 'min(90vw, 960px)', aspectRatio: '16/9',
        borderRadius: 18, border: 'none',
        boxShadow: '0 32px 80px -20px rgba(0,0,0,0.65)',
      }}
    />
  );
  // Video local
  return (
    <video
      src={item.url}
      controls autoPlay
      style={{
        maxWidth: '90vw', maxHeight: '80vh',
        borderRadius: 18,
        boxShadow: '0 32px 80px -20px rgba(0,0,0,0.65)',
      }}
    />
  );
}

export default function GaleriaLightbox({ items, index, onClose, onIndexChange }) {
  const total = items.length;
  const open = index !== null && index >= 0 && index < total;

  const goPrev = useCallback(() => {
    if (!total) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (!total) return;
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  // Keyboard handlers + body scroll lock
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open) return null;
  const item = items[index];

  return (
    <>
      <style>{`
        @keyframes vp-lb-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .vp-lb-content { animation: vp-lb-in 300ms cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(10,20,38,0.94)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', cursor: 'zoom-out',
        }}
      >
        {/* Cerrar */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 48, height: 48, borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 18 }} />
        </button>

        {/* Flecha anterior */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Anterior"
            className="vp-lb-arrow"
            style={{
              position: 'absolute', left: 24, top: '50%',
              transform: 'translateY(-50%)',
              width: 52, height: 52, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms ease', zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
          </button>
        )}

        {/* Flecha siguiente */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Siguiente"
            className="vp-lb-arrow"
            style={{
              position: 'absolute', right: 24, top: '50%',
              transform: 'translateY(-50%)',
              width: 52, height: 52, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms ease', zIndex: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
          </button>
        )}

        {/* Contenido (no cierra al hacer click adentro) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="vp-lb-content"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            cursor: 'default', maxWidth: '92vw',
          }}
        >
          <MediaCentral item={item} />

          {/* Caption */}
          {(item.titulo || item.categoria || item.descripcion) && (
            <div style={{
              marginTop: 24, textAlign: 'center', color: '#fff',
              maxWidth: 600,
            }}>
              {item.categoria && (
                <div style={{
                  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#7BC142', fontWeight: 700, marginBottom: 8,
                }}>
                  {item.categoria}
                </div>
              )}
              {item.titulo && (
                <h3 style={{
                  margin: 0,
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: 'italic', fontSize: 22, fontWeight: 500,
                  letterSpacing: '-0.01em', lineHeight: 1.2,
                }}>
                  {item.titulo}
                </h3>
              )}
              {item.descripcion && (
                <p style={{
                  margin: '8px 0 0', fontSize: 14,
                  color: 'rgba(255,255,255,0.65)', lineHeight: 1.5,
                }}>
                  {item.descripcion}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Indicador "3 / 12" */}
        {total > 1 && (
          <div style={{
            position: 'absolute', bottom: 24, right: 24,
            fontSize: 13, color: 'rgba(255,255,255,0.6)',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
        )}
      </div>
    </>
  );
}
