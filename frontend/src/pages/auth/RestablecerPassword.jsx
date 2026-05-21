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
import AuthLayout, { AUTH_C, AuthCard, AuthInput } from "./AuthLayout";

/* ─── Reglas de validación de la contraseña ──────────────────────────────
   DEBE coincidir EXACTAMENTE con passwordStrongSchema del backend para
   evitar que el cliente piense que es válida y el server la rechace. */
const REGLAS = [
  { id: "min",  test: (p) => p.length >= 8,           label: "Al menos 8 caracteres" },
  { id: "max",  test: (p) => p.length <= 20,          label: "Máximo 20 caracteres" },
  { id: "upp",  test: (p) => /[A-Z]/.test(p),         label: "Al menos una mayúscula" },
  { id: "spec", test: (p) => /[^A-Za-z0-9]/.test(p),  label: "Al menos un carácter especial (!@#$%...)" },
];

function StrengthIndicator({ password }) {
  const cumplidas = REGLAS.filter(r => r.test(password)).length;
  const pct       = Math.round((cumplidas / REGLAS.length) * 100);
  const color =
    pct < 50  ? AUTH_C.red :
    pct < 100 ? "#F59E0B"  :
                AUTH_C.lime;

  if (!password) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        height: 4, borderRadius: 999,
        background: AUTH_C.inputBorder, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          transition: "width 200ms ease, background-color 200ms ease",
        }}/>
      </div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {REGLAS.map(r => {
          const ok = r.test(password);
          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: ok ? AUTH_C.lime : AUTH_C.fgMuted,
              transition: "color 200ms ease",
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

  // Validar formato del token al montar (debe ser 64 hex chars)
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
      await api.post("/auth/restablecer-password", {
        token,
        nueva_password: password,
      });
      setExito(true);
      // Auto-redirige al login después de 3 seg
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

  /* ─── Pantalla: token inválido o expirado ──────────────────────── */
  if (!tokenValido) {
    return (
      <AuthLayout breadcrumb="Restablecer contraseña">
        <AuthCard>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `${AUTH_C.red}22`, border: `1px solid ${AUTH_C.red}55`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: AUTH_C.red, fontSize: 26 }} />
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontFamily: '"General Sans", system-ui, sans-serif',
              fontWeight: 700, fontSize: 28, color: AUTH_C.fg,
              letterSpacing: "-0.025em", lineHeight: 1.05,
            }}>
              Enlace inválido o expirado
            </h1>

            <p style={{
              margin: "0 0 24px", fontSize: 13, color: AUTH_C.fgSoft,
              lineHeight: 1.6,
            }}>
              El enlace que usaste no es válido o ya expiró (duran 10 minutos).
              Solicita uno nuevo desde la pantalla de login.
            </p>

            <Link
              to="/solicitar-reset"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: AUTH_C.fg, color: AUTH_C.card,
                textDecoration: "none", fontSize: 13, fontWeight: 700,
              }}
            >
              Solicitar nuevo enlace
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  /* ─── Pantalla: éxito ──────────────────────────────────────────── */
  if (exito) {
    return (
      <AuthLayout breadcrumb="Restablecer contraseña">
        <AuthCard>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `${AUTH_C.lime}22`, border: `1px solid ${AUTH_C.lime}55`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ color: AUTH_C.lime, fontSize: 28 }} />
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontFamily: '"General Sans", system-ui, sans-serif',
              fontWeight: 700, fontSize: 28, color: AUTH_C.fg,
              letterSpacing: "-0.025em", lineHeight: 1.05,
            }}>
              Contraseña actualizada
            </h1>

            <p style={{
              margin: "0 0 24px", fontSize: 13, color: AUTH_C.fgSoft,
              lineHeight: 1.6,
            }}>
              Tu contraseña fue cambiada correctamente. Te estamos redirigiendo al login...
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: AUTH_C.fg, color: AUTH_C.card,
                textDecoration: "none", fontSize: 13, fontWeight: 700,
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

  /* ─── Pantalla: formulario nueva contraseña ────────────────────── */
  return (
    <AuthLayout breadcrumb="Restablecer contraseña">
      <AuthCard shake={shake}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: "0 0 8px",
            fontFamily: '"General Sans", system-ui, sans-serif',
            fontWeight: 700, fontSize: 30, color: AUTH_C.fg,
            letterSpacing: "-0.025em", lineHeight: 1.05,
          }}>
            Crear nueva contraseña
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: AUTH_C.fgSoft, lineHeight: 1.6 }}>
            Elige una contraseña segura. Cumple todos los requisitos para activar el botón.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {errorGen && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: `${AUTH_C.red}15`, border: `1px solid ${AUTH_C.red}40`,
              color: AUTH_C.red, fontSize: 12, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 12 }} />
              {errorGen}
            </div>
          )}

          <AuthInput
            label="Nueva contraseña"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              // Slice a 20 para que ni siquiera puedas pegar más caracteres.
              // Esto bloquea físicamente que un usuario pegue un link de 200 chars.
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
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: AUTH_C.fgMuted, padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} style={{ fontSize: 14 }} />
              </button>
            }
          />

          <StrengthIndicator password={password} />

          <div style={{ marginTop: 16 }}>
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
          </div>

          <button
            type="submit"
            disabled={cargando || !passwordValida || !confirm}
            className="vp-auth-cta"
            style={{
              width: "100%", height: 50, marginTop: 24,
              borderRadius: 14, border: "none",
              cursor: (cargando || !passwordValida || !confirm) ? "not-allowed" : "pointer",
              background: (passwordValida && confirm) ? AUTH_C.fg : `${AUTH_C.fg}40`,
              color: (passwordValida && confirm) ? AUTH_C.card : AUTH_C.fgMuted,
              fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
              opacity: cargando ? 0.6 : 1,
            }}
          >
            {cargando ? "Guardando..." : (<>Cambiar contraseña <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} /></>)}
          </button>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: `1px solid ${AUTH_C.cardBorder}`,
          textAlign: "center",
        }}>
          <Link
            to="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: AUTH_C.fgSoft, textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} />
            Volver al login
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
