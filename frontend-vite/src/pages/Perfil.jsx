// src/pages/Perfil.jsx
// DISEÑO: borders-only, 4 niveles de texto, Navbar integrada, superficies consistentes
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ─── Tokens — mismos que el sistema del proyecto ──────────────────────────────
const T = {
  canvas:       "#f6f7f4",
  surface:      "#ffffff",
  surfaceAlt:   "#f2f3ef",
  surfaceHov:   "#edf0ea",
  brand:        "#1a5c1a",
  brandMid:     "#2d7a2d",
  brandDark:    "#0c180c",
  brandLight:   "#e6f3e6",
  brandBorder:  "#b8d9b8",
  lime:         "#a3e635",
  text:         "#111827",
  textSec:      "#374151",
  textTer:      "#6b7280",
  textMuted:    "#9ca3af",
  border:       "rgba(0,0,0,0.07)",
  borderMed:    "rgba(0,0,0,0.11)",
  borderStr:    "rgba(0,0,0,0.16)",
  danger:       "#dc2626",
  dangerBg:     "#fef2f2",
  dangerBorder: "rgba(220,38,38,0.2)",
  success:      "#16a34a",
  successBg:    "#f0fdf4",
  successBorder:"rgba(22,163,74,0.2)",
};

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0 }).format(Number(n) || 0);

const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"long", year:"numeric" }) : "—";

const calcEdad = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date(), nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
  return edad;
};

// ─── Badges de estado ─────────────────────────────────────────────────────────
const ESTADO_CFG = {
  pendiente:  { bg:"#fef3c7", text:"#92400e", border:"rgba(217,119,6,0.2)",  dot:"#d97706" },
  pagada:     { bg:"#dbeafe", text:"#1e40af", border:"rgba(59,130,246,0.2)", dot:"#3b82f6" },
  procesando: { bg:"#f3e8ff", text:"#6b21a8", border:"rgba(147,51,234,0.2)", dot:"#9333ea" },
  enviada:    { bg:"#e0e7ff", text:"#3730a3", border:"rgba(99,102,241,0.2)", dot:"#6366f1" },
  entregada:  { bg:"#dcfce7", text:"#14532d", border:"rgba(22,163,74,0.2)",  dot:"#16a34a" },
  cancelada:  { bg:"#fee2e2", text:"#7f1d1d", border:"rgba(220,38,38,0.2)",  dot:"#dc2626" },
};

const BadgeEstado = ({ estado }) => {
  const s = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 9px", borderRadius:999,
      background:s.bg, color:s.text, border:`1px solid ${s.border}`,
      fontSize:10, fontWeight:600, textTransform:"capitalize", whiteSpace:"nowrap",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {estado}
    </span>
  );
};

// ─── Campo de formulario ──────────────────────────────────────────────────────
// Inputs levemente más oscuros que el surface (inset) — correcto para controls
function Campo({ label, value, onChange, type="text", disabled=false, hint, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"block", fontSize:10, fontWeight:700,
        textTransform:"uppercase", letterSpacing:0.9,
        color: focused ? T.brand : T.textMuted,
        marginBottom:5, transition:"color 0.15s",
      }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={onChange} disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"10px 13px", borderRadius:9,
          border:`1px solid ${focused ? T.brand : T.borderMed}`,
          background: disabled ? T.surfaceAlt : T.surfaceAlt, // inset — ligeramente más oscuro
          color: disabled ? T.textMuted : T.text,
          fontSize:13, outline:"none", transition:"all 0.15s",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? `0 0 0 3px rgba(26,92,26,0.07)` : "none",
        }}
      />
      {hint && <p style={{ margin:"4px 0 0", fontSize:10, color:T.textMuted, lineHeight:1.4 }}>{hint}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color: focused ? T.brand : T.textMuted, marginBottom:5, transition:"color 0.15s" }}>
        {label}
      </label>
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1px solid ${focused ? T.brand : T.borderMed}`, background:T.surfaceAlt, color:T.text, fontSize:13, outline:"none", cursor:"pointer", transition:"all 0.15s", boxShadow: focused ? `0 0 0 3px rgba(26,92,26,0.07)` : "none" }}>
        {children}
      </select>
    </div>
  );
}

function Msg({ texto, tipo="ok" }) {
  if (!texto) return null;
  const esOk = tipo === "ok";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:9, background: esOk ? T.successBg : T.dangerBg, border:`1px solid ${esOk ? T.successBorder : T.dangerBorder}`, color: esOk ? T.success : T.danger, fontSize:12, fontWeight:500 }}>
      <span style={{ fontSize:14 }}>{esOk ? "✓" : "⚠"}</span>
      {texto}
    </div>
  );
}

function CampoPass({ label, value, onChange, placeholder }) {
  const [ver, setVer] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color: focused ? T.brand : T.textMuted, marginBottom:5, transition:"color 0.15s" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          type={ver ? "text" : "password"}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:"100%", padding:"10px 40px 10px 13px", borderRadius:9, border:`1px solid ${focused ? T.brand : T.borderMed}`, background:T.surfaceAlt, color:T.text, fontSize:13, outline:"none", transition:"all 0.15s", boxShadow: focused ? `0 0 0 3px rgba(26,92,26,0.07)` : "none" }}
        />
        <button type="button" onClick={() => setVer(v => !v)}
          style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:13, transition:"color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = T.brand; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}>
          {ver ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

// ─── Sección: Datos personales ────────────────────────────────────────────────
function DatosPersonales({ usuario, onActualizado }) {
  const [form, setForm] = useState({
    nombre:           usuario.nombre           || "",
    apellido:         usuario.apellido          || "",
    telefono:         usuario.telefono          || "",
    tipo_documento:   usuario.tipo_documento    || "CC",
    numero_documento: usuario.numero_documento  || "",
    fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split("T")[0] : "",
  });
  const [msg, setMsg]           = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const edad = calcEdad(form.fecha_nacimiento);
  const fechaMax = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0];

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", {
        nombre: form.nombre, apellido: form.apellido,
        telefono: form.telefono || undefined,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento || undefined,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
      });
      setMsg({ texto:"Datos actualizados correctamente.", tipo:"ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al guardar.", tipo:"err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Campo label="Nombre *"   value={form.nombre}   onChange={set("nombre")}   placeholder="Juan"/>
        <Campo label="Apellido *" value={form.apellido} onChange={set("apellido")} placeholder="Pérez"/>
      </div>
      <Campo label="Correo electrónico" type="email" value={usuario.email} disabled hint="El correo no puede modificarse por seguridad"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="300 000 0000"/>
        <div>
          <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color:T.textMuted, marginBottom:5 }}>
            Fecha de nacimiento
            {edad !== null && <span style={{ color:T.brand, fontWeight:600, marginLeft:5, textTransform:"none", letterSpacing:0 }}>({edad} años)</span>}
          </label>
          <input type="date" value={form.fecha_nacimiento} onChange={set("fecha_nacimiento")} max={fechaMax}
            style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1px solid ${T.borderMed}`, background:T.surfaceAlt, color:T.text, fontSize:12, outline:"none" }}
            onFocus={e => { e.target.style.borderColor=T.brand; e.target.style.boxShadow=`0 0 0 3px rgba(26,92,26,0.07)`; }}
            onBlur={e => { e.target.style.borderColor=T.borderMed; e.target.style.boxShadow="none"; }}
          />
        </div>
      </div>
      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
        <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color:T.textMuted }}>Documento de identidad</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Sel label="Tipo" value={form.tipo_documento} onChange={set("tipo_documento")}>
            <option value="CC">C.C. — Cédula</option>
            <option value="TI">T.I. — Tarjeta identidad</option>
            <option value="CE">C.E. — Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </Sel>
          <Campo label="Número" value={form.numero_documento} onChange={set("numero_documento")} placeholder="123456789"/>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
        <button onClick={guardar} disabled={cargando}
          style={{ padding:"9px 22px", borderRadius:9, border:"none", background: cargando ? T.brandMid : T.brand, color:"#fff", fontSize:12, fontWeight:600, cursor: cargando ? "default" : "pointer", transition:"all 0.15s", opacity: cargando ? 0.8 : 1 }}
          onMouseEnter={e => { if (!cargando) e.currentTarget.style.background=T.brandMid; }}
          onMouseLeave={e => { if (!cargando) e.currentTarget.style.background=T.brand; }}>
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ─── Sección: Cambiar contraseña ──────────────────────────────────────────────
function CambiarPassword() {
  const [form, setForm]         = useState({ actual:"", nueva:"", confirmar:"" });
  const [msg,  setMsg]          = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    if (form.nueva !== form.confirmar) return setMsg({ texto:"Las contraseñas no coinciden.", tipo:"err" });
    if (form.nueva.length < 6)         return setMsg({ texto:"Mínimo 6 caracteres.", tipo:"err" });
    setCargando(true);
    try {
      await api.patch("/auth/cambiar-password", { password_actual: form.actual, nueva_password: form.nueva });
      setMsg({ texto:"Contraseña actualizada correctamente.", tipo:"ok" });
      setForm({ actual:"", nueva:"", confirmar:"" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al cambiar la contraseña.", tipo:"err" });
    } finally { setCargando(false); }
  };

  const fuerzaPass = form.nueva ? [
    form.nueva.length >= 6,
    /[A-Z]/.test(form.nueva),
    /[0-9]/.test(form.nueva),
    /[^a-zA-Z0-9]/.test(form.nueva),
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:380 }}>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <CampoPass label="Contraseña actual"          value={form.actual}    onChange={set("actual")}    placeholder="Tu contraseña actual"/>
      <CampoPass label="Nueva contraseña"           value={form.nueva}     onChange={set("nueva")}     placeholder="Mínimo 6 caracteres"/>
      {form.nueva.length > 0 && (
        <div style={{ display:"flex", gap:3 }}>
          {fuerzaPass.map((ok, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, background: ok ? T.brand : T.border, transition:"background 0.25s" }}/>
          ))}
        </div>
      )}
      <CampoPass label="Confirmar nueva contraseña" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite la nueva contraseña"/>
      <button onClick={guardar} disabled={cargando || !form.actual || !form.nueva}
        style={{ padding:"9px 22px", borderRadius:9, border:"none", alignSelf:"flex-start", background: (cargando || !form.actual || !form.nueva) ? T.surfaceAlt : T.brand, color: (cargando || !form.actual || !form.nueva) ? T.textMuted : "#fff", fontSize:12, fontWeight:600, cursor: (cargando || !form.actual || !form.nueva) ? "default" : "pointer", transition:"all 0.15s" }}>
        {cargando ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </div>
  );
}

// ─── Sección: Mis órdenes ─────────────────────────────────────────────────────
function MisOrdenes() {
  const [ordenes,      setOrdenes]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [expandido,    setExpandido]    = useState(null);

  useEffect(() => {
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const ESTADOS = ["todos", "pendiente", "pagada", "procesando", "enviada", "entregada", "cancelada"];
  const ordenesFiltradas = ordenes.filter(o => filtroEstado === "todos" || o.estado === filtroEstado);

  if (cargando) return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height:64, borderRadius:10, background:`linear-gradient(90deg,${T.surfaceAlt} 25%,${T.surfaceHov} 50%,${T.surfaceAlt} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
      ))}
    </div>
  );

  if (!ordenes.length) return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{ width:52, height:52, borderRadius:14, background:T.brandLight, border:`1px solid ${T.brandBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 12px" }}>📦</div>
      <p style={{ margin:"0 0 5px", fontWeight:600, color:T.textSec, fontSize:14 }}>Sin órdenes aún</p>
      <p style={{ margin:"0 0 18px", fontSize:12, color:T.textMuted }}>Tus compras aparecerán aquí</p>
      <Link to="/tienda" style={{ display:"inline-block", padding:"8px 20px", borderRadius:9, background:T.brand, color:"#fff", textDecoration:"none", fontSize:12, fontWeight:600 }}>
        Ir a la tienda
      </Link>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Filtros — pills compactas */}
      <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {ESTADOS.map(e => {
          const cfg    = ESTADO_CFG[e];
          const activo = filtroEstado === e;
          const count  = e === "todos" ? ordenes.length : ordenes.filter(o => o.estado === e).length;
          if (e !== "todos" && count === 0) return null;
          return (
            <button key={e} onClick={() => setFiltroEstado(e)}
              style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 11px", borderRadius:999, flexShrink:0, border:`1px solid ${activo ? (cfg?.border || T.brand+"44") : T.border}`, background: activo ? (cfg?.bg || T.brandLight) : T.surface, color: activo ? (cfg?.text || T.brand) : T.textSec, fontSize:11, fontWeight: activo ? 600 : 400, cursor:"pointer", transition:"all 0.15s" }}>
              {e === "todos"
                ? <span style={{ fontSize:10 }}>📋</span>
                : <span style={{ width:5, height:5, borderRadius:"50%", background:cfg?.dot || T.brand, flexShrink:0 }}/>}
              <span style={{ textTransform:"capitalize" }}>{e === "todos" ? "Todas" : e}</span>
              <span style={{ background: activo ? "rgba(0,0,0,0.12)" : T.surfaceAlt, color: activo ? "inherit" : T.textMuted, fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:999 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {ordenesFiltradas.length === 0 ? (
        <div style={{ textAlign:"center", padding:"28px", color:T.textMuted, fontSize:12 }}>
          No hay órdenes con estado "{filtroEstado}"
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {ordenesFiltradas.map(o => (
            <div key={o.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
              {/* Cabecera */}
              <button
                onClick={() => setExpandido(expandido === o.id ? null : o.id)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"12px 14px", background:"none", border:"none", cursor:"pointer", flexWrap:"wrap", textAlign:"left" }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:T.brandLight, border:`1px solid ${T.brandBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>📦</div>
                  <div>
                    {/* Código — monospace, nivel 2 */}
                    <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:700, color:T.brand, fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.4 }}>{o.codigo}</p>
                    {/* Meta — nivel 4 */}
                    <p style={{ margin:0, fontSize:10, color:T.textMuted }}>{fdoc(o.created_at)} · {o.metodo_pago || "—"}</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {/* Total — datos, monospace */}
                  <span style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(o.total)}</span>
                  <BadgeEstado estado={o.estado}/>
                  {/* Indicador expand — sin flecha grande */}
                  <span style={{ fontSize:12, color:T.textMuted, transform: expandido === o.id ? "rotate(180deg)" : "rotate(0)", display:"block", transition:"transform 0.2s" }}>⌄</span>
                </div>
              </button>

              {/* Detalle expandido */}
              {expandido === o.id && (
                <div style={{ borderTop:`1px solid ${T.border}`, padding:"12px 14px", background:T.surfaceAlt, animation:"fadeUp 0.2s ease" }}>
                  {/* Progreso estado */}
                  <div style={{ marginBottom:14 }}>
                    <p style={{ margin:"0 0 8px", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:T.textMuted }}>Estado del pedido</p>
                    <div style={{ display:"flex", alignItems:"center" }}>
                      {["pendiente","pagada","procesando","enviada","entregada"].map((est, i, arr) => {
                        const idx    = arr.indexOf(o.estado);
                        const activo = i <= idx && o.estado !== "cancelada";
                        return (
                          <div key={est} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                            <div style={{ display:"flex", width:"100%", alignItems:"center" }}>
                              {i > 0 && <div style={{ flex:1, height:1.5, background: activo ? T.brand : T.border, transition:"background 0.3s" }}/>}
                              <div style={{ width:11, height:11, borderRadius:"50%", flexShrink:0, background: activo ? T.brand : T.border, transition:"all 0.3s", boxShadow: i === idx && o.estado !== "cancelada" ? `0 0 0 3px ${T.brandLight}` : "none" }}/>
                              {i < arr.length - 1 && <div style={{ flex:1, height:1.5, background: i < idx && o.estado !== "cancelada" ? T.brand : T.border }}/>}
                            </div>
                            <span style={{ fontSize:8, marginTop:4, textTransform:"capitalize", color: activo ? T.brand : T.textMuted, fontWeight: i===idx ? 700 : 400 }}>{est}</span>
                          </div>
                        );
                      })}
                    </div>
                    {o.estado === "cancelada" && <p style={{ margin:"6px 0 0", fontSize:10, color:T.danger, fontWeight:600 }}>Esta orden fue cancelada</p>}
                  </div>

                  {/* Montos — grid 3 cols */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      { label:"Subtotal", val:fmt(o.subtotal) },
                      { label:"IVA (19%)", val:fmt(o.iva_total || 0) },
                      { label:"Total", val:fmt(o.total), destacado:true },
                    ].map(f => (
                      <div key={f.label} style={{ background:T.surface, padding:"9px 11px", borderRadius:8, border:`1px solid ${f.destacado ? T.brandBorder : T.border}` }}>
                        <p style={{ margin:"0 0 2px", fontSize:9, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{f.label}</p>
                        <p style={{ margin:0, fontSize:12, fontWeight:700, color: f.destacado ? T.brand : T.text, fontFamily:"'JetBrains Mono',monospace" }}>{f.val}</p>
                      </div>
                    ))}
                  </div>

                  {(o.direccion_entrega || o.ciudad_entrega) && (
                    <div style={{ marginTop:8, padding:"9px 11px", borderRadius:8, background:T.surface, border:`1px solid ${T.border}`, fontSize:11, color:T.textSec }}>
                      📍 {[o.direccion_entrega, o.ciudad_entrega].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tabs de perfil ───────────────────────────────────────────────────────────
const TABS = [
  { id:"datos",     label:"Mis datos",    icon:"👤" },
  { id:"seguridad", label:"Seguridad",    icon:"🔒" },
  { id:"ordenes",   label:"Mis órdenes",  icon:"📦" },
];

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab,      setTab]      = useState("datos");
  const [perfil,   setPerfil]   = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get("/auth/me")
      .then(({ data }) => setPerfil(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };
  useEffect(() => { cargar(); }, []);

  if (cargando) return (
    <div style={{ minHeight:"100vh", background:T.canvas }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0" }}>
        <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${T.brandLight}`, borderTopColor:T.brand, animation:"spin 0.8s linear infinite" }}/>
      </div>
    </div>
  );
  if (!perfil) return null;

  const iniciales = `${perfil.nombre?.charAt(0)||""}${perfil.apellido?.charAt(0)||""}`.toUpperCase();
  const edad = calcEdad(perfil.fecha_nacimiento);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", background:T.canvas }}>


        {/* Banner */}
        <div style={{ background:T.brandDark, padding:"8px 16px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>
            🚚 Envíos gratis a partir de <span style={{ color:T.lime, fontWeight:600 }}>$80.000</span>
          </span>
        </div>

        <div style={{ maxWidth:840, margin:"0 auto", padding:"24px 16px 64px" }}>

          {/* ── Hero de perfil — gradiente forestal, mismo sistema ───────── */}
          <div style={{
            borderRadius:18, marginBottom:16, overflow:"hidden",
            background:`linear-gradient(160deg, ${T.brandDark} 0%, #1a3d1a 60%, ${T.brand} 100%)`,
            border:`1px solid rgba(0,0,0,0.2)`,
            position:"relative",
          }}>
            {/* Decorativos — sutiles, misma lógica que hero de Home */}
            <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, background:"rgba(163,230,53,0.05)", borderRadius:"50%", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-30, left:40, width:120, height:120, background:"rgba(255,255,255,0.03)", borderRadius:"50%", pointerEvents:"none" }}/>

            <div style={{ padding:"22px 24px", position:"relative", display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap" }}>
              {/* Avatar — mismo tratamiento que superficie elevada en dark */}
              <div style={{ width:64, height:64, borderRadius:16, flexShrink:0, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"#fff" }}>
                {iniciales}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                  {/* Nivel 1 — display serif */}
                  <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#fff", fontFamily:"'Playfair Display',serif", fontStyle:"italic", lineHeight:1.2 }}>
                    {perfil.nombre} {perfil.apellido}
                  </h1>
                  {/* Badge rol — pill clínica */}
                  <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"rgba(163,230,53,0.15)", border:"1px solid rgba(163,230,53,0.25)", color:T.lime, textTransform:"uppercase", letterSpacing:0.8 }}>
                    {perfil.rol}
                  </span>
                </div>
                {/* Nivel 3 */}
                <p style={{ margin:"0 0 8px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>{perfil.email}</p>
                {/* Meta — nivel 4 */}
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  {edad !== null && <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>🎂 <strong style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{edad} años</strong></span>}
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>📅 Desde <strong style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{new Date(perfil.created_at).toLocaleDateString("es-CO",{month:"long",year:"numeric"})}</strong></span>
                  {perfil.telefono && <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>📞 <strong style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{perfil.telefono}</strong></span>}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignSelf:"flex-start" }}>
                <Link to="/tienda" style={{ padding:"7px 14px", borderRadius:8, textDecoration:"none", background:"rgba(255,255,255,0.10)", color:"rgba(255,255,255,0.75)", border:"1px solid rgba(255,255,255,0.15)", fontSize:11, fontWeight:500, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.17)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.10)"; }}>
                  Tienda
                </Link>
                <button onClick={() => { logout(); navigate("/"); }}
                  style={{ padding:"7px 14px", borderRadius:8, border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.12)", color:"#fca5a5", fontSize:11, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.22)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(239,68,68,0.12)"; }}>
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* Tabs dentro del hero — borde sutil sobre fondo oscuro */}
            <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.08)", padding:"0 18px", background:"rgba(0,0,0,0.1)" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding:"11px 16px", background:"none", border:"none", borderBottom:`2px solid ${tab===t.id ? T.lime : "transparent"}`, color: tab===t.id ? "#fff" : "rgba(255,255,255,0.45)", fontSize:12, fontWeight: tab===t.id ? 600 : 400, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Contenido del tab — superficie L1, border sutil ─────────── */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"22px", animation:"fadeUp 0.25s ease" }}>
            {tab === "datos" && (
              <>
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Información personal</h2>
                  <p style={{ margin:0, fontSize:11, color:T.textMuted }}>Actualiza tus datos de contacto e identificación</p>
                </div>
                <DatosPersonales usuario={perfil} onActualizado={cargar}/>
              </>
            )}
            {tab === "seguridad" && (
              <>
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Cambiar contraseña</h2>
                  <p style={{ margin:0, fontSize:11, color:T.textMuted }}>Necesitamos tu contraseña actual para confirmar el cambio</p>
                </div>
                <CambiarPassword/>
              </>
            )}
            {tab === "ordenes" && (
              <>
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Historial de compras</h2>
                  <p style={{ margin:0, fontSize:11, color:T.textMuted }}>Filtra y consulta el estado de tus pedidos</p>
                </div>
                <MisOrdenes/>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}