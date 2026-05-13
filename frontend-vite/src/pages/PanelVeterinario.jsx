// src/pages/PanelVeterinario.jsx — Victoria Pets · diseño PDF
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox, faCalendarDays, faClock, faTriangleExclamation,
  faCheck, faXmark, faPaw, faChevronLeft, faChevronRight,
  faRightFromBracket, faImage, faVideo, faCircleCheck, faCalendarXmark,
  faClipboardList, faFloppyDisk, faCamera, faMagnifyingGlass,
  faBell, faSun, faMoon, faPlus, faStethoscope, faFilePrescription,
  faChartLine, faUser, faNotesMedical, faPills, faTrash, faSyringe,
  faFlask, faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import logo from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

const STATIC = "http://localhost:3000";

const ESTADO_CFG = {
  pendiente:         { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Pendiente" },
  confirmada:        { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe", label: "Confirmada" },
  rechazada:         { bg: "#fee2e2", text: "#7f1d1d", border: "#fecaca", label: "Rechazada" },
  cancelada_cliente: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", label: "Cancelada" },
  cancelada_vet:     { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Cancelada vet" },
  completada:        { bg: "#dcfce7", text: "#14532d", border: "#bbf7d0", label: "Completada" },
  no_asistio:        { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", label: "No asistió" },
};

const fmtHora = (h) => {
  if (!h) return "—";
  const [hh, mm] = h.split(":");
  const n = parseInt(hh);
  return `${String(n).padStart(2, "0")}:${mm}`;
};

const fmtFecha = (f) => {
  if (!f) return "—";
  const d = new Date(f + "T00:00:00");
  return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
};

const fdoc = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

const especieEmoji = (esp = "") => {
  const e = esp.toLowerCase();
  if (e.includes("gat") || e.includes("felin")) return "🐱";
  if (e.includes("perr") || e.includes("can"))  return "🐶";
  if (e.includes("ave") || e.includes("loro"))  return "🦜";
  if (e.includes("conej"))                      return "🐰";
  return "🐾";
};

/* ─── Badge estado ───────────────────────────────────────────────────────── */
function Badge({ estado }) {
  const s = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: RADIUS.pill,
      background: s.bg, color: s.text,
      border: `1px solid ${s.border}`,
      fontSize: 10, fontWeight: 700,
      letterSpacing: 0.2,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.text }}/>
      {s.label}
    </span>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  const { C } = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `2.5px solid ${C.brandSoft}`,
        borderTopColor: C.brand,
        animation: "vp-spin 0.8s linear infinite",
      }}/>
    </div>
  );
}

/* ─── Msg toast ──────────────────────────────────────────────────────────── */
function Msg({ texto, tipo = "ok" }) {
  const { C } = useTheme();
  if (!texto) return null;
  const ok = tipo === "ok";
  return (
    <div style={{
      padding: "10px 14px", borderRadius: RADIUS.sm,
      background: ok ? C.successBg : C.dangerBg,
      border: `1px solid ${ok ? C.successBorder : C.dangerBorder}`,
      color: ok ? C.success : C.danger,
      fontSize: 13, fontWeight: 500,
      marginBottom: 14,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <FontAwesomeIcon icon={ok ? faCircleCheck : faTriangleExclamation}/>
      {texto}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AGENDA — Layout split estilo PDF
   ════════════════════════════════════════════════════════════════ */
function Agenda() {
  const { C } = useTheme();
  const [citasTodas, setCitasTodas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("historial");
  const [accionando, setAccionando] = useState({});
  const [msg, setMsg] = useState({});
  const [modalAnom, setModalAnom] = useState(null);
  const [formAnom, setFormAnom] = useState({ descripcion: "", imagen_url: "", video_url: "" });
  const [notas, setNotas] = useState("");

  const cargar = () => {
    setCargando(true);
    const params = filtro !== "todas" ? { estado: filtro } : {};
    api.get("/veterinario/agenda", { params })
      .then(r => setCitasTodas(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [filtro]); // eslint-disable-line

  // Solo mostrar citas del día actual en esta vista
  const hoyStr = new Date().toISOString().split("T")[0];
  const citas = citasTodas.filter(c => c.fecha === hoyStr);

  // Auto-select primera cita
  useEffect(() => {
    if (citas.length && !selectedId) setSelectedId(citas[0].id);
  }, [citas]); // eslint-disable-line

  const selected = citas.find(c => c.id === selectedId);

  const accion = async (id, tipo, body = {}) => {
    setAccionando(p => ({ ...p, [id]: tipo }));
    setMsg({});
    try {
      await api.patch(`/veterinario/citas/${id}/${tipo}`, body);
      setMsg({ texto: `Cita ${tipo === "completar" ? "completada" : tipo === "no-asistio" ? "marcada como no asistió" : tipo + "da"}.`, tipo: "ok" });
      setTimeout(() => setMsg({}), 3000);
      cargar();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al actualizar.", tipo: "err" });
    } finally {
      setAccionando(p => ({ ...p, [id]: null }));
    }
  };

  const reportarAnom = async () => {
    if (!formAnom.descripcion.trim()) return;
    try {
      await api.post(`/veterinario/citas/${modalAnom}/anomalia`, formAnom);
      setModalAnom(null); setFormAnom({ descripcion: "", imagen_url: "", video_url: "" });
      setMsg({ texto: "Anomalía reportada.", tipo: "ok" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al reportar.", tipo: "err" });
    }
  };

  const FILTROS = [
    { k: "todas", l: "Todas" },
    { k: "confirmada", l: "Confirmadas" },
    { k: "pendiente", l: "Pendientes" },
    { k: "completada", l: "Completadas" },
  ];

  const citasHoy = citas.filter(c => c.fecha === new Date().toISOString().split("T")[0]);
  const confirmadasHoy = citasHoy.filter(c => c.estado === "confirmada").length;
  const pendientesHoy  = citasHoy.filter(c => c.estado === "pendiente").length;

  const hoy = new Date();
  const diaSemana = hoy.toLocaleDateString("es-CO", { weekday: "long" });
  const dia = hoy.getDate();
  const mes = hoy.toLocaleDateString("es-CO", { month: "long" });

  return (
    <div className="vp-vet-split" style={{
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: 0,
      height: "calc(100vh - 64px)",
    }}>
      {/* Modal anomalía */}
      {modalAnom && (
        <div onClick={() => setModalAnom(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.surface, borderRadius: RADIUS.lg,
            width: "100%", maxWidth: 480, padding: 28,
            boxShadow: C.shadowLg,
          }}>
            <h3 style={{
              margin: "0 0 16px",
              fontFamily: FONT.display, fontStyle: "italic",
              fontWeight: 600, fontSize: 22, color: C.ink,
            }}>
              Reportar anomalía
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Descripción *", key: "descripcion", textarea: true, placeholder: "Describe la anomalía observada..." },
                { label: "URL de imagen (opcional)", key: "imagen_url", placeholder: "https://..." },
                { label: "URL de video (opcional)", key: "video_url", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{
                    display: "block", fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1,
                    color: C.ink3, marginBottom: 6,
                  }}>{f.label}</label>
                  {f.textarea ? (
                    <textarea value={formAnom[f.key]} rows={3}
                      onChange={e => setFormAnom(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", padding: "10px 14px",
                        borderRadius: RADIUS.sm, border: `1px solid ${C.lineStrong}`,
                        background: C.surface, color: C.ink,
                        fontSize: 13, outline: "none", resize: "none",
                        fontFamily: FONT.ui,
                      }}/>
                  ) : (
                    <input type="url" value={formAnom[f.key]}
                      onChange={e => setFormAnom(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", padding: "10px 14px",
                        borderRadius: RADIUS.sm, border: `1px solid ${C.lineStrong}`,
                        background: C.surface, color: C.ink,
                        fontSize: 13, outline: "none",
                        fontFamily: FONT.ui,
                      }}/>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setModalAnom(null)} style={{
                flex: 1, padding: "11px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink2,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
                Cancelar
              </button>
              <button onClick={reportarAnom} disabled={!formAnom.descripcion.trim()} style={{
                flex: 1, padding: "11px",
                borderRadius: RADIUS.sm, border: "none",
                background: !formAnom.descripcion.trim() ? C.surfaceAlt : C.warning,
                color: !formAnom.descripcion.trim() ? C.muted : "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: !formAnom.descripcion.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                fontFamily: FONT.ui,
              }}>
                <FontAwesomeIcon icon={faTriangleExclamation}/> Reportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Columna izquierda: lista citas ── */}
      <div style={{
        borderRight: `1px solid ${C.line}`,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }} className="vp-citas-list">

        {/* Header lista */}
        <div style={{
          padding: "16px 18px 14px",
          borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
        }}>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 600,
            color: C.ink3, textTransform: "capitalize",
            letterSpacing: 0.3,
          }}>
            {diaSemana} {dia} {mes}
          </p>
          <h3 style={{
            margin: "4px 0 8px",
            fontFamily: FONT.display, fontStyle: "italic",
            fontWeight: 600, fontSize: 20, color: C.ink,
          }}>
            {citasHoy.length} citas hoy
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: C.ink3 }}>
            {confirmadasHoy} confirmada{confirmadasHoy !== 1 ? "s" : ""} · {pendientesHoy} pendiente{pendientesHoy !== 1 ? "s" : ""}
          </p>

          <div style={{ display: "flex", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
            {FILTROS.map(f => {
              const activo = filtro === f.k;
              return (
                <button key={f.k} onClick={() => setFiltro(f.k)} style={{
                  padding: "4px 10px", borderRadius: RADIUS.pill,
                  fontSize: 11, fontWeight: activo ? 700 : 500,
                  background: activo ? C.brand : "transparent",
                  color: activo ? "#fff" : C.ink3,
                  border: `1px solid ${activo ? C.brand : C.lineStrong}`,
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: FONT.ui,
                }}>{f.l}</button>
              );
            })}
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cargando ? <Spinner/> : citas.length === 0 ? (
            <div style={{
              padding: "60px 24px", textAlign: "center",
              color: C.ink3, fontSize: 13,
            }}>
              <FontAwesomeIcon icon={faCalendarXmark} style={{
                fontSize: 32, color: C.muted, marginBottom: 10, display: "block",
              }}/>
              Sin citas con este filtro
            </div>
          ) : (
            <div>
              {citas.map(c => {
                const activo = selectedId === c.id;
                return (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "14px 18px",
                    background: activo ? C.brandSoft : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${activo ? C.brand : "transparent"}`,
                    borderBottom: `1px solid ${C.line}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: FONT.ui,
                  }}
                  onMouseEnter={e => { if (!activo) e.currentTarget.style.background = C.surfaceAlt; }}
                  onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, textAlign: "center" }}>
                        <div style={{
                          fontFamily: FONT.display,
                          fontWeight: 700, fontSize: 16,
                          color: activo ? C.brand : C.ink,
                          lineHeight: 1,
                        }}>
                          {fmtHora(c.hora)}
                        </div>
                        <div style={{
                          fontSize: 10, color: C.ink3,
                          marginTop: 2, fontFamily: FONT.mono,
                        }}>
                          {c.duracion || 30} min
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 700,
                          color: C.ink,
                          marginBottom: 2,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {especieEmoji(c.especie_mascota)} {c.nombre_mascota}
                        </div>
                        <div style={{
                          fontSize: 11, color: C.ink3,
                          marginBottom: 4,
                        }}>
                          {c.especie_mascota || "—"}
                        </div>
                        <div style={{
                          fontSize: 11, color: C.ink2,
                          fontWeight: 500,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {c.motivo}
                        </div>
                        <div style={{
                          marginTop: 6,
                          display: "inline-block",
                          padding: "2px 8px", borderRadius: RADIUS.pill,
                          background: C.coralSoft,
                          color: C.coral,
                          fontSize: 10, fontWeight: 600,
                        }}>
                          {c.cliente_nombre} {c.cliente_apellido}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Columna derecha: ficha paciente ── */}
      <div style={{ overflowY: "auto", padding: "24px 28px" }} className="vp-ficha">
        <Msg texto={msg.texto} tipo={msg.tipo}/>

        {!selected ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "60vh", color: C.ink3, gap: 12,
          }}>
            <FontAwesomeIcon icon={faPaw} style={{ fontSize: 48, color: C.muted }}/>
            <p style={{ margin: 0, fontSize: 14 }}>Selecciona una cita para ver el detalle</p>
          </div>
        ) : (
          <>
            {/* Cabecera ficha */}
            <div style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: RADIUS.lg,
              padding: 22,
              marginBottom: 18,
              display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap",
            }}>
              {/* Avatar mascota */}
              <div style={{
                width: 80, height: 80, borderRadius: RADIUS.lg,
                background: C.brandSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40,
                flexShrink: 0,
              }}>
                {especieEmoji(selected.especie_mascota)}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h2 style={{
                    margin: 0,
                    fontFamily: FONT.display, fontStyle: "italic",
                    fontWeight: 600, fontSize: 28,
                    color: C.ink, letterSpacing: -0.3,
                  }}>
                    {selected.nombre_mascota}
                  </h2>
                  <Badge estado={selected.estado}/>
                  {selected.reagendamiento_estado === "aceptada" && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "3px 9px", borderRadius: RADIUS.pill,
                      background: "#eff6ff", color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                    }}>
                      📅 Reagendada forzada
                    </span>
                  )}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: C.ink3 }}>
                  {selected.especie_mascota} · Cita {selected.codigo}
                </p>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.ink3, flexWrap: "wrap" }}>
                  <span>
                    Tutor:{" "}
                    <strong style={{ color: C.ink }}>
                      {selected.cliente_nombre} {selected.cliente_apellido}
                    </strong>
                  </span>
                  {selected.cliente_tel && (
                    <span>📱 {selected.cliente_tel}</span>
                  )}
                  <span>HC #VP{String(selected.cliente_id).padStart(4, "0")}</span>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                {selected.estado === "pendiente" && (
                  <>
                    <button onClick={() => accion(selected.id, "confirmar")}
                      disabled={accionando[selected.id] === "confirmar"}
                      style={{
                        padding: "10px 18px", borderRadius: RADIUS.sm,
                        border: "none", background: C.brand, color: "#fff",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 7,
                        fontFamily: FONT.ui,
                      }}>
                      <FontAwesomeIcon icon={faCheck}/> Confirmar
                    </button>
                    <button onClick={() => accion(selected.id, "rechazar", { motivo_cancelacion: "Rechazada por el veterinario" })}
                      style={{
                        padding: "10px 18px", borderRadius: RADIUS.sm,
                        border: `1px solid ${C.dangerBorder}`,
                        background: C.dangerBg, color: C.danger,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: FONT.ui,
                      }}>
                      Rechazar
                    </button>
                  </>
                )}
                {selected.estado === "confirmada" && (
                  <>
                    <button onClick={() => accion(selected.id, "completar", { notas_vet: notas })}
                      style={{
                        padding: "10px 18px", borderRadius: RADIUS.sm,
                        border: "none", background: C.brand, color: "#fff",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 7,
                        fontFamily: FONT.ui,
                      }}>
                      <FontAwesomeIcon icon={faCheck}/> Iniciar consulta
                    </button>
                    <button onClick={() => accion(selected.id, "no-asistio")}
                      style={{
                        padding: "10px 18px", borderRadius: RADIUS.sm,
                        border: `1px solid ${C.lineStrong}`,
                        background: C.surface, color: C.ink2,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: FONT.ui,
                      }}>
                      No asistió
                    </button>
                  </>
                )}
                <button onClick={() => setModalAnom(selected.id)} style={{
                  padding: "10px 18px", borderRadius: RADIUS.sm,
                  border: `1px solid ${C.warningBorder}`,
                  background: C.warningBg, color: C.warning,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontFamily: FONT.ui,
                }}>
                  <FontAwesomeIcon icon={faTriangleExclamation}/> Reportar anomalía
                </button>
              </div>
            </div>

            {/* Signos vitales (estilo PDF) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 18,
            }}>
              {[
                { label: "Especie",     value: selected.especie_mascota || "—", sub: "Reportada"  },
                { label: "Cita",        value: fmtHora(selected.hora),          sub: fmtFecha(selected.fecha) },
                { label: "Estado",      value: ESTADO_CFG[selected.estado]?.label || "—", sub: selected.estado },
                { label: "Solicitada",  value: fdoc(selected.created_at),       sub: "Fecha de creación" },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "14px 16px",
                  background: C.surface,
                  border: `1px solid ${C.line}`,
                  borderRadius: RADIUS.lg,
                }}>
                  <p style={{
                    margin: 0, fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1,
                    color: C.ink3,
                  }}>
                    {s.label}
                  </p>
                  <div style={{
                    fontFamily: FONT.display,
                    fontWeight: 700, fontSize: 20,
                    color: C.ink, marginTop: 6, lineHeight: 1.1,
                  }}>
                    {s.value}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: C.muted, textTransform: "capitalize" }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4,
              borderBottom: `1px solid ${C.line}`,
              marginBottom: 20,
            }}>
              {[
                { id: "historial", label: "Historial clínico", icon: faClipboardList },
                { id: "vacunas",   label: "Vacunas",            icon: faNotesMedical },
                { id: "recetas",   label: "Recetas",            icon: faFilePrescription },
                { id: "documentos",label: "Documentos",         icon: faImage },
              ].map(t => {
                const activo = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding: "10px 16px",
                    background: "transparent", border: "none",
                    borderBottom: `2px solid ${activo ? C.brand : "transparent"}`,
                    marginBottom: -1,
                    fontSize: 13,
                    fontWeight: activo ? 700 : 500,
                    color: activo ? C.ink : C.ink3,
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 7,
                    fontFamily: FONT.ui,
                  }}>
                    <FontAwesomeIcon icon={t.icon} style={{ fontSize: 11 }}/>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Contenido tab */}
            {tab === "historial" && (
              <div style={{ position: "relative", paddingLeft: 24 }}>
                <div style={{
                  position: "absolute", left: 7, top: 8, bottom: 8,
                  width: 1, background: C.brandBorder,
                }}/>

                {/* Cita actual */}
                <div style={{
                  position: "relative", marginBottom: 16,
                  background: C.brandSoft,
                  border: `1px solid ${C.brandBorder}`,
                  borderRadius: RADIUS.lg,
                  padding: "14px 16px",
                }}>
                  <span style={{
                    position: "absolute", left: -24, top: 16,
                    width: 14, height: 14, borderRadius: "50%",
                    background: C.brand,
                    border: `3px solid ${C.canvas}`,
                  }}/>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: 600, color: C.brand,
                    }}>
                      {fmtFecha(selected.fecha)} · Hoy · {fmtHora(selected.hora)}
                    </p>
                    <Badge estado={selected.estado}/>
                  </div>
                  <h4 style={{
                    margin: "0 0 6px",
                    fontFamily: FONT.display, fontStyle: "italic",
                    fontWeight: 600, fontSize: 16, color: C.ink,
                  }}>
                    {selected.motivo}
                  </h4>
                  {selected.notas_vet && (
                    <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
                      <strong style={{ color: C.ink }}>Notas:</strong> {selected.notas_vet}
                    </p>
                  )}
                  {selected.motivo_cancelacion && (
                    <p style={{ margin: 0, fontSize: 13, color: C.danger, lineHeight: 1.55 }}>
                      <strong>Cancelación:</strong> {selected.motivo_cancelacion}
                    </p>
                  )}
                </div>

                {/* Si está confirmada — campo para notas */}
                {selected.estado === "confirmada" && (
                  <div style={{
                    position: "relative", marginBottom: 16,
                    background: C.surface,
                    border: `1px dashed ${C.lineStrong}`,
                    borderRadius: RADIUS.lg,
                    padding: 16,
                  }}>
                    <span style={{
                      position: "absolute", left: -24, top: 18,
                      width: 14, height: 14, borderRadius: "50%",
                      background: C.surface,
                      border: `2px solid ${C.lineStrong}`,
                    }}/>
                    <label style={{
                      display: "block", fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 1,
                      color: C.ink3, marginBottom: 6,
                    }}>
                      Notas de la consulta
                    </label>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      rows={3}
                      placeholder="Anota síntomas, diagnóstico, tratamiento…"
                      style={{
                        width: "100%", padding: "10px 12px",
                        borderRadius: RADIUS.sm,
                        border: `1px solid ${C.lineStrong}`,
                        background: C.surface, color: C.ink,
                        fontSize: 13, outline: "none", resize: "vertical",
                        fontFamily: FONT.ui,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {tab === "vacunas" && (
              <div style={{
                padding: "40px 24px", textAlign: "center",
                background: C.surface, border: `1px solid ${C.line}`,
                borderRadius: RADIUS.lg,
                color: C.ink3,
              }}>
                <FontAwesomeIcon icon={faNotesMedical} style={{ fontSize: 28, color: C.muted, marginBottom: 10, display: "block" }}/>
                Sin registros de vacunación
              </div>
            )}
            {tab === "recetas" && (
              <div style={{
                padding: "40px 24px", textAlign: "center",
                background: C.surface, border: `1px solid ${C.line}`,
                borderRadius: RADIUS.lg,
                color: C.ink3,
              }}>
                <FontAwesomeIcon icon={faFilePrescription} style={{ fontSize: 28, color: C.muted, marginBottom: 10, display: "block" }}/>
                Sin recetas registradas
              </div>
            )}
            {tab === "documentos" && (
              <div style={{
                padding: "40px 24px", textAlign: "center",
                background: C.surface, border: `1px solid ${C.line}`,
                borderRadius: RADIUS.lg,
                color: C.ink3,
              }}>
                <FontAwesomeIcon icon={faImage} style={{ fontSize: 28, color: C.muted, marginBottom: 10, display: "block" }}/>
                Sin documentos adjuntos
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SOLICITUDES (citas pendientes de confirmación)
   ════════════════════════════════════════════════════════════════ */
function Solicitudes({ onActualizar }) {
  const { C } = useTheme();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState({});
  const [rechazoModal, setRechazoModal] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const cargar = () => {
    setCargando(true);
    api.get("/veterinario/solicitudes")
      .then(r => setSolicitudes(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const confirmar = async (id) => {
    setAccionando(p => ({ ...p, [id]: "confirmando" }));
    try {
      await api.patch(`/veterinario/citas/${id}/confirmar`);
      cargar(); onActualizar?.();
    } finally {
      setAccionando(p => ({ ...p, [id]: null }));
    }
  };

  const rechazar = async () => {
    if (!motivoRechazo.trim()) return;
    setAccionando(p => ({ ...p, [rechazoModal.id]: "rechazando" }));
    try {
      await api.patch(`/veterinario/citas/${rechazoModal.id}/rechazar`, { motivo_cancelacion: motivoRechazo });
      setRechazoModal(null); setMotivoRechazo(""); cargar(); onActualizar?.();
    } finally {
      setAccionando(p => ({ ...p, [rechazoModal?.id]: null }));
    }
  };

  if (cargando) return <Spinner/>;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Inbox
      </span>
      <h1 style={{
        margin: "6px 0 6px",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 32, color: C.ink,
      }}>
        Solicitudes pendientes
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.ink3 }}>
        {solicitudes.length} cita{solicitudes.length !== 1 ? "s" : ""} esperando confirmación
      </p>

      {/* Modal rechazo */}
      {rechazoModal && (
        <div onClick={() => setRechazoModal(null)} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.surface, borderRadius: RADIUS.lg,
            width: "100%", maxWidth: 440, padding: 28,
          }}>
            <h3 style={{
              margin: "0 0 6px",
              fontFamily: FONT.display, fontStyle: "italic",
              fontWeight: 600, fontSize: 20, color: C.ink,
            }}>
              Rechazar solicitud
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: C.ink3 }}>
              {rechazoModal.nombre_mascota} · {fmtFecha(rechazoModal.fecha)} {fmtHora(rechazoModal.hora)}
            </p>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 1,
              color: C.ink3, marginBottom: 6,
            }}>
              Motivo del rechazo *
            </label>
            <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)}
              rows={3} placeholder="Explica por qué no puedes atender esta cita..."
              autoFocus
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: RADIUS.sm, border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink,
                fontSize: 13, outline: "none", resize: "none",
                marginBottom: 16, fontFamily: FONT.ui,
              }}/>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRechazoModal(null)} style={{
                flex: 1, padding: "10px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink2,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
                Cancelar
              </button>
              <button onClick={rechazar} disabled={!motivoRechazo.trim()} style={{
                flex: 1, padding: "10px",
                borderRadius: RADIUS.sm, border: "none",
                background: !motivoRechazo.trim() ? C.surfaceAlt : C.danger,
                color: !motivoRechazo.trim() ? C.muted : "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: !motivoRechazo.trim() ? "default" : "pointer",
                fontFamily: FONT.ui,
              }}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
        }}>
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 42, color: C.success, marginBottom: 12, display: "block" }}/>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>
            Sin solicitudes pendientes
          </p>
          <p style={{ fontSize: 13, color: C.ink3, margin: 0 }}>
            Todas las solicitudes están al día
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {solicitudes.map(s => (
            <div key={s.id} style={{
              background: C.surface,
              border: `1px solid ${C.warningBorder}`,
              borderRadius: RADIUS.lg,
              padding: "18px 22px",
              display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap",
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: RADIUS.md,
                background: C.brandSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, flexShrink: 0,
              }}>
                {especieEmoji(s.especie_mascota)}
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <h4 style={{
                  margin: "0 0 4px",
                  fontFamily: FONT.display, fontStyle: "italic",
                  fontWeight: 600, fontSize: 18, color: C.ink,
                }}>
                  {s.nombre_mascota}
                </h4>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: C.ink3 }}>
                  {s.especie_mascota} · Tutor: <strong style={{ color: C.ink2 }}>{s.cliente_nombre} {s.cliente_apellido}</strong>
                </p>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.ink2, marginBottom: 10, flexWrap: "wrap" }}>
                  <span>📅 {fmtFecha(s.fecha)}</span>
                  <span>⏰ {fmtHora(s.hora)}</span>
                </div>
                <div style={{
                  padding: "10px 12px",
                  borderRadius: RADIUS.sm,
                  background: C.surfaceAlt,
                  fontSize: 12, color: C.ink2, lineHeight: 1.55,
                }}>
                  <strong style={{ color: C.ink }}>Motivo: </strong>{s.motivo}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button onClick={() => confirmar(s.id)}
                  disabled={accionando[s.id] === "confirmando"}
                  style={{
                    padding: "9px 16px",
                    borderRadius: RADIUS.sm, border: "none",
                    background: C.brand, color: "#fff",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 7,
                    fontFamily: FONT.ui,
                  }}>
                  <FontAwesomeIcon icon={faCheck}/> Confirmar
                </button>
                <button onClick={() => { setRechazoModal(s); setMotivoRechazo(""); }}
                  style={{
                    padding: "9px 16px",
                    borderRadius: RADIUS.sm,
                    border: `1px solid ${C.dangerBorder}`,
                    background: C.dangerBg, color: C.danger,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 7,
                    fontFamily: FONT.ui,
                  }}>
                  <FontAwesomeIcon icon={faXmark}/> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DISPONIBILIDAD
   ════════════════════════════════════════════════════════════════ */
const DIAS_SEMANA = [
  { n: 0, label: "Domingo" },
  { n: 1, label: "Lunes" },
  { n: 2, label: "Martes" },
  { n: 3, label: "Miércoles" },
  { n: 4, label: "Jueves" },
  { n: 5, label: "Viernes" },
  { n: 6, label: "Sábado" },
];

function Disponibilidad() {
  const { C } = useTheme();
  const [config, setConfig] = useState(DIAS_SEMANA.map(d => ({
    dia_semana: d.n, activo: false, bloques: [{ hora_inicio: "08:00", hora_fin: "12:00" }],
  })));
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api.get("/veterinario/disponibilidad")
      .then(r => {
        const lista = r.data || [];
        setConfig(DIAS_SEMANA.map(d => {
          const dBloques = lista.filter(x => x.dia_semana === d.n);
          if (dBloques.length) {
            return {
              dia_semana: d.n, activo: true,
              bloques: dBloques.map(b => ({
                hora_inicio: b.hora_inicio.slice(0, 5),
                hora_fin: b.hora_fin.slice(0, 5),
              })),
            };
          }
          return { dia_semana: d.n, activo: false, bloques: [{ hora_inicio: "08:00", hora_fin: "12:00" }] };
        }));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    setGuardando(true); setMsg({});
    const disponibilidad = config.flatMap(d =>
      d.activo
        ? d.bloques.map(b => ({ dia_semana: d.dia_semana, hora_inicio: b.hora_inicio, hora_fin: b.hora_fin, activo: true }))
        : []
    );
    try {
      await api.put("/veterinario/disponibilidad", { disponibilidad });
      setMsg({ texto: "Disponibilidad actualizada.", tipo: "ok" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error.", tipo: "err" });
    } finally {
      setGuardando(false);
    }
  };

  const toggle = (i) => setConfig(p => p.map((d, j) => j === i ? { ...d, activo: !d.activo } : d));
  const addBloque = (i) => setConfig(p => p.map((d, j) => j === i ? { ...d, bloques: [...d.bloques, { hora_inicio: "14:00", hora_fin: "18:00" }] } : d));
  const removeBloque = (i, bi) => setConfig(p => p.map((d, j) => j === i ? { ...d, bloques: d.bloques.filter((_, k) => k !== bi) } : d));
  const setBloque = (i, bi, campo, val) => setConfig(p => p.map((d, j) => j === i ? { ...d, bloques: d.bloques.map((b, k) => k === bi ? { ...b, [campo]: val } : b) } : d));

  if (cargando) return <Spinner/>;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Configuración
      </span>
      <h1 style={{
        margin: "6px 0 6px",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 32, color: C.ink,
      }}>
        Mi disponibilidad
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: C.ink3 }}>
        Configura los días y horarios en que los clientes pueden agendar citas.
      </p>

      <Msg texto={msg.texto} tipo={msg.tipo}/>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {DIAS_SEMANA.map((dia, i) => (
          <div key={dia.n} style={{
            borderRadius: RADIUS.lg,
            background: config[i].activo ? C.brandSoft : C.surface,
            border: `1px solid ${config[i].activo ? C.brandBorder : C.line}`,
            overflow: "hidden",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
              <button onClick={() => toggle(i)} style={{
                width: 42, height: 24, borderRadius: 12,
                border: "none", cursor: "pointer",
                background: config[i].activo ? C.brand : C.lineStrong,
                position: "relative", transition: "all 0.2s",
                flexShrink: 0,
              }}>
                <span style={{
                  position: "absolute", top: 3,
                  left: config[i].activo ? 21 : 3,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }}/>
              </button>
              <span style={{
                fontSize: 14, fontWeight: config[i].activo ? 700 : 500,
                color: config[i].activo ? C.brand : C.ink2,
                minWidth: 90, fontFamily: FONT.ui,
              }}>
                {dia.label}
              </span>
              {config[i].activo && (
                <span style={{ fontSize: 11, color: C.ink3 }}>
                  {config[i].bloques.length} bloque{config[i].bloques.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {config[i].activo && (
              <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {config[i].bloques.map((bloque, bi) => (
                  <div key={bi} style={{
                    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                    padding: "10px 14px", borderRadius: RADIUS.sm,
                    background: C.surface,
                    border: `1px solid ${C.brandBorder}`,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 1,
                      color: C.ink3, minWidth: 52,
                    }}>
                      Bloque {bi + 1}
                    </span>
                    {[
                      { l: "Desde", k: "hora_inicio" },
                      { l: "Hasta", k: "hora_fin" },
                    ].map(f => (
                      <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: C.ink3, fontWeight: 600 }}>{f.l}</span>
                        <input type="time" value={bloque[f.k]}
                          onChange={e => setBloque(i, bi, f.k, e.target.value)}
                          style={{
                            padding: "6px 10px", borderRadius: RADIUS.sm,
                            border: `1px solid ${C.lineStrong}`,
                            background: C.surface, color: C.ink,
                            fontSize: 13, outline: "none",
                            fontFamily: FONT.mono,
                          }}/>
                      </div>
                    ))}
                    {config[i].bloques.length > 1 && (
                      <button onClick={() => removeBloque(i, bi)} style={{
                        marginLeft: "auto",
                        width: 28, height: 28, borderRadius: RADIUS.sm,
                        border: `1px solid ${C.dangerBorder}`,
                        background: C.dangerBg, color: C.danger,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }}/>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addBloque(i)} style={{
                  alignSelf: "flex-start",
                  padding: "7px 14px", borderRadius: RADIUS.sm,
                  border: `1px dashed ${C.brandBorder}`,
                  background: "transparent", color: C.brand,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: FONT.ui,
                }}>
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: 9 }}/> Agregar bloque
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        padding: "12px 28px", borderRadius: RADIUS.sm,
        border: "none",
        background: guardando ? C.brandMid : C.brand, color: "#fff",
        fontSize: 13, fontWeight: 700,
        cursor: guardando ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: FONT.ui,
      }}>
        <FontAwesomeIcon icon={faFloppyDisk}/>
        {guardando ? "Guardando..." : "Guardar disponibilidad"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ANOMALÍAS
   ════════════════════════════════════════════════════════════════ */
function Anomalias() {
  const { C } = useTheme();
  const [anomalias, setAnomalias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/veterinario/anomalias")
      .then(r => setAnomalias(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner/>;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.warning, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Reportes
      </span>
      <h1 style={{
        margin: "6px 0 6px",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 32, color: C.ink,
      }}>
        Anomalías reportadas
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.ink3 }}>
        Historial de incidencias detectadas durante consultas.
      </p>

      {anomalias.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
        }}>
          <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: 38, color: C.muted, marginBottom: 12, display: "block" }}/>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>
            Sin anomalías reportadas
          </p>
          <p style={{ fontSize: 13, color: C.ink3, margin: 0 }}>
            Los reportes aparecerán aquí
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {anomalias.map(a => (
            <div key={a.id} style={{
              background: C.surface,
              border: `1px solid ${C.warningBorder}`,
              borderRadius: RADIUS.lg,
              padding: "18px 22px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: C.ink }}>
                    {a.nombre_mascota} · {a.cliente_nombre} {a.cliente_apellido}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>
                    Cita {a.codigo} · {fmtFecha(a.fecha)} {fmtHora(a.hora)}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{fdoc(a.created_at)}</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
                {a.descripcion}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {a.imagen_url && (
                  <a href={a.imagen_url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: RADIUS.sm,
                    background: "#dbeafe", color: "#1e40af",
                    border: "1px solid #bfdbfe",
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                  }}>
                    <FontAwesomeIcon icon={faImage}/> Ver imagen
                  </a>
                )}
                {a.video_url && (
                  <a href={a.video_url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: RADIUS.sm,
                    background: C.purpleBg, color: C.purpleDeep,
                    border: `1px solid ${C.purpleBorder}`,
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                  }}>
                    <FontAwesomeIcon icon={faVideo}/> Ver video
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONSULTAS (Órdenes de servicio veterinario)
   ════════════════════════════════════════════════════════════════ */

const fmtCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const ESTADO_OS = {
  pendiente:      { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Pendiente" },
  en_consulta:    { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe", label: "En consulta" },
  esperando_pago: { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff", label: "Esperando pago" },
  completada:     { bg: "#dcfce7", text: "#14532d", border: "#86efac", label: "Completada" },
  cancelada:      { bg: "#fee2e2", text: "#7f1d1d", border: "#fecaca", label: "Cancelada" },
};

function BadgeOS({ estado }) {
  const s = ESTADO_OS[estado] || ESTADO_OS.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: RADIUS.pill,
      background: s.bg, color: s.text,
      border: `1px solid ${s.border}`,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.text }}/>
      {s.label}
    </span>
  );
}

/* ─── Modal Consulta ─────────────────────────────────────────────────── */
function ModalConsulta({ ordenId, onClose, onUpdate }) {
  const { C } = useTheme();
  const [orden, setOrden] = useState(null);
  const [items, setItems] = useState([]);
  const [diagnostico, setDiagnostico] = useState("");
  const [notasInternas, setNotasInternas] = useState("");
  const [cargando, setCargando] = useState(true);
  const [buscadorOpen, setBuscadorOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [agregando, setAgregando] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [msg, setMsg] = useState({});
  const debRef = useRef(null);

  const cargar = () => {
    setCargando(true);
    api.get(`/ordenes-servicio/${ordenId}`)
      .then(r => {
        setOrden(r.data.orden);
        setItems(r.data.items || []);
        setDiagnostico(r.data.orden.diagnostico || "");
        setNotasInternas(r.data.orden.notas_internas || "");
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [ordenId]); // eslint-disable-line

  // Buscar insumos clínicos
  useEffect(() => {
    if (!buscadorOpen) return;
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      api.get("/veterinario/insumos", { params: { buscar: busqueda || "" } })
        .then(r => setResultados(r.data || []))
        .catch(() => setResultados([]));
    }, 250);
  }, [busqueda, buscadorOpen]);

  const guardarDiagnostico = async () => {
    try {
      await api.patch(`/ordenes-servicio/${ordenId}/diagnostico`, {
        diagnostico,
        notas_internas: notasInternas,
      });
      setMsg({ texto: "Diagnóstico guardado", tipo: "ok" });
      setTimeout(() => setMsg({}), 2000);
      onUpdate?.();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error", tipo: "err" });
    }
  };

  const agregarInsumo = async (prod) => {
    setAgregando(prod.id);
    try {
      await api.post(`/ordenes-servicio/${ordenId}/items`, {
        producto_id: prod.id,
        cantidad: 1,
      });
      cargar(); onUpdate?.();
      setBuscadorOpen(false); setBusqueda("");
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al agregar", tipo: "err" });
    } finally {
      setAgregando(null);
    }
  };

  const quitarInsumo = async (itemId) => {
    if (!confirm("¿Quitar este insumo? Se devolverá al inventario.")) return;
    try {
      await api.delete(`/ordenes-servicio/${ordenId}/items/${itemId}`);
      cargar(); onUpdate?.();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al quitar", tipo: "err" });
    }
  };

  const cerrarConsulta = async () => {
    if (!diagnostico.trim()) {
      setMsg({ texto: "Escribe el diagnóstico antes de cerrar.", tipo: "err" });
      return;
    }
    if (!confirm("¿Cerrar la consulta? La orden pasará a 'Esperando pago' y el cajero podrá cobrarla.")) return;
    setCerrando(true);
    try {
      // Guardar diagnóstico primero
      await api.patch(`/ordenes-servicio/${ordenId}/diagnostico`, {
        diagnostico, notas_internas: notasInternas,
      });
      await api.patch(`/ordenes-servicio/${ordenId}/cerrar`);
      onUpdate?.();
      onClose();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error", tipo: "err" });
    } finally {
      setCerrando(false);
    }
  };

  const cerrada = orden?.estado === "completada" || orden?.estado === "esperando_pago";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, borderRadius: RADIUS.lg,
        width: "100%", maxWidth: 880, maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: C.shadowLg,
        fontFamily: FONT.ui,
      }}>
        {cargando || !orden ? (
          <div style={{ padding: 80, textAlign: "center" }}>
            <Spinner/>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.line}`,
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: FONT.mono, fontSize: 11, fontWeight: 700,
                    color: C.brand, letterSpacing: 1,
                  }}>
                    {orden.codigo}
                  </span>
                  <BadgeOS estado={orden.estado}/>
                </div>
                <h2 style={{
                  margin: 0,
                  fontFamily: FONT.display, fontStyle: "italic",
                  fontWeight: 600, fontSize: 24, color: C.ink,
                }}>
                  {orden.nombre_mascota || "Sin nombre"} <span style={{ fontSize: 14, color: C.ink3, fontStyle: "normal", fontWeight: 500 }}>· {orden.especie_mascota || "—"}</span>
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.ink3 }}>
                  Tutor: <strong style={{ color: C.ink2 }}>{orden.cliente_nombre} {orden.cliente_apellido}</strong>
                  {orden.cliente_tel && <> · 📱 {orden.cliente_tel}</>}
                </p>
                {orden.motivo_consulta && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: C.ink2, fontStyle: "italic" }}>
                    "{orden.motivo_consulta}"
                  </p>
                )}
              </div>
              <button onClick={onClose} style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1px solid ${C.line}`,
                background: C.surfaceAlt, color: C.ink2,
                cursor: "pointer",
              }}>
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {msg.texto && (
                <div style={{
                  marginBottom: 14, padding: "10px 14px",
                  borderRadius: RADIUS.sm,
                  background: msg.tipo === "ok" ? C.successBg : C.dangerBg,
                  border: `1px solid ${msg.tipo === "ok" ? C.successBorder : C.dangerBorder}`,
                  color: msg.tipo === "ok" ? C.success : C.danger,
                  fontSize: 13,
                }}>
                  {msg.texto}
                </div>
              )}

              {/* Diagnóstico */}
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: "block", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 1.2,
                  color: C.ink3, marginBottom: 8,
                }}>
                  Diagnóstico médico {!cerrada && "*"}
                </label>
                <textarea
                  value={diagnostico}
                  onChange={e => setDiagnostico(e.target.value)}
                  disabled={cerrada}
                  rows={4}
                  placeholder="Síntomas observados, examen físico, diagnóstico, tratamiento recomendado..."
                  style={{
                    width: "100%", padding: "12px 14px",
                    borderRadius: RADIUS.sm,
                    border: `1px solid ${C.lineStrong}`,
                    background: cerrada ? C.surfaceAlt : C.surface,
                    color: C.ink, fontSize: 14,
                    outline: "none", resize: "vertical",
                    fontFamily: FONT.ui,
                    opacity: cerrada ? 0.7 : 1,
                  }}
                />
                <textarea
                  value={notasInternas}
                  onChange={e => setNotasInternas(e.target.value)}
                  disabled={cerrada}
                  rows={2}
                  placeholder="Notas internas (no visibles para el cliente)..."
                  style={{
                    width: "100%", marginTop: 8, padding: "10px 14px",
                    borderRadius: RADIUS.sm,
                    border: `1px dashed ${C.lineStrong}`,
                    background: cerrada ? C.surfaceAlt : C.surface,
                    color: C.ink3, fontSize: 12,
                    outline: "none", resize: "vertical",
                    fontFamily: FONT.ui,
                  }}
                />
                {!cerrada && (
                  <button onClick={guardarDiagnostico} style={{
                    marginTop: 8, padding: "7px 14px",
                    borderRadius: RADIUS.sm,
                    background: "transparent",
                    border: `1px solid ${C.lineStrong}`,
                    color: C.ink2,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 11 }}/>
                    Guardar diagnóstico
                  </button>
                )}
              </div>

              {/* Insumos */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{
                    fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1.2,
                    color: C.ink3,
                  }}>
                    Insumos médicos · {items.length}
                  </label>
                  {!cerrada && (
                    <button onClick={() => setBuscadorOpen(v => !v)} style={{
                      padding: "7px 14px",
                      borderRadius: RADIUS.sm,
                      background: C.purple, color: "#fff",
                      border: "none", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: FONT.ui,
                    }}>
                      <FontAwesomeIcon icon={faPills} style={{ fontSize: 11 }}/>
                      Agregar insumo médico
                    </button>
                  )}
                </div>

                {/* Buscador insumos */}
                {buscadorOpen && !cerrada && (
                  <div style={{
                    marginBottom: 12,
                    padding: 14,
                    background: C.purpleSoft,
                    border: `1px solid ${C.purpleBorder}`,
                    borderRadius: RADIUS.lg,
                  }}>
                    <div style={{ position: "relative", marginBottom: 10 }}>
                      <FontAwesomeIcon icon={faMagnifyingGlass} style={{
                        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        color: "#a855f7", fontSize: 12,
                      }}/>
                      <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar vacuna, antiparasitario, etc..."
                        autoFocus
                        style={{
                          width: "100%", height: 38, padding: "0 14px 0 38px",
                          borderRadius: RADIUS.sm,
                          border: `1px solid ${C.purpleBorder}`,
                          background: C.surface, color: C.ink,
                          fontSize: 13, outline: "none",
                          fontFamily: FONT.ui,
                        }}
                      />
                    </div>
                    {resultados.length === 0 ? (
                      <p style={{ margin: 0, padding: 16, textAlign: "center", fontSize: 13, color: "#a855f7" }}>
                        {busqueda
                          ? `Sin resultados para "${busqueda}"`
                          : "Escribe para buscar insumos clínicos"}
                      </p>
                    ) : (
                      <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                        {resultados.map(p => (
                          <button key={p.id}
                            onClick={() => agregarInsumo(p)}
                            disabled={p.stock === 0 || agregando === p.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 12,
                              padding: "10px 12px",
                              borderRadius: RADIUS.sm,
                              background: C.surface,
                              border: `1px solid ${C.line}`,
                              cursor: p.stock === 0 ? "not-allowed" : "pointer",
                              opacity: p.stock === 0 ? 0.5 : 1,
                              textAlign: "left",
                              fontFamily: FONT.ui,
                            }}
                            onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.background = C.surfaceAlt; }}
                            onMouseLeave={e => e.currentTarget.style.background = C.surface}>
                            <div style={{
                              width: 32, height: 32, borderRadius: RADIUS.sm,
                              background: C.purpleBg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: C.purple, fontSize: 14,
                            }}>
                              <FontAwesomeIcon icon={faSyringe}/>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>
                                {p.nombre}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: C.ink3 }}>
                                {p.marca || "Sin marca"} · Stock: {p.stock}
                              </p>
                            </div>
                            <span style={{
                              fontFamily: FONT.mono,
                              fontSize: 13, fontWeight: 700, color: C.purple,
                            }}>
                              {fmtCOP(p.precio)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de items agregados */}
                {items.length === 0 ? (
                  <div style={{
                    padding: "24px",
                    textAlign: "center",
                    background: C.surfaceAlt,
                    borderRadius: RADIUS.lg,
                    color: C.ink3, fontSize: 13,
                  }}>
                    Sin insumos agregados todavía
                  </div>
                ) : (
                  <div style={{
                    border: `1px solid ${C.purpleBorder}`,
                    borderRadius: RADIUS.lg,
                    overflow: "hidden",
                  }}>
                    {items.map((it, i) => (
                      <div key={it.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px",
                        background: C.purpleSoft,
                        borderBottom: i < items.length - 1 ? `1px solid ${C.purpleBorder}` : "none",
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: RADIUS.sm,
                          background: C.purpleBg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: C.purple, fontSize: 14, flexShrink: 0,
                        }}>
                          <FontAwesomeIcon icon={faSyringe}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>
                            {it.nombre_snap}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>
                            {it.cantidad} × {fmtCOP(it.precio_unitario)}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: FONT.mono,
                          fontSize: 14, fontWeight: 700, color: C.purpleDeep,
                        }}>
                          {fmtCOP(it.subtotal)}
                        </span>
                        {!cerrada && (
                          <button onClick={() => quitarInsumo(it.id)} style={{
                            width: 30, height: 30, borderRadius: RADIUS.sm,
                            border: "none",
                            background: "transparent", color: C.danger,
                            cursor: "pointer", fontSize: 12,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = C.dangerBg}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <FontAwesomeIcon icon={faTrash}/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer totales + cerrar */}
            <div style={{
              padding: "16px 24px",
              borderTop: `1px solid ${C.line}`,
              background: C.surfaceAlt,
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink3, marginBottom: 3 }}>
                  <span>Consulta base</span>
                  <span style={{ fontFamily: FONT.mono }}>{fmtCOP(orden.precio_consulta)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink3, marginBottom: 6 }}>
                  <span>Insumos médicos</span>
                  <span style={{ fontFamily: FONT.mono }}>{fmtCOP(orden.subtotal_insumos)}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  paddingTop: 6, borderTop: `1px solid ${C.line}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Total</span>
                  <span style={{
                    fontFamily: FONT.display, fontWeight: 700,
                    fontSize: 22, color: C.ink, letterSpacing: -0.3,
                  }}>
                    {fmtCOP(orden.total)}
                  </span>
                </div>
              </div>
              {!cerrada && (
                <button onClick={cerrarConsulta} disabled={cerrando} style={{
                  padding: "12px 22px",
                  borderRadius: RADIUS.sm, border: "none",
                  background: cerrando ? C.surfaceAlt : C.purple,
                  color: cerrando ? C.muted : "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: cerrando ? "default" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: FONT.ui,
                }}>
                  <FontAwesomeIcon icon={faCheck}/>
                  {cerrando ? "Cerrando..." : "Cerrar consulta → Cobro"}
                </button>
              )}
              {cerrada && (
                <span style={{
                  padding: "10px 18px", borderRadius: RADIUS.sm,
                  background: C.purpleBg, color: C.purpleDeep,
                  fontSize: 12, fontWeight: 700,
                  border: `1px solid ${C.purpleBorder}`,
                }}>
                  Consulta cerrada · {orden.estado === "completada" ? "Pagada" : "Esperando pago"}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Lista de consultas (vista del vet) ───────────────────────────── */
function Consultas() {
  const { C } = useTheme();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState("activas");
  const [insumosStats, setInsumosStats] = useState(null);

  const cargar = () => {
    setCargando(true);
    api.get("/ordenes-servicio/vet/mis-ordenes")
      .then(r => setOrdenes(r.data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
    api.get("/ordenes-servicio/stats/insumos")
      .then(r => setInsumosStats(r.data))
      .catch(() => {});
  };

  useEffect(() => { cargar(); }, []);

  const filtradas = ordenes.filter(o => {
    if (filtro === "activas")    return ["pendiente", "en_consulta"].includes(o.estado);
    if (filtro === "esperando")  return o.estado === "esperando_pago";
    if (filtro === "completadas") return o.estado === "completada";
    return true;
  });

  return (
    <div style={{ padding: "24px 28px" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Atención médica
      </span>
      <h1 style={{
        margin: "6px 0 6px",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 32, color: C.ink,
      }}>
        Consultas en curso
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: C.ink3 }}>
        Órdenes de servicio creadas por recepción. Abre una para escribir el diagnóstico y agregar insumos médicos.
      </p>

      {/* Stats insumos */}
      {insumosStats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12, marginBottom: 22,
        }}>
          {[
            { label: "Consultas con insumos", value: insumosStats.consultas_con_insumos || 0, icon: faNotesMedical },
            { label: "Unidades dispensadas",  value: insumosStats.unidades_dispensadas || 0,  icon: faSyringe },
            { label: "Valor insumos",         value: fmtCOP(insumosStats.total_insumos || 0), icon: faMoneyBillWave },
          ].map(k => (
            <div key={k.label} style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, ${C.purpleSoft} 0%, ${C.purpleBg} 100%)",
              border: `1px solid ${C.purpleBorder}`,
              borderRadius: RADIUS.lg,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: RADIUS.sm,
                background: "#fff", color: C.purple,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>
                <FontAwesomeIcon icon={k.icon}/>
              </div>
              <div>
                <div style={{
                  fontFamily: FONT.display, fontWeight: 700, fontSize: 20,
                  color: C.purpleDeep, lineHeight: 1.1,
                }}>
                  {k.value}
                </div>
                <div style={{ fontSize: 10, color: C.purple, marginTop: 2, fontWeight: 600, letterSpacing: 0.3 }}>
                  {k.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { k: "activas",     l: "Activas" },
          { k: "esperando",   l: "Esperando pago" },
          { k: "completadas", l: "Completadas" },
          { k: "todas",       l: "Todas" },
        ].map(f => {
          const activo = filtro === f.k;
          return (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{
              padding: "6px 14px", borderRadius: RADIUS.pill,
              background: activo ? C.purple : "transparent",
              color: activo ? "#fff" : C.ink2,
              border: `1px solid ${activo ? C.purple : C.lineStrong}`,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT.ui,
            }}>{f.l}</button>
          );
        })}
      </div>

      {cargando ? <Spinner/> : filtradas.length === 0 ? (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: C.surface, border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
        }}>
          <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: 40, color: C.muted, marginBottom: 12, display: "block" }}/>
          <p style={{ margin: 0, fontSize: 14, color: C.ink3 }}>
            {filtro === "activas"
              ? "Sin consultas activas. Espera a que recepción registre nuevos pacientes."
              : "Sin consultas en este filtro"}
          </p>
        </div>
      ) : (
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
        }}>
          {filtradas.map((o, i) => (
            <button key={o.id} onClick={() => setSeleccionada(o.id)} style={{
              display: "flex", width: "100%", textAlign: "left",
              padding: "16px 20px", gap: 14,
              background: "transparent", border: "none",
              borderBottom: i < filtradas.length - 1 ? `1px solid ${C.line}` : "none",
              cursor: "pointer", alignItems: "center",
              fontFamily: FONT.ui,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.surfaceAlt}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{
                width: 46, height: 46, borderRadius: RADIUS.md,
                background: o.items_count > 0 ? C.purpleBg : C.brandSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                {especieEmoji(o.especie_mascota)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
                    {o.nombre_mascota || "Sin nombre"}
                  </span>
                  <BadgeOS estado={o.estado}/>
                  {o.items_count > 0 && (
                    <span style={{
                      padding: "2px 8px", borderRadius: RADIUS.pill,
                      background: C.purple, color: "#fff",
                      fontSize: 9, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>
                      <FontAwesomeIcon icon={faPills} style={{ fontSize: 8 }}/>
                      {o.items_count} insumo{o.items_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.ink3 }}>
                  {o.cliente_nombre} {o.cliente_apellido} · {o.motivo_consulta || "Consulta general"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, fontFamily: FONT.mono }}>
                  {o.codigo}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontFamily: FONT.display, fontWeight: 700,
                  fontSize: 18, color: C.ink,
                }}>
                  {fmtCOP(o.total)}
                </div>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11, color: C.muted }}/>
              </div>
            </button>
          ))}
        </div>
      )}

      {seleccionada && (
        <ModalConsulta
          ordenId={seleccionada}
          onClose={() => setSeleccionada(null)}
          onUpdate={cargar}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   HISTORIAL (Año → Mes → Pacientes)
   ════════════════════════════════════════════════════════════════ */

const MESES_NOMBRE = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function Historial({ initialBusqueda = "" }) {
  const { C } = useTheme();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(initialBusqueda);
  const [anoActivo, setAnoActivo] = useState(null);
  const [mesActivo, setMesActivo] = useState(null);
  const [detalleId, setDetalleId] = useState(null);

  useEffect(() => {
    setCargando(true);
    api.get("/ordenes-servicio/vet/mis-ordenes")
      .then(r => setOrdenes((r.data || []).filter(o => o.estado === "completada")))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // Agrupar por año → mes
  const arbol = (() => {
    const map = {};
    ordenes.forEach(o => {
      // Usar pagada_at o cerrada_at o created_at
      const fecha = new Date(o.cerrada_at || o.created_at);
      if (isNaN(fecha)) return;
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      if (!map[año]) map[año] = {};
      if (!map[año][mes]) map[año][mes] = [];
      map[año][mes].push(o);
    });
    return map;
  })();

  // Búsqueda global ignora archivo
  const resultadosBusqueda = busqueda.trim().length >= 2
    ? ordenes.filter(o => {
        const q = busqueda.toLowerCase();
        return (
          (o.nombre_mascota || "").toLowerCase().includes(q) ||
          (o.cliente_nombre || "").toLowerCase().includes(q) ||
          (o.cliente_apellido || "").toLowerCase().includes(q) ||
          (o.codigo || "").toLowerCase().includes(q)
        );
      })
    : null;

  const años = Object.keys(arbol).map(Number).sort((a, b) => b - a);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>
        Archivo
      </span>
      <h1 style={{
        margin: "6px 0 6px",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 32, color: C.ink,
      }}>
        Historial de consultas
      </h1>
      <p style={{ margin: "0 0 22px", fontSize: 14, color: C.ink3 }}>
        Navega por año y mes, o busca directamente por nombre de mascota o dueño.
      </p>

      {/* Buscador global */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 480 }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)",
          color: C.muted, fontSize: 12, pointerEvents: "none",
        }}/>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por mascota, dueño o código..."
          style={{
            width: "100%", height: 42, padding: "0 38px",
            borderRadius: RADIUS.pill,
            border: `1px solid ${C.lineStrong}`,
            background: C.surface, color: C.ink,
            fontSize: 13, fontFamily: FONT.ui,
            outline: "none",
          }}
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")} style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            width: 22, height: 22, borderRadius: "50%",
            border: "none", background: C.surfaceAlt, color: C.ink3,
            cursor: "pointer", fontSize: 10,
          }}>
            <FontAwesomeIcon icon={faXmark}/>
          </button>
        )}
      </div>

      {cargando ? <Spinner/> : (
        <>
          {/* Resultados búsqueda (ignora archivo) */}
          {resultadosBusqueda ? (
            <div>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: C.ink3 }}>
                {resultadosBusqueda.length} resultado{resultadosBusqueda.length !== 1 ? "s" : ""} para "<strong style={{ color: C.ink }}>{busqueda}</strong>"
              </p>
              {resultadosBusqueda.length === 0 ? (
                <div style={{
                  padding: 40, textAlign: "center",
                  background: C.surface, border: `1px solid ${C.line}`,
                  borderRadius: RADIUS.lg, color: C.ink3, fontSize: 14,
                }}>
                  Sin coincidencias. Intenta con otro nombre.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {resultadosBusqueda.map(o => (
                    <TarjetaConsultaHistorial key={o.id} orden={o} onVerDetalle={() => setDetalleId(o.id)}/>
                  ))}
                </div>
              )}
            </div>
          ) : !anoActivo ? (
            /* Nivel 1: AÑOS */
            <div>
              {años.length === 0 ? (
                <div style={{
                  padding: 60, textAlign: "center",
                  background: C.surface, border: `1px solid ${C.line}`,
                  borderRadius: RADIUS.lg, color: C.ink3,
                }}>
                  Aún no tienes consultas archivadas.
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
                }}>
                  {años.map(a => {
                    const totalAño = Object.values(arbol[a]).reduce((s, arr) => s + arr.length, 0);
                    return (
                      <button key={a}
                        onClick={() => setAnoActivo(a)}
                        style={{
                          padding: "22px 20px",
                          background: C.surface,
                          border: `1px solid ${C.line}`,
                          borderRadius: RADIUS.lg,
                          textAlign: "left", cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: FONT.ui,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = C.shadowMd; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 18, color: C.brand, marginBottom: 8 }}/>
                        <div style={{
                          fontFamily: FONT.display, fontWeight: 700,
                          fontSize: 32, color: C.ink, letterSpacing: -0.5,
                          lineHeight: 1.1,
                        }}>
                          {a}
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: C.ink3 }}>
                          {totalAño} consulta{totalAño !== 1 ? "s" : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !mesActivo && mesActivo !== 0 ? (
            /* Nivel 2: MESES */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <button onClick={() => setAnoActivo(null)} style={{
                  background: "transparent", border: "none",
                  color: C.brand, fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 11 }}/> Años
                </button>
                <span style={{ color: C.muted }}>/</span>
                <h3 style={{
                  margin: 0, fontFamily: FONT.display, fontStyle: "italic",
                  fontWeight: 600, fontSize: 22, color: C.ink,
                }}>
                  {anoActivo}
                </h3>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}>
                {Object.keys(arbol[anoActivo]).map(Number).sort((a, b) => b - a).map(m => {
                  const total = arbol[anoActivo][m].length;
                  return (
                    <button key={m}
                      onClick={() => setMesActivo(m)}
                      style={{
                        padding: "18px 16px",
                        background: C.surface,
                        border: `1px solid ${C.line}`,
                        borderRadius: RADIUS.lg,
                        textAlign: "left", cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: FONT.ui,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = C.shadowSm; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: 14, color: C.brand, marginBottom: 6 }}/>
                      <div style={{
                        fontFamily: FONT.display, fontWeight: 700,
                        fontSize: 20, color: C.ink, letterSpacing: -0.3,
                      }}>
                        {MESES_NOMBRE[m]}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: C.ink3 }}>
                        {total} consulta{total !== 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Nivel 3: PACIENTES con resumen */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                <button onClick={() => setAnoActivo(null)} style={{
                  background: "transparent", border: "none",
                  color: C.brand, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Años</button>
                <span style={{ color: C.muted }}>/</span>
                <button onClick={() => setMesActivo(null)} style={{
                  background: "transparent", border: "none",
                  color: C.brand, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  {anoActivo}
                </button>
                <span style={{ color: C.muted }}>/</span>
                <h3 style={{
                  margin: 0, fontFamily: FONT.display, fontStyle: "italic",
                  fontWeight: 600, fontSize: 20, color: C.ink,
                }}>
                  {MESES_NOMBRE[mesActivo]}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {arbol[anoActivo][mesActivo].map(o => (
                  <TarjetaConsultaHistorial key={o.id} orden={o} onVerDetalle={() => setDetalleId(o.id)}/>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {detalleId && (
        <ModalConsulta
          ordenId={detalleId}
          onClose={() => setDetalleId(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}

/* Tarjeta resumen historial: Diagnóstico + Insumos + Total */
function TarjetaConsultaHistorial({ orden, onVerDetalle }) {
  const { C } = useTheme();
  const fecha = new Date(orden.cerrada_at || orden.created_at);
  const fechaStr = fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <button onClick={onVerDetalle} style={{
      display: "flex", width: "100%", textAlign: "left",
      padding: "16px 20px", gap: 14,
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderLeft: orden.items_count > 0 ? "3px solid #7c3aed" : `3px solid ${C.brand}`,
      borderRadius: RADIUS.lg,
      cursor: "pointer", alignItems: "flex-start",
      fontFamily: FONT.ui,
      transition: "all 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = C.shadowMd; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{
        width: 44, height: 44, borderRadius: RADIUS.md,
        background: orden.items_count > 0 ? "#f3e8ff" : C.brandSoft,
        color: orden.items_count > 0 ? "#7c3aed" : C.brand,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {especieEmoji(orden.especie_mascota)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
            {orden.nombre_mascota || "Sin nombre"}
          </span>
          <span style={{ fontSize: 12, color: C.ink3 }}>
            · {orden.cliente_nombre} {orden.cliente_apellido}
          </span>
          {orden.items_count > 0 && (
            <span style={{
              padding: "2px 8px", borderRadius: RADIUS.pill,
              background: "#7c3aed", color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <FontAwesomeIcon icon={faPills} style={{ fontSize: 8 }}/>
              {orden.items_count} insumo{orden.items_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {orden.diagnostico && (
          <p style={{
            margin: "0 0 4px", fontSize: 12, color: C.ink2, lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            <strong style={{ color: C.ink3, textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>Diagnóstico:</strong>{" "}
            {orden.diagnostico}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>
          {orden.codigo} · {fechaStr}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontFamily: FONT.display, fontWeight: 700,
          fontSize: 18, color: orden.items_count > 0 ? "#6b21a8" : C.ink,
        }}>
          {fmtCOP(orden.total)}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted }}>
          Total cobrado
        </p>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   LAYOUT PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
const NAV = [
  { id: "agenda",        label: "Agenda hoy",     icon: faCalendarDays },
  { id: "consultas",     label: "Consultas",      icon: faStethoscope, accent: "#7c3aed" },
  { id: "historial",     label: "Historial",      icon: faClipboardList },
  { id: "solicitudes",   label: "Solicitudes",    icon: faInbox, badge: true },
  { id: "disponibilidad",label: "Disponibilidad", icon: faClock },
  { id: "anomalias",     label: "Anomalías",      icon: faTriangleExclamation },
];

export default function PanelVeterinario() {
  const { C, toggle, mode } = useTheme();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("agenda");
  const [solicitudesCount, setSolicitudesCount] = useState(0);
  const [vetPerfil, setVetPerfil] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (usuario && !["veterinario", "admin", "superadmin"].includes(usuario.rol)) {
      navigate("/");
    }
  }, [usuario, navigate]);

  useEffect(() => {
    api.get("/veterinario/perfil").then(r => setVetPerfil(r.data)).catch(() => {});
  }, []);

  // Conteo de solicitudes
  useEffect(() => {
    api.get("/veterinario/solicitudes")
      .then(r => setSolicitudesCount(r.data.length))
      .catch(() => setSolicitudesCount(0));
  }, [seccion]);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    const fd = new FormData(); fd.append("foto", file);
    try {
      const { data } = await api.patch("/veterinario/foto-perfil", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVetPerfil(p => ({ ...p, foto_url: data.foto_url }));
    } catch {} finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const fotoSrc = vetPerfil?.foto_url
    ? (vetPerfil.foto_url.startsWith("http") ? vetPerfil.foto_url : `${STATIC}${vetPerfil.foto_url}`)
    : null;

  const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <style>{`
        @keyframes vp-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          .vp-vet-split { grid-template-columns: 1fr !important; height: auto !important; }
          .vp-citas-list { max-height: 50vh; }
        }
        @media (max-width: 768px) {
          .vp-vet-sidebar { display: none !important; }
        }
      `}</style>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }} onChange={handleFotoChange}/>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        background: C.canvas,
        fontFamily: FONT.ui,
      }}>

        {/* ── Sidebar ── */}
        <aside className="vp-vet-sidebar" style={{
          width: 220, flexShrink: 0,
          background: C.sidebar,
          borderRight: `1px solid ${C.sidebarBorder}`,
          display: "flex", flexDirection: "column",
        }}>
          {/* Logo */}
          <Link to="/" style={{
            padding: "18px 18px 14px",
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none",
            borderBottom: `1px solid ${C.sidebarBorder}`,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: RADIUS.sm,
              background: C.lime, color: C.brandDark,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900,
            }}>✦</div>
            <div>
              <div style={{
                fontFamily: FONT.display, fontStyle: "italic",
                fontWeight: 600, fontSize: 15, color: C.sidebarTextHi,
              }}>
                Victoria·Pets
              </div>
            </div>
          </Link>

          {/* Eyebrow */}
          <p style={{
            margin: 0, padding: "16px 18px 8px",
            fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}>
            Veterinario
          </p>

          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(item => {
              const activo = seccion === item.id;
              return (
                <button key={item.id} onClick={() => setSeccion(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  borderRadius: RADIUS.sm, border: "none",
                  background: activo ? C.sidebarActive : "transparent",
                  color: activo ? C.sidebarTextHi : C.sidebarText,
                  fontSize: 13, fontWeight: activo ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  textAlign: "left",
                  fontFamily: FONT.ui,
                  position: "relative",
                }}
                onMouseEnter={e => { if (!activo) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = C.sidebarTextHi; } }}
                onMouseLeave={e => { if (!activo) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.sidebarText; } }}>
                  <FontAwesomeIcon icon={item.icon} style={{ width: 14, fontSize: 13 }}/>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && solicitudesCount > 0 && (
                    <span style={{
                      minWidth: 18, height: 18, padding: "0 5px",
                      borderRadius: "50%",
                      background: C.coral, color: "#fff",
                      fontSize: 10, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontFamily: FONT.mono,
                    }}>
                      {solicitudesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Perfil vet abajo */}
          <div style={{
            padding: 14,
            borderTop: `1px solid ${C.sidebarBorder}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <button onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto"
              style={{
                position: "relative",
                width: 36, height: 36, borderRadius: "50%",
                border: "none", padding: 0,
                background: C.coral, color: "#fff",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer", overflow: "hidden",
                flexShrink: 0,
              }}>
              {fotoSrc ? (
                <img src={fotoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              ) : (
                <>{(usuario?.nombre?.[0] || "V").toUpperCase()}{(usuario?.apellido?.[0] || "T").toUpperCase()}</>
              )}
              {subiendoFoto && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "vp-spin 0.8s linear infinite",
                  }}/>
                </div>
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: 12, fontWeight: 700, color: C.sidebarTextHi,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                Dr(a). {usuario?.nombre || "—"}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: C.sidebarText }}>
                {vetPerfil?.especialidad || "Vet. general"}
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <header style={{
            height: 64, flexShrink: 0,
            background: C.surface,
            borderBottom: `1px solid ${C.line}`,
            padding: "0 24px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: C.ink3, textTransform: "capitalize" }}>
                Dr(a). {usuario?.nombre} {usuario?.apellido} · {vetPerfil?.especialidad || "Vet. general"}
              </p>
              <h2 style={{
                margin: "2px 0 0",
                fontFamily: FONT.display, fontStyle: "italic",
                fontWeight: 600, fontSize: 22, color: C.ink,
                textTransform: "capitalize", letterSpacing: -0.2,
              }}>
                {seccion === "agenda" ? `Agenda · ${hoy}` :
                 seccion === "consultas" ? "Consultas en curso" :
                 seccion === "historial" ? "Archivo de consultas" :
                 seccion === "solicitudes" ? "Solicitudes" :
                 seccion === "disponibilidad" ? "Disponibilidad" :
                 "Anomalías"}
              </h2>
            </div>

            {/* Buscador */}
            <div style={{ position: "relative", maxWidth: 240, flex: "1 1 200px" }}>
              <FontAwesomeIcon icon={faMagnifyingGlass}
                style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)",
                  color: C.muted, fontSize: 11,
                  pointerEvents: "none",
                }}/>
              <input type="text" placeholder="Buscar…"
                style={{
                  width: "100%", height: 36,
                  padding: "0 14px 0 32px",
                  borderRadius: RADIUS.pill,
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surfaceAlt, color: C.ink,
                  fontSize: 12, outline: "none",
                  fontFamily: FONT.ui,
                }}/>
            </div>

            {/* Notif */}
            <button style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `1px solid ${C.lineStrong}`,
              background: C.surface, color: C.ink2,
              cursor: "pointer", position: "relative",
            }}>
              <FontAwesomeIcon icon={faBell} style={{ fontSize: 13 }}/>
              {solicitudesCount > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6,
                  width: 7, height: 7, borderRadius: "50%",
                  background: C.coral,
                }}/>
              )}
            </button>

            {/* Tema */}
            <button onClick={toggle} style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `1px solid ${C.lineStrong}`,
              background: C.surface, color: C.ink2,
              cursor: "pointer",
            }}>
              <FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon} style={{ fontSize: 13 }}/>
            </button>

            {/* Logout */}
            <button onClick={() => { logout(); navigate("/"); }}
              style={{
                padding: "0 16px", height: 36,
                borderRadius: RADIUS.sm,
                border: "none",
                background: C.brand, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: FONT.ui,
              }}>
              <FontAwesomeIcon icon={faPlus}/> Nueva consulta
            </button>
          </header>

          {/* Contenido */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            {seccion === "agenda" && <Agenda/>}
            {seccion === "consultas" && <Consultas/>}
            {seccion === "historial" && <Historial/>}
            {seccion === "solicitudes" && <Solicitudes onActualizar={() => setSeccion("solicitudes")}/>}
            {seccion === "disponibilidad" && <Disponibilidad/>}
            {seccion === "anomalias" && <Anomalias/>}
          </div>
        </main>
      </div>
    </>
  );
}
