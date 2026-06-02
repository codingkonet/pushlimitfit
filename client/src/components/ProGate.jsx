import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLang } from '../context/LangContext';

// Small "PRO" pill
export function ProBadge({ className = '' }) {
  return (
    <span className={`badge bg-green-500/15 text-green-400 gap-1 ${className}`}>
      <Crown size={10} /> PRO
    </span>
  );
}

// Full-section gate: renders children when premium, otherwise a locked panel
export default function ProGate({ children }) {
  const { premium } = useSettings();
  const { t } = useLang();
  if (premium) return children;
  return (
    <div className="card text-center py-14 border-green-500/30 bg-green-500/5">
      <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-4">
        <Lock size={26} className="text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{t('proLockedTitle')}</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-6">{t('proLockedDesc')}</p>
      <Link to="/upgrade" className="btn-primary inline-flex items-center gap-2">
        <Crown size={16} /> {t('goPro')}
      </Link>
    </div>
  );
}
