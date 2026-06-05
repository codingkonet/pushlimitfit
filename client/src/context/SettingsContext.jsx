import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isPremium, setPremium as persistPremium,
  getTheme, setTheme as persistTheme,
  getAccent, setAccent as persistAccent,
} from '../api/storage';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { proFromServer } = useAuth();
  const [localPremium, setLocalPremium] = useState(isPremium());
  const [theme, setThemeState] = useState(getTheme());
  const [accent, setAccentState] = useState(getAccent());

  // Source of truth for Pro: a verified server purchase, OR a local unlock
  // (offline / demo builds without Supabase). Server always wins when present.
  const premium = proFromServer || localPremium;

  // Apply theme + accent to <html>. Free tier is locked to dark / green.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', premium ? theme : 'dark');
    root.setAttribute('data-accent', premium ? accent : 'green');
  }, [premium, theme, accent]);

  const unlockPremium = useCallback(() => { persistPremium(true); setLocalPremium(true); }, []);
  const resetPremium = useCallback(() => { persistPremium(false); setLocalPremium(false); }, []);
  const setTheme = useCallback((t) => { persistTheme(t); setThemeState(t); }, []);
  const setAccent = useCallback((a) => { persistAccent(a); setAccentState(a); }, []);

  return (
    <SettingsContext.Provider value={{ premium, proFromServer, unlockPremium, resetPremium, theme, setTheme, accent, setAccent }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
