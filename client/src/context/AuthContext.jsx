import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, pullCloudData, pushCloudData } from '../api/supabase';
import { getMyProfile } from '../api/profile';
import { onDataChange, getDataBundle, replaceAllLocal } from '../api/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef(null);
  const userRef = useRef(null);

  // Load the server profile (Pro + admin flags) for the current user.
  const refreshProfile = useCallback(async () => {
    const p = await getMyProfile();
    setProfile(p);
    return p;
  }, []);

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
        // Re-read everything fresh across the app — but at most once per
        // browser session, so a restored session can never reload-loop.
        if (!sessionStorage.getItem('plt_synced')) {
          sessionStorage.setItem('plt_synced', '1');
          window.location.reload();
        }
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
      if (u) refreshProfile();
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        userRef.current = null;
        setProfile(null);
        sessionStorage.removeItem('plt_synced');
        return;
      }
      const wasSignedOut = !userRef.current;
      userRef.current = u;
      // Only a genuine new sign-in pulls remote data (which may reload).
      // Restoring a session — INITIAL_SESSION, token refresh, tab refocus —
      // must NOT, or the app reload-loops on every visit.
      if (event === 'SIGNED_IN' && wasSignedOut) reconcile(u);
      refreshProfile();
    });

    return () => sub.subscription.unsubscribe();
  }, [schedulePush, reconcile, refreshProfile]);

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
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, profile, ready, syncing,
      isAdmin: profile?.is_admin === true,
      proFromServer: profile?.is_pro === true,
      configured: isSupabaseConfigured,
      signUp, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
