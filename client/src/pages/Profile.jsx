import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, saveProfile, calcNutritionTargets, getMeasurements, addMeasurement, exportAllData, importAllData } from '../api/storage';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import ProGate, { ProBadge } from '../components/ProGate';
import { User, Save, Scale, Ruler, Target, TrendingUp, Plus, Palette, Download, Upload, Sun, Moon, Crown } from 'lucide-react';

const ACCENTS = [
  { id: 'green', color: '#22c55e' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'purple', color: '#a855f7' },
  { id: 'orange', color: '#f97316' },
  { id: 'rose', color: '#f43f5e' },
];

function AppearanceSection() {
  const { t } = useLang();
  const { theme, setTheme, accent, setAccent } = useSettings();
  return (
    <div className="space-y-5">
      <div>
        <label className="label">{t('themeMode')}</label>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {[{ id: 'dark', icon: Moon, label: t('darkMode') }, { id: 'light', icon: Sun, label: t('lightMode') }].map(m => (
            <button key={m.id} onClick={() => setTheme(m.id)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${theme === m.id ? 'border-green-500/50 bg-green-500/5 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              <m.icon size={16} /> {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">{t('accentColor')}</label>
        <div className="flex gap-3">
          {ACCENTS.map(a => (
            <button key={a.id} onClick={() => setAccent(a.id)} aria-label={a.id}
              className={`w-9 h-9 rounded-full transition-all ${accent === a.id ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: a.color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSection() {
  const { t } = useLang();
  const fileRef = useRef(null);

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pushlimitfit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(JSON.parse(reader.result));
        alert(t('importDone'));
        window.location.reload();
      } catch {
        alert(t('importBad'));
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
        <Download size={16} /> {t('exportData')}
      </button>
      <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2">
        <Upload size={16} /> {t('importData')}
      </button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
    </div>
  );
}

export default function Profile() {
  const { t } = useLang();
  const { premium } = useSettings();
  const [user, setUser] = useState(getProfile());
  const [form, setForm] = useState({ age: '', gender: 'male', height_cm: '', weight_kg: '', activity_level: 'moderate', goal: 'maintain' });
  const [saved, setSaved] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [newMeasurement, setNewMeasurement] = useState({ date: new Date().toISOString().slice(0, 10), weight_kg: '', body_fat_pct: '' });

  const activityLabels = {
    sedentary: t('sedentary'), light: t('light'), moderate: t('moderate'),
    active: t('active'), very_active: t('veryActive')
  };
  const goalLabels = { lose: t('loseWeight'), maintain: t('maintainWeight'), gain: t('gainMuscle') };

  useEffect(() => {
    const p = getProfile();
    setForm({ age: p.age || '', gender: p.gender || 'male', height_cm: p.height_cm || '',
      weight_kg: p.weight_kg || '', activity_level: p.activity_level || 'moderate', goal: p.goal || 'maintain' });
    setMeasurements(getMeasurements());
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSave(e) {
    e.preventDefault();
    const hasAllStats = form.age && form.height_cm && form.weight_kg;
    const targets = hasAllStats ? calcNutritionTargets(form) : {};
    const updated = saveProfile({
      ...form,
      age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg),
      ...targets,
    });
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function logMeasurement(e) {
    e.preventDefault();
    const updated = addMeasurement(newMeasurement);
    setNewMeasurement({ date: new Date().toISOString().slice(0, 10), weight_kg: '', body_fat_pct: '' });
    setMeasurements(updated);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User size={24} className="text-green-400" /> {t('myProfile')}
        </h1>
        <p className="text-gray-400 mt-0.5">{t('profileSubtitle')}</p>
      </div>

      {user?.daily_calories && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('bmrLabel'), value: `${user.bmr || '—'} kcal`, icon: Ruler, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: t('tdeeLabel'), value: `${user.tdee || '—'} kcal`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: t('dailyTargetLabel'), value: `${user.daily_calories || '—'} kcal`, icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: t('currentGoal'), value: goalLabels[user.goal] || '—', icon: Scale, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div className="text-lg font-bold text-white leading-tight">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-5">{t('personalInfo')}</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('age')}</label>
              <input type="number" className="input" placeholder="25" min="15" max="90"
                value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('gender')}</label>
              <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('heightCm')}</label>
              <input type="number" className="input" placeholder="175" min="100" max="250"
                value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('weightKg')}</label>
              <input type="number" className="input" placeholder="70" min="30" max="300" step="0.1"
                value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">{t('activityLevel')}</label>
            <select className="select" value={form.activity_level} onChange={e => set('activity_level', e.target.value)}>
              {Object.entries(activityLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('goal')}</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(goalLabels).map(([val, label]) => (
                <label key={val} className={`flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all text-center ${form.goal === val ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="radio" name="goal" value={val} checked={form.goal === val} onChange={e => set('goal', e.target.value)} className="hidden" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saved ? t('savedProfile') : t('saveProfile')}
          </button>
        </form>
      </div>

      {user?.protein_g && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">{t('dailyMacros')}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: t('protein'), value: user.protein_g, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('carbs'), value: user.carbs_g, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: t('fat'), value: user.fat_g, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map(m => (
              <div key={m.label} className={`rounded-xl ${m.bg} p-4`}>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}g</div>
                <div className="text-sm text-gray-400 mt-0.5">{m.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{Math.round(m.value * (m.label === t('fat') ? 9 : 4))} kcal</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-4">{t('bodyMeasurements')}</h2>
        <form onSubmit={logMeasurement} className="flex gap-3 mb-4 flex-wrap">
          <input type="date" className="input w-auto flex-1 min-w-32" value={newMeasurement.date}
            onChange={e => setNewMeasurement(p => ({ ...p, date: e.target.value }))} />
          <input type="number" className="input w-28" placeholder={t('weightKg')} step="0.1" min="0"
            value={newMeasurement.weight_kg} onChange={e => setNewMeasurement(p => ({ ...p, weight_kg: e.target.value }))} />
          <input type="number" className="input w-28" placeholder={t('bodyFatPct')} step="0.1" min="0" max="60"
            value={newMeasurement.body_fat_pct} onChange={e => setNewMeasurement(p => ({ ...p, body_fat_pct: e.target.value }))} />
          <button type="submit" className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} /> {t('logBtn')}
          </button>
        </form>
        {measurements.length === 0 ? (
          <p className="text-gray-600 text-sm italic">{t('noMeasurements')}</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {measurements.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-gray-400">{m.date}</span>
                <div className="flex items-center gap-4">
                  {m.weight_kg && <span className="text-white">{m.weight_kg} kg</span>}
                  {m.body_fat_pct && <span className="text-gray-400">{m.body_fat_pct}% {t('bodyFatPct')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade banner (free tier only) */}
      {!premium && (
        <Link to="/upgrade" className="card flex items-center gap-4 border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
            <Crown size={22} className="text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{t('goPro')}</h3>
            <p className="text-sm text-gray-400">{t('unlockSubtitle')}</p>
          </div>
        </Link>
      )}

      {/* Appearance (Pro) */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Palette size={18} className="text-green-400" /> {t('appearance')} {!premium && <ProBadge />}
        </h2>
        <ProGate><AppearanceSection /></ProGate>
      </div>

      {/* Data & backup (Pro) */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Download size={18} className="text-green-400" /> {t('dataBackup')} {!premium && <ProBadge />}
        </h2>
        <ProGate><DataSection /></ProGate>
      </div>
    </div>
  );
}
