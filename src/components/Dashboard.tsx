/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHR } from '../context/HRContext';
import { Users, Landmark, Calendar, Sparkles, Building2, HelpCircle, UserMinus } from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { 
    employees, 
    traineeEmployees, 
    probationEmployees, 
    resignedEmployees, 
    publicHolidays, 
    outlets, 
    departments, 
    userSession 
  } = useHR();

  // Current simulation target month: June 2026
  const CURRENT_YEAR = 2026;
  const CURRENT_MONTH = 6; // June
  const MONTH_NAME = 'Juni 2026';

  // Calculate stats
  const totalEmployees = employees.length;
  const totalTrainees = traineeEmployees ? traineeEmployees.length : 0;
  const totalProbation = probationEmployees ? probationEmployees.length : 0;
  const totalResigned = resignedEmployees ? resignedEmployees.length : 0;

  // Filter resigned employees for June 2026 (Simulated month)
  const resignedThisMonth = resignedEmployees.filter(emp => {
    if (!emp.resignationDate) return false;
    const parts = emp.resignationDate.split('-');
    return parts[0] === '2026' && parts[1] === '06';
  });

  // Employees per outlet
  const employeesPerOutlet = outlets.map(outlet => {
    const count = employees.filter(e => e.outletId === outlet.id).length;
    return {
      ...outlet,
      count
    };
  });

  // Filter public holidays taking place in June 2026
  const juneHolidays = publicHolidays.filter(holiday => {
    const dateObj = new Date(holiday.date);
    return dateObj.getFullYear() === CURRENT_YEAR && (dateObj.getMonth() + 1) === CURRENT_MONTH;
  });

  // Calculate religion-specific employee count
  const religionCounts = employees.reduce((acc, emp) => {
    acc[emp.religion] = (acc[emp.religion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6" id="dashboard-container">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-80 h-40 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-cyan-500/30">
              Company Overview & Analytics
            </span>
            <h2 className="text-3xl font-sans font-extrabold text-white mt-3 tracking-tight">
              Selamat Datang di PT. Aqua Nusa Lembongan
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl font-sans">
              Selamat bekerja kembali! Portal ini dirancang khusus untuk mempermudah HR dan Head Department mengelola roster, database karyawan secara realtime, serta merencanakan cuti tahunan (AL) bersama kalender Public Holiday regional.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 backdrop-blur-sm self-start md:self-auto">
            <div className="text-center px-4">
              <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Tanggal Simulasi</span>
              <span className="text-sm font-semibold text-white">15 Juni 2026</span>
            </div>
            <div className="w-px h-full bg-slate-800 hidden sm:block"></div>
            <div className="text-center px-4">
              <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Simulated Role</span>
              <span className="text-sm font-semibold text-cyan-400">{userSession?.role?.toUpperCase() || 'GUEST'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Employee Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all col-span-1 md:col-span-1">
          <div className="absolute left-0 top-0 w-2 h-full bg-cyan-500"></div>
          <div className="flex-1 pr-2">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              TOTAL STAFF AKTIF
            </p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1 animate-fade-in" id="total-employees-count">
              {totalEmployees + totalTrainees + totalProbation} <span className="text-xs font-medium text-slate-400">Staff Aktif</span>
            </h3>
            <div className="mt-3 space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span>• Karyawan Kontrak:</span>
                <span className="text-slate-100 font-bold">{totalEmployees}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span>• Probation:</span>
                <span className="text-purple-400 font-bold">{totalProbation}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span>• Trainee:</span>
                <span className="text-yellow-500 font-bold">{totalTrainees}</span>
              </div>
              <div className="flex justify-between py-1 pt-1.5 font-bold text-cyan-400">
                <span>• Total:</span>
                <span className="text-cyan-400 font-bold">{totalEmployees + totalTrainees + totalProbation}</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg text-cyan-400 border border-slate-850 self-start">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Public Holidays count this month */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute left-0 top-0 w-2 h-full bg-indigo-500"></div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              PUBLIC HOLIDAY BULAN INI
            </p>
            <h3 className="text-4xl font-extrabold text-white tracking-tight mt-1" id="june-ph-count">
              {juneHolidays.length} <span className="text-sm font-medium text-slate-400">PH</span>
            </h3>
            <p className="text-xs text-indigo-400 font-medium mt-1.5">
              Acuan Periode: {MONTH_NAME}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg text-indigo-400 border border-slate-850">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Resigned Employees Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all col-span-1">
          <div className="absolute left-0 top-0 w-2 h-full bg-rose-500"></div>
          <div className="flex-1 pr-2">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              KARYAWAN RESIGN BULAN INI
            </p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1 animate-fade-in" id="resigned-employees-count">
              {resignedThisMonth.length} <span className="text-xs font-medium text-slate-400 font-sans">Orang</span>
            </h3>
            
            <div className="mt-2 space-y-1 text-[10.5px] font-mono text-slate-400 border-t border-slate-800/40 pt-1.5">
              <div className="flex justify-between pb-1">
                <span>• Periode:</span>
                <span className="text-slate-300 font-semibold font-sans text-[10px]">{MONTH_NAME}</span>
              </div>
              
              {resignedThisMonth.length === 0 ? (
                <div className="text-[10px] font-sans text-slate-500 italic mt-1 leading-snug">
                  Tidak ada karyawan resign di periode Juni 2026.
                </div>
              ) : (
                <div className="space-y-1 font-sans text-[10px] max-h-[80px] overflow-y-auto mt-2">
                  {resignedThisMonth.map(remp => (
                    <div key={remp.id} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded border border-slate-850">
                      <span className="font-semibold text-slate-200 truncate">{remp.name}</span>
                      <span className="text-rose-400 font-mono text-[9px] shrink-0 font-bold">{remp.resignationDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg text-rose-450 border border-slate-850 self-start">
            <UserMinus className="w-5 h-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* June Holidays Details & Outlet Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Outlet Employee Distribution */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base font-sans font-bold text-white uppercase tracking-tight">
                  Jumlah Karyawan per Outlet
                </h4>
              </div>
              <span className="font-mono text-xs text-slate-400">
                PT. Aqua Nusa Lembongan
              </span>
            </div>

            <div className="space-y-3" id="outlet-distribution-list">
              {employeesPerOutlet.map(out => {
                const percentage = totalEmployees > 0 ? (out.count / totalEmployees) * 100 : 0;
                return (
                  <div key={out.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans font-semibold text-slate-200 text-sm">
                        {out.name}
                      </span>
                      <span className="font-sans font-bold text-cyan-400 text-sm">
                        {out.count} <span className="text-slate-500 font-normal text-xs">karyawan</span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] font-mono text-slate-500">ID: {out.id}</span>
                      <span className="text-[11px] font-sans text-slate-400">{percentage.toFixed(0)}% dari total staff</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 mt-4">
            <h5 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Alur Cuti Tahunan (AL):
            </h5>
            <ol className="text-xs text-slate-400 list-decimal pl-4 mt-1 space-y-1">
              <li>Setiap karyawan mendapatkan tambahan 1 AL per bulan setelah bekerjanya melampaui 1 bulan.</li>
              <li>Sesuai agama karyawan, hari libur (PH) yang terjadi akan diimplementasikan ke kalender libur pribadi mereka.</li>
            </ol>
          </div>
        </div>

        {/* Right: Public Holiday happening in June 2026 */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h4 className="text-base font-sans font-bold text-white uppercase tracking-tight">
                Public Holiday Bulan Ini ({MONTH_NAME})
              </h4>
            </div>
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 rounded px-2 py-0.5 text-[10px] font-mono">
              2026-06
            </span>
          </div>

          {juneHolidays.length === 0 ? (
            <div className="bg-slate-950/50 p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              Tidak ada hari libur nasional (PH) yang terdaftar di database untuk bulan Juni 2026.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1" id="june-holidays-list">
              {juneHolidays.map(ph => {
                const isExtra = ph.isExtra;
                return (
                  <div 
                    key={ph.id} 
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isExtra 
                        ? 'bg-gradient-to-r from-amber-950/20 to-slate-950 border-amber-500/30' 
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-sans font-bold text-slate-100 text-sm">
                          {ph.name}
                        </span>
                        {isExtra && (
                          <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">
                            Extra PH
                          </span>
                        )}
                        {!isExtra && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium ${
                            ph.category === 'Government' ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' :
                            ph.category === 'Hindu' ? 'bg-orange-950/60 text-orange-400 border-orange-800/40' :
                            ph.category === 'Moslem' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' :
                            'bg-violet-950/60 text-violet-400 border-violet-800/40'
                          }`}>
                            {ph.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <p className="font-mono text-cyan-400 text-[11px]">
                          📅 {ph.date}
                        </p>
                        <span>•</span>
                        <p className="text-[11px]">
                          Target Agama: {
                            ph.category === 'Government' 
                              ? 'Semua Karyawan (Umum)' 
                              : `Karyawan Agama ${ph.category}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Core Religion Distribution Overview */}
          <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl mt-5">
            <h5 className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Distribusi Karyawan per Agama
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {['Hindu', 'Moslem', 'Christian/Catholic', 'Buddhist', 'Other'].map(rel => {
                const count = religionCounts[rel] || 0;
                if(count === 0 && rel === 'Buddhist') return null; // hide 0
                return (
                  <div key={rel} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-slate-400 font-mono text-center truncate">{rel}</span>
                    <span className="text-lg font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
