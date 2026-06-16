/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EmployeeDatabase } from './components/EmployeeDatabase';
import { SchedulePanel } from './components/SchedulePanel';
import { HolidaysPanel } from './components/HolidaysPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { LoginPage } from './components/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const { userSession, isAuthenticated, logout } = useHR();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Route protection
  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <ErrorBoundary fallbackTitle="Dashboard Error">
            <Dashboard setCurrentTab={setCurrentTab} />
          </ErrorBoundary>
        );
      case 'database':
        return (
          <ErrorBoundary fallbackTitle="Employee Database Error">
            <EmployeeDatabase />
          </ErrorBoundary>
        );
      case 'schedule':
        return (
          <ErrorBoundary fallbackTitle="Schedule Panel Error">
            <SchedulePanel />
          </ErrorBoundary>
        );
      case 'holidays':
        return (
          <ErrorBoundary fallbackTitle="Holidays Panel Error">
            <HolidaysPanel />
          </ErrorBoundary>
        );
      case 'sakti':
        if (userSession?.role === 'super admin') {
          return (
            <ErrorBoundary fallbackTitle="Super Admin Panel Error">
              <SuperAdminPanel />
            </ErrorBoundary>
          );
        }
        return <Dashboard setCurrentTab={setCurrentTab} />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      
      {/* Navigation Sidebar / Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Workspace viewport */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60 overflow-x-hidden">
        
        {/* Modern Top Header Bar (Desktop Only) */}
        <header className="h-16 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
          <div>
            <h2 className="text-sm font-sans font-extrabold tracking-tight text-slate-800 uppercase">
              {currentTab === 'dashboard' ? 'HR Analytics & Performance Overview' :
               currentTab === 'database' ? 'Modul Database Karyawan PT. ANL' :
               currentTab === 'schedule' ? 'Roster Penjadwalan Bulanan (Periode Aktif)' :
               currentTab === 'holidays' ? 'Konfigurasi Public Holiday regional' :
               currentTab === 'sakti' ? 'Developer Control Panel (Database Sakti)' :
               'Manajemen HR Portal'}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Siklus Roster Berjalan: <span className="font-bold text-sky-600">26 Juni 2026 - 25 Juli 2026</span>
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <button
              onClick={logout}
              className="px-2.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
            >
              Log Out
            </button>
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-500 font-mono text-[9px]">
              🌐 LOCAL HOST: NUSA LEMBONGAN
            </span>
            <span className="bg-sky-50 text-sky-700 px-2.5 py-1 border border-sky-100 rounded text-[11px] font-sans font-bold">
              Koneksi: Aman
            </span>
          </div>
        </header>

        {/* Dynamic Inner Panel Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
          {renderActiveTab()}
        </main>

        {/* High Density Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-sans font-semibold text-slate-500 text-[11px]">
              © 2026 PT. Aqua Nusa Lembongan • HR Management Portal
            </p>
            <div className="flex justify-center space-x-3 font-mono text-[9px] text-slate-400">
              <span>Nusa Lembongan, Klungkung, Bali</span>
              <span>•</span>
              <span>System Version 2.4.0 (Enhanced Precision)</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Global Sytem Error">
      <HRProvider>
        <AppContent />
      </HRProvider>
    </ErrorBoundary>
  );
}
