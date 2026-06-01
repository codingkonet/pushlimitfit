import React, { useState, useEffect } from 'react';
import { getWorkouts, getWorkout, addWorkout, updateWorkout, deleteWorkout } from '../api/storage';
import exercisesData from '../data/exercises';
import { useLang } from '../context/LangContext';
import { Plus, Trash2, Dumbbell, Clock, ChevronDown, ChevronUp, Search, X, Save } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);
const CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio'];

function ExerciseRow({ ex, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2">
      <div className="col-span-4 text-sm text-white font-medium truncate">{ex.exercise_name}</div>
      <div className="col-span-2">
        <input type="number" className="input text-center text-sm py-1.5" placeholder="—"
          value={ex.sets || ''} min="0" onChange={e => onChange({ ...ex, sets: Number(e.target.value) })} />
      </div>
      <div className="col-span-2">
        <input type="number" className="input text-center text-sm py-1.5" placeholder="—"
          value={ex.reps || ''} min="0" onChange={e => onChange({ ...ex, reps: Number(e.target.value) })} />
      </div>
      <div className="col-span-3">
        <input type="number" className="input text-center text-sm py-1.5" placeholder="kg" step="0.5"
          value={ex.weight_kg || ''} min="0" onChange={e => onChange({ ...ex, weight_kg: Number(e.target.value) })} />
      </div>
      <div className="col-span-1 flex justify-end">
        <button onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors p-1"><X size={16} /></button>
      </div>
    </div>
  );
}

function ExercisePicker({ onAdd, onClose }) {
  const { t } = useLang();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = exercisesData.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q.toLowerCase());
    const matchCat = category === 'All' || e.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">{t('addExerciseTitle')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3 border-b border-gray-800">
          <div className="relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input ps-9 text-sm" placeholder={t('searchExercises')} value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${category === cat ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map(ex => (
            <button key={ex.name} onClick={() => onAdd(ex)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800/50 text-start">
              <div>
                <div className="text-sm font-medium text-white">{ex.name}</div>
                <div className="text-xs text-gray-500">{ex.category} · {ex.type}</div>
              </div>
              <Plus size={16} className="text-green-400 shrink-0" />
            </button>
          ))}
          {filtered.length === 0 && <div className="py-8 text-center text-gray-500 text-sm">{t('noExercisesFound')}</div>}
        </div>
      </div>
    </div>
  );
}

function WorkoutForm({ initial, onSave, onCancel }) {
  const { t } = useLang();
  const [name, setName] = useState(initial?.name || '');
  const [date, setDate] = useState(initial?.date || today);
  const [duration, setDuration] = useState(initial?.duration_minutes || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [exerciseList, setExerciseList] = useState(initial?.exercises || []);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  function addExercise(ex) {
    setExerciseList(prev => [...prev, { exercise_name: ex.name, category: ex.category, sets: 3, reps: 10, weight_kg: 0 }]);
  }

  async function handleSave() {
    if (!name || !date) return;
    setSaving(true);
    try {
      await onSave({ name, date, duration_minutes: Number(duration) || 0, notes, exercises: exerciseList });
    } finally { setSaving(false); }
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">{t('workoutName')}</label>
          <input className="input" placeholder={t('workoutNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('date')}</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('durationMin')}</label>
          <input type="number" className="input" placeholder="60" value={duration} min="0" onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">{t('notes')}</label>
          <input className="input" placeholder={t('notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
      <div>
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium mb-1">
          <div className="col-span-4">{t('exercise')}</div>
          <div className="col-span-2 text-center">{t('sets')}</div>
          <div className="col-span-2 text-center">{t('reps')}</div>
          <div className="col-span-3 text-center">{t('weightKg')}</div>
        </div>
        <div className="divide-y divide-gray-800">
          {exerciseList.map((ex, i) => (
            <ExerciseRow key={i} ex={ex} onChange={u => setExerciseList(p => p.map((e, idx) => idx === i ? u : e))}
              onRemove={() => setExerciseList(p => p.filter((_, idx) => idx !== i))} />
          ))}
        </div>
        <button onClick={() => setShowPicker(true)} className="mt-3 flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors">
          <Plus size={16} /> {t('addExercise')}
        </button>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving || !name}>
          <Save size={16} /> {saving ? t('saving') : t('saveWorkout')}
        </button>
        <button className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
      </div>
      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

export default function WorkoutTracker() {
  const { t } = useLang();
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadWorkouts(); }, []);

  function loadWorkouts() {
    setWorkouts(getWorkouts());
  }

  function handleSave(data) {
    if (editing) updateWorkout(editing.id, data);
    else addWorkout(data);
    setShowForm(false); setEditing(null); loadWorkouts();
  }

  function handleDelete(id) {
    if (!confirm('Delete this workout?')) return;
    deleteWorkout(id);
    setWorkouts(p => p.filter(w => w.id !== id));
  }

  function loadExpanded(id) {
    if (expanded?.id === id) return setExpanded(null);
    setExpanded(getWorkout(id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell size={24} className="text-green-400" /> {t('workoutTracker')}
          </h1>
          <p className="text-gray-400 mt-0.5">{t('workoutSubtitle')}</p>
        </div>
        {!showForm && (
          <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditing(null); }}>
            <Plus size={16} /> {t('logWorkout')}
          </button>
        )}
      </div>

      {showForm && <WorkoutForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      {workouts.length === 0 ? (
        <div className="card text-center py-12">
          <Dumbbell size={40} className="mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400 font-medium">{t('noWorkoutsLogged')}</p>
          <p className="text-gray-600 text-sm mt-1">{t('noWorkoutsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map(w => (
            <div key={w.id} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{w.name}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{w.date}</span>
                    {w.duration_minutes > 0 && <span className="flex items-center gap-1"><Clock size={11} />{w.duration_minutes} min</span>}
                    <span>{w.exercise_count} {t('exercises')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => loadExpanded(w.id)} className="text-gray-400 hover:text-white p-1 transition-colors">
                    {expanded?.id === w.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button onClick={() => { setEditing(getWorkout(w.id)); setShowForm(true); }}
                    className="text-gray-400 hover:text-green-400 p-1 text-xs transition-colors">{t('edit')}</button>
                  <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-400 p-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {expanded?.id === w.id && expanded.exercises?.length > 0 && (
                <div className="border-t border-gray-800 px-4 pb-4">
                  <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 font-medium py-2">
                    <div className="col-span-4">{t('exercise')}</div>
                    <div className="col-span-2 text-center">{t('sets')}</div>
                    <div className="col-span-2 text-center">{t('reps')}</div>
                    <div className="col-span-4 text-center">{t('weightKg')}</div>
                  </div>
                  {expanded.exercises.map((ex, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 py-1.5 text-sm border-t border-gray-800/50">
                      <div className="col-span-4 text-white truncate">{ex.exercise_name}</div>
                      <div className="col-span-2 text-center text-gray-300">{ex.sets}</div>
                      <div className="col-span-2 text-center text-gray-300">{ex.reps}</div>
                      <div className="col-span-4 text-center text-gray-300">{ex.weight_kg > 0 ? `${ex.weight_kg} kg` : t('bodyweight')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
