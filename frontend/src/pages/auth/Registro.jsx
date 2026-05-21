// src/pages/auth/Registro.jsx
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faEnvelope, faPhone, faLock,
  faEye, faEyeSlash, faArrowRight, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import AuthLayout, { AUTH_C, AuthCard, AuthInput } from "./AuthLayout";

/* ─── Score de fuerza de contraseña (0-4) ────────────────────────────────── */
function passwordScore(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)      s++;
  if (/[A-Z]/.test(p))    s++;
  if (/[0-9]/.test(p))    s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function StrengthIndicator({ password }) {
  const score = passwordScore(password);
  const colors = [AUTH_C.red, AUTH_C.red, '#FBBF24', '#FBBF24', AUTH_C.lime];
  const labels = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte'];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 999,
            backgroundColor: i < score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background-color 200ms ease',
          }}/>
        ))}
      </div>
      {password && (
        <div style={{
          marginTop: 6, fontSize: 11,
          color: score >= 3 ? AUTH_C.lime : AUTH_C.fgMuted,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{labels[score]}</span>
          <span style={{ color: AUTH_C.fgMuted }}>
            8+ caracteres, mayúscula, número, símbolo
          </span>
        </div>
      )}
    </div>
  );
}

export default function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', password: '',
  });
  const [showPass, setShow] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  const [shake, setShake] = useState(false);

  const score = useMemo(() => passwordScore(form.password), [form.password]);

  const onChange = (k) => (e) => {
    setForm(s => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors(s => ({ ...s, [k]: '' }));
    if (errorGeneral) setErrorGeneral('');
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'Nombre requerido';
    if (!form.apellido.trim()) e.apellido = 'Apellido requerido';
    if (!form.email.trim())    e.email    = 'Email requerido';
    else if (!/.+@.+\..+/.test(form.email)) e.email = 'Email inválido';
    if (form.telefono && !/^[\d+\s()-]{7,}$/.test(form.telefono)) e.telefono = 'Teléfono inválido';
    if (!form.password)             e.password = 'Contraseña requerida';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    else if (score < 3)             e.password = 'Contraseña muy débil';
    if (!acepta) e.acepta = 'Debes aceptar los términos';
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
      await api.post('/auth/registro', {
        nombre:   form.nombre.trim(),
        apellido: form.apellido.trim(),
        email:    form.email.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
        password: form.password,
      });
      // Éxito: navegar a verificar OTP con el email
      navigate(`/verificar-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'No pudimos crear tu cuenta. Intenta de nuevo.');
      triggerShake();
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout breadcrumb="Crear cuenta">
      <AuthCard shake={shake}>
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
          margin: 0, fontSize: 30, fontWeight: 700, color: AUTH_C.fg,
          lineHeight: 1.05, letterSpacing: '-0.025em',
          fontFamily: '"General Sans", system-ui, sans-serif',
        }}>
          Únete a <span style={{ color: AUTH_C.lime }}>Victoria Pets</span>
        </h1>
        <p style={{
          margin: '10px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.5,
        }}>
          Crea tu cuenta y agenda la primera consulta en menos de un minuto.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <AuthInput
              label="Nombre" name="nombre" placeholder="Miguel"
              value={form.nombre} onChange={onChange('nombre')}
              autoComplete="given-name"
              leadingIcon={faUser} error={errors.nombre} required
            />
            <AuthInput
              label="Apellido" name="apellido" placeholder="García"
              value={form.apellido} onChange={onChange('apellido')}
              autoComplete="family-name"
              leadingIcon={faUser} error={errors.apellido} required
            />
          </div>

          <AuthInput
            label="Email" name="email" type="email" placeholder="tu@email.com"
            value={form.email} onChange={onChange('email')}
            autoComplete="email"
            leadingIcon={faEnvelope} error={errors.email} required
          />

          <AuthInput
            label="Teléfono (opcional)" name="telefono" type="tel" placeholder="+57 300 000 0000"
            value={form.telefono} onChange={onChange('telefono')}
            autoComplete="tel"
            leadingIcon={faPhone} error={errors.telefono}
          />

          <div>
            <AuthInput
              label="Contraseña"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={onChange('password')}
              autoComplete="new-password"
              leadingIcon={faLock} error={errors.password} required
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
            <StrengthIndicator password={form.password} />
          </div>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            marginTop: 4, fontSize: 12, color: AUTH_C.fgSoft, lineHeight: 1.5,
          }}>
            <input
              type="checkbox" checked={acepta}
              onChange={(e) => {
                setAcepta(e.target.checked);
                if (errors.acepta) setErrors(s => ({ ...s, acepta: '' }));
              }}
              style={{
                width: 14, height: 14, accentColor: AUTH_C.lime,
                marginTop: 2, cursor: 'pointer', flexShrink: 0,
              }}
            />
            <span>
              Acepto los{' '}
              <Link to="/contacto" style={{ color: AUTH_C.lime, fontWeight: 600 }}>
                Términos
              </Link>
              {' '}y la{' '}
              <Link to="/contacto" style={{ color: AUTH_C.lime, fontWeight: 600 }}>
                Política de Privacidad
              </Link>
            </span>
          </label>
          {errors.acepta && (
            <div style={{ fontSize: 11, color: AUTH_C.red, marginTop: -4 }}>
              {errors.acepta}
            </div>
          )}

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
            {cargando ? 'Creando tu cuenta…' : (
              <>
                Crear cuenta <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: 20, textAlign: 'center', fontSize: 13, color: AUTH_C.fgSoft,
        }}>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            style={{ color: AUTH_C.lime, fontWeight: 700, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Inicia sesión
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
