import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  LayoutDashboard, Dumbbell, BookOpen, Apple,
  Calculator, User, LogOut, Activity, Menu, X, Globe
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/workouts', icon: Dumbbell, label: t('workouts') },
    { to: '/plans', icon: BookOpen, label: t('plans') },
    { to: '/nutrition', icon: Apple, label: t('nutrition') },
    { to: '/calculator', icon: Calculator, label: t('calculator') },
    { to: '/profile', icon: User, label: t('profile') },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
    setOpen(false);
  }

  return (
    <nav className="md:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">PushLIMITfit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="text-gray-400 hover:text-white p-1 text-sm font-medium flex items-center gap-1"
          >
            <Globe size={16} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white p-1">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-800 px-3 py-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-green-500/10 text-green-400' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <Globe size={18} />
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            {t('signOut')}
          </button>
        </div>
      )}
    </nav>
  );
}
