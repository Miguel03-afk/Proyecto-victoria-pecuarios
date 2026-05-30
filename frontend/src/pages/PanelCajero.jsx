// src/pages/PanelCajero.jsx — Victoria Pets · POS diseño PDF
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS, fmt, fdoc } from "../styles/admin.tokens";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping, faClipboardList, faPills, faMagnifyingGlass,
  faBoxOpen, faSun, faMoon, faCreditCard, faMoneyBill, faMobileScreen,
  faShuffle, faPlus, faXmark, faCheck, faTrash, faRightFromBracket,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

const METODOS = [
  { id: "efectivo",      label: "Efectivo" },
  { id: "tarjeta",       label: "Tarjeta"  },
  { id: "transferencia", label: "Nequi"    },
  { id: "mixto",         label: "Mixto"    },
];

const CATEGORIAS = ["Todos", "Alimento", "Medicamento", "Servicios"];

/* ─── Tile producto ──────────────────────────────────────────────────────── */
function ProductoTile({ p, onAdd, C }) {
  const stockBadge = p.stock !== undefined ? p.stock : "—";
  const stockColor =
    p.stock === 0 ? C.danger :
    p.stock <= (p.stock_minimo || 5) ? C.coral :
    C.brand;

  return (
    <button
      onClick={() => onAdd(p)}
      disabled={p.stock === 0}
      style={{
        position: "relative",
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: RADIUS.lg,
        padding: 0,
        overflow: "hidden",
        textAlign: "left",
        cursor: p.stock === 0 ? "not-allowed" : "pointer",
        opacity: p.stock === 0 ? 0.55 : 1,
        transition: "all 0.15s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => { if (p.stock > 0) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = C.shadowSm; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Imagen */}
      <div style={{
        position: "relative",
        aspectRatio: "16 / 11",
        background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 14px, ${C.surfaceAlt} 14px 28px)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {p.imagen_url && (
          <img src={p.imagen_url} alt={p.nombre}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; }}/>
        )}
        <span style={{
          position: "absolute", top: 8, right: 8,
          padding: "2px 8px", borderRadius: RADIUS.sm,
          background: stockColor === C.brand ? C.brandSoft : stockColor === C.coral ? C.coralSoft : C.dangerBg,
          color: stockColor,
          fontSize: 11, fontWeight: 700,
          fontFamily: FONT.mono,
        }}>
          {stockBadge}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {p.marca && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: 9, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.2,
            color: C.muted,
          }}>{p.marca}</span>
        )}
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600,
          color: C.ink, lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 32,
        }}>
          {p.nombre}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{
            fontFamily: FONT.display,
            fontSize: 16, fontWeight: 700,
            color: C.ink,
          }}>
            {fmt(p.precio)}
          </span>
          <span style={{
            width: 24, height: 24, borderRadius: "50%",
            background: C.brand, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700,
          }}>+</span>
        </div>
      </div>
    </button>
  );
}

/* ─── Sección Nueva Venta ────────────────────────────────────────────────── */
function NuevaVenta({ usuario }) {
  const { C } = useTheme();
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [cargandoProds, setCargandoProds] = useState(false);
  const [catActiva, setCatActiva] = useState("Todos");

  const [cart, setCart] = useState([]);
  const [clienteBus, setClienteBus] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);

  const [metodo, setMetodo] = useState("tarjeta");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(null);
  const [error, setError] = useState("");

  const buscarRef = useRef(null);

  // Búsqueda productos
  useEffect(() => {
    setCargandoProds(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/cajero/productos", { params: { buscar: busqueda || "" } });
        setProductos(data);
      } catch { setProductos([]); }
      finally { setCargandoProds(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  // Búsqueda clientes
  useEffect(() => {
    if (!clienteBus.trim()) { setClientes([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/cajero/clientes", { params: { buscar: clienteBus } });
        setClientes(data);
      } catch { setClientes([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [clienteBus]);

  // Atajo F2 → focus buscador
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "F2") { e.preventDefault(); buscarRef.current?.focus(); }
      if (e.key === "Escape") setError("");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const agregar = (p) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.producto.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { producto: p, cantidad: 1 }];
    });
  };

  const cambiarCant = (id, delta) => {
    setCart(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i));
  };

  const quitar = (id) => setCart(prev => prev.filter(i => i.producto.id !== id));

  const subtotal = cart.reduce((a, i) => a + i.producto.precio * i.cantidad, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  const [ventaSnapshot, setVentaSnapshot] = useState(null);

  const registrar = async () => {
    if (!cart.length) return setError("Agrega al menos un producto.");
    setError(""); setEnviando(true);
    try {
      const { data } = await api.post("/cajero/facturas", {
        usuario_id: clienteSel?.id || null,
        items: cart.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        metodo_pago: metodo,
      });
      // Snapshot para el comprobante imprimible
      setVentaSnapshot({
        items: cart.map(i => ({
          nombre: i.producto.nombre,
          marca:  i.producto.marca,
          cantidad: i.cantidad,
          precio_unitario: Number(i.producto.precio),
          subtotal: Number(i.producto.precio) * i.cantidad,
        })),
        cliente: clienteSel
          ? `${clienteSel.nombre} ${clienteSel.apellido || ""}`.trim()
          : "Cliente general",
        clienteDoc: clienteSel?.numero_documento || null,
        clienteEmail: clienteSel?.email || null,
        metodo,
        cajero: usuario ? `${usuario.nombre} ${usuario.apellido || ""}`.trim() : "Cajero",
        fecha: new Date(),
      });
      setExito(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar la venta.");
    } finally {
      setEnviando(false);
    }
  };

  const imprimirComprobante = () => {
    if (!exito || !ventaSnapshot) return;
    const fmtCOP = (n) => "$" + Number(n || 0).toLocaleString("es-CO");
    const total = ventaSnapshot.items.reduce((a, i) => a + i.subtotal, 0);
    const subtotal = Math.round(total / 1.19);
    const iva = total - subtotal;
    const fechaStr = ventaSnapshot.fecha.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });

    const html = `
<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Comprobante ${exito.codigo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'General Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    background: #fff; color: #0A1426;
    padding: 32px 28px; max-width: 480px; margin: 0 auto;
    font-size: 12.5px; line-height: 1.45;
  }
  .header { text-align: center; padding-bottom: 18px; border-bottom: 2px solid #1E3A8A; margin-bottom: 18px; }
  .brand { font-size: 22px; font-weight: 700; color: #1E3A8A; letter-spacing: -0.02em; }
  .brand-sub { font-size: 11px; color: #6B7280; margin-top: 2px; letter-spacing: 0.08em; text-transform: uppercase; }
  .biz { font-size: 10.5px; color: #6B7280; margin-top: 10px; line-height: 1.5; }
  .meta { display: flex; justify-content: space-between; margin: 14px 0 18px; padding: 12px 14px; background: #FAF7F0; border-radius: 8px; font-size: 11px; }
  .meta div { line-height: 1.55; }
  .meta strong { color: #0A1426; }
  .meta .lbl { color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; font-size: 9.5px; font-weight: 600; }
  h3 { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6B7280; text-align: left; padding: 6px 0; border-bottom: 1px solid #EAE3D2; }
  th.r { text-align: right; }
  td { padding: 8px 0; border-bottom: 1px dashed #EAE3D2; font-size: 12px; vertical-align: top; }
  td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .item-name { font-weight: 600; color: #0A1426; }
  .item-marca { font-size: 10px; color: #6B7280; margin-top: 1px; }
  .totales { margin-top: 14px; padding-top: 12px; border-top: 2px solid #0A1426; }
  .tot-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .tot-row.big { font-size: 17px; font-weight: 700; color: #1E3A8A; margin-top: 6px; padding-top: 8px; border-top: 1px solid #EAE3D2; }
  .footer { margin-top: 26px; padding-top: 16px; border-top: 1px dashed #D6CDB7; text-align: center; font-size: 10.5px; color: #6B7280; line-height: 1.55; }
  .ticket { font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace; font-weight: 700; color: #1E3A8A; }
  @media print {
    body { padding: 16px; }
    .footer { page-break-inside: avoid; }
  }
</style>
</head><body>
  <div class="header">
    <div class="brand">Victoria · Pets</div>
    <div class="brand-sub">Clínica veterinaria + tienda</div>
    <div class="biz">
      Cra. 5 #34-12, Ibagué · Tolima<br>
      +57 310 555 4321 · victoriapets.com
    </div>
  </div>

  <div class="meta">
    <div>
      <div class="lbl">Ticket</div>
      <div class="ticket">${exito.codigo}</div>
    </div>
    <div style="text-align:right">
      <div class="lbl">Fecha</div>
      <div><strong>${fechaStr}</strong></div>
    </div>
  </div>

  <div style="display:flex; gap:14px; justify-content:space-between; margin-bottom:6px; font-size:11px;">
    <div><span class="lbl">Cliente</span><br><strong>${ventaSnapshot.cliente}</strong>${ventaSnapshot.clienteDoc ? `<br><span style="color:#6B7280">${ventaSnapshot.clienteDoc}</span>` : ""}</div>
    <div style="text-align:right"><span class="lbl">Atendido por</span><br><strong>${ventaSnapshot.cajero}</strong></div>
  </div>

  <h3>Detalle</h3>
  <table>
    <thead><tr>
      <th style="width:40px">Cant</th>
      <th>Producto</th>
      <th class="r">Subtotal</th>
    </tr></thead>
    <tbody>
      ${ventaSnapshot.items.map(it => `
        <tr>
          <td><strong>${it.cantidad}</strong></td>
          <td>
            <div class="item-name">${it.nombre}</div>
            ${it.marca ? `<div class="item-marca">${it.marca} · ${fmtCOP(it.precio_unitario)} c/u</div>` : ""}
          </td>
          <td class="r">${fmtCOP(it.subtotal)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totales">
    <div class="tot-row"><span>Subtotal</span><span>${fmtCOP(subtotal)}</span></div>
    <div class="tot-row"><span>IVA (19%)</span><span>${fmtCOP(iva)}</span></div>
    <div class="tot-row"><span>Método de pago</span><span style="text-transform:capitalize">${ventaSnapshot.metodo}</span></div>
    <div class="tot-row big"><span>Total</span><span>${fmtCOP(total)}</span></div>
  </div>

  <div class="footer">
    Gracias por confiar en Victoria Pets 🐾<br>
    Conserva este comprobante para cualquier reclamo o devolución.<br>
    <span style="opacity:0.7">Documento generado automáticamente por el POS.</span>
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 250); };
  </script>
</body></html>`;

    const w = window.open("", "_blank", "width=520,height=720");
    if (!w) { alert("No pudimos abrir la ventana de impresión. Verifica el bloqueador de pop-ups."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  };

  const nuevaVenta = () => {
    setCart([]); setClienteSel(null); setClienteBus(""); setExito(null);
    setVentaSnapshot(null);
    setError(""); setMetodo("tarjeta"); setBusqueda("");
  };

  // Ticket code
  const ticketCode = exito?.codigo || `VP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  if (exito) return (
    <div style={{
      maxWidth: 520, margin: "60px auto", padding: 40,
      background: C.surface, border: `1px solid ${C.successBorder}`,
      borderRadius: RADIUS.lg, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: C.successBg, border: `2px solid ${C.successBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, margin: "0 auto 18px",
      }}>✓</div>
      <h2 style={{
        margin: "0 0 8px",
        fontFamily: FONT.display,
        fontWeight: 600, fontSize: 26, color: C.ink,
      }}>
        ¡Venta registrada!
      </h2>
      <p style={{ margin: "0 0 18px", fontSize: 14, color: C.ink3 }}>
        Ticket <strong style={{ fontFamily: FONT.mono, color: C.ink }}>#{exito.codigo}</strong>
        {" "}por <strong style={{ color: C.brand, fontFamily: FONT.mono }}>{fmt(exito.total)}</strong>
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={imprimirComprobante} style={{
          padding: "12px 24px", borderRadius: RADIUS.sm,
          background: C.lime, color: C.brandDark,
          border: `1px solid ${C.limeDark}`,
          fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit",
        }}>
          🖨 Imprimir comprobante
        </button>
        <button onClick={nuevaVenta} style={{
          padding: "12px 28px", borderRadius: RADIUS.sm,
          background: C.brand, color: "#fff",
          border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          Nueva venta
        </button>
      </div>
    </div>
  );

  return (
    <div className="vp-pos-layout" style={{
      display: "grid",
      gridTemplateColumns: "1fr 380px",
      gap: 0,
      height: "calc(100vh - 0px)",
    }}>
      {/* Panel productos */}
      <div style={{ padding: "24px 28px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: C.lime || '#7BC142',
            marginBottom: 6,
          }}>
            <span style={{ width: 16, height: 1, backgroundColor: C.lime || '#7BC142' }} />
            Punto de venta · Caja 1
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: FONT.display,
            fontWeight: 500, fontSize: 36,
            color: C.ink, letterSpacing: -0.4, lineHeight: 1.05,
          }}>
            Nueva venta
          </h1>
        </div>

        {/* Buscador + Stock */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)",
              color: C.muted, fontSize: 14,
            }}>🔍</span>
            <input
              ref={buscarRef}
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o escanea"
              style={{
                width: "100%", height: 42,
                padding: "0 60px 0 40px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink,
                fontSize: 13, fontFamily: FONT.ui,
                outline: "none",
              }}
            />
            <span style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              padding: "2px 8px", borderRadius: RADIUS.sm,
              border: `1px solid ${C.lineStrong}`,
              background: C.surfaceAlt,
              fontSize: 10, fontWeight: 600,
              color: C.ink3, fontFamily: FONT.mono,
            }}>F2</span>
          </div>
          <button style={{
            padding: "0 18px", height: 42,
            borderRadius: RADIUS.sm,
            border: `1px solid ${C.lineStrong}`,
            background: C.surface, color: C.ink,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: FONT.ui,
          }}>
            📦 Stock
          </button>
        </div>

        {/* Categorías */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
          {CATEGORIAS.map(cat => {
            const activo = catActiva === cat;
            return (
              <button key={cat} onClick={() => setCatActiva(cat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: RADIUS.pill,
                  background: activo ? C.brand : "transparent",
                  color: activo ? "#fff" : C.ink2,
                  border: `1px solid ${activo ? C.brand : C.lineStrong}`,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: FONT.ui,
                }}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid productos */}
        {cargandoProds ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                height: 180,
                background: C.surfaceAlt,
                borderRadius: RADIUS.lg,
              }}/>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: C.surface, border: `1px solid ${C.line}`,
            borderRadius: RADIUS.lg,
            color: C.ink3, fontSize: 14,
          }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : "Busca o escanea un producto"}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}>
            {productos.map(p => (
              <ProductoTile key={p.id} p={p} onAdd={agregar} C={C}/>
            ))}
          </div>
        )}
      </div>

      {/* Panel Ticket */}
      <aside style={{
        background: C.surface,
        borderLeft: `1px solid ${C.line}`,
        display: "flex", flexDirection: "column",
        height: "100vh",
        position: "sticky", top: 0,
      }}>
        {/* Header ticket */}
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{
            fontSize: 11, color: C.ink3, fontWeight: 500,
            fontFamily: FONT.mono,
          }}>
            Ticket #{ticketCode}
          </div>
          <h3 style={{
            margin: "4px 0 0",
            fontFamily: FONT.display,
            fontWeight: 600, fontSize: 22, color: C.ink,
          }}>
            Venta actual
          </h3>
        </div>

        {/* Cliente */}
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.line}` }}>
          {clienteSel ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: C.coral, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
              }}>
                {clienteSel.nombre?.charAt(0).toUpperCase()}{clienteSel.apellido?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>
                  {clienteSel.nombre} {clienteSel.apellido}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: C.ink3 }}>
                  {clienteSel.email}
                </p>
              </div>
              <button onClick={() => setClienteSel(null)} style={{
                fontSize: 12, color: C.brand,
                background: "transparent", border: "none",
                cursor: "pointer", fontWeight: 600,
              }}>
                Cambiar
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={clienteBus}
                onChange={e => setClienteBus(e.target.value)}
                placeholder="Buscar cliente (opcional)"
                style={{
                  width: "100%", height: 36,
                  padding: "0 12px",
                  borderRadius: RADIUS.sm,
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surfaceAlt, color: C.ink,
                  fontSize: 12, fontFamily: FONT.ui,
                  outline: "none",
                }}
              />
              {clientes.length > 0 && (
                <div style={{ marginTop: 6, maxHeight: 140, overflowY: "auto" }}>
                  {clientes.map(c => (
                    <button key={c.id} onClick={() => { setClienteSel(c); setClienteBus(""); setClientes([]); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: RADIUS.sm,
                        background: "transparent",
                        border: "none", cursor: "pointer",
                        fontSize: 12, color: C.ink,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surfaceAlt}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {c.nombre} {c.apellido} <span style={{ color: C.muted }}>· {c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
          {cart.length === 0 ? (
            <div style={{
              padding: "40px 12px",
              textAlign: "center",
              color: C.ink3, fontSize: 13,
            }}>
              <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 30, marginBottom: 12, color: C.muted, display: "block" }}/>
              Sin productos aún
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map(({ producto, cantidad }) => (
                <div key={producto.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: RADIUS.sm,
                    background: C.brandSoft,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>🛍</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: 600, color: C.ink,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {producto.nombre}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: C.ink3, fontFamily: FONT.mono }}>
                      {fmt(producto.precio)} c/u
                    </p>
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    border: `1px solid ${C.lineStrong}`,
                    borderRadius: RADIUS.sm, overflow: "hidden",
                  }}>
                    <button onClick={() => cambiarCant(producto.id, -1)}
                      style={{
                        width: 24, height: 24, border: "none",
                        background: "transparent", color: C.ink,
                        cursor: "pointer", fontSize: 14,
                      }}>−</button>
                    <span style={{
                      minWidth: 22, fontSize: 11, fontWeight: 700,
                      color: C.ink, textAlign: "center",
                      fontFamily: FONT.mono,
                    }}>{cantidad}</span>
                    <button onClick={() => cambiarCant(producto.id, 1)}
                      style={{
                        width: 24, height: 24, border: "none",
                        background: "transparent", color: C.ink,
                        cursor: "pointer", fontSize: 14,
                      }}>+</button>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: C.ink, fontFamily: FONT.mono,
                    minWidth: 60, textAlign: "right",
                  }}>
                    {fmt(producto.precio * cantidad)}
                  </span>
                  <button onClick={() => quitar(producto.id)}
                    style={{
                      width: 22, height: 22, border: "none",
                      background: "transparent", color: C.muted,
                      cursor: "pointer", fontSize: 14,
                    }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales + métodos */}
        <div style={{ padding: "16px 22px 20px", borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink2 }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: FONT.mono }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink2 }}>
              <span>IVA 19%</span>
              <span style={{ fontFamily: FONT.mono }}>{fmt(iva)}</span>
            </div>
            <button style={{
              background: "transparent", border: "none",
              color: C.brand, fontSize: 11, fontWeight: 600,
              cursor: "pointer", textAlign: "left", padding: 0,
            }}>
              + Aplicar descuento
            </button>
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Total a pagar</span>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700, fontSize: 26,
              color: C.ink, letterSpacing: -0.5,
            }}>
              {fmt(total)}
            </span>
          </div>

          {/* Métodos pago */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6, marginBottom: 12,
          }}>
            {METODOS.map(m => {
              const activo = metodo === m.id;
              return (
                <button key={m.id} onClick={() => setMetodo(m.id)}
                  style={{
                    padding: "10px 6px",
                    borderRadius: RADIUS.sm,
                    border: `1.5px solid ${activo ? C.brand : C.lineStrong}`,
                    background: activo ? C.brandSoft : C.surface,
                    color: activo ? C.brand : C.ink2,
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                  {m.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div style={{
              padding: "8px 12px", marginBottom: 12,
              borderRadius: RADIUS.sm,
              background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
              color: C.danger, fontSize: 12,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 8 }}>
            <button style={{
              height: 42, borderRadius: RADIUS.sm,
              border: `1px solid ${C.lineStrong}`,
              background: C.surface, color: C.ink,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT.ui,
            }}>
              Guardar
            </button>
            <button
              onClick={registrar}
              disabled={enviando || cart.length === 0}
              style={{
                height: 42, borderRadius: RADIUS.sm,
                border: "none",
                background: cart.length === 0 || enviando ? C.surfaceAlt : C.brand,
                color: cart.length === 0 || enviando ? C.muted : "#fff",
                fontSize: 13, fontWeight: 700,
                fontFamily: FONT.ui,
                cursor: cart.length === 0 || enviando ? "default" : "pointer",
                transition: "background 0.15s",
              }}>
              {enviando ? "Procesando..." : `✓ Cobrar ${fmt(total)}`}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─── Sección Historial ──────────────────────────────────────────────────── */
function Historial() {
  const { C } = useTheme();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/cajero/mis-ventas")
      .then(({ data }) => setVentas(data))
      .finally(() => setCargando(false));
  }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const ventasHoy = ventas.filter(v => v.created_at?.startsWith(hoy));

  if (cargando) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `2px solid ${C.brandSoft}`, borderTopColor: C.brand,
        animation: "vp-spin 0.8s linear infinite",
      }}/>
    </div>
  );

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1100 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: C.lime || '#7BC142',
        marginBottom: 6,
      }}>
        <span style={{ width: 16, height: 1, backgroundColor: C.lime || '#7BC142' }} />
        Operación · Historial
      </div>
      <h1 style={{
        margin: "0 0 28px",
        fontFamily: FONT.display,
        fontWeight: 500, fontSize: 36,
        color: C.ink, letterSpacing: -0.4, lineHeight: 1.05,
      }}>
        Mis ventas
      </h1>

      {/* KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginBottom: 28,
      }}>
        {[
          { label: "Ventas hoy", value: ventasHoy.length, accent: C.navy || '#1E3A8A' },
          { label: "Facturado hoy", value: fmt(ventasHoy.reduce((a, v) => a + Number(v.total || 0), 0)), accent: C.lime || '#7BC142' },
          { label: "Total ventas", value: ventas.length, accent: C.purple || '#9B5DE5' },
        ].map(k => (
          <div key={k.label} style={{
            padding: 22, position: 'relative', overflow: 'hidden',
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            transition: 'transform 200ms ease, box-shadow 200ms ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 18px 36px -20px ${k.accent}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div aria-hidden="true" style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${k.accent} 0%, ${k.accent}00 100%)`,
            }}/>
            <span style={{
              fontSize: 10, fontWeight: 800,
              color: k.accent, textTransform: "uppercase", letterSpacing: '0.16em',
            }}>
              {k.label}
            </span>
            <div style={{
              marginTop: 10,
              fontFamily: FONT.display,
              fontWeight: 700, fontSize: 32,
              color: C.ink, letterSpacing: '-0.025em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {ventas.length === 0 ? (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: C.surface, border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg, color: C.ink3,
        }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 80px 120px 120px 140px",
            gap: 14,
            padding: "14px 20px",
            background: C.canvas,
            borderBottom: `1px solid ${C.line}`,
            fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.5,
            color: C.ink3,
          }}>
            <span>Código</span>
            <span>Cliente</span>
            <span>Items</span>
            <span>Método</span>
            <span style={{ textAlign: "right" }}>Total</span>
            <span>Fecha</span>
          </div>
          {ventas.map((v, i) => (
            <div key={v.id} style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 80px 120px 120px 140px",
              gap: 14,
              padding: "12px 20px",
              fontSize: 13,
              borderBottom: i < ventas.length - 1 ? `1px solid ${C.line}` : "none",
              alignItems: "center",
            }}>
              <span style={{ fontFamily: FONT.mono, color: C.brand, fontWeight: 700, fontSize: 11 }}>
                {v.codigo}
              </span>
              <span style={{ color: C.ink2 }}>{v.cliente || "—"}</span>
              <span style={{ color: C.ink3, fontFamily: FONT.mono }}>{v.items}</span>
              <span style={{ color: C.ink3, textTransform: "capitalize" }}>{v.metodo_pago}</span>
              <span style={{ color: C.ink, fontWeight: 700, fontFamily: FONT.mono, textAlign: "right" }}>
                {fmt(v.total)}
              </span>
              <span style={{ color: C.muted, fontSize: 11 }}>{fdoc(v.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sección: Consultas para cobrar ─────────────────────────────────── */
function ConsultasPago() {
  const { C } = useTheme();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [items, setItems] = useState([]);
  const [pagando, setPagando] = useState(false);
  const [metodo, setMetodo] = useState("efectivo");
  const [msg, setMsg] = useState({});

  const cargar = () => {
    setCargando(true);
    api.get("/ordenes-servicio/cajero/pendientes-pago")
      .then(r => setOrdenes(r.data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const verDetalle = async (id) => {
    setSeleccionada(id);
    try {
      const r = await api.get(`/ordenes-servicio/${id}`);
      setItems(r.data.items || []);
    } catch {}
  };

  const cobrar = async () => {
    if (!seleccionada) return;
    setPagando(true);
    try {
      await api.patch(`/ordenes-servicio/${seleccionada}/pagar`, { metodo_pago: metodo });
      setMsg({ texto: `Consulta cobrada. ¡Gracias por preferirnos!`, tipo: "ok" });
      setSeleccionada(null);
      cargar();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error", tipo: "err" });
    } finally { setPagando(false); }
  };

  const orden = ordenes.find(o => o.id === seleccionada);

  return (
    <div style={{ padding: "24px 28px" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.ink3 }}>Cajero · Consultas</span>
      <h1 style={{
        margin: "4px 0 24px",
        fontFamily: FONT.display,
        fontWeight: 600, fontSize: 30, color: C.ink,
      }}>
        Cobrar consultas veterinarias
      </h1>

      {msg.texto && (
        <div style={{
          padding: "12px 16px", marginBottom: 18,
          borderRadius: RADIUS.sm,
          background: msg.tipo === "ok" ? C.successBg : C.dangerBg,
          border: `1px solid ${msg.tipo === "ok" ? C.successBorder : C.dangerBorder}`,
          color: msg.tipo === "ok" ? C.success : C.danger,
          fontSize: 13, fontWeight: 600,
        }}>
          {msg.texto}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: seleccionada ? "1fr 380px" : "1fr",
        gap: 18, alignItems: "flex-start",
      }} className="vp-cajero-consultas-grid">

        <div>
          {cargando ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: `2px solid ${C.brandSoft}`, borderTopColor: C.brand,
                animation: "vp-spin 0.8s linear infinite",
                margin: "0 auto",
              }}/>
            </div>
          ) : ordenes.length === 0 ? (
            <div style={{
              padding: 60, textAlign: "center",
              background: C.surface, border: `1px solid ${C.line}`,
              borderRadius: RADIUS.lg, color: C.ink3, fontSize: 14,
            }}>
              Sin consultas esperando pago
            </div>
          ) : (
            <div style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: RADIUS.lg, overflow: "hidden",
            }}>
              {ordenes.map((o, i) => {
                const sel = seleccionada === o.id;
                return (
                  <button key={o.id} onClick={() => verDetalle(o.id)} style={{
                    display: "flex", width: "100%", textAlign: "left",
                    padding: "14px 20px", gap: 14,
                    background: sel ? C.purpleSoft : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${sel ? C.purple : "transparent"}`,
                    borderBottom: i < ordenes.length - 1 ? `1px solid ${C.line}` : "none",
                    cursor: "pointer", alignItems: "center",
                    fontFamily: FONT.ui,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: RADIUS.sm,
                      background: C.purpleBg, color: C.purple,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0,
                    }}>
                      <FontAwesomeIcon icon={faPills}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>
                        {o.nombre_mascota || "—"} · {o.cliente_nombre} {o.cliente_apellido}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>
                        {o.codigo} · {o.items_count} insumo{o.items_count !== 1 ? "s" : ""}
                        {o.vet_nombre && <> · Dr(a). {o.vet_nombre}</>}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: FONT.display, fontWeight: 700,
                      fontSize: 16, color: C.purpleDeep,
                    }}>
                      {fmt(o.total)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel detalle */}
        {orden && (
          <aside style={{
            position: "sticky", top: 24,
            background: C.surface,
            border: `1px solid ${C.purpleBorder}`,
            borderRadius: RADIUS.lg,
            overflow: "hidden",
            fontFamily: FONT.ui,
          }}>
            <div style={{
              padding: "16px 18px",
              background: C.purpleSoft,
              borderBottom: `1px solid ${C.purpleBorder}`,
            }}>
              <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 11, color: C.purple, fontWeight: 700 }}>
                {orden.codigo}
              </p>
              <h3 style={{
                margin: "4px 0 0",
                fontFamily: FONT.display,
                fontWeight: 600, fontSize: 18, color: C.purpleDeep,
              }}>
                Consulta veterinaria
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: C.ink3 }}>
                {orden.nombre_mascota} · {orden.especie_mascota}
              </p>
            </div>

            <div style={{ padding: "16px 18px", maxHeight: 320, overflowY: "auto" }}>
              {orden.motivo_consulta && (
                <p style={{ margin: "0 0 12px", fontSize: 12, color: C.ink2 }}>
                  “{orden.motivo_consulta}”
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: C.ink3 }}>Consulta base</span>
                  <span style={{ fontFamily: FONT.mono, color: C.ink }}>{fmt(orden.precio_consulta)}</span>
                </div>
                {items.map(it => (
                  <div key={it.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 12, padding: "4px 0",
                  }}>
                    <span style={{ color: C.ink2, flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <FontAwesomeIcon icon={faPills} style={{ color: C.purple, fontSize: 11 }}/>
                      {it.nombre_snap} <span style={{ color: C.ink3 }}>×{it.cantidad}</span>
                    </span>
                    <span style={{ fontFamily: FONT.mono, color: C.ink }}>{fmt(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 14, paddingTop: 12,
                borderTop: `1px solid ${C.line}`,
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Total</span>
                <span style={{
                  fontFamily: FONT.display, fontWeight: 700,
                  fontSize: 24, color: C.purpleDeep, letterSpacing: -0.3,
                }}>
                  {fmt(orden.total)}
                </span>
              </div>
            </div>

            <div style={{ padding: "14px 18px", background: C.surfaceAlt, borderTop: `1px solid ${C.line}` }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1,
                color: C.ink3, marginBottom: 8,
              }}>
                Método de pago
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 12 }}>
                {["efectivo", "tarjeta", "transferencia"].map(m => {
                  const activo = metodo === m;
                  return (
                    <button key={m} onClick={() => setMetodo(m)} style={{
                      padding: "8px 6px", borderRadius: RADIUS.sm,
                      border: `1.5px solid ${activo ? C.purple : C.lineStrong}`,
                      background: activo ? C.purpleBg : C.surface,
                      color: activo ? C.purple : C.ink2,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      textTransform: "capitalize",
                    }}>{m}</button>
                  );
                })}
              </div>
              <button onClick={cobrar} disabled={pagando} style={{
                width: "100%", padding: "12px",
                borderRadius: RADIUS.sm, border: "none",
                background: pagando ? C.surfaceAlt : C.purple,
                color: pagando ? C.muted : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: pagando ? "default" : "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: FONT.ui,
              }}>
                {pagando ? "Procesando..." : `✓ Cobrar ${fmt(orden.total)}`}
              </button>
            </div>
          </aside>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .vp-cajero-consultas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Layout principal ───────────────────────────────────────────────────── */
const NAV = [
  { id: "venta",       icon: faCartShopping,   label: "Nueva venta" },
  { id: "consultas",   icon: faPills,           label: "Consultas"   },
  { id: "historial",   icon: faClipboardList,   label: "Historial"   },
];

function GestionTurno({ C, turno, onAbrir, onCerrar, abriendoFlow }) {
  // Muestra el bloqueo (no hay turno) o el banner (turno activo)
  const [montoAp, setMontoAp]   = useState("");
  const [obsAp, setObsAp]       = useState("");
  const [montoCi, setMontoCi]   = useState("");
  const [obsCi, setObsCi]       = useState("");
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [proc, setProc]         = useState(false);
  const [err, setErr]           = useState("");

  if (!turno) {
    // Overlay bloqueante de apertura
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,37,99,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}>
        <div style={{
          width: "100%", maxWidth: 440,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 18, padding: 28,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.025em" }}>
            Abre tu turno de caja
          </h2>
          <p style={{ margin: "8px 0 18px", fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
            Declara el efectivo con el que abres la caja. Al cerrar el turno se
            comparará con el efectivo contado para detectar diferencias.
          </p>

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.ink3, marginBottom: 6 }}>
            Monto de apertura (COP)
          </label>
          <input
            type="number" min="0" step="100"
            value={montoAp} onChange={(e) => { setMontoAp(e.target.value); setErr(""); }}
            placeholder="50000"
            autoFocus
            style={{
              width: "100%", height: 46,
              padding: "0 14px", borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: C.surfaceAlt, color: C.ink,
              fontSize: 15, fontFamily: "inherit", outline: "none",
              fontVariantNumeric: "tabular-nums",
            }}
          />
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.ink3, marginTop: 14, marginBottom: 6 }}>
            Observaciones (opcional)
          </label>
          <input
            type="text" value={obsAp} onChange={(e) => setObsAp(e.target.value)}
            placeholder="Ej. cambio recibido del turno anterior"
            style={{
              width: "100%", height: 42,
              padding: "0 14px", borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: C.surfaceAlt, color: C.ink,
              fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />

          {err && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger, fontSize: 12.5 }}>
              {err}
            </div>
          )}

          <button
            disabled={proc || !montoAp}
            onClick={async () => {
              setErr(""); setProc(true);
              try { await onAbrir(Number(montoAp), obsAp); }
              catch (e) { setErr(e?.response?.data?.error || "Error al abrir turno."); }
              finally { setProc(false); }
            }}
            style={{
              marginTop: 18, width: "100%", height: 48,
              background: (proc || !montoAp) ? "#9CA3AF" : C.brand,
              color: "#FAF7F0", fontWeight: 700,
              borderRadius: 14, border: "none",
              fontSize: 14, cursor: (proc || !montoAp) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}>
            {proc ? "Abriendo…" : "Abrir turno"}
          </button>
        </div>
      </div>
    );
  }

  // Turno activo — banner superior con info y acción de cerrar
  const fmtCOP = (n) => "$" + Number(n || 0).toLocaleString("es-CO");
  const desde = new Date(turno.abierto_at).toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

  return (
    <>
      <div style={{
        background: `linear-gradient(135deg, ${C.brand}, ${C.brandDark})`,
        color: "#FAF7F0",
        padding: "10px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
        fontSize: 12.5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.lime, boxShadow: `0 0 0 3px ${C.lime}44` }}/>
            Turno abierto
          </span>
          <span style={{ opacity: 0.85 }}>Desde {desde}</span>
          <span style={{ opacity: 0.85 }}>Base: <strong style={{ fontVariantNumeric: "tabular-nums" }}>{fmtCOP(turno.monto_apertura)}</strong></span>
        </div>
        <button
          onClick={() => setConfirmarCierre(true)}
          style={{
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.16)", color: "#FAF7F0",
            border: "1px solid rgba(255,255,255,0.28)",
            fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.26)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}>
          Cerrar turno
        </button>
      </div>

      {confirmarCierre && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            width: "100%", maxWidth: 440,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 18, padding: 28,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)",
          }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.025em" }}>
              Cerrar turno
            </h2>
            <p style={{ margin: "8px 0 18px", fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
              Declara el efectivo contado al cierre. El sistema calcula la
              diferencia automáticamente.
            </p>

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.ink3, marginBottom: 6 }}>
              Monto contado en caja (COP)
            </label>
            <input
              type="number" min="0" step="100"
              value={montoCi} onChange={(e) => { setMontoCi(e.target.value); setErr(""); }}
              placeholder="125000"
              autoFocus
              style={{
                width: "100%", height: 46,
                padding: "0 14px", borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                background: C.surfaceAlt, color: C.ink,
                fontSize: 15, fontFamily: "inherit", outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.ink3, marginTop: 14, marginBottom: 6 }}>
              Observaciones (opcional)
            </label>
            <input
              type="text" value={obsCi} onChange={(e) => setObsCi(e.target.value)}
              placeholder="Ej. faltante por vuelto entregado"
              style={{
                width: "100%", height: 42,
                padding: "0 14px", borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                background: C.surfaceAlt, color: C.ink,
                fontSize: 13, fontFamily: "inherit", outline: "none",
              }}
            />

            {err && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger, fontSize: 12.5 }}>
                {err}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setConfirmarCierre(false)} disabled={proc}
                style={{
                  flex: 1, height: 46,
                  background: "transparent", color: C.ink2,
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  fontSize: 13.5, fontWeight: 600,
                  cursor: proc ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}>
                Cancelar
              </button>
              <button
                disabled={proc || !montoCi}
                onClick={async () => {
                  setErr(""); setProc(true);
                  try {
                    await onCerrar(Number(montoCi), obsCi);
                    setConfirmarCierre(false);
                  } catch (e) { setErr(e?.response?.data?.error || "Error al cerrar turno."); }
                  finally { setProc(false); }
                }}
                style={{
                  flex: 1, height: 46,
                  background: (proc || !montoCi) ? "#9CA3AF" : C.brand,
                  color: "#FAF7F0", fontWeight: 700,
                  borderRadius: 12, border: "none",
                  fontSize: 13.5, cursor: (proc || !montoCi) ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}>
                {proc ? "Cerrando…" : "Cerrar turno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PanelCajero() {
  const { C, toggle, mode } = useTheme();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("venta");
  const [turno, setTurno] = useState(undefined); // undefined=cargando, null=sin turno, obj=turno activo

  const cargarTurno = async () => {
    try {
      const { data } = await api.get("/cajero/turno-actual");
      setTurno(data || null);
    } catch {
      setTurno(null);
    }
  };

  useEffect(() => {
    if (usuario && !["cajero", "admin", "superadmin"].includes(usuario.rol)) {
      navigate("/");
    } else if (usuario) {
      cargarTurno();
    }
  }, [usuario, navigate]);

  const abrirTurno = async (monto_apertura, observaciones) => {
    await api.post("/cajero/turno/abrir", { monto_apertura, observaciones });
    await cargarTurno();
  };
  const cerrarTurno = async (monto_cierre, observaciones) => {
    const { data } = await api.post("/cajero/turno/cerrar", { monto_cierre, observaciones });
    await cargarTurno();
    alert(
      `Turno cerrado.\n\n` +
      `Base apertura: $${Number(data.monto_apertura).toLocaleString("es-CO")}\n` +
      `Ventas efectivo: $${Number(data.total_ventas).toLocaleString("es-CO")}\n` +
      `Esperado en caja: $${Number(data.esperado_caja).toLocaleString("es-CO")}\n` +
      `Contado: $${Number(data.monto_cierre).toLocaleString("es-CO")}\n` +
      `Diferencia: $${Number(data.diferencia).toLocaleString("es-CO")}`
    );
  };

  return (
    <>
      <style>{`
        @keyframes vp-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          .vp-pos-layout { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        background: C.canvas,
        fontFamily: FONT.ui,
      }}>

        {/* Sidebar 64px */}
        <aside style={{
          width: 64,
          flexShrink: 0,
          background: C.sidebar,
          borderRight: `1px solid ${C.sidebarBorder}`,
          display: "flex", flexDirection: "column",
          padding: "16px 0",
        }}>
          <Link to="/" title="Volver al sitio" style={{
            width: 36, height: 36, margin: "0 auto 18px",
            borderRadius: RADIUS.sm,
            background: C.lime, color: C.brandDark,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13,
            textDecoration: "none",
            transition: "transform 160ms var(--vp-ease-out)",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            <FontAwesomeIcon icon={faHouse}/>
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 8px", flex: 1 }}>
            {NAV.map(n => {
              const activo = seccion === n.id;
              return (
                <button key={n.id} onClick={() => setSeccion(n.id)}
                  title={n.label}
                  style={{
                    width: 48, height: 44, borderRadius: RADIUS.sm,
                    border: "none",
                    background: activo ? C.sidebarActive : "transparent",
                    color: activo ? C.sidebarTextHi : C.sidebarText,
                    fontSize: 15, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                  <FontAwesomeIcon icon={n.icon}/>
                </button>
              );
            })}
          </div>

          {/* Toggle tema */}
          <button onClick={toggle} title="Tema"
            style={{
              width: 48, height: 44, margin: "0 8px 8px",
              borderRadius: RADIUS.sm,
              border: "none",
              background: "transparent",
              color: C.sidebarText, fontSize: 14, cursor: "pointer",
            }}>
            <FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon}/>
          </button>

          {/* Avatar */}
          <div title={usuario?.nombre || "Cajero"}
            style={{
              width: 36, height: 36, margin: "0 auto",
              borderRadius: "50%",
              background: C.coral, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => { logout(); navigate("/"); }}>
            {usuario?.nombre?.charAt(0)?.toUpperCase() || "C"}
            {usuario?.apellido?.charAt(0)?.toUpperCase() || ""}
          </div>
        </aside>

        {/* Contenido */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {turno && (
            <GestionTurno
              C={C} turno={turno}
              onAbrir={abrirTurno} onCerrar={cerrarTurno}
            />
          )}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {seccion === "venta" && <NuevaVenta usuario={usuario}/>}
            {seccion === "consultas" && <ConsultasPago/>}
            {seccion === "historial" && <Historial/>}
          </div>
        </main>
      </div>

      {/* Overlay bloqueante si no hay turno abierto (turno === null) */}
      {turno === null && usuario?.rol === "cajero" && (
        <GestionTurno C={C} turno={null} onAbrir={abrirTurno} onCerrar={cerrarTurno}/>
      )}
    </>
  );
}
