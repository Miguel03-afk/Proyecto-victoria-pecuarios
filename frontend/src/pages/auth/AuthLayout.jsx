// src/pages/auth/AuthLayout.jsx
// Auth Layout v3 — paleta navy oscuro elegante + card flotante claro.
// Background: auth-bg.png con overlay navy + blobs flotantes animados.
// Sin video, sin steps, sin textos redundantes. Espaciado generoso.
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faTriangleExclamation, faPaw } from "@fortawesome/free-solid-svg-icons";
import authBg from "../../assets/auth/auth-bg.png";

/* ─── Paleta del módulo Auth ─────────────────────────────────────────────────
   El card del form ES claro (crema VP) y vive sobre un background oscuro
   (foto + overlay navy). Los inputs siguen siendo claros y visibles. */
export const AUTH_C = {
  /* Superficies del CARD (claro) */
  canvas:       '#FAF7F0',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F8F5EC',
  cardBg:       '#FAF7F0',

  /* Bordes */
  border:       '#EAE3D2',
  borderStrong: '#D6CDB7',
  inputBorder:  '#E0D9C5',
  inputBorderFocus: '#1E3A8A',

  /* Texto en el card (oscuro sobre claro) */
  fg:           '#0A1426',
  fgSoft:       'rgba(10,20,38,0.68)',
  fgMuted:      'rgba(10,20,38,0.45)',

  /* Texto sobre el fondo oscuro (logo, links arriba) */
  onDark:       '#FAF7F0',
  onDarkSoft:   'rgba(250,247,240,0.72)',
  onDarkMuted:  'rgba(250,247,240,0.50)',

  /* Marca */
  navy:         '#1E3A8A',
  navyDeep:     '#0A1426',
  navyMid:      '#152A66',
  lime:         '#7BC142',
  limeDeep:     '#5DA328',
  red:          '#DC2626',
  redSoft:      '#FEE2E2',
  redBorder:    '#FCA5A5',
  purple:       '#9B5DE5',

  /* CTA principal — navy sólido */
  ctaBg:        '#1E3A8A',
  ctaBgHover:   '#152A66',
  ctaText:      '#FAF7F0',

  /* Compat con código existente */
  card:         '#1E3A8A',
  cardBorder:   '#EAE3D2',
  inputBg:      '#FFFFFF',
  inputBgHover: '#F8FAFC',
};

/* ─── CSS global del módulo Auth ─────────────────────────────────────────── */
export const AUTH_CSS = `
  @keyframes vp-auth-cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  .vp-auth-card {
    animation: vp-auth-cardIn 700ms cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes vp-auth-shake {
    0%, 100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
  .vp-auth-shake { animation: vp-auth-shake 400ms ease-in-out; }

  /* Blobs flotantes — gradient circles que respiran lento */
  @keyframes vp-auth-blob-1 {
    0%, 100% { transform: translate(0, 0)        scale(1); }
    50%      { transform: translate(40px, -30px) scale(1.08); }
  }
  @keyframes vp-auth-blob-2 {
    0%, 100% { transform: translate(0, 0)         scale(1); }
    50%      { transform: translate(-50px, 40px)  scale(1.12); }
  }
  @keyframes vp-auth-blob-3 {
    0%, 100% { transform: translate(0, 0)        scale(1)    rotate(0deg); }
    50%      { transform: translate(20px, 30px)  scale(1.05) rotate(8deg); }
  }
  .vp-auth-blob {
    position: absolute;
    border-radius: 999px;
    filter: blur(80px);
    pointer-events: none;
    will-change: transform;
  }

  /* Halo del card — borde luminoso muy sutil */
  @keyframes vp-auth-halo {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 0.85; }
  }

  .vp-auth-input {
    transition: border-color 180ms var(--vp-ease-out),
                background-color 180ms var(--vp-ease-out),
                box-shadow 180ms var(--vp-ease-out);
  }
  .vp-auth-input:focus {
    border-color: ${AUTH_C.inputBorderFocus} !important;
    outline: none;
    box-shadow: 0 0 0 3px rgba(30,58,138,0.14);
  }

  .vp-auth-cta {
    transition: transform 200ms var(--vp-ease-out),
                background-color 180ms var(--vp-ease-out),
                box-shadow 200ms var(--vp-ease-out);
  }
  .vp-auth-cta:not(:disabled):hover {
    background-color: ${AUTH_C.ctaBgHover} !important;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px -10px rgba(30,58,138,0.55);
  }

  @media (prefers-reduced-motion: reduce) {
    .vp-auth-blob { animation: none !important; }
  }
`;

/* ─── AuthLayout principal ──────────────────────────────────────────────────
   Layout:
     - Si `welcomePanel` se pasa: split 2 columnas (welcome navy izq + card der).
       En mobile colapsa a 1 columna, welcome arriba sutil.
     - Si no: centrado con card único (legacy — compatible con reset/registro).
   Background: foto auth-bg.png con overlay navy + blobs animados.
   Topbar: brand clickable + "Volver al inicio".                              */
export default function AuthLayout({
  breadcrumb = '',
  children,
  welcomePanel = null,
  // legacy / no-op:
  // eslint-disable-next-line no-unused-vars
  heroStep, heroEyebrow, heroTitle, heroSubtitle,
}) {
  const navigate = useNavigate();

  return (
    <>
      <style>{AUTH_CSS}</style>

      <main className="vp-auth" style={{
        position: 'relative',
        minHeight: '100vh', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '88px 24px 32px',
        backgroundColor: AUTH_C.navyDeep,
        fontFamily: '"General Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        overflow: 'hidden',
      }}>
        {/* ─── Background image + overlay ─────────────────────────────── */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('${authBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(0.9)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(140deg,
            rgba(10,20,38,0.78) 0%,
            rgba(15,37,99,0.72) 45%,
            rgba(10,20,38,0.92) 100%)`,
        }} />

        {/* ─── Blobs animados sutiles ────────────────────────────────── */}
        <div className="vp-auth-blob" aria-hidden="true" style={{
          top: '-120px', left: '-100px',
          width: 380, height: 380,
          background: `radial-gradient(circle, ${AUTH_C.navy}88 0%, transparent 70%)`,
          opacity: 0.55,
          animation: 'vp-auth-blob-1 14s ease-in-out infinite',
          zIndex: 2,
        }} />
        <div className="vp-auth-blob" aria-hidden="true" style={{
          bottom: '-140px', right: '-120px',
          width: 440, height: 440,
          background: `radial-gradient(circle, ${AUTH_C.lime}55 0%, transparent 70%)`,
          opacity: 0.45,
          animation: 'vp-auth-blob-2 18s ease-in-out infinite',
          zIndex: 2,
        }} />
        <div className="vp-auth-blob" aria-hidden="true" style={{
          top: '40%', left: '55%',
          width: 320, height: 320,
          background: `radial-gradient(circle, ${AUTH_C.navyMid}66 0%, transparent 70%)`,
          opacity: 0.38,
          animation: 'vp-auth-blob-3 22s ease-in-out infinite',
          zIndex: 2,
        }} />

        {/* ─── Topbar ─────────────────────────────────────────────────── */}
        <header style={{
          position: 'absolute', top: 24, left: 24, right: 24, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          {/* Brand clickable */}
          <Link to="/" title="Volver al inicio" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            textDecoration: 'none',
            padding: '6px 10px', margin: '-6px -10px',
            borderRadius: 10,
            color: AUTH_C.onDark,
            transition: 'background 160ms var(--vp-ease-out)',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <FontAwesomeIcon icon={faPaw} style={{ fontSize: 14, color: AUTH_C.lime }} />
            <span style={{
              fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em',
              color: AUTH_C.onDark,
            }}>
              Victoria Pets
            </span>
          </Link>

          {/* Volver al inicio pill */}
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 36, padding: '0 16px', borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: AUTH_C.onDark,
            textDecoration: 'none',
            fontSize: 13, fontWeight: 500,
            fontFamily: 'inherit',
            transition: 'all 160ms var(--vp-ease-out)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />
            <span>Volver al inicio</span>
          </Link>
        </header>

        {/* ─── Contenedor: split (welcome+card) o single card ─────────── */}
        <div className="vp-auth-card vp-auth-wrap" style={{
          position: 'relative', zIndex: 5,
          width: '100%',
          maxWidth: welcomePanel ? 980 : 460,
          display: 'grid',
          gridTemplateColumns: welcomePanel ? '1fr 460px' : '1fr',
          gap: welcomePanel ? 28 : 0,
          alignItems: 'center',
        }}>
          {/* ── Welcome panel (opcional) — solo desktop ── */}
          {welcomePanel && (
            <div className="vp-auth-welcome" style={{
              position: 'relative',
              padding: '8px 16px 8px 0',
              color: AUTH_C.onDark,
            }}>
              {welcomePanel}
            </div>
          )}

          {/* ── Card del form ── */}
          <div style={{ position: 'relative' }}>
            {/* Halo decorativo detrás del card */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: -2, borderRadius: 26,
              background: `linear-gradient(135deg, ${AUTH_C.navy}, ${AUTH_C.lime})`,
              opacity: 0.35,
              filter: 'blur(18px)',
              animation: 'vp-auth-halo 6s ease-in-out infinite',
              zIndex: -1,
            }} />

            <div style={{
              position: 'relative',
              background: AUTH_C.cardBg,
              border: `1px solid ${AUTH_C.border}`,
              borderRadius: 24,
              padding: '40px clamp(24px, 4vw, 40px)',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            }}>
              {breadcrumb && (
                <p style={{
                  margin: '0 0 20px',
                  fontSize: 11, fontWeight: 600,
                  color: AUTH_C.fgMuted,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {breadcrumb}
                </p>
              )}

              {children}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .vp-auth-wrap { grid-template-columns: 1fr !important; max-width: 460px !important; }
          .vp-auth-welcome { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ─── AuthCard — wrapper transparente, mantiene shake ─────────────────────── */
export function AuthCard({ children, shake = false, style = {} }) {
  return (
    <div
      className={shake ? 'vp-auth-shake' : ''}
      style={{ width: '100%', background: 'transparent', padding: 0, ...style }}
    >
      {children}
    </div>
  );
}

/* ─── AuthInput — claro, alto contraste sobre card crema ────────────────── */
export function AuthInput({
  label, type = 'text', value, onChange, placeholder,
  required, autoComplete, leadingIcon, trailingButton, error, name, helper,
}) {
  return (
    <label style={{ display: 'block' }}>
      {label && (
        <span style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: AUTH_C.fg, marginBottom: 8,
        }}>
          {label}
        </span>
      )}
      <div style={{ position: 'relative' }}>
        {leadingIcon && (
          <span style={{
            position: 'absolute', left: 16, top: '50%',
            transform: 'translateY(-50%)',
            color: AUTH_C.fgMuted, pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            <FontAwesomeIcon icon={leadingIcon} style={{ fontSize: 14 }} />
          </span>
        )}
        <input
          name={name}
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          autoComplete={autoComplete}
          className="vp-auth-input"
          style={{
            width: '100%', height: 52,
            backgroundColor: AUTH_C.surface,
            border: `1px solid ${error ? AUTH_C.red : AUTH_C.inputBorder}`,
            borderRadius: 12,
            paddingLeft:  leadingIcon    ? 44 : 16,
            paddingRight: trailingButton ? 44 : 16,
            color: AUTH_C.fg, fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        {trailingButton}
      </div>
      {helper && !error && (
        <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: AUTH_C.fgMuted }}>
          {helper}
        </p>
      )}
      {error && (
        <div style={{
          marginTop: 6, fontSize: 12, color: AUTH_C.red,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {error}
        </div>
      )}
    </label>
  );
}

/* ─── AuthCTA — navy sólido, alto contacto ───────────────────────────────── */
export function AuthCTA({ children, loading, disabled, type = 'submit', onClick, icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="vp-auth-cta"
      style={{
        marginTop: 8, height: 54, width: '100%',
        backgroundColor: (loading || disabled) ? '#9CA3AF' : AUTH_C.ctaBg,
        color: AUTH_C.ctaText,
        fontWeight: 600, borderRadius: 14,
        fontSize: 15, border: 'none',
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        letterSpacing: '-0.005em',
      }}
    >
      {children}
      {icon && !loading && <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />}
    </button>
  );
}

/* ─── AuthAlert — error/info/success ─────────────────────────────────────── */
export function AuthAlert({ children, type = 'error' }) {
  const palette = {
    error:   { bg: AUTH_C.redSoft, border: AUTH_C.redBorder, fg: '#991B1B', icon: faTriangleExclamation },
    info:    { bg: '#EFF6FF',      border: '#BFDBFE',         fg: '#1E3A8A', icon: faTriangleExclamation },
    success: { bg: '#ECFDF5',      border: '#A7F3D0',         fg: '#065F46', icon: faCheck },
  }[type] || {};
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      backgroundColor: palette.bg,
      border: `1px solid ${palette.border}`,
      color: palette.fg, fontSize: 13, lineHeight: 1.5,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <FontAwesomeIcon icon={palette.icon} style={{ fontSize: 14, marginTop: 2, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}
