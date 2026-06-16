/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Users, 
  Terminal, 
  Search, 
  Check, 
  UserCheck, 
  Clock, 
  Mail, 
  ShieldAlert,
  Power,
  UserPlus,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';

interface Operator {
  id: string;
  user_id: string;
  name: string;
  role: string;
  departmentScope: string;
  outletScope?: string;
  status: 'Active' | 'Non-active';
  lastActive: string;
  password?: string;
}

export const SuperAdminPanel: React.FC = () => {
  const { 
    outlets, 
    departments,
    addOutlet,
    editOutletContext,
    deleteOutletContext,
    addDepartment,
    editDepartment,
    deleteDepartment
  } = useHR();

  console.log("DEBUG(SuperAdminPanel): deleteOutletContext function:", deleteOutletContext);
  console.log("DEBUG(SuperAdminPanel): editOutletContext function:", editOutletContext);

  // Sub Tab for SuperAdmin
  const [activeSubTab, setActiveSubTab] = useState<'operators' | 'outlets_depts'>('operators');
  const [newOutletName, setNewOutletName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  // Active list search/filters
  const [searchTerm, setSearchTerm] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Diagnostics logs
  const [logs, setLogs] = useState<string[]>([`[${new Date().toLocaleTimeString()}] Panel Sakti diinisialisasi dengan Firebase.`]);

  const addLog = (msg: string) => {
    const now = new Date();
    setLogs(prev => [`[${now.toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  };

  // Sync / Load Web Operators from Firestore
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const snap = await getDocs(collection(db, 'web_operators'));
        
        // Cleanup email field
        const cleanupPromises = snap.docs.map(async (docSnap) => {
          if (docSnap.data().email) {
            await updateDoc(docSnap.ref, { email: deleteField() });
            return true;
          }
          return false;
        });

        const hadCleanup = (await Promise.all(cleanupPromises)).some(val => val);
        if (hadCleanup) {
          addLog("CLEANUP: Field 'email' telah dihapus dari semua dokumen operator.");
        }

        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Operator));
          setOperators(list);
          addLog(`SUKSES: Berhasil mensinkronisasi ${list.length} operator dari Firestore.`);
        } else {
          // Seed default operational web accounts
          const defaultOperators: Operator[] = [
            {
              id: 'OP-001',
              user_id: 'OP-001',
              name: 'Super Admin Developer',
              role: 'super admin',
              departmentScope: 'Semua Departemen',
              status: 'Active',
              lastActive: 'Hari ini (Live Now)'
            },
            {
              id: 'OP-002',
              user_id: 'OP-002',
              name: 'Manager Operations',
              role: 'Manager',
              departmentScope: 'Semua Departemen',
              status: 'Active',
              lastActive: '15 Jun 2026, 10:14'
            },
            {
              id: 'OP-003',
              user_id: 'OP-003',
              name: 'Maria (General Manager)',
              role: 'Maria',
              departmentScope: 'Semua Departemen',
              status: 'Active',
              lastActive: '15 Jun 2026, 09:42'
            },
            {
              id: 'OP-004',
              user_id: 'OP-004',
              name: 'HR Admin Penuh',
              role: 'HR',
              departmentScope: 'Semua Departemen',
              status: 'Active',
              lastActive: '15 Jun 2026, 10:05'
            },
            {
              id: 'OP-005',
              user_id: 'OP-005',
              name: 'Ketut Swastika',
              role: 'head departement',
              departmentScope: 'F&B Service',
              status: 'Active',
              lastActive: '14 Jun 2026, 16:30'
            },
            {
              id: 'OP-006',
              user_id: 'OP-006',
              name: 'Wayan Sudarta',
              role: 'head departement',
              departmentScope: 'Kitchen',
              status: 'Active',
              lastActive: '12 Jun 2026, 11:22'
            },
            {
              id: 'OP-007',
              user_id: 'OP-007',
              name: 'Made Ariyasa',
              role: 'head departement',
              departmentScope: 'Housekeeping',
              status: 'Active',
              lastActive: '15 Jun 2026, 07:15'
            },
            {
              id: 'OP-008',
              user_id: 'OP-008',
              name: 'Ni Luh Ariani',
              role: 'head departement',
              departmentScope: 'Front Office',
              status: 'Active',
              lastActive: '15 Jun 2026, 08:00'
            }
          ];

          for (const op of defaultOperators) {
            await setDoc(doc(db, 'web_operators', op.id), op);
          }
          setOperators(defaultOperators);
          addLog('SEEDED: Berhasil menginisialisasi 8 data operator operasional pada Firestore.');
        }
      } catch (err: any) {
        addLog(`ERR: Gagal memuat operator dari Firestore: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  // Form State for "Tambah Operator Baru"
  const [name, setName] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleForm] = useState('head departement');
  const [departmentScope, setDepartmentScope] = useState('F&B Service');
  const [outletScope, setOutletScope] = useState('Semua Outlet');
  const [status, setStatus] = useState<'Active' | 'Non-active'>('Active');

  // Status banners
  const [successMsg, setSuccessMsg] = useState('');

  // Handle addition of new operator
  const handleAddNewOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG: Attempting to add operator:", { name, userIdInput, 'dbConfigured': !!db });
    
    if (!name.trim() || !userIdInput.trim() || !password.trim()) {
      console.error("DEBUG: Validation failed, fields empty");
      addLog("ERR: Mohon isi semua field (Nama, User ID, Password).");
      return;
    }

    const formattedId = userIdInput.trim();

    // Check if ID already exists
    if (operators.some(op => op.id === formattedId)) {
      console.warn("DEBUG: Duplicate ID detected:", formattedId);
      addLog(`ERR: User ID "${formattedId}" sudah terdaftar.`);
      alert(`User ID "${formattedId}" sudah ada!`);
      return;
    }

    try {
      console.log("DEBUG: Preparing to setDoc in web_operators:", formattedId);
      const newOp: Operator = {
        id: formattedId,
        user_id: formattedId,
        name: name.trim(),
        role,
        departmentScope: role === 'head departement' ? departmentScope : 'Semua Departemen',
        outletScope: role === 'head departement' ? outletScope : 'Semua Outlet',
        status,
        lastActive: 'Belum pernah login',
        password: password.trim()
      };

      await setDoc(doc(db, 'web_operators', formattedId), newOp);
      console.log("DEBUG: setDoc operation successful");
      setOperators(prev => [...prev, newOp]);
      addLog(`SUKSES: Operator ${formattedId} terdaftar.`);
      
      setSuccessMsg(`Operator "${newOp.name}" dengan User ID "${newOp.id}" berhasil didaftarkan!`);
      setName('');
      setUserIdInput('');
      setPassword('');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error("DEBUG: setDoc operation failed:", err);
      addLog(`ERR: Registrasi gagal: ${err.message}`);
    }
  };

  // Handle deletion of Operator Web Access
  const handleDeleteOperator = async (e: React.MouseEvent, id: string, opName: string) => {
    e.stopPropagation();
    console.log("DEBUG: handleDeleteOperator called", { id, opName });
    
    // Check if operator exists in current state
    const op = operators.find(o => o.id === id);
    console.log("DEBUG: Operator found in local state:", op);

    try {
        console.log("DEBUG: prepare to deleteDoc id", id);
        const docRef = doc(db, 'web_operators', id);
        console.log("DEBUG: docRef path:", docRef.path);
        await deleteDoc(docRef);
        console.log("DEBUG: deleteDoc success");
        
        setOperators(prev => prev.filter(o => o.id !== id));
        addLog(`HAPUS: Hak akses operator "${opName}" (ID: ${id}) berhasil dicabut.`);
        console.log("DEBUG: setOperators completed");
    } catch (err: any) {
        console.error("DEBUG: deleteDoc error", err);
        handleFirestoreError(err, OperationType.DELETE, `web_operators/${id}`);
        addLog(`ERR: Pencabutan akses operator gagal: ${err.message}`);
    }
  };

  // Toggle toggle-status
  const handleToggleStatus = async (id: string, currentStatus: 'Active' | 'Non-active', opName: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Non-active' : 'Active';
    try {
      const targetOp = operators.find(op => op.id === id);
      if (!targetOp) return;
      const updatedOp: Operator = {
        ...targetOp,
        status: nextStatus
      };
      await setDoc(doc(db, 'web_operators', id), updatedOp);
      setOperators(prev => prev.map(op => op.id === id ? updatedOp : op));
      addLog(`UPDATE: Status operator "${opName}" diubah menjadi ${nextStatus}.`);
    } catch (err: any) {
      addLog(`ERR: Gagal merubah status operator: ${err.message}`);
    }
  };

  // Filter list based on search
  const filteredOperators = operators.filter(op => 
    (op.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (op.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="superadmin-panel-container">
      
      {/* Super Admin Title / Header */}
      <div className="bg-gradient-to-r from-teal-50 to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-lg border border-cyan-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <span>Halaman Sakti Developer (Operator Registry & Hub)</span>
              <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded border border-cyan-200 animate-pulse">
                FIRESTORE LIVE OPERATORS
              </span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Kekuasaan penuh developer untuk mengelola, mendaftarkan, mengaktifkan, atau menonaktifkan akun operator dan administrator yang memegang kendali sistem PT. Aqua Nusa Lembongan ke depan.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 font-semibold animate-fade-in shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub Tabs Selection */}
      <div className="flex border-b border-slate-200" id="sakti-subtabs">
        <button
          onClick={() => setActiveSubTab('operators')}
          className={`px-5 py-3 border-b-2 font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'operators'
              ? 'border-cyan-600 text-cyan-700 bg-cyan-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Operator Web Access Registry
        </button>
        <button
          onClick={() => setActiveSubTab('outlets_depts')}
          className={`px-5 py-3 border-b-2 font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'outlets_depts'
              ? 'border-cyan-600 text-cyan-700 bg-cyan-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manajemen Outlet & Departemen
        </button>
      </div>

      {activeSubTab === 'operators' ? (
        /* Main Two-Column Structure */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
        
        {/* LEFT COLUMN: Tambah Operator Web Baru Form Card (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-sans font-extrabold text-xs text-slate-800 uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-600" />
                Registrasi Akun Operator Baru
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-bold uppercase">
                Sakti Mode
              </span>
            </div>

            <form onSubmit={handleAddNewOperator} className="p-5 space-y-4 text-xs bg-slate-50/30 rounded-b-xl">
              
              {/* Name Field */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  1. Nama Lengkap Operator <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ketut Swastika, Maria GM, HR Admin..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 font-sans"
                />
              </div>

              {/* User ID Field */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  2. User ID / Login Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-mono font-bold text-xs select-none">@</span>
                  <input
                    type="text"
                    required
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Contoh: KETUTSWA, SAKTIDEV"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 pl-8 outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 font-mono font-bold"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Username unik tanpa spasi untuk identifikasi unik dokumen Firestore.</p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  3. Password Akses <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sandi Rahasia Operator (Contoh: nusa123)"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 pl-9 outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  Sistem Role Peran (Autoritas)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRoleForm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none font-semibold text-slate-800 text-xs shadow-sm"
                >
                  <option value="super admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Maria">Maria</option>
                  <option value="HR">HR Admin</option>
                  <option value="head departement">HoD / Supervisor</option>
                </select>
              </div>

              {/* Outlet Scale Select */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  4. Batasan Ruang Outlet / Cabang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={outletScope}
                  onChange={(e) => setOutletScope(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none font-medium text-slate-800 text-xs shadow-sm"
                >
                  <option value="Semua Outlet">Semua Outlet (Akses General / Lintas Cabang)</option>
                  {outlets.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>

              {/* Department Scale Select */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  5. Pembatasan Divisi / Departemen <span className="text-rose-500">*</span>
                </label>
                <select
                  value={departmentScope}
                  onChange={(e) => setDepartmentScope(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none font-medium text-slate-800 text-xs shadow-sm"
                >
                  <option value="Semua Departemen">Semua Departemen (Akses Lintas Sektor)</option>
                  {departments.map(d => (
                    <option key={d.id} value={(d.name || '').split(' (')[0]}>{(d.name || '').split(' (')[0]}</option>
                  ))}
                </select>
              </div>

              {/* Acc Status selection */}
              <div>
                <label className="block text-slate-605 font-extrabold mb-1 uppercase tracking-tight text-[10px]">
                  Status Aktivasi Kredensial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none text-slate-800 font-bold text-xs"
                >
                  <option value="Active">🟢 AKTIF (Bisa login & edit data)</option>
                  <option value="Non-active">🔴 NON-AKTIF (Akses dibekukan)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Buat User ID Operator Baru</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Daftar Operator Terdaftar (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div>
            {/* Header with Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-sans font-extrabold text-xs text-slate-800 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-600" />
                  Daftar Operator Operasional (Firestore)
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Total: {operators.length} Operator Registered
                </span>
              </div>

              {/* Fast Search view */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari operator dari nama, email, atau peran..."
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Operator List View */}
            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-2">
                  <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Memuat database operator live dari Firestore...</p>
                </div>
              ) : filteredOperators.length === 0 ? (
                <p className="p-12 text-center text-slate-400 text-xs italic">Operator tidak ditemukan.</p>
              ) : (
                filteredOperators.map(op => (
                  <div key={op.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 pr-4 truncate">
                      <div className="font-sans font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <span className="truncate">{op.name}</span>
                        <span className="text-[9px] font-mono bg-cyan-50 border border-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          @{op.id}
                        </span>
                      </div>
                      <div className="text-slate-500 font-medium flex flex-wrap gap-x-3 gap-y-1 items-center">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                          op.role === 'super admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          op.role === 'Manager' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          op.role === 'Maria' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                          op.role === 'HR' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {op.role}
                        </span>
                        <span className="text-slate-400 px-1">|</span>
                        <span className="text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[10px]">
                          Dept: {op.departmentScope}
                        </span>
                        {op.outletScope && (
                          <>
                            <span className="text-slate-400 px-1">|</span>
                            <span className="text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[10px]">
                              Outlet: {op.outletScope}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Aktifitas Terakhir: <strong className="text-slate-600">{op.lastActive}</strong></span>
                        {op.password && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-[9px] font-bold">
                              <button 
                                onClick={() => setVisiblePasswords(prev => ({ ...prev, [op.id]: !prev[op.id] }))}
                                className="hover:text-slate-700 transition-colors"
                              >
                                {visiblePasswords[op.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              🔑 Sandi: <span className="text-rose-700 select-all font-mono">
                                {visiblePasswords[op.id] ? op.password : '••••••••'}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(op.id, op.status, op.name)}
                        title={op.status === 'Active' ? 'Nonaktifkan Akun ini' : 'Aktifkan Akun ini'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          op.status === 'Active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Remove Account / Revoke credentials */}
                      <button
                        onClick={(e) => handleDeleteOperator(e, op.id, op.name)}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                        title="Hapus Hak Akses Operator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Sakti Access Log (Web DB Connection Active)</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600">Sync Aktif</span>
            </div>
          </div>

        </div>

      </div>
      ) : (
        /* Outlets and Departments Management Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs" id="outlet-dept-management-panel">
          
          {/* PANEL OUTLET */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
            <div>
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <span className="font-sans font-extrabold text-[12px] text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-600" />
                  Manajemen Outlet PT. Aqua Nusa
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Buat, filter, dan daftarkan cabang outlet perhotelan/karyawan baru.</p>
              </div>

              {/* Form Tambah Outlet */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newOutletName.trim()) return;
                  await addOutlet(newOutletName.trim());
                  addLog(`SUKSES: Outlet baru "${newOutletName}" berhasil didaftarkan live.`);
                  setNewOutletName('');
                }}
                className="p-4 border-b border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Nama Outlet Baru (e.g. Lembongan Beach Club)"
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-semibold text-xs px-4 rounded-lg shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* List of Outlets */}
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                {outlets.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-xs italic">Belum ada outlet terdaftar.</p>
                ) : (
                  outlets.map(o => (
                    <div key={o.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-sans font-extrabold text-slate-800 text-xs">{o.name}</p>
                        <p className="font-mono text-[9px] text-slate-400">ID Outlet: <strong className="text-slate-650">{o.id}</strong></p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            console.log(`DEBUG: Edit button clicked for outlet ${o.id} (${o.name})`);
                            const newName = prompt(`Ubah nama outlet "${o.name}"`, o.name);
                            if (newName && newName.trim() !== o.name) {
                              try {
                                await editOutletContext(o.id, newName.trim());
                                addLog(`EDIT: Outlet "${o.name}" diubah menjadi "${newName.trim()}".`);
                              } catch (err) {
                                console.error("DEBUG: Failed to edit outlet:", err);
                                const errMsg = err instanceof Error ? err.message : String(err);
                                addLog(`ERR: Gagal mengubah outlet "${o.name}": ${errMsg}`);
                              }
                            }
                          }}
                          className="p-1.5 border border-slate-200 rounded-lg hover:bg-cyan-50 hover:text-cyan-600 text-slate-400 transition-colors shrink-0 cursor-pointer"
                          title="Edit Outlet"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            console.log(`DEBUG: Delete button clicked for outlet ${o.id} (${o.name})`);
                            if (confirm(`Hapus outlet "${o.name}"? Ini mungkin berdampak pada karyawan yang ditugaskan ke outlet ini.`)) {
                              try {
                                await deleteOutletContext(o.id);
                                addLog(`HAPUS: Outlet "${o.name}" berhasil dihapus.`);
                              } catch (err) {
                                console.error("DEBUG: Failed to delete outlet:", err);
                                const errMsg = err instanceof Error ? err.message : String(err);
                                addLog(`ERR: Gagal menghapus outlet "${o.name}": ${errMsg}`);
                              }
                            }
                          }}
                          className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shrink-0 cursor-pointer"
                          title="Hapus Outlet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Total Terdaftar: {outlets.length} Outlet</span>
              <span>Live Database</span>
            </div>
          </div>

          {/* PANEL DEPARTEMEN */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
            <div>
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <span className="font-sans font-extrabold text-[12px] text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-600" />
                  Manajemen Departemen PT. Aqua Nusa
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Buat, filter, dan daftarkan divisi operasional perhotelan/karyawan baru.</p>
              </div>

              {/* Form Tambah Departemen */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newDeptName.trim()) return;
                  await addDepartment(newDeptName.trim());
                  addLog(`SUKSES: Departemen baru "${newDeptName}" berhasil didaftarkan live.`);
                  setNewDeptName('');
                }}
                className="p-4 border-b border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Nama Departemen Baru (e.g. Housekeeping)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-semibold text-xs px-4 rounded-lg shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* List of Departments */}
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                {departments.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-xs italic">Belum ada departemen terdaftar.</p>
                ) : (
                  departments.map(d => (
                    <div key={d.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-sans font-extrabold text-slate-800 text-xs">{d.name}</p>
                        <p className="font-mono text-[9px] text-slate-400">ID Departemen: <strong className="text-slate-650">{d.id}</strong></p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            const newName = prompt(`Ubah nama departemen "${d.name}"`, d.name);
                            if (newName && newName.trim() !== d.name) {
                              await editDepartment(d.id, newName.trim());
                              addLog(`EDIT: Departemen "${d.name}" diubah menjadi "${newName.trim()}".`);
                            }
                          }}
                          className="p-1.5 border border-slate-200 rounded-lg hover:bg-cyan-50 hover:text-cyan-600 text-slate-400 transition-colors shrink-0 cursor-pointer"
                          title="Edit Departemen"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Hapus departemen "${d.name}"? Ini mungkin berdampak pada schedules & karyawan didepartemen ini.`)) {
                              await deleteDepartment(d.id);
                              addLog(`HAPUS: Departemen "${d.name}" berhasil dihapus.`);
                            }
                          }}
                          className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shrink-0 cursor-pointer"
                          title="Hapus Departemen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Total Terdaftar: {departments.length} Departemen</span>
              <span>Live Database</span>
            </div>
          </div>

        </div>
      )}

      {/* Console System Logs at Bottom */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight flex items-center gap-2 font-sans">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Live Firebase Log Console
        </h4>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-emerald-400 pr-1">
          {logs.map((log, idx) => <p key={idx} className="truncate">{log}</p>)}
        </div>
      </div>

    </div>
  );
};
