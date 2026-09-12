"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  // El <html> empieza siempre en modo oscuro (ver layout raíz), así que
  // asumimos eso también aquí para que el primer render del cliente
  // coincida con el del servidor. Si alguien había elegido "claro", el
  // useEffect lo corrige nada más montar: un instante después se ve el
  // icono correcto, en vez de mostrar el botón vacío mientras tanto.
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const actual = document.documentElement.classList.contains("dark");
    if (actual !== isDark) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(actual);
    }
  }, [isDark]);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // el almacenamiento local puede no estar disponible; no pasa nada
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="fixed top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-foreground shadow-sm hover:bg-accent"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
