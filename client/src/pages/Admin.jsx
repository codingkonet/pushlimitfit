import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  listUsers, setUserPro, listPayments,
  listCustomFoods, addCustomFood, deleteCustomFood,
} from '../api/admin';
import {
  Shield, Users, CreditCard, Apple, Crown, Check, X,
  Trash2, Plus, RefreshCw,
} from 'lucide-react';

function fmtDate(s) { return s ? new Date(s).toLocaleDateString() : '—'; }

// ── Users tab ──────────────────────────────────────────────────────────
function UsersTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setBusy(true); setErr('');
    try { setRows(await listUsers()); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);

  async function toggle(u) {
    try { await setUserPro(u.id, !u.is_pro); await load(); }
    catch (e) { setErr(e.message); }
  }

  if (busy) return <p className="text-gray-400 flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> {t('loading')}</p>;
  if (err) return <p className="text-red-400 text-sm">{err}</p>;

  return (
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-800">
          <tr>
            <th className="text-start font-medium px-4 py-3">{t('adminEmail')}</th>
            <th className="text-start font-medium px-4 py-3">{t('adminJoined')}</th>
            <th className="text-start font-medium px-4 py-3">{t('adminPro')}</th>
            <th className="text-end font-medium px-4 py-3">{t('adminAction')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {rows.map(u => (
            <tr key={u.id}>
              <td className="px-4 py-3 text-white">
                {u.email}
                {u.is_admin && <span className="badge bg-green-500/15 text-green-400 ms-2">admin</span>}
              </td>
              <td className="px-4 py-3 text-gray-400">{fmtDate(u.created_at)}</td>
              <td className="px-4 py-3">
                {u.is_pro
                  ? <span className="badge bg-green-500/15 text-green-400 gap-1"><Crown size={10} /> Pro</span>
                  : <span className="badge bg-gray-800 text-gray-500">Free</span>}
              </td>
              <td className="px-4 py-3 text-end">
                <button onClick={() => toggle(u)}
                  className={u.is_pro ? 'btn-danger' : 'btn-secondary'}>
                  {u.is_pro
                    ? <span className="flex items-center gap-1"><X size={14} /> {t('adminRevoke')}</span>
                    : <span className="flex items-center gap-1"><Check size={14} /> {t('adminGrant')}</span>}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">{t('adminNoUsers')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Payments tab ───────────────────────────────────────────────────────
function PaymentsTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try { setRows(await listPayments()); }
      catch (e) { setErr(e.message); }
      finally { setBusy(false); }
    })();
  }, []);

  const total = rows
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);

  if (busy) return <p className="text-gray-400 flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> {t('loading')}</p>;
  if (err) return <p className="text-red-400 text-sm">{err}</p>;

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <span className="text-gray-400">{t('adminRevenue')}</span>
        <span className="text-2xl font-black text-green-400">
          {total.toFixed(2)} {rows[0]?.currency || ''}
        </span>
      </div>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-800">
            <tr>
              <th className="text-start font-medium px-4 py-3">{t('adminEmail')}</th>
              <th className="text-start font-medium px-4 py-3">{t('adminAmount')}</th>
              <th className="text-start font-medium px-4 py-3">{t('adminProvider')}</th>
              <th className="text-start font-medium px-4 py-3">{t('adminStatus')}</th>
              <th className="text-start font-medium px-4 py-3">{t('adminJoined')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {rows.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-white">{p.email || '—'}</td>
                <td className="px-4 py-3 text-gray-300">{Number(p.amount).toFixed(2)} {p.currency}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{p.provider}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-green-500/15 text-green-400">{p.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">{t('adminNoPayments')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Content tab (custom foods) ─────────────────────────────────────────
const EMPTY = { name: '', calories: '', protein: '', carbs: '', fat: '', category: 'Custom' };

function ContentTab() {
  const { t } = useLang();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try { setRows(await listCustomFoods()); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return;
    try { await addCustomFood(form); setForm(EMPTY); await load(); }
    catch (e) { setErr(e.message); }
  }
  async function remove(id) {
    try { await deleteCustomFood(id); await load(); }
    catch (e) { setErr(e.message); }
  }

  const fields = [
    { k: 'calories', label: t('calories') },
    { k: 'protein', label: t('protein') },
    { k: 'carbs', label: t('carbs') },
    { k: 'fat', label: t('fat') },
  ];

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="card space-y-4">
        <h3 className="font-semibold text-white">{t('adminAddFood')}</h3>
        <p className="text-xs text-gray-500 -mt-2">{t('adminFoodHint')}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t('adminFoodName')}</label>
            <input className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Protein Shake" />
          </div>
          <div>
            <label className="label">{t('adminCategory')}</label>
            <input className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {fields.map(f => (
            <div key={f.k}>
              <label className="label">{f.label}</label>
              <input type="number" min="0" step="0.1" className="input" value={form[f.k]}
                onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
            </div>
          ))}
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-primary flex items-center gap-2"><Plus size={16} /> {t('adminAddFood')}</button>
      </form>

      <div className="card p-0 overflow-x-auto">
        {busy ? (
          <p className="text-gray-400 p-4 flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> {t('loading')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="text-start font-medium px-4 py-3">{t('adminFoodName')}</th>
                <th className="text-start font-medium px-4 py-3">{t('calories')}</th>
                <th className="text-start font-medium px-4 py-3">P / C / F</th>
                <th className="text-end font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {rows.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-3 text-white">{f.name}
                    <span className="badge bg-gray-800 text-gray-400 ms-2">{f.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{f.calories}</td>
                  <td className="px-4 py-3 text-gray-400">{f.protein} / {f.carbs} / {f.fat}</td>
                  <td className="px-4 py-3 text-end">
                    <button onClick={() => remove(f.id)} className="text-gray-600 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">{t('adminNoFoods')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Page shell ─────────────────────────────────────────────────────────
export default function Admin() {
  const { t } = useLang();
  const [tab, setTab] = useState('users');

  const tabs = [
    { id: 'users', label: t('adminUsers'), icon: Users },
    { id: 'payments', label: t('adminPayments'), icon: CreditCard },
    { id: 'content', label: t('adminContent'), icon: Apple },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={24} className="text-green-400" /> {t('adminTitle')}
        </h1>
        <p className="text-gray-400 mt-0.5">{t('adminSubtitle')}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === id
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'content' && <ContentTab />}
    </div>
  );
}
