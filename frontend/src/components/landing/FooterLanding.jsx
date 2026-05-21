// src/components/landing/FooterLanding.jsx
// Footer estilo tarjeta flotante — distintivo y elegante.
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone, faLocationDot, faClock, faEnvelope, faPaw,
  faArrowRight, faShieldHalved, faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF, faInstagram, faWhatsapp, faTiktok,
  faCcVisa, faCcMastercard, faCcPaypal,
} from "@fortawesome/free-brands-svg-icons";
import { useLandingPalette } from "./landing.utils.jsx";

const NEWSLETTER_MAILTO =
  'mailto:hola@victoriapets.com' +
  '?subject=' + encodeURIComponent('Suscripción al newsletter Victoria Pets') +
  '&body=' + encodeURIComponent('Hola, quiero suscribirme al newsletter.\nMi email es: ');

export default function FooterLanding() {
  const { Cur } = useLandingPalette();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Suscripción al newsletter Victoria Pets');
    const body = encodeURIComponent(`Hola, quiero suscribirme al newsletter.\nMi email es: ${email || '___'}`);
    window.location.href = `mailto:hola@victoriapets.com?subject=${subject}&body=${body}`;
  };

  const COLS = [
    {
      titulo: "Navegar",
      links: [
        { to: "/",             label: "Inicio" },
        { to: "/tienda",       label: "Tienda" },
        { to: "/agendar-cita", label: "Agendar cita" },
        { to: "/equipo",       label: "Nuestro equipo" },
        { to: "/galeria",      label: "Galería" },
        { to: "/contacto",     label: "Contacto" },
      ],
    },
    {
      titulo: "Cuenta",
      links: [
        { to: "/login",       label: "Iniciar sesión" },
        { to: "/registro",    label: "Crear cuenta" },
        { to: "/perfil",      label: "Mi perfil" },
        { to: "/mis-ordenes", label: "Mis órdenes" },
        { to: "/mis-citas",   label: "Mis citas" },
      ],
    },
  ];

  const REDES = [
    { icon: faFacebookF, href: '#facebook',  label: 'Facebook',  color: '#1877F2' },
    { icon: faInstagram, href: '#instagram', label: 'Instagram', color: '#E4405F' },
    { icon: faWhatsapp,  href: 'https://wa.me/573105554321', label: 'WhatsApp', color: '#25D366' },
    { icon: faTiktok,    href: '#tiktok',    label: 'TikTok',    color: '#0A1426' },
  ];

  return (
    <footer id="nosotros" style={{
      position: 'relative',
      backgroundColor: Cur.surfaceAlt,
      padding: '80px 24px 32px',
      overflow: 'hidden',
    }}>
      {/* Borde gradient superior */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${Cur.navy} 25%, ${Cur.lime} 50%, ${Cur.navy} 75%, transparent 100%)`,
      }}/>

      {/* Blobs decorativos */}
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -60, right: -100, width: 360, height: 360,
          backgroundColor: Cur.lime, opacity: 0.10 }}/>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ bottom: -120, left: -80, width: 320, height: 320,
          backgroundColor: Cur.navy, opacity: 0.08 }}/>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1320, margin: '0 auto',
      }}>
        {/* Tarjeta flotante */}
        <div style={{
          backgroundColor: Cur.surface,
          borderRadius: 28,
          padding: '48px 40px',
          border: `1px solid ${Cur.border}`,
          boxShadow: '0 24px 56px -28px rgba(10,20,38,0.18), 0 4px 12px -6px rgba(10,20,38,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Esquina decorativa con gradient */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: -80, right: -80,
            width: 240, height: 240, borderRadius: 999,
            background: `radial-gradient(circle, ${Cur.lime}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}/>

          <div className="vp-foot-top-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 48, alignItems: 'flex-start',
            position: 'relative', zIndex: 1,
          }}>
            {/* LEFT: Brand + tagline + newsletter */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span className="vp-font-display" style={{
                  fontSize: 46, fontWeight: 700,
                  color: Cur.ink, letterSpacing: "-0.03em",
                }}>
                  Victoria
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 600,
                  color: Cur.lime, marginTop: 6,
                }}>
                  Pets
                </span>
              </div>

              <p style={{
                marginTop: 20, fontSize: 14, color: Cur.inkSoft,
                lineHeight: 1.6, maxWidth: 380,
              }}>
                Veterinaria y tienda de productos para mascotas en Ibagué, Tolima.
                <br/>
                Cuidamos lo que llamas familia.
              </p>

              {/* Newsletter */}
              <form
                onSubmit={handleSubscribe}
                style={{
                  marginTop: 28, maxWidth: 420,
                }}
              >
                <label style={{
                  display: 'block', fontSize: 13,
                  color: Cur.ink, fontWeight: 600,
                  marginBottom: 10,
                }}>
                  Mantente al día
                </label>
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'stretch',
                  backgroundColor: Cur.surfaceAlt,
                  border: `1px solid ${Cur.border}`,
                  borderRadius: 999, padding: 4,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    flex: 1, paddingLeft: 16,
                  }}>
                    <FontAwesomeIcon icon={faEnvelope}
                      style={{ fontSize: 12, color: Cur.inkMuted }} />
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        flex: 1, background: 'transparent',
                        border: 'none', outline: 'none',
                        fontSize: 13, color: Cur.ink,
                        fontFamily: 'inherit', padding: '8px 0',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px', borderRadius: 999,
                      backgroundColor: Cur.navy, color: Cur.canvas,
                      fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      transition: 'background-color 200ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Cur.navyDeep)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Cur.navy)}
                  >
                    Suscribirme <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
                  </button>
                </div>
                <p style={{
                  marginTop: 10, fontSize: 11, color: Cur.inkMuted,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 10, color: Cur.lime }} />
                  Nunca compartimos tu email. Cancela cuando quieras.
                </p>
              </form>

              {/* Redes sociales */}
              <div style={{ marginTop: 28 }}>
                <div style={{
                  fontSize: 13, color: Cur.ink, fontWeight: 600,
                  marginBottom: 12,
                }}>
                  Síguenos
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {REDES.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={s.label}
                      style={{
                        width: 38, height: 38, borderRadius: 12,
                        backgroundColor: Cur.surfaceAlt,
                        color: Cur.ink, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = s.color;
                        e.currentTarget.style.color = Cur.canvas;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = Cur.surfaceAlt;
                        e.currentTarget.style.color = Cur.ink;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FontAwesomeIcon icon={s.icon} style={{ fontSize: 15 }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: 3 columnas de links + contacto */}
            <div className="vp-foot-links" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
            }}>
              {COLS.map((c) => (
                <div key={c.titulo}>
                  <h4 style={{
                    fontSize: 14, fontWeight: 700, color: Cur.ink,
                    margin: '0 0 16px',
                    letterSpacing: "-0.01em",
                  }}>
                    {c.titulo}
                  </h4>
                  {c.links.map(l => (
                    <Link key={l.to} to={l.to} style={{
                      display: 'block', padding: '6px 0',
                      fontSize: 13, color: Cur.inkSoft,
                      textDecoration: 'none',
                      transition: 'color 150ms ease, transform 150ms ease',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = Cur.navy;
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = Cur.inkSoft;
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{
            margin: '40px 0 24px', height: 1,
            backgroundColor: Cur.border,
          }} />

          {/* Contacto + métodos de pago */}
          <div className="vp-foot-bottom-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: 24, alignItems: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px 28px',
              fontSize: 12, color: Cur.inkSoft,
            }}>
              <a href="tel:+573105554321" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'inherit', textDecoration: 'none',
              }}>
                <FontAwesomeIcon icon={faPhone} style={{ fontSize: 10, color: Cur.navy }} />
                +57 310 555 4321
              </a>
              <a href="mailto:hola@victoriapets.com" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'inherit', textDecoration: 'none',
              }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 10, color: Cur.navy }} />
                hola@victoriapets.com
              </a>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10, color: Cur.navy }} />
                Cra. 5 #34-12, Ibagué
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faClock} style={{ fontSize: 10, color: Cur.navy }} />
                Lun–Sáb 8:00–19:00
              </span>
            </div>

            {/* Métodos de pago */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                fontSize: 12, color: Cur.inkSoft, fontWeight: 500,
              }}>
                Pagos
              </span>
              <div style={{ display: 'flex', gap: 8, fontSize: 22, color: Cur.inkSoft }}>
                <FontAwesomeIcon icon={faCcVisa} title="Visa" />
                <FontAwesomeIcon icon={faCcMastercard} title="Mastercard" />
                <FontAwesomeIcon icon={faCcPaypal} title="PayPal" />
                <FontAwesomeIcon icon={faCreditCard} title="ePayco" />
              </div>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div style={{
          marginTop: 32, padding: '0 16px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
          fontSize: 11, color: Cur.inkMuted,
        }}>
          <div>
            © 2026 Victoria Pets · Ibagué, Tolima · Todos los derechos reservados
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>
              Política de privacidad
            </Link>
            <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>
              Términos
            </Link>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faPaw} style={{ color: Cur.lime, fontSize: 10 }} />
              Hecho con cuidado
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .vp-foot-top-grid    { grid-template-columns: 1fr !important; gap: 32px !important; }
          .vp-foot-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .vp-foot-links { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  );
}
