// src/pages/MisOrdenes.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faChevronDown, faChevronUp, faReceipt,
  faLocationDot, faCreditCard, faMoneyBillWave, faTruck,
  faCircleCheck, faClock, faCircleXmark, faSpinner,
  faShoppingBag, faUser, faStore,
  faTag, faCalendarDays, faMobileScreen, faHashtag,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";
import { useTheme } from "../styles/ThemeProvider.jsx";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "—";

/* ─── Global styles ─────────────────────────────────────────────── */
const STYLES = `
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  *, *::before, *::after { box-sizing: border-box; }

  .vp-orden-card {
    background: var(--vp-surface);
    border-radius: 18px;
    overflow: hidden;
    border: 1.5px solid var(--vp-border);
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }
  .vp-orden-card.open {
    border-color: var(--vp-brand-border);
    box-shadow: 0 4px 24px rgba(15,37,99,0.09);
  }

  .vp-orden-btn {
    width: 100%; display: flex; align-items: center;
    padding: 17px 20px; gap: 16px; cursor: pointer;
    background: none; border: none; text-align: left;
    transition: background 140ms ease;
    font-family: inherit;
  }
  .vp-orden-btn:hover { background: rgba(30,58,138,0.03); }

  .vp-info-chip {
    padding: 11px 14px; border-radius: 12px;
    transition: background 140ms ease;
  }

  .vp-step-dot {
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    transition: all 200ms cubic-bezier(0.23,1,0.32,1);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .vp-orden-btn   { padding: 13px 15px !important; gap: 12px !important; }
    .vp-orden-icon  { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
    .vp-orden-total { font-size: 15px !important; }
    .vp-orden-code  { font-size: 12px !important; }
    .vp-header-btns { flex-direction: column !important; }
  }
`;

/* ─── Config de estados ─────────────────────────────────────────── */
const ESTADOS = {
  pendiente:      { bg: "#fef9c3", text: "#854d0e", border: "#fde047", label: "Pendiente",      icon: faClock       },
  pendiente_pago: { bg: "#fff7ed", text: "#9a3412", border: "#fdba74", label: "Pago pendiente", icon: faClock       },
  pagada:         { bg: "#dcfce7", text: "#14532d", border: "#86efac", label: "Pagada",         icon: faCircleCheck },
  procesando:     { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe", label: "Procesando",     icon: faSpinner     },
  enviada:        { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc", label: "Enviada",        icon: faTruck       },
  entregada:      { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", label: "Entregada",      icon: faCircleCheck },
  cancelada:      { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Cancelada",      icon: faCircleXmark },
  rechazada:      { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Rechazada",      icon: faCircleXmark },
};

const METODOS = {
  epayco:        { label: "ePayco",        icon: faCreditCard   },
  efectivo:      { label: "Contraentrega", icon: faMoneyBillWave},
  transferencia: { label: "Transferencia", icon: faMobileScreen },
};

const PASOS = ["pendiente", "pagada", "procesando", "enviada", "entregada"];

/* ─── Badge de estado ───────────────────────────────────────────── */
function Badge({ estado }) {
  const s = ESTADOS[estado] || ESTADOS.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      <FontAwesomeIcon icon={s.icon} style={{ fontSize: 10 }} />
      {s.label}
    </span>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────── */
function Skeleton() {
  const { C } = useTheme();
  return (
    <div style={{ background: C.surface, borderRadius: 18, padding: 20, border: `1.5px solid ${C.border}` }}>
      {[60, 40, 80].map(w => (
        <div key={w} style={{ height: 12, width: `${w}%`, borderRadius: 6, background: C.brandSoft, marginBottom: 10, animation: "pulse 1.5s ease infinite" }} />
      ))}
    </div>
  );
}

/* ─── Verificar pago ePayco ─────────────────────────────────────── */
function VerificarPago({ orden, onConfirmada }) {
  const { C } = useTheme();
  const [ref,        setRef]        = useState("");
  const [cargando,   setCargando]   = useState(false);
  const [resultado,  setResultado]  = useState(null);
  const [error,      setError]      = useState("");
  const [sinValidar, setSinValidar] = useState(false);

  const verificar = async (forzar = false) => {
    if (!ref.trim()) return;
    setCargando(true); setError(""); setResultado(null); setSinValidar(false);
    try {
      const { data } = await api.post("/pagos/verificar-epayco", {
        ref_payco: ref.trim(), codigo: orden.codigo, forzar,
      });
      if (data.epayco_sin_validar) {
        setSinValidar(true);
      } else {
        setResultado(data.estado);
        if (data.estado === "pagada") {
          sessionStorage.removeItem("vp_pago_pendiente");
          setTimeout(() => onConfirmada(orden.id), 1400);
        }
      }
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo verificar. Revisa la referencia.");
    } finally { setCargando(false); }
  };

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #fdba74", background: "#fff7ed" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #fde8c8", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#ff6b00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FontAwesomeIcon icon={faReceipt} style={{ color: "#fff", fontSize: 14 }} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#9a3412" }}>¿Ya pagaste en ePayco?</p>
          <p style={{ margin: 0, fontSize: 11, color: "#c2410c" }}>Ingresa la referencia de tu recibo para confirmar</p>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9a3412" }}>
          Busca el número de <strong>Recibo</strong> o <strong>Referencia ePayco</strong> y pégalo aquí:
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <FontAwesomeIcon icon={faHashtag} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#fdba74", fontSize: 12 }} />
            <input
              value={ref} onChange={e => setRef(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verificar()}
              placeholder="Ej: 363733641"
              style={{
                width: "100%", padding: "9px 12px 9px 30px",
                borderRadius: 10, border: `1.5px solid ${ref ? "#fdba74" : "#fde8c8"}`,
                fontSize: 13, outline: "none", fontFamily: "monospace",
                background: C.surface, color: C.text,
                transition: "border-color 140ms ease",
              }}
            />
          </div>
          <button
            onClick={() => verificar(false)}
            disabled={cargando || !ref.trim()}
            style={{
              padding: "9px 18px", borderRadius: 10, border: "none",
              background: cargando || !ref.trim() ? C.textMuted : C.navy,
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: cargando || !ref.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 160ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)",
              fontFamily: "inherit",
            }}>
            {cargando
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Verificando…</>
              : <><FontAwesomeIcon icon={faCircleCheck} /> Confirmar</>}
          </button>
        </div>

        {sinValidar && (
          <div style={{ marginTop: 10, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 12px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              ⚠ ePayco no pudo validar automáticamente. ¿Confirmar el pago manualmente?
            </p>
            <button onClick={() => verificar(true)} disabled={cargando}
              style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#d97706", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {cargando ? "Confirmando…" : "Sí, confirmar pago"}
            </button>
          </div>
        )}

        {resultado === "pagada" && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#dcfce7", color: "#14532d", fontSize: 12, fontWeight: 700 }}>
            <FontAwesomeIcon icon={faCircleCheck} /> ¡Pago confirmado! Tu orden ha sido actualizada.
          </div>
        )}
        {resultado === "pendiente_pago" && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#fff7ed", color: "#9a3412", fontSize: 12 }}>
            <FontAwesomeIcon icon={faClock} /> El pago aún está en revisión en ePayco.
          </div>
        )}
        {resultado === "rechazada" && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#fee2e2", color: "#7f1d1d", fontSize: 12 }}>
            <FontAwesomeIcon icon={faCircleXmark} /> ePayco reporta este pago como rechazado.
          </div>
        )}
        {error && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#fee2e2", color: "#7f1d1d", fontSize: 12 }}>
            <FontAwesomeIcon icon={faCircleXmark} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Página principal ──────────────────────────────────────────── */
export default function MisOrdenes() {
  const { C } = useTheme();
  const [ordenes,   setOrdenes]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [abierta,   setAbierta]   = useState(null);
  const [itemsMap,  setItemsMap]  = useState({});
  const [cargItems, setCargItems] = useState({});

  // Set CSS vars for class-based styles
  const cssVars = {
    "--vp-surface":      C.surface,
    "--vp-border":       C.border,
    "--vp-brand-border": C.brandBorder,
  };

  const cargarOrdenes = () =>
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data.map(o => ({ ...o, estado: (o.estado || "").toLowerCase() }))))
      .catch(() => {});

  useEffect(() => { cargarOrdenes().finally(() => setCargando(false)); }, []);

  const abrirOrden = (id) => {
    const nueva = abierta === id ? null : id;
    setAbierta(nueva);
    if (nueva && !itemsMap[nueva]) {
      setCargItems(p => ({ ...p, [nueva]: true }));
      api.get(`/auth/mis-ordenes/${nueva}`)
        .then(({ data }) => setItemsMap(p => ({ ...p, [nueva]: data.items || [] })))
        .catch(() => setItemsMap(p => ({ ...p, [nueva]: [] })))
        .finally(() => setCargItems(p => ({ ...p, [nueva]: false })));
    }
  };

  const confirmarOrden = (id) => {
    cargarOrdenes();
    setItemsMap(p => { const c = { ...p }; delete c[id]; return c; });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, ...cssVars }}>
      <style>{STYLES}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
        padding: "44px 24px 36px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blob */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -80, right: -60,
          width: 280, height: 280, borderRadius: 999,
          background: `radial-gradient(circle, ${C.lime}2A 0%, transparent 65%)`,
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", bottom: -60, left: -40,
          width: 200, height: 200, borderRadius: 999,
          background: `radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)`,
          filter: "blur(30px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 940, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Back link */}
          <Link to="/perfil" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11.5, color: "rgba(255,255,255,0.45)", textDecoration: "none",
            marginBottom: 22, fontWeight: 500,
            transition: "color 140ms ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.78)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} />
            Mi perfil
          </Link>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              {/* Eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 10.5, fontWeight: 800,
                color: C.lime, letterSpacing: "0.18em",
                textTransform: "uppercase", marginBottom: 10,
              }}>
                <span style={{ width: 20, height: 1, backgroundColor: C.lime }} />
                <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 11 }} />
                Historial de compras
              </div>

              <h1 style={{
                margin: 0,
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontWeight: 700, fontSize: "clamp(30px, 4vw, 42px)",
                color: "#FAF7F0", letterSpacing: "-0.025em", lineHeight: 1.05,
              }}>
                Mis órdenes
              </h1>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, maxWidth: 460 }}>
                Todas tus compras en un solo lugar. Verifica pagos, revisa detalles y sigue tus envíos.
              </p>
            </div>

            {/* CTAs */}
            <div className="vp-header-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/perfil" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 12, textDecoration: "none",
                background: "rgba(255,255,255,0.09)", color: "#fff",
                fontSize: 13, fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                transition: "background 160ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.17)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <FontAwesomeIcon icon={faUser} style={{ fontSize: 12 }} /> Mi perfil
              </Link>
              <Link to="/tienda" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 12, textDecoration: "none",
                background: C.lime, color: C.navyDeep,
                fontSize: 13, fontWeight: 800,
                boxShadow: `0 8px 20px -6px ${C.lime}88`,
                transition: "background 160ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.limeDark; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.lime; e.currentTarget.style.color = C.navyDeep; e.currentTarget.style.transform = "translateY(0)"; }}>
                <FontAwesomeIcon icon={faStore} style={{ fontSize: 12 }} /> Ver tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "36px 20px 72px" }}>
        {cargando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : ordenes.length === 0 ? (
          /* Estado vacío */
          <div style={{ textAlign: "center", padding: "72px 24px", animation: "fadeUp 350ms cubic-bezier(0.23,1,0.32,1)" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: C.brandSoft, border: `1px solid ${C.brandBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 34, color: C.navy }} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'General Sans', sans-serif" }}>
              No tienes órdenes aún
            </h3>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>
              Cuando realices una compra, aparecerá aquí con todos los detalles.
            </p>
            <Link to="/tienda" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 12, textDecoration: "none",
              background: C.navy, color: "#fff", fontWeight: 700, fontSize: 14,
              boxShadow: `0 4px 16px rgba(15,37,99,0.22)`,
              transition: "background 160ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,37,99,0.30)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,37,99,0.22)"; }}>
              <FontAwesomeIcon icon={faStore} /> Explorar tienda
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: C.textMuted }}>
              {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} registrada{ordenes.length !== 1 ? "s" : ""}
            </p>

            {ordenes.map((o, oi) => {
              const estado  = (o.estado || "pendiente").toLowerCase();
              const metodo  = (o.metodo_pago || "").toLowerCase();
              const abierto = abierta === o.id;
              const est     = ESTADOS[estado] || ESTADOS.pendiente;
              const met     = METODOS[metodo] || { label: o.metodo_pago || "—", icon: faCreditCard };
              const pasoIdx = PASOS.indexOf(estado);
              const items   = itemsMap[o.id];

              return (
                <div
                  key={o.id}
                  className={`vp-orden-card${abierto ? " open" : ""}`}
                  style={{ animation: `fadeUp 220ms cubic-bezier(0.23,1,0.32,1) ${oi * 50}ms both` }}
                >
                  {/* ── Fila principal ── */}
                  <button className="vp-orden-btn" onClick={() => abrirOrden(o.id)}>
                    {/* Ícono */}
                    <div className="vp-orden-icon" style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: est.bg, border: `1.5px solid ${est.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FontAwesomeIcon icon={est.icon} style={{ color: est.text, fontSize: 16 }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                        <span className="vp-orden-code" style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: C.navy }}>
                          {o.codigo}
                        </span>
                        <Badge estado={estado} />
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 10, color: C.textTer }} /> {fdoc(o.created_at)}
                        </span>
                        <span style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={met.icon} style={{ fontSize: 10, color: C.textTer }} /> {met.label}
                        </span>
                        {o.items > 0 && (
                          <span style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                            <FontAwesomeIcon icon={faTag} style={{ fontSize: 10, color: C.textTer }} /> {o.items} producto{o.items !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span className="vp-orden-total" style={{ fontSize: 17, fontWeight: 800, color: C.text, fontVariantNumeric: "tabular-nums" }}>
                        {fmt(o.total)}
                      </span>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: abierto ? C.brandSoft : C.surfaceAlt,
                        border: `1px solid ${abierto ? C.brandBorder : C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 140ms ease, border-color 140ms ease",
                        flexShrink: 0,
                      }}>
                        <FontAwesomeIcon
                          icon={abierto ? faChevronUp : faChevronDown}
                          style={{ color: abierto ? C.navy : C.textMuted, fontSize: 11, transition: "color 140ms ease" }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* ── Detalle expandido ── */}
                  {abierto && (
                    <div style={{ borderTop: `1px solid ${C.brandBorder}`, padding: "22px 20px 24px", animation: "fadeUp 200ms cubic-bezier(0.23,1,0.32,1)" }}>

                      {/* Verificar pago */}
                      {["pendiente", "pendiente_pago"].includes(estado) && (
                        <div style={{ marginBottom: 20 }}>
                          <VerificarPago orden={o} onConfirmada={confirmarOrden} />
                        </div>
                      )}

                      {/* Banner ENVIADA */}
                      {estado === "enviada" && (
                        <div style={{
                          marginBottom: 20, padding: "20px 22px", borderRadius: 16,
                          background: `linear-gradient(135deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
                          color: "#fff", position: "relative", overflow: "hidden",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative", zIndex: 2 }}>
                            <FontAwesomeIcon icon={faTruck} style={{ fontSize: 18, color: "#bfdbfe" }} />
                            <div>
                              <p style={{ margin: 0, fontSize: 10.5, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>En camino</p>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Pedido enviado · Esperando confirmación de entrega</p>
                            </div>
                          </div>
                          <div style={{
                            padding: "16px 18px", borderRadius: 12,
                            background: "rgba(255,255,255,0.10)", border: "1px dashed rgba(255,255,255,0.28)",
                            position: "relative", zIndex: 2,
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
                          }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: 1.5 }}>Código de entrega</p>
                              <p style={{ margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>
                                {o.codigo}
                              </p>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.80)", lineHeight: 1.55, maxWidth: 220 }}>
                              Cuando llegue el repartidor, dale este código para confirmar tu compra.
                            </p>
                          </div>
                          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${C.lime}0D` }} />
                        </div>
                      )}

                      {/* Banner ENTREGADA */}
                      {estado === "entregada" && (
                        <div style={{
                          marginBottom: 20, padding: "22px 24px", borderRadius: 16,
                          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDeep} 100%)`,
                          color: "#fff", textAlign: "center", position: "relative", overflow: "hidden",
                        }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: `rgba(123,193,67,0.22)`, border: `1px solid ${C.lime}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, margin: "0 auto 12px", color: C.lime,
                          }}>
                            ✓
                          </div>
                          <h3 style={{
                            margin: "0 0 5px",
                            fontFamily: "'General Sans', sans-serif",
                            fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em",
                          }}>
                            ¡Gracias por preferirnos!
                          </h3>
                          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                            Tu pedido <strong style={{ fontFamily: "monospace" }}>{o.codigo}</strong> fue entregado. Esperamos verte pronto.
                          </p>
                        </div>
                      )}

                      {/* Info chips */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 10, marginBottom: 22 }}>
                        {[
                          { icon: faCalendarDays, label: "Fecha",     val: fdoc(o.created_at) },
                          { icon: est.icon,       label: "Estado",    val: est.label, color: est.text, bg: est.bg },
                          { icon: met.icon,       label: "Método",    val: met.label },
                          ...(o.direccion_entrega ? [{ icon: faLocationDot, label: "Dirección", val: o.direccion_entrega }] : []),
                          ...(o.ciudad_entrega    ? [{ icon: faLocationDot, label: "Ciudad",    val: o.ciudad_entrega }]    : []),
                        ].map(({ icon, label, val, color, bg }) => (
                          <div key={label} className="vp-info-chip" style={{
                            background: bg || C.surfaceAlt,
                            border: `1px solid ${color ? `${color}22` : C.borderMed}`,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                              <FontAwesomeIcon icon={icon} style={{ fontSize: 10, color: color || C.textMuted }} />
                              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: color || C.textMuted }}>
                                {label}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: color || C.text }}>{val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Productos */}
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.brandSoft, border: `1px solid ${C.brandBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FontAwesomeIcon icon={faShoppingBag} style={{ color: C.navy, fontSize: 12 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: C.textTer }}>
                            Productos del pedido
                          </span>
                        </div>

                        {cargItems[o.id] ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[1, 2].map(i => (
                              <div key={i} style={{ height: 46, borderRadius: 10, background: C.surfaceAlt, animation: "pulse 1.5s ease infinite" }} />
                            ))}
                          </div>
                        ) : items?.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {items.map((it, idx) => (
                              <div key={idx} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 14px", borderRadius: 12,
                                background: C.canvas, border: `1.5px solid ${C.border}`,
                                animation: `fadeUp 180ms cubic-bezier(0.23,1,0.32,1) ${idx * 40}ms both`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{
                                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                    background: C.navy, color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 800,
                                  }}>
                                    {it.cantidad}
                                  </span>
                                  <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{it.nombre_snap}</span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: C.textSec, fontVariantNumeric: "tabular-nums" }}>
                                  {fmt(it.subtotal)}
                                </span>
                              </div>
                            ))}

                            {/* Desglose */}
                            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
                                <span>Subtotal</span>
                                <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(o.subtotal)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                <span style={{ color: C.textMuted }}>Envío</span>
                                <span style={{
                                  fontVariantNumeric: "tabular-nums",
                                  color: (o.costo_envio ?? 0) > 0 ? "#d97706" : C.lime,
                                  fontWeight: 600,
                                }}>
                                  {(o.costo_envio ?? 0) > 0 ? fmt(o.costo_envio) : "Gratis"}
                                </span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.textMuted }}>Total</span>
                                <span style={{ fontSize: 16, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums" }}>{fmt(o.total)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: 13, color: C.textMuted, padding: "10px 0" }}>
                            {["pendiente", "pendiente_pago"].includes(estado)
                              ? "El detalle estará disponible cuando se confirme el pago."
                              : "Sin productos registrados."}
                          </p>
                        )}
                      </div>

                      {/* Barra de progreso */}
                      {!["cancelada", "rechazada", "pendiente_pago", "pendiente"].includes(estado) && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.brandSoft, border: `1px solid ${C.brandBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FontAwesomeIcon icon={faTruck} style={{ color: C.navy, fontSize: 12 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: C.textTer }}>
                              Seguimiento del pedido
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {PASOS.map((paso, i) => {
                              const hecho  = i <= pasoIdx;
                              const activo = i === pasoIdx;
                              const cfg    = ESTADOS[paso];
                              return (
                                <div key={paso} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                                    <div
                                      className="vp-step-dot"
                                      style={{
                                        width:  activo ? 32 : 22,
                                        height: activo ? 32 : 22,
                                        background: hecho ? C.navy : C.brandSoft,
                                        border:  activo ? `2px solid ${C.lime}` : `1px solid ${C.brandBorder}`,
                                        boxShadow: activo ? `0 0 0 4px ${C.brandSoft}` : "none",
                                      }}>
                                      <FontAwesomeIcon
                                        icon={cfg?.icon || faCircleCheck}
                                        style={{ fontSize: activo ? 13 : 9, color: hecho ? "#fff" : C.textMuted }}
                                      />
                                    </div>
                                    <span style={{
                                      fontSize: 9, fontWeight: activo ? 700 : 500,
                                      color: hecho ? C.navy : C.textMuted,
                                      whiteSpace: "nowrap",
                                    }}>
                                      {cfg?.label}
                                    </span>
                                  </div>
                                  {i < PASOS.length - 1 && (
                                    <div style={{
                                      flex: 1, height: 2, marginBottom: 18,
                                      background: i < pasoIdx
                                        ? `linear-gradient(90deg, ${C.navy} 0%, ${C.navy}88 100%)`
                                        : C.brandSoft,
                                      transition: "background 300ms ease",
                                    }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
