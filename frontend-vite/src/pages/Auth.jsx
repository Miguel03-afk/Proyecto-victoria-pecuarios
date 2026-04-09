// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const C = {
  brand:      "#1a5c1a",
  brandMid:   "#2d7a2d",
  brandDark:  "#0c180c",
  brandLight: "#e6f3e6",
  brandBorder:"#b8d9b8",
  lime:       "#a3e635",
  canvas:     "#f6f7f4",
  surface:    "#ffffff",
  surfaceAlt: "#f2f3ef",
  text:       "#111827",
  textSec:    "#374151",
  textTer:    "#6b7280",
  textMuted:  "#9ca3af",
  border:     "rgba(0,0,0,0.09)",
  danger:     "#dc2626",
  dangerBg:   "#fef2f2",
  dangerBorder:"#fecaca",
};

/* ─── Campo de entrada ────────────────────────────────────────────────────── */
function Campo({ label, type = "text", value, onChange, placeholder, required, hint, disabled }) {
  const [verPass, setVerPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const esPass = type === "password";

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
      <div style={{ position:"relative" }}>
        <input
          type={esPass ? (verPass ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:"100%",
            padding: esPass ? "11px 44px 11px 14px" : "11px 14px",
            borderRadius:12,
            border:`1.5px solid ${focused ? C.brand : C.border}`,
            background: disabled ? C.surfaceAlt : focused ? C.surface : C.surfaceAlt,
            color: disabled ? C.textMuted : C.text,
            fontSize:14,
            outline:"none",
            transition:"all 0.15s",
            cursor: disabled ? "not-allowed" : "text",
            boxShadow: focused ? `0 0 0 3px rgba(26,92,26,0.08)` : "none",
          }}
        />
        {esPass && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVerPass(v => !v)}
            style={{
              position:"absolute", right:12, top:"50%",
              transform:"translateY(-50%)",
              background:"none", border:"none",
              cursor:"pointer", color:C.textMuted,
              fontSize:16, padding:2,
              transition:"color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.brand; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
          >
            {verPass ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {hint && (
        <p style={{ margin:"5px 0 0", fontSize:11, color:C.textMuted, lineHeight:1.4 }}>{hint}</p>
      )}
    </div>
  );
}

/* ─── Select ──────────────────────────────────────────────────────────────── */
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
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? C.brand : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color:C.text, fontSize:14, outline:"none",
          cursor:"pointer", transition:"all 0.15s",
          boxShadow: focused ? `0 0 0 3px rgba(26,92,26,0.08)` : "none",
        }}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── Error box ───────────────────────────────────────────────────────────── */
function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:10,
      padding:"12px 14px", borderRadius:12,
      background:C.dangerBg, border:`1px solid ${C.dangerBorder}`,
      color:C.danger, fontSize:13,
    }}>
      <span style={{fontSize:16, flexShrink:0}}>⚠️</span>
      <span>{msg}</span>
    </div>
  );
}

/* ─── Botón submit ────────────────────────────────────────────────────────── */
function BtnSubmit({ cargando, texto, textoCargando }) {
  return (
    <button
      type="submit"
      disabled={cargando}
      style={{
        width:"100%", padding:"13px 0", borderRadius:12, border:"none",
        background: cargando ? C.brandMid : C.brand,
        color:"#fff", fontSize:14, fontWeight:800,
        cursor: cargando ? "default" : "pointer",
        transition:"all 0.2s", letterSpacing:0.3,
        boxShadow:`0 4px 16px rgba(26,92,26,0.25)`,
        opacity: cargando ? 0.8 : 1,
      }}
      onMouseEnter={e => { if (!cargando) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(26,92,26,0.35)"; }}}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(26,92,26,0.25)"; }}
    >
      {cargando ? (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{
            width:14, height:14, borderRadius:"50%",
            border:`2px solid rgba(255,255,255,0.3)`,
            borderTopColor:"#fff",
            display:"inline-block",
            animation:"spin 0.8s linear infinite",
          }}/>
          {textoCargando}
        </span>
      ) : texto}
    </button>
  );
}

/* ─── Panel izquierdo decorativo ──────────────────────────────────────────── */
function PanelIzquierdo({ titulo, subtitulo, items }) {
  return (
    <div style={{
      background:`linear-gradient(160deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
      padding:"48px 40px",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      position:"relative", overflow:"hidden",
    }}>
      {/* Decorativos */}
      <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, background:"rgba(163,230,53,0.07)", borderRadius:"50%" }}/>
      <div style={{ position:"absolute", bottom:-40, left:-40, width:180, height:180, background:"rgba(255,255,255,0.04)", borderRadius:"50%" }}/>
      <div style={{ position:"absolute", top:"40%", left:-20, width:80, height:80, background:"rgba(163,230,53,0.05)", borderRadius:"50%" }}/>

      {/* Logo top */}
      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(255,255,255,0.15)",
            border:"1px solid rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18,
          }}>🐾</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Victoria Pecuarios</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", letterSpacing:1.2, textTransform:"uppercase" }}>Veterinaria</div>
          </div>
        </div>
      </div>

      {/* Contenido central */}
      <div style={{ position:"relative" }}>
        <div style={{ fontSize:52, marginBottom:20 }}>🐾</div>
        <h2 style={{
          margin:"0 0 10px",
          fontFamily:"'Playfair Display',Georgia,serif",
          fontStyle:"italic", fontWeight:600,
          fontSize:"clamp(20px,2.5vw,28px)",
          color:"#fff", lineHeight:1.25,
        }}>
          {titulo}
        </h2>
        <p style={{ margin:"0 0 28px", fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.65, maxWidth:300 }}>
          {subtitulo}
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:22, height:22, borderRadius:6,
                background:"rgba(163,230,53,0.2)",
                border:"1px solid rgba(163,230,53,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0,
              }}>
                <span style={{ fontSize:11, color:C.lime }}>✓</span>
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>{it}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:"relative" }}>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>© 2026 Victoria Pecuarios · Bogotá, Colombia</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════════════════════════════════════════ */
export function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const desde      = location.state?.desde || "/";
  const [form, setForm] = useState({ email:"", password:"" });
  const [error,    setError]   = useState("");
  const [cargando, setCargando]= useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.usuario);
      navigate(desde, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Correo o contraseña incorrectos.");
    } finally { setCargando(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        {/* Panel izquierdo — solo visible en desktop */}
        <div style={{ display:"none", width:"45%", flexShrink:0 }} className="auth-left">
          <PanelIzquierdo
            titulo="Cuidamos a tus animales como si fueran nuestros"
            subtitulo="Productos veterinarios de calidad, atención profesional y el amor que tus mascotas merecen."
            items={["Más de 500 productos disponibles","Entregas a domicilio en Bogotá","Atención veterinaria profesional","IVA transparente en cada compra"]}
          />
        </div>

        {/* Formulario */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          padding:"40px 24px",
        }}>
          <div style={{
            width:"100%", maxWidth:400,
            animation:"fadeUp 0.4s ease",
          }}>
            {/* Logo móvil */}
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <Link to="/" style={{ textDecoration:"none", display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{
                  width:52, height:52, borderRadius:16,
                  background:C.brand, display:"flex",
                  alignItems:"center", justifyContent:"center",
                  fontSize:24,
                  boxShadow:"0 8px 24px rgba(26,92,26,0.25)",
                }}>🐾</div>
                <span style={{
                  fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  fontWeight:600, fontSize:18, color:C.brand,
                }}>Victoria Pecuarios</span>
              </Link>
              <p style={{ margin:"6px 0 0", fontSize:13, color:C.textMuted }}>
                Inicia sesión para continuar
              </p>
            </div>

            {/* Card */}
            <div style={{
              background:C.surface,
              border:`1px solid ${C.border}`,
              borderRadius:20,
              padding:"28px 28px 24px",
              boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
            }}>
              <h2 style={{
                margin:"0 0 20px",
                fontSize:20, fontWeight:800, color:C.text,
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
              }}>
                Bienvenido de vuelta
              </h2>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <ErrorBox msg={error}/>

                <Campo
                  label="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
                <Campo
                  label="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                />

                <div style={{ paddingTop:4 }}>
                  <BtnSubmit cargando={cargando} texto="Iniciar sesión →" textoCargando="Ingresando..."/>
                </div>
              </form>

              <div style={{
                marginTop:20, paddingTop:16,
                borderTop:`1px solid ${C.border}`,
                textAlign:"center",
              }}>
                <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>
                  ¿No tienes cuenta?{" "}
                  <Link to="/registro" style={{ color:C.brand, fontWeight:700, textDecoration:"none" }}>
                    Regístrate gratis
                  </Link>
                </p>
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:20 }}>
              <Link to="/" style={{ fontSize:12, color:C.textMuted, textDecoration:"none" }}
                onMouseEnter={e => { e.target.style.color = C.brand; }}
                onMouseLeave={e => { e.target.style.color = C.textMuted; }}
              >
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left { display: flex !important; }
        }
      `}</style>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   REGISTRO
   ════════════════════════════════════════════════════════════════════════════ */
export function Registro() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({
    nombre:"", apellido:"", email:"", password:"", confirmar:"",
    telefono:"", tipo_documento:"CC", numero_documento:"", fecha_nacimiento:"",
  });
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);
  const [paso,     setPaso]     = useState(1); // 1 = datos básicos, 2 = seguridad
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const edadValida = () => {
    if (!form.fecha_nacimiento) return true;
    const hoy = new Date();
    const nac = new Date(form.fecha_nacimiento);
    return hoy.getFullYear() - nac.getFullYear() - (
      hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate()) ? 1 : 0
    ) >= 13;
  };

  const avanzar = (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.apellido || !form.email) return setError("Completa los campos obligatorios.");
    if (!edadValida()) return setError("Debes tener al menos 13 años para registrarte.");
    setPaso(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmar) return setError("Las contraseñas no coinciden.");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", {
        nombre:           form.nombre,
        apellido:         form.apellido,
        email:            form.email,
        password:         form.password,
        telefono:         form.telefono    || undefined,
        tipo_documento:   form.tipo_documento,
        numero_documento: form.numero_documento || undefined,
        fecha_nacimiento: form.fecha_nacimiento  || undefined,
      });
      login(data.token, data.usuario);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la cuenta.");
      setPaso(1);
    } finally { setCargando(false); }
  };

  const fechaMaxNac = new Date(new Date().setFullYear(new Date().getFullYear()-13)).toISOString().split("T")[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        {/* Panel izquierdo */}
        <div style={{ display:"none", width:"40%", flexShrink:0 }} className="auth-left">
          <PanelIzquierdo
            titulo="Tu mascota merece lo mejor"
            subtitulo="Únete a miles de clientes que confían en Victoria Pecuarios para el cuidado de sus animales."
            items={["Cuenta gratis, sin complicaciones","Historial de compras organizado","Acceso a ofertas exclusivas","Citas veterinarias desde tu perfil"]}
          />
        </div>

        {/* Formulario */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          padding:"40px 24px", overflowY:"auto",
        }}>
          <div style={{ width:"100%", maxWidth:480, animation:"fadeUp 0.4s ease" }}>

            {/* Logo */}
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <Link to="/" style={{ textDecoration:"none", display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{
                  width:52, height:52, borderRadius:16, background:C.brand,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                  boxShadow:"0 8px 24px rgba(26,92,26,0.25)",
                }}>🐾</div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600, fontSize:18, color:C.brand }}>Victoria Pecuarios</span>
              </Link>
              <p style={{ margin:"6px 0 0", fontSize:13, color:C.textMuted }}>Crea tu cuenta · Rápido y seguro</p>
            </div>

            {/* Indicador de pasos */}
            <div style={{
              display:"flex", alignItems:"center", gap:8, marginBottom:24,
              justifyContent:"center",
            }}>
              {[1,2].map(n => (
                <div key={n} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background: n <= paso ? C.brand : C.border,
                    color: n <= paso ? "#fff" : C.textMuted,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700, transition:"all 0.3s",
                  }}>
                    {n < paso ? "✓" : n}
                  </div>
                  <span style={{ fontSize:12, color: n === paso ? C.brand : C.textMuted, fontWeight: n === paso ? 700 : 400 }}>
                    {n === 1 ? "Tus datos" : "Seguridad"}
                  </span>
                  {n < 2 && <div style={{ width:32, height:1, background: paso > 1 ? C.brand : C.border, transition:"background 0.3s" }}/>}
                </div>
              ))}
            </div>

            {/* Card */}
            <div style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:20, padding:"28px 28px 24px",
              boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
            }}>
              <ErrorBox msg={error}/>

              {/* ── PASO 1: Datos personales ── */}
              {paso === 1 && (
                <form onSubmit={avanzar} style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.3s ease" }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                      Información personal
                    </h2>
                    <p style={{ margin:0, fontSize:12, color:C.textMuted }}>Los campos con * son obligatorios</p>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Campo label="Nombre *"   value={form.nombre}   onChange={set("nombre")}   placeholder="Juan"  required />
                    <Campo label="Apellido *"  value={form.apellido} onChange={set("apellido")} placeholder="Pérez" required />
                  </div>

                  <Campo
                    label="Correo electrónico *"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="tucorreo@ejemplo.com"
                    required
                    hint="El correo no podrá modificarse después del registro"
                  />

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="300 000 0000"/>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, marginBottom:6 }}>
                        Fecha nacimiento
                      </label>
                      <input
                        type="date"
                        value={form.fecha_nacimiento}
                        onChange={set("fecha_nacimiento")}
                        max={fechaMaxNac}
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

                  {/* Separador documento */}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
                    <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer }}>
                      Documento de identidad
                    </p>
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

                  <div style={{ paddingTop:4 }}>
                    <button
                      type="submit"
                      style={{
                        width:"100%", padding:"13px 0", borderRadius:12, border:"none",
                        background:C.brand, color:"#fff", fontSize:14, fontWeight:800,
                        cursor:"pointer", transition:"all 0.2s",
                        boxShadow:"0 4px 16px rgba(26,92,26,0.25)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
                    >
                      Continuar →
                    </button>
                  </div>
                </form>
              )}

              {/* ── PASO 2: Seguridad ── */}
              {paso === 2 && (
                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14, animation:"slideLeft 0.3s ease" }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                      Crea tu contraseña
                    </h2>
                    <p style={{ margin:0, fontSize:12, color:C.textMuted }}>Mínimo 6 caracteres</p>
                  </div>

                  {/* Resumen del usuario */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"12px 14px", borderRadius:12,
                    background:C.brandLight, border:`1px solid ${C.brandBorder}`,
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:10,
                      background:C.brand, color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14, fontWeight:800, flexShrink:0,
                    }}>
                      {form.nombre.charAt(0).toUpperCase()}{form.apellido.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.brand }}>
                        {form.nombre} {form.apellido}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:C.textTer }}>{form.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      style={{
                        marginLeft:"auto", fontSize:12, color:C.brand,
                        background:"none", border:"none", cursor:"pointer",
                        textDecoration:"underline", fontWeight:600,
                      }}
                    >
                      Editar
                    </button>
                  </div>

                  <Campo label="Contraseña *"         type="password" value={form.password}  onChange={set("password")}  placeholder="Mínimo 6 caracteres" required/>
                  <Campo label="Confirmar contraseña *" type="password" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite tu contraseña"  required/>

                  {/* Indicador fuerza contraseña */}
                  {form.password && (
                    <div>
                      <div style={{ display:"flex", gap:4 }}>
                        {[
                          { ok: form.password.length >= 6,   label:"6+ chars" },
                          { ok: /[A-Z]/.test(form.password), label:"Mayúscula" },
                          { ok: /[0-9]/.test(form.password), label:"Número" },
                        ].map((f,i) => (
                          <div key={i} style={{ flex:1 }}>
                            <div style={{
                              height:3, borderRadius:2,
                              background: f.ok ? C.brand : C.border,
                              transition:"background 0.3s",
                            }}/>
                            <span style={{ fontSize:9, color: f.ok ? C.brand : C.textMuted, marginTop:3, display:"block" }}>{f.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ paddingTop:4 }}>
                    <BtnSubmit cargando={cargando} texto="Crear mi cuenta gratis →" textoCargando="Creando cuenta..."/>
                  </div>

                  <p style={{ fontSize:11, color:C.textMuted, textAlign:"center", lineHeight:1.6, margin:0 }}>
                    Al registrarte aceptas nuestros{" "}
                    <span style={{ color:C.brand, cursor:"pointer" }}>Términos de servicio</span>
                    {" "}y{" "}
                    <span style={{ color:C.brand, cursor:"pointer" }}>Política de privacidad</span>
                  </p>
                </form>
              )}

              <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}`, textAlign:"center" }}>
                <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" style={{ color:C.brand, fontWeight:700, textDecoration:"none" }}>Inicia sesión</Link>
                </p>
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:20 }}>
              <Link to="/" style={{ fontSize:12, color:C.textMuted, textDecoration:"none" }}
                onMouseEnter={e => { e.target.style.color = C.brand; }}
                onMouseLeave={e => { e.target.style.color = C.textMuted; }}
              >
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left { display: flex !important; }
        }
      `}</style>
    </>
  );
}