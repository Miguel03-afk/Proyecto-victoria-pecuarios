// src/pages/Carrito.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ─── Tokens (alineados con el sistema del proyecto) ─────────── */
const C = {
  brand:       "#1a5c1a",
  brandMid:    "#2d7a2d",
  brandDark:   "#0c180c",
  brandLight:  "#e6f3e6",
  brandBorder: "#b8d9b8",
  lime:        "#a3e635",
  canvas:      "#f6f7f4",
  surface:     "#ffffff",
  surfaceAlt:  "#f2f3ef",
  text:        "#111827",
  textSec:     "#374151",
  textTer:     "#6b7280",
  textMuted:   "#9ca3af",
  border:      "rgba(0,0,0,0.08)",
  borderMid:   "rgba(0,0,0,0.13)",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  dangerBorder:"#fecaca",
  success:     "#16a34a",
  successBg:   "#f0fdf4",
  successBorder:"#bbf7d0",
  warning:     "#d97706",
  warningBg:   "#fffbeb",
  warningBorder:"#fde68a",
};

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
const IVA  = 0.19;

/* ─── Componentes base ────────────────────────────────────────── */
function Campo({ label, value, onChange, type = "text", placeholder, required, hint, rows }) {
  const [focused, setFocused] = useState(false);
  const Tag = rows ? "textarea" : "input";
  return (
    <div>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 0.8,
        color: focused ? C.brand : C.textTer, marginBottom: 6, transition: "color 0.15s",
      }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      <Tag
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 12,
          border: `1.5px solid ${focused ? C.brand : C.border}`,
          background: focused ? C.surface : C.surfaceAlt,
          color: C.text, fontSize: 14, outline: "none",
          transition: "all 0.15s", resize: rows ? "vertical" : undefined,
          boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.08)" : "none",
          fontFamily: "system-ui",
        }}
      />
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textMuted }}>{hint}</p>}
    </div>
  );
}

/* ─── Stepper de pasos ────────────────────────────────────────── */
const PASOS = ["Carrito", "Envío", "Pago"];

function Stepper({ paso }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
      {PASOS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: i < paso ? C.brand : i === paso ? C.brand : C.border,
              color: i <= paso ? "#fff" : C.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, transition: "all 0.3s",
              boxShadow: i === paso ? `0 0 0 4px rgba(26,92,26,0.15)` : "none",
            }}>
              {i < paso ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: i === paso ? 700 : 400,
              color: i === paso ? C.brand : C.textMuted,
              whiteSpace: "nowrap",
            }}>
              {label}
            </span>
          </div>
          {i < PASOS.length - 1 && (
            <div style={{
              width: 64, height: 2, marginBottom: 18, marginInline: 6,
              background: i < paso ? C.brand : C.border,
              transition: "background 0.3s",
            }}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Resumen lateral (reutilizable) ─────────────────────────── */
function ResumenPedido({ items, totalPrecio, accion, textoBtn, disabled, cargando, onVolver }) {
  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const subtotal    = totalPrecio;
  const iva         = subtotal * IVA;
  const total       = subtotal + costoEnvio;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 20, padding: 24,
      position: "sticky", top: 88,
    }}>
      <h3 style={{
        margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: C.text,
        fontFamily: "'Playfair Display',serif", fontStyle: "italic",
      }}>
        Resumen del pedido
      </h3>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 12, color: C.textSec,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
            }}>
              {item.nombre}
              <span style={{ color: C.textMuted }}> ×{item.cantidad}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flexShrink: 0, fontFamily: "monospace" }}>
              {fmt(item.precio * item.cantidad)}
            </span>
          </div>
        ))}
      </div>

      {/* Desglose */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Subtotal", val: fmt(subtotal) },
          { label: `IVA (${Math.round(IVA * 100)}%)`, val: fmt(iva), nota: "incluido" },
          {
            label: "Envío", val: envioGratis ? "Gratis" : fmt(costoEnvio),
            verde: envioGratis,
          },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSec }}>
            <span>{r.label}{r.nota && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 4 }}>({r.nota})</span>}</span>
            <span style={{ fontFamily: "monospace", color: r.verde ? C.success : undefined, fontWeight: r.verde ? 700 : 400 }}>
              {r.val}
            </span>
          </div>
        ))}

        {!envioGratis && (
          <div style={{
            padding: "8px 12px", borderRadius: 9,
            background: C.warningBg, border: `1px solid ${C.warningBorder}`,
            fontSize: 11, color: C.warning,
          }}>
            Te faltan <strong>{fmt(80000 - subtotal)}</strong> para envío gratis
          </div>
        )}

        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: 12, borderTop: `1px solid ${C.border}`,
          fontSize: 17, fontWeight: 800, color: C.text,
        }}>
          <span>Total</span>
          <span style={{ color: C.brand, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Botón acción */}
      {accion && (
        <button
          onClick={accion}
          disabled={disabled || cargando}
          style={{
            width: "100%", marginTop: 18,
            padding: "13px 0", borderRadius: 12, border: "none",
            background: (disabled || cargando) ? C.surfaceAlt : C.brand,
            color: (disabled || cargando) ? C.textMuted : "#fff",
            fontSize: 14, fontWeight: 800,
            cursor: (disabled || cargando) ? "default" : "pointer",
            transition: "all 0.2s",
            boxShadow: (!disabled && !cargando) ? "0 4px 14px rgba(26,92,26,0.22)" : "none",
          }}
          onMouseEnter={e => { if (!disabled && !cargando) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {cargando ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin 0.8s linear infinite" }}/>
              Procesando...
            </span>
          ) : textoBtn}
        </button>
      )}

      {onVolver && (
        // FIX DISEÑO: sin flecha "←" en botón de texto plano
        <button
          onClick={onVolver}
          style={{ width: "100%", marginTop: 10, padding: "9px 0", background: "none", border: "none", fontSize: 12, color: C.textMuted, cursor: "pointer", transition: "color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
        >
          Volver
        </button>
      )}
    </div>
  );
}


/* ─── Input editable de cantidad ─────────────────────────────────────────── */
function CantidadInput({ cantidad, stock, onChange }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal]           = useState("");
  const ref                     = useRef(null);

  const confirmar = () => {
    const v = parseInt(val, 10);
    setEditando(false);
    if (!isNaN(v) && v >= 0) onChange(Math.min(v, stock));
  };

  return editando ? (
    <input
      ref={ref}
      type="text"
      value={val}
      onChange={e => { const v = e.target.value; if (!/^\d*$/.test(v)) return; const n = parseInt(v, 10); if (!isNaN(n) && n > stock) return; setVal(v); }}
      onBlur={confirmar}
      onKeyDown={e => { if (e.key === "Enter") confirmar(); if (e.key === "Escape") setEditando(false); }}
      style={{
        fontSize: 14, fontWeight: 800, color: C.text,
        width: 36, textAlign: "center", border: "none",
        background: "transparent", outline: "none",
        fontFamily: "monospace", padding: 0,
      }}
    />
  ) : (
    <span
      onClick={() => { setVal(String(cantidad)); setEditando(true); setTimeout(() => ref.current?.select(), 0); }}
      title="Toca para editar"
      style={{ fontSize: 14, fontWeight: 800, color: C.text, minWidth: 24, textAlign: "center", fontFamily: "monospace", cursor: "text" }}
    >{cantidad}</span>
  );
}

/* ════════════════════════════════════════════════════════════════
   PASO 1 — Carrito
   ════════════════════════════════════════════════════════════════ */
function PasoCarrito({ onContinuar }) {
  const { items, quitar, cambiarCantidad, totalItems, totalPrecio, agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  const [guardados, setGuardados] = useState(() => {
    try { return JSON.parse(localStorage.getItem("guardados_later") || "[]"); }
    catch { return []; }
  });

  const guardarParaDespues = (item) => {
    quitar(item.id);
    const nuevos = [...guardados, item];
    setGuardados(nuevos);
    localStorage.setItem("guardados_later", JSON.stringify(nuevos));
  };

  const moverAlCarrito = (item) => {
    agregarAlCarrito(item, item.cantidad || 1);
    const nuevos = guardados.filter(g => g.id !== item.id);
    setGuardados(nuevos);
    localStorage.setItem("guardados_later", JSON.stringify(nuevos));
  };

  if (items.length === 0 && guardados.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>
        Tu carrito está vacío
      </h2>
      <p style={{ margin: "0 0 24px", color: C.textMuted, fontSize: 14 }}>Agrega productos para continuar</p>
      <Link to="/tienda" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: C.brand, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
        Ver productos
      </Link>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="carrito-grid">
      {/* Lista de items */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: C.text }}>
          {items.length} {items.length === 1 ? "producto" : "productos"} en tu carrito
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item => {
            const noDisp = item.activo === false || item.stock === 0;
            return (
              <div key={item.id} style={{
                border: `1px solid ${noDisp ? C.dangerBorder : C.border}`,
                borderRadius: 16, padding: "16px",
                display: "flex", gap: 14,
                background: noDisp ? C.dangerBg : C.surface,
              }}>
                {/* Imagen */}
                <div
                  onClick={() => navigate(`/producto/${item.slug}`)}
                  style={{
                    width: 88, height: 88, borderRadius: 12, flexShrink: 0,
                    background: C.brandLight, border: `1px solid ${C.brandBorder}`,
                    overflow: "hidden", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {item.imagen_url
                    ? <img src={item.imagen_url} alt={item.nombre} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}/>
                    : <span style={{ fontSize: 28 }}>🐾</span>}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {noDisp && (
                    <span style={{ display: "inline-block", marginBottom: 5, fontSize: 10, fontWeight: 800, color: C.danger, background: "#fecaca", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {item.stock === 0 ? "Sin stock" : "No disponible"}
                    </span>
                  )}
                  <h3
                    onClick={() => navigate(`/producto/${item.slug}`)}
                    style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {item.nombre}
                  </h3>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: C.textMuted }}>
                    Stock: {item.stock} unidades
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    {/* Cantidad */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: noDisp ? "transparent" : C.surface,
                      border: `1.5px solid ${noDisp ? "transparent" : C.border}`,
                      borderRadius: 10, padding: "3px",
                      pointerEvents: noDisp ? "none" : "auto", opacity: noDisp ? 0.4 : 1,
                    }}>
                      <button onClick={() => cambiarCantidad(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: C.brand, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.brandLight; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>−</button>
                      <CantidadInput
                        cantidad={item.cantidad}
                        stock={item.stock}
                        onChange={nueva => {
                          if (nueva === 0) quitar(item.id);
                          else cambiarCantidad(item.id, nueva - item.cantidad);
                        }}
                      />
                      <button onClick={() => cambiarCantidad(item.id, +1)} disabled={item.cantidad >= item.stock} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: C.brand, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", opacity: item.cantidad >= item.stock ? 0.3 : 1 }}
                        onMouseEnter={e => { if (item.cantidad < item.stock) e.currentTarget.style.background = C.brandLight; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>+</button>
                    </div>

                    {/* Precio subtotal */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: noDisp ? C.textMuted : C.brand, fontFamily: "'JetBrains Mono',monospace" }}>
                        {fmt(item.precio * item.cantidad)}
                      </div>
                      {item.cantidad > 1 && (
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{fmt(item.precio)} c/u</div>
                      )}
                    </div>
                  </div>

                  {/* Acciones — FIX DISEÑO: sin íconos-flecha en links de texto */}
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <button onClick={() => quitar(item.id)} style={{ fontSize: 12, color: C.danger, background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: 0, transition: "opacity 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                      Eliminar
                    </button>
                    <span style={{ color: C.border }}>·</span>
                    <button onClick={() => guardarParaDespues(item)} style={{ fontSize: 12, color: C.textTer, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0, transition: "color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.brand; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.textTer; }}>
                      Guardar para más tarde
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guardados para más tarde */}
        {guardados.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.textSec, display: "flex", alignItems: "center", gap: 8 }}>
              Guardados para más tarde
              <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}>({guardados.length})</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {guardados.map(item => (
                <div key={item.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, opacity: 0.85 }}>
                  <div onClick={() => navigate(`/producto/${item.slug}`)} style={{ width: 52, height: 52, borderRadius: 10, background: C.brandLight, border: `1px solid ${C.brandBorder}`, overflow: "hidden", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} style={{ width: "100%", height: "100%", objectFit: "contain" }}/> : <span style={{ fontSize: 20 }}>🐾</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</p>
                    <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.brand, fontFamily: "monospace" }}>{fmt(item.precio)}</p>
                    <button onClick={() => moverAlCarrito(item)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8, border: "none", background: C.brandLight, color: C.brand, cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.brandLight; e.currentTarget.style.color = C.brand; }}>
                      Mover al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="carrito-resumen">
        <ResumenPedido
          items={items}
          totalPrecio={totalPrecio}
          accion={onContinuar}
          textoBtn="Continuar con el envío"
          disabled={items.length === 0 || items.some(i => i.activo === false || i.stock === 0)}
        />
        {/* FIX DISEÑO: "Seguir comprando" sin flecha */}
        <Link to="/tienda" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 12, color: C.textMuted, textDecoration: "none" }}
          onMouseEnter={e => { e.target.style.color = C.brand; }}
          onMouseLeave={e => { e.target.style.color = C.textMuted; }}>
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PASO 2 — Envío
   ════════════════════════════════════════════════════════════════ */
function PasoEnvio({ onContinuar, onVolver, datosEnvio, setDatosEnvio }) {
  const { items, totalPrecio } = useCarrito();
  const { usuario } = useAuth();
  const set = (k) => (e) => setDatosEnvio({ ...datosEnvio, [k]: e.target.value });

  useEffect(() => {
    if (usuario && !datosEnvio.nombre) {
      setDatosEnvio(p => ({
        ...p,
        nombre:   p.nombre   || usuario.nombre   || "",
        apellido: p.apellido || usuario.apellido || "",
        telefono: p.telefono || usuario.telefono || "",
        ciudad:   p.ciudad   || "Bogotá",
      }));
    }
  }, [usuario]);

  const valido = datosEnvio.nombre && datosEnvio.direccion && datosEnvio.ciudad;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="carrito-grid">
      <div>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: C.text }}>
          Información de envío
        </h2>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Campo label="Nombre" value={datosEnvio.nombre} onChange={set("nombre")} placeholder="Juan" required/>
            <Campo label="Apellido" value={datosEnvio.apellido} onChange={set("apellido")} placeholder="Pérez"/>
          </div>
          <Campo label="Teléfono" type="tel" value={datosEnvio.telefono} onChange={set("telefono")} placeholder="300 000 0000"/>
          <Campo label="Dirección" value={datosEnvio.direccion} onChange={set("direccion")} placeholder="Cra. 15 #85-23" required hint="Incluye barrio, apto o torre si aplica"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Campo label="Ciudad" value={datosEnvio.ciudad} onChange={set("ciudad")} placeholder="Bogotá" required/>
            <Campo label="Departamento" value={datosEnvio.departamento} onChange={set("departamento")} placeholder="Cundinamarca"/>
          </div>
          <Campo label="Notas adicionales" value={datosEnvio.notas} onChange={set("notas")} placeholder="Indicaciones especiales para la entrega..." rows={2}/>
        </div>
      </div>

      <div className="carrito-resumen">
        <ResumenPedido
          items={items}
          totalPrecio={totalPrecio}
          accion={onContinuar}
          textoBtn="Continuar al pago"
          disabled={!valido}
          onVolver={onVolver}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PASO 3 — Pago
   FIX CRÍTICO: cambiado de /admin/facturas → /cajero/facturas
   y el payload ahora usa { usuario_id, items, metodo_pago, notas }
   ════════════════════════════════════════════════════════════════ */
const METODOS = [
  { id: "efectivo",      label: "Efectivo / Contraentrega", icon: "💵", desc: "Paga al recibir tu pedido" },
  { id: "transferencia", label: "Transferencia bancaria",   icon: "🏦", desc: "Te enviamos los datos por correo" },
  { id: "pse",           label: "PSE",                      icon: "💳", desc: "Débito en línea desde tu banco" },
  { id: "tarjeta",       label: "Tarjeta débito / crédito", icon: "💳", desc: "Visa, Mastercard, American Express" },
];

function PasoPago({ onVolver, datosEnvio }) {
  const { items, totalPrecio, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [metodo,     setMetodo]     = useState("efectivo");
  const [procesando, setProcesando] = useState(false);
  const [error,      setError]      = useState("");
  const [orden,      setOrden]      = useState(null);

  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const total       = totalPrecio + costoEnvio;

  /* ── FIX: POST /api/cajero/facturas (era /admin/facturas) ── */
  const handleConfirmar = async () => {
    if (!usuario) {
      navigate("/login", { state: { desde: "/carrito" } });
      return;
    }
    setError(""); setProcesando(true);

    try {
      // Payload que acepta cajero.routes.js POST /facturas
      const { data } = await api.post("/cajero/facturas", {
        usuario_id:  usuario.id,           // cliente que compra en línea
        items: items.map(item => ({
          producto_id: item.producto_id || item.id,
          cantidad:    item.cantidad,
        })),
        metodo_pago: metodo,
        notas: [
          datosEnvio.direccion && `Enviar a: ${datosEnvio.direccion}, ${datosEnvio.ciudad}`,
          datosEnvio.notas,
        ].filter(Boolean).join(" | ") || null,
      });

      vaciar();
      setOrden({ codigo: data.codigo, id: data.orden_id });
    } catch (err) {
      const msg = err.response?.data?.error || "Error al procesar el pedido. Intenta de nuevo.";
      setError(msg);
    } finally {
      setProcesando(false);
    }
  };

  /* ── Pantalla de éxito ─────────────────────────────────────── */
  if (orden) return (
    <div style={{ maxWidth: 520, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.successBorder}`, borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 8px 32px rgba(22,163,74,0.1)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: C.successBg, border: `2px solid ${C.successBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>
          ✅
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: C.text, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>
          ¡Pedido confirmado!
        </h2>
        <p style={{ margin: "0 0 20px", color: C.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          Tu pedido fue registrado exitosamente. Nuestro equipo lo procesará pronto.
        </p>

        <div style={{ background: C.brandLight, border: `1px solid ${C.brandBorder}`, borderRadius: 12, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Código de pedido</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.brand, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
            {orden.codigo}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/mis-ordenes" style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: C.brand, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.brandMid; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.brand; }}>
            Ver mis pedidos
          </Link>
          <Link to="/tienda" style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSec, textDecoration: "none", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="carrito-grid">
      <div>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: C.text }}>
          Método de pago
        </h2>

        {/* Alerta sin login */}
        {!usuario && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: C.warningBg, border: `1px solid ${C.warningBorder}`, marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: C.warning }}>Debes iniciar sesión para pagar</p>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#92400e" }}>Tu carrito se guardará automáticamente.</p>
              <button onClick={() => navigate("/login", { state: { desde: "/carrito" } })} style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, border: "none", background: C.warning, color: "#fff", cursor: "pointer" }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        )}

        {/* Error del backend */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger, fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span>⚠️</span>{error}
          </div>
        )}

        {/* Métodos de pago */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {METODOS.map(m => (
            <label key={m.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
              border: `1.5px solid ${metodo === m.id ? C.brand : C.border}`,
              background: metodo === m.id ? C.brandLight : C.surface,
            }}
              onMouseEnter={e => { if (metodo !== m.id) e.currentTarget.style.borderColor = C.brandBorder; }}
              onMouseLeave={e => { if (metodo !== m.id) e.currentTarget.style.borderColor = C.border; }}
            >
              <input type="radio" name="metodo" value={m.id} checked={metodo === m.id} onChange={() => setMetodo(m.id)} style={{ display: "none" }}/>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: metodo === m.id ? 700 : 500, color: metodo === m.id ? C.brand : C.text }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>{m.desc}</p>
              </div>
              {metodo === m.id && (
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Dirección confirmada */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>📍 Dirección de entrega</h4>
            {/* FIX DISEÑO: "Cambiar" sin flecha */}
            <button onClick={onVolver} style={{ fontSize: 12, color: C.brand, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Cambiar</button>
          </div>
          <p style={{ margin: "0 0 2px", fontSize: 13, color: C.textSec }}>{datosEnvio.nombre} {datosEnvio.apellido}</p>
          <p style={{ margin: "0 0 2px", fontSize: 13, color: C.textSec }}>{datosEnvio.direccion}, {datosEnvio.ciudad}</p>
          {datosEnvio.telefono && <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>{datosEnvio.telefono}</p>}
        </div>
      </div>

      {/* Resumen + confirmar */}
      <div className="carrito-resumen">
        <ResumenPedido
          items={items}
          totalPrecio={totalPrecio}
          accion={handleConfirmar}
          textoBtn={usuario ? "Confirmar pedido" : "Inicia sesión para pagar"}
          disabled={!usuario}
          cargando={procesando}
          onVolver={onVolver}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
export default function Carrito() {
  const [paso, setPaso] = useState(0);
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: "", apellido: "", telefono: "",
    direccion: "", ciudad: "", departamento: "", notas: "",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        .carrito-grid { grid-template-columns: 1fr; }
        .carrito-resumen { width: 100%; }
        @media(min-width: 1024px) {
          .carrito-grid       { grid-template-columns: 1fr 380px !important; }
          .carrito-resumen    { position: relative; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas }}>

        {/* Banner */}
        <div style={{ background: C.brandDark, padding: "9px 0", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            🚚 Envío gratis en compras mayores a <strong style={{ color: "#a3e635" }}>$80.000</strong> — Bogotá y área metropolitana
          </p>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 64px" }}>
          <div style={{ marginBottom: 8 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: C.text, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>
              {paso === 0 ? "Tu carrito" : paso === 1 ? "Datos de envío" : "Confirmar pedido"}
            </h1>
          </div>

          <Stepper paso={paso}/>

          <div style={{ animation: "fadeUp 0.3s ease" }} key={paso}>
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