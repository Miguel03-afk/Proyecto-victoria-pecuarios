// src/pages/MisCitas.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const C = {
  brand:        "#0A6B40",
  brandMid:     "#138553",
  brandDark:    "#064E30",
  brandLight:   "#E4F5EC",
  brandBorder:  "#95CCAD",
  lime:         "#7AC143",
  limeDark:     "#5a9030",
  canvas:       "#F5FAF7",
  surface:      "#ffffff",
  surfaceAlt:   "#EDF6F1",
  text:         "#101F16",
  textSec:      "#2D4A38",
  textTer:      "#5A7A65",
  textMuted:    "#8FAA98",
  border:       "rgba(0,0,0,0.08)",
  danger:       "#dc2626",
  dangerBg:     "#fef2f2",
  dangerBorder: "#fecaca",
  success:      "#16a34a",
  successBg:    "#f0fdf4",
  successBorder:"#bbf7d0",
};

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

/* ─── Tarjeta de cita ───────────────────────────────────────── */
function TarjetaCita({ cita, onCancelar }) {
  const [expandida, setExpandida] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const puedeCancelar = ["pendiente","confirmada"].includes(cita.estado);

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
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:16, overflow:"hidden", transition:"all 0.2s",
      }}>
        {/* Cabecera */}
        <div style={{ display:"flex", gap:16, padding:"16px 20px", alignItems:"flex-start", flexWrap:"wrap" }}>
          <FechaDisplay fecha={cita.fecha} hora={cita.hora}/>

          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <BadgeEstado estado={cita.estado}/>
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace" }}>{cita.codigo}</span>
            </div>
            <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:C.text }}>
              Dr(a). {cita.vet_nombre} {cita.vet_apellido}
            </p>
            <p style={{ margin:"0 0 6px", fontSize:12, color:C.brand, fontWeight:600 }}>{cita.especialidad}</p>
            <p style={{ margin:0, fontSize:13, color:C.textSec }}>
              🐾 {cita.nombre_mascota} <span style={{ color:C.textMuted }}>({cita.especie_mascota})</span>
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
              <div style={{ fontSize:56, marginBottom:14 }}>📅</div>
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