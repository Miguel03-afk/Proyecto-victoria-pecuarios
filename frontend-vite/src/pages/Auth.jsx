import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye, faEyeSlash, faPaw, faEnvelope, faLock, faUser, faIdCard,
  faShieldHalved, faPaperPlane, faRightToBracket, faUserPlus,
  faRotateRight, faCircleCheck, faTriangleExclamation,
  faArrowLeft, faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

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

  // Rosa — calidez del logo VP
  rose:        "#D4457A",
  roseMid:     "#E8608A",
  roseLight:   "#FFF0F5",
  roseBorder:  "#F9C0D0",

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
            <FontAwesomeIcon icon={verPass ? faEyeSlash : faEye} />
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

/* ─── OTP 6 dígitos ──────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 1) {
      // pegado masivo
      const next = (value.slice(0, idx) + raw).slice(0, 6);
      onChange(next);
      refs.current[Math.min(idx + raw.length, 5)]?.focus();
      return;
    }
    if (!raw) {
      onChange(value.slice(0, idx) + " " + value.slice(idx + 1));
      return;
    }
    const next = value.slice(0, idx) + raw + value.slice(idx + 1);
    onChange(next.trimEnd());
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx].trim()) {
        onChange(value.slice(0, idx) + " " + value.slice(idx + 1));
      } else if (idx > 0) {
        onChange(value.slice(0, idx - 1) + " " + value.slice(idx));
        refs.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft"  && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
      {digits.map((d, i) => {
        const filled = !!d.trim();
        return (
          <input key={i}
            ref={el => refs.current[i] = el}
            value={filled ? d : ""}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKey(i, e)}
            maxLength={6}
            inputMode="numeric"
            style={{
              width:48, height:58, textAlign:"center",
              fontSize:26, fontWeight:800, letterSpacing:0,
              borderRadius:12, outline:"none",
              border:`2px solid ${filled ? C.brand : C.border}`,
              background: filled ? C.brandLight : C.surfaceAlt,
              color: C.text, transition:"all 0.15s",
              boxShadow: filled ? `0 0 0 3px rgba(10,107,64,0.12)` : "none",
              fontFamily:"monospace",
            }}
          />
        );
      })}
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
      background:`linear-gradient(155deg, ${C.brandDark} 0%, #0d6038 55%, ${C.brand} 100%)`,
      padding:"36px 32px",
      display:"flex", flexDirection:"column",
      position:"relative", overflow:"hidden",
    }}>
      {/* Decoraciones — verde lima + rosa */}
      <div style={{ position:"absolute", top:-70, right:-50, width:240, height:240, background:"rgba(122,193,67,0.07)", borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-60, left:-40, width:220, height:220, background:"rgba(212,69,122,0.07)", borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"45%", right:-30, width:100, height:100, background:"rgba(212,69,122,0.05)", borderRadius:"50%", pointerEvents:"none" }}/>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, position:"relative" }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.13)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🐾</div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>Victoria Pets</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", letterSpacing:1.4, textTransform:"uppercase" }}>Veterinaria · Ibagué</div>
        </div>
      </div>

      {/* Titular */}
      <div style={{ position:"relative", marginBottom:24 }}>
        <h2 style={{ margin:"0 0 8px", fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontWeight:600, fontSize:"clamp(20px,2.2vw,26px)", color:"#fff", lineHeight:1.25 }}>
          {titulo}
        </h2>
        <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.52)", lineHeight:1.65 }}>{subtitulo}</p>
      </div>

      {/* Feature cards — alternando rosa y verde */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, position:"relative", flex:1 }}>
        {items.map((it, i) => {
          const isRose = i % 2 === 1;
          return (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 14px", borderRadius:12,
              background: isRose ? "rgba(212,69,122,0.13)" : "rgba(122,193,67,0.11)",
              border:`1px solid ${isRose ? "rgba(212,69,122,0.22)" : "rgba(122,193,67,0.2)"}`,
            }}>
              <div style={{
                width:30, height:30, borderRadius:9, flexShrink:0,
                background: isRose ? "rgba(212,69,122,0.28)" : "rgba(122,193,67,0.22)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontSize:14, color: isRose ? "#F78FB3" : C.lime }}>✓</span>
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.83)", lineHeight:1.45 }}>{it}</span>
            </div>
          );
        })}
      </div>

      {/* Stats de prueba social */}
      <div style={{ marginTop:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.09)",
        display:"flex", gap:0, position:"relative" }}>
        {[{num:"500+",lbl:"Productos"},{num:"2.000+",lbl:"Clientes"},{num:"5 ★",lbl:"Calificación"}].map((s,i) => (
          <div key={s.lbl} style={{ flex:1, textAlign: i===1 ? "center" : i===2 ? "right" : "left",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
            paddingRight: i < 2 ? 12 : 0, paddingLeft: i > 0 ? 12 : 0 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"monospace", lineHeight:1 }}>{s.num}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.38)", textTransform:"uppercase", letterSpacing:0.9, marginTop:3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VERIFICACIÓN DE EMAIL
   ════════════════════════════════════════════════════════════════════════════ */
function VerificacionEmail({ email, onVerificado }) {
  const [codigo, setCodigo]     = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [reenviando, setRe]     = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [okMsg, setOkMsg]       = useState("");

  const codigoLimpio = codigo.replace(/\s/g, "");

  const verificar = async () => {
    if (codigoLimpio.length < 6) { setError("Ingresa los 6 dígitos del código."); return; }
    setError(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/verificar-email", { email, codigo: codigoLimpio });
      onVerificado(data.token, data.usuario);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.expirado) {
        setError("El código expiró. Solicita uno nuevo.");
        setCodigo("");
      } else {
        setError(resp?.error || "Código incorrecto.");
      }
    } finally { setCargando(false); }
  };

  const reenviar = async () => {
    setRe(true); setError(""); setOkMsg("");
    try {
      await api.post("/auth/reenviar-codigo", { email });
      setOkMsg("Nuevo código enviado. Revisa tu bandeja de entrada.");
      setCodigo("");
      setCooldown(60);
      const iv = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo reenviar el código.");
    } finally { setRe(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes envelope  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.canvas, padding:"40px 24px" }}>
        <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.4s ease" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <Link to="/" style={{ textDecoration:"none", display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ width:52, height:52, borderRadius:16, background:C.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, border:`1px solid ${C.brandDark}` }}>🐾</div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:600, fontSize:18, color:C.brand }}>Victoria Pets</span>
            </Link>
          </div>

          <div style={{ background:C.surface, borderRadius:20, padding:"32px 28px 28px", border:`1px solid ${C.brandBorder}` }}>

            {/* Icono animado */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ width:72, height:72, borderRadius:20, background:C.brandLight, border:`2px solid ${C.brandBorder}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:36, animation:"envelope 2.5s ease-in-out infinite" }}>
                📧
              </div>
              <h2 style={{ margin:"14px 0 4px", fontSize:20, fontWeight:800, color:C.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                Verifica tu correo
              </h2>
              <p style={{ margin:0, fontSize:13, color:C.textMuted, lineHeight:1.55 }}>
                Enviamos un código de 6 dígitos a<br/>
                <strong style={{ color:C.brand }}>{email}</strong>
              </p>
            </div>

            {/* Mensaje OK */}
            {okMsg && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:14, borderRadius:12, background:"#E4F5EC", border:`1px solid ${C.brandBorder}`, color:C.brand, fontSize:13 }}>
                <span style={{ fontSize:16 }}>✅</span>
                <span>{okMsg}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", marginBottom:14, borderRadius:12, background:C.dangerBg, border:`1px solid ${C.dangerBorder}`, color:C.danger, fontSize:13 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Inputs OTP */}
            <div style={{ marginBottom:20 }}>
              <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:C.textTer, textAlign:"center" }}>Código de verificación</p>
              <OtpInput value={codigo.padEnd(6," ")} onChange={v => { setCodigo(v); setError(""); }}/>
            </div>

            {/* Botón verificar */}
            <button onClick={verificar} disabled={cargando || codigoLimpio.length < 6}
              style={{
                width:"100%", padding:"13px 0", borderRadius:12,
                border:`1px solid ${(cargando||codigoLimpio.length<6) ? C.border : C.limeDark}`,
                background: (cargando||codigoLimpio.length<6) ? C.surfaceAlt : C.lime,
                color: (cargando||codigoLimpio.length<6) ? C.textMuted : "#fff",
                fontSize:14, fontWeight:800, cursor:(cargando||codigoLimpio.length<6)?"not-allowed":"pointer",
                transition:"all 0.2s", marginBottom:16,
              }}
              onMouseEnter={e => { if (!cargando && codigoLimpio.length===6) e.currentTarget.style.background=C.limeDark; }}
              onMouseLeave={e => { if (!cargando && codigoLimpio.length===6) e.currentTarget.style.background=C.lime; }}>
              {cargando ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", display:"inline-block", animation:"spin 0.8s linear infinite" }}/>
                  Verificando...
                </span>
              ) : "Verificar cuenta →"}
            </button>

            {/* Reenviar */}
            <div style={{ textAlign:"center", paddingTop:12, borderTop:`1px solid ${C.border}` }}>
              <p style={{ margin:"0 0 8px", fontSize:12, color:C.textMuted }}>¿No recibiste el código?</p>
              <button onClick={reenviar} disabled={reenviando || cooldown > 0}
                style={{ background:"none", border:"none", color: cooldown>0 ? C.textMuted : C.brand, fontSize:13, fontWeight:700, cursor: cooldown>0 ? "default" : "pointer", textDecoration: cooldown>0 ? "none" : "underline", padding:0 }}>
                {reenviando ? "Enviando..." : cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
              </button>
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
    </>
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
  const [verificarEmail, setVerificarEmail]   = useState(null); // email pendiente de verificar
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.usuario);
      navigate(desde, { replace: true });
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
    return <VerificacionEmail email={verificarEmail} onVerificado={(token, usuario) => { login(token, usuario); navigate(desde, { replace: true }); }}/>;
  }

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
        <div style={{ display:"none", width:"44%", flexShrink:0 }} className="auth-left">
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
  const [emailPendiente, setEmailPendiente] = useState(null);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", background:C.canvas }}>
        <div style={{ display:"none", width:"44%", flexShrink:0 }} className="auth-left">
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

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:10 }}>
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
