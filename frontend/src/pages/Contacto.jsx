// src/pages/Contacto.jsx — info de contacto + form que abre mailto
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone, faLocationDot, faClock, faEnvelope,
  faPaperPlane, faArrowRight, faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import Navbar from "../components/Navbar";
import {
  Reveal, TypeReveal, SectionEyebrow, useLandingPalette, LANDING_CSS,
} from "../components/landing/landing.utils.jsx";
import FooterLanding from "../components/landing/FooterLanding";

const CONTACT_EMAIL = "hola@victoriapets.com";
const CONTACT_PHONE_TEL = "+576015550192";
const CONTACT_PHONE_DISPLAY = "(601) 555-0192";
const CONTACT_PHONE_WP = "573105554321";

export default function Contacto() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", asunto: "Consulta general", mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);

  const onChange = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cuerpo = encodeURIComponent(
      `Nombre: ${form.nombre}\n` +
      `Email: ${form.email}\n` +
      `Teléfono: ${form.telefono}\n\n` +
      `Mensaje:\n${form.mensaje}`
    );
    const subject = encodeURIComponent(`[Contacto web] ${form.asunto}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${cuerpo}`;
    setEnviado(true);
  };

  const inputBase = {
    width: "100%", padding: "12px 14px",
    background: Cur.surfaceAlt, border: `1px solid ${Cur.border}`,
    borderRadius: 12, color: Cur.ink, fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  };
  const labelBase = {
    display: 'block', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 0.8,
    color: Cur.inkMuted, marginBottom: 6,
  };

  const CONTACT_CARDS = [
    {
      icon: faPhone, color: Cur.navy, label: 'Teléfono',
      value: CONTACT_PHONE_DISPLAY, href: `tel:${CONTACT_PHONE_TEL}`,
      sub: 'Lun-Sáb · 8:00 a 19:00',
    },
    {
      icon: faWhatsapp, color: Cur.lime, label: 'WhatsApp',
      value: '+57 310 555 4321', href: `https://wa.me/${CONTACT_PHONE_WP}`,
      sub: 'Respondemos en minutos',
    },
    {
      icon: faEnvelope, color: Cur.purple, label: 'Email',
      value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`,
      sub: 'Respuesta en 24h hábiles',
    },
    {
      icon: faLocationDot, color: Cur.red, label: 'Dirección',
      value: 'Cra. 5 #34-12, Ibagué', href: 'https://maps.google.com/?q=Ibagué,Tolima',
      sub: 'Tolima, Colombia',
    },
  ];

  return (
    <>
      <style>{LANDING_CSS}</style>

      <div style={{ minHeight: '100vh', background: Cur.bg, color: Cur.ink }}>
        <Navbar />

        {/* Hero */}
        <section style={{
          padding: '64px 24px 48px',
          backgroundColor: Cur.bg,
          borderBottom: `1px solid ${Cur.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="vp-bg-blob" aria-hidden="true"
            style={{ top: -120, right: -80, width: 420, height: 420, backgroundColor: Cur.lime, opacity: 0.06 }}/>

          <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <SectionEyebrow centered>Contáctanos</SectionEyebrow>
            </Reveal>
            <TypeReveal
              as="h1"
              className="vp-font-display"
              style={{
                marginTop: 18, marginBottom: 0,
                fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.0,
                fontWeight: 500, color: Cur.ink, maxWidth: 800,
                marginLeft: "auto", marginRight: "auto",
              }}
              segments={[
                { text: "Estamos " },
                { text: "para escucharte.", italic: true, color: Cur.navy },
              ]}
            />
            <Reveal delay={80}>
              <p style={{
                marginTop: 18, fontSize: 16, color: Cur.inkSoft,
                lineHeight: 1.6, maxWidth: 580,
                marginLeft: "auto", marginRight: "auto",
              }}>
                Una consulta, una urgencia o solo una duda — respondemos por el canal que prefieras.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Tarjetas de contacto */}
        <section style={{ padding: '64px 24px 32px', backgroundColor: Cur.bg }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div className="vp-contact-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
            }}>
              {CONTACT_CARDS.map((c, i) => (
                <Reveal key={c.label} variant="vp-reveal-card" delay={i * 80}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'block', height: '100%',
                      padding: 24, borderRadius: 24,
                      backgroundColor: Cur.surface,
                      border: `1px solid ${Cur.border}`,
                      textDecoration: 'none', color: 'inherit',
                      transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 22px 44px -22px rgba(10,20,38,0.14)';
                      e.currentTarget.style.borderColor = `${c.color}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = Cur.border;
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      backgroundColor: `${c.color}15`, color: c.color,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <FontAwesomeIcon icon={c.icon} style={{ fontSize: 18 }} />
                    </div>
                    <div style={{
                      fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: Cur.inkMuted, fontWeight: 700,
                    }}>
                      {c.label}
                    </div>
                    <div style={{
                      fontSize: 16, fontWeight: 700, color: Cur.ink,
                      marginTop: 6, lineHeight: 1.3,
                    }}>
                      {c.value}
                    </div>
                    <div style={{
                      fontSize: 12, color: Cur.inkSoft, marginTop: 8,
                    }}>
                      {c.sub}
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Form + horarios */}
        <section style={{ padding: '32px 24px 96px', backgroundColor: Cur.bg }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div className="vp-contact-form-grid" style={{
              display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 40, alignItems: 'flex-start',
            }}>
              {/* LEFT: info y horarios */}
              <Reveal>
                <div style={{
                  padding: 32, borderRadius: 28,
                  backgroundColor: Cur.surface,
                  border: `1px solid ${Cur.border}`,
                }}>
                  <SectionEyebrow>Visítanos</SectionEyebrow>
                  <h2 className="vp-font-display" style={{
                    marginTop: 14, marginBottom: 0,
                    fontSize: 28, fontWeight: 500, color: Cur.ink,
                    lineHeight: 1.1,
                  }}>
                    Horarios de atención
                  </h2>
                  <p style={{ marginTop: 14, fontSize: 14, color: Cur.inkSoft, lineHeight: 1.6 }}>
                    Estamos abiertos toda la semana. Para urgencias después de horario,
                    llámanos al WhatsApp.
                  </p>

                  <div style={{ marginTop: 24, borderTop: `1px solid ${Cur.border}`, paddingTop: 20 }}>
                    {[
                      { dia: 'Lunes a Viernes', hora: '8:00 — 19:00' },
                      { dia: 'Sábado',          hora: '9:00 — 17:00' },
                      { dia: 'Domingo',         hora: '10:00 — 14:00' },
                      { dia: 'Urgencias',       hora: '24/7 vía WhatsApp', destaca: true },
                    ].map((h) => (
                      <div key={h.dia} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 0', borderBottom: `1px dashed ${Cur.border}`,
                      }}>
                        <span style={{
                          fontSize: 13, fontWeight: h.destaca ? 700 : 600,
                          color: h.destaca ? Cur.lime : Cur.ink,
                        }}>
                          {h.dia}
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: h.destaca ? 700 : 500,
                          color: h.destaca ? Cur.lime : Cur.inkSoft,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {h.hora}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    {[
                      { icon: faFacebookF, href: '#facebook',  color: Cur.navy },
                      { icon: faInstagram, href: '#instagram', color: Cur.red },
                      { icon: faWhatsapp,  href: `https://wa.me/${CONTACT_PHONE_WP}`, color: Cur.lime },
                    ].map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target={s.href.startsWith('http') ? '_blank' : undefined}
                        rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        style={{
                          width: 40, height: 40, borderRadius: 999,
                          backgroundColor: `${s.color}15`, color: s.color,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = s.color; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${s.color}15`; e.currentTarget.style.color = s.color; }}
                      >
                        <FontAwesomeIcon icon={s.icon} style={{ fontSize: 14 }} />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* RIGHT: form */}
              <Reveal delay={120}>
                <form
                  onSubmit={handleSubmit}
                  style={{
                    padding: 32, borderRadius: 28,
                    backgroundColor: Cur.surface,
                    border: `1px solid ${Cur.border}`,
                  }}
                >
                  <SectionEyebrow>Escríbenos</SectionEyebrow>
                  <h2 className="vp-font-display" style={{
                    marginTop: 14, marginBottom: 24,
                    fontSize: 28, fontWeight: 500, color: Cur.ink,
                    lineHeight: 1.1,
                  }}>
                    Cuéntanos qué necesitas
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label>
                      <span style={labelBase}>Nombre</span>
                      <input type="text" required value={form.nombre} onChange={onChange('nombre')}
                        placeholder="Tu nombre" style={inputBase} />
                    </label>
                    <label>
                      <span style={labelBase}>Email</span>
                      <input type="email" required value={form.email} onChange={onChange('email')}
                        placeholder="tu@email.com" style={inputBase} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <label>
                      <span style={labelBase}>Teléfono</span>
                      <input type="tel" value={form.telefono} onChange={onChange('telefono')}
                        placeholder="+57 300 000 0000" style={inputBase} />
                    </label>
                    <label>
                      <span style={labelBase}>Asunto</span>
                      <select value={form.asunto} onChange={onChange('asunto')} className="vp-bare"
                        style={{ ...inputBase, cursor: 'pointer' }}>
                        {['Consulta general', 'Productos / pedidos', 'Urgencia', 'Otro'].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label style={{ display: 'block', marginTop: 16 }}>
                    <span style={labelBase}>Mensaje</span>
                    <textarea required rows={5}
                      value={form.mensaje} onChange={onChange('mensaje')}
                      placeholder="Cuéntanos en detalle…"
                      style={{ ...inputBase, resize: 'vertical', minHeight: 120, lineHeight: 1.5 }}
                    />
                  </label>

                  {enviado && (
                    <div style={{
                      marginTop: 16, padding: '12px 16px', borderRadius: 12,
                      backgroundColor: `${Cur.lime}1F`, border: `1px solid ${Cur.lime}55`,
                      color: Cur.ink, fontSize: 13,
                    }}>
                      Se abrió tu cliente de email con el mensaje pre-cargado. Si no se abrió,
                      escríbenos directamente a <strong>{CONTACT_EMAIL}</strong>.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="vp-cta-primary"
                    style={{
                      marginTop: 24, padding: '14px 26px', borderRadius: 999,
                      backgroundColor: Cur.navy, color: '#fff',
                      fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: 'inherit',
                      boxShadow: `0 12px 24px -8px ${Cur.navy}55`,
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} /> Enviar mensaje
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA tienda */}
        <section style={{
          padding: '64px 24px',
          backgroundColor: Cur.surfaceAlt,
          borderTop: `1px solid ${Cur.border}`,
        }}>
          <div style={{
            maxWidth: 960, margin: '0 auto', textAlign: 'center',
          }}>
            <Reveal>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: 24, color: Cur.lime }} />
              </div>
              <h2 className="vp-font-display" style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 500,
                color: Cur.ink, lineHeight: 1.1, margin: 0,
              }}>
                ¿Prefieres explorar nuestra tienda?
              </h2>
              <p style={{
                marginTop: 14, fontSize: 15, color: Cur.inkSoft, lineHeight: 1.6,
                maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
              }}>
                Encuentra productos de calidad para el bienestar de tu mascota.
              </p>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 12, marginTop: 28, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/tienda')}
                  className="vp-cta-primary"
                  style={{
                    padding: '14px 26px', borderRadius: 999,
                    backgroundColor: Cur.navy, color: '#fff',
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit',
                    boxShadow: `0 12px 24px -8px ${Cur.navy}55`,
                  }}
                >
                  Ver productos <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <FooterLanding />
      </div>

      <style>{`
        @media (max-width: 1100px) { .vp-contact-grid      { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px)  { .vp-contact-grid      { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px)  { .vp-contact-form-grid { grid-template-columns: 1fr !important; gap: 24px !important; } }
      `}</style>
    </>
  );
}
