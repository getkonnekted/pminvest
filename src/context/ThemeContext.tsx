import React, { createContext, useContext, useEffect, useState } from 'react';

export type LuxuryTheme = 'obsidian' | 'champagne';

interface ThemeContextType {
  theme: LuxuryTheme;
  isChampagne: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: LuxuryTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'champagne',
  isChampagne: true,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {}
});

const STORAGE_KEY = 'pm_theme_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<LuxuryTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'champagne' || saved === 'obsidian') {
        return saved;
      }
    }
    // Refined Light Mode Default
    return 'champagne';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'champagne') {
      root.classList.add('theme-champagne');
      root.classList.remove('theme-obsidian');
      document.body.style.backgroundColor = '#FAF8F4';
      document.body.style.color = '#18222B';
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#FAF8F4');
    } else {
      root.classList.add('theme-obsidian');
      root.classList.remove('theme-champagne');
      document.body.style.backgroundColor = '#0B1015';
      document.body.style.color = '#F4F1EA';
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#0B1015');
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'obsidian' ? 'champagne' : 'obsidian'));
  };

  const setTheme = (newTheme: LuxuryTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isChampagne: theme === 'champagne',
        isDark: theme === 'obsidian',
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
