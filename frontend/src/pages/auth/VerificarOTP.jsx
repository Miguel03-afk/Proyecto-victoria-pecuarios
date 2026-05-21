// src/pages/auth/VerificarOTP.jsx
// Verificación del código OTP de 6 dígitos enviado por email (Brevo).
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faTriangleExclamation, faCircleCheck,
  faClock, faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout, { AUTH_C, AuthCard } from "./AuthLayout";

const OTP_LEN = 6;
const RESEND_SECONDS = 5 * 60; // 5 minutos

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

  // Si no hay email en query, redirige a registro
  useEffect(() => {
    if (!email) {
      navigate('/registro', { replace: true });
    } else {
      // Auto-focus al primer input
      setTimeout(() => inputsRef.current[0]?.focus(), 80);
    }
  }, [email, navigate]);

  // Countdown del timer de reenvío
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
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const setDigitAt = (idx, val) => {
    setDigits(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const onDigitChange = (idx) => (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');
    if (errorGeneral) setErrorGeneral('');

    // Si pegan 6 dígitos juntos
    if (cleaned.length >= OTP_LEN) {
      const arr = cleaned.slice(0, OTP_LEN).split('');
      setDigits(arr);
      setTimeout(() => focusAt(OTP_LEN - 1), 0);
      return;
    }

    // 1 sólo dígito
    const ch = cleaned[0] || '';
    setDigitAt(idx, ch);
    if (ch && idx < OTP_LEN - 1) {
      setTimeout(() => focusAt(idx + 1), 0);
    }
  };

  const onDigitKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        setDigitAt(idx, '');
      } else if (idx > 0) {
        setTimeout(() => focusAt(idx - 1), 0);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      focusAt(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < OTP_LEN - 1) {
      e.preventDefault();
      focusAt(idx + 1);
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
      // Backend devuelve { token, usuario } al verificar OK
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
      // Limpia y vuelve al primer input
      setDigits(Array(OTP_LEN).fill(''));
      setTimeout(() => focusAt(0), 0);
    } finally {
      setCargando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando, completo, codigo, email]);

  // Auto-submit cuando se completan los 6 dígitos
  useEffect(() => {
    if (completo && !cargando) onSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completo]);

  const handleReenviar = async () => {
    if (reenviando || secondsLeft > 0) return;
    setReenviando(true);
    setErrorGeneral('');
    setOkMsg('');
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
    <AuthLayout breadcrumb="Verificar email">
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
          Confirma tu <span style={{ color: AUTH_C.lime }}>email</span>
        </h1>
        <p style={{
          margin: '10px 0 0', fontSize: 14, color: AUTH_C.fgSoft, lineHeight: 1.5,
        }}>
          Te enviamos un código de 6 dígitos a{' '}
          <strong style={{ color: AUTH_C.fg }}>{email}</strong>.
          Expira en 15 minutos.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 28 }}>
          {/* 6 inputs OTP */}
          <div
            onPaste={onPaste}
            style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              marginBottom: 16,
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
                  backgroundColor: AUTH_C.inputBg,
                  border: `1px solid ${d ? AUTH_C.lime : AUTH_C.inputBorder}`,
                  borderRadius: 12, color: AUTH_C.fg,
                  fontFamily: '"General Sans", system-ui, sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                  outline: 'none', padding: 0,
                }}
              />
            ))}
          </div>

          {/* Countdown / Reenviar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 4, fontSize: 12,
          }}>
            <span style={{
              color: AUTH_C.fgSoft, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: 11, color: AUTH_C.fgMuted }} />
              {secondsLeft > 0
                ? <>Reenviar código en <span className="vp-tabular" style={{ color: AUTH_C.fg, fontWeight: 600 }}>{fmtMmSs(secondsLeft)}</span></>
                : '¿No te llegó?'}
            </span>
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando || secondsLeft > 0}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontSize: 12, fontWeight: 700,
                color: secondsLeft > 0 ? AUTH_C.fgMuted : AUTH_C.lime,
                cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (secondsLeft === 0) e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              {reenviando ? 'Enviando…' : 'Reenviar código'}
            </button>
          </div>

          {/* Mensajes */}
          {errorGeneral && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 12,
              backgroundColor: 'rgba(230,57,70,0.12)',
              border: '1px solid rgba(230,57,70,0.32)',
              color: '#FCA5A5', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 14 }} />
              {errorGeneral}
            </div>
          )}
          {okMsg && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 12,
              backgroundColor: `${AUTH_C.lime}1F`,
              border: `1px solid ${AUTH_C.lime}55`,
              color: AUTH_C.lime, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 14 }} />
              {okMsg}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={cargando || !completo}
            className="vp-auth-cta"
            style={{
              marginTop: 20, height: 48, width: '100%',
              backgroundColor: (cargando || !completo) ? 'rgba(255,255,255,0.3)' : '#fff',
              color: AUTH_C.card, fontWeight: 700, borderRadius: 999,
              fontSize: 14, border: 'none',
              cursor: (cargando || !completo) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {cargando ? 'Verificando…' : (
              <>
                Verificar <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </>
            )}
          </button>
        </form>

        {/* Cambiar email */}
        <div style={{
          marginTop: 20, textAlign: 'center', fontSize: 13,
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
