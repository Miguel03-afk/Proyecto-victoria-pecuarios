// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";

// ─── Primitivas de UI ─────────────────────────────────────────────────────────

function Campo({ label, value, onChange, type="text", disabled=false, hint, placeholder, noPaste }) {
  const { C: T } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color: focused ? T.brand : T.textMuted, marginBottom:5, transition:"color 0.15s" }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={onChange} disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPaste={noPaste ? e => e.preventDefault() : undefined}
        style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1px solid ${focused ? T.brand : T.borderMed}`, background:T.surfaceAlt, color: disabled ? T.textMuted : T.text, fontSize:13, outline:"none", transition:"all 0.15s", cursor: disabled ? "not-allowed" : "text", boxShadow: focused ? `0 0 0 3px rgba(10,107,64,0.10)` : "none" }}
      />
      {hint && <p style={{ margin:"4px 0 0", fontSize:10, color:T.textMuted, lineHeight:1.4 }}>{hint}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, children }) {
  const { C: T } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, color: focused ? T.brand : T.textMuted, marginBottom:5, transition:"color 0.15s" }}>
        {label}
      </label>
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1px solid ${focused ? T.brand : T.borderMed}`, background:T.surfaceAlt, color:T.text, fontSize:13, outline:"none", cursor:"pointer", transition:"all 0.15s", boxShadow: focused ? `0 0 0 3px rgba(10,107,64,0.10)` : "none" }}>
        {children}
      </select>
    </div>
  );
}

function CampoPass({ label, value, onChange, placeholder }) {
  const { C: T } = useTheme();
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
          style={{ width:"100%", padding:"10px 40px 10px 13px", borderRadius:9, border:`1px solid ${focused ? T.brand : T.borderMed}`, background:T.surfaceAlt, color:T.text, fontSize:13, outline:"none", transition:"all 0.15s", boxShadow: focused ? `0 0 0 3px rgba(10,107,64,0.10)` : "none" }}
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

function Msg({ texto, tipo="ok" }) {
  const { C: T } = useTheme();
  if (!texto) return null;
  const esOk = tipo === "ok";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:9, background: esOk ? T.successBg : T.dangerBg, border:`1px solid ${esOk ? T.successBorder : T.dangerBorder}`, color: esOk ? T.success : T.danger, fontSize:12, fontWeight:500 }}>
      <span style={{ fontSize:14 }}>{esOk ? "✓" : "⚠"}</span>
      {texto}
    </div>
  );
}

function BtnGuardar({ onClick, cargando, disabled: extraDisabled, texto="Guardar cambios" }) {
  const { C: T } = useTheme();
  const dis = cargando || extraDisabled;
  return (
    <button onClick={onClick} disabled={dis}
      style={{ padding:"9px 22px", borderRadius:9, border:`1px solid ${dis ? T.border : T.limeDark}`, background: dis ? T.surfaceAlt : T.lime, color: dis ? T.textMuted : "#fff", fontSize:12, fontWeight:600, cursor: dis ? "not-allowed" : "pointer", transition:"all 0.15s" }}
      onMouseEnter={e => { if (!dis) e.currentTarget.style.background = T.limeDark; }}
      onMouseLeave={e => { if (!dis) e.currentTarget.style.background = T.lime; }}>
      {cargando ? "Guardando..." : texto}
    </button>
  );
}

// ─── Sección: Datos personales ────────────────────────────────────────────────
function DatosPersonales({ usuario, onActualizado }) {
  const { C: T } = useTheme();
  const [form, setForm] = useState({
    nombre:   usuario.nombre   || "",
    apellido: usuario.apellido || "",
    telefono: usuario.telefono || "",
  });
  const [msg, setMsg]           = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", {
        nombre:   form.nombre   || undefined,
        apellido: form.apellido || undefined,
        telefono: form.telefono || undefined,
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
      <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="300 000 0000" hint="Para contactarte con información de tus pedidos"/>
      <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
        <BtnGuardar onClick={guardar} cargando={cargando}/>
      </div>
    </div>
  );
}

// ─── Sección: Mis direcciones (localStorage) ──────────────────────────────────
function MisDirecciones() {
  const { C: T } = useTheme();
  const [dirs, setDirs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vp_direcciones") || "[]"); }
    catch { return []; }
  });
  const [form, setForm]         = useState({ alias:"", calle:"", barrio:"", referencias:"" });
  const [agregando, setAgregando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = () => {
    if (!form.calle.trim()) return;
    const nueva  = { ...form, id:Date.now(), ciudad:"Ibagué" };
    const nuevas = [...dirs, nueva];
    setDirs(nuevas);
    localStorage.setItem("vp_direcciones", JSON.stringify(nuevas));
    setForm({ alias:"", calle:"", barrio:"", referencias:"" });
    setAgregando(false);
  };

  const eliminar = (id) => {
    const nuevas = dirs.filter(d => d.id !== id);
    setDirs(nuevas);
    localStorage.setItem("vp_direcciones", JSON.stringify(nuevas));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {dirs.length === 0 && !agregando && (
        <div style={{ textAlign:"center", padding:"36px 24px" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📍</div>
          <p style={{ margin:"0 0 4px", fontWeight:600, color:T.textSec, fontSize:13 }}>Sin direcciones guardadas</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:T.textMuted }}>Agrega una dirección para agilizar tus compras</p>
        </div>
      )}

      {dirs.map(d => (
        <div key={d.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, background:T.surface, border:`1px solid ${T.borderMed}` }}>
          <div style={{ width:34, height:34, borderRadius:8, background:T.brandLight, border:`1px solid ${T.brandBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📍</div>
          <div style={{ flex:1 }}>
            {d.alias && <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:700, color:T.brand, textTransform:"uppercase", letterSpacing:0.6 }}>{d.alias}</p>}
            <p style={{ margin:"0 0 1px", fontSize:13, color:T.text }}>{d.calle}</p>
            <p style={{ margin:0, fontSize:11, color:T.textMuted }}>{[d.barrio, d.ciudad].filter(Boolean).join(", ")}</p>
            {d.referencias && <p style={{ margin:"3px 0 0", fontSize:11, color:T.textTer, fontStyle:"italic" }}>{d.referencias}</p>}
          </div>
          <button onClick={() => eliminar(d.id)}
            style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:18, padding:4, lineHeight:1, transition:"color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = T.danger; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}>
            ×
          </button>
        </div>
      ))}

      {agregando ? (
        <div style={{ padding:"16px", borderRadius:10, background:T.surfaceAlt, border:`1px solid ${T.borderMed}`, display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:700, color:T.text }}>Nueva dirección — Ibagué</p>
          <Campo label="Alias (ej: Casa, Oficina)" value={form.alias} onChange={set("alias")} placeholder="Casa"/>
          <Campo label="Dirección *" value={form.calle} onChange={set("calle")} placeholder="Cra 3 # 45-67"/>
          <Campo label="Barrio" value={form.barrio} onChange={set("barrio")} placeholder="La Pola"/>
          <Campo label="Referencias" value={form.referencias} onChange={set("referencias")} placeholder="Casa de dos pisos, puerta azul"/>
          <div style={{ display:"flex", gap:8 }}>
            <BtnGuardar onClick={guardar} cargando={false} disabled={!form.calle.trim()} texto="Agregar dirección"/>
            <button onClick={() => { setAgregando(false); setForm({ alias:"", calle:"", barrio:"", referencias:"" }); }}
              style={{ padding:"9px 16px", borderRadius:9, border:`1px solid ${T.borderMed}`, background:T.surface, color:T.textSec, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAgregando(true)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:10, border:`1.5px dashed ${T.brandBorder}`, background:"transparent", color:T.brand, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = T.brandLight; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          + Agregar dirección
        </button>
      )}

      <p style={{ margin:0, fontSize:11, color:T.textMuted }}>
        Solo se permiten direcciones dentro de <strong>Ibagué, Tolima</strong>.
      </p>
    </div>
  );
}

// ─── Sección: Datos de facturación ────────────────────────────────────────────
function DatosFacturacion({ usuario, onActualizado }) {
  const { C: T } = useTheme();
  const fac = usuario.facturacion || {};
  const [form, setForm] = useState({
    razon_social:     fac.razon_social     || "",
    tipo_documento:   fac.tipo_documento   || "CC",
    numero_documento: fac.numero_documento || "",
    direccion:        fac.direccion        || "",
    ciudad:           fac.ciudad           || "Ibagué",
  });
  const [msg, setMsg]           = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", { facturacion: form });
      setMsg({ texto:"Datos de facturación guardados.", tipo:"ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al guardar.", tipo:"err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ padding:"10px 14px", borderRadius:9, background:T.brandLight, border:`1px solid ${T.brandBorder}`, fontSize:12, color:T.brand }}>
        Estos datos se usarán para generar facturas si lo solicitas.
      </div>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <Campo label="Razón social / Nombre completo" value={form.razon_social} onChange={set("razon_social")} placeholder="Juan Pérez o Mi Empresa S.A.S."/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Sel label="Tipo de documento" value={form.tipo_documento} onChange={set("tipo_documento")}>
          <option value="CC">C.C. — Cédula</option>
          <option value="NIT">NIT</option>
          <option value="CE">C.E. — Extranjería</option>
          <option value="PASAPORTE">Pasaporte</option>
        </Sel>
        <Campo label="Número de documento" value={form.numero_documento} onChange={set("numero_documento")} placeholder="900123456"/>
      </div>
      <Campo label="Dirección de facturación" value={form.direccion} onChange={set("direccion")} placeholder="Cra 1 # 23-45"/>
      <Campo label="Ciudad" value={form.ciudad} onChange={set("ciudad")} placeholder="Ibagué"/>
      <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
        <BtnGuardar onClick={guardar} cargando={cargando}/>
      </div>
    </div>
  );
}

// ─── Sección: Cambiar correo ──────────────────────────────────────────────────
function CambiarEmail({ usuario }) {
  const { C: T } = useTheme();
  const [form, setForm]         = useState({ nuevo_email:"", password_actual:"" });
  const [msg,  setMsg]          = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/cambiar-email", form);
      setMsg({ texto:"Correo actualizado. Vuelve a iniciar sesión para reflejar el cambio.", tipo:"ok" });
      setForm({ nuevo_email:"", password_actual:"" });
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al cambiar el correo.", tipo:"err" });
    } finally { setCargando(false); }
  };

  const puedeEnviar = form.nuevo_email && form.password_actual;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:380 }}>
      <div style={{ padding:"10px 14px", borderRadius:9, background:T.surfaceAlt, border:`1px solid ${T.borderMed}`, fontSize:12, color:T.textSec }}>
        Correo actual: <strong style={{ color:T.text }}>{usuario.email}</strong>
      </div>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <Campo label="Nuevo correo electrónico" type="email" value={form.nuevo_email} onChange={set("nuevo_email")} placeholder="nuevocorreo@ejemplo.com"/>
      <CampoPass label="Contraseña actual (para confirmar)" value={form.password_actual} onChange={set("password_actual")} placeholder="Tu contraseña actual"/>
      <div style={{ display:"flex" }}>
        <BtnGuardar onClick={guardar} cargando={cargando} disabled={!puedeEnviar} texto="Cambiar correo"/>
      </div>
    </div>
  );
}

// ─── Sección: Cambiar contraseña ──────────────────────────────────────────────
function CambiarPassword() {
  const { C: T } = useTheme();
  const [form, setForm]         = useState({ actual:"", nueva:"", confirmar:"" });
  const [msg,  setMsg]          = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    if (form.nueva !== form.confirmar) return setMsg({ texto:"Las contraseñas no coinciden.", tipo:"err" });
    if (form.nueva.length < 8)        return setMsg({ texto:"Mínimo 8 caracteres.", tipo:"err" });
    if (!/[0-9]/.test(form.nueva))    return setMsg({ texto:"Debe incluir al menos 1 número.", tipo:"err" });
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

  const fuerzaChecks = form.nueva ? [
    { ok: form.nueva.length >= 8,   label:"8+ chars" },
    { ok: /[0-9]/.test(form.nueva), label:"Número" },
    { ok: /[A-Z]/.test(form.nueva), label:"Mayúscula" },
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:380 }}>
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <CampoPass label="Contraseña actual" value={form.actual} onChange={set("actual")} placeholder="Tu contraseña actual"/>
      <CampoPass label="Nueva contraseña" value={form.nueva} onChange={set("nueva")} placeholder="Mínimo 8 caracteres, 1 número"/>
      {fuerzaChecks.length > 0 && (
        <div style={{ display:"flex", gap:4 }}>
          {fuerzaChecks.map((f, i) => (
            <div key={i} style={{ flex:1 }}>
              <div style={{ height:3, borderRadius:2, background: f.ok ? T.lime : T.border, transition:"background 0.25s" }}/>
              <span style={{ fontSize:9, color: f.ok ? T.limeDark : T.textMuted, marginTop:3, display:"block" }}>{f.label}</span>
            </div>
          ))}
        </div>
      )}
      <CampoPass label="Confirmar nueva contraseña" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite la nueva contraseña"/>
      <div style={{ display:"flex" }}>
        <BtnGuardar onClick={guardar} cargando={cargando} disabled={!form.actual || !form.nueva} texto="Actualizar contraseña"/>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"datos",       label:"Mis datos",    icon:"👤" },
  { id:"direcciones", label:"Direcciones",  icon:"📍" },
  { id:"facturacion", label:"Facturación",  icon:"🧾" },
  { id:"email",       label:"Correo",       icon:"✉️" },
  { id:"password",    label:"Contraseña",   icon:"🔒" },
];

const TAB_INFO = {
  datos:       { titulo:"Información personal",       sub:"Actualiza tu nombre, apellido y teléfono de contacto" },
  direcciones: { titulo:"Mis direcciones",            sub:"Guarda direcciones de entrega para tus pedidos en Ibagué" },
  facturacion: { titulo:"Datos de facturación",       sub:"Información para generación de facturas" },
  email:       { titulo:"Cambiar correo electrónico", sub:"Actualiza tu correo de acceso a la plataforma" },
  password:    { titulo:"Cambiar contraseña",         sub:"Necesitamos tu contraseña actual para confirmar el cambio" },
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Perfil() {
  const { C: T } = useTheme();
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
    <div style={{ minHeight:"100vh", background:T.canvas, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${T.brandLight}`, borderTopColor:T.brand, animation:"spin 0.8s linear infinite" }}/>
    </div>
  );
  if (!perfil) return null;

  const iniciales = `${perfil.nombre?.charAt(0)||""}${perfil.apellido?.charAt(0)||""}`.toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        *, *::before, *::after { box-sizing: border-box; }

        /* Mobile: hero y contenido más compactos */
        @media (max-width: 640px) {
          .vp-perfil-page      { padding: 16px 12px 48px !important; }
          .vp-perfil-hero      { border-radius: 14px !important; }
          .vp-perfil-hero-body { padding: 16px !important; gap: 12px !important; }
          .vp-perfil-avatar    { width: 52px !important; height: 52px !important; border-radius: 14px !important; font-size: 20px !important; }
          .vp-perfil-name      { font-size: 17px !important; }
          .vp-perfil-tabs      { padding: 0 10px !important; }
          .vp-perfil-tab       { padding: 10px 10px !important; font-size: 10.5px !important; }
          .vp-perfil-content   { padding: 16px !important; border-radius: 14px !important; }
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:T.canvas }}>

        <div className="vp-perfil-page" style={{ maxWidth:840, margin:"0 auto", padding:"24px 16px 64px" }}>

          {/* ── Hero de perfil ───────────────────────────────────────────── */}
          <div className="vp-perfil-hero" style={{
            borderRadius:18, marginBottom:16, overflow:"hidden",
            background:`linear-gradient(160deg, ${T.brandDark} 0%, ${T.brand} 100%)`,
            border:`1px solid rgba(0,0,0,0.2)`,
            position:"relative",
          }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, background:"rgba(122,193,67,0.07)", borderRadius:"50%", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-30, left:40, width:120, height:120, background:"rgba(255,255,255,0.03)", borderRadius:"50%", pointerEvents:"none" }}/>

            <div className="vp-perfil-hero-body" style={{ padding:"22px 24px", position:"relative", display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap" }}>
              {/* Avatar */}
              <div className="vp-perfil-avatar" style={{ width:64, height:64, borderRadius:16, flexShrink:0, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"#fff" }}>
                {iniciales}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                  <h1 className="vp-perfil-name" style={{ margin:0, fontSize:20, fontWeight:700, color:"#fff", fontFamily:"'Playfair Display',serif", fontStyle:"italic", lineHeight:1.2 }}>
                    {perfil.nombre} {perfil.apellido}
                  </h1>
                  <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:999, background:"rgba(122,193,67,0.15)", border:"1px solid rgba(122,193,67,0.25)", color:T.lime, textTransform:"uppercase", letterSpacing:0.8 }}>
                    {perfil.rol}
                  </span>
                </div>
                <p style={{ margin:"0 0 8px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>{perfil.email}</p>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>📅 Desde <strong style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{new Date(perfil.created_at).toLocaleDateString("es-CO",{month:"long",year:"numeric"})}</strong></span>
                  {perfil.telefono && <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>📞 <strong style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{perfil.telefono}</strong></span>}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignSelf:"flex-start" }}>
                <Link to="/tienda" style={{ padding:"8px 16px", borderRadius:8, textDecoration:"none", background:T.lime, color:T.brandDark, border:`1px solid ${T.limeDark}`, fontSize:12, fontWeight:700, transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}
                  onMouseEnter={e => { e.currentTarget.style.background=T.limeDark; e.currentTarget.style.color="#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background=T.lime; e.currentTarget.style.color=T.brandDark; }}>
                  🛍️ Ir a la tienda
                </Link>
                <Link to="/mis-ordenes" style={{ padding:"7px 14px", borderRadius:8, textDecoration:"none", background:"rgba(255,255,255,0.10)", color:"rgba(255,255,255,0.75)", border:"1px solid rgba(255,255,255,0.15)", fontSize:11, fontWeight:500, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.17)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.10)"; }}>
                  Mis órdenes
                </Link>
                <button onClick={() => { logout(); navigate("/"); }}
                  style={{ padding:"7px 14px", borderRadius:8, border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.12)", color:"#fca5a5", fontSize:11, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.22)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(239,68,68,0.12)"; }}>
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="vp-perfil-tabs" style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.08)", padding:"0 18px", background:"rgba(0,0,0,0.1)", overflowX:"auto", scrollbarWidth:"none" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="vp-perfil-tab"
                  style={{ padding:"11px 14px", background:"none", border:"none", borderBottom:`2px solid ${tab===t.id ? T.lime : "transparent"}`, color: tab===t.id ? "#fff" : "rgba(255,255,255,0.45)", fontSize:11, fontWeight: tab===t.id ? 600 : 400, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", flexShrink:0 }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Contenido del tab ────────────────────────────────────────── */}
          <div className="vp-perfil-content" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"22px", animation:"fadeUp 0.25s ease" }}>
            <div style={{ marginBottom:18 }}>
              <h2 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                {TAB_INFO[tab].titulo}
              </h2>
              <p style={{ margin:0, fontSize:11, color:T.textMuted }}>{TAB_INFO[tab].sub}</p>
            </div>

            {tab === "datos"       && <DatosPersonales  usuario={perfil} onActualizado={cargar}/>}
            {tab === "direcciones" && <MisDirecciones/>}
            {tab === "facturacion" && <DatosFacturacion usuario={perfil} onActualizado={cargar}/>}
            {tab === "email"       && <CambiarEmail     usuario={perfil}/>}
            {tab === "password"    && <CambiarPassword/>}
          </div>

        </div>
      </div>
    </>
  );
}
