// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
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
  borderMid:   "rgba(0,0,0,0.13)",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  dangerBorder:"#fecaca",
  success:     "#16a34a",
  successBg:   "#f0fdf4",
  successBorder:"#bbf7d0",
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(Number(n)||0);

const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"}) : "—";

const calcEdad = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date(), nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
  return edad;
};

/* ─── Badges de estado de orden ──────────────────────────────────────────── */
const ESTADO_CFG = {
  pendiente:  { bg:"#fef3c7", text:"#92400e", border:"#fde68a",  dot:"#d97706" },
  pagada:     { bg:"#dbeafe", text:"#1e40af", border:"#bfdbfe",  dot:"#3b82f6" },
  procesando: { bg:"#f3e8ff", text:"#6b21a8", border:"#e9d5ff",  dot:"#9333ea" },
  enviada:    { bg:"#e0e7ff", text:"#3730a3", border:"#c7d2fe",  dot:"#6366f1" },
  entregada:  { bg:"#dcfce7", text:"#14532d", border:"#bbf7d0",  dot:"#16a34a" },
  cancelada:  { bg:"#fee2e2", text:"#7f1d1d", border:"#fecaca",  dot:"#dc2626" },
};

const BadgeEstado = ({ estado }) => {
  const s = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:999,
      background:s.bg, color:s.text, border:`1px solid ${s.border}`,
      fontSize:11, fontWeight:700, textTransform:"capitalize", whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {estado}
    </span>
  );
};

/* ─── Campo de formulario ─────────────────────────────────────────────────── */
function Campo({ label, value, onChange, type="text", disabled=false, hint, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        textTransform:"uppercase", letterSpacing:0.8,
        color: focused ? C.brand : C.textTer,
        marginBottom:6, transition:"color 0.15s",
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
          width:"100%", padding:"11px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? C.brand : C.border}`,
          background: disabled ? C.surfaceAlt : focused ? C.surface : C.surfaceAlt,
          color: disabled ? C.textMuted : C.text,
          fontSize:14, outline:"none", transition:"all 0.15s",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
        }}
      />
      {hint && <p style={{ margin:"5px 0 0", fontSize:11, color:C.textMuted, lineHeight:1.4 }}>{hint}</p>}
    </div>
  );
}

/* ─── Selector ────────────────────────────────────────────────────────────── */
function Sel({ label, value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        textTransform:"uppercase", letterSpacing:0.8,
        color: focused ? C.brand : C.textTer, marginBottom:6, transition:"color 0.15s",
      }}>
        {label}
      </label>
      <select
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? C.brand : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color:C.text, fontSize:14, outline:"none",
          cursor:"pointer", transition:"all 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
        }}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── Mensaje feedback ────────────────────────────────────────────────────── */
function Msg({ texto, tipo="ok" }) {
  if (!texto) return null;
  const esOk = tipo === "ok";
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 14px", borderRadius:12,
      background: esOk ? C.successBg : C.dangerBg,
      border:`1px solid ${esOk ? C.successBorder : C.dangerBorder}`,
      color: esOk ? C.success : C.danger,
      fontSize:13, fontWeight:500,
    }}>
      <span style={{fontSize:16}}>{esOk ? "✓" : "⚠️"}</span>
      {texto}
    </div>
  );
}

/* ─── Campo de contraseña con toggle ─────────────────────────────────────── */
function CampoPass({ label, value, onChange, placeholder }) {
  const [ver, setVer] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        textTransform:"uppercase", letterSpacing:0.8,
        color: focused ? C.brand : C.textTer, marginBottom:6, transition:"color 0.15s",
      }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          type={ver ? "text" : "password"}
          value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:"100%", padding:"11px 44px 11px 14px", borderRadius:12,
            border:`1.5px solid ${focused ? C.brand : C.border}`,
            background: focused ? C.surface : C.surfaceAlt,
            color:C.text, fontSize:14, outline:"none", transition:"all 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
          }}
        />
        <button
          type="button"
          onClick={() => setVer(v => !v)}
          style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer",
            color:C.textMuted, fontSize:15, transition:"color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.brand; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
        >
          {ver ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Datos personales
   ════════════════════════════════════════════════════════════════════════════ */
function DatosPersonales({ usuario, onActualizado }) {
  const [form, setForm] = useState({
    nombre:           usuario.nombre           || "",
    apellido:         usuario.apellido          || "",
    telefono:         usuario.telefono          || "",
    tipo_documento:   usuario.tipo_documento    || "CC",
    numero_documento: usuario.numero_documento  || "",
    fecha_nacimiento: usuario.fecha_nacimiento
      ? usuario.fecha_nacimiento.split("T")[0] : "",
  });
  const [msg,      setMsg]      = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const edad = calcEdad(form.fecha_nacimiento);
  const fechaMax = new Date(new Date().setFullYear(new Date().getFullYear()-13)).toISOString().split("T")[0];

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", {
        nombre:           form.nombre,
        apellido:         form.apellido,
        telefono:         form.telefono          || undefined,
        tipo_documento:   form.tipo_documento,
        numero_documento: form.numero_documento  || undefined,
        fecha_nacimiento: form.fecha_nacimiento  || undefined,
      });
      setMsg({ texto:"Datos actualizados correctamente.", tipo:"ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto:err.response?.data?.error || "Error al guardar.", tipo:"err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Msg texto={msg.texto} tipo={msg.tipo}/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Campo label="Nombre *"  value={form.nombre}   onChange={set("nombre")}   placeholder="Juan"/>
        <Campo label="Apellido *" value={form.apellido} onChange={set("apellido")} placeholder="Pérez"/>
      </div>

      <Campo
        label="Correo electrónico"
        type="email"
        value={usuario.email}
        disabled
        hint="El correo no puede modificarse por seguridad"
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="300 000 0000"/>
        <div>
          <label style={{
            display:"block", fontSize:11, fontWeight:700,
            textTransform:"uppercase", letterSpacing:0.8,
            color:C.textTer, marginBottom:6,
          }}>
            Fecha de nacimiento
            {edad !== null && (
              <span style={{ color:C.brand, fontWeight:700, marginLeft:6, textTransform:"none", letterSpacing:0 }}>
                ({edad} años)
              </span>
            )}
          </label>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={set("fecha_nacimiento")}
            max={fechaMax}
            style={{
              width:"100%", padding:"11px 14px", borderRadius:12,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt, color:C.text,
              fontSize:13, outline:"none",
            }}
            onFocus={e => { e.target.style.borderColor=C.brand; e.target.style.boxShadow="0 0 0 3px rgba(26,92,26,0.08)"; }}
            onBlur={e => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; }}
          />
        </div>
      </div>

      {/* Separador */}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer }}>
          Documento de identidad
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Sel label="Tipo documento" value={form.tipo_documento} onChange={set("tipo_documento")}>
            <option value="CC">C.C. — Cédula</option>
            <option value="TI">T.I. — Tarjeta identidad</option>
            <option value="CE">C.E. — Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </Sel>
          <Campo label="Número" value={form.numero_documento} onChange={set("numero_documento")} placeholder="123456789"/>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
        <button
          onClick={guardar}
          disabled={cargando}
          style={{
            padding:"10px 24px", borderRadius:12, border:"none",
            background: cargando ? C.brandMid : C.brand, color:"#fff",
            fontSize:13, fontWeight:700, cursor: cargando ? "default" : "pointer",
            transition:"all 0.2s", opacity: cargando ? 0.8 : 1,
            boxShadow:"0 4px 12px rgba(26,92,26,0.2)",
          }}
          onMouseEnter={e => { if(!cargando) e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
        >
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Cambiar contraseña
   ════════════════════════════════════════════════════════════════════════════ */
function CambiarPassword() {
  const [form, setForm] = useState({ actual:"", nueva:"", confirmar:"" });
  const [msg,  setMsg]  = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    if (form.nueva !== form.confirmar) return setMsg({ texto:"Las contraseñas no coinciden.", tipo:"err" });
    if (form.nueva.length < 6)          return setMsg({ texto:"Mínimo 6 caracteres.", tipo:"err" });
    setCargando(true);
    try {
      await api.patch("/auth/cambiar-password", {
        password_actual: form.actual,
        nueva_password:  form.nueva,
      });
      setMsg({ texto:"Contraseña actualizada correctamente.", tipo:"ok" });
      setForm({ actual:"", nueva:"", confirmar:"" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto:err.response?.data?.error || "Error al cambiar la contraseña.", tipo:"err" });
    } finally { setCargando(false); }
  };

  const fuerzaPass = form.nueva ? [
    form.nueva.length >= 6,
    /[A-Z]/.test(form.nueva),
    /[0-9]/.test(form.nueva),
    /[^a-zA-Z0-9]/.test(form.nueva),
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:400 }}>
      <Msg texto={msg.texto} tipo={msg.tipo}/>

      <CampoPass label="Contraseña actual"        value={form.actual}    onChange={set("actual")}    placeholder="Tu contraseña actual"/>
      <CampoPass label="Nueva contraseña"          value={form.nueva}     onChange={set("nueva")}     placeholder="Mínimo 6 caracteres"/>

      {/* Indicador de fuerza */}
      {form.nueva.length > 0 && (
        <div style={{ display:"flex", gap:4 }}>
          {fuerzaPass.map((ok,i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:2,
              background: ok ? C.brand : C.border, transition:"background 0.3s",
            }}/>
          ))}
        </div>
      )}

      <CampoPass label="Confirmar nueva contraseña" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite la nueva contraseña"/>

      <button
        onClick={guardar}
        disabled={cargando || !form.actual || !form.nueva}
        style={{
          padding:"10px 24px", borderRadius:12, border:"none",
          background: (cargando || !form.actual || !form.nueva) ? C.surfaceAlt : C.brand,
          color: (cargando || !form.actual || !form.nueva) ? C.textMuted : "#fff",
          fontSize:13, fontWeight:700,
          cursor: (cargando || !form.actual || !form.nueva) ? "default" : "pointer",
          transition:"all 0.2s", alignSelf:"flex-start",
        }}
      >
        {cargando ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Mis órdenes con filtros
   ════════════════════════════════════════════════════════════════════════════ */
function MisOrdenes() {
  const [ordenes,   setOrdenes]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const ESTADOS = ["todos", "pendiente", "pagada", "procesando", "enviada", "entregada", "cancelada"];

  const ordenesFiltradas = ordenes.filter(o =>
    filtroEstado === "todos" || o.estado === filtroEstado
  );

  if (cargando) return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          height:72, borderRadius:14,
          background:`linear-gradient(90deg,${C.surfaceAlt} 25%,#e9ebe6 50%,${C.surfaceAlt} 75%)`,
          backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite",
        }}/>
      ))}
    </div>
  );

  if (!ordenes.length) return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{
        width:64, height:64, borderRadius:18,
        background:C.brandLight, display:"flex",
        alignItems:"center", justifyContent:"center",
        fontSize:32, margin:"0 auto 14px",
      }}>📦</div>
      <p style={{ margin:"0 0 6px", fontWeight:700, color:C.text, fontSize:15 }}>Sin órdenes aún</p>
      <p style={{ margin:"0 0 20px", fontSize:13, color:C.textMuted }}>Tus compras aparecerán aquí</p>
      <Link to="/tienda" style={{
        display:"inline-block", padding:"10px 24px", borderRadius:12,
        background:C.brand, color:"#fff", textDecoration:"none",
        fontSize:13, fontWeight:700,
      }}>
        Ir a la tienda
      </Link>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Filtros de estado */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {ESTADOS.map(e => {
          const cfg  = ESTADO_CFG[e];
          const activo = filtroEstado === e;
          const count  = e === "todos"
            ? ordenes.length
            : ordenes.filter(o => o.estado === e).length;
          if (e !== "todos" && count === 0) return null;
          return (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                display:"inline-flex", alignItems:"center", gap:5,
                padding:"6px 12px", borderRadius:999, flexShrink:0,
                border:`1.5px solid ${activo ? (cfg?.border || C.brand) : C.border}`,
                background: activo ? (cfg?.bg || C.brandLight) : C.surface,
                color: activo ? (cfg?.text || C.brand) : C.textSec,
                fontSize:12, fontWeight: activo ? 700 : 400,
                cursor:"pointer", transition:"all 0.15s",
              }}
            >
              {e === "todos" ? "📋" : <span style={{ width:6, height:6, borderRadius:"50%", background:cfg?.dot || C.brand }}/>}
              <span style={{ textTransform:"capitalize" }}>{e === "todos" ? "Todas" : e}</span>
              <span style={{
                background: activo ? (cfg?.text || C.brand) : C.surfaceAlt,
                color: activo ? "#fff" : C.textMuted,
                fontSize:10, fontWeight:700, padding:"1px 6px",
                borderRadius:999, transition:"all 0.15s",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {ordenesFiltradas.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px", color:C.textMuted, fontSize:13 }}>
          No hay órdenes con estado "{filtroEstado}"
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {ordenesFiltradas.map(o => (
            <div
              key={o.id}
              style={{
                background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:14, overflow:"hidden",
                transition:"all 0.2s",
              }}
            >
              {/* Cabecera de la orden */}
              <button
                onClick={() => setExpandido(expandido === o.id ? null : o.id)}
                style={{
                  width:"100%", display:"flex", alignItems:"center",
                  justifyContent:"space-between", gap:12,
                  padding:"14px 16px", background:"none", border:"none",
                  cursor:"pointer", flexWrap:"wrap", textAlign:"left",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:36, height:36, borderRadius:10,
                    background:C.brandLight,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, flexShrink:0,
                  }}>
                    📦
                  </div>
                  <div>
                    <p style={{ margin:"0 0 3px", fontSize:12, fontWeight:800, color:C.brand, fontFamily:"monospace", letterSpacing:0.5 }}>
                      {o.codigo}
                    </p>
                    <p style={{ margin:0, fontSize:11, color:C.textMuted }}>
                      {fdoc(o.created_at)} · {o.metodo_pago || "—"}
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:C.text, fontFamily:"monospace" }}>
                    {fmt(o.total)}
                  </span>
                  <BadgeEstado estado={o.estado}/>
                  <span style={{
                    fontSize:16, color:C.textMuted,
                    transition:"transform 0.2s",
                    transform: expandido === o.id ? "rotate(180deg)" : "rotate(0)",
                    display:"block",
                  }}>
                    ⌄
                  </span>
                </div>
              </button>

              {/* Detalle expandido */}
              {expandido === o.id && (
                <div style={{
                  borderTop:`1px solid ${C.border}`,
                  padding:"14px 16px",
                  background:C.surfaceAlt,
                  animation:"fadeUp 0.2s ease",
                }}>
                  {/* Barra de progreso del estado */}
                  <div style={{ marginBottom:16 }}>
                    <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer }}>
                      Estado del pedido
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                      {["pendiente","pagada","procesando","enviada","entregada"].map((est, i, arr) => {
                        const idx    = arr.indexOf(o.estado);
                        const activo = i <= idx && o.estado !== "cancelada";
                        return (
                          <div key={est} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                            <div style={{ display:"flex", width:"100%", alignItems:"center" }}>
                              {i > 0 && <div style={{ flex:1, height:2, background: activo ? C.brand : C.border, transition:"background 0.3s" }}/>}
                              <div style={{
                                width:14, height:14, borderRadius:"50%", flexShrink:0,
                                background: activo ? C.brand : C.border,
                                border:`2px solid ${activo ? C.brand : C.border}`,
                                transition:"all 0.3s",
                                boxShadow: i === idx && o.estado !== "cancelada" ? `0 0 0 3px ${C.brandLight}` : "none",
                              }}/>
                              {i < arr.length - 1 && <div style={{ flex:1, height:2, background: i < idx && o.estado !== "cancelada" ? C.brand : C.border }}/>}
                            </div>
                            <span style={{
                              fontSize:9, marginTop:5, textTransform:"capitalize",
                              color: activo ? C.brand : C.textMuted, fontWeight: i===idx ? 700 : 400,
                            }}>
                              {est}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {o.estado === "cancelada" && (
                      <p style={{ margin:"8px 0 0", fontSize:11, color:C.danger, fontWeight:600 }}>❌ Esta orden fue cancelada</p>
                    )}
                  </div>

                  {/* Info adicional */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    {[
                      { label:"Subtotal", val:fmt(o.subtotal) },
                      { label:"IVA (19%)", val:fmt(o.iva_total || 0) },
                      { label:"Total", val:fmt(o.total), destacado:true },
                    ].map(f => (
                      <div key={f.label} style={{
                        background:C.surface, padding:"10px 12px", borderRadius:10,
                        border:`1px solid ${f.destacado ? C.brandBorder : C.border}`,
                      }}>
                        <p style={{ margin:"0 0 3px", fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</p>
                        <p style={{ margin:0, fontSize:13, fontWeight:800, color: f.destacado ? C.brand : C.text, fontFamily:"monospace" }}>{f.val}</p>
                      </div>
                    ))}
                  </div>

                  {(o.direccion_entrega || o.ciudad_entrega) && (
                    <div style={{
                      marginTop:10, padding:"10px 12px", borderRadius:10,
                      background:C.surface, border:`1px solid ${C.border}`,
                      fontSize:12, color:C.textSec,
                    }}>
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

/* ════════════════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL DE PERFIL
   ════════════════════════════════════════════════════════════════════════════ */
const TABS = [
  { id:"datos",     label:"Mis datos",   icon:"👤" },
  { id:"seguridad", label:"Seguridad",   icon:"🔒" },
  { id:"ordenes",   label:"Mis órdenes", icon:"📦" },
];

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState("datos");
  const [perfil,  setPerfil]  = useState(null);
  const [cargando,setCargando]= useState(true);

  const cargar = () => {
    api.get("/auth/me")
      .then(({ data }) => setPerfil(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.canvas }}>
      <div style={{
        width:32, height:32, borderRadius:"50%",
        border:`2px solid ${C.brandLight}`, borderTopColor:C.brand,
        animation:"spin 0.8s linear infinite",
      }}/>
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
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { height:4px; }
        ::-webkit-scrollbar-thumb { background:${C.brandBorder}; border-radius:2px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.canvas }}>
        {/* Banner envío gratis */}
        <div style={{ background:C.brandDark, padding:"9px 16px", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.8)" }}>
            🚚 Envíos gratis a partir de{" "}
            <span style={{ color:C.lime, fontWeight:800 }}>$80.000</span>
          </p>
        </div>

        <div style={{ maxWidth:860, margin:"0 auto", padding:"28px 16px 64px" }}>

          {/* ── Tarjeta de perfil hero ── */}
          <div style={{
            borderRadius:24, marginBottom:20, overflow:"hidden",
            background:`linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
            boxShadow:"0 12px 40px rgba(26,92,26,0.2)",
            position:"relative",
          }}>
            {/* Decorativos */}
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, background:"rgba(163,230,53,0.07)", borderRadius:"50%", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-30, left:60, width:120, height:120, background:"rgba(255,255,255,0.04)", borderRadius:"50%", pointerEvents:"none" }}/>

            <div style={{ padding:"24px 28px", position:"relative", display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
              {/* Avatar */}
              <div style={{
                width:72, height:72, borderRadius:20, flexShrink:0,
                background:"rgba(255,255,255,0.15)",
                border:"2px solid rgba(255,255,255,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28, fontWeight:800, color:"#fff",
                boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
              }}>
                {iniciales}
              </div>

              {/* Info principal */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:4 }}>
                  <h1 style={{
                    margin:0, fontSize:22, fontWeight:800, color:"#fff",
                    fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  }}>
                    {perfil.nombre} {perfil.apellido}
                  </h1>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999,
                    background:"rgba(163,230,53,0.2)",
                    border:"1px solid rgba(163,230,53,0.3)",
                    color:C.lime, textTransform:"uppercase", letterSpacing:0.8,
                  }}>
                    {perfil.rol}
                  </span>
                </div>
                <p style={{ margin:"0 0 10px", fontSize:13, color:"rgba(255,255,255,0.6)" }}>{perfil.email}</p>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {edad !== null && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>
                      🎂 <strong style={{color:"rgba(255,255,255,0.8)"}}>{edad} años</strong>
                    </div>
                  )}
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>
                    📅 Miembro desde{" "}
                    <strong style={{color:"rgba(255,255,255,0.8)"}}>
                      {new Date(perfil.created_at).toLocaleDateString("es-CO",{month:"long",year:"numeric"})}
                    </strong>
                  </div>
                  {perfil.telefono && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>
                      📞 <strong style={{color:"rgba(255,255,255,0.8)"}}>{perfil.telefono}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignSelf:"flex-start" }}>
                <Link to="/tienda" style={{
                  padding:"8px 16px", borderRadius:10, textDecoration:"none",
                  background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)",
                  border:"1px solid rgba(255,255,255,0.2)",
                  fontSize:12, fontWeight:600, transition:"all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; }}
                >
                  🛒 Tienda
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  style={{
                    padding:"8px 16px", borderRadius:10, border:"none",
                    background:"rgba(239,68,68,0.15)",
                    border:"1px solid rgba(239,68,68,0.25)",
                    color:"#fca5a5", fontSize:12, fontWeight:600,
                    cursor:"pointer", transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(239,68,68,0.15)"; }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* Tabs integrados en la tarjeta */}
            <div style={{
              display:"flex", gap:0,
              borderTop:"1px solid rgba(255,255,255,0.1)",
              padding:"0 20px",
              background:"rgba(0,0,0,0.12)",
            }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding:"12px 18px",
                    background:"none", border:"none",
                    borderBottom:`2px solid ${tab===t.id ? C.lime : "transparent"}`,
                    color: tab===t.id ? "#fff" : "rgba(255,255,255,0.5)",
                    fontSize:13, fontWeight: tab===t.id ? 700 : 400,
                    cursor:"pointer", transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Contenido del tab ── */}
          <div style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:20, padding:"24px",
            boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
            animation:"fadeUp 0.3s ease",
          }}>
            {tab === "datos" && (
              <>
                <div style={{ marginBottom:20 }}>
                  <h2 style={{
                    margin:"0 0 4px", fontSize:17, fontWeight:800, color:C.text,
                    fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  }}>
                    Información personal
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:C.textMuted }}>
                    Actualiza tus datos de contacto e identificación
                  </p>
                </div>
                <DatosPersonales usuario={perfil} onActualizado={cargar}/>
              </>
            )}

            {tab === "seguridad" && (
              <>
                <div style={{ marginBottom:20 }}>
                  <h2 style={{
                    margin:"0 0 4px", fontSize:17, fontWeight:800, color:C.text,
                    fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  }}>
                    Cambiar contraseña
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:C.textMuted }}>
                    Necesitamos tu contraseña actual para confirmar el cambio
                  </p>
                </div>
                <CambiarPassword/>
              </>
            )}

            {tab === "ordenes" && (
              <>
                <div style={{ marginBottom:20 }}>
                  <h2 style={{
                    margin:"0 0 4px", fontSize:17, fontWeight:800, color:C.text,
                    fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  }}>
                    Historial de compras
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:C.textMuted }}>
                    Filtra y consulta el estado de tus pedidos
                  </p>
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