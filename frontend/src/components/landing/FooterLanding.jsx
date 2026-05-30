// src/components/landing/FooterLanding.jsx
// Footer split inspirado en Kresna:
//  LEFT  → card navy oscuro con brand + tagline + redes (la identidad fuerte)
//  RIGHT → card claro con cols de links + newsletter inline (lo funcional)
// Resaltado con bg navyDeep en toda la sección + cards flotantes.
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone, faLocationDot, faClock, faEnvelope, faPaw,
  faArrowRight, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF, faInstagram, faWhatsapp, faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { useLandingPalette } from "./landing.utils.jsx";

export default function FooterLanding() {
  const { Cur } = useLandingPalette();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setEnviado(true);
    setTimeout(() => setEnviado(false), 2400);
    const subject = encodeURIComponent('Suscripción al newsletter Victoria Pets');
    const body = encodeURIComponent(`Hola, quiero suscribirme al newsletter.\nMi email es: ${email}`);
    window.location.href = `mailto:hola@victoriapets.com?subject=${subject}&body=${body}`;
  };

  const COLS = [
    {
      titulo: "Tienda",
      links: [
        { to: "/tienda",   label: "Catálogo" },
        { to: "/galeria",  label: "Galería"  },
        { to: "/contacto", label: "Contacto" },
      ],
    },
    {
      titulo: "Cuenta",
      links: [
        { to: "/login",       label: "Iniciar sesión" },
        { to: "/registro",    label: "Crear cuenta"   },
        { to: "/perfil",      label: "Mi perfil"      },
        { to: "/mis-ordenes", label: "Mis órdenes"    },
      ],
    },
  ];

  const REDES = [
    { icon: faInstagram, href: '#instagram', label: 'Instagram' },
    { icon: faWhatsapp,  href: 'https://wa.me/573105554321', label: 'WhatsApp' },
    { icon: faFacebookF, href: '#facebook',  label: 'Facebook' },
    { icon: faTiktok,    href: '#tiktok',    label: 'TikTok'  },
  ];

  return (
    <footer id="nosotros" style={{
      position: 'relative',
      backgroundColor: Cur.navyDeep,  /* ← bg fuerte que resalta */
      padding: '64px 24px 32px',
      overflow: 'hidden',
    }}>
      {/* Glow lime en una esquina — identidad sutil sin saturar */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-120px', right: '-100px',
        width: 420, height: 420, borderRadius: 999,
        background: `radial-gradient(circle, ${Cur.lime}20 0%, transparent 65%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }}/>
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-180px', left: '-60px',
        width: 360, height: 360, borderRadius: 999,
        background: `radial-gradient(circle, ${Cur.navy}55 0%, transparent 70%)`,
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1240, margin: '0 auto',
      }}>
        {/* ── Split cards: navy izq + light der ── */}
        <div className="vp-foot-split" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: 18,
        }}>
          {/* ─────────── LEFT: navy card con brand identity ─────────── */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(160deg, ${Cur.navy} 0%, ${Cur.navyDeep} 100%)`,
            borderRadius: 24,
            padding: '32px 28px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 360,
            color: '#FAF7F0',
          }}>
            {/* Mesh sutil de fondo (decorativo) */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: '-40%', right: '-30%',
              width: '120%', height: '120%',
              background: `
                radial-gradient(circle at 30% 30%, ${Cur.lime}1F 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, ${Cur.navy}55 0%, transparent 50%)
              `,
              backgroundSize: '200% 200%',
              animation: 'vp-foot-mesh 16s ease-in-out infinite',
              pointerEvents: 'none',
            }}/>

            {/* Logo + brand */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                marginBottom: 18,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: Cur.lime, color: Cur.navyDeep,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FontAwesomeIcon icon={faPaw} style={{ fontSize: 15 }} />
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="vp-font-display" style={{
                    fontSize: 22, fontWeight: 700,
                    color: '#FAF7F0', letterSpacing: '-0.025em',
                    lineHeight: 1,
                  }}>
                    Victoria
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: Cur.lime, letterSpacing: '-0.005em',
                  }}>
                    Pets
                  </span>
                </div>
              </div>

              <p className="vp-font-display" style={{
                margin: 0, fontSize: 22, fontWeight: 400,
                fontStyle: 'italic',
                color: '#FAF7F0', lineHeight: 1.25,
                letterSpacing: '-0.02em', maxWidth: 320,
              }}>
                Cuidamos lo que llamas familia.
              </p>
              <p style={{
                marginTop: 12, fontSize: 13, color: 'rgba(250,247,240,0.62)',
                lineHeight: 1.55, maxWidth: 280,
              }}>
                Tienda veterinaria en Ibagué — surtido completo y entrega rápida.
              </p>
            </div>

            {/* Redes sociales */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(250,247,240,0.52)',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Síguenos
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {REDES.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={s.label}
                    style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#FAF7F0',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'background 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = Cur.lime;
                      e.currentTarget.style.borderColor = Cur.lime;
                      e.currentTarget.style.color = Cur.navyDeep;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.color = '#FAF7F0';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <FontAwesomeIcon icon={s.icon} style={{ fontSize: 14 }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ─────────── RIGHT: light card con links + newsletter ─────────── */}
          <div style={{
            background: Cur.surface,
            borderRadius: 24,
            padding: '32px 32px 28px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            {/* Top: links cols */}
            <div className="vp-foot-cols" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.1fr',
              gap: 32, alignItems: 'flex-start',
            }}>
              {COLS.map((c) => (
                <div key={c.titulo}>
                  <h4 style={{
                    fontSize: 11, fontWeight: 700, color: Cur.inkMuted,
                    margin: '0 0 14px',
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>
                    {c.titulo}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.links.map(l => (
                      <Link key={l.to} to={l.to} style={{
                        fontSize: 13, color: Cur.ink,
                        textDecoration: 'none', fontWeight: 500,
                        transition: 'color 150ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1)',
                        width: 'fit-content',
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = Cur.navy;
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = Cur.ink;
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Col 3: contacto */}
              <div>
                <h4 style={{
                  fontSize: 11, fontWeight: 700, color: Cur.inkMuted,
                  margin: '0 0 14px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  Contacto
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <a href="tel:+573105554321" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: Cur.ink, textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = Cur.navy)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = Cur.ink)}>
                    <FontAwesomeIcon icon={faPhone} style={{ fontSize: 10, color: Cur.navy }} />
                    +57 310 555 4321
                  </a>
                  <a href="mailto:hola@victoriapets.com" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: Cur.ink, textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = Cur.navy)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = Cur.ink)}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10, color: Cur.navy }} />
                    hola@victoriapets.com
                  </a>
                  <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8, color: Cur.inkSoft }}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10, color: Cur.navy, marginTop: 4 }} />
                    Cra. 5 #34-12, Ibagué
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: Cur.inkSoft }}>
                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 10, color: Cur.navy }} />
                    Lun–Sáb 8:00–19:00
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: tagline + newsletter inline (estilo Kresna) */}
            <div style={{
              marginTop: 28, paddingTop: 22,
              borderTop: `1px solid ${Cur.border}`,
            }}>
              <div className="vp-foot-news" style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                gap: 20, alignItems: 'center',
              }}>
                <div>
                  <p style={{
                    margin: 0, fontSize: 12, color: Cur.inkMuted,
                  }}>
                    No te pierdas nada.
                  </p>
                  <p className="vp-font-display" style={{
                    margin: '2px 0 0', fontSize: 18, fontWeight: 700,
                    color: Cur.ink, letterSpacing: '-0.02em', lineHeight: 1.2,
                  }}>
                    Recibe ofertas y novedades primero.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} style={{
                  display: 'flex', alignItems: 'stretch', gap: 0,
                  background: Cur.surfaceAlt,
                  border: `1px solid ${Cur.border}`,
                  borderRadius: 999, padding: 4,
                  width: 'min(360px, 100%)',
                }}>
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1, background: 'transparent',
                      border: 'none', outline: 'none',
                      fontSize: 13, color: Cur.ink,
                      fontFamily: 'inherit', padding: '8px 14px',
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px', borderRadius: 999,
                      backgroundColor: Cur.ink, color: Cur.canvas,
                      fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      transition: 'background-color 200ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = Cur.navy; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = Cur.ink; }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {enviado ? '✓ Enviado' : 'Suscribirme'}
                    {!enviado && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />}
                  </button>
                </form>
              </div>

              <p style={{
                marginTop: 10, fontSize: 10.5, color: Cur.inkMuted,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 9, color: Cur.limeDeep }} />
                Sin spam. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div style={{
          marginTop: 28, padding: '0 4px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
          fontSize: 11, color: 'rgba(250,247,240,0.50)',
        }}>
          <div>
            © 2026 Victoria Pets · Ibagué, Tolima · Todos los derechos reservados
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FAF7F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(250,247,240,0.50)'; }}>
              Privacidad
            </Link>
            <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FAF7F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(250,247,240,0.50)'; }}>
              Términos
            </Link>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <FontAwesomeIcon icon={faPaw} style={{ color: Cur.lime, fontSize: 9 }} />
              Hecho con cuidado
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vp-foot-mesh {
          0%, 100% { background-position: 0% 50%, 100% 50%; }
          50%      { background-position: 100% 50%, 0% 50%; }
        }
        @media (max-width: 900px) {
          .vp-foot-split { grid-template-columns: 1fr !important; }
          .vp-foot-cols  { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .vp-foot-news  { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
        @media (max-width: 520px) {
          .vp-foot-cols  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
