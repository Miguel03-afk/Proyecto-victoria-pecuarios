// src/pages/auth/SolicitarReset.jsx
// Paso 1 del flujo "Olvidé mi contraseña": pide email, envía link al correo.
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faArrowRight, faCircleCheck, faTriangleExclamation,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import AuthLayout, { AUTH_C, AuthCard, AuthInput } from "./AuthLayout";

export default function SolicitarReset() {
  const [email, setEmail]       = useState("");
  const [errors, setErrors]     = useState({});
  const [errorGen, setErrorGen] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado]   = useState(false);
  const [shake, setShake]       = useState(false);

  const onChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
    if (errorGen) setErrorGen("");
  };

  const validar = () => {
    const e = {};
    if (!email.trim())                e.email = "Email requerido";
    else if (!/.+@.+\..+/.test(email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;
    if (!validar()) { triggerShake(); return; }

    setCargando(true);
    try {
      await api.post("/auth/solicitar-reset", { email: email.trim().toLowerCase() });
      // Por seguridad, siempre mostramos "enviado" aunque el email no exista
      setEnviado(true);
    } catch (err) {
      const msg = err.response?.data?.error || "No pudimos procesar la solicitud. Intenta de nuevo.";
      setErrorGen(msg);
      triggerShake();
    } finally {
      setCargando(false);
    }
  };

  /* ─── Pantalla de "enviado" ─────────────────────────────────────── */
  if (enviado) {
    return (
      <AuthLayout breadcrumb="Recuperar contraseña">
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
              Revisa tu correo
            </h1>

            <p style={{
              margin: "0 0 6px", fontSize: 14, color: AUTH_C.fgSoft,
              lineHeight: 1.6,
            }}>
              Si existe una cuenta con <strong style={{ color: AUTH_C.fg }}>{email}</strong>,
              te enviamos un enlace para restablecer tu contraseña.
            </p>

            <p style={{
              margin: "0 0 24px", fontSize: 12, color: AUTH_C.fgMuted,
              lineHeight: 1.6,
            }}>
              El enlace expira en 10 minutos. Revisa también tu carpeta de spam.
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: "transparent", color: AUTH_C.fgSoft,
                border: `1px solid ${AUTH_C.inputBorder}`,
                textDecoration: "none", fontSize: 13, fontWeight: 600,
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />
              Volver al login
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  /* ─── Pantalla del formulario ──────────────────────────────────── */
  return (
    <AuthLayout breadcrumb="Recuperar contraseña">
      <AuthCard shake={shake}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: "0 0 8px",
            fontFamily: '"General Sans", system-ui, sans-serif',
            fontWeight: 700, fontSize: 30, color: AUTH_C.fg,
            letterSpacing: "-0.025em", lineHeight: 1.05,
          }}>
            Recuperar contraseña
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: AUTH_C.fgSoft, lineHeight: 1.6 }}>
            Ingresa el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
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
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={onChange}
            placeholder="tu@correo.com"
            autoComplete="email"
            leadingIcon={faEnvelope}
            error={errors.email}
          />

          <button
            type="submit"
            disabled={cargando}
            className="vp-auth-cta"
            style={{
              width: "100%", height: 50, marginTop: 24,
              borderRadius: 14, border: "none", cursor: cargando ? "not-allowed" : "pointer",
              background: AUTH_C.fg, color: AUTH_C.card,
              fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
              opacity: cargando ? 0.6 : 1,
            }}
          >
            {cargando ? "Enviando..." : (<>Enviar enlace <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} /></>)}
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
