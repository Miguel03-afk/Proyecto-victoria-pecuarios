// src/pages/Home.jsx — Tienda / Catálogo Victoria Pets · diseño PDF
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import ProductCard from "../components/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faXmark, faSliders, faChevronLeft, faChevronRight,
  faFilterCircleXmark, faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const ORDEN_OPCIONES = [
  { id: "destacados", label: "Destacados" },
  { id: "menor",      label: "Precio: menor a mayor" },
  { id: "mayor",      label: "Precio: mayor a menor" },
  { id: "nombre",     label: "Nombre A–Z" },
];

const RANGOS_PRECIO = [
  { id: "todos",    label: "Todos los precios", min: 0,      max: Infinity },
  { id: "menos50",  label: "Menos de $50.000",  min: 0,      max: 50000   },
  { id: "50-100",   label: "$50.000 – $100.000", min: 50000, max: 100000  },
  { id: "100-200",  label: "$100.000 – $200.000", min: 100000, max: 200000 },
  { id: "mas200",   label: "Más de $200.000",   min: 200000, max: Infinity },
];

export default function Home() {
  const { C } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos,    setProductos]    = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [busquedaInput, setBusquedaInput] = useState(searchParams.get("buscar") || "");
  const [orden, setOrden] = useState("destacados");
  const [filtrosOpenMobile, setFiltrosOpenMobile] = useState(false);
  const [rangoPrecio, setRangoPrecio] = useState("todos");
  const [marcasSel, setMarcasSel] = useState([]);
  const debounceRef = useRef(null);

  const categoriasActivas = (searchParams.get("categorias") || "")
    .split(",").filter(Boolean).map(Number);
  const busqueda = searchParams.get("buscar") || "";
  const pagina   = Number(searchParams.get("pagina") || 1);

  useEffect(() => {
    api.get("/categorias").then(r => setCategorias(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = { pagina, limite: 16 };
    if (busqueda) params.buscar = busqueda;
    if (categoriasActivas.length === 1)    params.categoria  = categoriasActivas[0];
    else if (categoriasActivas.length > 1) params.categorias = categoriasActivas.join(",");

    api.get("/productos", { params })
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          setProductos(data); setTotalItems(data.length); setTotalPaginas(1);
        } else {
          setProductos(data.productos || []);
          setTotalItems(Number(data.total ?? data.productos?.length ?? 0));
          setTotalPaginas(Number(data.totalPaginas ?? 1));
        }
      })
      .catch(() => { setProductos([]); setTotalItems(0); setTotalPaginas(1); })
      .finally(() => setCargando(false));
  }, [busqueda, searchParams.get("categorias"), pagina]); // eslint-disable-line

  // Marcas únicas detectadas de los productos cargados
  const marcasDisponibles = Array.from(new Set(productos.map(p => p.marca).filter(Boolean))).sort();

  // Filtrado + ordenamiento client-side
  const rangoActual = RANGOS_PRECIO.find(r => r.id === rangoPrecio) || RANGOS_PRECIO[0];
  const productosOrdenados = (() => {
    let arr = [...productos];
    // Rango precio
    arr = arr.filter(p => {
      const pr = Number(p.precio);
      return pr >= rangoActual.min && pr <= rangoActual.max;
    });
    // Marcas
    if (marcasSel.length > 0) {
      arr = arr.filter(p => p.marca && marcasSel.includes(p.marca));
    }
    if (orden === "menor")  arr.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (orden === "mayor")  arr.sort((a, b) => Number(b.precio) - Number(a.precio));
    if (orden === "nombre") arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    return arr;
  })();

  const toggleMarca = (m) => {
    setMarcasSel(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleBusqueda = (v) => {
    setBusquedaInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (v) next.set("buscar", v); else next.delete("buscar");
        next.delete("pagina");
        return next;
      });
    }, 400);
  };

  const toggleCategoria = (id) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const actuales = (prev.get("categorias") || "").split(",").filter(Boolean).map(Number);
      const nuevas = actuales.includes(id) ? actuales.filter(x => x !== id) : [...actuales, id];
      if (nuevas.length === 0) next.delete("categorias");
      else next.set("categorias", nuevas.join(","));
      next.delete("pagina");
      return next;
    });
  };

  const limpiarFiltros = () => {
    setBusquedaInput(""); setSearchParams({});
    setRangoPrecio("todos"); setMarcasSel([]);
  };
  const hayFiltros = busqueda || categoriasActivas.length > 0 ||
                     rangoPrecio !== "todos" || marcasSel.length > 0;

  const irPagina = (n) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    next.set("pagina", String(n));
    return next;
  });

  return (
    <>
      <style>{`
        @keyframes vp-shimmer { to { background-position: -200% 0; } }
        @keyframes vp-fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .vp-tienda-grid { grid-template-columns: 1fr !important; }
          .vp-tienda-aside { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: FONT.ui }}>

        {/* Hero compacto */}
        <section style={{
          padding: "32px 24px 16px",
          borderBottom: `1px solid ${C.line}`,
          background: C.canvas,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: C.brand, letterSpacing: 1.5,
              textTransform: "uppercase",
            }}>
              Catálogo · Tienda
            </span>
            <h1 style={{
              margin: "6px 0 12px",
              fontFamily: FONT.display, fontStyle: "italic",
              fontWeight: 600, fontSize: "clamp(28px, 4vw, 38px)",
              color: C.ink, letterSpacing: -0.4,
            }}>
              Todos los productos para tu mascota
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: C.ink3, maxWidth: 580, lineHeight: 1.55 }}>
              Alimento, medicamentos, accesorios e higiene · Envíos gratis en Ibagué desde $80.000
            </p>
          </div>
        </section>

        {/* Barra superior: buscador + orden */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: C.surface,
          borderBottom: `1px solid ${C.line}`,
          padding: "14px 24px",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            {/* Buscador */}
            <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)",
                color: C.muted, fontSize: 12, pointerEvents: "none",
              }}/>
              <input
                type="text"
                value={busquedaInput}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar producto…"
                style={{
                  width: "100%", height: 40,
                  padding: "0 38px 0 38px",
                  borderRadius: RADIUS.pill,
                  border: `1px solid ${C.lineStrong}`,
                  background: C.surfaceAlt, color: C.ink,
                  fontSize: 13, fontFamily: FONT.ui,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.surface; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.background = C.surfaceAlt; }}
              />
              {busquedaInput && (
                <button onClick={() => handleBusqueda("")} style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  width: 22, height: 22, borderRadius: "50%",
                  border: "none", background: C.surfaceAlt, color: C.ink3,
                  cursor: "pointer", fontSize: 10,
                }}>
                  <FontAwesomeIcon icon={faXmark}/>
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}/>

            {/* Toggle sidebar móvil */}
            <button onClick={() => setFiltrosOpenMobile(v => !v)}
              className="vp-toggle-filtros-mobile"
              style={{
                display: "none",
                height: 40, padding: "0 14px",
                borderRadius: RADIUS.pill,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink2,
                fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                alignItems: "center", gap: 7,
                fontFamily: FONT.ui,
              }}>
              <FontAwesomeIcon icon={faSliders} style={{ fontSize: 11 }}/>
              Filtros
              {(categoriasActivas.length + marcasSel.length + (rangoPrecio !== "todos" ? 1 : 0)) > 0 && (
                <span style={{
                  padding: "0 6px", borderRadius: RADIUS.pill,
                  background: C.brand, color: "#fff",
                  fontSize: 10, fontWeight: 700, fontFamily: FONT.mono,
                }}>
                  {categoriasActivas.length + marcasSel.length + (rangoPrecio !== "todos" ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Ordenar */}
            <select
              value={orden}
              onChange={e => setOrden(e.target.value)}
              style={{
                height: 40, padding: "0 14px",
                borderRadius: RADIUS.pill,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink2,
                fontSize: 12, fontWeight: 500,
                outline: "none", cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
              {ORDEN_OPCIONES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Layout 2 columnas: sidebar filtros + grid productos */}
        <div className="vp-tienda-layout" style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "24px 24px 64px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}>

          {/* Sidebar filtros */}
          <aside className={`vp-sidebar-filtros ${filtrosOpenMobile ? "open" : ""}`} style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: RADIUS.lg,
            padding: 18,
            position: "sticky", top: 84,
            fontFamily: FONT.ui,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{
                margin: 0, fontSize: 14, fontWeight: 700, color: C.ink,
                fontFamily: FONT.display, fontStyle: "italic",
              }}>
                Filtros
              </h3>
              {hayFiltros && (
                <button onClick={limpiarFiltros} style={{
                  background: "transparent", border: "none",
                  color: C.brand, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", padding: 0,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <FontAwesomeIcon icon={faFilterCircleXmark} style={{ fontSize: 10 }}/>
                  Limpiar
                </button>
              )}
            </div>

            {/* Categorías */}
            {categorias.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  margin: "0 0 10px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 1.2,
                  color: C.ink3,
                }}>
                  Categoría
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {categorias.slice(0, 8).map(cat => {
                    const activo = categoriasActivas.includes(cat.id);
                    return (
                      <label key={cat.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 8px", borderRadius: RADIUS.sm,
                        cursor: "pointer",
                        background: activo ? C.brandSoft : "transparent",
                        transition: "background 0.12s",
                      }}>
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => toggleCategoria(cat.id)}
                          style={{ accentColor: C.brand, cursor: "pointer", width: 14, height: 14 }}
                        />
                        <span style={{
                          fontSize: 12, fontWeight: activo ? 600 : 500,
                          color: activo ? C.brand : C.ink2,
                        }}>
                          {cat.nombre}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rango precio */}
            <div style={{ marginBottom: 20 }}>
              <p style={{
                margin: "0 0 10px", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1.2,
                color: C.ink3,
              }}>
                Rango de precio
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {RANGOS_PRECIO.map(r => {
                  const activo = rangoPrecio === r.id;
                  return (
                    <label key={r.id} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px", borderRadius: RADIUS.sm,
                      cursor: "pointer",
                      background: activo ? C.brandSoft : "transparent",
                    }}>
                      <input
                        type="radio"
                        name="rango"
                        checked={activo}
                        onChange={() => setRangoPrecio(r.id)}
                        style={{ accentColor: C.brand, cursor: "pointer" }}
                      />
                      <span style={{
                        fontSize: 12, fontWeight: activo ? 600 : 500,
                        color: activo ? C.brand : C.ink2,
                      }}>
                        {r.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Marcas */}
            {marcasDisponibles.length > 0 && (
              <div>
                <p style={{
                  margin: "0 0 10px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 1.2,
                  color: C.ink3,
                }}>
                  Marca {marcasSel.length > 0 && <span style={{ color: C.brand }}>({marcasSel.length})</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 200, overflowY: "auto" }}>
                  {marcasDisponibles.map(m => {
                    const activo = marcasSel.includes(m);
                    return (
                      <button key={m}
                        onClick={() => toggleMarca(m)}
                        style={{
                          padding: "4px 10px", borderRadius: RADIUS.pill,
                          background: activo ? C.brand : "transparent",
                          color: activo ? "#fff" : C.ink2,
                          border: `1px solid ${activo ? C.brand : C.lineStrong}`,
                          fontSize: 11, fontWeight: activo ? 600 : 500,
                          cursor: "pointer", transition: "all 0.12s",
                          fontFamily: FONT.ui,
                        }}>{m}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setFiltrosOpenMobile(false)}
              className="vp-cerrar-filtros-mobile"
              style={{
                display: "none",
                width: "100%", marginTop: 16, padding: "10px",
                borderRadius: RADIUS.sm,
                border: "none", background: C.brand, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              Ver resultados
            </button>
          </aside>

          {/* Columna de productos */}
          <div>

          {/* Header resultados */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 18, flexWrap: "wrap", gap: 10,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: C.ink3 }}>
              {cargando
                ? "Cargando..."
                : <>Mostrando <strong style={{ color: C.ink }}>{productosOrdenados.length}</strong> de <strong style={{ color: C.ink }}>{totalItems}</strong> productos</>}
              {hayFiltros && (
                <> · <button onClick={limpiarFiltros} style={{
                  background: "transparent", border: "none", padding: 0,
                  color: C.brand, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Limpiar filtros</button></>
              )}
            </p>
          </div>

          {cargando ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 18,
            }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{
                  height: 320,
                  borderRadius: RADIUS.lg,
                  background: `linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.surface} 50%, ${C.surfaceAlt} 75%)`,
                  backgroundSize: "200% 100%",
                  animation: "vp-shimmer 1.4s infinite",
                }}/>
              ))}
            </div>
          ) : productosOrdenados.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 24px",
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: RADIUS.lg,
            }}>
              <FontAwesomeIcon icon={faBoxOpen} style={{
                fontSize: 48, color: C.muted, marginBottom: 14, display: "block",
              }}/>
              <h3 style={{
                margin: "0 0 8px",
                fontFamily: FONT.display, fontStyle: "italic",
                fontWeight: 600, fontSize: 22, color: C.ink,
              }}>
                Sin resultados
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: C.ink3 }}>
                {hayFiltros ? "Prueba ajustar tus filtros" : "Aún no hay productos disponibles"}
              </p>
              {hayFiltros && (
                <button onClick={limpiarFiltros} style={{
                  padding: "10px 24px", borderRadius: RADIUS.sm,
                  background: C.brand, color: "#fff",
                  border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: FONT.ui,
                }}>
                  Ver todos los productos
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 18,
                animation: "vp-fadeUp 0.35s ease",
              }}>
                {productosOrdenados.map(p => (
                  <ProductCard key={p.id} producto={p}/>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  gap: 6, marginTop: 40,
                }}>
                  <button
                    onClick={() => irPagina(Math.max(1, pagina - 1))}
                    disabled={pagina <= 1}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `1px solid ${C.lineStrong}`,
                      background: C.surface, color: pagina <= 1 ? C.muted : C.ink,
                      cursor: pagina <= 1 ? "default" : "pointer",
                    }}>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }}/>
                  </button>

                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                    const n = i + 1;
                    const activo = n === pagina;
                    return (
                      <button key={n} onClick={() => irPagina(n)} style={{
                        width: 36, height: 36, borderRadius: "50%",
                        border: `1px solid ${activo ? C.brand : C.lineStrong}`,
                        background: activo ? C.brand : C.surface,
                        color: activo ? "#fff" : C.ink2,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        fontFamily: FONT.mono,
                      }}>{n}</button>
                    );
                  })}

                  <button
                    onClick={() => irPagina(Math.min(totalPaginas, pagina + 1))}
                    disabled={pagina >= totalPaginas}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `1px solid ${C.lineStrong}`,
                      background: C.surface, color: pagina >= totalPaginas ? C.muted : C.ink,
                      cursor: pagina >= totalPaginas ? "default" : "pointer",
                    }}>
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }}/>
                  </button>
                </div>
              )}
            </>
          )}
          </div>{/* /columna productos */}
        </div>{/* /vp-tienda-layout */}

        {/* Overlay móvil */}
        {filtrosOpenMobile && (
          <div
            onClick={() => setFiltrosOpenMobile(false)}
            className="vp-overlay-filtros"
            style={{
              position: "fixed", inset: 0, zIndex: 90,
              background: "rgba(0,0,0,0.5)",
              display: "none",
            }}
          />
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .vp-tienda-layout { grid-template-columns: 200px 1fr !important; }
        }
        @media (max-width: 768px) {
          .vp-tienda-layout { grid-template-columns: 1fr !important; }
          .vp-sidebar-filtros {
            position: fixed !important;
            top: 0 !important; right: 0 !important; bottom: 0 !important;
            width: 280px !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-radius: 0 !important;
            z-index: 100;
          }
          .vp-sidebar-filtros.open { transform: translateX(0) !important; }
          .vp-toggle-filtros-mobile { display: inline-flex !important; }
          .vp-cerrar-filtros-mobile { display: block !important; }
          .vp-overlay-filtros { display: block !important; }
        }
      `}</style>
    </>
  );
}
