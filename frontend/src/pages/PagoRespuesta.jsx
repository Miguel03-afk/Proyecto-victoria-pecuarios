import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import api from "../services/api";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

const TIPOS = {
  Aceptada:  "aprobada",
  Pendiente: "pendiente",
  Rechazada: "rechazada",
  Fallida:   "rechazada",
};

const getConfigTipo = (C) => ({
  aprobada: {
    icono:    "✅",
    titulo:   "¡Pago aprobado!",
    subtitulo:"Muchas gracias por confiar en nosotros. Próximamente recibirás la confirmación y detalle de tu pedido.",
    bg:       C.successBg,
    border:   C.successBorder,
    color:    C.success,
  },
  pendiente: {
    icono:    "⏳",
    titulo:   "Pago en revisión",
    subtitulo:"Tu pago está siendo verificado. Próximamente recibirás la confirmación y detalle de tu pedido.",
    bg:       C.warningBg,
    border:   C.warningBorder,
    color:    C.warning,
  },
  rechazada: {
    icono:    "❌",
    titulo:   "Pago no aprobado",
    subtitulo:"El pago fue rechazado o cancelado. Puedes intentarlo de nuevo cuando quieras.",
    bg:       C.dangerBg,
    border:   C.dangerBorder,
    color:    C.danger,
  },
});

const REDIRECCION_SEG = 6;

export default function PagoRespuesta() {
  const { C } = useTheme();
  const [params]    = useSearchParams();
  const { usuario } = useAuth();
  const { vaciar }  = useCarrito();
  const navigate    = useNavigate();

  const [estadoVerif, setEstadoVerif] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [cuenta,      setCuenta]      = useState(REDIRECCION_SEG);
  const finalizado = useRef(false);

  const xResponse = params.get("x_response") || params.get("x_transaction_state") || "";
  const codigo    = params.get("extra1")      || params.get("x_extra1") || "";
  const ref       = params.get("x_ref_payco") || "";
  const monto     = params.get("x_amount")    || "";
  const banco     = params.get("x_bank_name") || "";
  const fecha     = params.get("x_transaction_date") || "";
  const razon     = params.get("x_response_reason_text") || "";

  const tipo = TIPOS[xResponse] || "rechazada";
  const cfg  = getConfigTipo(C)[tipo];

  // Finalizar orden en el backend (una sola vez)
  useEffect(() => {
    if (!codigo || !usuario || finalizado.current) return;
    finalizado.current = true;
    setFinalizando(true);

    api.post("/pagos/finalizar-respuesta", {
      x_response,
      x_ref_payco:      ref,
      x_transaction_id: params.get("x_transaction_id") || "",
      x_amount:         monto,
      x_currency_code:  params.get("x_currency_code") || "COP",
      extra1:           codigo,
    })
      .then(({ data }) => {
        setEstadoVerif(data.estado);
        sessionStorage.removeItem("vp_pago_pendiente");
        // El carrito local se vacía SOLO cuando el pago fue efectivamente
        // procesado (aprobado o pendiente con orden creada). Si el usuario
        // canceló el widget de ePayco, este componente no se monta y el
        // carrito queda intacto — exactamente lo que queremos.
        if (data.estado === "pagada" || data.estado === "pendiente_pago") {
          vaciar();
        }
      })
      .catch(() => {})
      .finally(() => setFinalizando(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo, usuario]);

  // Cuenta regresiva y redirect automático para pagos aprobados/pendientes
  useEffect(() => {
    if (tipo === "rechazada") return;
    const interval = setInterval(() => {
      setCuenta(c => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/mis-ordenes");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tipo, navigate]);

  const estadoFinal = estadoVerif || (tipo === "aprobada" ? "pagada" : tipo === "pendiente" ? "pendiente_pago" : "rechazada");

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Banner superior */}
      <div style={{ background: C.brandDark, padding: "9px 0", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          Victoria Pets — Salud y bienestar animal
        </p>
      </div>

      <div style={{ minHeight: "calc(100vh - 38px)", background: C.canvas, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 520, animation: "fadeUp 0.45s ease" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              src={logoVP}
              alt="Victoria Pets"
              style={{ height: 64, objectFit: "contain", borderRadius: 14, display: "inline-block" }}
            />
          </div>

          {/* Tarjeta principal */}
          <div style={{
            background: C.surface,
            border: `1.5px solid ${cfg.border}`,
            borderRadius: 24,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: `0 8px 40px ${cfg.color}18`,
          }}>
            {/* Ícono */}
            <div style={{
              width: 76, height: 76, borderRadius: 22,
              background: cfg.bg, border: `2px solid ${cfg.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, margin: "0 auto 20px",
            }}>
              {cfg.icono}
            </div>

            <h1 style={{
              margin: "0 0 10px",
              fontFamily: "'General Sans', system-ui, sans-serif",
              fontSize: "clamp(24px,4vw,30px)", fontWeight: 700, color: C.text,
              letterSpacing: '-0.025em', lineHeight: 1.1,
            }}>
              {cfg.titulo}
            </h1>

            <p style={{ margin: "0 0 24px", fontSize: 14, color: C.textSec, lineHeight: 1.7, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
              {cfg.subtitulo}
            </p>

            {/* Detalle de la transacción */}
            {(codigo || ref || monto) && (
              <div style={{
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 14, padding: "16px 20px", marginBottom: 24,
                textAlign: "left",
              }}>
                {codigo && (
                  <Row label="Código de orden" value={<span style={{ fontFamily: "monospace", color: C.brand, fontWeight: 800, letterSpacing: 0.5 }}>{codigo}</span>} />
                )}
                {ref && (
                  <Row label="Ref. ePayco" value={<span style={{ fontFamily: "monospace", color: C.textSec }}>{ref}</span>} />
                )}
                {monto && (
                  <Row label="Monto cobrado" value={<span style={{ fontFamily: "monospace", fontWeight: 800 }}>{fmt(monto)}</span>} />
                )}
                {banco && <Row label="Banco / Método" value={banco} />}
                {fecha && <Row label="Fecha" value={fecha} last />}

                {/* Estado verificado */}
                {estadoVerif && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cfg.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: C.textMuted }}>Estado verificado</span>
                    <span style={{
                      fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11,
                      padding: "3px 10px", borderRadius: 20,
                      background: estadoFinal === "pagada" ? C.successBg : estadoFinal === "pendiente_pago" ? C.warningBg : C.dangerBg,
                      color:      estadoFinal === "pagada" ? C.success    : estadoFinal === "pendiente_pago" ? C.warning    : C.danger,
                    }}>
                      {estadoFinal === "pagada" ? "Aprobado" : estadoFinal === "pendiente_pago" ? "Pendiente" : "Rechazado"}
                    </span>
                  </div>
                )}

                {finalizando && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textMuted, justifyContent: "center" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.12)", borderTopColor: C.brand, display: "inline-block", animation: "spin 0.8s linear infinite" }}/>
                    Confirmando con el servidor...
                  </div>
                )}
              </div>
            )}

            {/* Razón de rechazo */}
            {tipo === "rechazada" && razon && (
              <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.danger, textAlign: "left" }}>
                <strong>Motivo:</strong> {razon}
              </div>
            )}

            {/* Cuenta regresiva */}
            {tipo !== "rechazada" && cuenta > 0 && (
              <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, animation: "pulse 1s ease infinite" }}>
                Serás redirigido a tus pedidos en <strong style={{ color: C.brand }}>{cuenta}s</strong>…
              </p>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              {tipo !== "rechazada" ? (
                <>
                  <Link to="/mis-ordenes"
                    style={{ display: "block", padding: "13px 0", borderRadius: 12, background: C.brand, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 800, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(10,107,64,0.22)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.brandMid; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.brand;    e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Ver mis pedidos
                  </Link>
                  <Link to="/tienda"
                    style={{ display: "block", padding: "11px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSec, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                    Seguir comprando
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/carrito"
                    style={{ display: "block", padding: "13px 0", borderRadius: 12, background: C.brand, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 800, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(10,107,64,0.22)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.brandMid; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.brand;    e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Intentar de nuevo
                  </Link>
                  <Link to="/tienda"
                    style={{ display: "block", padding: "11px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSec, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                    Volver a la tienda
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Nota de seguridad */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
            🔒 Pago procesado de forma segura por ePayco ·{" "}
            <a href="/" style={{ color: C.brand, textDecoration: "none" }}>Victoria Pets</a>
          </p>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, last }) {
  const { C } = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: last ? 0 : 8, fontSize: 13 }}>
      <span style={{ color: "#8FAA98", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#101F16" }}>{value}</span>
    </div>
  );
}
