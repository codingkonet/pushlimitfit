import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  LayoutDashboard, Dumbbell, BookOpen, Apple,
  Calculator, User, LogOut, Activity, Globe
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();

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
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-e border-gray-800 h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white">PushLIMITfit</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Language toggle + User info + Logout */}
      <div className="border-t border-gray-800 p-4 space-y-3">
        {/* Language switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
        >
          <Globe size={16} />
          {lang === 'en' ? 'عربي' : 'English'}
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={16} />
          {t('signOut')}
        </button>
      </div>
    </aside>
  );
}
