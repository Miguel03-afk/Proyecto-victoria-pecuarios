// src/pages/Auth.jsx — Diseño Victoria Pets (PDF style)
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Campo ──────────────────────────────────────────────────────────────── */
function Campo({ label, type="text", value, onChange, onBlur, placeholder, error, noPaste, autoComplete }) {
  const { C } = useTheme();
  const [verPass, setVerPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const esPass = type === "password";

  return (
    <div>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 1,
        color: error ? C.danger : focused ? C.brand : C.ink3,
        marginBottom: 7, transition: "color 0.15s",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={esPass ? (verPass ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onPaste={noPaste ? (e) => e.preventDefault() : undefined}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%", height: 44,
            padding: esPass ? "0 42px 0 14px" : "0 14px",
            borderRadius: RADIUS.sm,
            border: `1px solid ${error ? C.danger : focused ? C.brand : C.lineStrong}`,
            background: C.surface, color: C.ink,
            fontSize: 14, fontFamily: FONT.ui,
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: focused ? `0 0 0 3px ${C.brand}1f` : "none",
          }}
        />
        {esPass && (
          <button type="button" onClick={() => setVerPass(v => !v)}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 26, height: 26, padding: 0,
              background: "transparent", border: "none",
              cursor: "pointer", color: C.muted, fontSize: 13,
            }}>
            {verPass ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && (
        <p style={{ margin: "6px 0 0", fontSize: 11, color: C.danger, lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Barra de fuerza ────────────────────────────────────────────────────── */
function BarraFuerza({ pass }) {
  const { C } = useTheme();
  if (!pass) return null;
  const checks = [
    { ok: pass.length >= 8,    label: "8+ caracteres" },
    { ok: /[0-9]/.test(pass),  label: "1 número"      },
    { ok: /[A-Z]/.test(pass),  label: "1 mayúscula"   },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = [C.danger, C.warning, C.warning, C.success];
  const labels = ["Débil", "Mejorable", "Buena", "Fuerte"];

  return (
    <div style={{ marginTop: -4 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score] : C.surfaceAlt,
            transition: "background 0.2s",
          }}/>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.ink3 }}>
        <span style={{ color: colors[score], fontWeight: 600 }}>{labels[score]}</span>
        <span style={{ display: "flex", gap: 8 }}>
          {checks.map((c, i) => (
            <span key={i} style={{ color: c.ok ? C.success : C.muted }}>
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/* ─── OTP ────────────────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const { C } = useTheme();
  const refs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6).padEnd(6, " ").slice(0, 6);
      onChange(pasted.trim());
      const nextEmpty = pasted.indexOf(" ");
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
      refs.current[focusIdx]?.focus();
      return;
    }
    const arr = value.padEnd(6, " ").split("");
    arr[idx] = raw || " ";
    onChange(arr.join("").trim());
    if (raw && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx].trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 44, height: 52,
            textAlign: "center",
            borderRadius: RADIUS.sm,
            border: `1.5px solid ${d.trim() ? C.brand : C.lineStrong}`,
            background: C.surface, color: C.ink,
            fontSize: 22, fontWeight: 700,
            fontFamily: FONT.mono,
            outline: "none",
            transition: "all 0.15s",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Botón submit ───────────────────────────────────────────────────────── */
function BtnSubmit({ cargando, texto, textoCargando, disabled }) {
  const { C } = useTheme();
  const dis = cargando || disabled;
  return (
    <button type="submit" disabled={dis}
      style={{
        width: "100%", height: 46,
        borderRadius: RADIUS.sm,
        border: "none",
        background: dis ? C.surfaceAlt : C.brand,
        color: dis ? C.muted : "#fff",
        fontSize: 14, fontWeight: 700,
        fontFamily: FONT.ui,
        cursor: dis ? "default" : "pointer",
        transition: "background 0.15s, transform 0.08s",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
      onMouseEnter={e => { if (!dis) e.currentTarget.style.background = C.brandMid; }}
      onMouseLeave={e => { if (!dis) e.currentTarget.style.background = C.brand; }}
    >
      {cargando && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          animation: "vp-spin 0.8s linear infinite",
        }}/>
      )}
      {cargando ? textoCargando : texto}
    </button>
  );
}

/* ─── Panel marca (izquierda) ────────────────────────────────────────────── */
function PanelMarca({ titulo, subtitulo }) {
  const { C } = useTheme();
  return (
    <div style={{
      flex: 1, position: "relative", overflow: "hidden",
      background: C.brandDark, color: "#fff",
      padding: "48px 56px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        textDecoration: "none", color: "#fff",
        fontFamily: FONT.display, fontStyle: "italic",
        fontWeight: 600, fontSize: 22,
        position: "relative", zIndex: 2,
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 6,
          background: C.lime, color: C.brandDark,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900,
        }}>✦</span>
        Victoria·Pets
      </Link>

      {/* Texto central */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <h1 style={{
          fontFamily: FONT.display, fontWeight: 600,
          fontSize: "clamp(28px, 3.4vw, 44px)",
          lineHeight: 1.1, letterSpacing: -0.3,
          margin: "0 0 18px",
          color: "#fff",
        }}>
          {titulo}
        </h1>
        <p style={{
          margin: 0, fontSize: 15,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.6,
          maxWidth: 380,
        }}>
          {subtitulo}
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "inline-flex", alignItems: "center", gap: 8,
        fontSize: 11, color: "rgba(255,255,255,0.5)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.lime }}/>
        Sistema operativo · v2.4.1 · Ibagué
      </div>

      {/* Círculos decorativos sutiles */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 360, height: 360, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.06)",
      }}/>
      <div style={{
        position: "absolute", top: 80, right: 40,
        width: 180, height: 180, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.04)",
      }}/>
      <div style={{
        position: "absolute", bottom: -100, left: -80,
        width: 280, height: 280, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.05)",
      }}/>
    </div>
  );
}

/* ─── Verificación email ─────────────────────────────────────────────────── */
function VerificacionEmail({ email, onVerificado }) {
  const { C } = useTheme();
  const [codigo, setCodigo]     = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verificar = async (e) => {
    e?.preventDefault();
    if (codigo.length !== 6) return;
    setError(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/verificar-email", { email, codigo });
      onVerificado(data.token, data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido o expirado.");
    } finally { setCargando(false); }
  };

  const reenviar = async () => {
    if (cooldown > 0) return;
    setReenviando(true); setError("");
    try {
      await api.post("/auth/reenviar-codigo", { email });
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo reenviar el código.");
    } finally { setReenviando(false); }
  };

  return (
    <>
      <Estilos/>
      <div style={{ minHeight: "100vh", display: "flex", background: C.canvas, fontFamily: FONT.ui }}>
        <div className="vp-auth-left" style={{ display: "none", width: "44%", flexShrink: 0 }}>
          <PanelMarca
            titulo="Confirma tu correo para entrar."
            subtitulo="Un último paso para asegurarnos de que tu cuenta esté protegida."
          />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Verificación de cuenta
              </span>
              <h2 style={{
                fontFamily: FONT.display, fontStyle: "italic", fontWeight: 600,
                fontSize: 32, color: C.ink, margin: "8px 0 12px",
                letterSpacing: -0.3,
              }}>
                Revisa tu correo
              </h2>
              <p style={{ fontSize: 14, color: C.ink3, margin: 0, lineHeight: 1.6 }}>
                Enviamos un código de 6 dígitos a{" "}
                <strong style={{ color: C.ink }}>{email}</strong>
              </p>
            </div>

            {error && (
              <div style={{
                padding: "12px 14px", marginBottom: 18, borderRadius: RADIUS.sm,
                background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
                color: C.danger, fontSize: 13,
              }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={verificar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <OtpInput value={codigo} onChange={setCodigo}/>
              <BtnSubmit
                cargando={cargando}
                texto="Verificar y entrar"
                textoCargando="Verificando..."
                disabled={codigo.length !== 6}
              />
            </form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <p style={{ fontSize: 12, color: C.ink3, margin: "0 0 6px" }}>
                ¿No recibiste el código?
              </p>
              <button onClick={reenviar} disabled={reenviando || cooldown > 0}
                style={{
                  background: "none", border: "none",
                  color: cooldown > 0 ? C.muted : C.brand,
                  fontSize: 13, fontWeight: 700,
                  cursor: cooldown > 0 ? "default" : "pointer",
                  textDecoration: cooldown > 0 ? "none" : "underline",
                  padding: 0,
                }}>
                {reenviando ? "Enviando..." : cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Estilos globales ───────────────────────────────────────────────────── */
function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
      @keyframes vp-spin   { to { transform: rotate(360deg); } }
      @keyframes vp-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      * { box-sizing: border-box; }
      input::placeholder { color: #8FAA98; }
      @media (min-width: 900px) {
        .vp-auth-left { display: flex !important; }
      }
    `}</style>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════════════════════════════════════════ */
export function Login() {
  const { C } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const desde = location.state?.desde || "/";
  const [form, setForm] = useState({ email: "", password: "", recordar: true });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostraRecuperar, setMostraRecuperar] = useState(false);
  const [verificarEmail, setVerificarEmail] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      login(data.token, data.usuario);
      // Redirección por rol — la lógica de fondo decide
      const rol = data.usuario?.rol;
      const destino =
        rol === "admin" || rol === "superadmin" ? "/admin" :
        rol === "veterinario" ? "/veterinario" :
        rol === "cajero" ? "/cajero" :
        desde;
      navigate(destino, { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.pendienteVerificacion) {
        setVerificarEmail(resp.email);
      } else {
        setError(resp?.error || "Correo o contraseña incorrectos.");
      }
    } finally { setCargando(false); }
  };

  if (verificarEmail) {
    return <VerificacionEmail email={verificarEmail} onVerificado={(token, usuario) => {
      login(token, usuario);
      const rol = usuario?.rol;
      const destino =
        rol === "admin" || rol === "superadmin" ? "/admin" :
        rol === "veterinario" ? "/veterinario" :
        rol === "cajero" ? "/cajero" :
        desde;
      navigate(destino, { replace: true });
    }}/>;
  }

  return (
    <>
      <Estilos/>
      <div style={{ minHeight: "100vh", display: "flex", background: C.canvas, fontFamily: FONT.ui }}>
        <div className="vp-auth-left" style={{ display: "none", width: "44%", flexShrink: 0 }}>
          <PanelMarca
            titulo={<>Bienvenido de vuelta al equipo de <em style={{ fontStyle: "italic" }}>Victoria Pets.</em></>}
            subtitulo="Tu jornada empieza aquí: pacientes, ventas e inventario, todo en un solo lugar."
          />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420, animation: "vp-fadeUp 0.4s ease" }}>

            <div style={{ marginBottom: 32 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: C.brand, letterSpacing: 1.5,
                textTransform: "uppercase",
              }}>
                Iniciar sesión
              </span>
              <h2 style={{
                fontFamily: FONT.display, fontStyle: "italic", fontWeight: 600,
                fontSize: 32, color: C.ink,
                margin: "8px 0 10px",
                letterSpacing: -0.3,
              }}>
                Hola de nuevo
              </h2>
              <p style={{ fontSize: 14, color: C.ink3, margin: 0, lineHeight: 1.6 }}>
                Ingresa tus datos para entrar a tu espacio.
              </p>
            </div>

            {error && (
              <div style={{
                padding: "12px 14px", marginBottom: 18, borderRadius: RADIUS.sm,
                background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
                color: C.danger, fontSize: 13,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Campo
                label="Correo"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="andrea@victoriapets.co"
                autoComplete="email"
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.ink3, letterSpacing: 1, textTransform: "uppercase" }}>
                    Contraseña
                  </span>
                  <button type="button" onClick={() => setMostraRecuperar(v => !v)}
                    style={{
                      background: "none", border: "none",
                      color: C.brand, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", padding: 0,
                    }}>
                    ¿Olvidaste?
                  </button>
                </div>
                <Campo
                  label=""
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
              </div>

              {mostraRecuperar && (
                <div style={{
                  padding: "12px 14px", borderRadius: RADIUS.sm,
                  background: C.brandSoft, border: `1px solid ${C.brandBorder}`,
                  fontSize: 12, color: C.brand, lineHeight: 1.55,
                }}>
                  Escríbenos a <strong>victoriavetpets@gmail.com</strong> con el asunto <em>"Recuperar contraseña"</em> y te ayudamos a restablecerla.
                </div>
              )}

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: C.ink2 }}>
                <input
                  type="checkbox"
                  checked={form.recordar}
                  onChange={e => setForm(f => ({ ...f, recordar: e.target.checked }))}
                  style={{ accentColor: C.brand, width: 14, height: 14, cursor: "pointer" }}
                />
                Recordar este equipo durante 30 días
              </label>

              <BtnSubmit
                cargando={cargando}
                texto="→ Entrar"
                textoCargando="Ingresando..."
                disabled={!form.email || !form.password}
              />
            </form>

            <div style={{
              margin: "28px 0",
              display: "flex", alignItems: "center", gap: 14,
              fontSize: 11, color: C.muted,
            }}>
              <div style={{ flex: 1, height: 1, background: C.line }}/>
              o continúa con
              <div style={{ flex: 1, height: 1, background: C.line }}/>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button type="button" style={{
                flex: 1, height: 42,
                borderRadius: RADIUS.sm,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink,
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
                Google
              </button>
              <button type="button" style={{
                flex: 1, height: 42,
                borderRadius: RADIUS.sm,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink,
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
                SSO interno
              </button>
            </div>

            <div style={{ textAlign: "center", fontSize: 12, color: C.ink3 }}>
              ¿Eres cliente y quieres comprar?{" "}
              <Link to="/" style={{ color: C.brand, fontWeight: 700, textDecoration: "none" }}>
                Ir a la tienda →
              </Link>
            </div>

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
              ¿Sin cuenta?{" "}
              <Link to="/registro" style={{ color: C.brand, fontWeight: 700, textDecoration: "none" }}>
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   REGISTRO
   ════════════════════════════════════════════════════════════════════════════ */
export function Registro() {
  const { C } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "", confirmEmail: "",
    nombre: "", apellido: "",
    password: "", confirmPass: "",
    terminos: false,
  });
  const [touched, setTouched] = useState({});
  const [errGlobal, setErrGlobal] = useState("");
  const [cargando, setCargando] = useState(false);
  const [emailPendiente, setEmailPendiente] = useState(null);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => ()  => setForm(p => ({ ...p, [k]: !p[k] }));
  const touch  = (k) => ()  => setTouched(p => ({ ...p, [k]: true }));

  const errs = {};
  if (!form.email || !RE_EMAIL.test(form.email))               errs.email        = "Ingresa un correo válido";
  if (form.confirmEmail !== form.email)                        errs.confirmEmail = "Los correos no coinciden";
  if (!form.nombre.trim())                                     errs.nombre       = "Ingresa tu nombre";
  if (!form.apellido.trim())                                   errs.apellido     = "Ingresa tu apellido";
  if (form.password.length < 8)                                errs.password     = "Mínimo 8 caracteres";
  else if (!/[0-9]/.test(form.password))                       errs.password     = "Debe incluir al menos 1 número";
  if (!form.confirmPass || form.confirmPass !== form.password) errs.confirmPass  = "Las contraseñas no coinciden";
  if (!form.terminos)                                          errs.terminos     = true;

  const puedeEnviar = Object.keys(errs).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    setErrGlobal(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", {
        email: form.email,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        password: form.password,
      });
      if (data.pendienteVerificacion) {
        setEmailPendiente(data.email);
      }
    } catch (err) {
      setErrGlobal(err.response?.data?.error || "Error al crear la cuenta.");
    } finally { setCargando(false); }
  };

  if (emailPendiente) {
    return <VerificacionEmail email={emailPendiente} onVerificado={(token, usuario) => { login(token, usuario); navigate("/"); }}/>;
  }

  return (
    <>
      <Estilos/>
      <div style={{ minHeight: "100vh", display: "flex", background: C.canvas, fontFamily: FONT.ui }}>
        <div className="vp-auth-left" style={{ display: "none", width: "44%", flexShrink: 0 }}>
          <PanelMarca
            titulo={<>Crea tu cuenta y empieza a cuidar a tu <em style={{ fontStyle: "italic" }}>mascota.</em></>}
            subtitulo="Únete a miles de familias que confían en Victoria Pets para el cuidado de sus animales."
          />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 460, animation: "vp-fadeUp 0.4s ease" }}>

            <div style={{ marginBottom: 28 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: C.brand, letterSpacing: 1.5,
                textTransform: "uppercase",
              }}>
                Crear cuenta
              </span>
              <h2 style={{
                fontFamily: FONT.display, fontStyle: "italic", fontWeight: 600,
                fontSize: 32, color: C.ink,
                margin: "8px 0 10px",
                letterSpacing: -0.3,
              }}>
                Bienvenido
              </h2>
              <p style={{ fontSize: 14, color: C.ink3, margin: 0, lineHeight: 1.6 }}>
                Completa tus datos para empezar.
              </p>
            </div>

            {errGlobal && (
              <div style={{
                padding: "12px 14px", marginBottom: 16, borderRadius: RADIUS.sm,
                background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
                color: C.danger, fontSize: 13,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{errGlobal}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Campo
                label="Correo electrónico"
                type="email"
                value={form.email}
                onChange={set("email")}
                onBlur={touch("email")}
                placeholder="tucorreo@ejemplo.com"
                error={touched.email ? errs.email : undefined}
                autoComplete="email"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Campo
                  label="Nombre"
                  value={form.nombre}
                  onChange={set("nombre")}
                  onBlur={touch("nombre")}
                  placeholder="Juan"
                  error={touched.nombre ? errs.nombre : undefined}
                  autoComplete="given-name"
                />
                <Campo
                  label="Apellido"
                  value={form.apellido}
                  onChange={set("apellido")}
                  onBlur={touch("apellido")}
                  placeholder="Pérez"
                  error={touched.apellido ? errs.apellido : undefined}
                  autoComplete="family-name"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
              />

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={form.terminos}
                  onChange={toggle("terminos")}
                  style={{ accentColor: C.brand, width: 16, height: 16, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>
                  Acepto los{" "}
                  <span style={{ color: C.brand, textDecoration: "underline", cursor: "pointer" }}>Términos</span>
                  {" "}y la{" "}
                  <span style={{ color: C.brand, textDecoration: "underline", cursor: "pointer" }}>Política de privacidad</span>
                  {" "}de Victoria Pets
                </span>
              </label>

              <div style={{ paddingTop: 6 }}>
                <BtnSubmit
                  cargando={cargando}
                  texto="Crear cuenta"
                  textoCargando="Creando..."
                  disabled={!puedeEnviar}
                />
              </div>
            </form>

            <div style={{
              marginTop: 22, paddingTop: 18,
              borderTop: `1px solid ${C.line}`,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 13, color: C.ink3, margin: 0 }}>
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" style={{ color: C.brand, fontWeight: 700, textDecoration: "none" }}>
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
