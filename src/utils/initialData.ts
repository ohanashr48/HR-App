/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, PublicHoliday, Outlet, Department, DepartmentSchedule, ResignedEmployee, TraineeEmployee, ProbationEmployee, HolidayCategory, ReligionType } from '../types';

export function getDefaultPublicHolidayCategory(religion: ReligionType): HolidayCategory {
  switch (religion) {
    case 'Hindu':
      return 'Hindu';
    case 'Moslem':
      return 'Moslem';
    case 'Christian/Catholic':
      return 'Christian/Catholic';
    default:
      return 'Government';
  }
}

export const INITIAL_OUTLETS: Outlet[] = [
  { id: 'O1', name: 'Lembongan Main Office' },
  { id: 'O2', name: 'Nusa Lembongan Beach Club' },
  { id: 'O3', name: 'Nusa Ceningan Marina & Resort' },
  { id: 'O4', name: 'Jungutbatu Villas' }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'D1', name: 'Front Office (FO)' },
  { id: 'D2', name: 'Housekeeping (HK)' },
  { id: 'D3', name: 'Food & Beverage (F&B)' },
  { id: 'D4', name: 'HR & Admin' },
  { id: 'D5', name: 'Maintenance & Eng' }
];

// Generates exactly 16 PHs for the year 2026 per primary division
export const INITIAL_PUBLIC_HOLIDAYS: PublicHoliday[] = [
  // --- GOVERNMENT PH --- (16)
  { id: 'PH_G1', name: 'Tahun Baru Masehi 2026', date: '2026-01-01', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G2', name: 'Hari Gizi Nasional', date: '2026-01-25', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G3', name: 'Hari Pers Nasional', date: '2026-02-09', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G4', name: 'Hari Musik Nasional', date: '2026-03-09', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G5', name: 'Hari Buruh Internasional', date: '2026-05-01', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G6', name: 'Hari Pendidikan Nasional', date: '2026-05-02', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G7', name: 'Hari Kebangkitan Nasional', date: '2026-05-20', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G8', name: 'Hari Lahir Pancasila', date: '2026-06-01', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G9', name: 'Hari Koperasi Indonesia', date: '2026-07-12', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G10', name: 'Hari Kemerdekaan RI (HUT-81)', date: '2026-08-17', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G11', name: 'Hari Perhubungan Nasional', date: '2026-09-17', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G12', name: 'Hari Batik Nasional', date: '2026-10-02', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G13', name: 'Hari Sumpah Pemuda', date: '2026-10-28', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G14', name: 'Hari Pahlawan', date: '2026-11-10', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G15', name: 'Hari Kesehatan Nasional', date: '2026-11-12', category: 'Government', isExtra: false, year: 2026 },
  { id: 'PH_G16', name: 'Hari Ibu Nasional', date: '2026-12-22', category: 'Government', isExtra: false, year: 2026 },

  // --- CHRISTIAN/CATHOLIC PH --- (16)
  { id: 'PH_C1', name: 'Hari Epifani Tiga Raja', date: '2026-01-06', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C2', name: 'Hari Rabu Abu Kristen', date: '2026-02-18', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C3', name: 'Minggu Palma', date: '2026-03-29', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C4', name: 'Kamis Putih Paskah', date: '2026-04-02', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C5', name: 'Wafat Isa Almasih (Jumat Agung)', date: '2026-04-03', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C6', name: 'Hari Raya Paskah Raya', date: '2026-04-05', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C7', name: 'Kenaikan Isa Almasih', date: '2026-05-14', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C8', name: 'Hari Raya Pentakosta Kristen', date: '2026-05-24', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C9', name: 'Hari Raya Santa Maria', date: '2026-08-15', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C10', name: 'Hari Raya Semua Orang Kudus', date: '2026-11-01', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C11', name: 'Hari Arwah Orang Beriman', date: '2026-11-02', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C12', name: 'Hari Raya Santa Cecilia', date: '2026-11-22', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C13', name: 'Sore Natal (Christmas Eve)', date: '2026-12-24', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C14', name: 'Hari Raya Natal Yesus Kristus', date: '2026-12-25', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C15', name: 'Natal Hari Kedua (Boxing Day)', date: '2026-12-26', category: 'Christian/Catholic', isExtra: false, year: 2026 },
  { id: 'PH_C16', name: 'Pesta Keluarga Kudus', date: '2026-12-27', category: 'Christian/Catholic', isExtra: false, year: 2026 },

  // --- HINDU PH --- (16)
  { id: 'PH_H1', name: 'Hari Raya Siwaratri', date: '2026-01-09', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H2', name: 'Hari Raya Saraswati (Soma Ribek)', date: '2026-02-07', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H3', name: 'Hari Raya Pagerwesi Bali', date: '2026-02-11', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H4', name: 'Tawur Agung Kesanga Saka 1948', date: '2026-03-18', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H5', name: 'Hari Raya Nyepi Saka 1948', date: '2026-03-19', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H6', name: 'Hari Ngembak Geni Bali', date: '2026-03-20', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H7', name: 'Hari Raya Galungan Melasti', date: '2026-04-22', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H8', name: 'Hari Raya Kuningan Bali', date: '2026-05-02', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H9', name: 'Purnama Kasa Bali', date: '2026-07-09', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H10', name: 'Purnama Karo Bali', date: '2026-08-08', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H11', name: 'Hari Raya Saraswati II', date: '2026-09-05', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H12', name: 'Hari Raya Pagerwesi II', date: '2026-09-09', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H13', name: 'Purnama Ketiga Bali', date: '2026-09-27', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H14', name: 'Purnama Kapat Bali', date: '2026-10-26', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H15', name: 'Hari Raya Galungan II', date: '2026-11-18', category: 'Hindu', isExtra: false, year: 2026 },
  { id: 'PH_H16', name: 'Hari Raya Kuningan II', date: '2026-11-28', category: 'Hindu', isExtra: false, year: 2026 },

  // --- MOSLEM PH --- (16)
  { id: 'PH_M1', name: 'Isra Mi\'raj Nabi Muhammad', date: '2026-01-16', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M2', name: 'Malam Nisfu Sya\'ban', date: '2026-02-01', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M3', name: 'Awal Puasa Ramadhan 1447 H', date: '2026-02-18', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M4', name: 'Malam Nuzulul Qur\'an 1447 H', date: '2026-03-06', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M5', name: 'Malam Lailatul Qadar', date: '2026-03-15', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M6', name: 'Hari Raya Idul Fitri 1 Syawal 1447 H', date: '2026-03-20', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M7', name: 'Idul Fitri Hari Kedua', date: '2026-03-21', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M8', name: 'Hari Raya Idul Adha 1447 H', date: '2026-05-27', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M9', name: 'Hari Tasyrik I Idul Adha', date: '2026-05-28', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M10', name: 'Hari Tasyrik II', date: '2026-05-29', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M11', name: 'Hari Tasyrik III', date: '2026-05-30', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M12', name: 'Tahun Baru Islam 1448 Hijriah', date: '2026-06-17', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M13', name: 'Hari Ke-10 Muharram (Hari Asyura)', date: '2026-06-26', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M14', name: 'Safar Agung Moslem', date: '2026-07-15', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M15', name: 'Maulid Nabi Muhammad SAW', date: '2026-09-05', category: 'Moslem', isExtra: false, year: 2026 },
  { id: 'PH_M16', name: 'Lailat Al-Badar Moslem', date: '2026-10-12', category: 'Moslem', isExtra: false, year: 2026 }
];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_RESIGNED_EMPLOYEES: ResignedEmployee[] = [];

export const INITIAL_TRAINEE_EMPLOYEES: TraineeEmployee[] = [];

export const INITIAL_PROBATION_EMPLOYEES: ProbationEmployee[] = [];

/**
 * Calculates current accrued AL based on their start date and the current date (assumed to be 2026-06-15).
 * Rule: AL or annual leave is given if employee has worked for 1 month. Every month gets +1 AL.
 */
export function calculateMonthsWorked(startDateStr: string, asOfDateStr: string = '2026-06-15'): number {
  const start = new Date(startDateStr);
  const end = new Date(asOfDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const totalMonths = (yearsDiff * 12) + monthsDiff;
  
  // if day of starting date has not passed the day of as of date, subtract a fractional month
  if (end.getDate() < start.getDate()) {
    return Math.max(0, totalMonths - 1);
  }
  
  return Math.max(0, totalMonths);
}

/**
 * Gets the number of holidays applicable to an employee based on the employee's assigned PH group in 2026.
 */
export function calculateEmployeePublicHolidaysCount(publicHolidayCategory: HolidayCategory, holidays: PublicHoliday[]): number {
  return holidays.filter(h => h.category === publicHolidayCategory).length;
}

/**
 * Checks if a specific date is a Public Holiday applicable to this employee based on assigned PH group.
 */
export function isDatePHForEmployee(dateStr: string, publicHolidayCategory: HolidayCategory, holidays: PublicHoliday[]): boolean {
  return holidays.some(h => h.date === dateStr && h.category === publicHolidayCategory);
}

/**
 * Calculate dynamic schedule metrics like al- (taking AL), dp- (taking DP), and dp+ (working on a PH date)
 */
export function calculateRosterStats(
  dates: { [dateStr: string]: string },
  publicHolidayCategory: HolidayCategory,
  holidays: PublicHoliday[]
) {
  let alMinus = 0;
  let dpMinus = 0;
  let dpPlus = 0;

  Object.entries(dates).forEach(([dateStr, shiftVal]) => {
    if (shiftVal === 'AL') {
      alMinus++;
    } else if (shiftVal === 'DP') {
      dpMinus++;
    } else if (shiftVal !== 'OFF' && shiftVal !== '') {
      // Karyawan kerja (not OFF, not AL, not DP)
      if (isDatePHForEmployee(dateStr, publicHolidayCategory, holidays)) {
        dpPlus++;
      }
    }
  });

  return { alMinus, dpMinus, dpPlus };
}

/**
 * Generates an initial department schedule with random shifts for each employee between 26 June and 25 July 2026.
 */
export function generateInitialSchedule(employees: Employee[], departmentId: string): DepartmentSchedule {
  const periodId = '2026-06-26_2026-07-25';
  const filtered = employees.filter(e => e.departmentId === departmentId);
  const entries: { [employeeId: string]: any } = {};
  
  // Create a base holiday list for calculation reference
  const holidaysReference = INITIAL_PUBLIC_HOLIDAYS;

  // dates list from Jun 26 to Jul 25 2026
  const datesList: string[] = [];
  const start = new Date('2026-06-26');
  const end = new Date('2026-07-25');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    datesList.push(d.toISOString().split('T')[0]);
  }
  
  const shifts = ['P', 'S', 'M', 'OFF', 'P', 'S', 'OFF']; // standard rotation
  
  filtered.forEach(emp => {
    const datesData: { [dateStr: string]: string } = {};
    
    // Assign shifts
    datesList.forEach((dateStr, idx) => {
      // Randomly inject some AL and DP leaves to show calculations working
      if (idx === 5) {
        datesData[dateStr] = 'AL';
      } else if (idx === 14) {
        datesData[dateStr] = 'DP';
      } else {
        datesData[dateStr] = shifts[(idx + emp.name.length) % shifts.length];
      }
    });

    // Calculate initial dynamic stats using the real rules
    const stats = calculateRosterStats(datesData, emp.publicHolidayCategory ?? getDefaultPublicHolidayCategory(emp.religion), holidaysReference);
    
    entries[emp.id] = {
      employeeId: emp.id,
      dates: datesData,
      alPrev: emp.alBalance,
      alMinus: stats.alMinus,
      alPlus: 1, // 1 AL plus this month accrual
      dpPrev: emp.dpBalance,
      dpMinus: stats.dpMinus,
      dpPlus: stats.dpPlus, // calculated working on Holiday
    };
  });
  
  return {
    id: `${departmentId}_${periodId}`,
    periodId,
    departmentId,
    entries
  };
}
