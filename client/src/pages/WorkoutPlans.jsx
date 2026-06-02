import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import workoutPlans from '../data/workoutPlans';
import exercisesData from '../data/exercises';
import { getSavedPlanIds, toggleSavedPlan, getCustomPlans, addCustomPlan, deleteCustomPlan } from '../api/storage';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { ProBadge } from '../components/ProGate';
import {
  BookOpen, ChevronDown, ChevronUp, Bookmark, Check, Calendar,
  Lock, Plus, X, Trash2, Crown, Save,
} from 'lucide-react';

const difficultyColor = { Beginner: 'text-green-400 bg-green-500/10', Intermediate: 'text-yellow-400 bg-yellow-500/10', Advanced: 'text-red-400 bg-red-500/10' };
const goalColor = { 'Fat Loss': 'text-blue-400 bg-blue-500/10', 'Muscle Building': 'text-purple-400 bg-purple-500/10', 'General Fitness': 'text-green-400 bg-green-500/10', 'Strength & Hypertrophy': 'text-orange-400 bg-orange-500/10' };
const diffKey = { Beginner: 'beginner', Intermediate: 'intermediate', Advanced: 'advanced' };
const goalKey = { 'Fat Loss': 'fatLoss', 'Muscle Building': 'muscleBuilding', 'General Fitness': 'generalFitness', 'Strength & Hypertrophy': 'strengthHypertrophy' };

const FREE_PLAN_LIMIT = 2;

function PlanBuilder({ onSave, onClose }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [days, setDays] = useState([{ day: '', exercises: [{ name: '', sets: 3, reps: '8-12', rest: '90s' }] }]);

  const setDay = (di, patch) => setDays(p => p.map((d, i) => i === di ? { ...d, ...patch } : d));
  const setEx = (di, ei, patch) => setDays(p => p.map((d, i) => i !== di ? d : {
    ...d, exercises: d.exercises.map((e, j) => j === ei ? { ...e, ...patch } : e),
  }));
  const addEx = (di) => setDay(di, { exercises: [...days[di].exercises, { name: '', sets: 3, reps: '8-12', rest: '90s' }] });
  const removeEx = (di, ei) => setDay(di, { exercises: days[di].exercises.filter((_, j) => j !== ei) });

  function handleSave() {
    const cleanDays = days
      .map(d => ({ day: d.day.trim() || 'Day', exercises: d.exercises.filter(e => e.name.trim()) }))
      .filter(d => d.exercises.length);
    if (!name.trim() || cleanDays.length === 0) return;
    onSave({
      name: name.trim(),
      description: t('customPlan'),
      difficulty: 'Custom', goal: 'Custom',
      daysPerWeek: cleanDays.length,
      days: cleanDays,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 my-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white flex items-center gap-2"><Crown size={16} className="text-green-400" /> {t('createPlan')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">{t('planName')}</label>
            <input className="input" placeholder={t('planNamePh')} value={name} onChange={e => setName(e.target.value)} />
          </div>

          {days.map((d, di) => (
            <div key={di} className="rounded-xl border border-gray-800 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <input className="input py-1.5 text-sm" placeholder={t('dayNamePh')} value={d.day} onChange={e => setDay(di, { day: e.target.value })} />
                {days.length > 1 && (
                  <button onClick={() => setDays(p => p.filter((_, i) => i !== di))} className="text-gray-500 hover:text-red-400 p-1 shrink-0"><Trash2 size={16} /></button>
                )}
              </div>
              {d.exercises.map((ex, ei) => (
                <div key={ei} className="grid grid-cols-12 gap-1.5 items-center">
                  <input list="ex-list" className="input py-1.5 text-sm col-span-5" placeholder={t('exercise')} value={ex.name} onChange={e => setEx(di, ei, { name: e.target.value })} />
                  <input className="input py-1.5 text-sm col-span-2 text-center" placeholder={t('sets')} value={ex.sets} onChange={e => setEx(di, ei, { sets: e.target.value })} />
                  <input className="input py-1.5 text-sm col-span-2 text-center" placeholder={t('reps')} value={ex.reps} onChange={e => setEx(di, ei, { reps: e.target.value })} />
                  <input className="input py-1.5 text-sm col-span-2 text-center" placeholder="Rest" value={ex.rest} onChange={e => setEx(di, ei, { rest: e.target.value })} />
                  <button onClick={() => removeEx(di, ei)} className="text-gray-500 hover:text-red-400 col-span-1 flex justify-center"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => addEx(di)} className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"><Plus size={14} /> {t('addExercise')}</button>
            </div>
          ))}
          <datalist id="ex-list">{exercisesData.map(e => <option key={e.name} value={e.name} />)}</datalist>

          <button onClick={() => setDays(p => [...p, { day: '', exercises: [{ name: '', sets: 3, reps: '8-12', rest: '90s' }] }])}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-1"><Plus size={14} /> {t('addDay')}</button>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-800">
          <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={!name.trim()}>
            <Save size={16} /> {t('savePlan')}
          </button>
          <button className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, locked, expanded, activeDay, onToggleSave, onExpand, onSetDay, onDelete, t }) {
  if (locked) {
    return (
      <div className="card p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 opacity-60">
          <div>
            <h2 className="font-bold text-white text-lg">{plan.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
          </div>
        </div>
        <Link to="/upgrade" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 backdrop-blur-sm gap-2 group">
          <div className="w-11 h-11 rounded-2xl bg-green-500/15 flex items-center justify-center"><Lock size={20} className="text-green-400" /></div>
          <span className="text-sm font-semibold text-green-400 group-hover:underline flex items-center gap-1"><Crown size={14} /> {t('proPlanLocked')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="font-bold text-white text-lg">{plan.name}</h2>
              {plan.custom && <ProBadge />}
              {plan.saved && <span className="badge bg-green-500/10 text-green-400 gap-1"><Check size={10} />{t('saved')}</span>}
            </div>
            <p className="text-sm text-gray-400 mb-3">{plan.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {plan.difficulty !== 'Custom' && <span className={`badge ${difficultyColor[plan.difficulty] || 'text-gray-400 bg-gray-800'}`}>{t(diffKey[plan.difficulty]) || plan.difficulty}</span>}
              {plan.goal !== 'Custom' && <span className={`badge ${goalColor[plan.goal] || 'text-gray-400 bg-gray-800'}`}>{t(goalKey[plan.goal]) || plan.goal}</span>}
              <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} />{plan.daysPerWeek} {t('daysPerWeek')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {plan.custom ? (
              <button onClick={() => onDelete(plan.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                <Trash2 size={14} /> {t('deletePlan')}
              </button>
            ) : (
              <button onClick={() => onToggleSave(plan)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${plan.saved ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <Bookmark size={14} className={plan.saved ? 'fill-current' : ''} />
                {plan.saved ? t('saved') : t('save')}
              </button>
            )}
            <button onClick={onExpand} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              {expanded ? t('hidePlan') : t('viewPlan')}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-800">
          <div className="flex gap-1 p-3 overflow-x-auto border-b border-gray-800">
            {plan.days.map((day, i) => (
              <button key={i} onClick={() => onSetDay(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${(activeDay ?? 0) === i ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {day.day}
              </button>
            ))}
          </div>
          {plan.days[activeDay ?? 0] && (
            <div className="p-4">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 font-medium mb-2 px-1">
                <div className="col-span-5">{t('exercise')}</div>
                <div className="col-span-2 text-center">{t('sets')}</div>
                <div className="col-span-2 text-center">{t('reps')}</div>
                <div className="col-span-3 text-center">Rest</div>
              </div>
              {plan.days[activeDay ?? 0].exercises.map((ex, i) => (
                <div key={i} className={`grid grid-cols-12 gap-2 py-2.5 px-1 text-sm ${i > 0 ? 'border-t border-gray-800/50' : ''}`}>
                  <div className="col-span-5 text-white font-medium">{ex.name}</div>
                  <div className="col-span-2 text-center text-gray-300">{ex.sets}</div>
                  <div className="col-span-2 text-center text-gray-300">{ex.reps}</div>
                  <div className="col-span-3 text-center text-gray-500 text-xs">{ex.rest}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlans() {
  const { t } = useLang();
  const { premium } = useSettings();
  const [plans, setPlans] = useState([]);
  const [custom, setCustom] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [activeDay, setActiveDay] = useState({});
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => { reload(); }, []);

  function reload() {
    const saved = getSavedPlanIds();
    setPlans(workoutPlans.map(p => ({ ...p, saved: saved.includes(p.id) })));
    setCustom(getCustomPlans());
  }

  function toggleSave(plan) {
    const isSaved = toggleSavedPlan(plan.id);
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, saved: isSaved } : p));
  }

  function handleCreate(plan) {
    addCustomPlan(plan);
    setShowBuilder(false);
    reload();
  }

  function handleDelete(id) {
    if (!confirm('Delete this plan?')) return;
    deleteCustomPlan(id);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen size={24} className="text-green-400" /> {t('workoutPlans')}
          </h1>
          <p className="text-gray-400 mt-0.5">{t('plansSubtitle')}</p>
        </div>
        {premium ? (
          <button className="btn-primary flex items-center gap-2 shrink-0" onClick={() => setShowBuilder(true)}>
            <Plus size={16} /> {t('createPlan')}
          </button>
        ) : (
          <Link to="/upgrade" className="btn-secondary flex items-center gap-2 shrink-0">
            <Crown size={16} className="text-green-400" /> {t('createPlan')}
          </Link>
        )}
      </div>

      {/* Custom plans */}
      {custom.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2">{t('myPlans')} <ProBadge /></h2>
          {custom.map(plan => (
            <PlanCard key={plan.id} plan={plan} locked={false}
              expanded={expanded === plan.id} activeDay={activeDay[plan.id]}
              onToggleSave={toggleSave} onExpand={() => setExpanded(expanded === plan.id ? null : plan.id)}
              onSetDay={(i) => setActiveDay(p => ({ ...p, [plan.id]: i }))} onDelete={handleDelete} t={t} />
          ))}
        </div>
      )}

      {/* Built-in plans (free tier gets first FREE_PLAN_LIMIT) */}
      <div className="space-y-4">
        {plans.map((plan, idx) => (
          <PlanCard key={plan.id} plan={plan} locked={!premium && idx >= FREE_PLAN_LIMIT}
            expanded={expanded === plan.id} activeDay={activeDay[plan.id]}
            onToggleSave={toggleSave} onExpand={() => setExpanded(expanded === plan.id ? null : plan.id)}
            onSetDay={(i) => setActiveDay(p => ({ ...p, [plan.id]: i }))} onDelete={handleDelete} t={t} />
        ))}
      </div>

      {showBuilder && <PlanBuilder onSave={handleCreate} onClose={() => setShowBuilder(false)} />}
    </div>
  );
}
