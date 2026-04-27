// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const C = {
  brand:       "#0A6B40",
  brandMid:    "#138553",
  brandDark:   "#064E30",
  brandLight:  "#E4F5EC",
  brandBorder: "#95CCAD",
  lime:        "#7AC143",
  limeDark:    "#5a9030",
  canvas:      "#F5FAF7",
  surface:     "#ffffff",
  surfaceAlt:  "#EDF6F1",
  text:        "#101F16",
  textSec:     "#2D4A38",
  textTer:     "#5A7A65",
  textMuted:   "#8FAA98",
  border:      "rgba(0,0,0,0.09)",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  dangerBorder:"#fecaca",
};

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Campo ───────────────────────────────────────────────────────────────── */
function Campo({ label, type="text", value, onChange, onBlur: handleBlur, placeholder, error, noPaste, disabled }) {
  const [verPass, setVerPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const esPass = type === "password";

  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        textTransform:"uppercase", letterSpacing:0.8,
        color: error ? C.danger : focused ? C.brand : C.textTer,
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
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={e => { setFocused(false); handleBlur?.(e); }}
          onPaste={noPaste ? e => e.preventDefault() : undefined}
          style={{
            width:"100%",
            padding: esPass ? "11px 44px 11px 14px" : "11px 14px",
            borderRadius:12,
            border:`1.5px solid ${error ? C.danger : focused ? C.brand : C.border}`,
            background: C.surfaceAlt,
            color: disabled ? C.textMuted : C.text,
            fontSize:14, outline:"none", transition:"all 0.15s",
            cursor: disabled ? "not-allowed" : "text",
            boxShadow: error
              ? `0 0 0 3px rgba(220,38,38,0.08)`
              : focused ? `0 0 0 3px rgba(10,107,64,0.10)` : "none",
          }}
        />
        {esPass && (
          <button type="button" tabIndex={-1} onClick={() => setVerPass(v => !v)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:15, padding:2 }}
            onMouseEnter={e => { e.currentTarget.style.color = C.brand; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}>
            {verPass ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && <p style={{ margin:"4px 0 0", fontSize:11, color:C.danger, lineHeight:1.4 }}>{error}</p>}
    </div>
  );
}

/* ─── Barra de fuerza ────────────────────────────────────────────────────── */
function BarraFuerza({ pass }) {
  if (!pass) return null;
  const checks = [
    { ok: pass.length >= 8,    label:"8+ chars" },
    { ok: /[0-9]/.test(pass),  label:"Número" },
    { ok: /[A-Z]/.test(pass),  label:"Mayúscula" },
  ];
  return (
    <div style={{ display:"flex", gap:4 }}>
      {checks.map((f, i) => (
        <div key={i} style={{ flex:1 }}>
          <div style={{ height:3, borderRadius:2, background: f.ok ? C.lime : C.border, transition:"background 0.25s" }}/>
          <span style={{ fontSize:9, color: f.ok ? C.limeDark : C.textMuted, marginTop:3, display:"block" }}>{f.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Botón submit ────────────────────────────────────────────────────────── */
function BtnSubmit({ cargando, texto, textoCargando, disabled: extraDisabled }) {
  const isDisabled = cargando || extraDisabled;
  return (
    <button type="submit" disabled={isDisabled}
      style={{
        width:"100%", padding:"13px 0", borderRadius:12,
        border:`1px solid ${isDisabled ? C.border : C.limeDark}`,
        background: isDisabled ? C.surfaceAlt : C.lime,
        color: isDisabled ? C.textMuted : "#fff",
        fontSize:14, fontWeight:800,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition:"all 0.2s", letterSpacing:0.3,
      }}
      onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = C.limeDark; }}
      onMouseLeave={e => { if (!isDisabled) e.currentTarget.style.background = C.lime; }}
    >
      {cargando ? (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ width:14, height:14, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:"#fff", display:"inline-block", animation:"spin 0.8s linear infinite" }}/>
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
      borderRight:`1px solid ${C.brandDark}`,
      padding:"48px 40px",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, background:"rgba(122,193,67,0.07)", borderRadius:"50%" }}/>
      <div style={{ position:"absolute", bottom:-40, left:-40, width:180, height:180, background:"rgba(255,255,255,0.04)", borderRadius:"50%" }}/>
      <div style={{ position:"absolute", top:"40%", left:-20, width:80, height:80, background:"rgba(122,193,67,0.05)", borderRadius:"50%" }}/>

      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🐾</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Victoria Pets</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", letterSpacing:1.2, textTransform:"uppercase" }}>Veterinaria</div>
          </div>
        </div>
      </div>

      <div style={{ position:"relative" }}>
        <div style={{ fontSize:52, marginBottom:20 }}>🐾</div>
        <h2 style={{ margin:"0 0 10px", fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontWeight:600, fontSize:"clamp(20px,2.5vw,28px)", color:"#fff", lineHeight:1.25 }}>
          {titulo}
        </h2>
        <p style={{ margin:"0 0 28px", fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.65, maxWidth:300 }}>{subtitulo}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:"rgba(122,193,67,0.2)", border:"1px solid rgba(122,193,67,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:11, color:C.lime }}>✓</span>
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>{it}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"relative" }}>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>© 2026 Victoria Pets · Ibagué, Colombia</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════════════════════════════════════════ */
export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const desde     = location.state?.desde || "/";
  const [form, setForm]         = useState({ email:"", password:"" });
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostraRecuperar, setMostraRecuperar] = useState(false);
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
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { to { background-position:-200% 0; } }
        * { box-sizing:border-box; }
        input::placeholder { color:#8FAA98; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        <div style={{ display:"none", width:"45%", flexShrink:0 }} className="auth-left">
          <PanelIzquierdo
            titulo="Cuidamos a tus animales como si fueran nuestros"
            subtitulo="Productos veterinarios de calidad, atención profesional y el amor que tus mascotas merecen."
            items={["Más de 500 productos disponibles","Entregas a domicilio en Ibagué","Atención veterinaria profesional","IVA transparente en cada compra"]}
          />
        </div>

        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:400, animation:"fadeUp 0.4s ease" }}>

            <div style={{ textAlign:"center", marginBottom:32 }}>
              <Link to="/" style={{ textDecoration:"none", display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:C.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, border:`1px solid ${C.brandDark}` }}>🐾</div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600, fontSize:18, color:C.brand }}>Victoria Pets</span>
              </Link>
              <p style={{ margin:"6px 0 0", fontSize:13, color:C.textMuted }}>Inicia sesión para continuar</p>
            </div>

            <div style={{ background:C.surface, borderRadius:20, padding:"28px 28px 24px", border:`1px solid ${C.brandBorder}` }}>
              <h2 style={{ margin:"0 0 20px", fontSize:20, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                Bienvenido de vuelta
              </h2>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {error && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}`, color:C.danger, fontSize:13 }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <Campo label="Correo electrónico" type="email" value={form.email} onChange={set("email")} placeholder="tucorreo@ejemplo.com"/>
                <Campo label="Contraseña" type="password" value={form.password} onChange={set("password")} placeholder="••••••••"/>

                <div style={{ textAlign:"right", marginTop:-6 }}>
                  <button type="button" onClick={() => setMostraRecuperar(v => !v)}
                    style={{ background:"none", border:"none", color:C.brand, fontSize:11, cursor:"pointer", textDecoration:"underline", fontWeight:500, padding:0 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {mostraRecuperar && (
                  <div style={{ padding:"12px 14px", borderRadius:12, background:C.brandLight, border:`1px solid ${C.brandBorder}`, fontSize:12, color:C.brand, lineHeight:1.6 }}>
                    Escríbenos a <strong>victoriavetpets@gmail.com</strong> con el asunto <em>"Recuperar contraseña"</em> y te ayudamos a restablecerla.
                  </div>
                )}

                <div style={{ paddingTop:4 }}>
                  <BtnSubmit cargando={cargando} texto="Iniciar sesión" textoCargando="Ingresando..."/>
                </div>
              </form>

              <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}`, textAlign:"center" }}>
                <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>
                  ¿No tienes cuenta?{" "}
                  <Link to="/registro" style={{ color:C.brand, fontWeight:700, textDecoration:"none" }}>Regístrate gratis</Link>
                </p>
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:20 }}>
              <Link to="/" style={{ fontSize:12, color:C.textMuted, textDecoration:"none" }}
                onMouseEnter={e => { e.target.style.color = C.brand; }}
                onMouseLeave={e => { e.target.style.color = C.textMuted; }}>
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
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
    email:"", confirmEmail:"",
    nombre:"", apellido:"",
    password:"", confirmPass:"",
    terminos:false,
  });
  const [touched, setTouched]     = useState({});
  const [errGlobal, setErrGlobal] = useState("");
  const [cargando, setCargando]   = useState(false);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => ()  => setForm(p => ({ ...p, [k]: !p[k] }));
  const touch  = (k) => ()  => setTouched(p => ({ ...p, [k]: true }));

  const errs = {};
  if (!form.email || !RE_EMAIL.test(form.email))               errs.email       = "Ingresa un correo válido";
  if (form.confirmEmail !== form.email)                        errs.confirmEmail = "Los correos no coinciden";
  if (!form.nombre.trim())                                     errs.nombre      = "Ingresa tu nombre";
  if (!form.apellido.trim())                                   errs.apellido    = "Ingresa tu apellido";
  if (form.password.length < 8)                                errs.password    = "Mínimo 8 caracteres";
  else if (!/[0-9]/.test(form.password))                      errs.password    = "Debe incluir al menos 1 número";
  if (!form.confirmPass || form.confirmPass !== form.password) errs.confirmPass  = "Las contraseñas no coinciden";
  if (!form.terminos)                                          errs.terminos    = true;

  const puedeEnviar = Object.keys(errs).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    setErrGlobal(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", {
        email:    form.email,
        nombre:   form.nombre.trim(),
        apellido: form.apellido.trim(),
        password: form.password,
      });
      login(data.token, data.usuario);
      navigate("/");
    } catch (err) {
      setErrGlobal(err.response?.data?.error || "Error al crear la cuenta.");
    } finally { setCargando(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        <div style={{ display:"none", width:"40%", flexShrink:0 }} className="auth-left">
          <PanelIzquierdo
            titulo="Tu mascota merece lo mejor"
            subtitulo="Únete a miles de clientes que confían en Victoria Pets para el cuidado de sus animales."
            items={["Cuenta gratis, sin complicaciones","Historial de compras organizado","Acceso a ofertas exclusivas","Citas veterinarias desde tu perfil"]}
          />
        </div>

        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:460, animation:"fadeUp 0.4s ease" }}>

            <div style={{ textAlign:"center", marginBottom:28 }}>
              <Link to="/" style={{ textDecoration:"none", display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:C.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, border:`1px solid ${C.brandDark}` }}>🐾</div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600, fontSize:18, color:C.brand }}>Victoria Pets</span>
              </Link>
              <p style={{ margin:"6px 0 0", fontSize:13, color:C.textMuted }}>Crea tu cuenta · Rápido y seguro</p>
            </div>

            <div style={{ background:C.surface, borderRadius:20, padding:"28px 28px 24px", border:`1px solid ${C.brandBorder}` }}>
              <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                Información de registro
              </h2>
              <p style={{ margin:"0 0 20px", fontSize:12, color:C.textMuted }}>Todos los campos son obligatorios</p>

              {errGlobal && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", marginBottom:14, borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}`, color:C.danger, fontSize:13 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                  <span>{errGlobal}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Campo
                  label="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  onBlur={touch("email")}
                  placeholder="tucorreo@ejemplo.com"
                  error={touched.email ? errs.email : undefined}
                />
                <Campo
                  label="Confirmar correo"
                  type="email"
                  value={form.confirmEmail}
                  onChange={set("confirmEmail")}
                  onBlur={touch("confirmEmail")}
                  placeholder="Repite tu correo"
                  noPaste
                  error={touched.confirmEmail ? errs.confirmEmail : undefined}
                />

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Campo
                    label="Nombre"
                    value={form.nombre}
                    onChange={set("nombre")}
                    onBlur={touch("nombre")}
                    placeholder="Juan"
                    error={touched.nombre ? errs.nombre : undefined}
                  />
                  <Campo
                    label="Apellido"
                    value={form.apellido}
                    onChange={set("apellido")}
                    onBlur={touch("apellido")}
                    placeholder="Pérez"
                    error={touched.apellido ? errs.apellido : undefined}
                  />
                </div>

                <Campo
                  label="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={touch("password")}
                  placeholder="Mínimo 8 caracteres, incluye 1 número"
                  error={touched.password ? errs.password : undefined}
                />
                <BarraFuerza pass={form.password}/>

                <Campo
                  label="Confirmar contraseña"
                  type="password"
                  value={form.confirmPass}
                  onChange={set("confirmPass")}
                  onBlur={touch("confirmPass")}
                  placeholder="Repite tu contraseña"
                  noPaste
                  error={touched.confirmPass ? errs.confirmPass : undefined}
                />

                {/* Checkbox términos */}
                <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
                  <div
                    onClick={toggle("terminos")}
                    style={{
                      marginTop:2, width:18, height:18, borderRadius:5, flexShrink:0,
                      border:`1.5px solid ${form.terminos ? C.lime : C.border}`,
                      background: form.terminos ? C.lime : C.surface,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", transition:"all 0.15s",
                    }}>
                    {form.terminos && <span style={{ fontSize:10, color:"#fff", fontWeight:800 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:12, color:C.textSec, lineHeight:1.55 }}>
                    Acepto los{" "}
                    <span style={{ color:C.brand, textDecoration:"underline", cursor:"pointer" }}>Términos de servicio</span>
                    {" "}y la{" "}
                    <span style={{ color:C.brand, textDecoration:"underline", cursor:"pointer" }}>Política de privacidad</span>
                    {" "}de Victoria Pets
                  </span>
                </label>

                <div style={{ paddingTop:4 }}>
                  <BtnSubmit
                    cargando={cargando}
                    texto="Crear cuenta"
                    textoCargando="Creando cuenta..."
                    disabled={!puedeEnviar}
                  />
                  {!puedeEnviar && Object.keys(touched).length > 0 && (
                    <p style={{ margin:"6px 0 0", fontSize:11, color:C.textMuted, textAlign:"center" }}>
                      Completa todos los campos correctamente para continuar
                    </p>
                  )}
                </div>
              </form>

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
                onMouseLeave={e => { e.target.style.color = C.textMuted; }}>
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
      `}</style>
    </>
  );
}
