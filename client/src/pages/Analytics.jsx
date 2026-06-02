import React from 'react';
import { useLang } from '../context/LangContext';
import ProGate from '../components/ProGate';
import {
  getPersonalRecords, getVolumeOverTime, getWorkoutStreak,
  getWeightTrend, getWeeklyWorkouts,
} from '../api/storage';
import { BarChart2, Flame, Trophy, TrendingUp, Dumbbell } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const axis = { tick: { fill: '#9ca3af', fontSize: 11 }, axisLine: false, tickLine: false };
const tip = { contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb' } };

function ChartCard({ title, icon: Icon, children, empty, emptyText }) {
  return (
    <div className="card">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Icon size={18} className="text-green-400" /> {title}
      </h2>
      {empty ? <div className="h-44 flex items-center justify-center text-gray-500 text-sm text-center px-4">{emptyText}</div> : children}
    </div>
  );
}

function AnalyticsContent() {
  const { t } = useLang();
  const streak = getWorkoutStreak();
  const prs = getPersonalRecords();
  const volume = getVolumeOverTime();
  const weight = getWeightTrend();
  const weekly = getWeeklyWorkouts();

  return (
    <div className="space-y-6">
      {/* Top stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
            <Flame size={20} className="text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{streak} <span className="text-base font-normal text-gray-400">{t('days')}</span></div>
          <div className="text-sm text-gray-400">{t('currentStreak')}</div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
            <Trophy size={20} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{prs.length}</div>
          <div className="text-sm text-gray-400">{t('personalRecords')}</div>
        </div>
        <div className="stat-card col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
            <Dumbbell size={20} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{weekly.reduce((s, w) => s + w.count, 0)}</div>
          <div className="text-sm text-gray-400">{t('weeklyWorkouts')}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Training volume */}
        <ChartCard title={t('trainingVolume')} icon={BarChart2} empty={volume.length === 0} emptyText={t('noVolume')}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volume} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tip} formatter={(v) => [`${v} kg`, t('volume')]} />
              <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fill="url(#vol)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weight trend */}
        <ChartCard title={t('weightTrend')} icon={TrendingUp} empty={weight.length === 0} emptyText={t('noWeight')}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weight} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} {...axis} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} {...axis} />
              <Tooltip {...tip} formatter={(v) => [`${v} kg`, t('weight')]} />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly workouts */}
        <ChartCard title={t('weeklyWorkouts')} icon={Dumbbell} empty={weekly.length === 0} emptyText={t('noVolume')}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="week" {...axis} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip {...tip} />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Personal records */}
        <ChartCard title={t('personalRecords')} icon={Trophy} empty={prs.length === 0} emptyText={t('noPrs')}>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {prs.slice(0, 8).map((pr) => (
              <div key={pr.exercise_name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-800/40">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy size={14} className="text-yellow-500 shrink-0" />
                  <span className="text-sm text-white truncate">{pr.exercise_name}</span>
                </div>
                <span className="text-sm font-bold text-green-400 shrink-0">{pr.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { t } = useLang();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 size={24} className="text-green-400" /> {t('analytics')}
        </h1>
        <p className="text-gray-400 mt-0.5">{t('analyticsSubtitle')}</p>
      </div>
      <ProGate>
        <AnalyticsContent />
      </ProGate>
    </div>
  );
}
