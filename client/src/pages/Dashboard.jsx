import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { getProfile, getWorkoutStats, getNutritionByDate, getNutritionHistory } from '../api/storage';
import { Dumbbell, Apple, Flame, TrendingUp, ChevronRight, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const today = new Date().toISOString().slice(0, 10);

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(value)}g / {max}g</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const [profile, setProfile] = useState(getProfile());
  const [stats, setStats] = useState(null);
  const [todayNutrition, setTodayNutrition] = useState(null);
  const [nutritionHistory, setNutritionHistory] = useState([]);

  useEffect(() => {
    setProfile(getProfile());
    setStats(getWorkoutStats());
    setTodayNutrition(getNutritionByDate(today));
    setNutritionHistory(getNutritionHistory());
  }, []);

  const h = new Date().getHours();
  const greeting = h < 12 ? t('goodMorning') : h < 17 ? t('goodAfternoon') : t('goodEvening');

  const calGoal = profile?.daily_calories || 2000;
  const calConsumed = todayNutrition?.totals?.calories || 0;
  const calRemaining = Math.max(calGoal - calConsumed, 0);
  const calPct = Math.min((calConsumed / calGoal) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {profile?.username || 'You'}!
        </h1>
        <p className="text-gray-400 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('totalWorkouts'), value: stats?.totalWorkouts ?? '—', icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('thisWeek'), value: `${stats?.thisWeek ?? '—'} ${t('sessions')}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: t('caloriesToday'), value: Math.round(calConsumed), icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: t('remaining'), value: Math.round(calRemaining), icon: Apple, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">{t('todaysCalories')}</h2>
            <Link to="/nutrition" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
              {t('logFood')} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex items-center gap-6 mb-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="10"
                  strokeDasharray={`${251.2 * calPct / 100} 251.2`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{Math.round(calPct)}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('goal')}</span><span className="text-white font-medium">{calGoal} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('consumed')}</span><span className="text-orange-400 font-medium">{Math.round(calConsumed)} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('remaining')}</span><span className="text-green-400 font-medium">{Math.round(calRemaining)} kcal</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <MacroBar label={t('protein')} value={todayNutrition?.totals?.protein_g || 0} max={profile?.protein_g || 150} color="bg-blue-500" />
            <MacroBar label={t('carbs')} value={todayNutrition?.totals?.carbs_g || 0} max={profile?.carbs_g || 200} color="bg-yellow-500" />
            <MacroBar label={t('fat')} value={todayNutrition?.totals?.fat_g || 0} max={profile?.fat_g || 60} color="bg-red-500" />
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">{t('sevenDayCalories')}</h2>
          {nutritionHistory.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-500 text-sm">{t('noNutritionData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={nutritionHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb' }}
                  formatter={(v) => [`${Math.round(v)} kcal`, t('calories')]} />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                  {nutritionHistory.map((entry, i) => (
                    <Cell key={i} fill={entry.date === today ? '#22c55e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">{t('recentWorkouts')}</h2>
          <Link to="/workouts" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
            {t('seeAll')} <ChevronRight size={14} />
          </Link>
        </div>
        {!stats?.recentWorkouts?.length ? (
          <div className="text-center py-8 text-gray-500">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
            <p>{t('noWorkoutsYet')} <Link to="/workouts" className="text-green-400 hover:underline">{t('logYourFirst')}</Link></p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentWorkouts.map(w => (
              <div key={w.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Dumbbell size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{w.name}</p>
                    <p className="text-xs text-gray-500">{w.date} · {w.duration_minutes > 0 ? `${w.duration_minutes} min` : t('durationNotSet')}</p>
                  </div>
                </div>
                <Trophy size={14} className="text-yellow-500 opacity-60" />
              </div>
            ))}
          </div>
        )}
      </div>

      {!profile?.daily_calories && (
        <div className="card border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t('completeProfile')}</h3>
              <p className="text-sm text-gray-400 mb-3">{t('completeProfileDesc')}</p>
              <Link to="/profile" className="btn-primary text-sm">{t('setUpProfile')}</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
