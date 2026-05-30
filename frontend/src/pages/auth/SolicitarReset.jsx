// src/pages/auth/SolicitarReset.jsx
// Paso 1 del flujo "Olvidé mi contraseña": pide email, envía link al correo.
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faArrowRight, faCircleCheck, faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import AuthLayout, { AUTH_C, AuthCard, AuthInput, AuthCTA, AuthAlert } from "./AuthLayout";

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
    if (!email.trim())                 e.email = "Email requerido";
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
      setEnviado(true);
    } catch (err) {
      setErrorGen(err.response?.data?.error || "No pudimos procesar la solicitud. Intenta de nuevo.");
      triggerShake();
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <AuthLayout breadcrumb="Recuperar contraseña" heroStep={4}
        heroEyebrow="Casi listo" heroTitle="Revisa tu correo" heroSubtitle="Te acabamos de enviar un enlace seguro para restablecer tu contraseña.">
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
              Revisa tu correo
            </h1>

            <p style={{
              margin: "0 0 6px", fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.6,
            }}>
              Si existe una cuenta con <strong style={{ color: AUTH_C.fg }}>{email}</strong>,
              te enviamos un enlace para restablecer tu contraseña.
            </p>

            <p style={{
              margin: "0 0 24px", fontSize: 12.5, color: AUTH_C.fgMuted, lineHeight: 1.6,
            }}>
              El enlace expira en 10 minutos. Revisa también tu carpeta de spam.
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 12,
                background: AUTH_C.surface, color: AUTH_C.fg,
                border: `1px solid ${AUTH_C.border}`,
                textDecoration: "none", fontSize: 13.5, fontWeight: 600,
                transition: 'all 160ms var(--vp-ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = AUTH_C.surfaceAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = AUTH_C.surface)}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />
              Volver al login
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout breadcrumb="Recuperar contraseña" heroStep={4}>
      <AuthCard shake={shake}>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 600, color: AUTH_C.fg,
          letterSpacing: "-0.025em", lineHeight: 1.1,
        }}>
          Recuperar contraseña
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.55 }}>
          Ingresa el correo de tu cuenta. Te enviamos un enlace para crear una nueva contraseña.
        </p>

        <form onSubmit={onSubmit} noValidate style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorGen && <AuthAlert>{errorGen}</AuthAlert>}

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

          <AuthCTA loading={cargando} icon={faArrowRight}>
            {cargando ? "Enviando…" : "Enviar enlace"}
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
