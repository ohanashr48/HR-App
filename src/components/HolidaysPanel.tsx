/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { useHR } from '../context/HRContext';
import { HolidayCategory } from '../types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const HolidaysPanel: React.FC = () => {
  const { 
    publicHolidays, 
    addPublicHoliday, 
    deletePublicHoliday, 
    addExtraPH,
    clearPublicHolidays,
    employees,
    userSession
  } = useHR();

  // Selected Category filter
  const [activeCategory, setActiveCategory] = useState<HolidayCategory | 'All'>('All');

  // Input States for New Holiday Form
  const [newPhForm, setNewPhForm] = useState({
    name: '',
    date: '2026-06-15',
    category: 'Government' as HolidayCategory
  });

  // Input States for HR Extra PH (Cuti Bersama)
  const [extraPhForm, setExtraPhForm] = useState({
    name: '',
    date: '2026-06-20',
    category: 'Government' as HolidayCategory
  });

  const [activeYear, setActiveYear] = useState<number>(2026);

  // Success Feedbacks
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Validate HR/Admin actions
  const isHRorAdmin = userSession?.role === 'HR' || userSession?.role === 'super admin';

  // Filtered public holidays
  const holidayYears = useMemo(() => {
    const years = Array.from(new Set(publicHolidays.map(ph => ph.year || new Date(ph.date).getFullYear()))).sort((a, b) => b - a);
    if (!years.includes(activeYear)) {
      years.unshift(activeYear);
    }
    return years;
  }, [publicHolidays, activeYear]);

  const filteredHolidays = useMemo(() => {
    let list = [...publicHolidays];
    list = list.filter(ph => (ph.year || new Date(ph.date).getFullYear()) === activeYear);
    if (activeCategory !== 'All') {
      list = list.filter(ph => ph.category === activeCategory);
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [publicHolidays, activeCategory, activeYear]);

  // Aggregate counts per division for selected year
  const counts = useMemo(() => {
    const yearHolidays = publicHolidays.filter(ph => (ph.year || new Date(ph.date).getFullYear()) === activeYear);
    return {
      Government: yearHolidays.filter(p => p.category === 'Government').length,
      'Christian/Catholic': yearHolidays.filter(p => p.category === 'Christian/Catholic').length,
      Hindu: yearHolidays.filter(p => p.category === 'Hindu').length,
      Moslem: yearHolidays.filter(p => p.category === 'Moslem').length,
    };
  }, [publicHolidays, activeYear]);

  // Count employees associated with each holiday
  const getAffectedEmployeesCount = (category: HolidayCategory): number => {
    if (category === 'Government') return employees.length;
    return employees.filter(e => e.religion === category).length;
  };

  // Add Normal Public Holiday List
  const handleAddPh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhForm.name.trim()) return;

    try {
      await addPublicHoliday({
        name: newPhForm.name,
        date: newPhForm.date,
        category: newPhForm.category,
        isExtra: false,
        year: parseInt(newPhForm.date.split('-')[0]) || 2026
      });
      setNewPhForm({ ...newPhForm, name: '' });
      triggerFeedback('Hari Libur Nasional berhasil ditambahkan ke database!');
    } catch (err) {
      triggerFeedback('Gagal menyimpan Hari Libur Nasional. Cek koneksi atau konfigurasi Firestore.');
    }
  };

  // Add Extra Cutber (Joint Leave) Holiday
  const handleAddExtraPh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraPhForm.name.trim()) return;

    try {
      await addExtraPH(
        extraPhForm.name,
        extraPhForm.date,
        extraPhForm.category
      );
      setExtraPhForm({ ...extraPhForm, name: '' });
      triggerFeedback('Tambahan Cuti Bersama (Extra PH) sukses didistribusikan ke roster!');
    } catch (err) {
      triggerFeedback('Gagal menyimpan Extra PH. Cek koneksi atau konfigurasi Firestore.');
    }
  };

  const handleClearHolidays = async () => {
    if (!confirm('Yakin ingin membersihkan semua public holiday dari database?')) {
      return;
    }

    try {
      await clearPublicHolidays();
      triggerFeedback('Semua public holiday berhasil dibersihkan.');
    } catch (err) {
      triggerFeedback('Gagal membersihkan public holiday. Cek koneksi atau konfigurasi Firestore.');
    }
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-6" id="ph-panel-container">
      
      {/* Alert Feedbacks */}
      {feedbackMsg && (
        <div className="bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 p-3 rounded-lg text-xs font-sans animate-pulse">
          ✓ {feedbackMsg}
        </div>
      )}

      {/* Header Summary */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-white uppercase tracking-tight">
              Manajemen Kalender Hari Libur (Public Holiday)
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              PT. Aqua Nusa Lembongan menganut 4 pembagian utama PH dengan kuota idealmasing-masing 16 PH dalam setahun.
            </p>
          </div>
        </div>
        
        {/* Statistics block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-2 border border-slate-800/80 rounded-lg text-center">
          <div className="px-2">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Gov PH</span>
            <span className="font-bold text-white text-xs">{counts.Government} / 16</span>
          </div>
          <div className="px-2 border-l border-slate-800">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Hindu PH</span>
            <span className="font-bold text-white text-xs">{counts.Hindu} / 16</span>
          </div>
          <div className="px-2 border-l border-slate-800">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Moslem PH</span>
            <span className="font-bold text-white text-xs">{counts.Moslem} / 16</span>
          </div>
          <div className="px-2 border-l border-slate-800">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Christ PH</span>
            <span className="font-bold text-white text-xs">{counts['Christian/Catholic']} / 16</span>
          </div>
        </div>
      </div>

      {/* Forms Segment: Add Regular PH or Add Dynamic Joint Leave PH */}
      {!isHRorAdmin ? (
        <div className="bg-amber-955/20 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Akses Terkunci (Hanya HR / Super Admin)</h5>
            <p className="text-slate-350 text-xs mt-0.5">
              Anda login sebagai <strong>{userSession?.role?.toUpperCase() || 'GUEST'}</strong>. Penambahan atau penghapusan Kalender Public Holiday dan Cuti Bersama hanya dapat dilakukan oleh staff <strong>HR</strong> dan <strong>Super Admin</strong> demi keamanan database kontrak.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Form Left: Add Standard Scheduled PH for the Year */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2.5">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                Tambah Hari Libur Terjadwal (16 PH Tahunan)
              </h4>
              <p className="text-slate-400 text-xs mb-4">
                Gunakan form ini untuk melengkapi / menginput daftar 16 hari raya keagamaan atau libur nasional terjadwal untuk masing-masing bagian dalam setahun.
              </p>

              <form onSubmit={handleAddPh} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-405 mb-1 text-slate-400 font-mono uppercase">NAMA HARI RAYA / PH</label>
                  <input
                    type="text"
                    required
                    value={newPhForm.name}
                    onChange={(e) => setNewPhForm({ ...newPhForm, name: e.target.value })}
                    placeholder="Contoh: Hari Raya Galungan 2026"
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-405 mb-1 text-slate-400 font-mono uppercase">TANGGAL PH</label>
                    <input
                      type="date"
                      required
                      value={newPhForm.date}
                      onChange={(e) => setNewPhForm({ ...newPhForm, date: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-405 mb-1 text-slate-400 font-mono uppercase">PEMBAGIAN UTAMA PH</label>
                    <select
                      value={newPhForm.category}
                      onChange={(e) => setNewPhForm({ ...newPhForm, category: e.target.value as HolidayCategory })}
                      className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                      <option value="Government">Government PH</option>
                      <option value="Christian/Catholic">Christian/Catholic PH</option>
                      <option value="Hindu">Hindu PH</option>
                      <option value="Moslem">Moslem PH</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-sans text-xs font-semibold p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Tambahkan ke Kalender Libur Tahunan</span>
                </button>
              </form>
            </div>
          </div>

          {/* Form Right: Add Extra Dynamic Holiday / Cuti Bersama defined by HR */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-tight flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Tambah Extra PH / Cuti Bersama (HR Policy)
              </h4>
              <p className="text-slate-400 text-xs mb-4">
                Pemerintah kadang menetapkan tanggal tertentu secara mendadak menjadi libur tambahan / Cuti Bersama. Input extra PH di sini akan otomatis diimplementasikan ke database.
              </p>

              <form onSubmit={handleAddExtraPh} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase text-slate-400">NAMA EXTRA PH / CUTI BERSAMA</label>
                  <input
                    type="text"
                    required
                    value={extraPhForm.name}
                    onChange={(e) => setExtraPhForm({ ...extraPhForm, name: e.target.value })}
                    placeholder="Contoh: Libur Bersama Pemilu Daerah"
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase text-slate-400">TANGGAL LIBUR</label>
                    <input
                      type="date"
                      required
                      value={extraPhForm.date}
                      onChange={(e) => setExtraPhForm({ ...extraPhForm, date: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase text-slate-400">TARGET PENERIMA PH</label>
                    <select
                      value={extraPhForm.category}
                      onChange={(e) => setExtraPhForm({ ...extraPhForm, category: e.target.value as HolidayCategory })}
                      className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="Government">Kemitraan Umum (Semua Agama)</option>
                      <option value="Christian/Catholic">Christian/Catholic Staff</option>
                      <option value="Hindu">Hindu Staff Saja</option>
                      <option value="Moslem">Moslem Staff Saja</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-950/20 hover:bg-amber-950/30 text-amber-300 font-sans text-xs font-semibold p-2.5 rounded-lg border border-amber-900 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Distribusikan Extra PH Sekarang</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* Holidays List Grid segmented by category tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        
        {/* Filters Top */}
        <div className="p-4 bg-slate-950 border-b border-slate-820 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-sans text-slate-300">
              Filter Kalender Public Holiday:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="year-filter" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tahun PH
              </label>
              <select
                id="year-filter"
                value={activeYear}
                onChange={(e) => setActiveYear(Number(e.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {holidayYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1">
              {['All', 'Government', 'Hindu', 'Moslem', 'Christian/Catholic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                    activeCategory === cat
                      ? 'bg-violet-500/15 text-violet-400 border-violet-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua PH' : `${cat} PH`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isHRorAdmin && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-inner text-right">
            <button
              onClick={handleClearHolidays}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-600 bg-rose-950/10 px-4 py-2 text-rose-300 text-xs font-semibold hover:bg-rose-950/30 transition-all"
              title="Bersihkan semua public holiday dari Firestore"
            >
              <Trash2 className="w-4 h-4" />
              Bersihkan Semua PH
            </button>
          </div>
        )}

        {/* Holiday Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 font-mono text-[10px] text-slate-400 border-b border-slate-800 select-none">
              <tr>
                <th className="p-3">NAMA HARI LIBUR / EVENT</th>
                <th className="p-3">TANGGAL LIBUR</th>
                <th className="p-3">KATEGORI UTAMA</th>
                <th className="p-3">SISTEM IMPLEMENTASI AGAMA</th>
                <th className="p-3 text-center">AFFECTED STAFF</th>
                <th className="p-3">STATUS KHUSUS</th>
                {isHRorAdmin && <th className="p-3 text-right">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-xs">
              {filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    Tidak ada hari libur nasional (PH) yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredHolidays.map((ph) => {
                  const affectedCount = getAffectedEmployeesCount(ph.category);
                  const isExtra = ph.isExtra;

                  return (
                    <tr key={ph.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3 font-sans font-bold text-slate-200">
                        {ph.name}
                      </td>
                      <td className="p-3 font-mono text-cyan-405 font-medium">
                        {ph.date}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                          ph.category === 'Government' ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' :
                          ph.category === 'Hindu' ? 'bg-orange-950/50 text-orange-400 border-orange-800/30' :
                          ph.category === 'Moslem' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30' :
                          'bg-violet-950/50 text-violet-400 border-violet-800/30'
                        }`}>
                          {ph.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-350">
                        {ph.category === 'Government' 
                          ? 'Diberikan ke Seluruh Karyawan' 
                          : `Hanya untuk Agama ${ph.category}`
                        }
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className="bg-slate-950 border border-slate-800 font-bold text-slate-300 rounded px-2.5 py-0.5">
                          {affectedCount} Org
                        </span>
                      </td>
                      <td className="p-3">
                        {isExtra ? (
                          <span className="text-[10px] font-sans font-semibold text-amber-450 bg-amber-950/40 border border-amber-900 px-2 py-0.5 rounded">
                            Extra (Joint Leave)
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans text-slate-450 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                            Standard PH
                          </span>
                        )}
                      </td>
                      {isHRorAdmin && (
                        <td className="p-3 text-right">
                          <button
                            id={`btn-delete-ph-${ph.id}`}
                            onClick={() => {
                              if(confirm(`Hapus public holiday "${ph.name}" dari kalender?`)) {
                                deletePublicHoliday(ph.id);
                                triggerFeedback('Hari libur berhasil dihapus.');
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded transition-all cursor-pointer"
                            title="Hapus PH"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legal Disclaimer / Help */}
        <div className="bg-slate-950 p-4 border-t border-slate-800/80 text-xs text-slate-450 hover:text-slate-400 transition-colors">
          <p className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span>
              Sanksi Roster Rinci: Sesuai undang-undang ketenagakerjaan, karyawan yang dijadwalkan bekerja (P/S/M) bertepatan sanksi Public Holiday (PH) agamanya berhak mendapatkan 1 sisa tukar off (DP+) sebagai kompensasi.
            </span>
          </p>
        </div>

      </div>

    </div>
  );
};
