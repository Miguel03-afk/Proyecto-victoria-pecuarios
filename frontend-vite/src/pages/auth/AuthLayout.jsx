// src/pages/auth/AuthLayout.jsx
// Container compartido por Login, Registro y VerificarOTP.
// Layout asimétrico con card oscuro a la izquierda sobre imagen full-bleed.
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import authBg from "../../assets/auth/auth-bg.png";

/* ─── Paleta fija del módulo Auth (siempre oscuro, no depende del tema) ──── */
export const AUTH_C = {
  card:         '#0F1729',
  cardBorder:   'rgba(255,255,255,0.08)',
  inputBg:      'rgba(255,255,255,0.04)',
  inputBorder:  'rgba(255,255,255,0.10)',
  inputBgHover: 'rgba(255,255,255,0.07)',
  fg:           '#FFFFFF',
  fgSoft:       'rgba(255,255,255,0.65)',
  fgMuted:      'rgba(255,255,255,0.40)',
  navy:         '#1E3A8A',
  navyDeep:     '#0F2563',
  lime:         '#7BC142',
  limeDeep:     '#5DA328',
  red:          '#E63946',
  purple:       '#9B5DE5',
};

/* ─── CSS global del módulo Auth ─────────────────────────────────────────── */
export const AUTH_CSS = `
  @keyframes vp-auth-cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vp-auth-card {
    animation: vp-auth-cardIn 600ms cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes vp-auth-shake {
    0%, 100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
  .vp-auth-shake { animation: vp-auth-shake 400ms ease-in-out; }

  .vp-auth-input {
    transition: border-color 200ms ease, background-color 200ms ease;
  }
  .vp-auth-input:focus {
    border-color: #7BC142 !important;
    outline: none;
  }

  .vp-auth-cta {
    transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
  }
  .vp-auth-cta:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px -8px rgba(255,255,255,0.3);
  }

  /* Fix: el calendario picker en input dark mode */
  .vp-auth input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) opacity(0.6);
    cursor: pointer;
  }
`;

export default function AuthLayout({ breadcrumb = '', children }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');
      `}</style>
      <style>{AUTH_CSS}</style>

      <div className="vp-auth" style={{
        minHeight: '100vh', width: '100%',
        position: 'relative', overflow: 'hidden',
        backgroundColor: AUTH_C.card,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        {/* Background image full-bleed */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${authBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}/>

        {/* Overlay gradient — más opaco a la izq donde va el card */}
        <div className="vp-auth-overlay" aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(15,23,41,0.92) 0%, rgba(15,23,41,0.70) 35%, rgba(15,23,41,0.30) 65%, rgba(15,23,41,0.0) 90%)',
        }}/>

        {/* Top bar */}
        <header style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'rgba(255,255,255,0.9)',
          }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                display: 'flex', flexDirection: 'column', lineHeight: 1,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 0, fontFamily: 'inherit',
              }}
            >
              <span style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 18, fontWeight: 600, color: '#fff',
                letterSpacing: '-0.02em',
              }}>
                Victoria
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                color: AUTH_C.lime, textTransform: 'uppercase',
                marginTop: 2,
              }}>
                Pecuarios
              </span>
            </button>
            {breadcrumb && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 8px' }}>/</span>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{breadcrumb}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Cerrar"
            style={{
              width: 36, height: 36, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </button>
        </header>

        {/* Card wrapper */}
        <main style={{
          position: 'relative', zIndex: 10,
          minHeight: '100vh',
          display: 'flex', alignItems: 'center',
          padding: '88px 24px 32px',
        }}>
          <div className="vp-auth-card-pos" style={{
            width: '100%', maxWidth: 440,
            marginLeft: 'clamp(0px, 8vw, 120px)',
          }}>
            {children}
          </div>
        </main>

        <style>{`
          @media (max-width: 768px) {
            .vp-auth-overlay {
              background: rgba(15,23,41,0.78) !important;
            }
            .vp-auth-card-pos {
              margin: 0 auto !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

/* ─── Card chrome (caja oscura con padding y animación) ──────────────────── */
export function AuthCard({ children, shake = false, style = {} }) {
  return (
    <div
      className={`vp-auth-card ${shake ? 'vp-auth-shake' : ''}`}
      style={{
        backgroundColor: AUTH_C.card,
        border: `1px solid ${AUTH_C.cardBorder}`,
        borderRadius: 20, padding: 32,
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Input reusable (con leading icon opcional + trailing button opcional) */
export function AuthInput({
  label, type = 'text', value, onChange, placeholder,
  required, autoComplete, leadingIcon, trailingButton, error, name,
}) {
  return (
    <label style={{ display: 'block' }}>
      {label && (
        <span style={{
          display: 'block', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: AUTH_C.fgMuted, marginBottom: 8,
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
            width: '100%', height: 48,
            backgroundColor: AUTH_C.inputBg,
            border: `1px solid ${error ? AUTH_C.red : AUTH_C.inputBorder}`,
            borderRadius: 14,
            paddingLeft:  leadingIcon    ? 44 : 16,
            paddingRight: trailingButton ? 44 : 16,
            color: AUTH_C.fg, fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        {trailingButton}
      </div>
      {error && (
        <div style={{
          marginTop: 6, fontSize: 11, color: AUTH_C.red,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {error}
        </div>
      )}
    </label>
  );
}
