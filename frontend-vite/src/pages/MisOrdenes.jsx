import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faChevronDown, faChevronUp, faReceipt,
  faLocationDot, faCreditCard, faMoneyBillWave, faTruck,
  faCircleCheck, faClock, faCircleXmark, faSpinner,
  faShoppingBag, faUser, faStore,
  faTag, faCalendarDays, faMobileScreen, faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";

/* ─── Tokens ────────────────────────────────────────────────────── */
const C = {
  brand:        "#0A6B40",
  brandMid:     "#138553",
  brandDark:    "#064E30",
  brandLight:   "#E4F5EC",
  brandBorder:  "#95CCAD",
  lime:         "#7AC143",
  canvas:       "#F5FAF7",
  surface:      "#ffffff",
  surfaceAlt:   "#EDF6F1",
  text:         "#101F16",
  textSec:      "#2D4A38",
  textTer:      "#5A7A65",
  textMuted:    "#8FAA98",
  border:       "rgba(0,0,0,0.07)",
  borderMid:    "#95CCAD",
};

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "—";

/* ─── Config de estados ─────────────────────────────────────────── */
const ESTADOS = {
  pendiente:      { bg: "#fef9c3", text: "#854d0e", border: "#fde047", label: "Pendiente",      icon: faClock },
  pendiente_pago: { bg: "#fff7ed", text: "#9a3412", border: "#fdba74", label: "Pago pendiente", icon: faClock },
  pagada:         { bg: "#dcfce7", text: "#14532d", border: "#86efac", label: "Pagada",         icon: faCircleCheck },
  procesando:     { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe", label: "Procesando",     icon: faSpinner },
  enviada:        { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc", label: "Enviada",        icon: faTruck },
  entregada:      { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", label: "Entregada",      icon: faCircleCheck },
  cancelada:      { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Cancelada",      icon: faCircleXmark },
  rechazada:      { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Rechazada",      icon: faCircleXmark },
};

const METODOS = {
  epayco:        { label: "ePayco",         icon: faCreditCard },
  efectivo:      { label: "Contraentrega",  icon: faMoneyBillWave },
  transferencia: { label: "Transferencia",  icon: faMobileScreen },
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
  return (
    <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.brandLight}` }}>
      {[60, 40, 80].map(w => (
        <div key={w} style={{ height: 12, width: `${w}%`, borderRadius: 6, background: C.brandLight, marginBottom: 10, animation: "pulse 1.5s ease infinite" }} />
      ))}
    </div>
  );
}

/* ─── Verificar pago ePayco ─────────────────────────────────────── */
function VerificarPago({ orden, onConfirmada }) {
  const [ref,          setRef]          = useState("");
  const [cargando,     setCargando]     = useState(false);
  const [resultado,    setResultado]    = useState(null);
  const [error,        setError]        = useState("");
  const [sinValidar,   setSinValidar]   = useState(false);

  const verificar = async (forzar = false) => {
    if (!ref.trim()) return;
    setCargando(true); setError(""); setResultado(null); setSinValidar(false);
    try {
      const { data } = await api.post("/pagos/verificar-epayco", {
        ref_payco: ref.trim(),
        codigo:    orden.codigo,
        forzar,
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
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: "1.5px solid #fdba74",
      background: "#fff7ed",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #fde8c8", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#ff6b00", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FontAwesomeIcon icon={faReceipt} style={{ color: "#fff", fontSize: 14 }} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#9a3412" }}>¿Ya pagaste en ePayco?</p>
          <p style={{ margin: 0, fontSize: 11, color: "#c2410c" }}>Ingresa la referencia de tu recibo para confirmar la orden</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9a3412" }}>
          En la página de ePayco busca el número de <strong>Recibo</strong> o <strong>Referencia ePayco</strong> y pégalo aquí:
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <FontAwesomeIcon icon={faHashtag} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#fdba74", fontSize: 12 }} />
            <input
              value={ref}
              onChange={e => setRef(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verificar()}
              placeholder="Ej: 363733641"
              style={{
                width: "100%", padding: "9px 12px 9px 30px",
                borderRadius: 10, border: `1.5px solid ${ref ? "#fdba74" : "#fde8c8"}`,
                fontSize: 13, outline: "none", fontFamily: "monospace",
                background: "#fff", color: C.text, boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={() => verificar(false)}
            disabled={cargando || !ref.trim()}
            style={{
              padding: "9px 18px", borderRadius: 10, border: "none",
              background: cargando || !ref.trim() ? C.textMuted : C.brand,
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: cargando || !ref.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}
          >
            {cargando
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Verificando…</>
              : <><FontAwesomeIcon icon={faCircleCheck} /> Confirmar</>
            }
          </button>
        </div>

        {sinValidar && (
          <div style={{ marginTop: 10, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 12px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              ⚠ ePayco no pudo validar automáticamente (modo pruebas). ¿Confirmar el pago manualmente con tu comprobante?
            </p>
            <button
              onClick={() => verificar(true)}
              disabled={cargando}
              style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#d97706", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
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
            <FontAwesomeIcon icon={faCircleXmark} /> ePayco reporta este pago como rechazado. Si tu email confirma el pago, verifica que el número de recibo sea el de ePayco (no el código de orden).
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
  const [ordenes,   setOrdenes]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [abierta,   setAbierta]   = useState(null);
  const [itemsMap,  setItemsMap]  = useState({});
  const [cargItems, setCargItems] = useState({});

  const cargarOrdenes = () =>
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data.map(o => ({ ...o, estado: (o.estado || "").toLowerCase() }))))
      .catch(() => {});

  useEffect(() => {
    cargarOrdenes().finally(() => setCargando(false));
  }, []);

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
    <div style={{ minHeight: "100vh", background: C.canvas }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header de página */}
      <div style={{ background: C.brandDark, padding: "28px 24px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <FontAwesomeIcon icon={faShoppingBag} style={{ color: C.lime, fontSize: 18 }} />
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                  Mis órdenes
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Historial completo de tus compras
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/perfil" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 10, textDecoration: "none",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <FontAwesomeIcon icon={faUser} /> Mi perfil
              </Link>
              <Link to="/tienda" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 10, textDecoration: "none",
                background: C.lime, color: C.brandDark,
                fontSize: 12, fontWeight: 700,
              }}>
                <FontAwesomeIcon icon={faStore} /> Ver tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 48px" }}>
        {cargando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : ordenes.length === 0 ? (
          /* Estado vacío */
          <div style={{ textAlign: "center", padding: "64px 24px", animation: "fadeUp 0.4s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: C.brandLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 36, color: C.brand }} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: C.text }}>No tienes órdenes aún</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: C.textTer }}>
              Cuando realices una compra, aparecerá aquí con todos los detalles.
            </p>
            <Link to="/tienda" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 12, textDecoration: "none",
              background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14,
              boxShadow: "0 4px 14px rgba(10,107,64,0.25)",
            }}>
              <FontAwesomeIcon icon={faStore} /> Explorar tienda
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.35s ease" }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: C.textMuted }}>
              {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} registrada{ordenes.length !== 1 ? "s" : ""}
            </p>

            {ordenes.map(o => {
              const estado    = (o.estado      || "pendiente").toLowerCase();
              const metodo    = (o.metodo_pago || "").toLowerCase();
              const abierto   = abierta === o.id;
              const est       = ESTADOS[estado] || ESTADOS.pendiente;
              const met       = METODOS[metodo] || { label: o.metodo_pago || "—", icon: faCreditCard };
              const pasoIdx   = PASOS.indexOf(estado);
              const items     = itemsMap[o.id];

              return (
                <div key={o.id} style={{
                  background: C.surface, borderRadius: 18,
                  border: `1.5px solid ${abierto ? C.brandBorder : C.brandLight}`,
                  overflow: "hidden",
                  boxShadow: abierto ? "0 4px 20px rgba(10,107,64,0.08)" : "none",
                  transition: "all 0.2s",
                }}>
                  {/* ── Fila principal (siempre visible) ── */}
                  <button
                    onClick={() => abrirOrden(o.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      padding: "16px 20px", gap: 16, cursor: "pointer",
                      background: "none", border: "none", textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surfaceAlt}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Ícono de estado */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: est.bg, border: `1.5px solid ${est.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FontAwesomeIcon icon={est.icon} style={{ color: est.text, fontSize: 16 }} />
                    </div>

                    {/* Info principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: C.brand }}>
                          {o.codigo}
                        </span>
                        <Badge estado={estado} />
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: C.textTer, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 10 }} /> {fdoc(o.created_at)}
                        </span>
                        <span style={{ fontSize: 12, color: C.textTer, display: "flex", alignItems: "center", gap: 4 }}>
                          <FontAwesomeIcon icon={met.icon} style={{ fontSize: 10 }} /> {met.label}
                        </span>
                        {o.items > 0 && (
                          <span style={{ fontSize: 12, color: C.textTer, display: "flex", alignItems: "center", gap: 4 }}>
                            <FontAwesomeIcon icon={faTag} style={{ fontSize: 10 }} /> {o.items} producto{o.items !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: C.text, fontVariantNumeric: "tabular-nums" }}>
                        {fmt(o.total)}
                      </span>
                      <FontAwesomeIcon
                        icon={abierto ? faChevronUp : faChevronDown}
                        style={{ color: C.textMuted, fontSize: 13, transition: "transform 0.2s" }}
                      />
                    </div>
                  </button>

                  {/* ── Detalle expandido ── */}
                  {abierto && (
                    <div style={{ borderTop: `1px solid ${C.brandBorder}`, padding: "20px 20px 20px" }}>

                      {/* Verificar pago ePayco — primero y prominente */}
                      {["pendiente", "pendiente_pago"].includes(estado) && (
                        <div style={{ marginBottom: 20 }}>
                          <VerificarPago orden={o} onConfirmada={confirmarOrden} />
                        </div>
                      )}

                      {/* Grid de info */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
                        {[
                          { icon: faCalendarDays, label: "Fecha",   val: fdoc(o.created_at) },
                          { icon: est.icon,      label: "Estado",  val: est.label, color: est.text, bg: est.bg },
                          { icon: met.icon,      label: "Método",  val: met.label },
                          ...(o.direccion_entrega ? [{ icon: faLocationDot, label: "Dirección", val: o.direccion_entrega }] : []),
                          ...(o.ciudad_entrega    ? [{ icon: faLocationDot, label: "Ciudad",    val: o.ciudad_entrega }]    : []),
                        ].map(({ icon, label, val, color, bg }) => (
                          <div key={label} style={{
                            padding: "12px 14px", borderRadius: 12,
                            background: bg || C.surfaceAlt,
                            border: `1px solid ${C.brandBorder}`,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
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
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <FontAwesomeIcon icon={faShoppingBag} style={{ color: C.brand, fontSize: 13 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: C.textTer }}>
                            Productos
                          </span>
                        </div>

                        {cargItems[o.id] ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[1, 2].map(i => (
                              <div key={i} style={{ height: 44, borderRadius: 10, background: C.brandLight, animation: "pulse 1.5s ease infinite" }} />
                            ))}
                          </div>
                        ) : items?.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {items.map((it, idx) => (
                              <div key={idx} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 14px", borderRadius: 12,
                                background: C.canvas, border: `1px solid ${C.brandLight}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{
                                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                    background: C.brand, color: "#fff",
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
                            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
                                <span>Subtotal</span>
                                <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(o.subtotal)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                <span style={{ color: C.textMuted }}>Envío</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: (o.costo_envio ?? 0) > 0 ? "#d97706" : C.brand, fontWeight: 600 }}>
                                  {(o.costo_envio ?? 0) > 0 ? fmt(o.costo_envio) : "Gratis"}
                                </span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 12, color: C.textMuted }}>Total</span>
                                <span style={{ fontSize: 16, fontWeight: 800, color: C.brand, fontVariantNumeric: "tabular-nums" }}>{fmt(o.total)}</span>
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

                      {/* Barra de progreso del pedido */}
                      {!["cancelada", "rechazada", "pendiente_pago", "pendiente"].includes(estado) && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                            <FontAwesomeIcon icon={faTruck} style={{ color: C.brand, fontSize: 12 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: C.textTer }}>
                              Seguimiento
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {PASOS.map((paso, i) => {
                              const hecho  = i <= pasoIdx;
                              const activo = i === pasoIdx;
                              const cfg    = ESTADOS[paso];
                              return (
                                <div key={paso} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <div style={{
                                      width: activo ? 30 : 22, height: activo ? 30 : 22,
                                      borderRadius: "50%", flexShrink: 0,
                                      background: hecho ? C.brand : C.brandLight,
                                      border: activo ? `2px solid ${C.brandMid}` : "none",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      transition: "all 0.2s",
                                      boxShadow: activo ? "0 0 0 4px rgba(10,107,64,0.12)" : "none",
                                    }}>
                                      <FontAwesomeIcon
                                        icon={cfg?.icon || faCircleCheck}
                                        style={{ fontSize: activo ? 12 : 9, color: hecho ? "#fff" : C.textMuted }}
                                      />
                                    </div>
                                    <span style={{ fontSize: 9, fontWeight: activo ? 700 : 500, color: hecho ? C.brand : C.textMuted, whiteSpace: "nowrap" }}>
                                      {cfg?.label}
                                    </span>
                                  </div>
                                  {i < PASOS.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: i < pasoIdx ? C.brand : C.brandLight, margin: "0 2px", marginBottom: 16, transition: "background 0.2s" }} />
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
