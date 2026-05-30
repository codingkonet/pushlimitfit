import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useLang } from '../context/LangContext';
import { BookOpen, ChevronDown, ChevronUp, Bookmark, Check, Calendar } from 'lucide-react';

const difficultyColor = { Beginner: 'text-green-400 bg-green-500/10', Intermediate: 'text-yellow-400 bg-yellow-500/10', Advanced: 'text-red-400 bg-red-500/10' };
const goalColor = { 'Fat Loss': 'text-blue-400 bg-blue-500/10', 'Muscle Building': 'text-purple-400 bg-purple-500/10', 'General Fitness': 'text-green-400 bg-green-500/10', 'Strength & Hypertrophy': 'text-orange-400 bg-orange-500/10' };

const diffKey = { Beginner: 'beginner', Intermediate: 'intermediate', Advanced: 'advanced' };
const goalKey = { 'Fat Loss': 'fatLoss', 'Muscle Building': 'muscleBuilding', 'General Fitness': 'generalFitness', 'Strength & Hypertrophy': 'strengthHypertrophy' };

export default function WorkoutPlans() {
  const { t } = useLang();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeDay, setActiveDay] = useState({});

  useEffect(() => {
    api.get('/plans').then(r => setPlans(r.data)).finally(() => setLoading(false));
  }, []);

  async function toggleSave(plan) {
    if (plan.saved) await api.delete(`/plans/${plan.id}/save`);
    else await api.post(`/plans/${plan.id}/save`);
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, saved: !p.saved } : p));
  }

  if (loading) return <div className="text-center py-12 text-gray-500">{t('loading')}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen size={24} className="text-green-400" /> {t('workoutPlans')}
        </h1>
        <p className="text-gray-400 mt-0.5">{t('plansSubtitle')}</p>
      </div>

      <div className="space-y-4">
        {plans.map(plan => (
          <div key={plan.id} className="card p-0 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="font-bold text-white text-lg">{plan.name}</h2>
                    {plan.saved && <span className="badge bg-green-500/10 text-green-400 gap-1"><Check size={10} />{t('saved')}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{plan.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge ${difficultyColor[plan.difficulty] || 'text-gray-400 bg-gray-800'}`}>
                      {t(diffKey[plan.difficulty]) || plan.difficulty}
                    </span>
                    <span className={`badge ${goalColor[plan.goal] || 'text-gray-400 bg-gray-800'}`}>
                      {t(goalKey[plan.goal]) || plan.goal}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} />{plan.daysPerWeek} {t('daysPerWeek')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => toggleSave(plan)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${plan.saved ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                    <Bookmark size={14} className={plan.saved ? 'fill-current' : ''} />
                    {plan.saved ? t('saved') : t('save')}
                  </button>
                  <button onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                    {expanded === plan.id ? t('hidePlan') : t('viewPlan')}
                    {expanded === plan.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {expanded === plan.id && (
              <div className="border-t border-gray-800">
                <div className="flex gap-1 p-3 overflow-x-auto border-b border-gray-800">
                  {plan.days.map((day, i) => (
                    <button key={i} onClick={() => setActiveDay(p => ({ ...p, [plan.id]: i }))}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${(activeDay[plan.id] ?? 0) === i ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {day.day}
                    </button>
                  ))}
                </div>
                {plan.days[activeDay[plan.id] ?? 0] && (
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 font-medium mb-2 px-1">
                      <div className="col-span-5">{t('exercise')}</div>
                      <div className="col-span-2 text-center">{t('sets')}</div>
                      <div className="col-span-2 text-center">{t('reps')}</div>
                      <div className="col-span-3 text-center">Rest</div>
                    </div>
                    {plan.days[activeDay[plan.id] ?? 0].exercises.map((ex, i) => (
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
        ))}
      </div>
    </div>
  );
}
