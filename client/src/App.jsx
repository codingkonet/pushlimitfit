import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { SettingsProvider } from './context/SettingsContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutPlans from './pages/WorkoutPlans';
import NutritionLog from './pages/NutritionLog';
import CalorieCalculator from './pages/CalorieCalculator';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Upgrade from './pages/Upgrade';

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<WorkoutTracker />} />
            <Route path="/plans" element={<WorkoutPlans />} />
            <Route path="/nutrition" element={<NutritionLog />} />
            <Route path="/calculator" element={<CalorieCalculator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upgrade" element={<Upgrade />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </SettingsProvider>
    </LangProvider>
  );
}
