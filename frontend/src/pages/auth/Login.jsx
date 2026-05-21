// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faLock, faEye, faEyeSlash, faArrowRight,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout, { AUTH_C, AuthCard, AuthInput } from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPass, setShow] = useState(false);
  const [recordar, setRec]  = useState(true);
  const [errors, setErrors] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  const [shake, setShake] = useState(false);

  const onChange = (k) => (e) => {
    setForm(s => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors(s => ({ ...s, [k]: '' }));
    if (errorGeneral) setErrorGeneral('');
  };

  const validar = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email requerido';
    else if (!/.+@.+\..+/.test(form.email)) e.email = 'Email inválido';
    if (!form.password) e.password = 'Contraseña requerida';
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
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(), password: form.password,
      });
      login(data.token, data.usuario);
      const dest = location.state?.desde || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'No pudimos iniciar sesión. Verifica tus datos.';
      // Si el email no está verificado, redirige a verificar
      if (err.response?.status === 403 && err.response?.data?.requiereVerificacion) {
        navigate(`/verificar-email?email=${encodeURIComponent(form.email.trim())}`);
        return;
      }
      setErrorGeneral(msg);
      triggerShake();
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout breadcrumb="Iniciar sesión">
      <AuthCard shake={shake}>
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: AUTH_C.navy,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#FAF7F0', fontWeight: 700, fontSize: 13,
            fontFamily: '"General Sans", system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}>
            VP
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: AUTH_C.fg }}>
            Victoria Pets
          </span>
        </div>

        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 700, color: AUTH_C.fg,
          lineHeight: 1.05, letterSpacing: '-0.025em',
          fontFamily: '"General Sans", system-ui, sans-serif',
        }}>
          Bienvenido <span style={{ color: AUTH_C.lime }}>de vuelta</span>
        </h1>
        <p style={{
          margin: '10px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.5,
        }}>
          Inicia sesión para gestionar las citas y compras de tu mascota.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={onChange('email')}
            autoComplete="email"
            leadingIcon={faEnvelope}
            error={errors.email}
            required
          />

          <AuthInput
            label="Contraseña"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={onChange('password')}
            autoComplete="current-password"
            leadingIcon={faLock}
            error={errors.password}
            required
            trailingButton={
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)',
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

          {/* Recordar + olvidaste */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 4, fontSize: 12,
          }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={recordar}
                onChange={(e) => setRec(e.target.checked)}
                style={{
                  width: 14, height: 14, accentColor: AUTH_C.lime, cursor: 'pointer',
                }}
              />
              <span style={{ color: AUTH_C.fgSoft }}>Recordar mi sesión</span>
            </label>
            <Link
              to="/solicitar-reset"
              style={{
                color: AUTH_C.lime, textDecoration: 'none', fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Error general */}
          {errorGeneral && (
            <div style={{
              padding: '10px 14px', borderRadius: 12,
              backgroundColor: 'rgba(230,57,70,0.12)',
              border: '1px solid rgba(230,57,70,0.32)',
              color: '#FCA5A5', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 14 }} />
              {errorGeneral}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={cargando}
            className="vp-auth-cta"
            style={{
              marginTop: 8, height: 48, width: '100%',
              backgroundColor: cargando ? 'rgba(255,255,255,0.3)' : '#fff',
              color: AUTH_C.card, fontWeight: 700, borderRadius: 999,
              fontSize: 14, border: 'none',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {cargando ? 'Iniciando sesión…' : (
              <>
                Iniciar sesión <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: 13, color: AUTH_C.fgSoft,
        }}>
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{ color: AUTH_C.lime, fontWeight: 700, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Regístrate
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
