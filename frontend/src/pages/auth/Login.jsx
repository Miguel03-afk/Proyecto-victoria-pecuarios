// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faLock, faEye, faEyeSlash, faArrowRight,
  faPaw, faTruckFast, faHeart, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout, { AUTH_C, AuthCard, AuthInput, AuthCTA, AuthAlert } from "./AuthLayout";

/* ─── Welcome panel — solo aparece en desktop, identidad lateral ─────────
   Diseño editorial: eyebrow + título italic + 3 perks con íconos.
   Aplica los 3 skills: navy+lime restraint (one voice), italic display voice,
   stagger entries, sin badges decorativos.                                  */
function WelcomePanel() {
  const PERKS = [
    { icon: faTruckFast,    label: "Envío express en Ibagué",  sub: "Pedido antes de las 2 pm, llega ese día." },
    { icon: faShieldHalved, label: "Pago seguro con ePayco",   sub: "Tarjeta, PSE o contraentrega." },
    { icon: faHeart,        label: "Atención por tu mascota",  sub: "Asesoría de surtido y dosis sin costo." },
  ];

  return (
    <div style={{
      maxWidth: 420,
      display: 'flex', flexDirection: 'column', gap: 28,
    }}>
      {/* Eyebrow con linea */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontSize: 10.5, fontWeight: 700,
        color: AUTH_C.lime, letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        <span style={{ width: 22, height: 1, background: AUTH_C.lime }} />
        Victoria Pets · Tienda
      </div>

      {/* Headline editorial italic */}
      <h2 style={{
        margin: 0,
        fontFamily: '"General Sans", sans-serif',
        fontSize: 'clamp(34px, 4vw, 46px)',
        fontWeight: 700, lineHeight: 1.0,
        letterSpacing: '-0.03em',
        color: '#FAF7F0',
      }}>
        Volver a tu cuenta es{' '}
        <span style={{
          fontStyle: 'italic', fontWeight: 400,
          color: AUTH_C.lime,
        }}>
          rápido.
        </span>
      </h2>

      <p style={{
        margin: 0, fontSize: 14.5, lineHeight: 1.6,
        color: 'rgba(250,247,240,0.72)',
        maxWidth: 360,
      }}>
        Pedidos guardados, direcciones listas y favoritos al alcance.
        Lo que pediste la última vez está a un click.
      </p>

      {/* Perks list */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        marginTop: 8,
      }}>
        {PERKS.map((p, i) => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            opacity: 0, transform: 'translateY(8px)',
            animation: `vp-auth-perk 600ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 100}ms forwards`,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: 'rgba(123,193,67,0.12)',
              border: '1px solid rgba(123,193,67,0.24)',
              color: AUTH_C.lime,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FontAwesomeIcon icon={p.icon} style={{ fontSize: 13 }} />
            </span>
            <div>
              <div style={{
                fontSize: 13.5, fontWeight: 600,
                color: '#FAF7F0', lineHeight: 1.3,
              }}>
                {p.label}
              </div>
              <div style={{
                fontSize: 12.5, color: 'rgba(250,247,240,0.55)',
                marginTop: 3, lineHeight: 1.45,
              }}>
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pie — paw mark sutil */}
      <div style={{
        marginTop: 8, paddingTop: 18,
        borderTop: '1px solid rgba(255,255,255,0.10)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11.5, color: 'rgba(250,247,240,0.48)',
      }}>
        <FontAwesomeIcon icon={faPaw} style={{ fontSize: 10, color: AUTH_C.lime }} />
        Hecho con cuidado en Ibagué, Tolima
      </div>

      <style>{`
        @keyframes vp-auth-perk {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

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
      // Redirección post-login por rol. Si el usuario venía de una ruta
      // protegida (state.desde), respetamos esa ruta SOLO si su rol puede
      // accederla; sino lo mandamos al panel correspondiente a su rol.
      const rol = data.usuario?.rol;
      const homePorRol = {
        admin:        '/admin',
        superadmin:   '/admin',
        cajero:       '/cajero',
      };
      const destPorRol = homePorRol[rol] || '/';
      const desde = location.state?.desde;
      // Si venía de su zona, respetarlo; sino mandar al home de su rol.
      const dest = desde && (rol === 'cliente' || desde.startsWith(destPorRol)) ? desde : destPorRol;
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'No pudimos iniciar sesión. Verifica tus datos.';
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
    <AuthLayout breadcrumb="Iniciar sesión" welcomePanel={<WelcomePanel />}>
      <AuthCard shake={shake}>
        <h1 style={{
          margin: 0, fontSize: 28, fontWeight: 700, color: AUTH_C.fg,
          lineHeight: 1.1, letterSpacing: '-0.025em',
          fontFamily: '"General Sans", sans-serif',
        }}>
          Bienvenido de vuelta
        </h1>
        <p style={{
          margin: '8px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.55,
        }}>
          Ingresa para volver a tu cuenta.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 2, fontSize: 12.5,
          }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={recordar}
                onChange={(e) => setRec(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: AUTH_C.navy, cursor: 'pointer' }}
              />
              <span style={{ color: AUTH_C.fgSoft }}>Recordar sesión</span>
            </label>
            <Link
              to="/solicitar-reset"
              style={{ color: AUTH_C.navy, textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {errorGeneral && <AuthAlert>{errorGeneral}</AuthAlert>}

          <AuthCTA loading={cargando} icon={faArrowRight}>
            {cargando ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </AuthCTA>
        </form>

        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: 13.5, color: AUTH_C.fgSoft,
        }}>
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{ color: AUTH_C.navy, fontWeight: 700, textDecoration: 'none' }}
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
