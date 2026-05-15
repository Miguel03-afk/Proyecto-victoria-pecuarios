// src/components/landing/HeroLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw, faCheck, faArrowRight, faArrowRightLong, faUserDoctor,
  faTruckFast, faShieldHalved, faStethoscope, faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { Reveal, useLandingPalette, money } from "./landing.utils.jsx";

// Photo wall — fotos editoriales del diseño Victoria Pets
import p1 from "../../assets/landing/p1-walk.png";
import p2 from "../../assets/landing/p2-petting.png";
import p3 from "../../assets/landing/p3-consult.png";
import p4 from "../../assets/landing/p4-app.png";
import p5 from "../../assets/landing/p5-sleep.png";
import p6 from "../../assets/landing/p6-pharmacy.png";
import hero1 from "../../assets/landing/hero-1-dog-exam.png";
import hero2 from "../../assets/landing/hero-2-bottle.png";
import hero3 from "../../assets/landing/hero-3-cat.png";
import hero4 from "../../assets/landing/hero-4-scale.png";

function HeroBullet({ Cur, children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
      fontSize: 14, fontWeight: 500, color: Cur.ink, marginBottom: 12 }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999,
        backgroundColor: `${Cur.lime}22`, color: Cur.limeDeep,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <FontAwesomeIcon icon={faPaw} style={{ fontSize: 11 }} />
      </span>
      <span style={{ lineHeight: 1.45 }}>{children}</span>
    </li>
  );
}

function HeroMarquee() {
  const colA = [
    { src: p2,    ar: "4 / 5"   },
    { src: hero1, ar: "3 / 4"   },
    { src: p4,    ar: "1 / 1"   },
    { src: hero3, ar: "4 / 5"   },
    { src: p1,    ar: "1 / 1.1" },
  ];
  const colB = [
    { src: p3,    ar: "4 / 5"   },
    { src: hero4, ar: "1 / 1.1" },
    { src: p5,    ar: "4 / 5"   },
    { src: p6,    ar: "1 / 1"   },
    { src: hero2, ar: "3 / 4"   },
  ];

  const photoStyle = (ar) => ({
    aspectRatio: ar,
    borderRadius: 20,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15), 0 8px 18px -12px rgba(10,20,38,0.20)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  });

  const Column = ({ items, dir, offset = 0 }) => (
    <div className="vp-marquee-mask" style={{ overflow: 'hidden', height: "100%" }}>
      <div
        className={`vp-marquee-track ${dir === "up" ? "vp-marquee-up" : "vp-marquee-down"}`}
        style={{ paddingTop: offset }}
      >
        {[...items, ...items].map((it, i) => (
          <div
            key={`${dir}-${i}`}
            style={{
              ...photoStyle(it.ar),
              backgroundImage: `url('${it.src}')`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      height: "min(640px, 78vh)",
    }}>
      <Column items={colA} dir="up"   offset={0}  />
      <Column items={colB} dir="down" offset={48} />
    </div>
  );
}

function TrustBand({ Cur }) {
  const items = [
    { icon: faTruckFast,    text: "Envío gratis · pedidos sobre $80.000" },
    { icon: faShieldHalved, text: "Pago seguro con ePayco" },
    { icon: faStethoscope,  text: "Veterinarios titulados" },
    { icon: faRotateLeft,   text: "Devoluciones hasta 7 días" },
  ];
  return (
    <div style={{
      backgroundColor: Cur.surface,
      borderTop:    `1px solid ${Cur.border}`,
      borderBottom: `1px solid ${Cur.border}`,
      transition:   "background-color 400ms ease, border-color 400ms ease",
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 24,
      }}>
        {items.map((it) => (
          <div key={it.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FontAwesomeIcon icon={it.icon} style={{ fontSize: 18, color: Cur.navy }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: Cur.ink, lineHeight: 1.35 }}>
              {it.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [precioConsulta, setPrecioConsulta] = useState(56000); // fallback

  // TODO: crear endpoint GET /api/config/precio_consulta_base — por ahora fallback
  useEffect(() => {
    api.get('/config/precio_consulta_base')
      .then(r => {
        const v = Number(r?.data?.valor);
        if (Number.isFinite(v) && v > 0) setPrecioConsulta(v);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="inicio" style={{ backgroundColor: Cur.bg }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div className="vp-hero-grid" style={{
          display: 'grid', gridTemplateColumns: '7fr 5fr',
          gap: 40, alignItems: 'center',
        }}>
          {/* LEFT */}
          <div>
            <Reveal>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backgroundColor: Cur.surface,
                padding: "6px 14px 6px 6px", borderRadius: 999,
                border: `1px solid ${Cur.border}`,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999,
                  backgroundColor: Cur.lime, color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: Cur.ink }}>
                  4.8 ★ · 1.247 familias en Ibagué
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="vp-font-display" style={{
                marginTop: 28, fontSize: "clamp(40px, 7vw, 76px)",
                lineHeight: 1.04, fontWeight: 500,
                color: Cur.ink, maxWidth: 580,
              }}>
                Tu mascota,
                <br />
                <span style={{ fontStyle: "italic", color: Cur.navy }}>nuestra familia.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0" }}>
                <HeroBullet Cur={Cur}>Veterinarios titulados disponibles 7 días a la semana</HeroBullet>
                <HeroBullet Cur={Cur}>Tienda con +500 productos y envío gratis sobre $80.000</HeroBullet>
                <HeroBullet Cur={Cur}>Agenda tu cita desde el celular en menos de 60 segundos</HeroBullet>
              </ul>
            </Reveal>

            <Reveal delay={240}>
              <div style={{
                marginTop: 36, display: 'flex', flexWrap: 'wrap',
                alignItems: 'center', gap: 20,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: Cur.inkMuted, fontWeight: 600,
                  }}>
                    Desde
                  </span>
                  <span className="vp-font-display vp-tabular" style={{
                    fontSize: 36, fontWeight: 500, color: Cur.ink, lineHeight: 1.05,
                  }}>
                    {money(precioConsulta)}
                  </span>
                  <span style={{ fontSize: 12, color: Cur.inkSoft }}>Consulta veterinaria · IVA incl.</span>
                </div>

                <div style={{ width: 1, height: 56, backgroundColor: Cur.border }} aria-hidden="true" />

                <button
                  className="vp-cta-primary"
                  onClick={() => navigate('/agendar-cita')}
                  style={{
                    backgroundColor: Cur.navy, color: "#fff",
                    padding: "14px 24px", borderRadius: 999,
                    fontSize: 14, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    boxShadow: `0 12px 24px -8px ${Cur.navy}55`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Cur.navyDeep)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Cur.navy)}
                >
                  Agendar cita <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12, marginLeft: 6 }} />
                </button>

                <button
                  type="button"
                  className="vp-link-underline"
                  onClick={() => navigate('/tienda')}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, color: Cur.ink,
                    fontFamily: 'inherit', padding: 0,
                  }}
                >
                  Ver tienda
                </button>
              </div>
            </Reveal>

            {/* Card flotante: navega a /equipo */}
            <Reveal delay={320}>
              <button
                type="button"
                onClick={() => navigate('/equipo')}
                style={{
                  marginTop: 40, display: 'flex', alignItems: 'center', gap: 16,
                  padding: 20, backgroundColor: Cur.surface,
                  border: `1px solid ${Cur.border}`, borderRadius: 20,
                  maxWidth: 380, width: '100%', textAlign: 'left',
                  boxShadow: "0 8px 20px -8px rgba(10,20,38,0.08)",
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px -12px rgba(10,20,38,0.15)';
                  e.currentTarget.style.borderColor = Cur.navy;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px -8px rgba(10,20,38,0.08)';
                  e.currentTarget.style.borderColor = Cur.border;
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 999,
                  background: `linear-gradient(135deg, ${Cur.lime} 0%, ${Cur.navy} 100%)`,
                  color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FontAwesomeIcon icon={faUserDoctor} style={{ fontSize: 16 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: Cur.ink, lineHeight: 1.3 }}>
                    Conoce a nuestro equipo y agenda con nosotros
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                    marginTop: 4, fontSize: 12, color: Cur.inkSoft }}>
                    <span>Veterinarios titulados</span>
                    <FontAwesomeIcon icon={faArrowRightLong} style={{ fontSize: 11 }} />
                  </div>
                </div>
              </button>
            </Reveal>
          </div>

          {/* RIGHT — photo wall */}
          <Reveal delay={100}>
            <HeroMarquee />
          </Reveal>
        </div>
      </div>

      <TrustBand Cur={Cur} />

      <style>{`
        @media (max-width: 900px) {
          .vp-hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
