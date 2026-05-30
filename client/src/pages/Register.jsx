import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Activity, Eye, EyeOff, Globe } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)
      return setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
    if (form.password.length < 6)
      return setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' : 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">PushLIMITfit</h1>
          <p className="text-gray-400 mt-1">{t('startJourney')}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">{t('createAccount')}</h2>
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <Globe size={13} /> {lang === 'en' ? 'عربي' : 'EN'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('username')}</label>
              <input type="text" className="input" placeholder="johndoe" value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('emailAddress')}</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pe-10"
                  placeholder={t('minPassword')} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">{t('confirmPassword')}</label>
              <input type="password" className="input" placeholder={t('repeatPassword')} value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? t('creatingAccount') : t('createAccountBtn')}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-gray-400 text-sm">
          {t('alreadyAccount')}{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">{t('signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
