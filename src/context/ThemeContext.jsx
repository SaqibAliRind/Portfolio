import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = 'portfolio-theme';
const ACCENT_KEY = 'portfolio-accent';
const DEFAULT_ACCENT = 'blue';

const VALID_THEMES = ['dark', 'light'];
const VALID_ACCENTS = ['blue', 'purple', 'cyan', 'green', 'orange', 'pink', 'red', 'default'];

export const ThemeProvider = ({ children }) => {
  // 1. Initialize Theme
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
      return savedTheme;
    }
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default
  });

  // 2. Initialize Accent Color
  const [accentColor, setAccentColorState] = useState(() => {
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedAccent && VALID_ACCENTS.includes(savedAccent)) {
      return savedAccent;
    }
    return DEFAULT_ACCENT;
  });

  // 3. Apply Theme to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // 4. Apply Accent to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem(ACCENT_KEY, accentColor);
  }, [accentColor]);

  // Helper functions
  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const setAccentColor = (newAccent) => {
    if (VALID_ACCENTS.includes(newAccent)) {
      setAccentColorState(newAccent);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setTheme, setAccentColor, VALID_ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  );
};
