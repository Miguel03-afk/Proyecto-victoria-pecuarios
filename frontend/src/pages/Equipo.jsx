// src/pages/Equipo.jsx — listado público del equipo veterinario
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faCircleCheck, faStar, faStethoscope,
  faPhone, faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";
import Navbar from "../components/Navbar";
import vetCamila from "../assets/landing/vet-camila.png";

const VET_PHOTO_OVERRIDES = { camila: vetCamila };
import {
  Reveal, TypeReveal, SectionEyebrow, useLandingPalette, LANDING_CSS,
} from "../components/landing/landing.utils.jsx";
import FooterLanding from "../components/landing/FooterLanding";

const STATIC = "http://localhost:3000";
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const FALLBACK_VETS = [
  { id: "f1", nombre: "Camila", apellido: "Mejía",   especialidad: "Medicina general",  descripcion: "Más de nueve años acompañando familias en Ibagué. Atención personalizada con seguimiento por WhatsApp.", disponibilidad: [{ dia: 1 }, { dia: 3 }, { dia: 5 }] },
  { id: "f2", nombre: "Javier", apellido: "Rojas",   especialidad: "Cirugía",           descripcion: "Doce años especializándose en cirugía de mínima invasión y ortopedia. Recuperación rápida y segura.",     disponibilidad: [{ dia: 2 }, { dia: 4 }] },
  { id: "f3", nombre: "María",  apellido: "López",   especialidad: "Nutrición",         descripcion: "Diseña planes nutricionales clínicos con resultados medibles mes a mes.",                                  disponibilidad: [{ dia: 1 }, { dia: 2 }, { dia: 4 }] },
  { id: "f4", nombre: "Andrés", apellido: "Quintero",especialidad: "Felinos · Comportamiento", descripcion: "Especialista en medicina felina y manejo libre de estrés. Sala silenciosa y feromonas.",     disponibilidad: [{ dia: 3 }, { dia: 5 }, { dia: 6 }] },
];

function VetCard({ Cur, vet, accent, delay }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const overrideKey = (vet.nombre || '').toLowerCase();
  const fotoUrl = vet.foto_url
    ? (vet.foto_url.startsWith('http') ? vet.foto_url : `${STATIC}${vet.foto_url}`)
    : (VET_PHOTO_OVERRIDES[overrideKey] || null);
  const initials = `${(vet.nombre || '?')[0]}${(vet.apellido || '')[0] || ''}`.toUpperCase();
  const titulo = vet.titulo || (vet.genero === 'F' ? 'Dra.' : 'Dr.');

  return (
    <Reveal variant="vp-reveal-card" delay={delay}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: Cur.surface,
          border: `1px solid ${hovered ? accent + "55" : Cur.border}`,
          borderRadius: 28, overflow: "hidden",
          height: "100%", display: "flex", flexDirection: "column",
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease, border-color 350ms ease",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hovered ? "0 22px 44px -22px rgba(10,20,38,0.18)" : "0 1px 0 rgba(10,20,38,0.02)",
        }}
      >
        {/* Portrait */}
        <div style={{
          aspectRatio: "4 / 5", position: 'relative', overflow: 'hidden',
          background: fotoUrl
            ? `url('${fotoUrl}') center top / cover`
            : `radial-gradient(120% 80% at 20% 0%, ${accent}33 0%, transparent 55%), linear-gradient(160deg, ${Cur.navyDeep} 0%, #0A1426 100%)`,
        }}>
          {!fotoUrl && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="vp-font-display" style={{
                fontStyle: "italic",
                fontSize: "clamp(72px, 10vw, 130px)",
                fontWeight: 500, color: accent,
                lineHeight: 1, letterSpacing: "-0.04em",
                textShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}>
                {initials}
              </span>
            </div>
          )}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(10,20,38,0) 50%, rgba(10,20,38,0.6) 100%)',
          }}/>
          <div style={{
            position: 'absolute', top: 16, right: 16,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            fontSize: 11, fontWeight: 700, color: Cur.navyDeep,
          }}>
            <FontAwesomeIcon icon={faStar} style={{ fontSize: 10, color: Cur.lime }} />
            4.9
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
            color: accent, fontWeight: 700,
          }}>
            {vet.especialidad || 'Veterinario'}
          </div>
          <h3 className="vp-font-display" style={{
            marginTop: 8, marginBottom: 0,
            fontSize: 24, fontWeight: 500, color: Cur.ink,
            lineHeight: 1.1, letterSpacing: "-0.015em",
          }}>
            <span style={{ fontStyle: 'italic' }}>{titulo} {vet.nombre} {vet.apellido}</span>
          </h3>
          <p style={{
            marginTop: 12, fontSize: 13, color: Cur.inkSoft,
            lineHeight: 1.55, flex: 1,
          }}>
            {vet.descripcion || 'Veterinario titulado del equipo Victoria Pets.'}
          </p>

          {/* Días disponibles */}
          {Array.isArray(vet.disponibilidad) && vet.disponibilidad.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 16 }}>
              <span style={{
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: Cur.inkMuted, fontWeight: 700, marginRight: 4,
              }}>Atiende:</span>
              {vet.disponibilidad.map((d, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  backgroundColor: `${accent}15`, color: accent,
                }}>
                  {DIAS[d.dia]}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 11, color: Cur.inkSoft }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ color: Cur.lime, fontSize: 11 }} />
            Tarjeta profesional vigente
          </div>

          <button
            type="button"
            onClick={() => navigate(`/agendar-cita?vet=${vet.id}`)}
            className="vp-cta-primary"
            style={{
              marginTop: 20, width: '100%',
              padding: '13px 18px', borderRadius: 999,
              backgroundColor: accent, color: '#fff',
              fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 12px 24px -10px ${accent}55`,
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Cur.navyDeep)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
          >
            Agendar con {vet.nombre} <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
          </button>
        </div>
      </article>
    </Reveal>
  );
}

export default function Equipo() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const [vets, setVets] = useState(FALLBACK_VETS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mounted = true;
    const tryLoad = async () => {
      const candidates = ['/citas/veterinarios', '/veterinarios', '/admin/veterinarios'];
      for (const ep of candidates) {
        try {
          const r = await api.get(ep);
          const arr = Array.isArray(r.data) ? r.data : (r.data?.veterinarios || []);
          if (mounted && arr.length) {
            setVets(arr.filter(v => v.activo !== 0 && v.activo !== false));
            setCargando(false);
            return;
          }
        } catch { /* siguiente */ }
      }
      if (mounted) setCargando(false);
    };
    tryLoad();
    return () => { mounted = false; };
  }, []);

  const accents = [Cur.navy, Cur.lime, Cur.purple, Cur.red];

  return (
    <>
      <style>{LANDING_CSS}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');
      `}</style>

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
            style={{ top: -120, right: -80, width: 420, height: 420, backgroundColor: Cur.navy, opacity: 0.05 }}/>

          <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <SectionEyebrow centered>Nuestro equipo</SectionEyebrow>
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
                { text: "Las manos que " },
                { text: "cuidarán", italic: true, color: Cur.navy },
                { text: " a tu mascota." },
              ]}
            />
            <Reveal delay={80}>
              <p style={{
                marginTop: 18, fontSize: 16, color: Cur.inkSoft,
                lineHeight: 1.6, maxWidth: 640,
                marginLeft: "auto", marginRight: "auto",
              }}>
                Veterinarios titulados, con especialidad y vocación. Elige con quién quieres que atiendan a tu compañero —
                la misma persona te recibe en cada visita.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Grid de vets */}
        <section style={{ padding: '64px 24px 96px', backgroundColor: Cur.bg }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            {cargando ? (
              <div className="vp-equipo-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
              }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    height: 540, borderRadius: 28,
                    background: Cur.surfaceAlt, border: `1px solid ${Cur.border}`,
                  }}/>
                ))}
              </div>
            ) : vets.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                backgroundColor: Cur.surface, borderRadius: 28,
                border: `1px solid ${Cur.border}`, color: Cur.inkSoft,
              }}>
                <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: 32, color: Cur.navy, marginBottom: 12 }} />
                <p style={{ fontSize: 16, fontWeight: 600 }}>No hay veterinarios disponibles en este momento</p>
                <p style={{ fontSize: 13, color: Cur.inkMuted, marginTop: 6 }}>
                  Contáctanos directamente para conocer la disponibilidad
                </p>
              </div>
            ) : (
              <div className="vp-equipo-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
              }}>
                {vets.map((v, i) => (
                  <VetCard
                    key={v.id}
                    Cur={Cur}
                    vet={v}
                    accent={accents[i % accents.length]}
                    delay={(i % 4) * 80}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA contacto */}
        <section style={{
          padding: '72px 24px',
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
                ¿No estás seguro de con quién agendar?
              </h2>
              <p style={{
                marginTop: 14, fontSize: 15, color: Cur.inkSoft, lineHeight: 1.6,
                maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
              }}>
                Cuéntanos qué necesita tu mascota y te orientamos al veterinario más adecuado.
              </p>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 12, marginTop: 28, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/contacto')}
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
                  <FontAwesomeIcon icon={faPhone} /> Contáctanos
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/agendar-cita')}
                  style={{
                    padding: '14px 26px', borderRadius: 999,
                    backgroundColor: 'transparent', color: Cur.ink,
                    border: `1.5px solid ${Cur.border}`,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  Ver agendador completo <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <FooterLanding />
      </div>

      <style>{`
        @media (max-width: 1100px) { .vp-equipo-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px)  { .vp-equipo-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
