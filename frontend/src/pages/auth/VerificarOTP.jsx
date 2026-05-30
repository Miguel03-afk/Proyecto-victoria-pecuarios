// src/pages/auth/VerificarOTP.jsx
// Verificación del código OTP de 6 dígitos enviado por email (Brevo).
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faClock, faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout, { AUTH_C, AuthCard, AuthCTA, AuthAlert } from "./AuthLayout";

const OTP_LEN = 6;
const RESEND_SECONDS = 5 * 60;

function fmtMmSs(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VerificarOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(Array(OTP_LEN).fill(''));
  const [errorGeneral, setErrorGeneral] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/registro', { replace: true });
    } else {
      setTimeout(() => inputsRef.current[0]?.focus(), 80);
    }
  }, [email, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const focusAt = (idx) => {
    const el = inputsRef.current[idx];
    if (el) { el.focus(); el.select?.(); }
  };

  const setDigitAt = (idx, val) => {
    setDigits(prev => { const next = [...prev]; next[idx] = val; return next; });
  };

  const onDigitChange = (idx) => (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');
    if (errorGeneral) setErrorGeneral('');

    if (cleaned.length >= OTP_LEN) {
      const arr = cleaned.slice(0, OTP_LEN).split('');
      setDigits(arr);
      setTimeout(() => focusAt(OTP_LEN - 1), 0);
      return;
    }
    const ch = cleaned[0] || '';
    setDigitAt(idx, ch);
    if (ch && idx < OTP_LEN - 1) setTimeout(() => focusAt(idx + 1), 0);
  };

  const onDigitKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) setDigitAt(idx, '');
      else if (idx > 0) setTimeout(() => focusAt(idx - 1), 0);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault(); focusAt(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < OTP_LEN - 1) {
      e.preventDefault(); focusAt(idx + 1);
    }
  };

  const onPaste = (e) => {
    const text = e.clipboardData?.getData('text') || '';
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LEN);
    if (cleaned.length === 0) return;
    e.preventDefault();
    const arr = cleaned.padEnd(OTP_LEN, '').split('').slice(0, OTP_LEN);
    setDigits(arr);
    const lastIdx = Math.min(cleaned.length, OTP_LEN) - 1;
    setTimeout(() => focusAt(lastIdx), 0);
  };

  const codigo = digits.join('');
  const completo = codigo.length === OTP_LEN;

  const onSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (cargando || !completo) return;

    setCargando(true);
    setErrorGeneral('');
    try {
      const { data } = await api.post('/auth/verificar-email', { email, codigo });
      if (data?.token && data?.usuario) {
        login(data.token, data.usuario);
        setOkMsg('¡Verificado! Redirigiendo…');
        setTimeout(() => navigate('/', { replace: true }), 600);
      } else {
        setOkMsg('Email verificado. Inicia sesión para continuar.');
        setTimeout(() => navigate('/login', { replace: true }), 1000);
      }
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'Código incorrecto o expirado.');
      triggerShake();
      setDigits(Array(OTP_LEN).fill(''));
      setTimeout(() => focusAt(0), 0);
    } finally {
      setCargando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, completo, codigo, email]);

  useEffect(() => {
    if (completo && !cargando) onSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completo]);

  const handleReenviar = async () => {
    if (reenviando || secondsLeft > 0) return;
    setReenviando(true);
    setErrorGeneral(''); setOkMsg('');
    try {
      await api.post('/auth/reenviar-codigo', { email });
      setOkMsg('Te enviamos un nuevo código.');
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LEN).fill(''));
      setTimeout(() => focusAt(0), 0);
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'No pudimos reenviar el código.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <AuthLayout breadcrumb="Verificar email" heroStep={3}>
      <AuthCard shake={shake}>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 600, color: AUTH_C.fg,
          lineHeight: 1.1, letterSpacing: '-0.025em',
        }}>
          Confirma tu email
        </h1>
        <p style={{
          margin: '8px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.55,
        }}>
          Te enviamos un código de 6 dígitos a{' '}
          <strong style={{ color: AUTH_C.fg }}>{email}</strong>.
          Expira en 15 minutos.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 28 }}>
          <div
            onPaste={onPaste}
            style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              marginBottom: 14,
            }}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={d}
                onChange={onDigitChange(i)}
                onKeyDown={onDigitKeyDown(i)}
                onFocus={(e) => e.target.select()}
                disabled={cargando}
                aria-label={`Dígito ${i + 1}`}
                className="vp-auth-input vp-tabular"
                style={{
                  flex: 1, height: 56, minWidth: 0,
                  textAlign: 'center', fontSize: 24, fontWeight: 700,
                  backgroundColor: AUTH_C.surface,
                  border: `1.5px solid ${d ? AUTH_C.navy : AUTH_C.inputBorder}`,
                  borderRadius: 12, color: AUTH_C.fg,
                  fontFamily: 'inherit',
                  fontVariantNumeric: 'tabular-nums',
                  outline: 'none', padding: 0,
                }}
              />
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 4, fontSize: 12.5,
          }}>
            <span style={{
              color: AUTH_C.fgSoft, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: 11, color: AUTH_C.fgMuted }} />
              {secondsLeft > 0
                ? <>Reenviar en <span className="vp-tabular" style={{ color: AUTH_C.fg, fontWeight: 600 }}>{fmtMmSs(secondsLeft)}</span></>
                : '¿No te llegó?'}
            </span>
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando || secondsLeft > 0}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontSize: 12.5, fontWeight: 700,
                color: secondsLeft > 0 ? AUTH_C.fgMuted : AUTH_C.navy,
                cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (secondsLeft === 0) e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              {reenviando ? 'Enviando…' : 'Reenviar código'}
            </button>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {errorGeneral && <AuthAlert type="error">{errorGeneral}</AuthAlert>}
            {okMsg        && <AuthAlert type="success">{okMsg}</AuthAlert>}

            <AuthCTA loading={cargando} disabled={!completo} icon={faArrowRight}>
              {cargando ? 'Verificando…' : 'Verificar'}
            </AuthCTA>
          </div>
        </form>

        <div style={{
          marginTop: 22, textAlign: 'center', fontSize: 13.5,
        }}>
          <Link
            to="/registro"
            style={{
              color: AUTH_C.fgSoft, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = AUTH_C.fg)}
            onMouseLeave={(e) => (e.currentTarget.style.color = AUTH_C.fgSoft)}
          >
            <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 11 }} />
            Cambiar email
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
