import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const BENEFICIOS = [
  { icono: "🚚", titulo: "Envío a domicilio", desc: "Llevamos tus pedidos hasta tu puerta" },
  { icono: "💊", titulo: "Medicamentos certificados", desc: "Productos con registro veterinario oficial" },
  { icono: "👨‍⚕️", titulo: "Asesoría veterinaria", desc: "Expertos disponibles para orientarte" },
  { icono: "🔒", titulo: "Compra segura", desc: "Tus datos siempre protegidos" },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
      <div className="h-3.5 bg-gray-100 rounded w-4/5" />
      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      <div className="h-7 bg-gray-100 rounded-lg mt-3" />
    </div>
  </div>
);

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const buscar = searchParams.get("buscar") || "";
  const categoria = searchParams.get("categoria") || "";
  const pagina = Number(searchParams.get("pagina") || 1);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (buscar) params.set("buscar", buscar);
        if (categoria) params.set("categoria", categoria);
        params.set("pagina", pagina);
        params.set("limite", 12);
        const [rProd, rCat] = await Promise.all([
          api.get(`/productos?${params}`),
          api.get("/categorias"),
        ]);
        setProductos(rProd.data.productos);
        setTotal(rProd.data.total);
        setCategorias(rCat.data.filter((c) => !c.parent_id));
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [buscar, categoria, pagina]);

  const filtrar = (slug) => setSearchParams(slug ? { categoria: slug } : {});
  const totalPaginas = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero compacto */}
      <div className="bg-gradient-to-r from-green-700 to-green-500">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 flex items-center justify-between gap-6">
          <div>
            <span className="text-green-200 text-xs font-semibold uppercase tracking-widest">Bienvenido</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-2 leading-tight">
              Todo para el bienestar<br className="hidden sm:block" /> de tus animales
            </h1>
            <p className="text-green-100 text-sm mb-4 max-w-sm">
              Medicamentos, alimentos y accesorios veterinarios con la mejor calidad.
            </p>
            <button
              onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-green-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm shadow-sm"
            >
              Ver catálogo
            </button>
          </div>
          <div className="hidden md:block text-7xl select-none opacity-80">🐾</div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BENEFICIOS.map(({ icono, titulo, desc }) => (
            <div key={titulo} className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">{icono}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{titulo}</p>
                <p className="text-xs text-gray-400 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto">
          {[{ slug: "", nombre: "Todos" }, ...categorias].map((cat) => (
            <button key={cat.slug} onClick={() => filtrar(cat.slug)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                (!categoria && cat.slug === "") || categoria === cat.slug
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}>
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo */}
      <div className="max-w-7xl mx-auto px-4 py-6" id="catalogo">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {buscar ? `Resultados: "${buscar}"` : categoria ? "Productos filtrados" : "Catálogo de productos"}
            </h2>
            <p className="text-xs text-gray-400">{total} productos</p>
          </div>
          {(buscar || categoria) && (
            <button onClick={() => setSearchParams({})}
              className="text-xs text-green-600 hover:text-green-800 underline">
              Limpiar filtros
            </button>
          )}
        </div>

        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">Sin resultados</h3>
            <p className="text-sm text-gray-400">Intenta con otros términos o categorías</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {productos.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-1.5 mt-8">
            {[...Array(totalPaginas)].map((_, i) => (
              <button key={i}
                onClick={() => setSearchParams({ pagina: i + 1, ...(categoria && { categoria }), ...(buscar && { buscar }) })}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  pagina === i + 1 ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer simple */}
      <footer className="bg-white border-t border-gray-100 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="text-sm font-bold text-green-800">Victoria Pecuarios</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Victoria Pecuarios. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>📞 300 000 0000</span>
            <span>✉️ info@victoriapecuarios.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
