import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const { usuario } = useAuth();
  const [items, setItems]       = useState([]);
  const [abierto, setAbierto]   = useState(false);
  const [validando, setValidando] = useState(false);

  // ── Cargar desde localStorage al iniciar ──────────────────
  useEffect(() => {
    try {
      const data = localStorage.getItem("carrito_local");
      setItems(data ? JSON.parse(data) : []);
    } catch { setItems([]); }
  }, []);

  const guardarLocal = (nuevos) => {
    localStorage.setItem("carrito_local", JSON.stringify(nuevos));
  };

  // ── Validar productos contra el backend ───────────────────
  // Se llama cada vez que el panel se abre
  const validarCarrito = useCallback(async (itemsActuales) => {
    if (!itemsActuales.length) return itemsActuales;
    setValidando(true);
    try {
      // Consultar cada producto en el backend
      const resultados = await Promise.all(
        itemsActuales.map(item =>
          api.get(`/productos/${item.slug}`)
            .then(r => r.data)
            .catch(() => null)
        )
      );

      const actualizados = itemsActuales.map((item, i) => {
        const prodActual = resultados[i];

        // Producto no existe o fue eliminado
        if (!prodActual) return { ...item, activo: false, stock: 0 };

        // Actualizar con datos frescos del backend
        return {
          ...item,
          precio:    Number(prodActual.precio),
          stock:     Number(prodActual.stock),
          activo:    prodActual.activo === 1 || prodActual.activo === true,
          // Si la cantidad supera el stock disponible, ajustarla
          cantidad:  Math.min(item.cantidad, Number(prodActual.stock)),
        };
      });

      guardarLocal(actualizados);
      setItems(actualizados);
      return actualizados;
    } catch (err) {
      console.error("Error validando carrito:", err);
      return itemsActuales;
    } finally {
      setValidando(false);
    }
  }, []);

  // ── Abrir carrito siempre valida ──────────────────────────
  const abrirCarrito = useCallback(async () => {
    setAbierto(true);
    setItems(prev => {
      validarCarrito(prev);
      return prev;
    });
  }, [validarCarrito]);

  // ── Agregar producto ──────────────────────────────────────
  const agregar = (producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id);
      let nuevos;
      if (existe) {
        nuevos = prev.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, i.stock) }
            : i
        );
      } else {
        nuevos = [...prev, {
          id:          producto.id,
          nombre:      producto.nombre,
          precio:      Number(producto.precio),
          precio_antes: producto.precio_antes ? Number(producto.precio_antes) : null,
          imagen_url:  producto.imagen_url || null,
          slug:        producto.slug,
          stock:       Number(producto.stock),
          activo:      true,
          cantidad,
        }];
      }
      guardarLocal(nuevos);
      return nuevos;
    });
    abrirCarrito();
  };

  // ── Quitar producto ───────────────────────────────────────
  const quitar = (id) => {
    setItems(prev => {
      const nuevos = prev.filter(i => i.id !== id);
      guardarLocal(nuevos);
      return nuevos;
    });
  };

  // ── Cambiar cantidad ──────────────────────────────────────
  const cambiarCantidad = (id, delta) => {
    setItems(prev => {
      const nuevos = prev.map(i => {
        if (i.id !== id) return i;
        const nueva = i.cantidad + delta;
        if (nueva <= 0) return null;
        if (nueva > i.stock) return i;
        return { ...i, cantidad: nueva };
      }).filter(Boolean);
      guardarLocal(nuevos);
      return nuevos;
    });
  };

  // ── Vaciar carrito ────────────────────────────────────────
  const vaciar = () => {
    setItems([]);
    localStorage.removeItem("carrito_local");
  };

  // ── Quitar productos no disponibles ──────────────────────
  const quitarNoDisponibles = () => {
    setItems(prev => {
      const nuevos = prev.filter(i => i.activo !== false && i.stock > 0);
      guardarLocal(nuevos);
      return nuevos;
    });
  };

  // ── Totales (solo productos disponibles) ─────────────────
  const itemsDisponibles = items.filter(i => i.activo !== false && i.stock > 0);
  const totalItems       = itemsDisponibles.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrecio      = itemsDisponibles.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const hayNoDisponibles = items.some(i => i.activo === false || i.stock === 0);

  return (
    <CarritoContext.Provider value={{
      items, abierto,
      setAbierto: (v) => { if (v) abrirCarrito(); else setAbierto(false); },
      validando, agregar, quitar, cambiarCantidad, vaciar, quitarNoDisponibles,
      totalItems, totalPrecio, hayNoDisponibles,
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);