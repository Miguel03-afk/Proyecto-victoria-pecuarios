// src/context/CarritoContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items,     setItems]     = useState([]);
  const [abierto,   setAbierto]   = useState(false);
  const [validando, setValidando] = useState(false);

  // Ref para acceder al valor actual sin re-crear callbacks (evita setState dentro de setState)
  const itemsRef = useRef([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── Cargar desde localStorage al iniciar ──────────────────
  useEffect(() => {
    try {
      const data   = localStorage.getItem("carrito_local");
      const parsed = data ? JSON.parse(data) : [];
      setItems(parsed);
      itemsRef.current = parsed;
    } catch {
      setItems([]);
    }
  }, []);

  const guardarLocal = (nuevos) => {
    try { localStorage.setItem("carrito_local", JSON.stringify(nuevos)); } catch {}
  };

  // ── Validar stock contra backend ──────────────────────────
  const validarCarrito = useCallback(async (itemsActuales) => {
    if (!itemsActuales.length) return itemsActuales;
    setValidando(true);
    try {
      const resultados = await Promise.all(
        itemsActuales.map(item =>
          api.get(`/productos/${item.slug}`).then(r => r.data).catch(() => null)
        )
      );
      const actualizados = itemsActuales.map((item, i) => {
        const prod = resultados[i];
        if (!prod) return { ...item, activo: false, stock: 0 };
        const stockReal = Number(prod.stock ?? 0);
        return {
          ...item,
          precio:   Number(prod.precio),
          stock:    stockReal,
          activo:   prod.activo === 1 || prod.activo === true,
          cantidad: Math.max(1, Math.min(item.cantidad, stockReal)),
        };
      });
      guardarLocal(actualizados);
      setItems(actualizados);
      itemsRef.current = actualizados;
      return actualizados;
    } catch (err) {
      console.error("Error validando carrito:", err);
      return itemsActuales;
    } finally {
      setValidando(false);
    }
  }, []);

  // ── Abrir carrito — NO setState dentro de setState ────────
  const abrirCarrito = useCallback(() => {
    setAbierto(true);
    const actuales = itemsRef.current;
    if (actuales.length > 0) validarCarrito(actuales);
  }, [validarCarrito]);

  const cerrarCarrito = useCallback(() => setAbierto(false), []);

  // ── Agregar producto ──────────────────────────────────────
  const agregar = useCallback((producto, cantidad = 1) => {
    if (!producto?.id || !producto?.slug) {
      console.warn("[Carrito] producto inválido:", producto);
      return;
    }
    const stockMax   = Number(producto.stock ?? 99);
    const precioFinal = Number(producto.precio ?? 0);

    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id);
      let nuevos;
      if (existe) {
        nuevos = prev.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, i.stock || stockMax) }
            : i
        );
      } else {
        nuevos = [...prev, {
          id:          producto.id,
          nombre:      producto.nombre || "Producto",
          precio:      precioFinal,
          precio_antes: producto.precio_antes ? Number(producto.precio_antes) : null,
          imagen_url:  producto.imagen_url || null,
          slug:        producto.slug,
          stock:       stockMax,
          activo:      true,
          cantidad:    Math.min(cantidad, stockMax),
        }];
      }
      guardarLocal(nuevos);
      itemsRef.current = nuevos;
      return nuevos;
    });

    // Abrir panel sin depender del estado actualizado
    setAbierto(true);
  }, []);

  // Alias — ambos nombres funcionan para compatibilidad con código anterior
  const agregarAlCarrito = agregar;

  // ── Quitar ────────────────────────────────────────────────
  const quitar = useCallback((id) => {
    setItems(prev => {
      const nuevos = prev.filter(i => i.id !== id);
      guardarLocal(nuevos);
      itemsRef.current = nuevos;
      return nuevos;
    });
  }, []);

  // ── Cambiar cantidad ──────────────────────────────────────
  const cambiarCantidad = useCallback((id, delta) => {
    setItems(prev => {
      const nuevos = prev.map(i => {
        if (i.id !== id) return i;
        const nueva = i.cantidad + delta;
        if (nueva <= 0) return null;
        if (nueva > (i.stock || 999)) return i;
        return { ...i, cantidad: nueva };
      }).filter(Boolean);
      guardarLocal(nuevos);
      itemsRef.current = nuevos;
      return nuevos;
    });
  }, []);

  // ── Vaciar ────────────────────────────────────────────────
  const vaciar = useCallback(() => {
    setItems([]);
    itemsRef.current = [];
    localStorage.removeItem("carrito_local");
  }, []);

  // ── Quitar no disponibles ─────────────────────────────────
  const quitarNoDisponibles = useCallback(() => {
    setItems(prev => {
      const nuevos = prev.filter(i => i.activo !== false && i.stock > 0);
      guardarLocal(nuevos);
      itemsRef.current = nuevos;
      return nuevos;
    });
  }, []);

  // ── Totales (solo items disponibles) ─────────────────────
  const itemsDisponibles = items.filter(i => i.activo !== false && i.stock > 0);
  const totalItems       = itemsDisponibles.reduce((a, i) => a + i.cantidad, 0);
  const totalPrecio      = itemsDisponibles.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const hayNoDisponibles = items.some(i => i.activo === false || i.stock === 0);

  return (
    <CarritoContext.Provider value={{
      items, abierto, validando,
      setAbierto: (v) => v ? abrirCarrito() : cerrarCarrito(),
      agregar,
      agregarAlCarrito,
      quitar,
      cambiarCantidad,
      vaciar,
      quitarNoDisponibles,
      abrirCarrito,
      cerrarCarrito,
      totalItems,
      totalPrecio,
      hayNoDisponibles,
      itemsDisponibles,
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
};