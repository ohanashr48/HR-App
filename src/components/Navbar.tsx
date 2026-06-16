/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHR } from '../context/HRContext';
import { Shield, Users, CalendarDays, ClipboardList, KeyRound, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { userSession, departments } = useHR();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isSuperAdmin = userSession?.role === 'super admin';
  const isManagerOrHR = userSession?.role === 'Manager' || userSession?.role === 'HR' || userSession?.role === 'Maria' || isSuperAdmin;

  return (
    <>
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION (lg:flex hidden) */}
      {/* ========================================== */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen fixed top-0 left-0 hidden lg:flex flex-col z-40 select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-1.5">
            <div className="bg-sky-500 text-slate-950 px-2..5 py-1.5 rounded-md font-extrabold text-sm tracking-tighter shadow-md shadow-sky-500/20">
              AQ
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-sm text-white tracking-tight leading-none uppercase">
                PT. Aqua Nusa
              </h1>
              <span className="font-sans font-bold text-xs text-sky-400 tracking-tight leading-tight">
                Lembongan
              </span>
            </div>
          </div>
          <p className="font-mono text-[9px] text-slate-500 font-semibold tracking-widest uppercase">
            HR Management Portal
          </p>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 space-y-5 overflow-y-auto px-1.5 scrollbar-thin">
          
          <div>
            <div className="px-4 mb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Laporan & Analitik
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`w-full flex items-center px-4 py-2 text-xs font-medium rounded transition-all leading-none ${
                  currentTab === 'dashboard'
                    ? 'bg-sky-600 text-white border-l-4 border-sky-400 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <ClipboardList className={`w-4 h-4 mr-3 ${currentTab === 'dashboard' ? 'text-sky-300' : 'text-slate-500'}`} />
                Dashboard Utama
              </button>

              <button
                onClick={() => setCurrentTab('schedule')}
                className={`w-full flex items-center px-4 py-2 text-xs font-medium rounded transition-all leading-none ${
                  currentTab === 'schedule'
                    ? 'bg-sky-600 text-white border-l-4 border-sky-400 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <CalendarDays className={`w-4 h-4 mr-3 ${currentTab === 'schedule' ? 'text-sky-300' : 'text-slate-500'}`} />
                Roster & Schedule
              </button>
            </div>
          </div>

          <div>
            <div className="px-4 mb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Manajemen Karyawan
            </div>
            <div className="space-y-1">
              {isManagerOrHR && (
                <button
                  onClick={() => setCurrentTab('database')}
                  className={`w-full flex items-center px-4 py-2 text-xs font-medium rounded transition-all leading-none ${
                    currentTab === 'database'
                      ? 'bg-sky-600 text-white border-l-4 border-sky-400 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Users className={`w-4 h-4 mr-3 ${currentTab === 'database' ? 'text-sky-300' : 'text-slate-500'}`} />
                  Database Karyawan
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="px-4 mb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Hari Libur & Kalender
            </div>
            <button
              onClick={() => setCurrentTab('holidays')}
              className={`w-full flex items-center px-4 py-2 text-xs font-medium rounded transition-all leading-none ${
                currentTab === 'holidays'
                  ? 'bg-sky-600 text-white border-l-4 border-sky-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Shield className={`w-4 h-4 mr-3 ${currentTab === 'holidays' ? 'text-sky-300' : 'text-slate-500'}`} />
              Public Holiday
            </button>
          </div>

          {isSuperAdmin && (
            <div>
              <div className="px-4 mb-2 text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                Developer Controls
              </div>
              <button
                onClick={() => setCurrentTab('sakti')}
                className={`w-full flex items-center px-4 py-2 text-xs font-bold rounded transition-all leading-none ${
                  currentTab === 'sakti'
                    ? 'bg-amber-600 text-white border-l-4 border-amber-400 font-extrabold'
                    : 'text-amber-400/80 hover:bg-amber-950/20'
                }`}
              >
                <KeyRound className="w-4 h-4 mr-3 text-amber-500" />
                Halaman Sakti
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/45 space-y-3 shrink-0">
        </div>
      </aside>

      {/* ========================================== */}
      {/* MOBILE HEADER & BOTTOM NAV (lg:hidden) */}
      {/* ========================================== */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-sky-500 text-slate-950 p-1.5 rounded font-black text-xs">AQ</div>
            <div>
              <h1 className="font-bold text-xs text-white leading-none">PT. Aqua Nusa Lembongan</h1>
              <p className="text-[9px] font-mono text-sky-400 leading-none mt-0.5 uppercase tracking-wider">HR Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-slate-450 hover:text-white hover:bg-slate-800 bg-slate-950/40 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Tab Menu on Mobile */}
        <div className="flex justify-around items-center border-t border-slate-800 py-1.5 bg-slate-950 text-[10px] text-slate-400 font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'dashboard' ? 'text-sky-400 font-bold' : ''}`}
          >
            <ClipboardList className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          {isManagerOrHR && (
            <button
              onClick={() => setCurrentTab('database')}
              className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'database' ? 'text-sky-400 font-bold' : ''}`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              Employee
            </button>
          )}
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'schedule' ? 'text-sky-400 font-bold' : ''}`}
          >
            <CalendarDays className="w-4 h-4 mb-0.5" />
            Roster
          </button>
          <button
            onClick={() => setCurrentTab('holidays')}
            className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'holidays' ? 'text-sky-400 font-bold' : ''}`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            Holiday
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setCurrentTab('sakti')}
              className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'sakti' ? 'text-amber-400 font-bold' : ''}`}
            >
              <KeyRound className="w-4 h-4 mb-0.5" />
              Sakti
            </button>
          )}
        </div>
      </header>
    </>
  );
};
