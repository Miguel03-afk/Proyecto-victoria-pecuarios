// src/components/landing/PlanLanding.jsx
// Panel de booking simplificado: pre-selecciona vet/fecha/hora/motivo
// y navega a /agendar-cita con query params para completar el flujo real.
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar, faStethoscope, faShieldHalved, faCheck, faStar, faCircle, faArrowRight,
  faVolumeHigh, faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { Reveal, TypeReveal, useLandingPalette } from "./landing.utils.jsx";
import vetCamila from "../../assets/landing/vet-camila.png";

const STATIC = "http://localhost:3000";
const VIDEO_BG = "/videos/bg.mp4"; // sirve desde public/

const VET_PHOTO_OVERRIDES = { camila: vetCamila };
const TIME_SLOTS = ["08:30", "10:00", "11:30", "14:00", "16:30", "18:00"];
const MOTIVOS = ["Consulta general", "Vacunación", "Chequeo", "Cirugía", "Urgencia"];

const FALLBACK_VETS = [
  { id: "f1", nombre: "Camila", apellido: "Mejía", especialidad: "Medicina general" },
  { id: "f2", nombre: "Javier", apellido: "Rojas", especialidad: "Cirugía" },
  { id: "f3", nombre: "María",  apellido: "López", especialidad: "Nutrición" },
  { id: "f4", nombre: "Andrés", apellido: "Quintero", especialidad: "Felinos" },
];

function VetRow({ Cur, vet, active, onClick }) {
  const initials = `${(vet.nombre || '?')[0]}${(vet.apellido || '')[0] || ''}`.toUpperCase();
  const overrideKey = (vet.nombre || '').toLowerCase();
  const fotoUrl = vet.foto_url
    ? (vet.foto_url.startsWith('http') ? vet.foto_url : `${STATIC}${vet.foto_url}`)
    : (VET_PHOTO_OVERRIDES[overrideKey] || null);
  const accent = active ? Cur.navy : Cur.border;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center",
        gap: 12, padding: "14px 16px",
        backgroundColor: active ? Cur.navy + "0F" : Cur.surface,
        border: `1.5px solid ${accent}`,
        borderRadius: 16, cursor: "pointer",
        textAlign: "left", width: "100%",
        boxShadow: active ? `0 8px 22px -14px ${Cur.navy}88` : "none",
        fontFamily: 'inherit',
        transition: "background-color 250ms ease, border-color 250ms ease, transform 250ms ease",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 18, height: 18, borderRadius: 999,
          border: `1.5px solid ${accent}`,
          backgroundColor: active ? Cur.navy : "transparent",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {active && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, color: Cur.canvas }} />}
        </span>

        {fotoUrl ? (
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            backgroundImage: `url('${fotoUrl}')`,
            backgroundSize: "cover", backgroundPosition: "center top",
            flexShrink: 0, boxShadow: `0 0 0 2px ${active ? Cur.navy : Cur.surface}`,
          }}/>
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: `linear-gradient(135deg, ${Cur.lime} 0%, ${Cur.navy} 100%)`,
            color: Cur.canvas, fontWeight: 700, fontSize: 12,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: `0 0 0 2px ${active ? Cur.navy : Cur.surface}`,
          }}>
            {initials}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: Cur.ink, lineHeight: 1.2 }}>
            {vet.titulo || (vet.genero === 'F' ? 'Dra.' : 'Dr.')} {vet.nombre} {vet.apellido}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 2, fontSize: 11, color: Cur.inkSoft }}>
            <span>{vet.especialidad || 'Veterinario'}</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: Cur.inkMuted, opacity: 0.5 }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FontAwesomeIcon icon={faStar} style={{ fontSize: 9, color: Cur.lime }} />
              4.9
            </span>
          </div>
        </div>
      </div>

    </button>
  );
}

/* ─── Helper: próximas fechas para un día de la semana ─────────────────── */
const DIAS_FULL  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MESES_CORTO = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function proximaFecha(diaSemana) {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  for (let i = 0; i < 90; i++) {
    if (cursor.getDay() === diaSemana) return cursor.toISOString().slice(0, 10);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

export default function PlanLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();

  const [vets, setVets] = useState(FALLBACK_VETS);
  const [vetId, setVetId] = useState(FALLBACK_VETS[0].id);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("14:00");
  const [motivo, setMotivo] = useState("Consulta general");
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  };

  useEffect(() => {
    let mounted = true;
    const tryLoad = async () => {
      const candidates = ['/citas/veterinarios', '/veterinarios', '/admin/veterinarios'];
      for (const ep of candidates) {
        try {
          const r = await api.get(ep);
          const arr = Array.isArray(r.data) ? r.data : (r.data?.veterinarios || []);
          if (mounted && arr.length) {
            const filt = arr.filter(v => v.activo !== 0 && v.activo !== false);
            setVets(filt);
            setVetId(filt[0].id);
            return;
          }
        } catch { /* siguiente */ }
      }
    };
    tryLoad();
    return () => { mounted = false; };
  }, []);

  const activeVet = vets.find((v) => v.id === vetId) || vets[0];
  const accent = Cur.navy;
  const short = activeVet?.nombre || 'el veterinario';

  // Próximas fechas reales segun disponibilidad del vet (1 por dia configurado)
  const fechasDisp = useMemo(() => {
    if (!activeVet?.disponibilidad || !Array.isArray(activeVet.disponibilidad)) return [];
    return activeVet.disponibilidad
      .map(d => {
        const f = proximaFecha(d.dia);
        return f ? { dia: d.dia, fecha: f } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [activeVet]);

  // Al cambiar de vet, ajusta la fecha seleccionada a la primera disponible
  useEffect(() => {
    if (fechasDisp.length > 0 && !fechasDisp.find(f => f.fecha === date)) {
      setDate(fechasDisp[0].fecha);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechasDisp]);

  /* ─── Slots reales del vet según la fecha ────────────────────────────────
     Antes este widget mostraba TIME_SLOTS hardcoded y NO cambiaba al
     cambiar de día. Ahora consulta /api/citas/disponibilidad con vet+fecha
     y muestra los horarios reales. TIME_SLOTS queda como fallback visual
     si el backend falla o aún no responde. */
  const [slots, setSlots] = useState(TIME_SLOTS);
  const [slotsCargando, setSlotsCargando] = useState(false);

  useEffect(() => {
    if (!activeVet?.id || !date) return;
    let cancelled = false;
    setSlotsCargando(true);

    api.get("/citas/disponibilidad", {
      params: { veterinario_id: activeVet.id, fecha: date },
    })
      .then(r => {
        if (cancelled) return;
        const arr = r.data?.slots || [];
        // Si el vet no atiende ese día, dejamos TIME_SLOTS visible como referencia
        setSlots(arr.length > 0 ? arr : TIME_SLOTS);
      })
      .catch(() => {
        if (cancelled) return;
        setSlots(TIME_SLOTS); // fallback silencioso para no romper la landing
      })
      .finally(() => {
        if (!cancelled) setSlotsCargando(false);
      });

    return () => { cancelled = true; };
  }, [activeVet?.id, date]);

  // Si los slots cambian y la hora seleccionada ya no es válida, resetea al primero
  useEffect(() => {
    if (slots.length > 0 && !slots.includes(time)) {
      setTime(slots[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const handleConfirm = () => {
    const params = new URLSearchParams({
      vet: String(activeVet?.id || ''),
      fecha: date,
      hora: time,
      motivo,
    });
    navigate(`/agendar-cita?${params.toString()}`);
  };

  return (
    <section id="agenda" style={{
      backgroundColor: Cur.surface,
      transition: "background-color 400ms ease",
      position: "relative", overflow: "hidden",
      scrollMarginTop: 80,
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -120, left: -160, width: 520, height: 520, backgroundColor: Cur.navy, opacity: 0.06 }}/>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ bottom: -160, right: -140, width: 480, height: 480, backgroundColor: Cur.lime, opacity: 0.07 }}/>

      <div style={{
        maxWidth: 1480, margin: '0 auto',
        padding: '96px 16px', position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Reveal>
            <div style={{
              fontSize: 14, color: Cur.lime, fontWeight: 600,
            }}>
              Agenda en 60 segundos
            </div>
          </Reveal>
          <TypeReveal
            as="h2"
            className="vp-font-display"
            style={{
              marginTop: 16, marginBottom: 0,
              fontSize: "clamp(38px, 5.5vw, 68px)", lineHeight: 1.0,
              fontWeight: 700, color: Cur.ink, maxWidth: 780,
              marginLeft: "auto", marginRight: "auto",
              letterSpacing: "-0.025em",
            }}
            segments={[
              { text: "Elige a tu " },
              { text: "veterinario", color: Cur.navy },
              { text: ", el resto lo hacemos nosotros." },
            ]}
          />
          <Reveal delay={80}>
            <p style={{
              marginTop: 16, fontSize: 16, color: Cur.inkSoft,
              lineHeight: 1.55, maxWidth: 540,
              marginLeft: "auto", marginRight: "auto",
            }}>
              Pre-seleccionas aquí, completas en el agendador. Si necesitas reagendar, son dos toques desde tu celular.
            </p>
          </Reveal>
        </div>

        <Reveal variant="vp-reveal-card" delay={120}>
          <div className="vp-panel-float" style={{
            backgroundColor: Cur.surface,
            border: `1px solid ${Cur.border}`,
            borderRadius: 32,
            boxShadow: "0 40px 80px -40px rgba(10,20,38,0.30), 0 4px 12px -6px rgba(10,20,38,0.08)",
            overflow: "hidden", width: "100%",
          }}>
            <div className="vp-plan-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 7fr' }}>
              {/* LEFT — Video de fondo + info del vet activo */}
              <div style={{
                position: 'relative', overflow: 'hidden',
                minHeight: 560, backgroundColor: Cur.surfaceAlt,
              }}>
                <video
                  ref={videoRef}
                  src={VIDEO_BG}
                  autoPlay
                  muted
                  playsInline
                  loop
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div aria-hidden="true" style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(10,20,38,0.20) 0%, rgba(10,20,38,0.05) 45%, rgba(10,20,38,0.78) 100%)",
                }}/>

                {/* Mute toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Activar sonido" : "Silenciar"}
                  style={{
                    position: "absolute", top: 20, right: 20,
                    width: 40, height: 40, borderRadius: 999,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    color: Cur.canvas,
                    border: "1px solid rgba(255,255,255,0.18)",
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    transition: "background-color 200ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.35)")}
                >
                  <FontAwesomeIcon icon={muted ? faVolumeXmark : faVolumeHigh} style={{ fontSize: 14 }} />
                </button>

                <div style={{
                  position: 'absolute', left: 24, right: 24, bottom: 24,
                  display: 'flex', alignItems: 'center', gap: 14, color: '#fff',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 999,
                    background: `linear-gradient(135deg, ${Cur.lime} 0%, ${accent} 100%)`,
                    color: Cur.canvas, fontWeight: 700, fontSize: 17,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, boxShadow: `0 0 0 3px ${accent}`,
                  }}>
                    {`${(activeVet?.nombre || '?')[0]}${(activeVet?.apellido || '')[0] || ''}`.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.78, fontWeight: 500 }}>
                      Tu veterinario
                    </div>
                    <div className="vp-font-display" style={{
                      fontSize: 24, fontWeight: 700, lineHeight: 1.1,
                      marginTop: 2, letterSpacing: "-0.02em",
                    }}>
                      {activeVet?.titulo || (activeVet?.genero === 'F' ? 'Dra.' : 'Dr.')} {activeVet?.nombre} {activeVet?.apellido}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                      {activeVet?.especialidad || 'Veterinario'}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Form */}
              <div style={{ padding: "32px 32px 36px" }}>
                {/* Vet table */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 13, color: Cur.ink, fontWeight: 600 }}>
                      <span style={{ color: Cur.navy, marginRight: 6 }}>1</span>
                      Veterinario
                    </div>
                    <div style={{ fontSize: 11, color: Cur.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FontAwesomeIcon icon={faCircle} style={{ fontSize: 7, color: Cur.lime }} />
                      {vets.length} disponibles
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                    {vets.map((v) => (
                      <VetRow key={v.id} Cur={Cur} vet={v} active={v.id === vetId} onClick={() => setVetId(v.id)} />
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: Cur.border, margin: "24px 0 22px" }} />

                {/* Fecha (banners de días disponibles del vet) */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 13, color: Cur.ink, fontWeight: 600 }}>
                      <span style={{ color: Cur.navy, marginRight: 6 }}>2</span>
                      Fecha disponible
                    </div>
                    {fechasDisp.length > 0 && (
                      <div style={{ fontSize: 11, color: Cur.inkSoft }}>
                        {fechasDisp.length} día{fechasDisp.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {fechasDisp.length === 0 ? (
                    <div style={{
                      padding: "12px 14px", borderRadius: 12,
                      backgroundColor: Cur.surfaceAlt,
                      border: `1px dashed ${Cur.border}`,
                      fontSize: 12, color: Cur.inkSoft,
                    }}>
                      Este veterinario no tiene días de atención configurados aún.
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', gap: 8, overflowX: 'auto',
                      paddingBottom: 4,
                    }} className="vp-no-scrollbar">
                      {fechasDisp.map((item) => {
                        const d = new Date(item.fecha + "T00:00:00");
                        const activo = date === item.fecha;
                        return (
                          <button
                            key={item.fecha}
                            type="button"
                            onClick={() => setDate(item.fecha)}
                            style={{
                              flexShrink: 0,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              minWidth: 72, padding: "10px 12px",
                              borderRadius: 12,
                              backgroundColor: activo ? Cur.navy : Cur.surface,
                              border: `1.5px solid ${activo ? Cur.navy : Cur.border}`,
                              cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all 180ms ease',
                              boxShadow: activo ? `0 6px 16px -8px ${Cur.navy}66` : 'none',
                            }}
                          >
                            <span className="vp-tabular" style={{
                              fontSize: 22, fontWeight: 700, lineHeight: 1,
                              color: activo ? '#fff' : Cur.ink,
                            }}>
                              {d.getDate()}
                            </span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, marginTop: 4,
                              letterSpacing: "0.12em", textTransform: "uppercase",
                              color: activo ? "rgba(255,255,255,0.85)" : Cur.inkMuted,
                            }}>
                              {MESES_CORTO[d.getMonth()]}
                            </span>
                            <span style={{
                              fontSize: 10, marginTop: 2,
                              color: activo ? "rgba(255,255,255,0.7)" : Cur.inkSoft,
                            }}>
                              {DIAS_FULL[d.getDay()].slice(0, 3)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Motivo */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, color: Cur.ink, fontWeight: 600, marginBottom: 8 }}>
                    <span style={{ color: Cur.navy, marginRight: 6 }}>3</span>
                    Motivo
                  </div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    backgroundColor: Cur.surfaceAlt, border: `1px solid ${Cur.border}`,
                    borderRadius: 14, padding: "10px 14px",
                  }}>
                    <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: 13, color: Cur.inkSoft }} />
                    <select
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="vp-bare"
                      style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        fontSize: 14, color: Cur.ink, fontFamily: "inherit", fontWeight: 500,
                        appearance: "none", WebkitAppearance: "none", cursor: "pointer",
                      }}
                    >
                      {MOTIVOS.map((m) => (
                        <option key={m} style={{ color: Cur.ink, backgroundColor: Cur.surface }}>{m}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Hora */}
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 13, color: Cur.ink, fontWeight: 600 }}>
                      <span style={{ color: Cur.navy, marginRight: 6 }}>4</span>
                      Hora
                      {slotsCargando && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: Cur.inkMuted, fontWeight: 400 }}>
                          cargando…
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: Cur.inkSoft }}>
                      {slots.length} disponibles · COT (UTC-5)
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: slotsCargando ? 0.5 : 1, transition: "opacity 200ms ease" }}>
                    {slots.map((t) => {
                      const active = t === time;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          disabled={slotsCargando}
                          className="vp-tabular"
                          style={{
                            padding: "9px 14px", borderRadius: 999,
                            fontSize: 13, fontWeight: 600, cursor: slotsCargando ? "wait" : "pointer",
                            border: `1.5px solid ${active ? accent : Cur.border}`,
                            backgroundColor: active ? accent : Cur.surface,
                            color: active ? "#fff" : Cur.ink,
                            fontFamily: "inherit",
                            boxShadow: active ? `0 8px 16px -8px ${accent}66` : "none",
                            transition: "background-color 200ms ease, color 200ms ease, border-color 200ms ease, transform 200ms ease",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  flexWrap: 'wrap', gap: 16, marginTop: 28,
                }}>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="vp-cta-primary"
                    style={{
                      flex: "1 1 280px", color: Cur.canvas,
                      padding: "16px 28px", borderRadius: 999,
                      fontSize: 15, fontWeight: 600,
                      border: "none", cursor: "pointer",
                      boxShadow: `0 8px 20px -10px ${accent}50`,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                      background: Cur.navy,
                      letterSpacing: "-0.01em", fontFamily: 'inherit',
                      transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    Continuar agendamiento con {short}
                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: Cur.inkSoft }}>
                    <FontAwesomeIcon icon={faShieldHalved} style={{ color: Cur.lime, fontSize: 12 }} />
                    <span>Sin tarjeta · cancela cuando quieras</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p style={{
            marginTop: 28, fontSize: 12, color: Cur.inkMuted,
            maxWidth: 640, lineHeight: 1.55,
            textAlign: "center", marginLeft: "auto", marginRight: "auto",
          }}>
            Familias que adoptaron un plan preventivo reportaron en promedio
            2 visitas menos al año. Datos internos Victoria Pets 2025.
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .vp-plan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
