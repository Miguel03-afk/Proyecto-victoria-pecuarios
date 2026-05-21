// src/hooks/useMediaQuery.js
// Hooks para detectar breakpoints y media queries desde JS.
// Útiles cuando necesitas cambiar LÓGICA (no solo CSS) según el viewport
// — por ejemplo, renderizar otro componente, ocultar features, etc.
//
// Para cambios puramente visuales (font-size, padding, columnas) prefiere
// usar <style>{`@media (max-width: ...) { ... }`}</style> con className.
// Es más performante porque no causa re-render de React.

import { useState, useEffect } from "react";

/* Breakpoints unificados — usar estos valores en toda la app. */
export const BP = {
  mobile:  640,   // < 640px  → móvil
  tablet:  1024,  // 640–1023 → tablet
  desktop: 1280,  // ≥ 1024   → desktop
};

/* useMediaQuery — listener reactivo de cualquier media query CSS. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    // Safari <14 no soporta addEventListener en MediaQueryList
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, [query]);

  return matches;
}

/* useBreakpoint — devuelve 'mobile' | 'tablet' | 'desktop'. */
export function useBreakpoint() {
  const isMobile = useMediaQuery(`(max-width: ${BP.mobile - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${BP.mobile}px) and (max-width: ${BP.tablet - 1}px)`
  );
  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  return "desktop";
}

/* Atajos legibles para no escribir media queries a mano. */
export const useIsMobile  = () => useMediaQuery(`(max-width: ${BP.mobile - 1}px)`);
export const useIsTablet  = () => useMediaQuery(`(min-width: ${BP.mobile}px) and (max-width: ${BP.tablet - 1}px)`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BP.tablet}px)`);

/* Hook para respetar prefers-reduced-motion (Emil compliance). */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
