import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isPremium, setPremium as persistPremium,
  getTheme, setTheme as persistTheme,
  getAccent, setAccent as persistAccent,
} from '../api/storage';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [premium, setPremiumState] = useState(isPremium());
  const [theme, setThemeState] = useState(getTheme());
  const [accent, setAccentState] = useState(getAccent());

  // Apply theme + accent to <html>. Free tier is locked to dark / green.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', premium ? theme : 'dark');
    root.setAttribute('data-accent', premium ? accent : 'green');
  }, [premium, theme, accent]);

  const unlockPremium = useCallback(() => { persistPremium(true); setPremiumState(true); }, []);
  const resetPremium = useCallback(() => { persistPremium(false); setPremiumState(false); }, []);
  const setTheme = useCallback((t) => { persistTheme(t); setThemeState(t); }, []);
  const setAccent = useCallback((a) => { persistAccent(a); setAccentState(a); }, []);

  return (
    <SettingsContext.Provider value={{ premium, unlockPremium, resetPremium, theme, setTheme, accent, setAccent }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
