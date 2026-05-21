// src/components/ChatbotWidget.jsx
import { useState, useEffect, useRef } from "react";

const CHATBOT_WEBHOOK_URL = "https://aleyep.app.n8n.cloud/webhook/coco-chat";

const C = {
  navy:    "#1E3A8A",
  navyDk:  "#152A66",
  lime:    "#7BC142",
  limeDk:  "#5FA02E",
  crema:   "#FAF7F0",
  texto:   "#1F2937",
  textoSec:"#6B7280",
  borde:   "#E5E7EB",
  blanco:  "#FFFFFF",
  shadow:  "rgba(30, 58, 138, 0.18)",
  shadowL: "rgba(30, 58, 138, 0.08)",
};

const SALUDO_INICIAL =
  "¡Hola! Soy Coco 🐶, el asistente virtual de Victoria Pets. ¿En qué te puedo ayudar hoy? Puedo contarte sobre nuestros servicios, productos o ayudarte a agendar una cita.";

/* Easing token alineado con Emil Kowalski: strong ease-out */
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const KEYFRAMES = `
@keyframes coco-fadeup {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes coco-pop {
  /* Nunca animar desde scale(0) — nada en la realidad aparece de la nada.
     Empezamos en 0.9 (visible) y suavizamos sin bounce excesivo. */
  0%   { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes coco-dot {
  0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
  30%           { transform: translateY(-5px); opacity: 1;   }
}
@keyframes coco-pulse {
  0%   { box-shadow: 0 6px 20px ${C.shadow}, 0 0 0 0   rgba(123, 193, 66, 0.45); }
  70%  { box-shadow: 0 6px 20px ${C.shadow}, 0 0 0 14px rgba(123, 193, 66, 0);    }
  100% { box-shadow: 0 6px 20px ${C.shadow}, 0 0 0 0   rgba(123, 193, 66, 0);    }
}
/* Hover-scale solo en dispositivos con puntero fino (no en touch).
   Evita el "salto" visual cuando un usuario táctil toca el botón. */
@media (hover: hover) and (pointer: fine) {
  .coco-fab:hover { transform: scale(1.06); }
}
`;

function DogAvatar({ size = 32, color = C.navy }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <ellipse cx="14" cy="20" rx="8" ry="13" fill={color} transform="rotate(-25 14 20)" />
      <ellipse cx="50" cy="20" rx="8" ry="13" fill={color} transform="rotate(25 50 20)" />
      <circle  cx="32" cy="34" r="20" fill={color} />
      <ellipse cx="32" cy="42" rx="10" ry="7" fill={C.crema} />
      <ellipse cx="32" cy="37" rx="3"  ry="2.2" fill={C.texto} />
      <circle  cx="24" cy="30" r="2.5" fill={C.texto} />
      <circle  cx="24.8" cy="29.2" r="0.9" fill={C.blanco} />
      <circle  cx="40" cy="30" r="2.5" fill={C.texto} />
      <circle  cx="40.8" cy="29.2" r="0.9" fill={C.blanco} />
      <path    d="M28 44 Q32 47 36 44" stroke={C.texto} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function getOrCreateSessionId() {
  const generar = () =>
    "sess_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now();
  try {
    let id = sessionStorage.getItem("coco_session_id");
    if (!id) {
      id = generar();
      sessionStorage.setItem("coco_session_id", id);
    }
    return id;
  } catch {
    return generar();
  }
}

export default function ChatbotWidget() {
  const [abierto, setAbierto]     = useState(false);
  const [mensajes, setMensajes]   = useState([
    { from: "bot", text: SALUDO_INICIAL, ts: Date.now() },
  ]);
  const [input, setInput]         = useState("");
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState("");

  const sessionIdRef = useRef(getOrCreateSessionId());
  const scrollRef    = useRef(null);
  const inputRef     = useRef(null);

  /* Auto-scroll al fondo cuando llegan mensajes o aparece "escribiendo" */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, enviando, abierto]);

  /* Cerrar con Escape */
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => { if (e.key === "Escape") setAbierto(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  /* Focus al input al abrir el chat */
  useEffect(() => {
    if (abierto) {
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [abierto]);

  const handleInput = (e) => {
    let v = e.target.value;
    if (v.length > 500) {
      v = v.slice(0, 500);
      setError("Máximo 500 caracteres.");
    } else if (error) {
      setError("");
    }
    setInput(v);
    // autoexpand del textarea (max 100px)
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || enviando) return;

    setInput("");
    setError("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg = { from: "user", text: texto, ts: Date.now() };
    setMensajes((prev) => [...prev, userMsg]);
    setEnviando(true);

    const historial = [...mensajes, userMsg]
      .slice(-10)
      .map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(CHATBOT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:   texto,
          sessionId: sessionIdRef.current,
          historial,
        }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const respuesta =
        (data && (data.respuesta || data.message || data.text)) ||
        "Lo siento, no pude generar una respuesta esta vez.";
      setMensajes((prev) => [
        ...prev,
        { from: "bot", text: respuesta, ts: Date.now() },
      ]);
    } catch (err) {
      clearTimeout(tid);
      const errorText =
        err.name === "AbortError"
          ? "La respuesta tardó demasiado. Intenta de nuevo, por favor."
          : "Uy, tuve un problema. Intenta de nuevo en un momento.";
      setMensajes((prev) => [
        ...prev,
        { from: "bot", text: errorText, ts: Date.now() },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const puedeEnviar = input.trim().length > 0 && !enviando;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Botón flotante (estado cerrado) ─────────────────────────────── */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir chat con Coco"
          className="coco-fab"
          style={{
            position: "fixed",
            right: 24, bottom: 24,
            zIndex: 9999,
            width: 64, height: 64,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 20px ${C.shadow}`,
            animation: "coco-pulse 2.4s infinite",
            transition: `transform 180ms ${EASE_OUT}`,
          }}
        >
          <DogAvatar size={38} color={C.blanco} />
          {/* Indicador online */}
          <span
            style={{
              position: "absolute",
              top: 6, right: 6,
              width: 14, height: 14,
              borderRadius: "50%",
              background: C.lime,
              border: `2px solid ${C.blanco}`,
            }}
          />
        </button>
      )}

      {/* ── Panel abierto ────────────────────────────────────────────────── */}
      {abierto && (
        <div
          role="dialog"
          aria-label="Chat con Coco"
          style={{
            position: "fixed",
            right: 24, bottom: 24,
            zIndex: 9999,
            width:  "min(380px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 48px))",
            background: C.blanco,
            borderRadius: 20,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: `0 20px 50px ${C.shadow}, 0 8px 24px ${C.shadowL}`,
            animation: `coco-fadeup 250ms ${EASE_OUT}`,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
              borderBottom: `3px solid ${C.lime}`,
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: C.blanco,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                animation: `coco-pop 220ms ${EASE_OUT}`,
              }}
            >
              <DogAvatar size={30} color={C.navy} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  color: C.blanco, fontWeight: 700, fontSize: 16,
                  lineHeight: 1.1,
                }}
              >
                Coco
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: C.lime,
                    boxShadow: "0 0 0 2px rgba(123,193,66,0.25)",
                  }}
                />
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12, marginTop: 3,
                }}
              >
                Asistente · Victoria Pets
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "none", cursor: "pointer",
                color: C.blanco, fontSize: 22, fontWeight: 400,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: "auto",
              padding: "16px 14px",
              background: C.crema,
              display: "flex", flexDirection: "column", gap: 10,
            }}
          >
            {mensajes.map((m, i) => (
              <Mensaje key={i} from={m.from} text={m.text} />
            ))}
            {enviando && <TypingIndicator />}
          </div>

          {/* Error de validación */}
          {error && (
            <div
              style={{
                padding: "6px 14px",
                background: "#FEF2F2", color: "#B91C1C",
                fontSize: 11.5, fontWeight: 500,
                borderTop: "1px solid #FECACA",
              }}
            >
              {error}
            </div>
          )}

          {/* Footer / Input */}
          <div
            style={{
              borderTop: `1px solid ${C.borde}`,
              background: C.blanco,
              padding: "10px 12px 8px",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "flex-end", gap: 8,
                background: C.crema,
                borderRadius: 14,
                padding: "6px 6px 6px 12px",
                border: `1px solid ${C.borde}`,
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                placeholder="Escríbele a Coco…"
                disabled={enviando}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", resize: "none",
                  fontSize: 13.5, lineHeight: 1.45,
                  color: C.texto,
                  fontFamily: "inherit",
                  padding: "7px 0",
                  maxHeight: 100, overflowY: "auto",
                }}
              />
              <button
                onClick={enviar}
                disabled={!puedeEnviar}
                aria-label="Enviar mensaje"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  flexShrink: 0,
                  border: "none",
                  cursor: puedeEnviar ? "pointer" : "default",
                  background: puedeEnviar
                    ? `linear-gradient(135deg, ${C.lime} 0%, ${C.limeDk} 100%)`
                    : "#D1D5DB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.15s, opacity 0.15s",
                  opacity: puedeEnviar ? 1 : 0.7,
                }}
                onMouseEnter={(e) => {
                  if (puedeEnviar) e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 19V5M5 12l7-7 7 7"
                    stroke="#FFFFFF"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div
              style={{
                fontSize: 10.5, color: C.textoSec,
                textAlign: "center", marginTop: 6, lineHeight: 1.35,
              }}
            >
              Coco es un asistente virtual. Para diagnósticos médicos, consulta siempre con un veterinario.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Burbuja de mensaje (usuario o bot) ─────────────────────────────────── */
function Mensaje({ from, text }) {
  const isUser = from === "user";
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        justifyContent: isUser ? "flex-end" : "flex-start",
        animation: `coco-fadeup 250ms ${EASE_OUT}`,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: C.navy,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <DogAvatar size={20} color={C.blanco} />
        </div>
      )}
      <div
        style={{
          maxWidth: "76%",
          padding: "9px 13px",
          fontSize: 13.5,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: isUser ? C.navy : C.blanco,
          color:      isUser ? C.blanco : C.texto,
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          boxShadow: isUser ? "none" : `0 1px 3px ${C.shadowL}`,
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* ── Indicador "escribiendo…" con 3 puntos animados ─────────────────────── */
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex", gap: 8, alignItems: "flex-end",
        animation: `coco-fadeup 250ms ${EASE_OUT}`,
      }}
    >
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: C.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <DogAvatar size={20} color={C.blanco} />
      </div>
      <div
        style={{
          padding: "11px 14px",
          background: C.blanco,
          borderRadius: "16px 16px 16px 4px",
          boxShadow: `0 1px 3px ${C.shadowL}`,
          display: "flex", gap: 4, alignItems: "center",
        }}
      >
        {[0, 0.15, 0.30].map((d, i) => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: C.navy,
              display: "inline-block",
              animation: `coco-dot 1.2s ${d}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
