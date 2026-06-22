/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useHR } from '../context/HRContext';
import { Employee, ReligionType, GenderType, MaritalStatusType, HolidayCategory } from '../types';
import { exportEmployeesToCSV, parsePastedEmployees, downloadFile } from '../utils/excel';
import { getDefaultPublicHolidayCategory, calculateMonthsWorked } from '../utils/initialData';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  Edit, 
  ArrowLeftRight, 
  CalendarDays, 
  ShieldCheck, 
  ChevronRight, 
  UserPlus, 
  RefreshCw,
  X,
  CreditCard,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const EmployeeDatabase: React.FC = () => {
  const { 
    employees, 
    resignedEmployees,
    traineeEmployees,
    probationEmployees,
    publicHolidays,
    outlets, 
    departments, 
    userSession, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    batchImportEmployees,
    transferEmployee,
    getAccruedALCount,
    refreshData,
    getPHCount,
    getCombinedALDPCount,
    deleteResignedEmployee,
    deleteTraineeEmployee,
    deleteProbationEmployee
  } = useHR();

  // Validate Access: Restricted to Manager, Maria, HR, and Super Admin
  const isAuthorized = useMemo(() => {
    const role = userSession?.role;
    return role === 'Manager' || role === 'Maria' || role === 'HR' || role === 'super admin';
  }, [userSession]);

  // UI state managers
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [activeClassification, setActiveClassification] = useState<'regular' | 'trainee' | 'probation' | 'resigned'>('regular');

  // Active Selected employee for Preview dossier
  const [previewEmp, setPreviewEmp] = useState<Employee | null>(null);

  // New Employee Single Entry Form modal state
  const [showSingleEntryForm, setShowSingleEntryForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);

  // Single Form State properties
  const [singleForm, setSingleForm] = useState({
    name: '',
    position: 'Staff',
    startingDate: '2026-01-01',
    gender: 'Male' as GenderType,
    religion: 'Hindu' as ReligionType,
    publicHolidayCategory: 'Hindu' as HolidayCategory,
    maritalStatus: 'Single' as MaritalStatusType,
    nikPassport: '',
    noKK: '',
    noHandphone: '',
    noBpjsKes: '',
    noBpjsTk: '',
    birthPlace: '',
    birthDate: '1995-01-01',
    motherFullName: '',
    lastEducation: 'SMA',
    address: '',
    email: '',
    emergencyContact: '',
    relationship: '',
    references: '',
    alBalance: 12,
    dpBalance: 0,
    signDate: '2026-01-01',
    contractEndDate: '2027-01-01',
    outletId: 'O1',
    departmentId: 'D1'
  });

  // Batch Paste Modal State
  const [showBatchPasteModal, setShowBatchPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [batchImportPreview, setBatchImportPreview] = useState<Partial<Employee>[]>([]);

  // Transfer Modals
  const [transferTargetEmp, setTransferTargetEmp] = useState<Employee | null>(null);
  const [targetDeptId, setTargetDeptId] = useState('D1');
  const [targetOutletId, setTargetOutletId] = useState('O1');

  // Status message
  const [alertMsg, setAlertMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle single contract date change to automatically default the expiration end date (1 year after)
  const handleSignDateChange = (dateVal: string) => {
    const sign = new Date(dateVal);
    let endStr = singleForm.contractEndDate;
    if (!isNaN(sign.getTime())) {
      sign.setFullYear(sign.getFullYear() + 1);
      endStr = sign.toISOString().split('T')[0];
    }
    setSingleForm({
      ...singleForm,
      signDate: dateVal,
      contractEndDate: endStr
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Memanggil fungsi refresh dari context jika tersedia
    if (typeof refreshData === 'function') {
      await refreshData();
    }

    setTimeout(() => {
      setIsRefreshing(false);
      showAlert('Data tabel berhasil disinkronkan dengan database.');
    }, 800);
  };

  // Maps outlets and depts helpers
  const outletsMap = useMemo(() => {
    return outlets.reduce((acc, o) => ({ ...acc, [o.id]: o.name }), {} as Record<string, string>);
  }, [outlets]);

  const departmentsMap = useMemo(() => {
    return departments.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {} as Record<string, string>);
  }, [departments]);

  // Compute AGE dynamically based on Birth Date YYYY-MM-DD
  const computeAge = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const today = new Date('2026-06-15'); // simulation today
    if (isNaN(birth.getTime())) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  // Filter employee database rows
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (emp.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.nikPassport || '').includes(searchTerm);
      const matchOutlet = filterOutlet === 'All' || emp.outletId === filterOutlet;
      const matchDept = filterDept === 'All' || emp.departmentId === filterDept;
      return matchSearch && matchOutlet && matchDept;
    });
  }, [employees, searchTerm, filterOutlet, filterDept]);

  const filteredTrainees = useMemo(() => {
    return traineeEmployees.filter(t => {
      const matchSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchOutlet = filterOutlet === 'All' || t.outletId === filterOutlet;
      const matchDept = filterDept === 'All' || t.departmentId === filterDept;
      return matchSearch && matchOutlet && matchDept;
    });
  }, [traineeEmployees, searchTerm, filterOutlet, filterDept]);

  const filteredProbations = useMemo(() => {
    return probationEmployees.filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchOutlet = filterOutlet === 'All' || p.outletId === filterOutlet;
      const matchDept = filterDept === 'All' || p.departmentId === filterDept;
      return matchSearch && matchOutlet && matchDept;
    });
  }, [probationEmployees, searchTerm, filterOutlet, filterDept]);

  const filteredResigned = useMemo(() => {
    return resignedEmployees.filter(r => {
      const matchSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchOutlet = filterOutlet === 'All' || r.outletId === filterOutlet;
      const matchDept = filterDept === 'All' || r.departmentId === filterDept;
      return matchSearch && matchOutlet && matchDept;
    });
  }, [resignedEmployees, searchTerm, filterOutlet, filterDept]);

  // Trigger alert messages
  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Single Form submission handler
  const handleSingleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.name.trim()) return;

    if (isEditing && editEmployeeId) {
      const updated: Employee = {
        ...singleForm,
        id: editEmployeeId
      };
      updateEmployee(updated);
      showAlert(`Karyawan "${singleForm.name}" berhasil diperbaharui!`);
    } else {
      addEmployee(singleForm);
      showAlert(`Karyawan baru "${singleForm.name}" berhasil didaftarkan!`);
    }

    setShowSingleEntryForm(false);
    setIsEditing(false);
    setEditEmployeeId(null);
  };

  // Trigger editing a single employee row
  const startEditing = (emp: Employee) => {
    setIsEditing(true);
    setEditEmployeeId(emp.id);
    setSingleForm({
      name: emp.name,
      position: emp.position,
      startingDate: emp.startingDate,
      gender: emp.gender,
      religion: emp.religion,
      publicHolidayCategory: emp.publicHolidayCategory ?? getDefaultPublicHolidayCategory(emp.religion),
      maritalStatus: emp.maritalStatus,
      nikPassport: emp.nikPassport,
      noKK: emp.noKK,
      noHandphone: emp.noHandphone,
      noBpjsKes: emp.noBpjsKes,
      noBpjsTk: emp.noBpjsTk,
      birthPlace: emp.birthPlace,
      birthDate: emp.birthDate,
      motherFullName: emp.motherFullName,
      lastEducation: emp.lastEducation,
      address: emp.address,
      email: emp.email,
      emergencyContact: emp.emergencyContact,
      relationship: emp.relationship,
      references: emp.references,
      alBalance: emp.alBalance,
      dpBalance: emp.dpBalance,
      signDate: emp.signDate,
      contractEndDate: emp.contractEndDate,
      outletId: emp.outletId,
      departmentId: emp.departmentId
    });
    setShowSingleEntryForm(true);
  };

  // Trigger Batch Parse on pasted text
  const handleTextPasteParse = (text: string) => {
    setPastedText(text);
    const parsed = parsePastedEmployees(text);
    setBatchImportPreview(parsed);
  };

  // Commit batch imports
  const handleCommitBatchImport = () => {
    if (batchImportPreview.length === 0) return;
    const count = batchImportEmployees(batchImportPreview);
    showAlert(`Sukses mengimpor ${count} karyawan secara massal!`);
    setShowBatchPasteModal(false);
    setPastedText('');
    setBatchImportPreview([]);
  };

  // Execute Department Transfer
  const handleExecuteTransfer = () => {
    if (!transferTargetEmp) return;
    transferEmployee(transferTargetEmp.id, targetDeptId, targetOutletId);
    showAlert(`Karyawan "${transferTargetEmp.name}" berhasil dipindahkan ke departemen baru!`);
    setTransferTargetEmp(null);
  };

  // Download all employees to Excel-ready CSV
  const handleDownloadBatch = () => {
    const csvContent = exportEmployeesToCSV(employees, outletsMap, departmentsMap);
    downloadFile(csvContent, 'Database_Karyawan_PT_Aqua_Nusa_Lembongan.csv', 'text/csv;charset=utf-8;');
    showAlert('✓ Database sukses diunduh dalam format excel CSV!');
  };

  // Access check fallback screen
  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-lg mx-auto space-y-4 shadow-xl">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
          Akses Terbatas: Role Tidak Diizinkan
        </h3>
        <p className="text-slate-300 text-sm">
          Maaf, halaman <strong>Database Karyawan</strong> yang berisi berkas pribadi & identitas NIK hanya boleh dibuka oleh administrator berkedudukan role <strong>Manager</strong> atau <strong>HR</strong>. Kedudukan Anda saat ini adalah <strong>{userSession?.role?.toUpperCase() || 'GUEST'}</strong>.
        </p>
        <p className="text-xs text-slate-500 font-mono">
          Ubah Simulated Role Anda di NAVBAR pojok kanan atas untuk mensimulasikan akses HR.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="employee-db-container">
      
      {/* Alert Banner */}
      {alertMsg && (
        <div id="db-alert-block" className="bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 p-3.5 rounded-lg text-xs font-sans font-semibold animate-pulse shadow-md">
          {alertMsg}
        </div>
      )}      {/* Action Header Block */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-50 text-cyan-600 rounded-lg border border-slate-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-800 uppercase tracking-tight">
              Database Profil & Berkas Karyawan
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              Portal administrasi internal manager PT. Aqua Nusa Lembongan. Atur data diri kontrak, detail KK, BPJS, dan tracking AL otomatis.
            </p>
          </div>
        </div>

        {/* Buttons: single add, batch import, batch export */}
        <div className="flex flex-wrap gap-2.5 self-start md:self-auto">
          <button
            id="btn-add-single"
            onClick={() => {
              setIsEditing(false);
              setSingleForm({
                name: '', position: 'Staff', startingDate: '2026-06-15', gender: 'Male', religion: 'Hindu', maritalStatus: 'Single',
                publicHolidayCategory: 'Hindu',
                nikPassport: '', noKK: '', noHandphone: '', noBpjsKes: '', noBpjsTk: '', birthPlace: '', birthDate: '1995-01-01',
                motherFullName: '', lastEducation: 'SMA', address: '', email: '', emergencyContact: '', relationship: '', references: '',
                alBalance: 12, dpBalance: 0, signDate: '2026-06-15', contractEndDate: '2027-06-15', outletId: 'O1', departmentId: 'D1'
              });
              setShowSingleEntryForm(true);
            }}
            className="flex items-center space-x-1.5 bg-cyan-600 text-white font-sans text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/10 hover:bg-cyan-500 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>

          <button
            id="btn-import-batch"
            onClick={() => {
              setPastedText('');
              setBatchImportPreview([]);
              setShowBatchPasteModal(true);
            }}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-600" />
            <span>Batch Paste excel</span>
          </button>

          <button
            id="btn-download-batch"
            onClick={handleDownloadBatch}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV (Excel)</span>
          </button>

          <button
            id="btn-refresh-db"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 shadow-sm">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Cari nama karyawan, jabatan, atau NIK passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">OUTLET:</span>
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none outline-none focus:ring-0 pr-1 cursor-pointer"
            >
              <option value="All" className="bg-white text-slate-805">Semua Outlet</option>
              {outlets.map(o => (
                <option key={o.id} value={o.id} className="bg-white text-slate-805">{o.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">DEPT:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none outline-none focus:ring-0 pr-1 cursor-pointer"
            >
              <option value="All" className="bg-white text-slate-805">Semua Departemen</option>
              {departments.map(d => (
                <option key={d.id} value={d.id} className="bg-white text-slate-805">{d.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Classification Tabs Row */}
      <div className="flex border-b border-slate-200 text-xs font-sans font-semibold mb-[-8px] mt-2 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveClassification('regular')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeClassification === 'regular'
              ? 'border-cyan-500 text-cyan-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-705'
          }`}
        >
          <span>Tetap & Kontrak</span>
          <span className="text-[10px] bg-cyan-50 text-cyan-600 border border-cyan-150 px-1.5 py-0.2 rounded-full font-bold">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveClassification('trainee')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeClassification === 'trainee'
              ? 'border-yellow-500 text-yellow-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-705'
          }`}
        >
          <span>Trainee</span>
          <span className="text-[10px] bg-yellow-50/50 text-yellow-600 border border-yellow-200 px-1.5 py-0.2 rounded-full font-bold">
            {traineeEmployees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveClassification('probation')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeClassification === 'probation'
              ? 'border-purple-500 text-purple-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-705'
          }`}
        >
          <span>Probation</span>
          <span className="text-[10px] bg-purple-50 hover:bg-purple-100/50 text-purple-650 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold">
            {probationEmployees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveClassification('resigned')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeClassification === 'resigned'
              ? 'border-rose-500 text-rose-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-705'
          }`}
        >
          <span>Karyawan Resign</span>
          <span className="text-[10px] bg-rose-50 hover:bg-rose-100/50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded-full font-bold">
            {resignedEmployees.length}
          </span>
        </button>
      </div>

      {/* Main Database Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-4">
        
        <div className="overflow-x-auto">
          {activeClassification === 'regular' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3">NAMA LENGKAP</th>
                  <th className="p-3">POSITION / JABATAN</th>
                  <th className="p-3">DEPARTEMEN</th>
                  <th className="p-3">GENDER / AGAMA</th>
                  <th className="p-3 text-center">AL ACCRUED (BACKSTAGE)</th>
                  <th className="p-3 text-center uppercase">DP (Delay Pass)</th>
                  <th className="p-3 text-center">AL+DP TOTAL BALANCE</th>
                  <th className="p-3 text-center">TMT KONTRAK SELESAI</th>
                  <th className="p-3 text-right">AKSI ADMINISTRATOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-450 text-xs">
                      Tidak ditemukan karyawan yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    // Menghitung AL Real berdasarkan masa kerja (TMT)
                    const accruedAL = calculateMonthsWorked(emp.startingDate);
                    
                    const totalALDP = getCombinedALDPCount(emp);
                    const isSoonExpiring = new Date(emp.contractEndDate).getTime() - new Date('2026-06-15').getTime() < 30 * 24 * 60 * 60 * 1000;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 font-sans text-sm">{emp.name}</span>
                            <span className="text-[10px] text-slate-450 font-mono">ID: {emp.id}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{emp.position}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-slate-600 font-medium">{departmentsMap[emp.departmentId]}</span>
                            <span className="text-[10px] text-cyan-600 font-mono italic">{outletsMap[emp.outletId]}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-500">{emp.gender === 'Male' ? 'L' : 'P'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10.5px] font-bold text-purple-600 font-mono">
                              {emp.religion}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className="text-emerald-600 font-mono">+{accruedAL} AL</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-extrabold font-mono text-xs text-indigo-600">
                            {emp.dpBalance} DP
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-extrabold text-cyan-650 font-mono text-xs">
                            {totalALDP} AL+DP
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className={`font-mono font-medium text-xs ${isSoonExpiring ? 'text-rose-600 font-bold' : 'text-slate-605'}`}>
                              {emp.contractEndDate}
                            </span>
                            <span className="text-[9px] text-slate-450">Sign: {emp.signDate}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              id={`btn-preview-emp-${emp.id}`}
                              onClick={() => setPreviewEmp(emp)}
                              className="p-1 px-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-805 border border-slate-200 hover:border-slate-300 rounded transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              id={`btn-transfer-emp-${emp.id}`}
                              onClick={() => {
                                setTransferTargetEmp(emp);
                                setTargetDeptId(emp.departmentId);
                                setTargetOutletId(emp.outletId);
                              }}
                              className="p-1 px-1.5 bg-white hover:bg-slate-50 text-cyan-650 hover:text-cyan-700 border border-slate-200 hover:border-slate-300 rounded transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Transfer</span>
                            </button>
                            <button
                              id={`btn-edit-emp-${emp.id}`}
                              onClick={() => startEditing(emp)}
                              className="p-1 text-amber-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-emp-${emp.id}`}
                              onClick={() => {
                                if (confirm(`Hapus karyawan "${emp.name}" secara permanen?`)) {
                                  deleteEmployee(emp.id);
                                  showAlert(`Karyawan ID: ${emp.id} berhasil dihapus.`);
                                }
                              }}
                              className="p-1 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeClassification === 'trainee' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3">NAMA COMPLETE</th>
                  <th className="p-3">JABATAN</th>
                  <th className="p-3">DEPARTEMEN</th>
                  <th className="p-3">OUTLET</th>
                  <th className="p-3">MULAI TRAINING</th>
                  <th className="p-3 text-center">DURASI KONTRAK</th>
                  <th className="p-3">GENDER / AGAMA</th>
                  <th className="p-3 text-right">AKSI ADMINISTRATOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                {filteredTrainees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-450 text-xs italic">
                      Tidak ditemukan karyawan status trainee.
                    </td>
                  </tr>
                ) : (
                  filteredTrainees.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 font-sans text-sm">{t.name}</span>
                          <span className="text-[10px] text-yellow-600 font-bold font-mono">Trainee • {t.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{t.position}</td>
                      <td className="p-3 text-slate-600">{departmentsMap[t.departmentId]}</td>
                      <td className="p-3 text-cyan-600 font-mono italic">{outletsMap[t.outletId]}</td>
                      <td className="p-3 font-mono text-slate-600">{t.startingDate}</td>
                      <td className="p-3 text-center font-bold text-yellow-650 font-mono">
                        {t.durationMonths} Bulan
                      </td>
                      <td className="p-3">
                        <span className="text-slate-500 mr-2">{t.gender === 'Male' ? 'L' : 'P'}</span>
                        <span className="text-purple-650 font-bold font-mono">{t.religion}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Keluarkan Trainee "${t.name}" dari database?`)) {
                              deleteTraineeEmployee(t.id);
                              showAlert(`Trainee "${t.name}" dieliminasi dari database.`);
                            }
                          }}
                          className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeClassification === 'probation' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3">NAMA LENGKAP</th>
                  <th className="p-3">JABATAN</th>
                  <th className="p-3">DEPARTEMEN</th>
                  <th className="p-3">OUTLET</th>
                  <th className="p-3">MULAI TMT</th>
                  <th className="p-3">TARGET MULAI TETAP (SELESAI)</th>
                  <th className="p-3">GENDER / AGAMA</th>
                  <th className="p-3 text-right">AKSI ADMINISTRATOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                {filteredProbations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-450 text-xs italic">
                      Tidak ditemukan karyawan masa probation.
                    </td>
                  </tr>
                ) : (
                  filteredProbations.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 font-sans text-sm">{p.name}</span>
                          <span className="text-[10px] text-purple-600 font-bold font-mono">Probation • {p.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{p.position}</td>
                      <td className="p-3 text-slate-600">{departmentsMap[p.departmentId]}</td>
                      <td className="p-3 text-cyan-600 font-mono italic">{outletsMap[p.outletId]}</td>
                      <td className="p-3 font-mono text-slate-600">{p.startingDate}</td>
                      <td className="p-3 text-purple-600 font-mono font-bold">{p.probationEndDate}</td>
                      <td className="p-3">
                        <span className="text-slate-500 mr-2">{p.gender === 'Male' ? 'L' : 'P'}</span>
                        <span className="text-purple-650 font-bold font-mono">{p.religion}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Batalkan / hapus status probation untuk "${p.name}"?`)) {
                              deleteProbationEmployee(p.id);
                              showAlert(`Probationer "${p.name}" dihapus.`);
                            }
                          }}
                          className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeClassification === 'resigned' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3">NAMA LENGKAP</th>
                  <th className="p-3">JABATAN SEBELUMNYA</th>
                  <th className="p-3">DEPARTEMEN</th>
                  <th className="p-3">OUTLET</th>
                  <th className="p-3">TANGGAL RESIGN</th>
                  <th className="p-3">ALASAN KELUAR</th>
                  <th className="p-3">GENDER</th>
                  <th className="p-3 text-right">AKSI ADMINISTRATOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                {filteredResigned.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-450 text-xs italic">
                      Tidak ditemukan karyawan resign.
                    </td>
                  </tr>
                ) : (
                  filteredResigned.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 font-sans text-sm">{r.name}</span>
                          <span className="text-[10px] text-rose-650 font-bold font-mono">Resigned • {r.id}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{r.position}</td>
                      <td className="p-3 text-slate-600">{departmentsMap[r.departmentId]}</td>
                      <td className="p-3 text-cyan-600 font-mono italic">{outletsMap[r.outletId]}</td>
                      <td className="p-3 font-mono text-rose-600 font-bold">{r.resignationDate}</td>
                      <td className="p-3 text-slate-500 italic font-sans max-w-[200px] truncate" title={r.reason}>
                        "{r.reason}"
                      </td>
                      <td className="p-3 text-slate-500">{r.gender === 'Male' ? 'L' : 'P'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus permanen berkas resign untuk "${r.name}" dari record database?`)) {
                              deleteResignedEmployee(r.id);
                              showAlert(`Arsip resign "${r.name}" dikeluarkan.`);
                            }
                          }}
                          className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FULL PREVIEW DOSSIER MODAL DRAWER */}
      {previewEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end z-50 p-0 animate-fade-in">
          <div className="bg-slate-900 border-l border-slate-800 h-full max-w-2xl w-full flex flex-col justify-between shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-500 text-slate-950 p-2.5 rounded-xl font-bold flex items-center justify-center font-mono">
                  AQ
                </div>
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">{previewEmp.name}</h4>
                  <p className="text-xs text-cyan-450 font-mono">ID Karyawan: {previewEmp.id} • {previewEmp.position}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewEmp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dossier Body scrolling */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
              
              {/* Stats Highlights */}
              {(() => {
                const previewAccruedAL = calculateMonthsWorked(previewEmp.startingDate);
                
                return (
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl text-center">
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg">
                  <span className="block text-[9px] font-mono text-slate-450 uppercase mb-0.5">AL Accrued</span>
                  <span className="font-bold text-white text-base">+{previewAccruedAL} AL</span>
                  <p className="text-[8px] text-slate-500 mt-0.5 font-sans leading-none">dari tgl masuk</p>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg">
                  <span className="block text-[9px] font-mono text-slate-450 uppercase mb-0.5">Delay Pass (DP)</span>
                  <span className="font-bold text-white text-base">{previewEmp.dpBalance} DP</span>
                  <p className="text-[8px] text-indigo-400 mt-0.5 font-sans leading-none uppercase font-bold">Saldo Saat Ini</p>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg">
                  <span className="block text-[9px] font-mono text-slate-405 uppercase mb-0.5">Sisa AL+DP</span>
                  <span className="font-bold text-cyan-400 text-base">{getCombinedALDPCount(previewEmp)}</span>
                  <p className="text-[8px] text-slate-500 mt-0.5 font-sans leading-none">AL={previewEmp.alBalance} DP={previewEmp.dpBalance}</p>
                </div>
              </div>
                );
              })()}

              {/* Grid sections info */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Section: Kontrak Kerja */}
                <div className="space-y-3.5">
                  <h5 className="font-bold font-sans text-cyan-400 border-b border-slate-800 pb-1.5 uppercase tracking-wide">💼 Jabatan & Kontrak</h5>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">DEPARTEMEN UTAMA</p>
                    <p className="font-medium text-white">{departmentsMap[previewEmp.departmentId]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">PENEMPATAN OUTLET</p>
                    <p className="font-medium text-white">{outletsMap[previewEmp.outletId]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">TANGGAL PERTAMA MASUK (TMT)</p>
                    <p className="font-medium text-white font-mono">{previewEmp.startingDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">TANGGAL TTD KONTRAK (SIGN DATE)</p>
                    <p className="font-medium text-white font-mono">{previewEmp.signDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">TANGGAL KONTRAK SELESAI</p>
                    <p className="font-medium text-emerald-450 font-mono">{previewEmp.contractEndDate}</p>
                  </div>
                </div>

                {/* Section: Identitas Diri */}
                <div className="space-y-3.5">
                  <h5 className="font-bold font-sans text-cyan-400 border-b border-slate-800 pb-1.5 uppercase tracking-wide">📇 Identitas Diri & KK</h5>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NOMOR NIK / PASSPORT</p>
                    <p className="font-medium text-white font-mono">{previewEmp.nikPassport}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NOMOR KARTU KELUARGA (KK)</p>
                    <p className="font-medium text-white font-mono">{previewEmp.noKK}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">TEMPAT, TANGGAL LAHIR / AGE</p>
                    <p className="font-medium text-slate-200">
                      {previewEmp.birthPlace}, {previewEmp.birthDate} <span className="font-mono text-cyan-400 font-bold bg-slate-950 border border-slate-800 rounded px-1.5 py-0.2 ml-1">({computeAge(previewEmp.birthDate)} Tahun)</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">GENDER / AGAMA / STATUS NIKAH</p>
                    <p className="font-medium text-slate-100 italic">{previewEmp.gender} • {previewEmp.religion} • {previewEmp.maritalStatus}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NAMA IBU KANDUNG LENGKAP</p>
                    <p className="font-medium text-white">{previewEmp.motherFullName}</p>
                  </div>
                </div>

              </div>

              {/* Section: Kontak Sosial & Alamat */}
              <div className="space-y-3.5 pt-2 border-t border-slate-800/60">
                <h5 className="font-bold font-sans text-cyan-400 border-b border-slate-800 pb-1.5 uppercase tracking-wide">📞 Kontak & BPJS Sosial</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NO. HANDPHONE AKTIF</p>
                    <p className="font-medium text-white font-mono">{previewEmp.noHandphone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">EMAIL KORPORAT / PRIBADI</p>
                    <p className="font-medium text-white font-mono underline">{previewEmp.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NOMOR BPJS KESEHATAN</p>
                    <p className="font-medium text-white font-mono">{previewEmp.noBpjsKes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">NOMOR BPJS KETENAGAKERJAAN (TK)</p>
                    <p className="font-medium text-white font-mono">{previewEmp.noBpjsTk}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">ALAMAT DOMISILI SEKARANG</p>
                  <p className="font-medium text-white">{previewEmp.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-850/80">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-red-400 font-bold uppercase">KONTAK DARURAT (EMERGENCY)</p>
                    <p className="font-semibold text-white">{previewEmp.emergencyContact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-red-400 font-bold uppercase">HUBUNGAN / RELATION</p>
                    <p className="font-semibold text-white">{previewEmp.relationship}</p>
                  </div>
                </div>
              </div>

              {/* Section: Last Education, References */}
              <div className="space-y-2 border-t border-slate-800/60 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">PENDIDIKAN TERAKHIR:</span>
                  <span className="font-bold text-white text-right">{previewEmp.lastEducation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">REFERENSI DIREKRUT:</span>
                  <span className="font-bold text-slate-300 text-right italic">{previewEmp.references}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setPreviewEmp(null);
                  startEditing(previewEmp);
                }}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-sans font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md"
              >
                Edit Data Diri Karyawan
              </button>
              <button
                onClick={() => setPreviewEmp(null)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
              >
                Tutup Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SINGLE ENTRY ADD & EDIT FORM MODAL */}
      {showSingleEntryForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="add-employee-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                    {isEditing ? 'Perbaharui Berkas Diri Karyawan' : 'Formulir Pendaftaran Karyawan Baru'}
                  </h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    PT. Aqua Nusa Lembongan - Harap isi selengkap mungkin untuk keperluan BPJS Ketenagakerjaan.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSingleEntryForm(false)}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSingleFormSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto text-xs text-slate-300">
              
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/85">
                <h5 className="font-semibold text-cyan-455 mb-2.5 font-sans uppercase text-[10.5px]">A. Jabatan & Lokasi Kerja</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NAME LENGKAP (HURUF KAPITAL)</label>
                    <input
                      type="text"
                      required
                      value={singleForm.name}
                      onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                      placeholder="Contoh: I KETUT SUARDIKA"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">POSITION / JABATAN</label>
                    <input
                      type="text"
                      required
                      value={singleForm.position}
                      onChange={(e) => setSingleForm({ ...singleForm, position: e.target.value })}
                      placeholder="Contoh: Bartender, Receptionist, Security"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">OUTLET PENEMPATAN</label>
                    <select
                      value={singleForm.outletId}
                      onChange={(e) => setSingleForm({ ...singleForm, outletId: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                      {outlets.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">DEPARTEMEN UTAMA</label>
                    <select
                      value={singleForm.departmentId}
                      onChange={(e) => setSingleForm({ ...singleForm, departmentId: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/85">
                <h5 className="font-semibold text-cyan-455 mb-2.5 font-sans uppercase text-[10.5px]">B. Informasi Identitas Negara (KK, KTP, BPJS)</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NO NIK / NO PASSPORT</label>
                    <input
                      type="text"
                      required
                      value={singleForm.nikPassport}
                      onChange={(e) => setSingleForm({ ...singleForm, nikPassport: e.target.value })}
                      placeholder="Contoh: 5108021203920005"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NOMOR KARTU KELUARGA (KK)</label>
                    <input
                      type="text"
                      required
                      value={singleForm.noKK}
                      onChange={(e) => setSingleForm({ ...singleForm, noKK: e.target.value })}
                      placeholder="Contoh: 5108021508100021"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NO. BPJS KESEHATAN</label>
                    <input
                      type="text"
                      required
                      value={singleForm.noBpjsKes}
                      onChange={(e) => setSingleForm({ ...singleForm, noBpjsKes: e.target.value })}
                      placeholder="Masukkan 13 digit no BPJS kes"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NO. BPJS KETENAGAKERJAAN (TK)</label>
                    <input
                      type="text"
                      required
                      value={singleForm.noBpjsTk}
                      onChange={(e) => setSingleForm({ ...singleForm, noBpjsTk: e.target.value })}
                      placeholder="Masukkan 11 digit no BPJS TK"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/85">
                <h5 className="font-semibold text-cyan-455 mb-2.5 font-sans uppercase text-[10.5px]">C. Data Sosial, Tempat Lahir & Kontak</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">TANGGAL LAHIR (UNTUK PERHITUNGAN USIA)</label>
                    <input
                      type="date"
                      required
                      value={singleForm.birthDate}
                      onChange={(e) => setSingleForm({ ...singleForm, birthDate: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">TEMPAT LAHIR</label>
                    <input
                      type="text"
                      required
                      value={singleForm.birthPlace}
                      onChange={(e) => setSingleForm({ ...singleForm, birthPlace: e.target.value })}
                      placeholder="Banyuwangi / Denpasar"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">GENDER / JENIS KELAMIN</label>
                    <select
                      value={singleForm.gender}
                      onChange={(e) => setSingleForm({ ...singleForm, gender: e.target.value as GenderType })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                      <option value="Male">Male (Laki-laki)</option>
                      <option value="Female">Female (Perempuan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">AGAMA</label>
                    <select
                      value={singleForm.religion}
                      onChange={(e) => setSingleForm({ ...singleForm, religion: e.target.value as ReligionType })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-bold text-purple-400"
                    >
                      <option value="Hindu">Hindu (PH Bali Sesuai)</option>
                      <option value="Moslem">Moslem (PH Hijriah Sesuai)</option>
                      <option value="Christian/Catholic">Christian/Catholic (PH Natal Sesuai)</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other (Hanya PH Umum)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PILIHAN PUBLIC HOLIDAY</label>
                    <select
                      value={singleForm.publicHolidayCategory}
                      onChange={(e) => setSingleForm({ ...singleForm, publicHolidayCategory: e.target.value as HolidayCategory })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-bold text-cyan-400"
                    >
                      <option value="Government">Government PH</option>
                      <option value="Hindu">Hindu PH</option>
                      <option value="Moslem">Moslem PH</option>
                      <option value="Christian/Catholic">Christian/Catholic PH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">STATUS PERNIKAHAN</label>
                    <select
                      value={singleForm.maritalStatus}
                      onChange={(e) => setSingleForm({ ...singleForm, maritalStatus: e.target.value as MaritalStatusType })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                      <option value="Single">Single (Belum Kawin)</option>
                      <option value="Married">Married (Kawin)</option>
                      <option value="Divorced">Divorced (Cerai/Janda/Duda)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NOMOR HANDPHONE</label>
                    <input
                      type="text"
                      required
                      value={singleForm.noHandphone}
                      onChange={(e) => setSingleForm({ ...singleForm, noHandphone: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA IBU KANDUNG LENGKAP</label>
                    <input
                      type="text"
                      required
                      value={singleForm.motherFullName}
                      onChange={(e) => setSingleForm({ ...singleForm, motherFullName: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PENDIDIKAN TERAKHIR</label>
                    <input
                      type="text"
                      required
                      value={singleForm.lastEducation}
                      placeholder="SMK Perhotelan / Diploma 3 / S1"
                      onChange={(e) => setSingleForm({ ...singleForm, lastEducation: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">EMAIL PERUSAHAAN / PRIBADI</label>
                  <input
                    type="email"
                    required
                    value={singleForm.email}
                    onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                    placeholder="nama@aquanusa.co.id"
                    className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1 mt-3">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ALAMAT DOMISILI (LENGKAP)</label>
                  <textarea
                    required
                    rows={2}
                    value={singleForm.address}
                    onChange={(e) => setSingleForm({ ...singleForm, address: e.target.value })}
                    placeholder="Jl. Jungutbatu, RT 01 Nusa Lembongan"
                    className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/85">
                <h5 className="font-semibold text-rose-455 mb-2.5 font-sans uppercase text-[10.5px]">D. Kontak Darurat & Referensi Rekrutmen</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA KONTAK DARURAT & HP</label>
                    <input
                      type="text"
                      required
                      value={singleForm.emergencyContact}
                      onChange={(e) => setSingleForm({ ...singleForm, emergencyContact: e.target.value })}
                      placeholder="Kadek Sari - 08199988877"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">HUBUNGAN KONTAK DARURAT</label>
                    <input
                      type="text"
                      required
                      value={singleForm.relationship}
                      onChange={(e) => setSingleForm({ ...singleForm, relationship: e.target.value })}
                      placeholder="Istri / Suami / Ayah Kandung"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">REFERENSI KERJA LAIN / SPONSOR</label>
                    <input
                      type="text"
                      required
                      value={singleForm.references}
                      onChange={(e) => setSingleForm({ ...singleForm, references: e.target.value })}
                      placeholder="Direct Application / Rekomendasi Manager Fo"
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/85">
                <h5 className="font-semibold text-cyan-455 mb-2.5 font-sans uppercase text-[10.5px]">E. Durasi Masa Kontrak & Saldo Awal (AL/DP)</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PERTAMA MASUK (START DATE)</label>
                    <input
                      type="date"
                      required
                      value={singleForm.startingDate}
                      onChange={(e) => setSingleForm({ ...singleForm, startingDate: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SALDO AWAL AL (TOTAL PREV)</label>
                    <input
                      type="number"
                      required
                      value={singleForm.alBalance}
                      onChange={(e) => setSingleForm({ ...singleForm, alBalance: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">TANGGAL TANDA TANGAN KONTRAK (SIGN)</label>
                    <input
                      type="date"
                      required
                      value={singleForm.signDate}
                      onChange={(e) => handleSignDateChange(e.target.value)}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                      <span>TANGGAL KONTRAK SELESAI</span>
                      <span className="text-[8px] font-bold text-cyan-405 font-sans whitespace-nowrap bg-cyan-950 border border-cyan-850 rounded px-1 ml-1 leading-none uppercase">1 TAHUN OTOMATIS</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={singleForm.contractEndDate}
                      onChange={(e) => setSingleForm({ ...singleForm, contractEndDate: e.target.value })}
                      className="w-full bg-slate-900 text-white border border-slate-830 rounded p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Form actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSingleEntryForm(false)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleSingleFormSubmit}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-sans font-bold px-5 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-cyan-500/10"
              >
                {isEditing ? 'Simpan Perubahan Karyawan' : 'Daftarkan Karyawan Sekarang'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BATCH PASTE FROM EXCEL MODAL */}
      {showBatchPasteModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="batch-paste-excel-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Upload className="w-5 h-5 text-cyan-404" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                    Batch Import dari Excel (Pasted TSV Area)
                  </h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    Salin (Copy) sel baris database dari Microsoft Excel/Spreadsheets Anda (Ctrl+C), lalu tempel (Paste) di bawah ini langsung!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBatchPasteModal(false)}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs text-slate-300">
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                <p className="font-sans font-semibold text-cyan-400 mb-1.5">Format Baris Tajuk Kolom yang Didukung (Case-insensitive):</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[9px] text-slate-400">
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">NAME</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">POSITION</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">STARTING DATE</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">GENDER</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">RELIGION</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">MARITAL STATUS</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">BPJSKES</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">BPJSTK</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">AL</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">OUTLET</span>
                  <span className="p-1 bg-slate-900 border border-slate-850 rounded">DEPARTMENT</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase">TEMPEL DI SINI (CTRL+V)</label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => handleTextPasteParse(e.target.value)}
                  placeholder="Tempel baris dari Excel di sini..."
                  className="w-full bg-slate-950 text-white font-mono text-[11px] border border-slate-800 rounded-lg p-3 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Batch previews list parsed */}
              {batchImportPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">
                      🔍 Preview Hasil Ekstrasi Parse ({batchImportPreview.length} Karyawan):
                    </span>
                    <span className="text-[10px] text-slate-450 italic">Tanggal Kontrak akhir otomatis dihitung +1 Tahun</span>
                  </div>
                  
                  <div className="max-h-[160px] overflow-y-auto border border-slate-850 rounded-lg divide-y divide-slate-850 bg-slate-950/50">
                    {batchImportPreview.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-[11px] font-sans">
                        <div>
                          <span className="font-bold text-slate-205">{idx + 1}. {item.name}</span>
                          <span className="text-[10px] text-slate-450 ml-2">({item.position} • {item.religion})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-cyan-401">TMT: {item.startingDate}</span>
                          <span className="font-mono text-[10px] text-indigo-401 rounded bg-indigo-950 text-indigo-400 px-1 border border-indigo-900">Dept: {item.departmentId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowBatchPasteModal(false)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleCommitBatchImport}
                disabled={batchImportPreview.length === 0}
                className={`font-sans font-bold px-5 py-2 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  batchImportPreview.length > 0 
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow shadow-cyan-500/20' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Konfirmasi Masukkan massal ({batchImportPreview.length} Karyawan)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEPARTMENT / PENEMPATAN TRANSFER MODAL */}
      {transferTargetEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="transfer-dept-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border-b border-slate-800 flex items-center space-x-2.5">
              <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                  Transfer Departemen / Mutasi Karyawan
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  Proses pemanduan pemindahan roster kerja PT. Aqua Nusa Lembongan secara sinkron.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/85">
                <span className="block text-[9px] font-mono text-slate-400">PILIHAN KARYAWAN</span>
                <span className="text-sm font-bold text-white">{transferTargetEmp.name}</span>
                <span className="block text-[11px] text-slate-400 mt-1">Jabatan Sekarang: {transferTargetEmp.position}</span>
                <span className="block text-[11px] text-slate-400">Departemen Sekarang: {departmentsMap[transferTargetEmp.departmentId]}</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase">TARGET PENEMPATAN DEPARTEMEN BARU</label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded p-2.5 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase">OUTLET BARU (MUTASI LOKASI)</label>
                <select
                  value={targetOutletId}
                  onChange={(e) => setTargetOutletId(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded p-2.5 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-955/20 p-2.5 rounded-lg border border-slate-850 text-[10.5px] text-slate-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-cyan-404 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Informasi Sinkronisasi:</strong> Sistem akan otomatis memindahkan entri roster baris {transferTargetEmp.name} dari departemen lama ke departemen baru untuk periode aktif ini.
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setTransferTargetEmp(null)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-sans font-bold px-4 py-2 rounded-lg text-xs transition-all shadow shadow-cyan-500/20 cursor-pointer"
              >
                Laksanakan Mutasi / Transfer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
