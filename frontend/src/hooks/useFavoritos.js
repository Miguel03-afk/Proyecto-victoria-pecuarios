// src/hooks/useFavoritos.js
// Sistema de favoritos con doble persistencia:
//  - localStorage (instantáneo, funciona sin sesión, funciona offline)
//  - backend /api/favoritos (persiste entre dispositivos cuando hay sesión)
//
// Flujo:
//  - Toggle: actualiza localStorage de inmediato (optimistic), y si hay
//    sesión hace fire-and-forget al backend. Si el backend falla, el cliente
//    sigue funcionando — el localStorage es la fuente de verdad.
//  - Al iniciar sesión, migrarFavoritosGuest() fusiona los favoritos guest
//    con los del usuario en el backend.
import { useEffect, useCallback, useSyncExternalStore } from "react";
import api from "../services/api";

const KEY_GUEST = "vp_favoritos_guest";
const keyDe = (usuario) => usuario ? `vp_favoritos_${usuario.id}` : KEY_GUEST;

/* Mini event bus para que cualquier componente que use el hook se entere
   cuando otro componente cambie los favoritos (sin tener que pasar props). */
const listeners = new Set();
const emit = () => listeners.forEach(l => l());
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

/* ─── Snapshot cache ─────────────────────────────────────────────────────────
   React.useSyncExternalStore exige que getSnapshot devuelva la MISMA
   referencia si el valor no cambió. JSON.parse crea un array nuevo en cada
   llamada — eso disparaba un loop infinito de re-render. La caché por key
   compara el string raw del localStorage y solo reparsea si cambió. */
const EMPTY_LIST = Object.freeze([]);
const snapshotCache = new Map(); // key → { raw: string|null, parsed: array }

function leer(usuario) {
  const k = keyDe(usuario);
  let raw = null;
  try { raw = localStorage.getItem(k); } catch { return EMPTY_LIST; }

  const cached = snapshotCache.get(k);
  if (cached && cached.raw === raw) return cached.parsed;

  let parsed = EMPTY_LIST;
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      parsed = Array.isArray(arr) ? arr : EMPTY_LIST;
    } catch {
      parsed = EMPTY_LIST;
    }
  }
  snapshotCache.set(k, { raw, parsed });
  return parsed;
}

function escribir(usuario, lista) {
  const k = keyDe(usuario);
  try { localStorage.setItem(k, JSON.stringify(lista)); } catch {}
  // Invalida la caché para que el próximo leer() devuelva la nueva referencia
  snapshotCache.delete(k);
  emit();
}

/* Servidor / fallback estable — siempre la misma referencia */
const getServerSnapshot = () => EMPTY_LIST;

/* Llamar al login para:
   1. Traer favoritos del backend
   2. Fusionarlos con los favoritos guest del localStorage
   3. Subir los nuevos al backend
   4. Limpiar key guest. */
export async function migrarFavoritosGuest(usuario) {
  if (!usuario) return;
  const userKey = keyDe(usuario);
  try {
    let backendFavs = [];
    try {
      const { data } = await api.get("/favoritos");
      backendFavs = Array.isArray(data) ? data : [];
    } catch {}

    const guest = JSON.parse(localStorage.getItem(KEY_GUEST) || "[]");
    const localUser = JSON.parse(localStorage.getItem(userKey) || "[]");

    // Fusiona los 3 origenes por id
    const merged = [];
    const seen = new Set();
    for (const arr of [backendFavs, localUser, guest]) {
      for (const fav of arr) {
        if (fav?.id && !seen.has(fav.id)) {
          seen.add(fav.id);
          merged.push(fav);
        }
      }
    }
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(KEY_GUEST);
    emit();

    // Sube al backend los que no estaban ahí
    const backendIds = new Set(backendFavs.map(f => f.id));
    for (const fav of merged) {
      if (!backendIds.has(fav.id)) {
        api.post("/favoritos", { producto_id: fav.id }).catch(() => {});
      }
    }
  } catch {}
}

export function useFavoritos(usuario) {
  // useSyncExternalStore mantiene el estado en sync con cambios externos
  // (otro componente toggleando, otra pestaña vía storage event, etc.).
  // Los getSnapshot deben retornar la MISMA referencia si no hay cambio;
  // la caché en `leer()` se encarga de eso.
  const getClientSnapshot = useCallback(() => leer(usuario), [usuario]);
  const lista = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  // Storage event para sincronizar entre pestañas del mismo navegador
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === keyDe(usuario) || e.key === KEY_GUEST) emit();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [usuario]);

  const esFavorito = useCallback(
    (productoId) => lista.some(f => f.id === productoId),
    [lista]
  );

  const toggle = useCallback((producto) => {
    if (!producto?.id) return;
    const actual = leer(usuario);
    const existe = actual.some(f => f.id === producto.id);
    let nueva;
    if (existe) {
      nueva = actual.filter(f => f.id !== producto.id);
      if (usuario) api.delete(`/favoritos/${producto.id}`).catch(() => {});
    } else {
      nueva = [
        ...actual,
        {
          id:         producto.id,
          nombre:     producto.nombre,
          slug:       producto.slug,
          precio:     Number(producto.precio || 0),
          imagen_url: producto.imagen_url || (producto.imagenes_extra?.[0] ?? null),
          stock:      Number(producto.stock ?? 0),
          marca:      producto.marca || null,
          agregado_en: Date.now(),
        },
      ];
      if (usuario) api.post("/favoritos", { producto_id: producto.id }).catch(() => {});
    }
    escribir(usuario, nueva);
  }, [usuario]);

  const quitar = useCallback((productoId) => {
    const actual = leer(usuario);
    escribir(usuario, actual.filter(f => f.id !== productoId));
    if (usuario) api.delete(`/favoritos/${productoId}`).catch(() => {});
  }, [usuario]);

  const vaciarFavoritos = useCallback(() => {
    escribir(usuario, []);
    if (usuario) api.delete("/favoritos").catch(() => {});
  }, [usuario]);

  /* Refrescar desde backend (útil para detectar productos agotados con stock
     fresco al entrar a la sección de favoritos en Perfil). */
  const refrescar = useCallback(async () => {
    if (!usuario) return;
    try {
      const { data } = await api.get("/favoritos");
      if (Array.isArray(data)) {
        escribir(usuario, data);
      }
    } catch {}
  }, [usuario]);

  return {
    favoritos: lista,
    esFavorito,
    toggle,
    quitar,
    vaciarFavoritos,
    refrescar,
    total: lista.length,
  };
}
