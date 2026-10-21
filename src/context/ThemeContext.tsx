import React, { createContext, useContext, useEffect, useState } from 'react';

export type LuxuryTheme = 'obsidian' | 'champagne';

interface ThemeContextType {
  theme: LuxuryTheme;
  isChampagne: boolean;
  toggleTheme: () => void;
  setTheme: (theme: LuxuryTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'obsidian',
  isChampagne: false,
  toggleTheme: () => {},
  setTheme: () => {}
});

const STORAGE_KEY = 'pm_luxury_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<LuxuryTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'champagne' || saved === 'obsidian') {
        return saved;
      }
    }
    return 'obsidian';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'champagne') {
      root.classList.add('theme-champagne');
      root.classList.remove('theme-obsidian');
      document.body.style.backgroundColor = '#f7f4ed';
      document.body.style.color = '#1c1917';
    } else {
      root.classList.add('theme-obsidian');
      root.classList.remove('theme-champagne');
      document.body.style.backgroundColor = '#06080e';
      document.body.style.color = '#f8fafc';
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
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
    <ThemeContext.Provider value={{ theme, isChampagne: theme === 'champagne', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
