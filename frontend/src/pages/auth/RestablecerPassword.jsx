// src/pages/auth/RestablecerPassword.jsx
// Paso 2 del flujo "Olvidé mi contraseña": usuario llega aquí desde el email
// con un token en la URL (?token=...). Valida y permite escribir nueva clave.
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock, faEye, faEyeSlash, faArrowRight,
  faCircleCheck, faTriangleExclamation, faArrowLeft, faCheck, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import AuthLayout, { AUTH_C, AuthCard, AuthInput, AuthCTA, AuthAlert } from "./AuthLayout";

/* DEBE coincidir EXACTAMENTE con passwordStrongSchema del backend. */
const REGLAS = [
  { id: "min",  test: (p) => p.length >= 8,           label: "Al menos 8 caracteres" },
  { id: "max",  test: (p) => p.length <= 20,          label: "Máximo 20 caracteres" },
  { id: "upp",  test: (p) => /[A-Z]/.test(p),         label: "Al menos una mayúscula" },
  { id: "spec", test: (p) => /[^A-Za-z0-9]/.test(p),  label: "Al menos un símbolo (!@#$%...)" },
];

function StrengthIndicator({ password }) {
  const cumplidas = REGLAS.filter(r => r.test(password)).length;
  const pct       = Math.round((cumplidas / REGLAS.length) * 100);
  const color =
    pct < 50  ? AUTH_C.red :
    pct < 100 ? "#F59E0B"  :
                AUTH_C.limeDeep;

  if (!password) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        height: 4, borderRadius: 999,
        background: '#E5E7EB', overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          transition: "width 220ms var(--vp-ease-out), background-color 220ms var(--vp-ease-out)",
        }}/>
      </div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {REGLAS.map(r => {
          const ok = r.test(password);
          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11.5, color: ok ? AUTH_C.limeDeep : AUTH_C.fgMuted,
              transition: "color 200ms var(--vp-ease-out)",
            }}>
              <FontAwesomeIcon icon={ok ? faCheck : faXmark} style={{ fontSize: 9, width: 10 }} />
              {r.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RestablecerPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token    = params.get("token") || "";

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShow]        = useState(false);
  const [errors,      setErrors]      = useState({});
  const [errorGen,    setErrorGen]    = useState("");
  const [cargando,    setCargando]    = useState(false);
  const [exito,       setExito]       = useState(false);
  const [shake,       setShake]       = useState(false);
  const [tokenValido, setTokenValido] = useState(true);

  useEffect(() => {
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      setTokenValido(false);
    }
  }, [token]);

  const passwordValida = useMemo(
    () => REGLAS.every(r => r.test(password)),
    [password]
  );

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const validar = () => {
    const e = {};
    if (!passwordValida) e.password = "La contraseña no cumple los requisitos";
    if (!confirm)        e.confirm  = "Confirma tu contraseña";
    else if (password !== confirm) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;
    if (!validar()) { triggerShake(); return; }

    setCargando(true);
    setErrorGen("");
    try {
      await api.post("/auth/restablecer-password", { token, nueva_password: password });
      setExito(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      const msg      = err.response?.data?.error || "No pudimos restablecer la contraseña.";
      const expirado = err.response?.data?.expirado;
      if (expirado) {
        setTokenValido(false);
      } else {
        setErrorGen(msg);
        triggerShake();
      }
    } finally {
      setCargando(false);
    }
  };

  if (!tokenValido) {
    return (
      <AuthLayout breadcrumb="Restablecer contraseña" heroStep={4}
        heroEyebrow="Hmm" heroTitle="Enlace expirado" heroSubtitle="Tus enlaces de restablecimiento duran 10 minutos por seguridad.">
        <AuthCard>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: AUTH_C.redSoft, border: `1px solid ${AUTH_C.redBorder}`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: AUTH_C.red, fontSize: 26 }} />
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontWeight: 600, fontSize: 28, color: AUTH_C.fg,
              letterSpacing: "-0.025em", lineHeight: 1.1,
            }}>
              Enlace inválido o expirado
            </h1>

            <p style={{
              margin: "0 0 24px", fontSize: 13.5, color: AUTH_C.fgSoft, lineHeight: 1.6,
            }}>
              El enlace que usaste no es válido o ya expiró (duran 10 minutos).
              Solicita uno nuevo y continúa el proceso.
            </p>

            <Link
              to="/solicitar-reset"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: AUTH_C.ctaBg, color: AUTH_C.ctaText,
                textDecoration: "none", fontSize: 14, fontWeight: 600,
                transition: 'background-color 160ms var(--vp-ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = AUTH_C.ctaBgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = AUTH_C.ctaBg)}
            >
              Solicitar nuevo enlace
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (exito) {
    return (
      <AuthLayout breadcrumb="Restablecer contraseña" heroStep={4}
        heroEyebrow="Listo" heroTitle="Contraseña actualizada" heroSubtitle="Te redirigimos al login en un momento.">
        <AuthCard>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: '#ECFDF5', border: `1px solid #A7F3D0`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#059669', fontSize: 28 }} />
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontWeight: 600, fontSize: 28, color: AUTH_C.fg,
              letterSpacing: "-0.025em", lineHeight: 1.1,
            }}>
              Contraseña actualizada
            </h1>

            <p style={{
              margin: "0 0 24px", fontSize: 13.5, color: AUTH_C.fgSoft, lineHeight: 1.6,
            }}>
              Tu contraseña fue cambiada correctamente. Te estamos redirigiendo al login…
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: AUTH_C.ctaBg, color: AUTH_C.ctaText,
                textDecoration: "none", fontSize: 14, fontWeight: 600,
              }}
            >
              Iniciar sesión ahora
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout breadcrumb="Restablecer contraseña" heroStep={4}>
      <AuthCard shake={shake}>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 600, color: AUTH_C.fg,
          letterSpacing: "-0.025em", lineHeight: 1.1,
        }}>
          Crear nueva contraseña
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.55 }}>
          Cumple los cuatro requisitos para activar el botón.
        </p>

        <form onSubmit={onSubmit} noValidate style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorGen && <AuthAlert>{errorGen}</AuthAlert>}

          <div>
            <AuthInput
              label="Nueva contraseña"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                const v = e.target.value.slice(0, 20);
                setPassword(v);
                if (errors.password) setErrors(s => ({ ...s, password: "" }));
              }}
              placeholder="Entre 8 y 20 caracteres"
              autoComplete="new-password"
              leadingIcon={faLock}
              error={errors.password}
              trailingButton={
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: "absolute", right: 8, top: "50%",
                    transform: "translateY(-50%)",
                    width: 36, height: 36, borderRadius: 999,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: AUTH_C.fgMuted,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = AUTH_C.fg)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = AUTH_C.fgMuted)}
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} style={{ fontSize: 14 }} />
                </button>
              }
            />
            <StrengthIndicator password={password} />
          </div>

          <AuthInput
            label="Confirmar contraseña"
            type={showPass ? "text" : "password"}
            value={confirm}
            onChange={(e) => {
              const v = e.target.value.slice(0, 20);
              setConfirm(v);
              if (errors.confirm) setErrors(s => ({ ...s, confirm: "" }));
            }}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            leadingIcon={faLock}
            error={errors.confirm}
          />

          <AuthCTA loading={cargando} disabled={!passwordValida || !confirm} icon={faArrowRight}>
            {cargando ? "Guardando…" : "Cambiar contraseña"}
          </AuthCTA>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: `1px solid ${AUTH_C.border}`,
          textAlign: "center",
        }}>
          <Link
            to="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13.5, color: AUTH_C.fgSoft, textDecoration: "none",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = AUTH_C.fg)}
            onMouseLeave={(e) => (e.currentTarget.style.color = AUTH_C.fgSoft)}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} />
            Volver al login
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
