// src/components/landing/landing.utils.jsx
// Hooks y componentes compartidos del Landing rediseño navy + lime.
import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../../styles/ThemeProvider.jsx";

/* ─── Paleta del landing ─────────────────────────────────────────────────────
   Mapea tokens del tema (C) a los nombres del diseño (Cur).
   Mantiene contratos: navy, lime, red, purple, bg, surface, surfaceAlt, border,
   ink, inkSoft, inkMuted, navyDeep, limeDeep, redDeep.
*/
export function useLandingPalette() {
  const { C, mode, toggle } = useTheme();
  const Cur = useMemo(() => ({
    navy:       C.navy        || C.brand,
    navyDeep:   C.navyDeep    || C.brandDark,
    lime:       C.lime,
    limeDeep:   C.limeDeep    || C.limeDark,
    red:        C.red         || '#E63946',
    redDeep:    C.redDeep     || '#C42836',
    purple:     C.purple      || '#9B5DE5',
    bg:         C.canvas,
    surface:    C.surface,
    surfaceAlt: C.surfaceAlt,
    border:     C.border      || C.line,
    ink:        C.ink,
    inkSoft:    C.inkSoft     || C.ink2,
    inkMuted:   C.inkMuted    || C.ink3,
  }), [C]);
  return { Cur, C, mode, toggle };
}

/* ─── Reveal-on-scroll (fade + lift; opcional re-hide al salir) ──────────── */
export function useReveal({ threshold = 0.12, once = true } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(el);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return [ref, visible];
}

export function Reveal({
  children,
  delay = 0,
  as: As = "div",
  className = "",
  style = {},
  variant = "vp-reveal",
  ...rest
}) {
  const [ref, visible] = useReveal();
  return (
    <As
      ref={ref}
      className={`${variant} ${visible ? "vp-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}
      {...rest}
    >
      {children}
    </As>
  );
}

/* ─── Scroll progress 0→1 mientras el elemento atraviesa la pantalla ────── */
export function useScrollProgress(ref, { startVH = 0.85, endVH = 0.25 } = {}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let rafId = null;
    const compute = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = vh * startVH;
      const end   = vh * endVH;
      const range = start - end;
      const passed = start - rect.top;
      const v = Math.max(0, Math.min(1, passed / range));
      setP(v);
    };
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, startVH, endVH]);
  return p;
}

/* ─── TypeReveal — palabras aparecen ligadas a scroll ─────────────────────
   Pasa `text` (string) o `segments` ([{text, italic, color}]) para destacar
   partes (ej. "tiempo, calma" en cursiva navy).
*/
export function TypeReveal({ text, segments, className = "", style = {}, as: As = "h2" }) {
  const ref = useRef(null);
  const p = useScrollProgress(ref, { startVH: 0.9, endVH: 0.45 });

  const words = useMemo(() => {
    if (segments && segments.length) {
      const arr = [];
      segments.forEach((seg) => {
        const parts = seg.text.split(/\s+/).filter(Boolean);
        parts.forEach((w) => arr.push({ word: w, italic: !!seg.italic, color: seg.color || null }));
      });
      return arr;
    }
    return (text || "").split(/\s+/).filter(Boolean).map((w) => ({ word: w, italic: false, color: null }));
  }, [text, segments]);

  const step = 1 / Math.max(1, words.length);

  return (
    <As ref={ref} className={className} style={style}>
      {words.map((w, i) => {
        const center = (i + 0.5) * step;
        const local = (p - center) / (step * 0.9) + 0.5;
        const t = Math.max(0, Math.min(1, local));
        return (
          <span key={i}>
            <span
              className="vp-tr-word"
              style={{
                opacity: t,
                transform: `translateY(${(1 - t) * 14}px)`,
                color: w.color || "inherit",
                fontStyle: w.italic ? "italic" : "inherit",
              }}
            >
              {w.word}
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </As>
  );
}

/* ─── Tilt3D — wraps con rotación 3D según mouse ──────────────────────────── */
export function Tilt3D({ children, max = 8, perspective = 900, className = "", style = {} }) {
  const inner = useRef(null);
  const onMove = (e) => {
    const el = inner.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
  };
  const onLeave = () => {
    const el = inner.current;
    if (!el) return;
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  };
  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ perspective: `${perspective}px`, ...style }}
    >
      <div ref={inner} className="vp-tilt-card" style={{ width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* Eyebrow de sección — sin uppercase tracked ni dashes decorativos.
   El patrón anterior repetido en cada sección caía en el ban de impeccable:
   "Repeated tiny uppercase tracked labels above every section heading."
   Ahora es un label limpio con peso 600 + color accent. */
export function SectionEyebrow({ children, color, centered = false }) {
  const { Cur } = useLandingPalette();
  const c = color || Cur.lime;
  return (
    <div style={{
      fontSize: 14, fontWeight: 600, color: c,
      textAlign: centered ? 'center' : 'left',
    }}>
      {children}
    </div>
  );
}

/* ─── Formateador COP ─────────────────────────────────────────────────────── */
export function money(n) {
  if (n == null) return "";
  return "$" + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });
}

/* ─── CSS global del landing (inyectar en Landing.jsx vía <style>) ────────── */
export const LANDING_CSS = `
  /* General Sans en todo. Jerarquía por peso (700+) y tamaño, no por familia
     diferente. Tracking ligeramente negativo solo en display sizes (≥40px). */
  .vp-font-display {
    font-family: 'General Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    letter-spacing: -0.02em;
    font-feature-settings: "ss01", "ss02";
  }
  .vp-tabular { font-variant-numeric: tabular-nums; }

  /* Reveal on scroll */
  .vp-reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .vp-reveal.vp-visible { opacity: 1; transform: translateY(0); }
  .vp-reveal-card {
    opacity: 0; transform: translateY(36px) scale(0.97);
    transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .vp-reveal-card.vp-visible { opacity: 1; transform: translateY(0) scale(1); }

  .vp-tr-word {
    display: inline-block;
    /* Emil: usar easing fuerte custom en lugar del ease-out CSS débil */
    transition: opacity 280ms var(--vp-ease-out), transform 280ms var(--vp-ease-out);
  }

  .vp-bg-blob {
    position: absolute; border-radius: 999px;
    filter: blur(80px); pointer-events: none; will-change: transform;
  }

  /* Marquee horizontal (testimonios) */
  @keyframes vp-marquee-x-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .vp-marquee-x {
    display: flex; gap: 20px; width: max-content;
    animation: vp-marquee-x-left 60s linear infinite;
    will-change: transform;
  }
  .vp-marquee-x-mask {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
  }
  .vp-marquee-x-mask:hover .vp-marquee-x { animation-play-state: paused; }

  /* Marquee vertical (hero photo wall) */
  @keyframes vp-marquee-up   { 0% { transform: translateY(0); }    100% { transform: translateY(-50%); } }
  @keyframes vp-marquee-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
  .vp-marquee-mask {
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
            mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  }
  .vp-marquee-track {
    display: flex; flex-direction: column; gap: 12px;
    will-change: transform;
  }
  .vp-marquee-up   { animation: vp-marquee-up   28s linear infinite; }
  .vp-marquee-down { animation: vp-marquee-down 32s linear infinite; }
  .vp-marquee-mask:hover .vp-marquee-track { animation-play-state: paused; }

  /* Float idle del booking panel */
  @keyframes vp-panelFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .vp-panel-float { animation: vp-panelFloat 7s ease-in-out infinite; }

  @keyframes vp-frameFloat {
    0%, 100% { transform: translateY(0) rotateZ(0deg); }
    50%      { transform: translateY(-8px) rotateZ(0.4deg); }
  }
  .vp-frame-float { animation: vp-frameFloat 9s ease-in-out infinite; }

  .vp-tilt-card {
    transform-style: preserve-3d;
    transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .vp-vet-swap {
    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .vp-vet-swap.vp-snap { transition: none; }

  .vp-link-underline { position: relative; }
  .vp-link-underline::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -4px;
    height: 1.5px; background: currentColor;
    transform: scaleX(0); transform-origin: left center;
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .vp-link-underline:hover::after { transform: scaleX(1); }

  .vp-cta-primary {
    transition: transform 250ms ease, background-color 250ms ease, box-shadow 250ms ease;
  }
  .vp-cta-primary:hover { transform: scale(1.01) translateY(-1px); }

  .vp-product-card { transition: transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease; }
  .vp-product-card:hover { transform: translateY(-4px); }

  .vp-category-card { transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease; }
  .vp-category-card:hover { transform: scale(1.02); }

  .vp-icon-heart { transition: background-color 200ms ease, color 200ms ease, transform 200ms ease; }

  select.vp-bare {
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%230A1426' opacity='0.5' d='M1 1l4 4 4-4'/></svg>");
    background-repeat: no-repeat; background-position: right 0 center;
    padding-right: 16px;
  }

  /* Hide scrollbar dentro del carrusel cuando no hace falta */
  .vp-no-scrollbar::-webkit-scrollbar { display: none; }
  .vp-no-scrollbar { scrollbar-width: none; }
`;
