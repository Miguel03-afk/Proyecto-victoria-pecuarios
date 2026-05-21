// src/styles/ThemeProvider.jsx
// ThemeProvider y useTheme — separados de admin.tokens.js (que es .js puro, sin JSX)
import { createContext, useContext, useEffect, useState } from 'react';
import { LIGHT, DARK } from './admin.tokens';

const ThemeCtx = createContext({ C: LIGHT, mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('vp-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const C = mode === 'dark' ? DARK : LIGHT;
    localStorage.setItem('vp-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    document.documentElement.style.background = C.canvas;
    document.documentElement.style.color      = C.ink;
    document.body.style.background = C.canvas;
    document.body.style.color      = C.ink;
    document.body.style.transition = 'background 0.35s ease, color 0.35s ease';
    document.body.style.minHeight  = '100vh';
    document.body.style.margin     = '0';
  }, [mode]);

  const C      = mode === 'dark' ? DARK : LIGHT;
  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark');

  return <ThemeCtx.Provider value={{ C, mode, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
