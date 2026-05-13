// src/pages/MisCitas.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../styles/ThemeProvider.jsx";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faCalendarXmark, faPaw, faCheck, faXmark,
} from "@fortawesome/free-solid-svg-icons";

const ESTADO_CFG = {
  pendiente:         { bg:"#fef3c7", text:"#92400e", border:"#fde68a", dot:"#d97706", label:"Pendiente de confirmación" },
  confirmada:        { bg:"#dbeafe", text:"#1e40af", border:"#bfdbfe", dot:"#3b82f6", label:"Confirmada" },
  rechazada:         { bg:"#fee2e2", text:"#7f1d1d", border:"#fecaca", dot:"#dc2626", label:"Rechazada" },
  cancelada_cliente: { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", dot:"#9ca3af", label:"Cancelada por ti" },
  cancelada_vet:     { bg:"#fef3c7", text:"#92400e", border:"#fde68a", dot:"#d97706", label:"Cancelada por el veterinario" },
  completada:        { bg:"#dcfce7", text:"#14532d", border:"#bbf7d0", dot:"#16a34a", label:"Completada" },
  no_asistio:        { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", dot:"#9ca3af", label:"No asististe" },
};

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function BadgeEstado({ estado }) {
  const { C } = useTheme();
  const s = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 10px", borderRadius:999,
      background:s.bg, color:s.text, border:`1px solid ${s.border}`,
      fontSize:11, fontWeight:700, whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {s.label}
    </span>
  );
}

function FechaDisplay({ fecha, hora }) {
  const { C } = useTheme();
  const d = new Date(fecha + "T00:00:00");
  const [hh, mm] = hora.split(":");
  const n = parseInt(hh);
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      width:54, flexShrink:0, padding:"10px 8px",
      background:C.brandLight, borderRadius:12,
      border:`1px solid ${C.brandBorder}`,
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:C.brand, textTransform:"uppercase", letterSpacing:0.5 }}>
        {DIAS[d.getDay()]}
      </span>
      <span style={{ fontSize:22, fontWeight:900, color:C.brand, lineHeight:1.1 }}>
        {d.getDate()}
      </span>
      <span style={{ fontSize:9, color:C.textTer, textTransform:"uppercase" }}>
        {MESES[d.getMonth()]}
      </span>
      <div style={{ width:"100%", height:1, background:C.brandBorder, margin:"6px 0" }}/>
      <span style={{ fontSize:11, fontWeight:700, color:C.brand }}>
        {n > 12 ? n-12 : n}:{mm}{n >= 12 ? "pm" : "am"}
      </span>
    </div>
  );
}

/* ─── Modal de cancelación ──────────────────────────────────── */
function ModalCancelar({ cita, onCancelar, onCerrar }) {
  const { C } = useTheme();
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleCancelar = async () => {
    if (!motivo.trim()) return setError("Debes indicar el motivo.");
    setCargando(true); setError("");
    try {
      await api.patch(`/citas/${cita.id}/cancelar`, { motivo_cancelacion: motivo });
      onCancelar();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cancelar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onCerrar}>
      <div style={{ background:C.surface, borderRadius:20, width:"100%", maxWidth:460, padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin:"0 0 6px", fontSize:17, fontWeight:800, color:C.text }}>Cancelar cita</h3>
        <p style={{ margin:"0 0 16px", fontSize:13, color:C.textMuted }}>
          Cita con Dr(a). {cita.vet_nombre} {cita.vet_apellido} el {new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long" })}
        </p>

        {error && (
          <div style={{ marginBottom:14, padding:"10px 14px", borderRadius:10, background:C.dangerBg, border:`1px solid ${C.dangerBorder}`, color:C.danger, fontSize:13 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:8 }}>
            Motivo de cancelación *
          </label>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Explica por qué cancelas la cita..."
            rows={3}
            style={{
              width:"100%", padding:"11px 14px", borderRadius:12,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt, color:C.text,
              fontSize:13, outline:"none", resize:"none",
            }}
            onFocus={e => { e.target.style.borderColor=C.brand; }}
            onBlur={e => { e.target.style.borderColor=C.border; }}
            autoFocus
          />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCerrar} style={{ flex:1, padding:"11px 0", borderRadius:12, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSec, fontSize:13, fontWeight:500, cursor:"pointer" }}>
            Volver
          </button>
          <button
            onClick={handleCancelar}
            disabled={cargando || !motivo.trim()}
            style={{
              flex:1, padding:"11px 0", borderRadius:12, border:"none",
              background: (cargando || !motivo.trim()) ? C.surfaceAlt : C.danger,
              color: (cargando || !motivo.trim()) ? C.textMuted : "#fff",
              fontSize:13, fontWeight:700,
              cursor: (cargando || !motivo.trim()) ? "default" : "pointer",
            }}
          >
            {cargando ? "Cancelando..." : "Confirmar cancelación"}
          </button>
        </div>
      </div>
    </div>
  );
}

const DIAS_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MESES_FULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function fmtFechaLarga(f) {
  const d = new Date(f + "T00:00:00");
  return `${DIAS_FULL[d.getDay()]} ${d.getDate()} de ${MESES_FULL[d.getMonth()]}`;
}
function fmtHora(h) {
  const [hh, mm] = h.split(":");
  const n = parseInt(hh);
  return `${n > 12 ? n-12 : n}:${mm} ${n >= 12 ? "PM" : "AM"}`;
}

/* ─── Countdown hook ────────────────────────────────────────── */
function useCountdown(expiraEn) {
  const calcRest = () => {
    if (!expiraEn) return null;
    const diff = new Date(expiraEn) - new Date();
    return diff > 0 ? diff : 0;
  };
  const [restMs, setRestMs] = useState(calcRest);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => setRestMs(calcRest()), 1000);
    return () => clearInterval(ref.current);
  }, [expiraEn]);

  if (restMs === null) return null;
  if (restMs === 0) return { expirado: true, texto: "Propuesta expirada" };

  const totalSeg = Math.floor(restMs / 1000);
  const horas    = Math.floor(totalSeg / 3600);
  const minutos  = Math.floor((totalSeg % 3600) / 60);
  const segundos = totalSeg % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return { expirado: false, texto: `${pad(horas)}:${pad(minutos)}:${pad(segundos)}` };
}

/* ─── Banner de reagendamiento ─────────────────────────────── */
function BannerReagendamiento({ cita, onResponder }) {
  const { C } = useTheme();
  const [accionando,    setAccionando]    = useState(null);
  const [msg,           setMsg]           = useState("");
  const [rechazando,    setRechazando]    = useState(false); // muestra mini-form
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const tieneFecha  = cita.reagendamiento_nueva_fecha && cita.reagendamiento_nueva_hora;
  const countdown   = useCountdown(cita.reagendamiento_expira_en);
  const expirado    = countdown?.expirado === true;

  const aceptar = async () => {
    setAccionando("aceptar");
    try {
      await api.patch(`/citas/${cita.id}/aceptar-reagendamiento`);
      onResponder();
    } catch (err) {
      setMsg(err.response?.data?.error || "Error al procesar tu respuesta.");
      setAccionando(null);
    }
  };

  const confirmarRechazo = async () => {
    setAccionando("rechazar");
    try {
      await api.patch(`/citas/${cita.id}/rechazar-reagendamiento`, { motivo: motivoRechazo });
      onResponder();
    } catch (err) {
      setMsg(err.response?.data?.error || "Error al rechazar.");
      setAccionando(null);
    }
  };

  const orange = "#d97706";
  const orangeBg = "#fffbeb";
  const orangeBorder = "#fde68a";

  return (
    <div style={{ padding:"14px 16px", borderRadius:"0 0 14px 14px", background: expirado ? "#f9fafb" : orangeBg, borderTop:`2px solid ${expirado ? "#d1d5db" : orangeBorder}` }}>

      {/* Header con cuenta regresiva */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
        <p style={{ margin:0, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:0.8, color: expirado ? "#6b7280" : orange }}>
          {expirado ? "Propuesta de reagendamiento" : "⏳ Reagendamiento pendiente de respuesta"}
        </p>
        {countdown && (
          <span style={{
            fontSize:12, fontWeight:800, fontFamily:"monospace",
            padding:"3px 10px", borderRadius:8,
            background: expirado ? "#f3f4f6" : "#fff",
            color: expirado ? "#9ca3af" : countdown.expirado ? "#dc2626" : (Number(countdown.texto.split(":")[1]) < 10 && Number(countdown.texto.split(":")[0]) === 0) ? "#dc2626" : orange,
            border:`1px solid ${expirado ? "#e5e7eb" : orangeBorder}`,
          }}>
            {expirado ? "Expirada" : `Expira en ${countdown.texto}`}
          </span>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <p style={{ margin:"0 0 8px", fontSize:13, color: expirado ? "#6b7280" : "#78350f", lineHeight:1.6 }}>
            {cita.reagendamiento_motivo}
          </p>
          {tieneFecha && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:10, background:"#fff", border:`1.5px solid ${expirado ? "#e5e7eb" : orangeBorder}` }}>
              <span style={{ fontSize:11, color: expirado ? "#9ca3af" : orange, fontWeight:700 }}>Nueva fecha propuesta:</span>
              <span style={{ fontSize:13, fontWeight:800, color: expirado ? "#9ca3af" : "#92400e" }}>
                {fmtFechaLarga(cita.reagendamiento_nueva_fecha)} · {fmtHora(cita.reagendamiento_nueva_hora)}
              </span>
            </div>
          )}
          {!tieneFecha && !expirado && (
            <p style={{ margin:"8px 0 0", fontSize:12, color:"#92400e", fontStyle:"italic" }}>
              No se propone nueva fecha — contáctanos para reagendar.
            </p>
          )}
          {expirado && (
            <p style={{ margin:"8px 0 0", fontSize:12, color:"#9ca3af", fontStyle:"italic" }}>
              El tiempo para responder ha expirado. Contáctanos si aún deseas reagendar.
            </p>
          )}
          {msg && <p style={{ margin:"8px 0 0", fontSize:12, color:C.danger }}>{msg}</p>}
        </div>

        {tieneFecha && !expirado && (
          <div style={{ display:"flex", flexDirection:"column", gap:7, flexShrink:0, minWidth:180 }}>
            {!rechazando ? (
              <>
                <button
                  onClick={aceptar}
                  disabled={!!accionando}
                  style={{
                    padding:"8px 18px", borderRadius:10, border:"none",
                    background: accionando ? C.surfaceAlt : C.brand, color: accionando ? C.textMuted : "#fff",
                    fontSize:12, fontWeight:700, cursor: accionando ? "default" : "pointer",
                  }}
                >
                  {accionando === "aceptar" ? "Aceptando..." : <><FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }}/>Aceptar nueva fecha</>}
                </button>
                <button
                  onClick={() => setRechazando(true)}
                  disabled={!!accionando}
                  style={{
                    padding:"8px 18px", borderRadius:10,
                    border:`1.5px solid ${C.dangerBorder}`,
                    background:C.dangerBg, color:C.danger,
                    fontSize:12, fontWeight:600, cursor: accionando ? "default" : "pointer",
                  }}
                >
                  ✕ Rechazar y cancelar
                </button>
              </>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                <textarea
                  value={motivoRechazo}
                  onChange={e => setMotivoRechazo(e.target.value)}
                  placeholder="Motivo del rechazo (opcional)..."
                  rows={2}
                  style={{
                    width:"100%", padding:"8px 10px", borderRadius:10,
                    border:`1.5px solid ${C.dangerBorder}`,
                    background:C.dangerBg, color:C.text,
                    fontSize:12, outline:"none", resize:"none",
                  }}
                  onFocus={e => { e.target.style.borderColor=C.danger; }}
                  onBlur={e => { e.target.style.borderColor=C.dangerBorder; }}
                  autoFocus
                />
                <button
                  onClick={confirmarRechazo}
                  disabled={!!accionando}
                  style={{
                    padding:"8px 18px", borderRadius:10, border:"none",
                    background: accionando ? C.surfaceAlt : C.danger, color: accionando ? C.textMuted : "#fff",
                    fontSize:12, fontWeight:700, cursor: accionando ? "default" : "pointer",
                  }}
                >
                  {accionando === "rechazar" ? "Rechazando..." : "Confirmar rechazo"}
                </button>
                <button
                  onClick={() => setRechazando(false)}
                  disabled={!!accionando}
                  style={{
                    padding:"7px 18px", borderRadius:10,
                    border:`1.5px solid ${C.border}`,
                    background:C.surface, color:C.textSec,
                    fontSize:12, fontWeight:500, cursor: accionando ? "default" : "pointer",
                  }}
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tarjeta de cita ───────────────────────────────────────── */
function TarjetaCita({ cita, onCancelar }) {
  const { C } = useTheme();
  const [expandida, setExpandida] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const puedeCancelar = ["pendiente","confirmada"].includes(cita.estado) && cita.reagendamiento_estado !== "propuesta";
  const tieneReagendamiento = cita.reagendamiento_estado === "propuesta";

  return (
    <>
      {modalCancelar && (
        <ModalCancelar
          cita={cita}
          onCancelar={() => { setModalCancelar(false); onCancelar(); }}
          onCerrar={() => setModalCancelar(false)}
        />
      )}

      <div style={{
        background:C.surface,
        border:`1.5px solid ${tieneReagendamiento ? "#fde68a" : C.border}`,
        borderRadius:16, overflow:"hidden", transition:"all 0.2s",
      }}>
        {/* Cabecera */}
        <div style={{ display:"flex", gap:16, padding:"16px 20px", alignItems:"flex-start", flexWrap:"wrap" }}>
          <FechaDisplay fecha={cita.fecha} hora={cita.hora}/>

          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <BadgeEstado estado={cita.estado}/>
              {tieneReagendamiento && (
                <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:6, background:"#fef3c7", color:"#92400e", border:"1px solid #fde68a" }}>
                  ⚠ Esperando tu respuesta
                </span>
              )}
              {cita.reagendamiento_estado === "aceptada" && (
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:C.successBg, color:C.success, border:`1px solid ${C.successBorder}` }}>
                  Reagendada
                </span>
              )}
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace" }}>{cita.codigo}</span>
            </div>
            <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:C.text }}>
              Dr(a). {cita.vet_nombre} {cita.vet_apellido}
            </p>
            <p style={{ margin:"0 0 6px", fontSize:12, color:C.brand, fontWeight:600 }}>{cita.especialidad}</p>
            <p style={{ margin:0, fontSize:13, color:C.textSec }}>
              <FontAwesomeIcon icon={faPaw} style={{ color: C.brand, marginRight: 4 }}/>
              {cita.nombre_mascota} <span style={{ color:C.textMuted }}>({cita.especie_mascota})</span>
            </p>
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"flex-start", flexShrink:0 }}>
            {puedeCancelar && (
              <button
                onClick={() => setModalCancelar(true)}
                style={{
                  padding:"7px 14px", borderRadius:9,
                  border:`1.5px solid ${C.dangerBorder}`,
                  background:C.dangerBg, color:C.danger,
                  fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background=C.danger; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background=C.dangerBg; e.currentTarget.style.color=C.danger; }}
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => setExpandida(v => !v)}
              style={{
                padding:"7px 14px", borderRadius:9,
                border:`1.5px solid ${C.border}`,
                background:C.surfaceAlt, color:C.textSec,
                fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.15s",
              }}
            >
              {expandida ? "Cerrar ▲" : "Detalle ▼"}
            </button>
          </div>
        </div>

        {/* Banner de reagendamiento — siempre visible si hay propuesta */}
        {tieneReagendamiento && <BannerReagendamiento cita={cita} onResponder={onCancelar}/>}

        {/* Detalle expandido */}
        {expandida && (
          <div style={{ padding:"16px 20px 20px", borderTop:`1px solid ${C.border}`, background:C.surfaceAlt, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ padding:"12px 14px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}` }}>
              <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:C.textMuted }}>Motivo de consulta</p>
              <p style={{ margin:0, fontSize:13, color:C.textSec, lineHeight:1.6 }}>{cita.motivo}</p>
            </div>

            {(cita.estado === "rechazada" || cita.estado === "cancelada_vet" || cita.estado === "cancelada_cliente") && cita.motivo_cancelacion && (
              <div style={{ padding:"12px 14px", borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}` }}>
                <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:C.danger }}>
                  {cita.estado === "cancelada_cliente" ? "Tu motivo de cancelación" : "Motivo de rechazo/cancelación"}
                </p>
                <p style={{ margin:0, fontSize:13, color:C.danger, lineHeight:1.6 }}>{cita.motivo_cancelacion}</p>
              </div>
            )}

            {cita.notas_vet && (
              <div style={{ padding:"12px 14px", borderRadius:12, background:C.successBg, border:`1px solid ${C.successBorder}` }}>
                <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:C.success }}>Notas del veterinario</p>
                <p style={{ margin:0, fontSize:13, color:"#14532d", lineHeight:1.6 }}>{cita.notas_vet}</p>
              </div>
            )}

            <p style={{ margin:0, fontSize:11, color:C.textMuted }}>
              Agendada el {new Date(cita.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Página principal ─────────────────────────────────────── */
const FILTROS = [
  { key:"todas",    label:"Todas" },
  { key:"activas",  label:"Activas" },
  { key:"pendiente",label:"Pendientes" },
  { key:"confirmada",label:"Confirmadas" },
  { key:"completada",label:"Completadas" },
  { key:"canceladas",label:"Canceladas" },
];

export default function MisCitas() {
  const { C } = useTheme();
  const [citas,    setCitas]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro,   setFiltro]   = useState("todas");

  const cargar = () => {
    setCargando(true);
    api.get("/citas/mis-citas")
      .then(r => setCitas(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const citasFiltradas = citas.filter(c => {
    if (filtro === "todas")     return true;
    if (filtro === "activas")   return ["pendiente","confirmada"].includes(c.estado);
    if (filtro === "canceladas") return ["cancelada_cliente","cancelada_vet","rechazada"].includes(c.estado);
    return c.estado === filtro;
  });

  const count = (k) => {
    if (k === "todas")     return citas.length;
    if (k === "activas")   return citas.filter(c => ["pendiente","confirmada"].includes(c.estado)).length;
    if (k === "canceladas") return citas.filter(c => ["cancelada_cliente","cancelada_vet","rechazada"].includes(c.estado)).length;
    return citas.filter(c => c.estado === k).length;
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { to { background-position:-200% 0; } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .vp-citas-header { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1); }
        .vp-citas-list   { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        * { box-sizing:border-box; }
      `}</style>
      <div style={{ minHeight:"100vh", background:C.canvas }}>
        <Navbar/>

        <div style={{ background:C.brandDark, padding:"9px 0", textAlign:"center", animation:"slideDown 0.4s ease" }}>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.7)" }}>
            🏥 Historial de citas · <Link to="/agendar-cita" style={{ color:C.lime, fontWeight:700 }}>Agendar nueva cita →</Link>
          </p>
        </div>

        <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 16px 64px" }}>
          {/* Header */}
          <div className="vp-citas-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                Mis citas
              </h1>
              <p style={{ margin:0, fontSize:13, color:C.textMuted }}>
                Consulta el estado de tus citas veterinarias
              </p>
            </div>
            <Link to="/agendar-cita" style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"10px 20px", borderRadius:12,
              background:C.brand, color:"#fff", textDecoration:"none",
              fontSize:13, fontWeight:700,
              boxShadow:"0 4px 12px rgba(26,92,26,0.2)",
            }}>
              + Agendar cita
            </Link>
          </div>

          {/* Banner global si hay propuestas activas */}
          {(() => {
            const propuestas = citas.filter(c => c.reagendamiento_estado === "propuesta");
            const expiradas  = propuestas.filter(c => c.reagendamiento_expira_en && new Date() > new Date(c.reagendamiento_expira_en));
            const activas    = propuestas.filter(c => !c.reagendamiento_expira_en || new Date() <= new Date(c.reagendamiento_expira_en));
            if (activas.length === 0 && expiradas.length === 0) return null;
            return (
              <div style={{ marginBottom:20, padding:"14px 18px", borderRadius:16, background:"#fffbeb", border:"2px solid #fde68a" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>📬</span>
                  <div style={{ flex:1 }}>
                    {activas.length > 0 && (
                      <>
                        <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:800, color:"#92400e" }}>
                          Tienes {activas.length} propuesta{activas.length > 1 ? "s" : ""} de reagendamiento activa{activas.length > 1 ? "s" : ""}
                        </p>
                        <p style={{ margin:0, fontSize:12, color:"#78350f", lineHeight:1.6 }}>
                          Por favor confirma antes de que expire el tiempo. Revisa tus citas abajo y acepta o rechaza la propuesta.
                        </p>
                      </>
                    )}
                    {expiradas.length > 0 && activas.length === 0 && (
                      <>
                        <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#6b7280" }}>
                          Tienes {expiradas.length} propuesta{expiradas.length > 1 ? "s" : ""} de reagendamiento expirada{expiradas.length > 1 ? "s" : ""}
                        </p>
                        <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>
                          El tiempo para responder ha vencido. Contáctanos si aún deseas reagendar.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Filtros */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:20, scrollbarWidth:"none" }}>
            {FILTROS.map(f => {
              const c = count(f.key);
              if (f.key !== "todas" && c === 0) return null;
              const activo = filtro === f.key;
              return (
                <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  padding:"7px 14px", borderRadius:999, flexShrink:0,
                  border:`1.5px solid ${activo ? C.brand : C.border}`,
                  background: activo ? C.brandLight : C.surface,
                  color: activo ? C.brand : C.textSec,
                  fontSize:12, fontWeight: activo ? 700 : 400,
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  {f.label}
                  <span style={{
                    background: activo ? C.brand : C.surfaceAlt,
                    color: activo ? "#fff" : C.textMuted,
                    fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:999,
                  }}>{c}</span>
                </button>
              );
            })}
          </div>

          {/* Lista */}
          {cargando ? (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:100, borderRadius:16, background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
              ))}
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 24px", background:C.surface, borderRadius:20, border:`1px solid ${C.border}` }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: C.brandSoft, color: C.brand,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 34, margin: "0 auto 14px",
              }}>
                <FontAwesomeIcon icon={faCalendarXmark}/>
              </div>
              <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:C.text }}>
                {citas.length === 0 ? "Aún no tienes citas" : "Sin citas con ese filtro"}
              </h3>
              <p style={{ margin:"0 0 20px", fontSize:13, color:C.textMuted }}>
                {citas.length === 0
                  ? "Agenda tu primera consulta veterinaria ahora"
                  : "Prueba con otro filtro"}
              </p>
              <Link to="/agendar-cita" style={{ display:"inline-block", padding:"10px 24px", borderRadius:12, background:C.brand, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="vp-citas-list" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {citasFiltradas.map(c => (
                <TarjetaCita key={c.id} cita={c} onCancelar={cargar}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}