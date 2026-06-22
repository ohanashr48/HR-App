/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useHR } from '../context/HRContext';
import { exportScheduleToCSV, downloadFile, exportScheduleTemplateCSV } from '../utils/excel';
import { 
  CalendarDays, 
  Download, 
  Clock, 
  HelpCircle, 
  Lock, 
  CalendarCheck,
  Upload,
  FileText,
  X
} from 'lucide-react';
import { SchedulePeriod } from '../types';
import { calculateMonthsWorked } from '../utils/initialData';

export const AVAILABLE_PERIODS: SchedulePeriod[] = [
  {
    id: '2026-05-26_2026-06-25',
    name: 'Periode Roster 26 Mei - 25 Jun 2026',
    startDate: '2026-05-26',
    endDate: '2026-06-25'
  },
  {
    id: '2026-06-26_2026-07-25',
    name: 'Periode Roster 26 Jun - 25 Jul 2026',
    startDate: '2026-06-26',
    endDate: '2026-07-25'
  },
  {
    id: '2026-07-26_2026-08-25',
    name: 'Periode Roster 26 Jul - 25 Agu 2026',
    startDate: '2026-07-26',
    endDate: '2026-08-25'
  },
  {
    id: '2026-08-26_2026-09-25',
    name: 'Periode Roster 26 Agu - 25 Sep 2026',
    startDate: '2026-08-26',
    endDate: '2026-09-25'
  },
  {
    id: '2026-09-26_2026-10-25',
    name: 'Periode Roster 26 Sep - 25 Okt 2026',
    startDate: '2026-09-26',
    endDate: '2026-10-25'
  },
  {
    id: '2026-10-26_2026-11-25',
    name: 'Periode Roster 26 Okt - 25 Nov 2026',
    startDate: '2026-10-26',
    endDate: '2026-11-25'
  },
  {
    id: '2026-11-26_2026-12-25',
    name: 'Periode Roster 26 Nov - 25 Des 2026',
    startDate: '2026-11-26',
    endDate: '2026-12-25'
  }
];

export const SchedulePanel: React.FC = () => {
  const { 
    employees, 
    schedules, 
    departments, 
    outlets,
    currentPeriod, 
    batchUpdateSchedule,
    userSession, 
    updateSchedule,
    updateScheduleLeaverBalances,
    publicHolidays
  } = useHR();

  // Local state for the selected period
  const [selectedPeriod, setSelectedPeriod] = useState<SchedulePeriod>(() => {
    const found = AVAILABLE_PERIODS.find(p => p.id === currentPeriod.id);
    return found || AVAILABLE_PERIODS[1];
  });

  // Selected Outlet ID in UI
  const [selectedOutletId, setSelectedOutletId] = useState<string>(() => {
    if (userSession?.role === 'head departement' && userSession?.outletId) {
      return userSession.outletId;
    }
    return 'all';
  });

  // Selected Department ID in UI ('all' = semua departemen)
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (userSession?.role === 'head departement' && userSession?.departmentId) {
      return userSession.departmentId;
    }
    return 'all';
  });

  // Batch Upload States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [pastedRoster, setPastedRoster] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available departments based on the selected outlet (for outlet-specific department filtering)
  const availableDepartments = useMemo(() => {
    const targetOutlet = userSession?.role === 'head departement' && userSession?.outletId 
      ? userSession.outletId 
      : selectedOutletId;

    if (targetOutlet === 'all') {
      return departments;
    }

    // Find departments that have at least one employee in this selected outlet
    const deptIdsInOutlet = new Set<string>();
    employees.forEach(emp => {
      if (emp.outletId === targetOutlet) {
        deptIdsInOutlet.add(emp.departmentId);
      }
    });

    // Fallback: always include current restricted dept if role is head
    if (userSession?.role === 'head departement' && userSession?.departmentId) {
      deptIdsInOutlet.add(userSession.departmentId);
    }

    return departments.filter(d => deptIdsInOutlet.has(d.id));
  }, [departments, employees, selectedOutletId, userSession]);

  // Adjust selectedDeptId if the outlet changes and the current department is not available
  useEffect(() => {
    if (userSession?.role === 'head departement' && userSession?.departmentId) {
      setSelectedDeptId(userSession.departmentId);
      return;
    }
    // For non-head users, default 'all' is always valid
  }, [availableDepartments, selectedDeptId, userSession]);

  // Highlighted Employee in editor view for fine-tuning balances
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Form states to adjust balances manually
  const [balanceForm, setBalanceForm] = useState({
    alPrev: 0,
    alMinus: 0,
    alPlus: 1,
    dpPrev: 0,
    dpMinus: 0,
    dpPlus: 0
  });

  // Calculate Dates List based on selected period
  const datesList = useMemo(() => {
    const list: string[] = [];
    const start = new Date(selectedPeriod.startDate);
    const end = new Date(selectedPeriod.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  }, [selectedPeriod]);

  // Determine active department based on role constraints
  const activeDeptId = useMemo(() => {
    if (userSession?.role === 'head departement' && userSession?.departmentId) {
      return userSession.departmentId;
    }
    return selectedDeptId;
  }, [userSession, selectedDeptId]);

  const activeDept = useMemo(() => {
    if (activeDeptId === 'all') return null;
    return departments.find(d => d.id === activeDeptId);
  }, [departments, activeDeptId]);

  // Filter employees belonging to active department and active outlet
  const deptEmployees = useMemo(() => {
    const targetOutlet = userSession?.role === 'head departement' && userSession?.outletId 
      ? userSession.outletId 
      : selectedOutletId;

    return employees.filter(emp => {
      const matchDept = activeDeptId === 'all' || emp.departmentId === activeDeptId;
      const matchOutlet = targetOutlet === 'all' || emp.outletId === targetOutlet;
      return matchDept && matchOutlet;
    });
  }, [employees, activeDeptId, selectedOutletId, userSession]);

  // Find schedule document for active department
  const activeSchedule = useMemo(() => {
    return schedules.find(
      s => s.departmentId === activeDeptId && s.periodId === selectedPeriod.id
    ) || {
      id: `${activeDeptId}_${selectedPeriod.id}`,
      periodId: selectedPeriod.id,
      departmentId: activeDeptId,
      entries: {}
    };
  }, [schedules, activeDeptId, selectedPeriod]);

  // Handle cell shift input change - use employee's actual department when 'all' is selected
  const handleShiftChange = (employeeId: string, dateStr: string, val: string) => {
    const targetDeptId = activeDeptId === 'all'
      ? employees.find(emp => emp.id === employeeId)?.departmentId || activeDeptId
      : activeDeptId;
    updateSchedule(targetDeptId, selectedPeriod.id, employeeId, dateStr, val, selectedPeriod.startDate);
  };

  // Select employee to manually override their prev/plus/minus properties
  const startEditingBalances = (empId: string) => {
    const entry = activeSchedule.entries[empId] || {
      alPrev: 0, alMinus: 0, alPlus: 1,
      dpPrev: 0, dpMinus: 0, dpPlus: 0
    };
    setSelectedEmployeeId(empId);
    setBalanceForm({
      alPrev: entry.alPrev,
      alMinus: entry.alMinus,
      alPlus: entry.alPlus,
      dpPrev: entry.dpPrev,
      dpMinus: entry.dpMinus,
      dpPlus: entry.dpPlus
    });
  };

  const handleSaveBalances = () => {
    if (!selectedEmployeeId) return;
    updateScheduleLeaverBalances(
      activeDeptId,
      selectedPeriod.id,
      selectedEmployeeId,
      balanceForm
    );
    setSelectedEmployeeId(null);
  };

  // Export Roster to CSV file formatted
  const handleExportRoster = () => {
    if (!activeDept) return;
    const csvContent = exportScheduleToCSV(
      datesList,
      deptEmployees,
      activeSchedule.entries,
      activeDept.name,
      selectedPeriod.name
    );
    downloadFile(
      csvContent,
      `Roster_${activeDept.name.replace(/\s+/g, '_')}_${selectedPeriod.id}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // Download template format for batch schedule
  const handleDownloadTemplate = () => {
    if (!activeDept) return;
    const csvContent = exportScheduleTemplateCSV(datesList, deptEmployees);
    downloadFile(
      csvContent,
      `Format_Batch_Schedule_${activeDept.name.replace(/\s+/g, '_')}_${selectedPeriod.id}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // Handle File selection and reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPastedRoster(text);
    };
    reader.readAsText(file);
  };

  // Process Batch Roster Import from Pasted TSV (Excel)
  const handleProcessBatchRoster = async () => {
    if (!pastedRoster.trim()) return;
    setIsImporting(true);
    
    try {
      const lines = pastedRoster.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error("Data tidak valid atau kosong.");

      // Detect Delimiter (Tab for Excel paste, Semicolon/Comma for CSV files)
      let delimiter = '\t';
      if (!lines[0].includes('\t') && lines[0].includes(';')) delimiter = ';';
      if (!lines[0].includes('\t') && lines[0].includes(',')) delimiter = ',';

      const updates: { employeeId: string; dateStr: string; shiftVal: string }[] = [];

      // Header skip, process data rows
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(delimiter);
        if (columns.length < 4) continue;

        const employeeId = columns[0].trim().replace(/"/g, ''); // Clean quotes if CSV
        
        for (let j = 0; j < datesList.length; j++) {
          const dateStr = datesList[j];
          const shiftCode = columns[j + 2]?.trim().toUpperCase();
          if (shiftCode) {
            updates.push({ employeeId, dateStr, shiftVal: shiftCode });
          }
        }
      }

      if (updates.length > 0) {
        // Group updates by employee's actual department when 'all' is selected
        if (activeDeptId === 'all') {
          const groupedUpdates: Record<string, { employeeId: string; dateStr: string; shiftVal: string }[]> = {};
          for (const update of updates) {
            const emp = employees.find(e => e.id === update.employeeId);
            const deptId = emp?.departmentId || 'D1';
            if (!groupedUpdates[deptId]) groupedUpdates[deptId] = [];
            groupedUpdates[deptId].push(update);
          }
          for (const [deptId, deptUpdates] of Object.entries(groupedUpdates)) {
            batchUpdateSchedule(deptId, selectedPeriod.id, deptUpdates, selectedPeriod.startDate);
          }
        } else {
          batchUpdateSchedule(activeDeptId, selectedPeriod.id, updates, selectedPeriod.startDate);
        }
      }

      alert('Roster berhasil diimpor secara massal!');
    } catch (err: any) {
      alert(`Gagal impor: ${err.message}`);
    } finally {
      setIsImporting(false);
      setShowBatchModal(false);
      setPastedRoster('');
      setFileName('');
    }
  };


  return (
    <div className="space-y-6" id="schedule-panel-container">
      
      {/* Header Info Block */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-50 text-indigo-600 rounded-lg border border-slate-100">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-800 flex items-center gap-2">
              Jadwal & Roster Karyawan
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              Acuan Periode Aktif: <span className="font-mono text-indigo-600 font-bold">{selectedPeriod.name}</span> ({selectedPeriod.startDate.split('-').reverse().join('/')} - {selectedPeriod.endDate.split('-').reverse().join('/')})
            </p>
          </div>
        </div>

        {/* Export and action triggers */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Upload Batch Schedule */}
          <button
            id="btn-upload-batch-roster"
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload Batch Roster</span>
          </button>

          {/* Download Format Batch Schedule */}
          <button
            id="btn-download-schedule-template"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>Download Format Batch Schedule</span>
          </button>

          {/* Export Roster */}
          <button
            id="btn-export-schedule"
            onClick={handleExportRoster}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Roster (Excel CSV)</span>
          </button>
        </div>
      </div>

      {/* Constraints & Access / Selection Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm animate-fade-in" id="roster-filters-card">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* FILTER 1: PERIODE BULAN */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              1. Pilih Periode Bulan
            </span>
            <select
              value={selectedPeriod.id}
              onChange={(e) => {
                const selected = AVAILABLE_PERIODS.find(p => p.id === e.target.value);
                if (selected) {
                  setSelectedPeriod(selected);
                  setSelectedEmployeeId(null);
                }
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm transition-all"
            >
              {AVAILABLE_PERIODS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* FILTER 2: OUTLET */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              2. Filter Cabang/Outlet
            </span>
            {userSession?.role === 'head departement' && userSession?.outletId ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs text-emerald-800 font-bold shrink-0 shadow-sm h-[38px]">
                <span className="truncate flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  {outlets.find(o => o.id === userSession.outletId || o.name === userSession.outletId)?.name || userSession.outletId}
                </span>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Locked</span>
              </div>
            ) : (
              <select
                value={selectedOutletId}
                onChange={(e) => {
                  setSelectedOutletId(e.target.value);
                  setSelectedEmployeeId(null);
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm transition-all"
              >
                <option value="all">Semua Outlet (PT. Aqua Nusa)</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* FILTER 3: DEPARTEMENT */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              3. Filter Departemen
            </span>
            {userSession?.role === 'head departement' && userSession?.departmentId ? (
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-100 rounded-xl px-3 py-2 text-xs text-cyan-800 font-bold shrink-0 shadow-sm h-[38px]">
                <span className="truncate flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-cyan-600 inline shrink-0" />
                  {departments.find(d => d.id === userSession.departmentId)?.name || userSession.departmentId}
                </span>
                <span className="text-[9px] font-mono text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 font-bold">Locked</span>
              </div>
            ) : (
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedEmployeeId(null);
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm transition-all"
              >
                {availableDepartments.length === 0 ? (
                  <option value="" disabled>Tidak ada departemen aktif</option>
                ) : (
                  <>
                    <option value="all">Semua Departemen</option>
                    {availableDepartments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>

        </div>

        {/* Informative Sub-info */}
        <div className="bg-slate-50/50 px-3.5 py-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            Aktif menyaring <strong className="text-slate-700">{deptEmployees.length}</strong> dari <strong className="text-slate-700">{employees.length}</strong> karyawan terdaftar di sistem.
          </span>
          {selectedOutletId !== 'all' && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
              ✨ Menampilkan departemen yang ter-asosiasi di outlet ini saja.
            </span>
          )}
        </div>

      </div>

      {/* Grid Schedule Roster Spreadsheet */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Legend */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-cyan-600" />
            Tabel Jadwal - {activeDept?.name || 'Semua Departemen'} ({deptEmployees.length} Staff)
          </span>

          {/* Quick Legend Tags */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-slate-500">OFF: Libur</span>
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-cyan-600">AL: Cuti</span>
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-amber-600">DP: Delay Pass</span>
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-rose-600">PH: Merah</span>
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-slate-700">A-Z: Shift</span>
            <span className="px-1.5 py-0.5 rounded border border-slate-200/60 font-mono font-bold text-slate-400 italic">BJ: Belum Join</span>
          </div>
        </div>

        {deptEmployees.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-500 text-xs">
            Tidak ada karyawan terdaftar di departemen ini. Buat entri baru di tab "Database Karyawan" terlebih dahulu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[2200px]">
              
              {/* Header */}
              <thead className="bg-[#f8fafc] sticky top-0 font-mono text-[10px] text-slate-500 border-b border-slate-200 select-none z-30">
                <tr>
                  <th className="w-[180px] p-3 border-r border-slate-200 sticky left-0 z-40 bg-[#f8fafc] shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-slate-700 font-bold">KARYAWAN</th>
                  
                  {/* Calendar columns starting from June 26 to July 25 right after Karyawan */}
                  {datesList.map(dateStr => {
                    const day = dateStr.split('-')[2];
                    const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
                    const generalPH = publicHolidays.find(ph => ph.date === dateStr);
                    const isPH = !!generalPH;

                    return (
                      <th 
                        key={dateStr} 
                        className={`w-[45px] p-2 text-center border-r border-slate-200 font-bold ${
                          isPH ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          isWeekend ? 'bg-slate-50/60 text-rose-500 font-mono' : 'text-slate-600'
                        }`}
                        title={generalPH ? `${generalPH.name} [PH]` : dateStr}
                      >
                        {day}
                        {isPH && <span className="block text-[8px] text-rose-500 font-black leading-none mt-0.5">PH</span>}
                      </th>
                    );
                  })}

                  <th className="w-[100px] p-3 text-center border-r border-slate-200 bg-cyan-50/20 text-cyan-700 font-bold">AL PREV</th>
                  <th className="w-[70px] p-3 text-center border-r border-slate-200 text-rose-600 font-bold">AL-</th>
                  <th className="w-[70px] p-2 text-center border-r border-slate-200 text-emerald-600 font-bold">AL+</th>
                  <th className="w-[90px] p-3 text-center border-r border-slate-200 bg-cyan-50/40 text-cyan-700 font-bold">TOTAL AL</th>
                  <th className="w-[100px] p-3 text-center border-r border-slate-200 bg-amber-50/20 text-amber-700 font-bold">DP PREV</th>
                  <th className="w-[70px] p-2 text-center border-r border-slate-200 text-rose-600 font-bold">DP-</th>
                  <th className="w-[70px] p-2 text-center border-r border-slate-200 text-emerald-600 font-bold">DP+</th>
                  <th className="w-[90px] p-3 text-center border-r border-slate-200 bg-amber-50/40 text-amber-700 font-bold">TOTAL DP</th>
                  <th className="w-[125px] p-3 text-center border-r border-slate-200 bg-slate-50 text-slate-700 font-bold font-mono">TOTAL AL+DP</th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="divide-y divide-slate-200 bg-white font-sans text-xs text-slate-700">
                {deptEmployees.map(emp => {
                  // Calculate AL+ dynamically: 1 if TMT <= period start, 0 if mid-period
                  const defaultAlPlus = (() => {
                    const tmt = new Date(emp.startingDate);
                    const periodStart = new Date(selectedPeriod.startDate);
                    if (!isNaN(tmt.getTime()) && !isNaN(periodStart.getTime())) {
                      return tmt <= periodStart ? 1 : 0;
                    }
                    return 1;
                  })();

                  // Determine default AL/DP prev: 0 if employee hasn't worked 1 full month before period starts
                  const defaultAlPrev = emp.startingDate && selectedPeriod.startDate
                    ? (calculateMonthsWorked(emp.startingDate, selectedPeriod.startDate) < 1 ? 0 : emp.alBalance)
                    : emp.alBalance;
                  const defaultDpPrev = emp.startingDate && selectedPeriod.startDate
                    ? (calculateMonthsWorked(emp.startingDate, selectedPeriod.startDate) < 1 ? 0 : emp.dpBalance)
                    : emp.dpBalance;

                  const rawEntry = activeSchedule.entries[emp.id];
                  const entry = rawEntry ? {
                    ...rawEntry,
                    alPrev: defaultAlPrev,
                    dpPrev: defaultDpPrev,
                    alPlus: defaultAlPlus,
                  } : {
                    employeeId: emp.id,
                    dates: {},
                    alPrev: defaultAlPrev,
                    alMinus: 0,
                    alPlus: defaultAlPlus,
                    dpPrev: defaultDpPrev,
                    dpMinus: 0,
                    dpPlus: 0,
                  };

                  // compute totals
                  const totalAL = entry.alPrev + entry.alPlus - entry.alMinus;
                  const totalDP = entry.dpPrev + entry.dpPlus - entry.dpMinus;
                  const grandTotal = totalAL + totalDP;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Name Card */}
                      <td className="p-3 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.015)] font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-[12px] text-slate-800 truncate" title={emp.name}>
                            {emp.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 truncate">
                            {emp.position} • <span className="text-cyan-600 font-bold">{emp.religion}</span>
                          </span>
                        </div>
                      </td>

                      {/* Day cells calendar view placed right after name */}
                      {datesList.map(dateStr => {
                        // Check if this date is BEFORE the employee's TMT (Belum Join)
                        // Guard: if startingDate is undefined/null/empty, treat as not-before-TMT (editable)
                        const isBeforeTMT = emp.startingDate ? dateStr < emp.startingDate : false;
                        
                        // Determine display value: BJ before TMT, empty if no entry, saved value otherwise
                        const savedVal = entry.dates[dateStr] || '';
                        const displayVal = isBeforeTMT ? 'BJ' : savedVal;
                        
                        // Check if this date is a Public Holiday applicable to this specific employee based on their religion
                        const phHolidayObj = publicHolidays.find(ph => 
                          ph.date === dateStr && (ph.category === 'Government' || ph.category === emp.religion)
                        );
                        const isEmployeePH = !!phHolidayObj;

                        // Dynamic color based on shift value
                        let textColor = 'text-slate-800 font-bold';
                        const upperVal = displayVal.toUpperCase();
                        if (upperVal === 'BJ') textColor = 'text-slate-400 italic font-normal';
                        else if (upperVal === 'OFF') textColor = 'text-slate-400 font-normal';
                        else if (upperVal === 'AL') textColor = 'text-cyan-600 font-extrabold';
                        else if (upperVal === 'DP') textColor = 'text-amber-600 font-extrabold';
                        else if (upperVal === 'PH') textColor = 'text-rose-600 font-extrabold';
                        else if (upperVal === '') textColor = 'text-slate-300 italic font-normal';

                        // If it's a PH for this employee, highlight the cell border
                        const borderStyle = isEmployeePH 
                          ? 'border border-rose-200 bg-rose-50/10' 
                          : 'border-r border-slate-200';

                        return (
                          <td 
                            key={dateStr} 
                            className={`p-1 text-center font-mono select-none h-11 bg-white ${borderStyle}`}
                            title={`${emp.name} - ${dateStr}${isBeforeTMT ? ' (Belum Join)' : ''}${phHolidayObj ? ` (${phHolidayObj.category}: ${phHolidayObj.name})` : ''}`}
                          >
                            {isBeforeTMT ? (
                              <span className={`inline-block w-full text-[11px] font-bold text-center h-6 leading-6 ${textColor}`}>
                                BJ
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={displayVal}
                                onChange={(e) => handleShiftChange(emp.id, dateStr, e.target.value.toUpperCase())}
                                className={`schedule-cell-input bg-transparent text-[11px] font-bold text-center w-full border-none outline-none focus:ring-1 focus:ring-indigo-300 rounded h-6 p-0 ${textColor}`}
                                maxLength={4}
                              />
                            )}
                            {isEmployeePH && (
                              <div className="text-[7px] text-rose-600 font-extrabold -mt-1 scale-90 leading-none" title={phHolidayObj.name}>
                                PH
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* AL and DP detailed spreadsheet balances columns after dates list */}
                      <td className="p-3 text-center border-r border-slate-200 bg-cyan-50/10 text-cyan-600 font-mono font-semibold">
                        {entry.alPrev}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 text-rose-600 font-mono font-semibold">
                        -{entry.alMinus}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 text-emerald-600 font-mono font-semibold">
                        +{entry.alPlus}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 bg-cyan-50/20 text-cyan-700 font-mono font-bold">
                        {totalAL}
                      </td>

                      <td className="p-3 text-center border-r border-slate-200 bg-amber-50/10 text-amber-600 font-mono font-semibold">
                        {entry.dpPrev}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 text-rose-600 font-mono font-semibold">
                        -{entry.dpMinus}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 text-emerald-600 font-mono font-semibold">
                        +{entry.dpPlus}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 bg-amber-50/20 text-amber-700 font-mono font-bold">
                        {totalDP}
                      </td>

                      {/* Combined total */}
                      <td className="p-3 text-center border-r border-slate-200 bg-[#f8fafc] text-indigo-600 font-mono font-extrabold text-[13px]">
                        {grandTotal}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit balances triggers footer */}
        {deptEmployees.length > 0 && (
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-sans font-medium">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              💡 <strong>Tips Roster:</strong> Memilih <strong>AL</strong> atau <strong>DP</strong> pada kalender otomatis memotong AL- / DP-. Ingin edit manual saldo awal? Klik tombol edit karyawan di bawah ini.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const firstEmp = deptEmployees[0];
                  if(firstEmp) startEditingBalances(firstEmp.id);
                }}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3.5 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer"
              >
                Atur Saldo Cuti Manual (AL/DP Staff)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Manual balance override drawer modal */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center space-x-2.5">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                  Override Saldo Manual (AL & DP)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  ID Karyawan: {selectedEmployeeId}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-mono text-cyan-700 font-bold mb-2 uppercase">Override Karyawan</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => startEditingBalances(e.target.value)}
                  className="w-full bg-white text-xs text-slate-800 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  {deptEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* AL prev */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">AL PREV (Sisa Lalu)</label>
                  <input
                    type="number"
                    value={balanceForm.alPrev}
                    onChange={(e) => setBalanceForm({ ...balanceForm, alPrev: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {/* DP prev */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">DP PREV (Sisa Lalu)</label>
                  <input
                    type="number"
                    value={balanceForm.dpPrev}
                    onChange={(e) => setBalanceForm({ ...balanceForm, dpPrev: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* AL minus */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">AL- (Terpakai)</label>
                  <input
                    type="number"
                    value={balanceForm.alMinus}
                    onChange={(e) => setBalanceForm({ ...balanceForm, alMinus: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {/* DP minus */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">DP- (Terpakai)</label>
                  <input
                    type="number"
                    value={balanceForm.dpMinus}
                    onChange={(e) => setBalanceForm({ ...balanceForm, dpMinus: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* AL plus */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">AL+ (Tambahan)</label>
                  <input
                    type="number"
                    value={balanceForm.alPlus}
                    onChange={(e) => setBalanceForm({ ...balanceForm, alPlus: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {/* DP plus */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">DP+ (Tambahan)</label>
                  <input
                    type="number"
                    value={balanceForm.dpPlus}
                    onChange={(e) => setBalanceForm({ ...balanceForm, dpPlus: Number(e.target.value) })}
                    className="w-full bg-white text-center font-mono font-bold text-slate-800 rounded p-2 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Accrued Preview details */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Perhitungan Total AL:</span>
                  <span className="font-mono text-cyan-600 font-bold">
                    {balanceForm.alPrev} + {balanceForm.alPlus} - {balanceForm.alMinus} = {balanceForm.alPrev + balanceForm.alPlus - balanceForm.alMinus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Perhitungan Total DP:</span>
                  <span className="font-mono text-amber-600 font-bold">
                    {balanceForm.dpPrev} + {balanceForm.dpPlus} - {balanceForm.dpMinus} = {balanceForm.dpPrev + balanceForm.dpPlus - balanceForm.dpMinus}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-800">
                  <span>Grand Total (AL+DP):</span>
                  <span className="font-mono">
                    {(balanceForm.alPrev + balanceForm.alPlus - balanceForm.alMinus) + (balanceForm.dpPrev + balanceForm.dpPlus - balanceForm.dpMinus)}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleSaveBalances}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-bold px-4 py-2 rounded-lg text-xs shadow-md shadow-cyan-500/10 transition-all cursor-pointer"
              >
                Simpan Saldo Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH UPLOAD ROSTER MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Upload className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    Upload File Roster (Excel CSV)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Pilih file CSV yang sudah diisi menggunakan format template yang tersedia.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowBatchModal(false); setFileName(''); }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">
                  PILIH FILE CSV/TEXT
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv,.txt" 
                  className="hidden" 
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  {fileName ? (
                    <div className="flex flex-col items-center animate-fade-in">
                      <FileText className="w-12 h-12 text-indigo-500 mb-2" />
                      <span className="text-xs font-bold text-slate-700">{fileName}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Klik untuk mengganti file</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 mb-3 transition-colors" />
                      <span className="text-xs font-bold text-slate-600">Klik untuk mencari file</span>
                      <span className="text-[10px] text-slate-400 mt-1">Format: .csv (Comma/Semicolon Separated)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-[10.5px] text-indigo-700 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Catatan:</strong> Pastikan kolom tanggal pada Excel sama persis dengan periode yang dipilih saat ini. Sistem akan mencocokkan ID Karyawan dan mengisi shift secara otomatis.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleProcessBatchRoster}
                disabled={!pastedRoster.trim() || isImporting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold px-5 py-2 rounded-lg text-xs shadow-md shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isImporting ? 'Memproses...' : 'Mulai Impor Roster'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
