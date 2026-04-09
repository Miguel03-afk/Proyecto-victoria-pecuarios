// src/pages/AgendarCita.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

/* ─── Tokens ─────────────────────────────────────────────── */
const C = {
  brand:       "#1a5c1a",
  brandMid:    "#2d7a2d",
  brandDark:   "#0c180c",
  brandLight:  "#e6f3e6",
  brandBorder: "#b8d9b8",
  lime:        "#a3e635",
  canvas:      "#f6f7f4",
  surface:     "#ffffff",
  surfaceAlt:  "#f2f3ef",
  text:        "#111827",
  textSec:     "#374151",
  textTer:     "#6b7280",
  textMuted:   "#9ca3af",
  border:      "rgba(0,0,0,0.08)",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  dangerBorder:"#fecaca",
  success:     "#16a34a",
  successBg:   "#f0fdf4",
  successBorder:"#bbf7d0",
};

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const ESPECIES = ["Perro","Gato","Conejo","Ave","Reptil","Roedor","Otro"];

const fmt = (h) => {
  const [hh, mm] = h.split(":");
  const n = parseInt(hh);
  return `${n > 12 ? n - 12 : n}:${mm} ${n >= 12 ? "PM" : "AM"}`;
};

/* ─── Componentes base ─────────────────────────────────────── */
function Campo({ label, value, onChange, type="text", placeholder, required, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color: focused ? C.brand : C.textTer, marginBottom:6, transition:"color 0.15s" }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? C.brand : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color:C.text, fontSize:14, outline:"none", transition:"all 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
        }}
      />
      {hint && <p style={{ margin:"5px 0 0", fontSize:11, color:C.textMuted }}>{hint}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color: focused ? C.brand : C.textTer, marginBottom:6, transition:"color 0.15s" }}>
        {label}
      </label>
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? C.brand : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color:C.text, fontSize:14, outline:"none", cursor:"pointer", transition:"all 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
        }}
      >{children}</select>
    </div>
  );
}

/* ─── Paso 1: elegir veterinario ───────────────────────────── */
function PasoVeterinario({ onElegir }) {
  const [vets, setVets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/citas/veterinarios")
      .then(r => setVets(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height:160, borderRadius:16, background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
      ))}
    </div>
  );

  if (!vets.length) return (
    <div style={{ textAlign:"center", padding:"48px 24px", background:C.surfaceAlt, borderRadius:16 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🏥</div>
      <p style={{ color:C.textSec, fontSize:15, fontWeight:600 }}>No hay veterinarios disponibles en este momento</p>
      <p style={{ color:C.textMuted, fontSize:13, marginTop:6 }}>Intenta más tarde o contáctanos directamente</p>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
      {vets.map(v => (
        <button
          key={v.id}
          onClick={() => onElegir(v)}
          style={{
            display:"flex", flexDirection:"column", alignItems:"flex-start",
            padding:"20px", borderRadius:16, textAlign:"left",
            background:C.surface, border:`1.5px solid ${C.border}`,
            cursor:"pointer", transition:"all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,92,26,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {/* Avatar */}
          <div style={{
            width:52, height:52, borderRadius:14, marginBottom:14,
            background:C.brandLight, border:`2px solid ${C.brandBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, overflow:"hidden", flexShrink:0,
          }}>
            {v.foto_url
              ? <img src={v.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : "👨‍⚕️"}
          </div>

          <div style={{ flex:1 }}>
            <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:C.text }}>
              Dr(a). {v.nombre} {v.apellido}
            </p>
            <p style={{ margin:"0 0 10px", fontSize:12, color:C.brand, fontWeight:600 }}>
              {v.especialidad}
            </p>

            {/* Días disponibles */}
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
              {v.disponibilidad.map(d => (
                <span key={d.dia} style={{
                  fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6,
                  background:C.brandLight, color:C.brand,
                }}>
                  {DIAS[d.dia]}
                </span>
              ))}
            </div>

            <p style={{ margin:0, fontSize:11, color:C.textMuted }}>
              ⏱ {v.duracion_cita} min por cita
            </p>
          </div>

          <div style={{
            marginTop:14, width:"100%", padding:"8px 0", borderRadius:10,
            background:C.brandLight, color:C.brand,
            fontSize:13, fontWeight:700, textAlign:"center",
            transition:"all 0.15s",
          }}>
            Seleccionar →
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Paso 2: elegir fecha y hora ──────────────────────────── */
function PasoFechaHora({ vet, fecha, setFecha, hora, setHora }) {
  const [slots, setSlots] = useState([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [mensajeSlots, setMensajeSlots] = useState("");

  // Fecha mínima: mañana
  const fechaMin = new Date();
  fechaMin.setDate(fechaMin.getDate() + 1);
  const fechaMinStr = fechaMin.toISOString().split("T")[0];

  // Fecha máxima: 60 días
  const fechaMax = new Date();
  fechaMax.setDate(fechaMax.getDate() + 60);
  const fechaMaxStr = fechaMax.toISOString().split("T")[0];

  useEffect(() => {
    if (!fecha || !vet) return;
    setSlots([]); setHora(""); setCargandoSlots(true);
    api.get("/citas/disponibilidad", { params: { veterinario_id: vet.id, fecha } })
      .then(r => {
        setSlots(r.data.slots || []);
        setMensajeSlots(r.data.mensaje || "");
      })
      .catch(() => setMensajeSlots("Error al cargar horarios"))
      .finally(() => setCargandoSlots(false));
  }, [fecha, vet]);

  // Días disponibles del vet
  const diasDisp = new Set(vet.disponibilidad.map(d => d.dia));

  const isDateDisabled = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return !diasDisp.has(d.getDay());
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Vet seleccionado */}
      <div style={{
        display:"flex", alignItems:"center", gap:14,
        padding:"16px 18px", borderRadius:14,
        background:C.brandLight, border:`1px solid ${C.brandBorder}`,
      }}>
        <div style={{ width:44, height:44, borderRadius:12, background:C.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
          👨‍⚕️
        </div>
        <div>
          <p style={{ margin:0, fontWeight:800, color:C.brand, fontSize:14 }}>
            Dr(a). {vet.nombre} {vet.apellido}
          </p>
          <p style={{ margin:0, fontSize:12, color:C.textTer }}>{vet.especialidad} · {vet.duracion_cita} min</p>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {vet.disponibilidad.map(d => (
            <span key={d.dia} style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6, background:"rgba(26,92,26,0.15)", color:C.brand }}>
              {DIAS[d.dia]}
            </span>
          ))}
        </div>
      </div>

      {/* Selector de fecha */}
      <div>
        <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:8 }}>
          Selecciona una fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          min={fechaMinStr}
          max={fechaMaxStr}
          style={{
            width:"100%", padding:"11px 14px", borderRadius:12,
            border:`1.5px solid ${C.border}`,
            background:C.surfaceAlt, color:C.text,
            fontSize:14, outline:"none",
          }}
          onFocus={e => { e.target.style.borderColor=C.brand; e.target.style.boxShadow="0 0 0 3px rgba(26,92,26,0.08)"; }}
          onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }}
        />
        {fecha && isDateDisabled(fecha) && (
          <p style={{ margin:"6px 0 0", fontSize:12, color:C.danger }}>
            ⚠ El veterinario no atiende ese día. Días disponibles: {vet.disponibilidad.map(d => DIAS[d.dia]).join(", ")}
          </p>
        )}
      </div>

      {/* Slots de hora */}
      {fecha && !isDateDisabled(fecha) && (
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:10 }}>
            Horarios disponibles
          </label>
          {cargandoSlots ? (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ width:72, height:36, borderRadius:8, background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div style={{ padding:"16px 20px", borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}` }}>
              <p style={{ margin:0, fontSize:13, color:C.danger, fontWeight:500 }}>
                {mensajeSlots || "No hay horarios disponibles para este día."}
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {slots.map(s => (
                <button
                  key={s}
                  onClick={() => setHora(s)}
                  style={{
                    padding:"8px 14px", borderRadius:9,
                    border:`1.5px solid ${hora === s ? C.brand : C.border}`,
                    background: hora === s ? C.brand : C.surface,
                    color: hora === s ? "#fff" : C.textSec,
                    fontSize:13, fontWeight: hora === s ? 700 : 400,
                    cursor:"pointer", transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { if (hora !== s) { e.currentTarget.style.borderColor=C.brandBorder; e.currentTarget.style.background=C.brandLight; }}}
                  onMouseLeave={e => { if (hora !== s) { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.surface; }}}
                >
                  {fmt(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Paso 3: datos de la mascota y motivo ─────────────────── */
function PasoDetalles({ form, setForm }) {
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Campo label="Nombre de la mascota *" value={form.nombre_mascota} onChange={set("nombre_mascota")} placeholder="Firulais" required/>
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:6 }}>
            Especie
          </label>
          <select value={form.especie_mascota} onChange={set("especie_mascota")}
            style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, background:C.surfaceAlt, color:C.text, fontSize:14, outline:"none", cursor:"pointer" }}
            onFocus={e => { e.target.style.borderColor=C.brand; }}
            onBlur={e => { e.target.style.borderColor=C.border; }}
          >
            {ESPECIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:6 }}>
          Motivo de la consulta *
        </label>
        <textarea
          value={form.motivo}
          onChange={set("motivo")}
          placeholder="Describe los síntomas o el motivo de la visita con el mayor detalle posible..."
          rows={4}
          style={{
            width:"100%", padding:"12px 14px", borderRadius:12,
            border:`1.5px solid ${C.border}`,
            background:C.surfaceAlt, color:C.text,
            fontSize:14, outline:"none", resize:"vertical", lineHeight:1.6,
            transition:"all 0.15s",
          }}
          onFocus={e => { e.target.style.borderColor=C.brand; e.target.style.background=C.surface; e.target.style.boxShadow="0 0 0 3px rgba(26,92,26,0.08)"; }}
          onBlur={e => { e.target.style.borderColor=C.border; e.target.style.background=C.surfaceAlt; e.target.style.boxShadow="none"; }}
        />
        <p style={{ margin:"5px 0 0", fontSize:11, color:C.textMuted }}>
          Cuanto más detallado sea el motivo, mejor podrá prepararse el veterinario
        </p>
      </div>
    </div>
  );
}

/* ─── Página principal ─────────────────────────────────────── */
const PASOS = [
  { n:1, label:"Veterinario" },
  { n:2, label:"Fecha y hora" },
  { n:3, label:"Mascota y motivo" },
  { n:4, label:"Confirmar" },
];

export default function AgendarCita() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();

  const [paso,    setPaso]    = useState(1);
  const [vet,     setVet]     = useState(null);
  const [fecha,   setFecha]   = useState("");
  const [hora,    setHora]    = useState("");
  const [form,    setForm]    = useState({ nombre_mascota:"", especie_mascota:"Perro", motivo:"" });
  const [enviando,setEnviando]= useState(false);
  const [error,   setError]   = useState("");
  const [exito,   setExito]   = useState(null); // { codigo }

  if (!usuario) {
    return (
      <div style={{ minHeight:"100vh", background:C.canvas }}>
        <Navbar/>
        <div style={{ maxWidth:480, margin:"80px auto", padding:"0 24px", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🔐</div>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 8px" }}>Inicia sesión para agendar</h2>
          <p style={{ color:C.textMuted, margin:"0 0 24px" }}>Necesitas una cuenta para agendar una cita veterinaria</p>
          <Link to="/login" state={{ desde:"/agendar-cita" }} style={{ display:"inline-block", padding:"12px 28px", borderRadius:12, background:C.brand, color:"#fff", textDecoration:"none", fontWeight:700 }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const puedeAvanzar = () => {
    if (paso === 1) return !!vet;
    if (paso === 2) return !!fecha && !!hora;
    if (paso === 3) return !!form.nombre_mascota.trim() && !!form.motivo.trim();
    return false;
  };

  const handleConfirmar = async () => {
    setEnviando(true); setError("");
    try {
      const { data } = await api.post("/citas", {
        veterinario_id:  vet.id,
        fecha, hora,
        motivo:          form.motivo,
        nombre_mascota:  form.nombre_mascota,
        especie_mascota: form.especie_mascota,
      });
      setExito(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al agendar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  // Pantalla de éxito
  if (exito) return (
    <div style={{ minHeight:"100vh", background:C.canvas }}>
      <Navbar/>
      <div style={{ maxWidth:500, margin:"80px auto", padding:"0 24px" }}>
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:24, padding:"40px", textAlign:"center",
          boxShadow:"0 8px 32px rgba(0,0,0,0.06)",
        }}>
          <div style={{ width:72, height:72, borderRadius:20, background:C.successBg, border:`2px solid ${C.successBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 20px" }}>
            ✅
          </div>
          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
            ¡Cita agendada!
          </h2>
          <p style={{ margin:"0 0 20px", color:C.textMuted, fontSize:14, lineHeight:1.6 }}>
            Tu solicitud fue enviada. El veterinario revisará tu cita y la confirmará pronto.
          </p>
          <div style={{ background:C.brandLight, border:`1px solid ${C.brandBorder}`, borderRadius:12, padding:"14px 20px", marginBottom:24 }}>
            <p style={{ margin:"0 0 4px", fontSize:11, color:C.textTer, textTransform:"uppercase", letterSpacing:0.5 }}>Código de cita</p>
            <p style={{ margin:0, fontSize:20, fontWeight:800, color:C.brand, fontFamily:"monospace", letterSpacing:1 }}>{exito.codigo}</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Link to="/mis-citas" style={{ flex:1, padding:"12px 0", borderRadius:12, background:C.brand, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700, textAlign:"center" }}>
              Ver mis citas
            </Link>
            <button onClick={() => { setExito(null); setPaso(1); setVet(null); setFecha(""); setHora(""); setForm({ nombre_mascota:"", especie_mascota:"Perro", motivo:"" }); }}
              style={{ flex:1, padding:"12px 0", borderRadius:12, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSec, fontSize:13, fontWeight:500, cursor:"pointer" }}>
              Agendar otra
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const fmt2 = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long" }) : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes shimmer { to { background-position:-200% 0; } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.canvas }}>
        <Navbar/>

        {/* Banner */}
        <div style={{ background:C.brandDark, padding:"9px 0", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>
            🏥 Citas veterinarias · Confirmación en menos de 24 horas
          </p>
        </div>

        <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 16px 64px" }}>
          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:C.brand }}>
              Agendar cita
            </p>
            <h1 style={{ margin:"0 0 6px", fontSize:"clamp(22px,4vw,32px)", fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
              Consulta veterinaria
            </h1>
            <p style={{ margin:0, fontSize:14, color:C.textMuted }}>
              Selecciona tu veterinario, fecha y hora disponible
            </p>
          </div>

          {/* Stepper */}
          <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32, overflowX:"auto" }}>
            {PASOS.map((p, i) => (
              <div key={p.n} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%",
                    background: paso > p.n ? C.brand : paso === p.n ? C.brand : C.border,
                    color: paso >= p.n ? "#fff" : C.textMuted,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:700, transition:"all 0.3s",
                    boxShadow: paso === p.n ? "0 0 0 4px rgba(26,92,26,0.15)" : "none",
                  }}>
                    {paso > p.n ? "✓" : p.n}
                  </div>
                  <span style={{ fontSize:10, fontWeight: paso===p.n ? 700 : 400, color: paso===p.n ? C.brand : C.textMuted, whiteSpace:"nowrap" }}>
                    {p.label}
                  </span>
                </div>
                {i < PASOS.length - 1 && (
                  <div style={{ flex:1, height:2, background: paso > p.n ? C.brand : C.border, margin:"0 6px", marginBottom:18, transition:"background 0.3s" }}/>
                )}
              </div>
            ))}
          </div>

          {/* Contenido del paso */}
          <div style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:20, padding:"28px",
            boxShadow:"0 4px 16px rgba(0,0,0,0.05)",
            animation:"fadeUp 0.3s ease",
          }}>
            {/* Título del paso */}
            <h2 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:C.text }}>
              {paso===1 && "¿Con qué veterinario deseas la cita?"}
              {paso===2 && "Selecciona fecha y horario"}
              {paso===3 && "Cuéntanos sobre tu mascota"}
              {paso===4 && "Confirma tu cita"}
            </h2>

            {error && (
              <div style={{ marginBottom:16, padding:"12px 14px", borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}`, color:C.danger, fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            {paso === 1 && <PasoVeterinario onElegir={v => { setVet(v); setPaso(2); }}/>}
            {paso === 2 && <PasoFechaHora vet={vet} fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora}/>}
            {paso === 3 && <PasoDetalles form={form} setForm={setForm}/>}

            {/* Resumen de confirmación */}
            {paso === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { icon:"👨‍⚕️", label:"Veterinario", val:`Dr(a). ${vet?.nombre} ${vet?.apellido} · ${vet?.especialidad}` },
                  { icon:"📅", label:"Fecha",       val: fmt2(fecha) },
                  { icon:"🕐", label:"Hora",        val: fmt(hora) },
                  { icon:"🐾", label:"Mascota",     val:`${form.nombre_mascota} (${form.especie_mascota})` },
                  { icon:"📋", label:"Motivo",      val: form.motivo },
                ].map(r => (
                  <div key={r.label} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"12px 16px", borderRadius:12, background:C.surfaceAlt, border:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
                    <div>
                      <p style={{ margin:"0 0 2px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:C.textMuted }}>{r.label}</p>
                      <p style={{ margin:0, fontSize:14, color:C.text, fontWeight:500, lineHeight:1.5 }}>{r.val}</p>
                    </div>
                  </div>
                ))}

                <div style={{ padding:"12px 16px", borderRadius:12, background:C.brandLight, border:`1px solid ${C.brandBorder}` }}>
                  <p style={{ margin:0, fontSize:12, color:C.brand, lineHeight:1.6 }}>
                    ℹ️ Tu cita quedará en estado <strong>pendiente</strong> hasta que el veterinario la confirme. Recibirás confirmación en tu historial de citas.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navegación de pasos */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:20, gap:10 }}>
            <button
              onClick={() => paso > 1 ? setPaso(paso - 1) : navigate(-1)}
              style={{
                padding:"11px 24px", borderRadius:12,
                border:`1.5px solid ${C.border}`,
                background:C.surface, color:C.textSec,
                fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.brandBorder; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; }}
            >
              ← {paso === 1 ? "Cancelar" : "Anterior"}
            </button>

            {paso < 4 ? (
              <button
                onClick={() => setPaso(paso + 1)}
                disabled={!puedeAvanzar()}
                style={{
                  padding:"11px 28px", borderRadius:12, border:"none",
                  background: puedeAvanzar() ? C.brand : C.surfaceAlt,
                  color: puedeAvanzar() ? "#fff" : C.textMuted,
                  fontSize:13, fontWeight:700,
                  cursor: puedeAvanzar() ? "pointer" : "default",
                  transition:"all 0.15s",
                  boxShadow: puedeAvanzar() ? "0 4px 12px rgba(26,92,26,0.2)" : "none",
                }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleConfirmar}
                disabled={enviando}
                style={{
                  padding:"11px 28px", borderRadius:12, border:"none",
                  background: enviando ? C.brandMid : C.brand,
                  color:"#fff", fontSize:13, fontWeight:700,
                  cursor: enviando ? "default" : "pointer",
                  transition:"all 0.15s",
                  boxShadow:"0 4px 12px rgba(26,92,26,0.25)",
                }}
              >
                {enviando ? "Agendando..." : "✓ Confirmar cita"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}