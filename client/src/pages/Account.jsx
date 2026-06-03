import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Cloud, CloudOff, RefreshCw, LogOut, Check, Mail, Lock, UserCircle } from 'lucide-react';

export default function Account() {
  const { t } = useLang();
  const { user, configured, syncing, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const res = await signUp(email, password);
        if (!res.session) setNotice(t('checkEmail'));
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err?.message || t('authFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Cloud size={24} className="text-green-400" /> {t('cloudSync')}
        </h1>
        <p className="text-gray-400 mt-0.5">{t('accountSubtitle')}</p>
      </div>

      {/* Sync not configured for this build */}
      {!configured && (
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <CloudOff size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">{t('syncDisabled')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('syncDisabledHint')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Signed in */}
      {configured && user && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <UserCircle size={26} className="text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-400">{t('syncedAs')}</p>
              <p className="font-medium text-white truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {syncing
              ? <><RefreshCw size={15} className="text-green-400 animate-spin" /> <span className="text-gray-300">{t('syncing')}</span></>
              : <><Check size={15} className="text-green-400" /> <span className="text-gray-300">{t('synced')}</span></>}
          </div>
          <p className="text-sm text-gray-500">{t('syncOn')}</p>
          <button onClick={signOut} className="btn-secondary flex items-center gap-2">
            <LogOut size={16} /> {t('signOutBtn')}
          </button>
        </div>
      )}

      {/* Signed out → auth form */}
      {configured && !user && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('emailLabel')}</label>
              <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required className="input ps-9" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">{t('passwordLabel')}</label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" required minLength={6} className="input ps-9" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {notice && <p className="text-green-400 text-sm">{notice}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? t('syncing') : mode === 'signup' ? t('signUpBtn') : t('signInBtn')}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-400">
            {mode === 'signup' ? t('haveAccount') : t('needAccount')}{' '}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setNotice(''); }}
              className="text-green-400 hover:text-green-300 font-medium">
              {mode === 'signup' ? t('signInBtn') : t('createAccount')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
