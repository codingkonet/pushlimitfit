import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, pullCloudData, pushCloudData } from '../api/supabase';
import { onDataChange, getDataBundle, replaceAllLocal } from '../api/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef(null);
  const userRef = useRef(null);

  // Push the full local bundle to the cloud (debounced).
  const schedulePush = useCallback(() => {
    if (!userRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSyncing(true);
        await pushCloudData(userRef.current.id, getDataBundle());
      } catch (e) {
        console.warn('Cloud push failed:', e.message);
      } finally {
        setSyncing(false);
      }
    }, 800);
  }, []);

  // On first sign-in for a session: pull remote → local, or seed remote from local.
  const reconcile = useCallback(async (u) => {
    userRef.current = u;
    if (!u) return;
    setSyncing(true);
    try {
      const remote = await pullCloudData(u.id);
      if (remote && Object.keys(remote).length > 0) {
        replaceAllLocal(remote);
        // re-read everything fresh across the app
        window.location.reload();
      } else {
        // New account (or empty) → seed the cloud with whatever is local now.
        await pushCloudData(u.id, getDataBundle());
      }
    } catch (e) {
      console.warn('Cloud sync failed:', e.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Register the local→cloud change emitter regardless; it no-ops until signed in.
    onDataChange(schedulePush);

    if (!isSupabaseConfigured) { setReady(true); return; }

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      userRef.current = u;
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      const wasSignedOut = !userRef.current;
      setUser(u);
      if (u && wasSignedOut) reconcile(u);
      if (!u) userRef.current = null;
    });

    return () => sub.subscription.unsubscribe();
  }, [schedulePush, reconcile]);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // If email confirmation is OFF, session exists immediately → seed cloud.
    if (data.session?.user) await reconcile(data.session.user);
    return data;
  }, [reconcile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    userRef.current = null;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, ready, syncing,
      configured: isSupabaseConfigured,
      signUp, signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
