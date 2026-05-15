// src/components/landing/VeterinariosLanding.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { Reveal, TypeReveal, Tilt3D, useLandingPalette } from "./landing.utils.jsx";
import vetCamila from "../../assets/landing/vet-camila.png";

const STATIC = "http://localhost:3000";

// Mapeo de fotos editoriales del diseño cuando el backend no tiene foto_url.
// Match por nombre case-insensitive.
const VET_PHOTO_OVERRIDES = {
  camila: vetCamila,
};

// Paleta dark local del showcase
const DARK = {
  bg:        "#061232",
  bgAlt:     "#0A1A45",
  surface:   "rgba(255,255,255,0.04)",
  border:    "rgba(255,255,255,0.10)",
  borderSoft:"rgba(255,255,255,0.06)",
  ink:       "#FAF7F0",
  inkSoft:   "rgba(250,247,240,0.78)",
  inkMuted:  "rgba(250,247,240,0.50)",
};

/* Datos de adorno para complementar la info del backend (no verificados) */
const FRASES = [
  "La medicina veterinaria no es para los animales: es para las familias que los aman.",
  "Una buena consulta es una conversación, no un trámite.",
  "Cuidar es escuchar primero, recetar después.",
  "Tu mascota merece tiempo, calma y criterio.",
];
const STATS_DEFAULT = [
  { k: "+5K", v: "Consultas" },
  { k: "4.9★", v: "Rating" },
  { k: "+10", v: "Años" },
  { k: "200+", v: "Reseñas" },
];

const FALLBACK_VETS = [
  { id: "f1", nombre: "Camila", apellido: "Mejía",   especialidad: "Medicina general",  descripcion: "Más de nueve años acompañando familias en Ibagué. Cree que la consulta tiene que sentirse como una conversación, no como un examen." },
  { id: "f2", nombre: "Javier", apellido: "Rojas",   especialidad: "Cirugía",           descripcion: "Doce años especializándose en cirugía de mínima invasión y ortopedia. Recuperación rápida priorizando el bienestar." },
  { id: "f3", nombre: "María",  apellido: "López",   especialidad: "Nutrición",         descripcion: "Diseña planes nutricionales clínicos con resultados medibles mes a mes." },
  { id: "f4", nombre: "Andrés", apellido: "Quintero",especialidad: "Felinos",           descripcion: "Especialista en medicina felina y manejo libre de estrés. Sala silenciosa, sin perros y con feromonas." },
];

function VetPortrait({ vet, accent }) {
  const overrideKey = (vet.nombre || '').toLowerCase();
  const url = vet.foto_url
    ? (vet.foto_url.startsWith('http') ? vet.foto_url : `${STATIC}${vet.foto_url}`)
    : (VET_PHOTO_OVERRIDES[overrideKey] || null);
  const initials = `${(vet.nombre || '?')[0]}${(vet.apellido || '')[0] || ''}`.toUpperCase();

  if (url) {
    return (
      <div className="vp-frame-float" style={{
        aspectRatio: "4 / 5", borderRadius: 28, overflow: "hidden",
        backgroundImage: `url('${url}')`,
        backgroundSize: "cover", backgroundPosition: "center top",
        boxShadow: "0 32px 64px -28px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)",
        position: "relative",
      }}/>
    );
  }
  return (
    <div className="vp-frame-float" style={{
      aspectRatio: "4 / 5", borderRadius: 28, position: "relative", overflow: "hidden",
      background: `radial-gradient(120% 80% at 20% 0%, ${accent}33 0%, transparent 55%),`
                + `linear-gradient(160deg, ${DARK.bgAlt} 0%, ${DARK.bg} 100%)`,
      boxShadow: "0 32px 64px -28px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="vp-font-display" style={{
          fontStyle: "italic",
          fontSize: "clamp(110px, 14vw, 200px)",
          fontWeight: 500, color: accent,
          lineHeight: 1, letterSpacing: "-0.04em",
          textShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {initials}
        </span>
      </div>
    </div>
  );
}

function CVField({ label, items }) {
  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
        fontWeight: 700, color: DARK.inkMuted, marginBottom: 8,
      }}>
        {label}
      </div>
      <ul style={{
        listStyle: "none", padding: 0, margin: 0,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 13, color: DARK.ink, fontWeight: 500, lineHeight: 1.45 }}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArrowButton({ accent, side, onClick }) {
  const isLeft = side === "left";
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Veterinario anterior" : "Siguiente veterinario"}
      className="vp-vet-arrow"
      style={{
        position: "absolute", top: "50%",
        [isLeft ? "left" : "right"]: 0,
        transform: "translateY(-50%)",
        width: 48, height: 48, borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: `1px solid ${DARK.border}`,
        color: DARK.ink, cursor: "pointer", zIndex: 3,
        display: 'flex', alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        transition: "background-color 200ms ease, transform 200ms ease, border-color 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.14)";
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = `translateY(-50%) translateX(${isLeft ? -2 : 2}px)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = DARK.border;
        e.currentTarget.style.transform = "translateY(-50%) translateX(0)";
      }}
    >
      <FontAwesomeIcon icon={isLeft ? faArrowLeft : faArrowRight} style={{ fontSize: 14 }} />
    </button>
  );
}

export default function VeterinariosLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();

  const [vets, setVets] = useState(FALLBACK_VETS);
  const [idx, setIdx]   = useState(0);
  const [pose, setPose] = useState({ opacity: 1, x: 0, snap: false });
  const lockRef = useRef(false);

  // Cargar vets reales — intenta varios endpoints
  useEffect(() => {
    let mounted = true;
    const tryLoad = async () => {
      const candidates = [
        '/citas/veterinarios',
        '/veterinarios',
        '/admin/veterinarios',
      ];
      for (const ep of candidates) {
        try {
          const r = await api.get(ep);
          const arr = Array.isArray(r.data) ? r.data : (r.data?.veterinarios || []);
          if (mounted && arr.length) {
            setVets(arr.filter(v => v.activo !== 0 && v.activo !== false));
            return;
          }
        } catch { /* siguiente */ }
      }
    };
    tryLoad();
    return () => { mounted = false; };
  }, []);

  const go = (n) => {
    if (lockRef.current) return;
    const N = vets.length;
    if (N === 0) return;
    const next = (n + N) % N;
    if (next === idx) return;
    lockRef.current = true;
    const direction = next > idx || (idx === N - 1 && next === 0) ? 1 : -1;
    setPose({ opacity: 0, x: direction * -32, snap: false });
    setTimeout(() => {
      setIdx(next);
      setPose({ opacity: 0, x: direction * 32, snap: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPose({ opacity: 1, x: 0, snap: false });
        });
      });
      setTimeout(() => { lockRef.current = false; }, 480);
    }, 280);
  };

  const vet = vets[idx] || FALLBACK_VETS[0];
  const accent = Cur.lime;
  const fullName = `${vet.titulo || (vet.genero === 'F' ? 'Dra.' : 'Dr.')} ${vet.nombre || ''} ${vet.apellido || ''}`.trim();
  const short = vet.nombre || 'el veterinario';

  // Datos de adorno
  const frase = FRASES[idx % FRASES.length];
  const stats = STATS_DEFAULT;
  const education   = vet.educacion   || ["Información disponible en consulta"];
  const experience  = vet.experiencia || [`${vet.especialidad || 'Práctica'} clínica`];
  const specialties = vet.especialidades || (vet.especialidad ? [vet.especialidad] : ["Medicina general"]);
  const languages   = vet.idiomas    || ["Español"];

  return (
    <section id="equipo" style={{
      background: `linear-gradient(180deg, ${DARK.bg} 0%, ${DARK.bgAlt} 50%, ${DARK.bg} 100%)`,
      color: DARK.ink, position: "relative", overflow: "hidden",
      scrollMarginTop: 80,
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -180, right: -160, width: 620, height: 620, backgroundColor: accent, opacity: 0.18 }}/>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ bottom: -200, left: -160, width: 540, height: 540, backgroundColor: Cur.navy, opacity: 0.45 }}/>

      <div style={{ height: 60 }} aria-hidden="true" />

      <div style={{
        maxWidth: 1480, margin: '0 auto',
        padding: '0 16px 96px', position: "relative", zIndex: 1,
      }}>
        {/* Header centered */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
              color: Cur.lime, fontWeight: 700,
            }}>
              <span style={{ width: 22, height: 1, backgroundColor: Cur.lime }} />
              <span>Nuestro equipo</span>
              <span style={{ width: 22, height: 1, backgroundColor: Cur.lime }} />
            </div>
          </Reveal>
          <TypeReveal
            as="h2"
            className="vp-font-display"
            style={{
              marginTop: 16, marginBottom: 0,
              fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.0,
              fontWeight: 500, color: DARK.ink, maxWidth: 800,
              marginLeft: "auto", marginRight: "auto",
            }}
            segments={[
              { text: "Las manos que " },
              { text: "cuidarán", italic: true, color: Cur.lime },
              { text: " a tu mascota." },
            ]}
          />
          <Reveal delay={80}>
            <p style={{
              marginTop: 16, fontSize: 16, color: DARK.inkSoft,
              lineHeight: 1.55, maxWidth: 540,
              marginLeft: "auto", marginRight: "auto",
            }}>
              Veterinarios titulados, con especialidad. Elige con quién quieres que atiendan a tu compañero —
              la misma persona te recibe en cada visita.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <button
              type="button"
              onClick={() => navigate('/equipo')}
              className="vp-link-underline"
              style={{
                marginTop: 18, background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: Cur.lime,
                fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Ver perfil completo del equipo <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </button>
          </Reveal>
        </div>

        {/* Showcase */}
        <div style={{ position: 'relative' }}>
          <ArrowButton accent={accent} side="left"  onClick={() => go(idx - 1)} />
          <ArrowButton accent={accent} side="right" onClick={() => go(idx + 1)} />

          <div className={`vp-vet-swap ${pose.snap ? "vp-snap" : ""}`}
            style={{ opacity: pose.opacity, transform: `translateX(${pose.x}px)` }}>
            <div className="vp-vet-grid" style={{
              display: 'grid', gridTemplateColumns: '5fr 7fr',
              alignItems: 'center', gap: 56, padding: "0 56px",
            }}>
              {/* LEFT — photo */}
              <Tilt3D max={5} perspective={1100}>
                <VetPortrait vet={vet} accent={accent} />
              </Tilt3D>

              {/* RIGHT — CV */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  fontSize: 11, color: DARK.inkMuted, fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                }}>
                  <span className="vp-font-display vp-tabular" style={{ fontSize: 15, color: Cur.lime, fontStyle: "italic" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{ width: 18, height: 1, backgroundColor: DARK.border }} />
                  <span style={{ color: DARK.inkMuted }}>{String(vets.length).padStart(2, "0")}</span>
                  <span style={{ marginLeft: 12, color: Cur.lime }}>{vet.especialidad || 'Veterinario'}</span>
                </div>

                <h3 className="vp-font-display" style={{
                  marginTop: 14, marginBottom: 0,
                  fontSize: "clamp(36px, 4.8vw, 60px)", lineHeight: 1.0,
                  fontWeight: 500, color: DARK.ink, letterSpacing: "-0.02em",
                }}>
                  <span style={{ fontStyle: "italic" }}>{fullName}</span>
                </h3>

                <p style={{
                  marginTop: 18, fontSize: 16, color: DARK.inkSoft,
                  lineHeight: 1.6, maxWidth: 560,
                }}>
                  {vet.descripcion || 'Veterinario titulado del equipo Victoria Pecuarios.'}
                </p>

                {/* Stats */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
                  marginTop: 28, maxWidth: 560,
                }}>
                  {stats.map((s) => (
                    <div key={s.v} style={{
                      backgroundColor: DARK.surface,
                      border: `1px solid ${DARK.borderSoft}`,
                      borderRadius: 14, padding: "12px 10px", textAlign: "left",
                    }}>
                      <div className="vp-font-display vp-tabular" style={{
                        fontStyle: "italic", fontSize: 22, fontWeight: 500,
                        color: Cur.lime, lineHeight: 1, letterSpacing: "-0.02em",
                      }}>
                        {s.k}
                      </div>
                      <div style={{
                        fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                        color: DARK.inkMuted, fontWeight: 700, marginTop: 6,
                      }}>
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CV grid */}
                <div className="vp-cv-grid" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  columnGap: 40, rowGap: 24,
                  marginTop: 28, paddingTop: 28,
                  borderTop: `1px solid ${DARK.border}`, maxWidth: 620,
                }}>
                  <CVField label="Educación"      items={education} />
                  <CVField label="Experiencia"    items={experience} />
                  <CVField label="Especialidades" items={specialties} />
                  <CVField label="Idiomas"        items={languages} />
                </div>

                {/* Frase */}
                <blockquote className="vp-font-display" style={{
                  marginTop: 32, paddingLeft: 18,
                  borderLeft: `2px solid ${Cur.lime}`,
                  fontStyle: "italic", fontSize: 18, lineHeight: 1.45,
                  color: DARK.ink, maxWidth: 560,
                }}>
                  “{frase}”
                </blockquote>

                {/* CTA */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 32 }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/agendar-cita?vet=${vet.id}`)}
                    className="vp-cta-primary"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      backgroundColor: Cur.lime, color: Cur.navyDeep,
                      padding: "15px 26px", borderRadius: 999,
                      fontSize: 14, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      letterSpacing: "-0.005em",
                      boxShadow: `0 16px 32px -12px ${Cur.lime}55`,
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Cur.limeDeep)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Cur.lime)}
                  >
                    Agendar con {short}
                  </button>
                  <span style={{ fontSize: 12, color: DARK.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: Cur.lime, fontSize: 12 }} />
                    Tarjeta profesional vigente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 56 }}>
          {vets.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ver veterinario ${i + 1}`}
              style={{
                width: i === idx ? 28 : 8, height: 8, borderRadius: 999,
                backgroundColor: i === idx ? Cur.lime : "rgba(255,255,255,0.20)",
                border: "none", cursor: "pointer",
                transition: "width 350ms ease, background-color 350ms ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ height: 40 }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) {
          .vp-vet-grid { grid-template-columns: 1fr !important; padding: 0 24px !important; }
          .vp-cv-grid  { grid-template-columns: 1fr !important; column-gap: 0 !important; }
          .vp-vet-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}
