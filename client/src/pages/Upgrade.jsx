import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { isPayPalConfigured } from '../api/paypal';
import PayPalButton from '../components/PayPalButton';
import { Crown, BarChart2, BookOpen, Download, Palette, Check, Sparkles, Cloud, AlertCircle } from 'lucide-react';

export default function Upgrade() {
  const { premium, unlockPremium, resetPremium } = useSettings();
  const { user, configured, refreshProfile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [error, setError] = useState('');

  const features = [
    { icon: BarChart2, t: t('feat_analytics_t'), d: t('feat_analytics_d') },
    { icon: BookOpen, t: t('feat_plans_t'), d: t('feat_plans_d') },
    { icon: Download, t: t('feat_backup_t'), d: t('feat_backup_d') },
    { icon: Palette, t: t('feat_themes_t'), d: t('feat_themes_d') },
  ];

  // Demo fallback: only when PayPal isn't configured (offline/local build).
  function handleDemoUnlock() {
    unlockPremium();
    setJustUnlocked(true);
    setTimeout(() => navigate('/analytics'), 1200);
  }

  async function handlePaid() {
    setError('');
    await refreshProfile();          // pull is_pro=true granted server-side
    setJustUnlocked(true);
    setTimeout(() => navigate('/analytics'), 1200);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center pt-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
          <Crown size={30} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          {premium ? t('alreadyPro') : t('unlockTitle')}
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          {premium ? t('proThanks') : t('unlockSubtitle')}
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, t: title, d }) => (
          <div key={title} className="card flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Icon size={22} className="text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{title}</h3>
                <Check size={15} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="card text-center bg-gradient-to-b from-green-500/5 to-transparent border-green-500/20">
        {premium ? (
          <>
            <p className="text-green-400 font-semibold flex items-center justify-center gap-2 mb-4">
              <Sparkles size={18} /> {t('proMember')}
            </p>
            <button onClick={resetPremium} className="btn-secondary">{t('resetPro')}</button>
          </>
        ) : justUnlocked ? (
          <p className="text-green-400 font-bold text-lg flex items-center justify-center gap-2 py-2">
            <Check size={22} /> {t('alreadyPro')}
          </p>
        ) : isPayPalConfigured ? (
          // ── Real PayPal checkout ──
          user ? (
            <>
              <div className="text-3xl font-black text-white mb-1">{t('proPrice')}</div>
              <p className="text-sm text-gray-500 mb-5">{t('proPriceSub')}</p>
              {error && (
                <p className="text-red-400 text-sm mb-3 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
              <div className="max-w-xs mx-auto">
                <PayPalButton onPaid={handlePaid} onError={(e) => setError(e.message || t('payFailed'))} />
              </div>
            </>
          ) : (
            // Signed out → Pro must attach to an account.
            <>
              <div className="text-3xl font-black text-white mb-1">{t('proPrice')}</div>
              <p className="text-sm text-gray-500 mb-5">{t('signInToBuy')}</p>
              <Link to="/account" className="btn-primary inline-flex items-center gap-2">
                <Cloud size={16} /> {t('signInBtn')}
              </Link>
            </>
          )
        ) : (
          // ── No payment provider configured → demo unlock ──
          <>
            <div className="text-3xl font-black text-white mb-1">$0</div>
            <p className="text-sm text-gray-500 mb-5">{t('demoUnlock')}</p>
            <button onClick={handleDemoUnlock} className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
              <Crown size={18} /> {t('unlockNow')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
