// src/components/landing/ProductosLanding.jsx
// Productos destacados — 3 cards iguales con bottom-CTA estilo "Medication Made".
// Cambios v3 (correctivo): el grid asimétrico 1-hero + 3-stack quedaba
// desproporcionado (cards mini muy comprimidas en altura). Vuelvo a 3 cards
// iguales pero MUCHO más editorial y con CTA pill visible siempre.
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlus, faPaw, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useCarrito } from "../../context/CarritoContext";
import { Reveal, TypeReveal, SectionEyebrow, useLandingPalette, money } from "./landing.utils.jsx";

const STATIC = "http://localhost:3000";

function discountPct(p) {
  const antes  = Number(p.precio_antes);
  const precio = Number(p.precio);
  if (!antes || antes <= precio) return null;
  return Math.round((1 - precio / antes) * 100);
}

function imgSrc(p) {
  const url = p.imagen_url || p.imagen;
  if (!url) return null;
  return url.startsWith('http') ? url : `${STATIC}${url}`;
}

/* Tintes suaves rotativos para los fondos de imagen — referencia visual
   del moodboard "Medication Made". Cada card recibe su propio tono pastel
   sutil que mantiene la One Voice Rule (navy sigue siendo el acento). */
function tintFor(Cur, i) {
  const tints = [
    `${Cur.lime}1C`,    // verde suavísimo
    `${Cur.navy}10`,    // navy whisper
    `${Cur.red}14`,     // coral suave
    `${Cur.purple}14`,  // lila suave
  ];
  return tints[i % tints.length];
}

/* ─── Card uniforme con CTA fijo abajo ──────────────────────────────────── */
function ProductCard({ Cur, p, onAgregar, index }) {
  const [hovered, setHovered] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const dc = discountPct(p);
  const stock = Number(p.stock) || 0;
  const out = stock === 0;
  const stockBajo = stock > 0 && stock <= 5;
  const img = imgSrc(p);
  const tint = tintFor(Cur, index);

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    onAgregar(p);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <Link
      to={`/producto/${p.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        backgroundColor: Cur.surface,
        border: `1px solid ${hovered ? Cur.navy + '33' : Cur.border}`,
        borderRadius: 22, padding: 18,
        height: '100%', display: 'flex', flexDirection: 'column',
        textDecoration: 'none', color: 'inherit',
        transition: 'border-color 220ms ease, box-shadow 320ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 22px 40px -18px rgba(10,20,38,0.16)'
          : '0 1px 0 rgba(10,20,38,0.02)',
      }}
    >
      {/* Badges arriba */}
      {dc != null && (
        <span style={{
          position: 'absolute', top: 28, left: 28, zIndex: 2,
          background: Cur.red, color: Cur.canvas,
          fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 999,
          fontVariantNumeric: 'tabular-nums',
        }}>
          −{dc}%
        </span>
      )}
      {!dc && p.destacado && (
        <span style={{
          position: 'absolute', top: 28, left: 28, zIndex: 2,
          background: Cur.lime, color: Cur.navyDeep,
          fontSize: 10, fontWeight: 800,
          padding: '4px 10px', borderRadius: 999,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Top venta
        </span>
      )}

      {/* Imagen con tinte sutil + zoom suave en hover */}
      <div style={{
        aspectRatio: '5 / 4',
        backgroundColor: tint, borderRadius: 16,
        overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {img ? (
          <img
            src={img} alt={p.nombre} loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1)',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <FontAwesomeIcon icon={faPaw} style={{ fontSize: 40, color: Cur.inkMuted, opacity: 0.35 }} />
        )}
      </div>

      {/* Body */}
      <div style={{
        marginTop: 18, display: 'flex', flexDirection: 'column',
        flex: 1, gap: 4,
      }}>
        {(p.categoria_nombre || p.categoria) && (
          <div style={{
            fontSize: 10.5, fontWeight: 700,
            color: Cur.inkMuted, letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {p.categoria_nombre || p.categoria}
          </div>
        )}
        <h3 className="vp-font-display" style={{
          margin: 0, fontSize: 18, fontWeight: 700, color: Cur.ink,
          lineHeight: 1.18, letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2, overflow: 'hidden',
          minHeight: 44,
        }}>
          {p.nombre}
        </h3>

        {/* Precio + stock en una línea */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          marginTop: 6,
        }}>
          <span className="vp-font-display vp-tabular" style={{
            fontSize: 20, fontWeight: 700, color: Cur.ink,
            letterSpacing: '-0.02em',
          }}>
            {money(p.precio)}
          </span>
          {p.precio_antes && Number(p.precio_antes) > Number(p.precio) && (
            <span className="vp-tabular" style={{
              fontSize: 12.5, textDecoration: 'line-through', color: Cur.inkMuted,
            }}>
              {money(p.precio_antes)}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600 }}>
          {out
            ? <span style={{ color: Cur.inkMuted }}>● Sin stock</span>
            : stockBajo
              ? <span style={{ color: Cur.red }}>● Quedan {stock}</span>
              : <span style={{ color: Cur.limeDeep }}>● Disponible</span>}
        </div>

        {/* Spacer para empujar el botón al fondo */}
        <div style={{ flex: 1 }} />

        {/* CTA pill — visible siempre, con efectos en hover */}
        <button
          type="button"
          onClick={handleAgregar}
          disabled={out}
          style={{
            marginTop: 16, width: '100%',
            padding: '11px 18px', borderRadius: 999,
            fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${out
              ? Cur.border
              : (agregado ? Cur.lime : Cur.ink)}`,
            backgroundColor: out
              ? Cur.surfaceAlt
              : (agregado ? Cur.lime : 'transparent'),
            color: out ? Cur.inkMuted : (agregado ? Cur.canvas : Cur.ink),
            cursor: out ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, fontFamily: 'inherit',
            transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={(e) => {
            if (out || agregado) return;
            e.currentTarget.style.backgroundColor = Cur.ink;
            e.currentTarget.style.color = Cur.canvas;
          }}
          onMouseLeave={(e) => {
            if (out || agregado) return;
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = Cur.ink;
          }}
          onMouseDown={(e) => { if (!out && !agregado) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { if (!out && !agregado) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {out
            ? "Sin stock"
            : agregado
              ? <>Agregado <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 11 }} /></>
              : <>Agregar al carrito <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} /></>}
        </button>
      </div>
    </Link>
  );
}

export default function ProductosLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const { agregar } = useCarrito();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]  = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/productos/destacados/lista')
      .then(r => mounted && setProductos(Array.isArray(r.data) ? r.data : []))
      .catch(() => mounted && setProductos([]))
      .finally(() => mounted && setCargando(false));
    return () => { mounted = false; };
  }, []);

  const handleAgregar = (p) => {
    agregar({
      id: p.id, producto_id: p.id, variante_id: null,
      nombre: p.nombre, slug: p.slug,
      precio: Number(p.precio), imagen_url: p.imagen_url || p.imagen || null,
      stock: Number(p.stock) || 0, activo: 1,
    }, 1);
  };

  // Mostramos 3 productos destacados — equilibrio editorial
  const visibles = productos.slice(0, 3);

  return (
    <section id="tienda" style={{ backgroundColor: Cur.bg, scrollMarginTop: 80 }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: '88px 24px',
      }}>
        {/* ── Header editorial centrado (mejor balance vertical) ── */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 720, margin: '0 auto 48px' }}>
            <SectionEyebrow centered>Selección del mes</SectionEyebrow>
            <TypeReveal
              as="h2"
              className="vp-font-display"
              style={{
                marginTop: 14, marginBottom: 14,
                fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 1.0,
                fontWeight: 700, color: Cur.ink,
                letterSpacing: "-0.025em",
              }}
              segments={[
                { text: "Lo que más " },
                { text: "se lleva", color: Cur.navy },
                { text: " esta semana." },
              ]}
            />
            <p style={{
              margin: '0 auto', fontSize: 15, color: Cur.inkSoft,
              lineHeight: 1.55, maxWidth: 540,
            }}>
              Productos elegidos por nuestros clientes en Ibagué — lo que más se lleva,
              lo que más nos piden, lo que vuelven a pedir.
            </p>
          </div>
        </Reveal>

        {/* ── Grid de 3 cards iguales ── */}
        {cargando ? (
          <div className="vp-prod-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 440, borderRadius: 22,
                background: Cur.surfaceAlt, border: `1px solid ${Cur.border}`,
              }}/>
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            backgroundColor: Cur.surface, borderRadius: 24,
            border: `1px solid ${Cur.border}`, color: Cur.inkSoft,
          }}>
            No hay productos destacados disponibles por ahora.
          </div>
        ) : (
          <div className="vp-prod-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            alignItems: 'stretch',
          }}>
            {visibles.map((p, i) => (
              <Reveal key={p.id} variant="vp-reveal-card" delay={i * 80}>
                <ProductCard
                  Cur={Cur}
                  p={p}
                  onAgregar={handleAgregar}
                  index={i}
                />
              </Reveal>
            ))}
          </div>
        )}

        {/* Link editorial inferior — sustituye al banner gigante eliminado */}
        <Reveal delay={120}>
          <div style={{
            marginTop: 48, textAlign: 'center',
          }}>
            <button
              type="button"
              onClick={() => navigate('/tienda')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 26px', borderRadius: 999,
                backgroundColor: 'transparent', color: Cur.ink,
                border: `1.5px solid ${Cur.border}`,
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 200ms ease, background-color 200ms ease, color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = Cur.navy;
                e.currentTarget.style.backgroundColor = Cur.navy;
                e.currentTarget.style.color = Cur.canvas;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = Cur.border;
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = Cur.ink;
              }}
            >
              Ver el catálogo completo
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
            </button>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .vp-prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .vp-prod-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
