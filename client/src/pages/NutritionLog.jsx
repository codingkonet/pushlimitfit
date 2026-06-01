import React, { useState, useEffect } from 'react';
import foodsData from '../data/foods';
import { getProfile, getNutritionByDate, addNutritionLog, deleteNutritionLog } from '../api/storage';
import { useLang } from '../context/LangContext';
import { Apple, Plus, Trash2, Search, X, Flame } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

function FoodSearch({ onAdd, onClose }) {
  const { t } = useLang();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100);
  const [meal, setMeal] = useState('snack');

  const MEAL_TYPES_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'];

  const filtered = q.length >= 1 ? foodsData.filter(f => f.name.toLowerCase().includes(q.toLowerCase())) : foodsData.slice(0, 20);
  function scaled(val) { return Math.round((val * amount) / 100 * 10) / 10; }

  function handleAdd() {
    if (!selected) return;
    onAdd({ food_name: selected.name, meal_type: meal, amount_g: amount,
      calories: scaled(selected.calories), protein_g: scaled(selected.protein),
      carbs_g: scaled(selected.carbs), fat_g: scaled(selected.fat) });
    setSelected(null); setQ(''); setAmount(100);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">{t('logFoodBtn')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        {selected ? (
          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
              <Apple size={18} className="text-green-400 shrink-0" />
              <span className="text-sm font-medium text-white">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="ms-auto text-gray-500 hover:text-white"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('amount')}</label>
                <input type="number" className="input" value={amount} min="1" max="2000" onChange={e => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">{t('meal')}</label>
                <select className="select" value={meal} onChange={e => setMeal(e.target.value)}>
                  {MEAL_TYPES_KEYS.map(m => <option key={m} value={m}>{t(m)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: t('calories'), value: scaled(selected.calories), color: 'text-orange-400' },
                { label: t('protein'), value: scaled(selected.protein), color: 'text-blue-400' },
                { label: t('carbs'), value: scaled(selected.carbs), color: 'text-yellow-400' },
                { label: t('fat'), value: scaled(selected.fat), color: 'text-red-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-800 rounded-xl p-2">
                  <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary w-full" onClick={handleAdd}>{t('addToLog')}</button>
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="input ps-9 text-sm" placeholder={t('searchFood')} value={q} onChange={e => setQ(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.map(food => (
                <button key={food.id} onClick={() => { setSelected(food); setQ(food.name); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800/30 text-start">
                  <div>
                    <div className="text-sm font-medium text-white">{food.name}</div>
                    <div className="text-xs text-gray-500">{t('per100g')} · {food.calories} kcal · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
                  </div>
                  <span className="badge bg-gray-800 text-gray-400 text-xs">{food.category}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MealSection({ mealKey, entries, onDelete }) {
  const { t } = useLang();
  const totals = entries.reduce((a, e) => ({ cal: a.cal + e.calories, p: a.p + e.protein_g, c: a.c + e.carbs_g, f: a.f + e.fat_g }), { cal: 0, p: 0, c: 0, f: 0 });
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-800/30">
        <span className="font-medium text-white">{t(mealKey)}</span>
        {entries.length > 0 && (
          <span className="text-sm text-orange-400 font-medium flex items-center gap-1">
            <Flame size={14} />{Math.round(totals.cal)} kcal
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-600 italic">{t('nothingLogged')}</div>
      ) : (
        <div className="divide-y divide-gray-800/50">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 group">
              <div>
                <div className="text-sm font-medium text-white">{entry.food_name}</div>
                <div className="text-xs text-gray-500">{entry.amount_g}g · P:{Math.round(entry.protein_g)}g C:{Math.round(entry.carbs_g)}g F:{Math.round(entry.fat_g)}g</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{Math.round(entry.calories)} kcal</span>
                <button onClick={() => onDelete(entry.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function NutritionLog() {
  const profile = getProfile();
  const { t } = useLang();
  const [date, setDate] = useState(today);
  const [data, setData] = useState({ logs: [], totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } });
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => { loadLogs(); }, [date]);

  function loadLogs() {
    setData(getNutritionByDate(date));
  }

  function handleAdd(entry) {
    addNutritionLog({ date, ...entry });
    setShowSearch(false); loadLogs();
  }

  function handleDelete(id) {
    deleteNutritionLog(id); loadLogs();
  }

  const calGoal = profile?.daily_calories || 2000;
  const calPct = Math.min((data.totals.calories / calGoal) * 100, 100);
  const byMeal = MEAL_KEYS.reduce((acc, meal) => { acc[meal] = data.logs.filter(e => e.meal_type === meal); return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Apple size={24} className="text-green-400" /> {t('nutritionLog')}
          </h1>
          <p className="text-gray-400 mt-0.5">{t('nutritionSubtitle')}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowSearch(true)}>
          <Plus size={16} /> {t('logFoodBtn')}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
        {date !== today && <button onClick={() => setDate(today)} className="text-sm text-green-400 hover:text-green-300">{t('backToToday')}</button>}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">{t('dailySummary')}</h2>
          <span className="text-sm text-gray-500">{Math.round(data.totals.calories)} / {calGoal} kcal</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" style={{ width: `${calPct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('protein'), val: data.totals.protein_g, goal: profile?.protein_g || 150, color: 'bg-blue-500', text: 'text-blue-400' },
            { label: t('carbs'), val: data.totals.carbs_g, goal: profile?.carbs_g || 200, color: 'bg-yellow-500', text: 'text-yellow-400' },
            { label: t('fat'), val: data.totals.fat_g, goal: profile?.fat_g || 60, color: 'bg-red-500', text: 'text-red-400' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className={m.text}>{m.label}</span>
                <span className="text-gray-500">{Math.round(m.val)}g/{m.goal}g</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.color} transition-all`} style={{ width: `${Math.min((m.val / m.goal) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {MEAL_KEYS.map(meal => (
          <MealSection key={meal} mealKey={meal} entries={byMeal[meal] || []} onDelete={handleDelete} />
        ))}
      </div>

      {showSearch && <FoodSearch onAdd={handleAdd} onClose={() => setShowSearch(false)} />}
    </div>
  );
}
