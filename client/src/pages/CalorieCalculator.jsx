import React, { useState } from 'react';
import { calcNutritionTargets, saveProfile } from '../api/storage';
import { useLang } from '../context/LangContext';
import { Calculator, Flame, Beef, Wheat, Droplets, Info } from 'lucide-react';

function ResultCard({ icon: Icon, label, value, unit, color, sub }) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
      <div className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-white">{value}<span className="text-base font-normal text-gray-400 ms-1">{unit}</span></div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function CalorieCalculator() {
  const { t } = useLang();
  const [form, setForm] = useState({ age: '', gender: 'male', height_cm: '', weight_kg: '', activity_level: 'moderate', goal: 'maintain' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const activityOptions = [
    { value: 'sedentary', label: t('sedentary'), desc: t('sedentaryDesc') },
    { value: 'light', label: t('light'), desc: t('lightDesc') },
    { value: 'moderate', label: t('moderate'), desc: t('moderateDesc') },
    { value: 'active', label: t('active'), desc: t('activeDesc') },
    { value: 'very_active', label: t('veryActive'), desc: t('veryActiveDesc') },
  ];

  const goalOptions = [
    { value: 'lose', label: t('loseWeight'), desc: t('loseWeightDesc'), color: 'text-blue-400' },
    { value: 'maintain', label: t('maintainWeight'), desc: t('maintainWeightDesc'), color: 'text-green-400' },
    { value: 'gain', label: t('gainMuscle'), desc: t('gainMuscleDesc'), color: 'text-orange-400' },
  ];

  function handleCalculate(e) {
    e.preventDefault();
    setError('');
    setResult(calcNutritionTargets(form));
  }

  function handleSaveToProfile() {
    const targets = calcNutritionTargets(form);
    saveProfile({
      ...form,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      ...targets,
    });
    alert(t('savedProfile'));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator size={24} className="text-green-400" /> {t('calorieCalculator')}
        </h1>
        <p className="text-gray-400 mt-1">{t('calcSubtitle')}</p>
      </div>

      <div className="card">
        <form onSubmit={handleCalculate} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('age')}</label>
              <input type="number" className="input" placeholder="25" min="15" max="90"
                value={form.age} onChange={e => set('age', e.target.value)} required />
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
                value={form.height_cm} onChange={e => set('height_cm', e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('weightKg')}</label>
              <input type="number" className="input" placeholder="70" min="30" max="300" step="0.1"
                value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">{t('activityLevel')}</label>
            <div className="space-y-2">
              {activityOptions.map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.activity_level === opt.value ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="radio" name="activity" value={opt.value} checked={form.activity_level === opt.value}
                    onChange={e => set('activity_level', e.target.value)} className="accent-green-500" />
                  <div>
                    <div className="text-sm font-medium text-white">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('goal')}</label>
            <div className="grid grid-cols-3 gap-3">
              {goalOptions.map(opt => (
                <label key={opt.value} className={`flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all text-center ${form.goal === opt.value ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="radio" name="goal" value={opt.value} checked={form.goal === opt.value}
                    onChange={e => set('goal', e.target.value)} className="hidden" />
                  <span className={`text-sm font-semibold ${opt.color}`}>{opt.label}</span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {t('calculate')}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{t('yourResults')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <ResultCard icon={Flame} label={t('bmr')} value={result.bmr} unit={t('kcalPerDay')} color="text-orange-400" sub={t('bmrSub')} />
            <ResultCard icon={Flame} label={t('tdee')} value={result.tdee} unit={t('kcalPerDay')} color="text-yellow-400" sub={t('tdeeSub')} />
            <ResultCard icon={Flame} label={t('dailyTarget')} value={result.daily_calories} unit={t('kcalPerDay')} color="text-green-400" sub={`${t('goal')}: ${form.goal}`} />
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">{t('recommendedMacros')}</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Beef, label: t('protein'), value: result.protein_g, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Wheat, label: t('carbohydrates'), value: result.carbs_g, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: Droplets, label: t('fat'), value: result.fat_g, color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center mx-auto mb-2`}>
                    <m.icon size={22} className={m.color} />
                  </div>
                  <div className="text-xl font-bold text-white">{m.value}g</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                  <div className="text-xs text-gray-500">{Math.round(m.value * (m.label === t('fat') ? 9 : 4))} kcal</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">{t('mifflinNote')}</p>
          </div>
          <button onClick={handleSaveToProfile} className="btn-secondary w-full">{t('saveToProfile')}</button>
        </div>
      )}
    </div>
  );
}
