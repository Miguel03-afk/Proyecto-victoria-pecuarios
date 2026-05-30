// src/pages/Producto.jsx — Página de detalle de producto · rediseño navy + lime
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT } from "../styles/admin.tokens";
import ProductCard from "../components/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar, faPaw, faPlus, faMinus, faHeart, faCheck, faCartShopping,
  faTruckFast, faShieldHalved, faStethoscope, faLocationDot,
  faChevronRight, faTriangleExclamation, faBolt,
} from "@fortawesome/free-solid-svg-icons";

const IVA_PCT = 19;
const STATIC = "http://localhost:3000";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

const fullUrl = (u) => {
  if (!u) return null;
  return u.startsWith("http") ? u : `${STATIC}${u}`;
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  const { C } = useTheme();
  const shimmer = `linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.surface} 50%, ${C.surfaceAlt} 75%)`;
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
        <div style={{
          aspectRatio: "1 / 1", borderRadius: 24,
          background: shimmer, backgroundSize: "200% 100%",
          animation: "vp-shimmer 1.5s infinite",
        }}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[60, 88, 40, 100, 70, 50].map((w, i) => (
            <div key={i} style={{
              height: i === 1 ? 36 : 14, width: `${w}%`,
              borderRadius: 6,
              background: shimmer, backgroundSize: "200% 100%",
              animation: "vp-shimmer 1.5s infinite",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Galería ────────────────────────────────────────────────────────────── */
function Galeria({ imagenPrincipal, imagenesExtra, nombre }) {
  const { C } = useTheme();

  // imagenesExtra puede venir como array, string JSON, o null.
  // Normalizamos, filtramos vacíos/whitespace y limitamos a 5 (más la principal = 6 total).
  const extraNorm = (() => {
    let arr = imagenesExtra;
    if (typeof arr === "string") {
      try { arr = JSON.parse(arr); } catch { arr = []; }
    }
    if (!Array.isArray(arr)) return [];
    return arr
      .map(s => (typeof s === "string" ? s.trim() : ""))
      .filter(s => s.length > 0)
      .slice(0, 5);
  })();

  const todas = [imagenPrincipal, ...extraNorm]
    .filter(s => typeof s === "string" && s.trim().length > 0)
    .map(fullUrl);

  const [activa, setActiva] = useState(0);
  const [zoom, setZoom] = useState(false);

  // Si cambia el producto y el índice activo queda fuera de rango, resetear
  useEffect(() => {
    if (activa >= todas.length) setActiva(0);
  }, [todas.length, activa]);

  const navy = C.navy || '#1E3A8A';
  const lime = C.lime || '#7BC142';

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Imagen principal */}
      <div
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        style={{
          position: "relative",
          aspectRatio: "1 / 1", borderRadius: 24,
          backgroundColor: C.surfaceAlt,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: todas[activa] ? 'zoom-in' : 'default',
        }}
      >
        {todas[activa] ? (
          <img
            src={todas[activa]}
            alt={nombre}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              userSelect: "none",
              transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
              transform: zoom ? 'scale(1.08)' : 'scale(1)',
            }}
            draggable={false}
          />
        ) : (
          <div style={{
            display: "flex", flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: C.inkMuted || C.ink3, gap: 12,
          }}>
            <FontAwesomeIcon icon={faPaw} style={{ fontSize: 48, opacity: 0.3 }} />
            <span style={{
              fontSize: 11, letterSpacing: '0.16em',
              textTransform: 'uppercase', fontWeight: 700,
            }}>
              Sin imagen disponible
            </span>
          </div>
        )}

        {/* Decorative blob */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: 999,
          background: `radial-gradient(circle, ${lime}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}/>
      </div>

      {/* Thumbnails fila — hasta 6 (1 principal + 5 referencia) */}
      {todas.length > 1 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(todas.length, 6)}, 1fr)`,
          gap: 10,
        }}>
          {todas.slice(0, 6).map((src, i) => {
            const activo = i === activa;
            return (
              <button key={i} onClick={() => setActiva(i)}
                style={{
                  aspectRatio: "1 / 1", borderRadius: 14,
                  background: C.surfaceAlt,
                  border: `2px solid ${activo ? navy : C.border}`,
                  overflow: "hidden", padding: 0,
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  boxShadow: activo ? `0 8px 18px -10px ${navy}55` : 'none',
                }}>
                {src ? (
                  <img src={src} alt={`thumb ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Panel de compra ────────────────────────────────────────────────────── */
function PanelCompra({ producto, variantes }) {
  const { C } = useTheme();
  const navigate = useNavigate();
  const { agregar } = useCarrito();
  const { usuario } = useAuth();

  const [varIdx, setVarIdx] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [error, setError] = useState("");
  const { esFavorito, toggle: toggleFav } = useFavoritos(usuario);

  const navy     = C.navy     || '#1E3A8A';
  const navyDeep = C.navyDeep || '#0F2563';
  const lime     = C.lime     || '#7BC142';
  const red      = C.red      || '#E63946';
  const purple   = C.purple   || '#9B5DE5';
  const inkSoft  = C.inkSoft  || C.ink2;
  const inkMuted = C.inkMuted || C.ink3;

  const tieneVariantes = variantes && variantes.length > 0;
  const varActiva = tieneVariantes ? variantes[varIdx] : null;

  const precio    = tieneVariantes ? Number(varActiva.precio)        : Number(producto.precio);
  const precAntes = tieneVariantes ? Number(varActiva.precio_antes)  : Number(producto.precio_antes);
  const stock     = tieneVariantes ? varActiva.stock                 : producto.stock;
  const stockMin  = tieneVariantes ? varActiva.stock_minimo          : producto.stock_minimo;
  const hayStock  = stock > 0;
  const dc        = descPct(precio, precAntes);

  const cantNum  = Math.max(1, parseInt(cantidad, 10) || 1);
  const subtotal = precio * cantNum;
  const iva      = subtotal * (IVA_PCT / 100);
  const total    = subtotal + iva;

  const handleAgregar = () => {
    setError("");
    if (!hayStock) return;
    const cant = Math.max(1, Math.min(stock, parseInt(cantidad, 10) || 1));
    if (cant !== cantidad) setCantidad(cant);
    if (cant > stock) return setError(`Solo hay ${stock} unidades disponibles.`);
    // Carrito guest soportado en localStorage. Login solo al finalizar compra.

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
    }, cant);

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  return (
    <div className="vp-prod-panel" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {producto.marca && (
          <span style={{
            fontSize: 11, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.18em",
            color: navy,
          }}>
            {producto.marca}
          </span>
        )}
        {dc != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 999,
            backgroundColor: red, color: '#fff',
            fontSize: 10, fontWeight: 800,
          }}>
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: 9 }} />
            -{dc}% OFF
          </span>
        )}
        {producto.destacado && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 999,
            backgroundColor: lime, color: '#fff',
            fontSize: 10, fontWeight: 800,
          }}>
            <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} />
            DESTACADO
          </span>
        )}
      </div>

      <h1 style={{
        margin: 0,
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "clamp(28px, 4vw, 44px)",
        lineHeight: 1.05, letterSpacing: '-0.025em',
        color: C.ink,
      }}>
        {producto.nombre}
      </h1>

      {/* Reseñas (decorativas) + stock */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {[1,2,3,4,5].map(s => (
            <FontAwesomeIcon key={s} icon={faStar} style={{
              color: s <= 4 ? lime : C.border, fontSize: 13,
            }}/>
          ))}
          <span style={{ marginLeft: 6, fontSize: 13, color: C.ink, fontWeight: 600 }}>
            4.7
          </span>
          <span style={{ fontSize: 12, color: inkMuted }}>
            (124 reseñas)
          </span>
        </div>
        <span style={{ width: 1, height: 14, backgroundColor: C.border }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 999,
          backgroundColor: hayStock ? `${lime}1F` : `${red}1F`,
          color: hayStock ? (C.limeDeep || lime) : red,
          fontSize: 11, fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}/>
          {hayStock
            ? (stock <= (stockMin || 5)
                ? `Últimas ${stock} ${stock === 1 ? "unidad" : "unidades"}`
                : `${stock} ${stock === 1 ? "unidad disponible" : "unidades disponibles"}`)
            : "Sin stock"}
        </span>
      </div>

      {/* Bloque de stock resaltado — info crítica de compra */}
      {(() => {
        const stockBajoDet = hayStock && stock <= (stockMin || 5);
        const cfg = !hayStock
          ? { bg: `${red}10`,    border: `${red}40`,           text: red,                fgNum: red,                label: "Producto agotado",      sub: "Te avisaremos cuando vuelva." }
          : stockBajoDet
            ? { bg: "#FEF3C7",   border: "#FCD34D",            text: "#92400E",          fgNum: "#92400E",          label: "¡Últimas unidades!",     sub: "Cómpralo antes de que se agote." }
            : { bg: `${lime}15`, border: `${C.limeDeep || lime}55`, text: C.limeDeep || lime, fgNum: C.limeDeep || lime, label: "Stock disponible",       sub: tieneVariantes ? "Disponibilidad en la variante seleccionada." : "Listo para envío inmediato." };
        return (
          <div style={{
            marginTop: 4,
            padding: "14px 18px",
            borderRadius: 14,
            background: cfg.bg,
            border: `1.5px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: cfg.text,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: 12, color: cfg.text, opacity: 0.85 }}>
                {cfg.sub}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="vp-tabular" style={{
                fontSize: 28, fontWeight: 700, color: cfg.fgNum,
                lineHeight: 1, fontVariantNumeric: "tabular-nums",
              }}>
                {stock}
              </span>
              <span style={{ fontSize: 12, color: cfg.text, fontWeight: 600 }}>
                {stock === 1 ? "unidad" : "unidades"}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Precio */}
      <div className="vp-prod-precio-box" style={{
        padding: '20px 0',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: FONT.display, fontWeight: 500,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.ink, letterSpacing: -1, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {fmt(precio)}
          </span>
          {precAntes > 0 && (
            <span style={{
              fontSize: 18, color: inkMuted,
              textDecoration: "line-through",
              fontVariantNumeric: "tabular-nums",
            }}>
              {fmt(precAntes)}
            </span>
          )}
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: inkMuted }}>
          IVA 19% incluido · Total con IVA: <strong style={{ color: C.ink }}>{fmt(total)}</strong>
        </p>
      </div>

      {/* Descripción corta */}
      {producto.descripcion_corta && (
        <p style={{ margin: 0, fontSize: 14, color: inkSoft, lineHeight: 1.6 }}>
          {producto.descripcion_corta}
        </p>
      )}

      {/* Variantes — chips premium */}
      {tieneVariantes && (
        <div>
          <p style={{
            margin: "0 0 12px",
            fontSize: 10, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.16em",
            color: inkMuted,
          }}>
            Presentación · <span style={{ color: C.ink }}>{varActiva.nombre}</span>
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
                    padding: "10px 18px", borderRadius: 999,
                    border: `1.5px solid ${activo ? navy : C.border}`,
                    background: activo ? `${navy}10` : sinStock ? C.surfaceAlt : C.surface,
                    color: sinStock ? inkMuted : activo ? navy : C.ink,
                    fontSize: 13, fontWeight: activo ? 700 : 600,
                    cursor: sinStock ? "not-allowed" : "pointer",
                    opacity: sinStock ? 0.55 : 1,
                    fontFamily: 'inherit',
                    transition: 'all 200ms ease',
                  }}>
                  {v.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantidad + CTA */}
      <div className="vp-prod-cta-row" style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <div className="vp-prod-qty" style={{
          display: "inline-flex", alignItems: "center",
          border: `1.5px solid ${C.border}`,
          borderRadius: 999, background: C.surface,
          overflow: "hidden", height: 56,
        }}>
          <button
            onClick={() => { setCantidad(c => Math.max(1, c - 1)); setError(""); }}
            disabled={cantidad <= 1}
            aria-label="Disminuir"
            style={{
              width: 48, height: "100%",
              border: "none", background: "transparent",
              color: cantidad > 1 ? C.ink : inkMuted,
              fontSize: 14, cursor: cantidad > 1 ? "pointer" : "default",
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={cantidad}
            onChange={(e) => {
              // Solo dígitos. Si está vacío durante edición, dejamos string vacío visualmente
              const raw = e.target.value.replace(/[^0-9]/g, "");
              if (raw === "") { setCantidad(""); return; }
              const n = parseInt(raw, 10);
              if (Number.isNaN(n)) return;
              if (n > stock) {
                setCantidad(stock);
                setError(`Solo hay ${stock} unidades disponibles.`);
              } else {
                setCantidad(n);
                if (error) setError("");
              }
            }}
            onBlur={() => {
              // Normalizar al perder foco: clamp a [1, stock]
              const n = parseInt(cantidad, 10);
              if (!n || n < 1) setCantidad(1);
              else if (n > stock) setCantidad(stock);
            }}
            onKeyDown={(e) => {
              // Prevenir negativos, decimales, exponente
              if (["-", "+", ".", ",", "e", "E"].includes(e.key)) e.preventDefault();
            }}
            aria-label="Cantidad"
            style={{
              width: 56, height: "100%",
              border: "none", background: "transparent", outline: "none",
              padding: "0 8px",
              fontSize: 16, fontWeight: 700,
              color: C.ink, textAlign: "center",
              fontVariantNumeric: "tabular-nums",
              fontFamily: "inherit",
              MozAppearance: "textfield",
            }}
          />
          <button
            onClick={() => { setCantidad(c => Math.min(stock, (parseInt(c, 10) || 0) + 1)); setError(""); }}
            disabled={cantidad >= stock}
            aria-label="Aumentar"
            style={{
              width: 48, height: "100%",
              border: "none", background: "transparent",
              color: cantidad < stock ? C.ink : inkMuted,
              fontSize: 14, cursor: cantidad < stock ? "pointer" : "default",
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <button
          onClick={handleAgregar}
          disabled={!hayStock}
          className="vp-prod-cta"
          style={{
            flex: 1, height: 56,
            borderRadius: 999, border: "none",
            background: agregado ? lime : hayStock ? navy : C.surfaceAlt,
            color: agregado || hayStock ? "#fff" : inkMuted,
            fontSize: 14, fontWeight: 700,
            fontFamily: 'inherit',
            cursor: hayStock ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 250ms ease",
            boxShadow: hayStock ? `0 12px 28px -12px ${agregado ? lime : navy}77` : 'none',
          }}
          onMouseEnter={(e) => { if (hayStock && !agregado) e.currentTarget.style.backgroundColor = navyDeep; }}
          onMouseLeave={(e) => { if (hayStock && !agregado) e.currentTarget.style.backgroundColor = navy; }}
        >
          {agregado ? (
            <><FontAwesomeIcon icon={faCheck} /> Agregado · {fmt(total)}</>
          ) : hayStock ? (
            <><FontAwesomeIcon icon={faCartShopping} /> Añadir al carrito · {fmt(total)}</>
          ) : (
            "Sin stock"
          )}
        </button>

        {(() => { const favorito = esFavorito(producto.id); return (
        <button
          onClick={() => toggleFav(producto)}
          aria-label={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
          aria-pressed={favorito}
          title={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
          className="vp-prod-fav"
          style={{
            width: 56, height: 56,
            borderRadius: 999,
            border: `1.5px solid ${favorito ? red : C.border}`,
            background: favorito ? `${red}10` : C.surface,
            color: favorito ? red : C.ink,
            fontSize: 16, cursor: "pointer",
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: "all 200ms var(--vp-ease-out)",
          }}
          onMouseEnter={(e) => {
            if (!favorito) {
              e.currentTarget.style.borderColor = red;
              e.currentTarget.style.color = red;
            }
          }}
          onMouseLeave={(e) => {
            if (!favorito) {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.ink;
            }
          }}>
          <FontAwesomeIcon icon={faHeart} />
        </button>
        ); })()}
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 14,
          background: `${red}10`,
          border: `1px solid ${red}33`,
          color: red, fontSize: 13,
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      )}

      {/* Garantías 2x2 (1 columna en móvil) */}
      <div className="vp-prod-garantias" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        marginTop: 8,
      }}>
        {[
          { icon: faTruckFast,    titulo: "Envío gratis",         sub: "En Ibagué desde $80.000", color: navy },
          { icon: faShieldHalved, titulo: "Garantía oficial",     sub: "Producto verificado",     color: lime },
          { icon: faStethoscope,  titulo: "Marca verificada",     sub: "Producto de origen comprobado", color: purple },
          { icon: faLocationDot,  titulo: "Recoge en tienda",     sub: "Cra. 5 #34-12",           color: red },
        ].map(g => (
          <div key={g.titulo} className="vp-prod-garantia" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 16,
            border: `1px solid ${C.border}`, background: C.surface,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 12,
              background: `${g.color}15`, color: g.color,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>
              <FontAwesomeIcon icon={g.icon} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
                {g.titulo}
              </div>
              <div style={{ fontSize: 11, color: inkMuted, marginTop: 2 }}>
                {g.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tabs descripción / especificaciones ────────────────────────────────── */
function TabsInfo({ producto, variantes }) {
  const { C } = useTheme();
  const [tab, setTab] = useState("descripcion");

  const navy     = C.navy     || '#1E3A8A';
  const lime     = C.lime     || '#7BC142';
  const red      = C.red      || '#E63946';
  const inkSoft  = C.inkSoft  || C.ink2;
  const inkMuted = C.inkMuted || C.ink3;

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
    <div className="vp-prod-tabs" style={{
      marginTop: 72, paddingTop: 48,
      borderTop: `1px solid ${C.border}`,
    }}>
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 8, flexWrap: 'wrap',
        marginBottom: 32,
      }}>
        {TABS.map(t => {
          const activo = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "10px 20px", borderRadius: 999,
                background: activo ? navy : 'transparent',
                color: activo ? '#fff' : C.ink,
                border: `1.5px solid ${activo ? navy : C.border}`,
                fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: 'inherit',
                transition: 'all 200ms ease',
              }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      {tab === "descripcion" && (
        <div style={{ maxWidth: 780 }}>
          <p style={{
            margin: 0, fontSize: 15, lineHeight: 1.7,
            color: inkSoft, whiteSpace: 'pre-line',
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
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}>
          {specs.map((s, i) => (
            <div key={i} style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${C.border}`,
              borderRight: `1px solid ${C.border}`,
            }}>
              <p style={{
                margin: "0 0 4px",
                fontSize: 10, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.16em",
                color: inkMuted,
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
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 130px 130px 110px",
            gap: 14,
            padding: "14px 20px",
            background: C.surfaceAlt,
            borderBottom: `1px solid ${C.border}`,
            fontSize: 10, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.16em",
            color: inkMuted,
          }}>
            <span>Presentación</span>
            <span style={{ textAlign: "right" }}>Precio</span>
            <span style={{ textAlign: "right" }}>Stock</span>
            <span style={{ textAlign: "right" }}>SKU</span>
          </div>
          {variantes.map((v, i) => (
            <div key={v.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 130px 110px",
              gap: 14, padding: "14px 20px",
              fontSize: 13,
              borderBottom: i < variantes.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ color: C.ink, fontWeight: 600 }}>{v.nombre}</span>
              <span style={{
                textAlign: "right", color: C.ink,
                fontVariantNumeric: 'tabular-nums', fontWeight: 600,
              }}>{fmt(v.precio)}</span>
              <span style={{
                textAlign: "right",
                color: v.stock === 0 ? red : v.stock <= (v.stock_minimo || 5) ? '#D97706' : (C.limeDeep || lime),
                fontWeight: 600,
              }}>
                {v.stock === 0 ? "Agotado" : `${v.stock} unidades`}
              </span>
              <span style={{
                textAlign: "right", color: inkMuted,
                fontVariantNumeric: 'tabular-nums', fontSize: 11,
              }}>
                {v.sku || "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Relacionados (usa ProductCard nuevo) ───────────────────────────────── */
function Relacionados({ productos }) {
  const { C } = useTheme();
  if (!productos || productos.length === 0) return null;
  const navy = C.navy || '#1E3A8A';

  return (
    <div style={{ marginTop: 72, paddingTop: 48, borderTop: `1px solid ${C.border}` }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 16, marginBottom: 28, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: C.lime || '#7BC142',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 22, height: 1, backgroundColor: C.lime || '#7BC142' }} />
            También te puede gustar
          </div>
          <h2 style={{
            margin: "12px 0 0",
            fontFamily: FONT.display, fontWeight: 500,
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: C.ink, letterSpacing: -0.3, lineHeight: 1.05,
          }}>
            Otros productos para tu mascota
          </h2>
        </div>
        <Link to="/tienda" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 999,
          backgroundColor: 'transparent', color: C.ink,
          border: `1.5px solid ${C.border}`,
          fontSize: 13, fontWeight: 700, textDecoration: 'none',
          transition: 'all 200ms ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = navy; e.currentTarget.style.color = navy; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.ink; }}
        >
          Ver tienda <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
        </Link>
      </div>

      {/* Grid responsivo de relacionados: usa el mismo patrón que la tienda */}
      <style>{`
        .vp-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        @media (max-width: 640px) {
          .vp-related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
      <div className="vp-related-grid">
        {productos.slice(0, 4).map(p => (
          <ProductCard key={p.id} producto={p} />
        ))}
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

  const navy = C.navy || '#1E3A8A';
  const red  = C.red  || '#E63946';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
        @media (max-width: 900px) {
          .vp-prod-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 640px) {
          .vp-prod-page    { padding: 24px 14px 64px !important; }
          .vp-prod-grid    { gap: 20px !important; }
          .vp-prod-breadcrumb { font-size: 11px !important; margin-bottom: 20px !important; }
          /* Garantías 2x2 → 1 columna en móvil para que el texto respire */
          .vp-prod-garantias { grid-template-columns: 1fr !important; gap: 8px !important; }
          .vp-prod-garantia  { padding: 10px 12px !important; }
          /* Panel compra más compacto */
          .vp-prod-panel   { gap: 16px !important; }
          .vp-prod-precio-box { padding: 14px 0 !important; }
          .vp-prod-cta-row { gap: 8px !important; }
          .vp-prod-cta     { height: 50px !important; font-size: 13px !important; }
          .vp-prod-qty     { height: 50px !important; }
          .vp-prod-fav     { width: 50px !important; height: 50px !important; }
          /* Tabs info: más aire */
          .vp-prod-tabs    { margin-top: 48px !important; padding-top: 32px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: FONT.ui, color: C.ink }}>

        {cargando && <Skeleton/>}

        {error && (
          <div style={{
            textAlign: "center", padding: "96px 24px",
            maxWidth: 480, margin: "0 auto",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 22,
              background: `${red}15`, color: red,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 20px",
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <h2 style={{
              margin: "0 0 10px",
              fontFamily: FONT.display,
              fontWeight: 700, fontSize: 30, color: C.ink,
              letterSpacing: '-0.025em', lineHeight: 1.05,
            }}>
              Producto no encontrado
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: C.inkSoft || C.ink3 }}>{error}</p>
            <Link to="/tienda" style={{
              display: "inline-block",
              padding: "13px 28px", borderRadius: 999,
              background: navy, color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 700,
              boxShadow: `0 12px 24px -10px ${navy}66`,
            }}>
              Volver a la tienda
            </Link>
          </div>
        )}

        {data && (() => {
          const { producto, variantes, relacionados } = data;
          return (
            <div className="vp-prod-page" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 96px" }}>

              {/* Breadcrumb */}
              <nav className="vp-prod-breadcrumb" style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 12, color: C.inkSoft || C.ink3,
                marginBottom: 32, flexWrap: "wrap",
              }}>
                <Link to="/tienda" style={{ color: 'inherit', textDecoration: "none" }}>
                  Tienda
                </Link>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
                {producto.categoria && (
                  <>
                    <Link to={`/tienda?categoria=${producto.categoria_slug || ""}`}
                      style={{ color: 'inherit', textDecoration: "none" }}>
                      {producto.categoria}
                    </Link>
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
                  </>
                )}
                <span style={{ color: C.ink, fontWeight: 600 }}>{producto.nombre}</span>
              </nav>

              {/* Grid principal */}
              <div className="vp-prod-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.05fr",
                gap: 64, alignItems: "start",
              }}>
                <Galeria
                  imagenPrincipal={producto.imagen_url}
                  imagenesExtra={producto.imagenes_extra}
                  nombre={producto.nombre}
                />
                <PanelCompra producto={producto} variantes={variantes}/>
              </div>

              <TabsInfo producto={producto} variantes={variantes}/>
              <Relacionados productos={relacionados}/>
            </div>
          );
        })()}
      </div>
    </>
  );
}
