// src/pages/Producto.jsx — Victoria Pets · diseño PDF
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";

const IVA_PCT = 19;

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  const { C } = useTheme();
  const shimmer = `linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.surface} 50%, ${C.surfaceAlt} 75%)`;
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56,
      }}>
        <div style={{
          aspectRatio: "1 / 1",
          borderRadius: RADIUS.lg,
          background: shimmer, backgroundSize: "200% 100%",
          animation: "vp-shimmer 1.5s infinite",
        }}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[60, 88, 40, 100, 70, 50].map((w, i) => (
            <div key={i} style={{
              height: i === 1 ? 32 : 14,
              width: `${w}%`,
              borderRadius: 4,
              background: shimmer, backgroundSize: "200% 100%",
              animation: "vp-shimmer 1.5s infinite",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Galería (1 grande + 4 thumbs estilo PDF) ───────────────────────────── */
function Galeria({ imagenPrincipal, imagenesExtra, nombre }) {
  const { C } = useTheme();
  const todas = [imagenPrincipal, ...(imagenesExtra || [])].filter(Boolean);
  const [activa, setActiva] = useState(0);

  const placeholder = `repeating-linear-gradient(135deg, ${C.brandSoft} 0 18px, ${C.surfaceAlt} 18px 36px)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Imagen principal */}
      <div style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: RADIUS.lg,
        background: placeholder,
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {todas[activa] ? (
          <img
            src={todas[activa]}
            alt={nombre}
            style={{
              width: "100%", height: "100%",
              objectFit: "contain",
              userSelect: "none",
            }}
            draggable={false}
          />
        ) : (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: 12, textTransform: "uppercase",
            letterSpacing: 0.5, padding: "6px 16px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: RADIUS.pill,
            border: `1px dashed ${C.lineStrong}`,
            color: C.ink3,
          }}>
            foto principal · {nombre.slice(0, 12)}
          </span>
        )}
      </div>

      {/* Thumbnails fila 4 columnas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
      }}>
        {[0, 1, 2, 3].map(i => {
          const img = todas[i + 1] || todas[i] || null;
          const idx = todas[i + 1] ? i + 1 : i;
          return (
            <button key={i}
              onClick={() => setActiva(idx)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: RADIUS.md,
                background: placeholder,
                overflow: "hidden",
                border: `1.5px solid ${activa === idx ? C.brand : C.line}`,
                cursor: "pointer",
                padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.15s",
              }}>
              {img ? (
                <img src={img} alt={`V${i+1}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                  onError={e => { e.target.style.display = "none"; }}/>
              ) : (
                <span style={{
                  fontFamily: FONT.mono, fontSize: 10,
                  color: C.muted, letterSpacing: 0.5,
                }}>
                  V{i + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Panel de compra (derecha) ──────────────────────────────────────────── */
function PanelCompra({ producto, variantes }) {
  const { C } = useTheme();
  const { agregar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [varIdx, setVarIdx] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [error, setError] = useState("");

  const tieneVariantes = variantes && variantes.length > 0;
  const varActiva = tieneVariantes ? variantes[varIdx] : null;

  const precio    = tieneVariantes ? Number(varActiva.precio)        : Number(producto.precio);
  const precAntes = tieneVariantes ? Number(varActiva.precio_antes)  : Number(producto.precio_antes);
  const stock     = tieneVariantes ? varActiva.stock                 : producto.stock;
  const stockMin  = tieneVariantes ? varActiva.stock_minimo          : producto.stock_minimo;
  const hayStock  = stock > 0;
  const dc        = descPct(precio, precAntes);

  const subtotal = precio * cantidad;
  const iva      = subtotal * (IVA_PCT / 100);
  const total    = subtotal + iva;

  const handleAgregar = () => {
    setError("");
    if (!hayStock) return;
    if (cantidad > stock) return setError(`Solo hay ${stock} unidades disponibles.`);
    if (!usuario) { navigate("/login"); return; }

    agregar({
      id: tieneVariantes ? `${producto.id}-v${varActiva.id}` : producto.id,
      producto_id: producto.id,
      variante_id: varActiva?.id || null,
      nombre: tieneVariantes ? `${producto.nombre} — ${varActiva.nombre}` : producto.nombre,
      slug: producto.slug,
      precio,
      imagen_url: producto.imagen_url,
      stock,
      activo: 1,
    }, cantidad);

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Marca eyebrow */}
      {producto.marca && (
        <span style={{
          fontFamily: FONT.mono,
          fontSize: 11, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 2,
          color: C.brand,
        }}>
          {producto.marca}
        </span>
      )}

      {/* Nombre Playfair */}
      <h1 style={{
        margin: "-12px 0 0",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "clamp(28px, 4vw, 40px)",
        lineHeight: 1.05,
        letterSpacing: -0.6,
        color: C.ink,
      }}>
        {producto.nombre}
      </h1>

      {/* Stars + reseñas + estado stock */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{
              color: s <= 4 ? "#F59E0B" : C.muted,
              fontSize: 14,
            }}>★</span>
          ))}
          <span style={{ marginLeft: 6, fontSize: 13, color: C.ink2, fontWeight: 500 }}>
            4.7 · 124 reseñas
          </span>
        </div>
        <span style={{ color: C.line }}>|</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "3px 10px", borderRadius: RADIUS.pill,
          background: hayStock ? C.successBg : C.dangerBg,
          color: hayStock ? C.success : C.danger,
          fontSize: 11, fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}/>
          {hayStock ? (stock <= (stockMin || 5) ? `Últimas ${stock}` : "En stock") : "Sin stock"}
        </span>
      </div>

      {/* Precio */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "clamp(32px, 5vw, 48px)",
          color: C.ink,
          letterSpacing: -1,
          lineHeight: 1,
        }}>
          {fmt(precio)}
        </span>
        {precAntes > 0 && (
          <span style={{
            fontSize: 16, color: C.muted,
            textDecoration: "line-through",
            fontFamily: FONT.mono,
          }}>
            {fmt(precAntes)}
          </span>
        )}
        {dc && (
          <span style={{
            padding: "4px 10px",
            borderRadius: RADIUS.sm,
            background: C.coralSoft,
            color: C.coral,
            fontSize: 12, fontWeight: 800,
            fontFamily: FONT.mono,
          }}>
            -{dc}%
          </span>
        )}
      </div>

      {/* Descripción corta */}
      {producto.descripcion_corta && (
        <p style={{
          margin: 0,
          fontSize: 14, color: C.ink3,
          lineHeight: 1.6,
        }}>
          {producto.descripcion_corta}
        </p>
      )}

      {/* Variantes — chips estilo PDF */}
      {tieneVariantes && (
        <div>
          <p style={{
            margin: "0 0 10px",
            fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.5,
            color: C.ink3,
          }}>
            Presentación
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {variantes.map((v, i) => {
              const activo = i === varIdx;
              const sinStock = v.stock === 0;
              return (
                <button key={v.id}
                  onClick={() => { if (!sinStock) { setVarIdx(i); setCantidad(1); setError(""); } }}
                  disabled={sinStock}
                  style={{
                    padding: "10px 16px",
                    borderRadius: RADIUS.sm,
                    border: `1.5px solid ${activo ? C.brand : C.lineStrong}`,
                    background: activo ? C.brandSoft : sinStock ? C.surfaceAlt : C.surface,
                    color: sinStock ? C.muted : activo ? C.brand : C.ink,
                    fontSize: 13, fontWeight: activo ? 700 : 500,
                    cursor: sinStock ? "not-allowed" : "pointer",
                    opacity: sinStock ? 0.55 : 1,
                    transition: "all 0.15s",
                    fontFamily: FONT.ui,
                  }}>
                  {v.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantidad + CTA */}
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <div style={{
          display: "inline-flex", alignItems: "center",
          border: `1.5px solid ${C.lineStrong}`,
          borderRadius: RADIUS.sm,
          background: C.surface,
          overflow: "hidden",
          height: 50,
        }}>
          <button
            onClick={() => setCantidad(c => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            style={{
              width: 42, height: "100%",
              border: "none", background: "transparent",
              color: cantidad > 1 ? C.ink : C.muted,
              fontSize: 18, cursor: cantidad > 1 ? "pointer" : "default",
              fontFamily: FONT.ui,
            }}>−</button>
          <span style={{
            minWidth: 44, padding: "0 6px",
            fontSize: 16, fontWeight: 700,
            color: C.ink, textAlign: "center",
            fontFamily: FONT.mono,
          }}>
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad(c => Math.min(stock, c + 1))}
            disabled={cantidad >= stock}
            style={{
              width: 42, height: "100%",
              border: "none", background: "transparent",
              color: cantidad < stock ? C.ink : C.muted,
              fontSize: 18, cursor: cantidad < stock ? "pointer" : "default",
              fontFamily: FONT.ui,
            }}>+</button>
        </div>

        <button
          onClick={handleAgregar}
          disabled={!hayStock}
          style={{
            flex: 1, height: 50,
            borderRadius: RADIUS.sm,
            border: "none",
            background: agregado ? C.success : hayStock ? C.brand : C.surfaceAlt,
            color: agregado || hayStock ? "#fff" : C.muted,
            fontSize: 14, fontWeight: 700,
            fontFamily: FONT.ui,
            cursor: hayStock ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (hayStock && !agregado) e.currentTarget.style.background = C.brandMid; }}
          onMouseLeave={e => { if (hayStock && !agregado) e.currentTarget.style.background = C.brand; }}
        >
          {agregado ? "✓ Agregado" : hayStock ? `🛒 Añadir al carrito · ${fmt(total)}` : "Sin stock"}
        </button>

        <button
          onClick={() => setFavorito(f => !f)}
          aria-label="Favorito"
          style={{
            width: 50, height: 50,
            borderRadius: RADIUS.sm,
            border: `1.5px solid ${favorito ? C.coral : C.lineStrong}`,
            background: favorito ? C.coralSoft : C.surface,
            color: favorito ? C.coral : C.ink3,
            fontSize: 18, cursor: "pointer",
            transition: "all 0.15s",
          }}>
          {favorito ? "♥" : "♡"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: RADIUS.sm,
          background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
          color: C.danger, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Garantías 2x2 estilo PDF */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}>
        {[
          { icon: "🚚", titulo: "Envío gratis",         sub: "En Ibagué desde $80.000" },
          { icon: "✓",  titulo: "Garantía oficial",     sub: "Producto verificado" },
          { icon: "🩺", titulo: "Recomendado por vets", sub: "Aprobado por nuestra clínica" },
          { icon: "📍", titulo: "Recoge en tienda",     sub: "Cra. 5 #34-12" },
        ].map(g => (
          <div key={g.titulo} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            borderRadius: RADIUS.sm,
            border: `1px solid ${C.line}`,
            background: C.surface,
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: RADIUS.sm,
              background: C.brandSoft, color: C.brand,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>{g.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
                {g.titulo}
              </div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>
                {g.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IVA info */}
      <p style={{
        margin: 0, fontSize: 11, color: C.muted,
        textAlign: "center",
        padding: "8px 12px",
        borderRadius: RADIUS.sm,
        background: C.surfaceAlt,
      }}>
        IVA 19% incluido · Subtotal {fmt(subtotal)} · IVA {fmt(iva)} · Total <strong style={{ color: C.ink }}>{fmt(total)}</strong>
      </p>
    </div>
  );
}

/* ─── Tabs descripción / especificaciones ────────────────────────────────── */
function TabsInfo({ producto, variantes }) {
  const { C } = useTheme();
  const [tab, setTab] = useState("descripcion");

  const TABS = [
    { id: "descripcion", label: "Descripción" },
    { id: "detalles",    label: "Especificaciones" },
    ...(variantes?.length ? [{ id: "variantes", label: "Presentaciones" }] : []),
  ];

  const specs = [
    { k: "Marca",            v: producto.marca },
    { k: "Especie / Uso",    v: producto.especie },
    { k: "Unidad de venta",  v: producto.unidad },
    { k: "Proveedor",        v: producto.proveedor_nombre },
    { k: "Requiere fórmula", v: producto.requiere_formula ? "Sí" : "No" },
    { k: "Categoría",        v: producto.categoria },
    { k: "Referencia",       v: producto.slug },
  ].filter(s => s.v && s.v !== "No");

  return (
    <div style={{
      marginTop: 64, paddingTop: 40,
      borderTop: `1px solid ${C.line}`,
    }}>
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4,
        borderBottom: `1px solid ${C.line}`,
        marginBottom: 28,
      }}>
        {TABS.map(t => {
          const activo = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "12px 20px",
                background: "transparent", border: "none",
                borderBottom: `2px solid ${activo ? C.brand : "transparent"}`,
                marginBottom: -1,
                fontSize: 14,
                fontWeight: activo ? 700 : 500,
                color: activo ? C.ink : C.ink3,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: FONT.ui,
              }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenido tab */}
      {tab === "descripcion" && (
        <div style={{ maxWidth: 780 }}>
          <p style={{
            margin: 0, fontSize: 15, lineHeight: 1.7,
            color: C.ink2,
          }}>
            {producto.descripcion || "Sin descripción disponible para este producto."}
          </p>
        </div>
      )}

      {tab === "detalles" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 0,
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
        }}>
          {specs.map((s, i) => (
            <div key={i} style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${C.line}`,
              borderRight: `1px solid ${C.line}`,
            }}>
              <p style={{
                margin: "0 0 4px",
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1.2,
                color: C.muted,
              }}>{s.k}</p>
              <p style={{ margin: 0, fontSize: 14, color: C.ink, fontWeight: 500 }}>
                {s.v}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "variantes" && (
        <div style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.lg,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 100px",
            gap: 14,
            padding: "12px 18px",
            background: C.canvas,
            borderBottom: `1px solid ${C.line}`,
            fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.5,
            color: C.ink3,
          }}>
            <span>Presentación</span>
            <span style={{ textAlign: "right" }}>Precio</span>
            <span style={{ textAlign: "right" }}>Stock</span>
            <span style={{ textAlign: "right" }}>SKU</span>
          </div>
          {variantes.map((v, i) => (
            <div key={v.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 100px",
              gap: 14,
              padding: "14px 18px",
              fontSize: 13,
              borderBottom: i < variantes.length - 1 ? `1px solid ${C.line}` : "none",
            }}>
              <span style={{ color: C.ink, fontWeight: 600 }}>{v.nombre}</span>
              <span style={{ textAlign: "right", color: C.ink, fontFamily: FONT.mono }}>{fmt(v.precio)}</span>
              <span style={{
                textAlign: "right",
                color: v.stock === 0 ? C.danger : v.stock <= (v.stock_minimo || 5) ? C.warning : C.success,
                fontWeight: 600,
              }}>
                {v.stock === 0 ? "Agotado" : `${v.stock} unidades`}
              </span>
              <span style={{ textAlign: "right", color: C.muted, fontFamily: FONT.mono, fontSize: 11 }}>
                {v.sku || "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── También te puede gustar ────────────────────────────────────────────── */
function Relacionados({ productos }) {
  const { C } = useTheme();
  if (!productos || productos.length === 0) return null;

  return (
    <div style={{ marginTop: 64, paddingTop: 40, borderTop: `1px solid ${C.line}` }}>
      <h2 style={{
        margin: "0 0 24px",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 32,
        color: C.ink,
        letterSpacing: -0.3,
      }}>
        También te puede gustar
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 18,
      }}>
        {productos.slice(0, 4).map(p => {
          const dc = descPct(p.precio, p.precio_antes);
          return (
            <Link key={p.id} to={`/producto/${p.slug}`}
              style={{
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: RADIUS.lg,
                overflow: "hidden",
                textDecoration: "none",
                transition: "all 0.2s",
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.boxShadow = C.shadowMd; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 14px, ${C.surfaceAlt} 14px 28px)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {p.imagen_url && (
                  <img src={p.imagen_url} alt={p.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={e => { e.target.style.display = "none"; }}/>
                )}
                {dc && (
                  <span style={{
                    position: "absolute", top: 10, left: 10,
                    padding: "3px 9px", borderRadius: RADIUS.sm,
                    background: C.coral, color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    fontFamily: FONT.mono,
                  }}>
                    -{dc}%
                  </span>
                )}
              </div>
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                {p.marca && (
                  <span style={{
                    fontFamily: FONT.mono,
                    fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1.2,
                    color: C.muted,
                  }}>{p.marca}</span>
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: 13, fontWeight: 600,
                  color: C.ink, lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  flex: 1,
                }}>
                  {p.nombre}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= 4 ? "#F59E0B" : C.muted, fontSize: 10 }}>★</span>
                  ))}
                  <span style={{ marginLeft: 4, fontSize: 10, color: C.ink3 }}>(124)</span>
                </div>
                <div style={{
                  marginTop: 6,
                  fontFamily: FONT.display,
                  fontSize: 18, fontWeight: 700,
                  color: C.ink,
                }}>
                  {fmt(p.precio)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function Producto() {
  const { C } = useTheme();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true); setError(null);
    api.get(`/productos/${slug}`)
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.error || "Producto no encontrado"))
      .finally(() => setCargando(false));
  }, [slug]);

  return (
    <>
      <style>{`
        @keyframes vp-shimmer { to { background-position: -200% 0; } }
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .vp-prod-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: FONT.ui }}>

        {cargando && <Skeleton/>}

        {error && (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            maxWidth: 480, margin: "0 auto",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: C.dangerBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 18px",
            }}>⚠</div>
            <h2 style={{
              margin: "0 0 8px",
              fontFamily: FONT.display, fontStyle: "italic",
              fontWeight: 600, fontSize: 24,
              color: C.ink,
            }}>
              Producto no encontrado
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: C.ink3 }}>{error}</p>
            <Link to="/tienda" style={{
              display: "inline-block",
              padding: "12px 28px", borderRadius: RADIUS.sm,
              background: C.brand, color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}>
              Volver a la tienda
            </Link>
          </div>
        )}

        {data && (() => {
          const { producto, variantes, relacionados } = data;
          return (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

              {/* Breadcrumb */}
              <nav style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 12, color: C.ink3,
                marginBottom: 28, flexWrap: "wrap",
              }}>
                <Link to="/tienda" style={{ color: C.ink3, textDecoration: "none" }}>Tienda</Link>
                <span>·</span>
                {producto.categoria && (
                  <>
                    <Link to={`/tienda?categoria=${producto.categoria_slug || ""}`}
                      style={{ color: C.ink3, textDecoration: "none" }}>
                      {producto.categoria}
                    </Link>
                    <span>·</span>
                  </>
                )}
                <span style={{ color: C.ink2 }}>{producto.nombre}</span>
              </nav>

              {/* Grid principal */}
              <div className="vp-prod-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.05fr",
                gap: 56,
                alignItems: "start",
              }}>
                <Galeria
                  imagenPrincipal={producto.imagen_url}
                  imagenesExtra={producto.imagenes_extra}
                  nombre={producto.nombre}
                />
                <PanelCompra producto={producto} variantes={variantes}/>
              </div>

              {/* Tabs */}
              <TabsInfo producto={producto} variantes={variantes}/>

              {/* Relacionados */}
              <Relacionados productos={relacionados}/>
            </div>
          );
        })()}
      </div>
    </>
  );
}
