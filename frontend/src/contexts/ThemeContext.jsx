import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

// ============================================================
// TEMA UNICO: Claro Profesional
// La app siempre corre en modo claro. No hay toggle.
// ============================================================
export function ThemeProvider({ children }) {
  useEffect(() => {
    // Limpiar cualquier clase 'dark' residual
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.removeItem('tema');
  }, []);

  const value = {
    tema: 'light',
    isDark: false,
    toggleTema: () => {}, // no-op por compatibilidad
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx || { tema: 'light', isDark: false, toggleTema: () => {} };
}