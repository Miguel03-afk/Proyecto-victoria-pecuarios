// src/pages/PanelVeterinario.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  surfaceHover: "#dff0e6",
  text:         "#101F16",
  textSec:      "#2D4A38",
  textTer:      "#5A7A65",
  textMuted:    "#8FAA98",
  border:       "rgba(0,0,0,0.08)",
  borderMid:    "rgba(0,0,0,0.13)",
  sidebar:      "#064E30",
  sidebarBorder:"rgba(255,255,255,0.07)",
  sidebarActive:"rgba(255,255,255,0.10)",
  sidebarText:  "rgba(255,255,255,0.60)",
  sidebarTextHi:"#fff",
  gold:         "#b08a24",
  goldBorder:   "rgba(176,138,36,0.3)",
  danger:       "#dc2626",
  dangerBg:     "#fef2f2",
  dangerBorder: "#fecaca",
  success:      "#16a34a",
  successBg:    "#f0fdf4",
  successBorder:"#bbf7d0",
  warning:      "#d97706",
  warningBg:    "#fffbeb",
  warningBorder:"#fde68a",
};

const ESTADO_CFG = {
  pendiente:         { bg:"#fef3c7", text:"#92400e", border:"#fde68a", dot:"#d97706" },
  confirmada:        { bg:"#dbeafe", text:"#1e40af", border:"#bfdbfe", dot:"#3b82f6" },
  rechazada:         { bg:"#fee2e2", text:"#7f1d1d", border:"#fecaca", dot:"#dc2626" },
  cancelada_cliente: { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", dot:"#9ca3af" },
  cancelada_vet:     { bg:"#fef3c7", text:"#92400e", border:"#fde68a", dot:"#d97706" },
  completada:        { bg:"#dcfce7", text:"#14532d", border:"#bbf7d0", dot:"#16a34a" },
  no_asistio:        { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", dot:"#9ca3af" },
};

const DIAS_SEMANA = [
  { n:1, label:"Lunes" }, { n:2, label:"Martes" }, { n:3, label:"Miércoles" },
  { n:4, label:"Jueves" }, { n:5, label:"Viernes" },
  { n:6, label:"Sábado" }, { n:0, label:"Domingo" },
];

const fmt = (h) => {
  if (!h) return "";
  const [hh, mm] = h.split(":");
  const n = parseInt(hh);
  return `${n > 12 ? n-12 : n}:${mm} ${n >= 12 ? "PM" : "AM"}`;
};
const fdoc = (d) => d ? new Date(d).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"}) : "—";
const fmtFecha = (d) => d ? new Date(d+"T00:00:00").toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"}) : "";

/* ─── Badge de estado ───────────────────────────────────────── */
function Badge({ estado }) {
  const s = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5, padding:"3px 10px",borderRadius:999, background:s.bg,color:s.text,border:`1px solid ${s.border}`, fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>
      <span style={{ width:6,height:6,borderRadius:"50%",background:s.dot,flexShrink:0 }}/>
      {estado.replace(/_/g," ")}
    </span>
  );
}

/* ─── Spinner ───────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:48 }}>
      <div style={{ width:28,height:28,borderRadius:"50%", border:`2px solid ${C.brandLight}`,borderTopColor:C.brand, animation:"spin 0.8s linear infinite" }}/>
    </div>
  );
}

/* ─── Msg feedback ───────────────────────────────────────────── */
function Msg({ texto, tipo="ok" }) {
  if (!texto) return null;
  const esOk = tipo==="ok";
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10, padding:"12px 14px",borderRadius:12, background:esOk?C.successBg:C.dangerBg, border:`1px solid ${esOk?C.successBorder:C.dangerBorder}`, color:esOk?C.success:C.danger, fontSize:13,fontWeight:500,marginBottom:16 }}>
      <span>{esOk?"✓":"⚠️"}</span>{texto}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECCIÓN: Solicitudes pendientes (inbox)
   ════════════════════════════════════════════════════════════ */
function Solicitudes({ onActualizar }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [accionando,  setAccionando]  = useState({});
  const [rechazoModal, setRechazoModal] = useState(null); // cita a rechazar
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
    setAccionando(p => ({ ...p, [id]:"confirmando" }));
    try {
      await api.patch(`/veterinario/citas/${id}/confirmar`);
      cargar(); onActualizar?.();
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setAccionando(p => ({ ...p, [id]:null }));
    }
  };

  const rechazar = async () => {
    if (!motivoRechazo.trim()) return;
    setAccionando(p => ({ ...p, [rechazoModal.id]:"rechazando" }));
    try {
      await api.patch(`/veterinario/citas/${rechazoModal.id}/rechazar`, { motivo_cancelacion: motivoRechazo });
      setRechazoModal(null); setMotivoRechazo(""); cargar(); onActualizar?.();
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setAccionando(p => ({ ...p, [rechazoModal?.id]:null }));
    }
  };

  if (cargando) return <Spinner/>;

  return (
    <div>
      {rechazoModal && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={() => setRechazoModal(null)}>
          <div style={{ background:C.surface,borderRadius:20,width:"100%",maxWidth:440,padding:"28px",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 6px",fontSize:17,fontWeight:800,color:C.text }}>Rechazar solicitud</h3>
            <p style={{ margin:"0 0 16px",fontSize:13,color:C.textMuted }}>
              {rechazoModal.nombre_mascota} · {fmtFecha(rechazoModal.fecha)} {fmt(rechazoModal.hora)}
            </p>
            <label style={{ display:"block",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:C.textTer,marginBottom:8 }}>
              Motivo del rechazo *
            </label>
            <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} rows={3} placeholder="Explica por qué no puedes atender esta cita..."
              style={{ width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,outline:"none",resize:"none",marginBottom:16 }}
              onFocus={e => { e.target.style.borderColor=C.brand; }} onBlur={e => { e.target.style.borderColor=C.border; }} autoFocus/>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={() => setRechazoModal(null)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surface,color:C.textSec,fontSize:13,fontWeight:500,cursor:"pointer" }}>Cancelar</button>
              <button onClick={rechazar} disabled={!motivoRechazo.trim()} style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:!motivoRechazo.trim()?C.surfaceAlt:C.danger,color:!motivoRechazo.trim()?C.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:!motivoRechazo.trim()?"default":"pointer" }}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div style={{ textAlign:"center",padding:"48px 24px",background:C.surfaceAlt,borderRadius:16 }}>
          <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
          <p style={{ fontSize:15,fontWeight:700,color:C.text,margin:"0 0 6px" }}>Sin solicitudes pendientes</p>
          <p style={{ fontSize:13,color:C.textMuted,margin:0 }}>Todas las solicitudes están al día</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {solicitudes.map(s => (
            <div key={s.id} style={{ background:C.surface,border:`1.5px solid ${C.warningBorder}`,borderRadius:16,padding:"18px 20px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start" }}>
              {/* Info cliente */}
              <div style={{ flex:1,minWidth:200 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:C.brandLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:C.brand,flexShrink:0 }}>
                    {s.cliente_nombre?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin:0,fontSize:14,fontWeight:800,color:C.text }}>{s.cliente_nombre} {s.cliente_apellido}</p>
                    <p style={{ margin:0,fontSize:11,color:C.textMuted }}>{s.cliente_email} · {s.cliente_tel || "Sin tel."}</p>
                  </div>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                  {[
                    { label:"Mascota", val:`${s.nombre_mascota} (${s.especie_mascota})` },
                    { label:"Fecha", val:fmtFecha(s.fecha) },
                    { label:"Hora", val:fmt(s.hora) },
                    { label:"Solicitada", val:fdoc(s.created_at) },
                  ].map(f => (
                    <div key={f.label}>
                      <p style={{ margin:"0 0 2px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.textMuted }}>{f.label}</p>
                      <p style={{ margin:0,fontSize:12,fontWeight:600,color:C.text }}>{f.val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ padding:"10px 12px",borderRadius:10,background:C.surfaceAlt,border:`1px solid ${C.border}` }}>
                  <p style={{ margin:"0 0 3px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.textMuted }}>Motivo</p>
                  <p style={{ margin:0,fontSize:12,color:C.textSec,lineHeight:1.5 }}>{s.motivo}</p>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display:"flex",flexDirection:"column",gap:8,flexShrink:0,minWidth:140 }}>
                <button
                  onClick={() => confirmar(s.id)}
                  disabled={accionando[s.id]==="confirmando"}
                  style={{
                    padding:"10px 16px",borderRadius:12,border:"none",
                    background:C.brand,color:"#fff",
                    fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s",
                    opacity:accionando[s.id]==="confirmando"?0.7:1,
                  }}
                >
                  {accionando[s.id]==="confirmando" ? "Confirmando..." : "✓ Confirmar"}
                </button>
                <button
                  onClick={() => { setRechazoModal(s); setMotivoRechazo(""); }}
                  style={{
                    padding:"10px 16px",borderRadius:12,
                    border:`1.5px solid ${C.dangerBorder}`,
                    background:C.dangerBg,color:C.danger,
                    fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background=C.danger; e.currentTarget.style.color="#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background=C.dangerBg; e.currentTarget.style.color=C.danger; }}
                >
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECCIÓN: Agenda completa
   ════════════════════════════════════════════════════════════ */
function Agenda() {
  const [citas,    setCitas]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro,   setFiltro]   = useState("todas");
  const [expandida,setExpandida]= useState(null);
  const [notas,    setNotas]    = useState("");
  const [accionando,setAccionando] = useState({});
  const [msg,      setMsg]      = useState({});
  const [modalAnom,setModalAnom]= useState(null);
  const [formAnom, setFormAnom] = useState({ descripcion:"",imagen_url:"",video_url:"" });

  const cargar = () => {
    setCargando(true);
    const params = filtro !== "todas" ? { estado:filtro } : {};
    api.get("/veterinario/agenda", { params })
      .then(r => setCitas(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [filtro]);

  const accion = async (id, tipo, body={}) => {
    setAccionando(p => ({ ...p, [id]:tipo }));
    setMsg({});
    try {
      await api.patch(`/veterinario/citas/${id}/${tipo}`, body);
      setMsg({ texto:`Cita ${tipo==="completar"?"completada":tipo==="no-asistio"?"marcada como no asistió":tipo+"da"} correctamente.`, tipo:"ok" });
      cargar();
    } catch (err) {
      setMsg({ texto:err.response?.data?.error||"Error.", tipo:"err" });
    } finally {
      setAccionando(p => ({ ...p, [id]:null }));
    }
  };

  const reportarAnom = async () => {
    if (!formAnom.descripcion.trim()) return;
    try {
      await api.post(`/veterinario/citas/${modalAnom}/anomalia`, formAnom);
      setModalAnom(null); setFormAnom({ descripcion:"",imagen_url:"",video_url:"" });
      setMsg({ texto:"Anomalía reportada correctamente.", tipo:"ok" });
    } catch (err) {
      setMsg({ texto:err.response?.data?.error||"Error.", tipo:"err" });
    }
  };

  const FILTROS_AGENDA = [
    { key:"todas",label:"Todas" },
    { key:"pendiente",label:"Pendientes" },
    { key:"confirmada",label:"Confirmadas" },
    { key:"completada",label:"Completadas" },
    { key:"rechazada",label:"Rechazadas" },
    { key:"cancelada_cliente",label:"Canceladas" },
  ];

  return (
    <div>
      <Msg texto={msg.texto} tipo={msg.tipo}/>

      {/* Modal anomalía */}
      {modalAnom && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={() => setModalAnom(null)}>
          <div style={{ background:C.surface,borderRadius:20,width:"100%",maxWidth:480,padding:"28px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px",fontSize:17,fontWeight:800,color:C.text }}>Reportar anomalía</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {[
                { label:"Descripción *", key:"descripcion", placeholder:"Describe la anomalía observada..." },
                { label:"URL de imagen (opcional)", key:"imagen_url", placeholder:"https://..." },
                { label:"URL de video (opcional)", key:"video_url", placeholder:"https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:"block",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:C.textTer,marginBottom:6 }}>{f.label}</label>
                  {f.key==="descripcion"
                    ? <textarea value={formAnom[f.key]} onChange={e => setFormAnom(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3}
                        style={{ width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,outline:"none",resize:"none" }}
                        onFocus={e=>{e.target.style.borderColor=C.brand;}} onBlur={e=>{e.target.style.borderColor=C.border;}}/>
                    : <input type="url" value={formAnom[f.key]} onChange={e => setFormAnom(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                        style={{ width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,outline:"none" }}
                        onFocus={e=>{e.target.style.borderColor=C.brand;}} onBlur={e=>{e.target.style.borderColor=C.border;}}/>
                  }
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={() => setModalAnom(null)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surface,color:C.textSec,fontSize:13,cursor:"pointer" }}>Cancelar</button>
              <button onClick={reportarAnom} disabled={!formAnom.descripcion.trim()} style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:!formAnom.descripcion.trim()?C.surfaceAlt:C.brand,color:!formAnom.descripcion.trim()?C.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:!formAnom.descripcion.trim()?"default":"pointer" }}>
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:20,scrollbarWidth:"none" }}>
        {FILTROS_AGENDA.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{
            padding:"7px 14px",borderRadius:999,flexShrink:0,
            border:`1.5px solid ${filtro===f.key?C.brand:C.border}`,
            background:filtro===f.key?C.brandLight:C.surface,
            color:filtro===f.key?C.brand:C.textSec,
            fontSize:12,fontWeight:filtro===f.key?700:400,cursor:"pointer",transition:"all 0.15s",
          }}>{f.label}</button>
        ))}
      </div>

      {cargando ? <Spinner/> : citas.length === 0 ? (
        <div style={{ textAlign:"center",padding:"48px 24px",background:C.surfaceAlt,borderRadius:16 }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📅</div>
          <p style={{ fontSize:15,fontWeight:700,color:C.text,margin:0 }}>Sin citas con ese filtro</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {citas.map(c => (
            <div key={c.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden" }}>
              {/* Cabecera */}
              <button
                onClick={() => setExpandida(v => v===c.id?null:c.id)}
                style={{ width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:"none",border:"none",cursor:"pointer",textAlign:"left",flexWrap:"wrap" }}
              >
                {/* Fecha */}
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",width:48,flexShrink:0,padding:"8px 6px",background:C.brandLight,borderRadius:10,border:`1px solid ${C.brandBorder}` }}>
                  <span style={{ fontSize:18,fontWeight:900,color:C.brand,lineHeight:1 }}>
                    {new Date(c.fecha+"T00:00:00").getDate()}
                  </span>
                  <span style={{ fontSize:9,color:C.textTer,textTransform:"uppercase" }}>
                    {new Date(c.fecha+"T00:00:00").toLocaleDateString("es-CO",{month:"short"})}
                  </span>
                  <span style={{ fontSize:10,fontWeight:700,color:C.brand,marginTop:4 }}>
                    {fmt(c.hora)}
                  </span>
                </div>

                <div style={{ flex:1,minWidth:160 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                    <Badge estado={c.estado}/>
                    {c.anomalias > 0 && (
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a" }}>
                        ⚠ {c.anomalias} anomalía{c.anomalias>1?"s":""}
                      </span>
                    )}
                  </div>
                  <p style={{ margin:"0 0 2px",fontSize:14,fontWeight:700,color:C.text }}>
                    {c.cliente_nombre} {c.cliente_apellido}
                  </p>
                  <p style={{ margin:0,fontSize:12,color:C.textMuted }}>
                    🐾 {c.nombre_mascota} · {c.cliente_email}
                  </p>
                </div>

                <span style={{ fontSize:18,color:C.textMuted,transform:expandida===c.id?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",flexShrink:0 }}>⌄</span>
              </button>

              {/* Detalle */}
              {expandida === c.id && (
                <div style={{ padding:"16px 20px 20px",borderTop:`1px solid ${C.border}`,background:C.surfaceAlt,display:"flex",flexDirection:"column",gap:14 }}>
                  {/* Datos */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10 }}>
                    {[
                      { label:"Cliente", val:`${c.cliente_nombre} ${c.cliente_apellido}` },
                      { label:"Contacto", val:c.cliente_email },
                      { label:"Teléfono", val:c.cliente_tel||"No registrado" },
                      { label:"Mascota", val:`${c.nombre_mascota} (${c.especie_mascota})` },
                    ].map(f => (
                      <div key={f.label} style={{ padding:"10px 12px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}` }}>
                        <p style={{ margin:"0 0 2px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.textMuted }}>{f.label}</p>
                        <p style={{ margin:0,fontSize:12,fontWeight:600,color:C.text }}>{f.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Motivo */}
                  <div style={{ padding:"12px 14px",borderRadius:12,background:C.surface,border:`1px solid ${C.border}` }}>
                    <p style={{ margin:"0 0 4px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.textMuted }}>Motivo de consulta</p>
                    <p style={{ margin:0,fontSize:13,color:C.textSec,lineHeight:1.6 }}>{c.motivo}</p>
                  </div>

                  {/* Notas del vet (si ya tiene) */}
                  {c.notas_vet && (
                    <div style={{ padding:"12px 14px",borderRadius:12,background:C.successBg,border:`1px solid ${C.successBorder}` }}>
                      <p style={{ margin:"0 0 4px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:C.success }}>Tus notas</p>
                      <p style={{ margin:0,fontSize:13,color:"#14532d",lineHeight:1.6 }}>{c.notas_vet}</p>
                    </div>
                  )}

                  {/* Acciones según estado */}
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {c.estado === "confirmada" && (
                      <>
                        {/* Completar con notas */}
                        <div style={{ display:"flex",gap:8,flex:1,flexDirection:"column" }}>
                          <textarea
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            placeholder="Notas de la consulta (opcional)..."
                            rows={2}
                            style={{ width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.surface,color:C.text,fontSize:13,outline:"none",resize:"none" }}
                            onFocus={e=>{e.target.style.borderColor=C.brand;}} onBlur={e=>{e.target.style.borderColor=C.border;}}
                          />
                          <div style={{ display:"flex",gap:8 }}>
                            <button
                              onClick={() => accion(c.id,"completar",{ notas_vet:notas })}
                              disabled={accionando[c.id]==="completar"}
                              style={{ flex:1,padding:"9px",borderRadius:10,border:"none",background:C.brand,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}
                            >
                              {accionando[c.id]==="completar"?"...":"✓ Marcar completada"}
                            </button>
                            <button
                              onClick={() => accion(c.id,"no-asistio")}
                              disabled={accionando[c.id]==="no-asistio"}
                              style={{ flex:1,padding:"9px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:12,fontWeight:500,cursor:"pointer" }}
                            >
                              No asistió
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Reportar anomalía — siempre disponible */}
                    <button
                      onClick={() => setModalAnom(c.id)}
                      style={{
                        padding:"9px 16px",borderRadius:10,
                        border:`1.5px solid ${C.warningBorder}`,
                        background:C.warningBg,color:C.warning,
                        fontSize:12,fontWeight:600,cursor:"pointer",
                        alignSelf:"flex-start",
                      }}
                    >
                      ⚠ Reportar anomalía
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECCIÓN: Disponibilidad
   ════════════════════════════════════════════════════════════ */
function Disponibilidad() {
  const [config, setConfig] = useState(
    DIAS_SEMANA.map(d => ({ dia_semana:d.n, activo:false, hora_inicio:"08:00", hora_fin:"17:00" }))
  );
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg,       setMsg]       = useState({});

  useEffect(() => {
    api.get("/veterinario/disponibilidad")
      .then(r => {
        const guardada = r.data;
        setConfig(DIAS_SEMANA.map(d => {
          const g = guardada.find(x => x.dia_semana === d.n);
          return g
            ? { dia_semana:d.n, activo:true, hora_inicio:g.hora_inicio.slice(0,5), hora_fin:g.hora_fin.slice(0,5) }
            : { dia_semana:d.n, activo:false, hora_inicio:"08:00", hora_fin:"17:00" };
        }));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    setGuardando(true); setMsg({});
    try {
      await api.put("/veterinario/disponibilidad", { disponibilidad: config });
      setMsg({ texto:"Disponibilidad actualizada correctamente.", tipo:"ok" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto:err.response?.data?.error||"Error.", tipo:"err" });
    } finally {
      setGuardando(false);
    }
  };

  const toggle = (i) => setConfig(p => p.map((d,j) => j===i ? {...d, activo:!d.activo} : d));
  const setHora = (i, campo, val) => setConfig(p => p.map((d,j) => j===i ? {...d, [campo]:val} : d));

  if (cargando) return <Spinner/>;

  return (
    <div>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <p style={{ margin:"0 0 20px",fontSize:13,color:C.textMuted }}>
        Configura los días y horarios en que los clientes pueden agendar citas contigo.
      </p>
      <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:24 }}>
        {DIAS_SEMANA.map((dia, i) => (
          <div key={dia.n} style={{
            display:"flex",alignItems:"center",gap:16,
            padding:"14px 18px",borderRadius:14,
            background:config[i].activo?C.brandLight:C.surfaceAlt,
            border:`1.5px solid ${config[i].activo?C.brandBorder:C.border}`,
            transition:"all 0.2s",flexWrap:"wrap",
          }}>
            {/* Toggle */}
            <button onClick={() => toggle(i)} style={{
              width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",
              background:config[i].activo?C.brand:"rgba(0,0,0,0.15)",
              position:"relative",transition:"all 0.3s",flexShrink:0,
            }}>
              <span style={{
                position:"absolute",top:3,left:config[i].activo?"22px":"3px",
                width:18,height:18,borderRadius:"50%",background:"#fff",
                transition:"left 0.3s",display:"block",
                boxShadow:"0 1px 4px rgba(0,0,0,0.25)",
              }}/>
            </button>

            {/* Día */}
            <span style={{ fontSize:14,fontWeight:config[i].activo?700:400,color:config[i].activo?C.brand:C.textMuted,minWidth:80,flexShrink:0 }}>
              {dia.label}
            </span>

            {/* Horas */}
            {config[i].activo && (
              <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                {[
                  { label:"Desde", campo:"hora_inicio" },
                  { label:"Hasta", campo:"hora_fin" },
                ].map(f => (
                  <div key={f.campo} style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:11,color:C.textTer,fontWeight:600 }}>{f.label}</span>
                    <input type="time" value={config[i][f.campo]} onChange={e => setHora(i,f.campo,e.target.value)}
                      style={{ padding:"6px 10px",borderRadius:9,border:`1.5px solid ${C.brandBorder}`,background:C.surface,color:C.text,fontSize:13,outline:"none" }}
                      onFocus={e=>{e.target.style.borderColor=C.brand;}} onBlur={e=>{e.target.style.borderColor=C.brandBorder;}}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        padding:"12px 28px",borderRadius:12,border:"none",
        background:guardando?C.brandMid:C.brand,color:"#fff",
        fontSize:13,fontWeight:700,cursor:guardando?"default":"pointer",
        boxShadow:"0 4px 12px rgba(26,92,26,0.2)",
      }}>
        {guardando?"Guardando...":"Guardar disponibilidad"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECCIÓN: Anomalías reportadas
   ════════════════════════════════════════════════════════════ */
function Anomalias() {
  const [anomalias, setAnomalias] = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    api.get("/veterinario/anomalias")
      .then(r => setAnomalias(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner/>;

  if (!anomalias.length) return (
    <div style={{ textAlign:"center",padding:"48px 24px",background:C.surfaceAlt,borderRadius:16 }}>
      <div style={{ fontSize:48,marginBottom:12 }}>📋</div>
      <p style={{ fontSize:15,fontWeight:700,color:C.text,margin:"0 0 6px" }}>Sin anomalías reportadas</p>
      <p style={{ fontSize:13,color:C.textMuted,margin:0 }}>Los reportes aparecerán aquí</p>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {anomalias.map(a => (
        <div key={a.id} style={{ background:C.surface,border:`1.5px solid ${C.warningBorder}`,borderRadius:16,padding:"18px 20px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12,flexWrap:"wrap" }}>
            <div>
              <p style={{ margin:"0 0 3px",fontSize:13,fontWeight:800,color:C.text }}>
                {a.nombre_mascota} · {a.cliente_nombre} {a.cliente_apellido}
              </p>
              <p style={{ margin:0,fontSize:11,color:C.textMuted }}>
                Cita {a.codigo} · {fmtFecha(a.fecha)} {fmt(a.hora)}
              </p>
            </div>
            <span style={{ fontSize:11,color:C.textMuted,flexShrink:0 }}>{fdoc(a.created_at)}</span>
          </div>

          <p style={{ margin:"0 0 12px",fontSize:13,color:C.textSec,lineHeight:1.6 }}>{a.descripcion}</p>

          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {a.imagen_url && (
              <a href={a.imagen_url} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:"#dbeafe",color:"#1e40af",border:"1px solid #bfdbfe",fontSize:12,fontWeight:600,textDecoration:"none" }}>
                🖼 Ver imagen
              </a>
            )}
            {a.video_url && (
              <a href={a.video_url} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:"#f3e8ff",color:"#6b21a8",border:"1px solid #e9d5ff",fontSize:12,fontWeight:600,textDecoration:"none" }}>
                🎥 Ver video
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LAYOUT PRINCIPAL
   ════════════════════════════════════════════════════════════ */
const NAV = [
  { id:"solicitudes", label:"Solicitudes",   icon:"📥" },
  { id:"agenda",      label:"Mi agenda",     icon:"📅" },
  { id:"disponibilidad",label:"Disponibilidad",icon:"⏰" },
  { id:"anomalias",   label:"Anomalías",     icon:"⚠️" },
];

export default function PanelVeterinario() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("solicitudes");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    if (!["veterinario","admin","superadmin"].includes(usuario.rol)) {
      navigate("/");
    }
  }, [usuario]);

  const TITULOS = {
    solicitudes:"Solicitudes pendientes",
    agenda:"Mi agenda",
    disponibilidad:"Mi disponibilidad",
    anomalias:"Anomalías reportadas",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes shimmer { to { background-position:-200% 0; } }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 56 : 210, flexShrink:0,
          background:C.sidebar, display:"flex", flexDirection:"column",
          borderRight:`1px solid ${C.sidebarBorder}`,
          transition:"width 0.2s",
        }}>
          {/* Logo */}
          <div style={{ padding:"16px 14px", borderBottom:`1px solid ${C.sidebarBorder}` }}>
            {!collapsed ? (
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:30,height:30,borderRadius:9,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.brandDark,flexShrink:0 }}>V</div>
                <div>
                  <p style={{ margin:0,fontSize:11,fontWeight:700,color:C.sidebarTextHi,fontFamily:"'Playfair Display',serif",fontStyle:"italic" }}>Victoria Pets</p>
                  <p style={{ margin:0,fontSize:9,color:C.gold,letterSpacing:0.8,textTransform:"uppercase" }}>Panel Veterinario</p>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex",justifyContent:"center" }}>
                <div style={{ width:30,height:30,borderRadius:9,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.brandDark }}>V</div>
              </div>
            )}
          </div>

          {/* Usuario */}
          {!collapsed && usuario && (
            <div style={{ padding:"12px 14px",borderBottom:`1px solid ${C.sidebarBorder}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,background:C.sidebarActive }}>
                <div style={{ width:26,height:26,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.brandDark,flexShrink:0 }}>
                  {usuario.nombre?.charAt(0)}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ margin:0,fontSize:11,fontWeight:700,color:C.sidebarTextHi,truncate:true,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{usuario.nombre}</p>
                  <p style={{ margin:0,fontSize:9,color:C.gold }}>Veterinario</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex:1,padding:"8px",display:"flex",flexDirection:"column",gap:2 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setSeccion(n.id)} title={collapsed?n.label:undefined}
                style={{
                  width:"100%",display:"flex",alignItems:"center",gap:10,
                  padding:"10px 10px",borderRadius:10,border:"none",cursor:"pointer",
                  background:seccion===n.id?C.sidebarActive:"transparent",
                  color:seccion===n.id?C.sidebarTextHi:C.sidebarText,
                  borderLeft:seccion===n.id?`2px solid ${C.gold}`:"2px solid transparent",
                  fontSize:12,fontWeight:seccion===n.id?700:500,
                  transition:"all 0.15s",justifyContent:collapsed?"center":"flex-start",
                }}
                onMouseEnter={e => { if (seccion!==n.id) e.currentTarget.style.background=C.sidebarActive; }}
                onMouseLeave={e => { if (seccion!==n.id) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:15,flexShrink:0 }}>{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer sidebar */}
          <div style={{ padding:"8px",borderTop:`1px solid ${C.sidebarBorder}` }}>
            {!collapsed && (
              <button onClick={() => { logout(); navigate("/"); }}
                style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:10,border:"none",cursor:"pointer",background:"transparent",color:C.sidebarText,fontSize:12,transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.sidebarActive;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                <span>🚪</span><span>Cerrar sesión</span>
              </button>
            )}
            <button onClick={() => setCollapsed(v => !v)}
              style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"9px",borderRadius:10,border:"none",cursor:"pointer",background:"transparent",color:C.sidebarText,fontSize:14,transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.sidebarActive;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              {collapsed ? "→" : "←"}
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column" }}>
          {/* Header */}
          <header style={{ padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,borderBottom:`1px solid ${C.border}` }}>
            <div>
              <h1 style={{ margin:"0 0 2px",fontSize:16,fontWeight:800,color:C.text,fontFamily:"'Playfair Display',serif",fontStyle:"italic" }}>
                {TITULOS[seccion]}
              </h1>
              <p style={{ margin:0,fontSize:11,color:C.textMuted }}>
                {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              </p>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:C.success,animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11,color:C.textMuted }}>En línea</span>
            </div>
          </header>

          <div style={{ flex:1,padding:"24px 28px",overflowY:"auto" }}>
            {seccion === "solicitudes"    && <Solicitudes onActualizar={() => {}}/>}
            {seccion === "agenda"         && <Agenda/>}
            {seccion === "disponibilidad" && <Disponibilidad/>}
            {seccion === "anomalias"      && <Anomalias/>}
          </div>
        </main>
      </div>
    </>
  );
}