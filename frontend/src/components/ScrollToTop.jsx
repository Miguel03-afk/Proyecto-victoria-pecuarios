// src/components/ScrollToTop.jsx
// Resetea el scroll del navegador al cambiar de ruta.
// Respeta hashes — si la URL trae /#servicios, dejamos que el destino
// haga su propio scrollIntoView en vez de pisarlo.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
