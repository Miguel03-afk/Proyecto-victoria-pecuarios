// src/pages/Carrito.jsx — Victoria Pets · diseño PDF
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping, faTruckFast, faCheck, faCreditCard, faXmark,
  faMoneyBill, faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
const IVA = 0.19;

const CIUDADES = ["Ibagué", "Bogotá", "Medellín", "Cali", "Cartagena", "Barranquilla", "Bucaramanga", "Otra"];

/* ─── Campo ──────────────────────────────────────────────────────────────── */
function Campo({ label, value, onChange, type = "text", placeholder, required, hint, rows }) {
  const { C } = useTheme();
  const [focused, setFocused] = useState(false);
  const Tag = rows ? "textarea" : "input";
  const navy = C.navy || C.brand;
  return (
    <div>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 600,
        color: focused ? navy : C.ink,
        marginBottom: 8, transition: "color 0.15s",
      }}>
        {label}{required && <span style={{ color: C.red || C.danger, marginLeft: 4 }}>*</span>}
      </label>
      <Tag
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: rows ? "auto" : 48,
          padding: rows ? "12px 16px" : "0 16px",
          borderRadius: 14,
          border: `1.5px solid ${focused ? navy : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color: C.ink,
          fontSize: 14, fontFamily: FONT.ui, fontWeight: 500,
          outline: "none", resize: rows ? "vertical" : undefined,
          transition: "all 200ms ease",
          boxShadow: focused ? `0 0 0 4px ${navy}15` : "none",
        }}
      />
      {hint && <p style={{ margin: "6px 0 0", fontSize: 11, color: C.inkMuted || C.muted }}>{hint}</p>}
    </div>
  );
}

/* ─── Stepper estilo PDF ─────────────────────────────────────────────────── */
const PASOS = ["Datos", "Envío", "Pago"];

function Stepper({ paso }) {
  const { C } = useTheme();
  const navy     = C.navy     || C.brand;
  const lime     = C.lime     || '#7BC142';
  const limeDeep = C.limeDeep || '#5DA328';
  const inkMuted = C.inkMuted || C.ink3;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 0, marginBottom: 48, flexWrap: "wrap",
    }}>
      {PASOS.map((label, i) => {
        const completado = i < paso;
        const activo = i === paso;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: completado ? lime : activo ? navy : C.surfaceAlt,
                color: completado || activo ? C.canvas : inkMuted,
                border: activo && !completado ? `2px solid ${navy}` : "none",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                fontFamily: FONT.ui,
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: activo ? `0 6px 14px -8px ${navy}50`
                  : completado ? `0 6px 14px -8px ${lime}50` : 'none',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {completado ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }}/> : i + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: activo || completado ? (completado ? limeDeep : navy) : inkMuted,
                }}>
                  Paso {i + 1}
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: activo || completado ? 700 : 500,
                  color: activo || completado ? C.ink : inkMuted,
                  fontFamily: FONT.ui,
                  lineHeight: 1.1,
                }}>
                  {label}
                </span>
              </div>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{
                width: 64, height: 2,
                background: completado ? lime : C.border,
                margin: "0 18px",
                borderRadius: 999,
                transition: "background 0.3s",
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Resumen del pedido (sidebar) ───────────────────────────────────────── */
function ResumenPedido({ items, totalPrecio, accion, textoBtn, disabled, cargando, onVolver, mostrarItems }) {
  const { C } = useTheme();
  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const total       = totalPrecio + costoEnvio;
  const [codigo, setCodigo] = useState("");

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: RADIUS.lg,
      padding: 24,
      position: "sticky",
      top: 96,
      fontFamily: FONT.ui,
    }}>
      <h3 style={{
        margin: "0 0 18px",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 20,
        color: C.ink,
        letterSpacing: '-0.02em',
      }}>
        {mostrarItems ? "Tu pedido" : "Resumen del pedido"}
      </h3>

      {/* Items mini (solo en checkout) */}
      {mostrarItems && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                position: "relative",
                width: 44, height: 44, borderRadius: RADIUS.sm,
                background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 8px, ${C.surfaceAlt} 8px 16px)`,
                flexShrink: 0, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.imagen_url && (
                  <img src={item.imagen_url} alt={item.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }}
                    onError={e => { e.target.style.display = "none"; }}/>
                )}
                <span style={{
                  position: "absolute", top: -4, left: -4,
                  width: 18, height: 18, borderRadius: "50%",
                  background: C.ink, color: C.canvas,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {item.cantidad}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 12, fontWeight: 600, color: C.ink,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {item.nombre}
                </p>
                {item.marca && (
                  <p style={{ margin: 0, fontSize: 10, color: C.ink3 }}>{item.marca}</p>
                )}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700, color: C.ink,
                fontFamily: FONT.display,
              }}>
                {fmt(item.precio * item.cantidad)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Totales */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.ink2 }}>
          <span>Subtotal</span>
          <span style={{ fontFamily: FONT.mono }}>{fmt(totalPrecio)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.ink2 }}>
          <span>Envío Ibagué</span>
          <span style={{ color: envioGratis ? C.brand : C.ink, fontWeight: envioGratis ? 700 : 400, fontFamily: envioGratis ? FONT.ui : FONT.mono }}>
            {envioGratis ? "Gratis" : fmt(costoEnvio)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.ink3 }}>
          <span>Descuento</span>
          <span>—</span>
        </div>
      </div>

      <div style={{ height: 1, background: C.line, margin: "4px 0 16px" }}/>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 18,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Total</span>
        <span style={{
          fontFamily: FONT.display,
          fontWeight: 700, fontSize: 28,
          color: C.ink, letterSpacing: -0.5,
        }}>
          {fmt(total)}
        </span>
      </div>

      {/* Código de descuento (solo en paso 1) */}
      {!mostrarItems && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Código de descuento"
            style={{
              flex: 1, height: 38, padding: "0 12px",
              borderRadius: RADIUS.sm,
              border: `1px solid ${C.lineStrong}`,
              background: C.surface, color: C.ink,
              fontSize: 12, fontFamily: FONT.ui,
              outline: "none",
            }}
          />
          <button style={{
            padding: "0 16px", height: 38,
            borderRadius: RADIUS.sm,
            border: `1px solid ${C.lineStrong}`,
            background: C.surface, color: C.ink,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: FONT.ui,
          }}>
            Aplicar
          </button>
        </div>
      )}

      <button
        onClick={accion}
        disabled={disabled || cargando}
        style={{
          width: "100%", height: 46,
          borderRadius: RADIUS.sm,
          border: "none",
          background: (disabled || cargando) ? C.surfaceAlt : C.brand,
          color: (disabled || cargando) ? C.muted : "#fff",
          fontSize: 14, fontWeight: 700,
          fontFamily: FONT.ui,
          cursor: (disabled || cargando) ? "default" : "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { if (!disabled && !cargando) e.currentTarget.style.background = C.brandMid; }}
        onMouseLeave={e => { if (!disabled && !cargando) e.currentTarget.style.background = C.brand; }}
      >
        {cargando && (
          <span style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            animation: "vp-spin 0.8s linear infinite",
          }}/>
        )}
        {cargando ? "Procesando..." : textoBtn}
      </button>

      {onVolver && (
        <button onClick={onVolver}
          style={{
            width: "100%", marginTop: 10,
            padding: "10px 0", borderRadius: RADIUS.sm,
            background: "transparent",
            border: "none",
            fontSize: 12, color: C.ink3, cursor: "pointer",
            fontFamily: FONT.ui,
          }}>
          ← Volver
        </button>
      )}

      {mostrarItems && (
        <p style={{
          margin: "14px 0 0",
          fontSize: 11, color: C.ink3, lineHeight: 1.55,
          textAlign: "center",
          padding: "10px 12px",
          borderRadius: RADIUS.sm,
          background: C.brandSoft,
          border: `1px solid ${C.brandBorder}`,
        }}>
          ✓ Al confirmar, aceptas los términos y la política de envíos de Victoria Pets.
        </p>
      )}
    </div>
  );
}

/* ─── Selector de cantidad ───────────────────────────────────────────────── */
function CantidadInput({ cantidad, stock, onChange }) {
  const { C } = useTheme();
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      border: `1px solid ${C.lineStrong}`,
      borderRadius: RADIUS.sm,
      background: C.surface,
      overflow: "hidden",
    }}>
      <button
        onClick={() => cantidad > 1 && onChange(cantidad - 1)}
        disabled={cantidad <= 1}
        style={{
          width: 32, height: 32,
          border: "none", background: "transparent",
          color: cantidad > 1 ? C.ink : C.muted,
          fontSize: 16, cursor: cantidad > 1 ? "pointer" : "default",
          fontFamily: FONT.ui,
        }}>−</button>
      <span style={{
        minWidth: 36, padding: "0 4px",
        fontSize: 13, fontWeight: 600,
        color: C.ink, textAlign: "center",
        fontFamily: FONT.mono,
      }}>
        {cantidad}
      </span>
      <button
        onClick={() => cantidad < stock && onChange(cantidad + 1)}
        disabled={cantidad >= stock}
        style={{
          width: 32, height: 32,
          border: "none", background: "transparent",
          color: cantidad < stock ? C.ink : C.muted,
          fontSize: 16, cursor: cantidad < stock ? "pointer" : "default",
          fontFamily: FONT.ui,
        }}>+</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PASO 0 — Carrito (tabla limpia estilo PDF)
   ════════════════════════════════════════════════════════════════ */
function PasoCarrito({ onContinuar }) {
  const { C } = useTheme();
  const { items, quitar, cambiarCantidad, totalItems, totalPrecio } = useCarrito();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div style={{
      textAlign: "center", padding: "80px 24px",
      background: C.surface, border: `1px solid ${C.line}`,
      borderRadius: RADIUS.lg,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: C.brandSoft, color: C.brand,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 34, margin: "0 auto 18px",
      }}>
        <FontAwesomeIcon icon={faCartShopping}/>
      </div>
      <h2 style={{
        margin: "0 0 8px",
        fontFamily: FONT.display,
        fontWeight: 700, fontSize: 26,
        color: C.ink, letterSpacing: '-0.02em',
      }}>
        Tu carrito está vacío
      </h2>
      <p style={{ margin: "0 0 24px", color: C.ink3, fontSize: 14 }}>
        Agrega productos para continuar
      </p>
      <Link to="/tienda" style={{
        display: "inline-block",
        padding: "12px 28px",
        borderRadius: RADIUS.sm,
        background: C.brand, color: C.canvas,
        textDecoration: "none",
        fontWeight: 700, fontSize: 14,
        fontFamily: FONT.ui,
      }}>
        Ver productos
      </Link>
    </div>
  );

  return (
    <div className="vp-carrito-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
      {/* Tabla items */}
      <div>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 130px 100px 32px",
            gap: 14,
            padding: "14px 20px",
            background: C.canvas,
            borderBottom: `1px solid ${C.line}`,
            fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.5,
            color: C.ink3,
          }} className="vp-tabla-header">
            <span>Producto</span>
            <span style={{ textAlign: "center" }}>Cantidad</span>
            <span style={{ textAlign: "right" }}>Subtotal</span>
            <span></span>
          </div>

          {/* Rows */}
          {items.map((item, i) => {
            const noDisp = item.activo === false || item.stock === 0;
            return (
              <div key={item.id} style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 100px 32px",
                gap: 14,
                padding: "16px 20px",
                alignItems: "center",
                borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : "none",
                background: noDisp ? C.dangerBg : "transparent",
              }} className="vp-tabla-row">
                {/* Producto */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    onClick={() => navigate(`/producto/${item.slug}`)}
                    style={{
                      width: 56, height: 56,
                      borderRadius: RADIUS.sm,
                      background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 10px, ${C.surfaceAlt} 10px 20px)`,
                      flexShrink: 0, overflow: "hidden",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {item.imagen_url && (
                      <img src={item.imagen_url} alt={item.nombre}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                        onError={e => { e.target.style.display = "none"; }}/>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.marca && (
                      <p style={{
                        margin: 0, fontSize: 9, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: 1.2,
                        color: C.muted, fontFamily: FONT.mono,
                      }}>
                        {item.marca}
                      </p>
                    )}
                    <p
                      onClick={() => navigate(`/producto/${item.slug}`)}
                      style={{
                        margin: "2px 0 4px",
                        fontSize: 14, fontWeight: 600,
                        color: C.ink, cursor: "pointer",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                      {item.nombre}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.ink3, fontFamily: FONT.mono }}>
                      {fmt(item.precio)} c/u
                    </p>
                  </div>
                </div>

                {/* Cantidad */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CantidadInput
                    cantidad={item.cantidad}
                    stock={item.stock || 99}
                    onChange={(n) => cambiarCantidad(item.id, n - item.cantidad)}
                  />
                </div>

                {/* Subtotal */}
                <span style={{
                  fontSize: 16, fontWeight: 700,
                  fontFamily: FONT.display,
                  color: noDisp ? C.muted : C.ink,
                  textAlign: "right",
                }}>
                  {fmt(item.precio * item.cantidad)}
                </span>

                {/* Eliminar */}
                <button
                  onClick={() => quitar(item.id)}
                  style={{
                    width: 28, height: 28, borderRadius: RADIUS.sm,
                    border: "none", background: "transparent",
                    color: C.muted, fontSize: 16,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.dangerBg; e.currentTarget.style.color = C.danger; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}
                  title="Quitar producto"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Banner envío gratis */}
        {totalPrecio >= 80000 ? (
          <div style={{
            marginTop: 14, padding: "12px 18px",
            borderRadius: RADIUS.sm,
            background: C.brandSoft, border: `1px solid ${C.brandBorder}`,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, color: C.brand, fontWeight: 600,
          }}>
            🎉 ¡Felicidades! Tu pedido califica para envío gratis en Ibagué
          </div>
        ) : (
          <div style={{
            marginTop: 14, padding: "12px 18px",
            borderRadius: RADIUS.sm,
            background: C.surfaceAlt, border: `1px solid ${C.line}`,
            fontSize: 13, color: C.ink2,
          }}>
            <FontAwesomeIcon icon={faTruckFast} style={{ marginRight: 6, color: C.brand }}/>
            Te faltan <strong style={{ color: C.brand, fontFamily: FONT.mono }}>{fmt(80000 - totalPrecio)}</strong> para envío gratis
          </div>
        )}
      </div>

      {/* Resumen */}
      <ResumenPedido
        items={items}
        totalPrecio={totalPrecio}
        accion={onContinuar}
        textoBtn="→ Ir a pagar"
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PASO 1 — Envío
   ════════════════════════════════════════════════════════════════ */
function PasoEnvio({ onContinuar, onVolver, datosEnvio, setDatosEnvio }) {
  const { C } = useTheme();
  const { items, totalPrecio } = useCarrito();
  const { usuario } = useAuth();
  const [metodoEnvio, setMetodoEnvio] = useState("express");
  const [errorTel, setErrorTel] = useState("");
  const [dirsGuardadas, setDirsGuardadas] = useState([]);
  const [dirSeleccionada, setDirSeleccionada] = useState(null);

  // Pre-llenar con datos del usuario si los tiene
  useEffect(() => {
    if (usuario && (!datosEnvio.nombre || !datosEnvio.telefono)) {
      setDatosEnvio(d => ({
        ...d,
        nombre: d.nombre || usuario.nombre || "",
        apellido: d.apellido || usuario.apellido || "",
        telefono: d.telefono || usuario.telefono || "",
      }));
    }
  }, [usuario]); // eslint-disable-line

  // Cargar direcciones guardadas del perfil (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vp_direcciones");
      const arr = raw ? JSON.parse(raw) : [];
      setDirsGuardadas(Array.isArray(arr) ? arr : []);
    } catch { setDirsGuardadas([]); }
  }, []);

  // Aplicar dirección guardada al seleccionarla
  const aplicarDireccion = (d) => {
    setDirSeleccionada(d.id);
    setDatosEnvio(prev => ({
      ...prev,
      direccion:    d.calle || "",
      ciudad:       d.ciudad || "Ibagué",
      departamento: d.barrio || "",
      notas:        d.referencias || prev.notas || "",
    }));
  };

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "telefono") {
      // Solo dígitos, máximo 10
      v = v.replace(/\D/g, "").slice(0, 10);
      setErrorTel("");
    }
    setDatosEnvio(d => ({ ...d, [k]: v }));
  };

  const telOk = /^\d{10}$/.test(datosEnvio.telefono || "");
  const puedeContinuar = datosEnvio.nombre && datosEnvio.apellido && telOk &&
                         datosEnvio.direccion && datosEnvio.ciudad;

  const validarYContinuar = () => {
    if (!telOk) {
      setErrorTel("El celular debe tener exactamente 10 dígitos");
      return;
    }
    onContinuar();
  };

  // Solo Domicilio express disponible por ahora
  const METODOS_ENVIO = [
    { id: "express",  label: "Domicilio express",  zona: "Solo Ibagué · ~1 hora según zona",  costo: "Gratis" },
  ];

  return (
    <div className="vp-carrito-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
      {/* Formulario */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Datos contacto */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          padding: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: C.brand, color: C.canvas,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>✓</div>
            <h3 style={{
              margin: 0, fontFamily: FONT.display,
              fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: '-0.015em',
            }}>
              Datos de contacto
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="vp-grid-2">
            <Campo label="Nombre" value={datosEnvio.nombre} onChange={set("nombre")} required placeholder="Andrea"/>
            <Campo label="Apellido" value={datosEnvio.apellido} onChange={set("apellido")} required placeholder="Pérez"/>
            <Campo
              label="Celular (10 dígitos)"
              value={datosEnvio.telefono}
              onChange={set("telefono")}
              required
              placeholder="3105554321"
              type="tel"
              hint={errorTel || (datosEnvio.telefono && !telOk ? `${datosEnvio.telefono.length}/10 dígitos` : "Sin espacios ni guiones")}
            />
            <Campo label="Correo (opcional)" value={usuario?.email || ""} onChange={() => {}} placeholder={usuario?.email || "tu@correo.com"} type="email"/>
          </div>
        </div>

        {/* Dirección */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.brand}`,
          borderRadius: RADIUS.lg,
          padding: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: C.brand, color: C.canvas,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>2</div>
            <h3 style={{
              margin: 0, fontFamily: FONT.display,
              fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: '-0.015em',
            }}>
              Dirección de envío
            </h3>
            <span style={{ flex: 1 }}/>
            <Link to="/perfil"
              style={{
                fontSize: 11, color: C.brand,
                textDecoration: "none", fontWeight: 600,
              }}>
              + Gestionar mis direcciones
            </Link>
          </div>

          {/* Direcciones guardadas */}
          {dirsGuardadas.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: C.ink, marginBottom: 10,
              }}>
                Direcciones guardadas
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dirsGuardadas.map(d => {
                  const sel = dirSeleccionada === d.id;
                  return (
                    <button key={d.id} type="button"
                      onClick={() => aplicarDireccion(d)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "10px 14px",
                        borderRadius: RADIUS.sm,
                        border: `1.5px solid ${sel ? C.brand : C.lineStrong}`,
                        background: sel ? C.brandSoft : C.surface,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                        fontFamily: FONT.ui,
                      }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: `2px solid ${sel ? C.brand : C.lineStrong}`,
                        flexShrink: 0, marginTop: 2,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {sel && (
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: C.brand,
                          }}/>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {d.alias && (
                          <p style={{
                            margin: 0, fontSize: 10, fontWeight: 700,
                            color: sel ? C.brand : C.ink2,
                            textTransform: "uppercase", letterSpacing: 0.6,
                          }}>
                            {d.alias}
                          </p>
                        )}
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: C.ink }}>
                          {d.calle}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: C.ink3 }}>
                          {[d.barrio, d.ciudad].filter(Boolean).join(", ")}
                        </p>
                        {d.referencias && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.ink3, fontStyle: "italic" }}>
                            {d.referencias}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setDirSeleccionada(null)}
                  style={{
                    padding: "8px 14px", borderRadius: RADIUS.sm,
                    background: "transparent",
                    border: `1px dashed ${C.lineStrong}`,
                    color: C.ink3, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", textAlign: "left",
                    fontFamily: FONT.ui,
                  }}>
                  ＋ Ingresar dirección diferente
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="vp-grid-2">
            <div>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1,
                color: C.ink3, marginBottom: 7,
              }}>
                Ciudad
              </label>
              <select
                value={datosEnvio.ciudad}
                onChange={set("ciudad")}
                style={{
                  width: "100%", height: 44,
                  padding: "0 14px",
                  borderRadius: RADIUS.sm,
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surface, color: C.ink,
                  fontSize: 14, fontFamily: FONT.ui,
                  outline: "none",
                }}>
                <option value="">Selecciona…</option>
                {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Campo label="Barrio" value={datosEnvio.departamento} onChange={set("departamento")} placeholder="Piedrapintada"/>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Campo label="Dirección completa" value={datosEnvio.direccion} onChange={set("direccion")} required placeholder="Calle 42 #4-87, Edificio Aurora apto 502"/>
          </div>
          <Campo label="Indicaciones (opcional)" value={datosEnvio.notas} onChange={set("notas")} placeholder="Portería 1 · Llamar al llegar"/>

          {/* Método de envío */}
          <div style={{ marginTop: 20 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 1,
              color: C.ink3, marginBottom: 10,
            }}>
              Método de envío
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {METODOS_ENVIO.map(m => {
                const activo = metodoEnvio === m.id;
                return (
                  <label key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    borderRadius: RADIUS.sm,
                    border: `1.5px solid ${activo ? C.brand : C.lineStrong}`,
                    background: activo ? C.brandSoft : C.surface,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <input type="radio" name="envio" checked={activo}
                      onChange={() => setMetodoEnvio(m.id)}
                      style={{ accentColor: C.brand, cursor: "pointer" }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{m.zona}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>
                      {m.costo}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <ResumenPedido
        items={items}
        totalPrecio={totalPrecio}
        accion={validarYContinuar}
        textoBtn="Continuar al pago →"
        disabled={!puedeContinuar}
        onVolver={onVolver}
        mostrarItems
      />
    </div>
  );
}

/* ─── ePayco loader ──────────────────────────────────────────────────────── */
function loadEpaycoScript() {
  return new Promise((resolve, reject) => {
    if (window.ePayco) return resolve(window.ePayco);
    const existing = document.getElementById("epayco-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.ePayco));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.id = "epayco-checkout-script";
    s.src = "https://checkout.epayco.co/checkout.js";
    s.async = true;
    s.onload  = () => resolve(window.ePayco);
    s.onerror = () => reject(new Error("No se pudo cargar ePayco"));
    document.head.appendChild(s);
  });
}

/* ════════════════════════════════════════════════════════════════
   PASO 2 — Pago
   ════════════════════════════════════════════════════════════════ */
function PasoPago({ onVolver, datosEnvio }) {
  const { C } = useTheme();
  const { items, totalPrecio, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [metodo,     setMetodo]     = useState("epayco");
  const [procesando, setProcesando] = useState(false);
  const [error,      setError]      = useState("");
  const [orden,      setOrden]      = useState(null);

  useEffect(() => { loadEpaycoScript().catch(() => {}); }, []);

  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const total       = totalPrecio + costoEnvio;

  // Por ahora solo Tarjeta vía ePayco (los demás métodos quedan disponibles más adelante)
  const METODOS = [
    { id: "epayco", icon: faCreditCard, label: "Tarjeta de crédito", info: "Pago seguro con ePayco · Visa, Mastercard, AmEx" },
  ];

  const crearOrden = () =>
    api.post("/pagos/crear-orden", {
      items: items.map(item => ({
        producto_id: item.producto_id || item.id,
        cantidad: item.cantidad,
      })),
      metodo_pago: metodo,
      datos_envio: {
        direccion: datosEnvio.direccion,
        ciudad: datosEnvio.ciudad,
        telefono: datosEnvio.telefono,
        notas: datosEnvio.notas || null,
      },
    }).then(r => r.data);

  const handleConfirmar = async () => {
    if (!usuario) {
      navigate("/login", { state: { desde: "/carrito" } });
      return;
    }
    setError(""); setProcesando(true);
    try {
      const ordenData = await crearOrden();

      if (metodo === "epayco") {
        const epayco = await loadEpaycoScript();
        if (!epayco?.checkout) throw new Error("No se pudo inicializar el módulo de pagos.");
        const PUBLIC_KEY = import.meta.env.VITE_EPAYCO_PUBLIC_KEY || "";
        const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
        if (!PUBLIC_KEY) throw new Error("Clave pública de ePayco no configurada.");

        const handler = epayco.checkout.configure({ key: PUBLIC_KEY, test: true });
        const montoEntero = Math.round(ordenData.total);
        const baseIva = Math.round(ordenData.subtotal / 1.19);
        const valorIva = Math.round(ordenData.subtotal - baseIva);

        sessionStorage.setItem("vp_pago_pendiente", JSON.stringify({
          codigo: ordenData.codigo,
          total: ordenData.total,
        }));

        handler.open({
          name: "Victoria Pets",
          description: `Orden ${ordenData.codigo}`,
          invoice: ordenData.codigo,
          currency: "cop",
          amount: String(montoEntero),
          tax_base: String(baseIva),
          tax: String(valorIva),
          country: "co",
          lang: "es",
          extra1: ordenData.codigo,
          external: "true",
          response: `${PUBLIC_URL}/pago/respuesta`,
          email_billing: usuario.email,
          name_billing: `${usuario.nombre} ${usuario.apellido}`,
          type_doc_billing: "cc",
          mobilephone_billing: datosEnvio.telefono || "",
          address_billing: datosEnvio.direccion || "",
        });

        vaciar();
      } else {
        vaciar();
        setOrden({ codigo: ordenData.codigo, id: ordenData.orden_id });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al procesar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  if (orden) return (
    <div style={{
      maxWidth: 520, margin: "0 auto", animation: "vp-fadeUp 0.4s ease",
    }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.successBorder}`,
        borderRadius: RADIUS.lg,
        padding: "48px 40px",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: C.successBg, border: `2px solid ${C.successBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 20px",
        }}>✓</div>
        <h2 style={{
          margin: "0 0 8px",
          fontFamily: FONT.display,
          fontWeight: 700, fontSize: 30,
          color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>
          ¡Pedido registrado!
        </h2>
        <p style={{ margin: "0 0 18px", color: C.ink3, fontSize: 14, lineHeight: 1.55 }}>
          Tu orden <strong style={{ color: C.ink, fontFamily: FONT.mono }}>#{orden.codigo}</strong> fue creada con éxito.
          Te contactaremos para coordinar la entrega.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/mis-ordenes" style={{
            padding: "12px 24px", borderRadius: RADIUS.sm,
            background: C.brand, color: C.canvas,
            textDecoration: "none", fontSize: 13, fontWeight: 700,
            fontFamily: FONT.ui,
          }}>
            Ver mis órdenes
          </Link>
          <Link to="/tienda" style={{
            padding: "12px 24px", borderRadius: RADIUS.sm,
            background: "transparent",
            border: `1px solid ${C.lineStrong}`,
            color: C.ink,
            textDecoration: "none", fontSize: 13, fontWeight: 700,
            fontFamily: FONT.ui,
          }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vp-carrito-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
      <div>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          padding: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: C.brand, color: C.canvas,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>3</div>
            <h3 style={{
              margin: 0, fontFamily: FONT.display,
              fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: '-0.015em',
            }}>
              Método de pago
            </h3>
          </div>

          {error && (
            <div style={{
              padding: "12px 14px", marginBottom: 16, borderRadius: RADIUS.sm,
              background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
              color: C.danger, fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {METODOS.map(m => {
              const activo = metodo === m.id;
              return (
                <label key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px",
                  borderRadius: RADIUS.sm,
                  border: `1.5px solid ${activo ? C.brand : C.lineStrong}`,
                  background: activo ? C.brandSoft : C.surface,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <input type="radio" name="metodo" checked={activo}
                    onChange={() => setMetodo(m.id)}
                    style={{ accentColor: C.brand, cursor: "pointer", width: 16, height: 16 }}/>
                  <span style={{
                    width: 42, height: 42, borderRadius: RADIUS.sm,
                    background: activo ? C.surface : C.surfaceAlt,
                    color: activo ? C.brand : C.ink3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>
                    <FontAwesomeIcon icon={m.icon}/>
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{m.info}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <ResumenPedido
        items={items}
        totalPrecio={totalPrecio}
        accion={handleConfirmar}
        textoBtn={`Confirmar pedido · ${fmt(total)}`}
        disabled={!usuario || procesando}
        cargando={procesando}
        onVolver={onVolver}
        mostrarItems
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
export default function Carrito() {
  const { C } = useTheme();
  const [paso, setPaso] = useState(0);
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: "", apellido: "", telefono: "",
    direccion: "", ciudad: "Ibagué", departamento: "", notas: "",
  });

  return (
    <>
      <style>{`
        @keyframes vp-spin   { to { transform: rotate(360deg); } }
        @keyframes vp-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .vp-tabla-header { display: none !important; }
          .vp-tabla-row { grid-template-columns: 1fr 32px !important; row-gap: 8px !important; }
          .vp-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 1024px) {
          .vp-carrito-grid { grid-template-columns: 1fr 360px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: FONT.ui }}>

        {/* Topbar info */}
        <div style={{
          background: C.brandSoft,
          borderBottom: `1px solid ${C.brandBorder}`,
          padding: "8px 20px",
          textAlign: "center",
          fontSize: 12, color: C.ink2,
        }}>
          <FontAwesomeIcon icon={faTruckFast} style={{ marginRight: 8 }}/>
          Envío gratis en compras mayores a <strong style={{ color: C.brand, fontFamily: FONT.mono }}>$80.000</strong> — Solo Ibagué
        </div>

        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 20px 64px" }}>
          <div style={{ marginBottom: 8, textAlign: "center" }}>
            <span style={{
              fontSize: 13, fontWeight: 500,
              color: C.brand,
            }}>
              {paso === 0 ? "Carrito" : paso === 1 ? "Envío" : "Pago"}
            </span>
            <h1 style={{
              margin: "8px 0 6px",
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "clamp(30px, 4vw, 44px)",
              color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.05,
            }}>
              {paso === 0 ? "Tu carrito" : paso === 1 ? "Datos de envío" : "Confirmar pedido"}
            </h1>
            {paso === 0 && (
              <p style={{ margin: 0, fontSize: 13, color: C.ink3 }}>
                Revisa tus productos antes de pagar
              </p>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <Stepper paso={paso}/>
          </div>

          <div style={{ animation: "vp-fadeUp 0.3s ease" }} key={paso}>
            {paso === 0 && <PasoCarrito onContinuar={() => setPaso(1)}/>}
            {paso === 1 && (
              <PasoEnvio
                onContinuar={() => setPaso(2)}
                onVolver={() => setPaso(0)}
                datosEnvio={datosEnvio}
                setDatosEnvio={setDatosEnvio}
              />
            )}
            {paso === 2 && (
              <PasoPago
                onVolver={() => setPaso(1)}
                datosEnvio={datosEnvio}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
