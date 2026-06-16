/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, PublicHoliday, Outlet, Department, DepartmentSchedule, ResignedEmployee, TraineeEmployee, ProbationEmployee } from '../types';

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

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'I Wayan Gede Merta',
    position: 'Front Office Supervisor',
    startingDate: '2024-03-15',
    gender: 'Male',
    religion: 'Hindu',
    maritalStatus: 'Married',
    nikPassport: '5108021203920005',
    noKK: '5108021508100021',
    noHandphone: '081234567890',
    noBpjsKes: '0001234567891',
    noBpjsTk: '19028374829',
    birthPlace: 'Denpasar',
    birthDate: '1992-03-12',
    motherFullName: 'Ni Luh Made Putu',
    lastEducation: 'Diploma 3 Pariwisata',
    address: 'Jl. Raya Jungutbatu, Nusa Lembongan',
    email: 'wayan.gede@aquanusa.co.id',
    emergencyContact: 'Ni Kadek Aryani',
    relationship: 'Wife',
    references: 'Satyawan (Manager FO Lembongan Palace)',
    alBalance: 12,
    dpBalance: 2,
    signDate: '2026-03-15',
    contractEndDate: '2027-03-15',
    outletId: 'O1',
    departmentId: 'D1' // FO
  },
  {
    id: 'EMP002',
    name: 'Ni Luh Putu Sri Wahyuni',
    position: 'Receptionist',
    startingDate: '2025-05-10',
    gender: 'Female',
    religion: 'Hindu',
    maritalStatus: 'Single',
    nikPassport: '5108025506980003',
    noKK: '5108022011150005',
    noHandphone: '081338123456',
    noBpjsKes: '0009876543210',
    noBpjsTk: '18037462512',
    birthPlace: 'Klungkung',
    birthDate: '1998-06-15',
    motherFullName: 'Ni Nyoman Astuti',
    lastEducation: 'SMK Perhotelan',
    address: 'Jungutbatu, Nusa Lembongan, Bali',
    email: 'sri.wahyuni@aquanusa.co.id',
    emergencyContact: 'I Ketut Pasek',
    relationship: 'Father',
    references: 'Direct Application',
    alBalance: 8,
    dpBalance: 1,
    signDate: '2026-05-10',
    contractEndDate: '2027-05-10',
    outletId: 'O2', // Beach Club
    departmentId: 'D1' // FO
  },
  {
    id: 'EMP003',
    name: 'Muhamad Fauzi',
    position: 'Room Boy',
    startingDate: '2024-01-10',
    gender: 'Male',
    religion: 'Moslem',
    maritalStatus: 'Married',
    nikPassport: '3275031405950002',
    noKK: '3275032509180041',
    noHandphone: '085712345678',
    noBpjsKes: '0004561237890',
    noBpjsTk: '17048123456',
    birthPlace: 'Banyuwangi',
    birthDate: '1995-05-14',
    motherFullName: 'Siti Aminah',
    lastEducation: 'SMA',
    address: 'Nusa Lembongan (Kost Agung)',
    email: 'fauzi@aquanusa.co.id',
    emergencyContact: 'Siti Wardah',
    relationship: 'Wife',
    references: 'Achmad (HK Supervisor Lembongan Cliff)',
    alBalance: 14,
    dpBalance: 0,
    signDate: '2026-01-10',
    contractEndDate: '2027-01-10',
    outletId: 'O4', // Villas
    departmentId: 'D2' // HK
  },
  {
    id: 'EMP004',
    name: 'Christina Maria Sihombing',
    position: 'HR Assistant',
    startingDate: '2025-02-01',
    gender: 'Female',
    religion: 'Christian/Catholic',
    maritalStatus: 'Single',
    nikPassport: '1207214408970002',
    noKK: '1207212003100014',
    noHandphone: '081122334455',
    noBpjsKes: '0003344556677',
    noBpjsTk: '19047326412',
    birthPlace: 'Medan',
    birthDate: '1997-08-04',
    motherFullName: 'Theresia Hutapea',
    lastEducation: 'Sarjana Psikologi',
    address: 'Jl. Raya Lembongan, Klungkung, Bali',
    email: 'maria@aquanusa.co.id',
    emergencyContact: 'Robert Sihombing',
    relationship: 'Father',
    references: 'PT Aqua Nusa Head Office recruitment',
    alBalance: 10,
    dpBalance: 3,
    signDate: '2026-02-01',
    contractEndDate: '2027-02-01',
    outletId: 'O1', // Main
    departmentId: 'D4' // HR
  },
  {
    id: 'EMP005',
    name: 'I Made Yoga Arta',
    position: 'Head Housekeeper',
    startingDate: '2023-08-20',
    gender: 'Male',
    religion: 'Hindu',
    maritalStatus: 'Married',
    nikPassport: '5108021811900002',
    noKK: '5108022412120003',
    noHandphone: '081223344556',
    noBpjsKes: '0002233445566',
    noBpjsTk: '15049382109',
    birthPlace: 'Gianyar',
    birthDate: '1990-11-18',
    motherFullName: 'Ni Made Sukarni',
    lastEducation: 'Diploma 1 Perhotelan',
    address: 'Nusa Ceningan (Kost Green)',
    email: 'made.yoga@aquanusa.co.id',
    emergencyContact: 'Ni Luh Sekar',
    relationship: 'Wife',
    references: 'Direct HR referral',
    alBalance: 15,
    dpBalance: 4,
    signDate: '2025-08-20',
    contractEndDate: '2026-08-20',
    outletId: 'O3', // Marina
    departmentId: 'D2' // HK
  },
  {
    id: 'EMP006',
    name: 'Gede Adi Putra',
    position: 'Chef de Partie',
    startingDate: '2024-11-01',
    gender: 'Male',
    religion: 'Hindu',
    maritalStatus: 'Married',
    nikPassport: '5105021205930005',
    noKK: '5105022010180012',
    noHandphone: '081999888777',
    noBpjsKes: '0007788990011',
    noBpjsTk: '16049382710',
    birthPlace: 'Semarapura',
    birthDate: '1993-05-12',
    motherFullName: 'Ni Wayan Kanti',
    lastEducation: 'Diploma 2 Tata Boga',
    address: 'Jungutbatu, Nusa Lembongan',
    email: 'adi.putra@aquanusa.co.id',
    emergencyContact: 'Ni Nyoman Sari',
    relationship: 'Wife',
    references: 'Chef Ketut (Kuta Seafood Grill)',
    alBalance: 12,
    dpBalance: 1,
    signDate: '2025-11-01',
    contractEndDate: '2026-11-01',
    outletId: 'O2', // Beach Club
    departmentId: 'D3' // Food & Beverage
  },
  {
    id: 'EMP007',
    name: 'Siti Rahmawati',
    position: 'F&B Cashier',
    startingDate: '2025-07-15',
    gender: 'Female',
    religion: 'Moslem',
    maritalStatus: 'Single',
    nikPassport: '3509214710990003',
    noKK: '3509212002160021',
    noHandphone: '089887766554',
    noBpjsKes: '0006677889900',
    noBpjsTk: '18042938102',
    birthPlace: 'Jember',
    birthDate: '1999-10-07',
    motherFullName: 'Khodijah',
    lastEducation: 'SMA',
    address: 'Jungutbatu, Nusa Lembongan',
    email: 'siti.rahma@aquanusa.co.id',
    emergencyContact: 'Ahmad Muzakki',
    relationship: 'Brother',
    references: 'Direct Agency',
    alBalance: 11,
    dpBalance: 2,
    signDate: '2025-07-15',
    contractEndDate: '2026-07-15',
    outletId: 'O3', // Marina
    departmentId: 'D3' // F&B
  },
  {
    id: 'EMP008',
    name: 'I Ketut Darmawan',
    position: 'Chief Maintenance',
    startingDate: '2022-04-10',
    gender: 'Male',
    religion: 'Hindu',
    maritalStatus: 'Married',
    nikPassport: '5108021508880004',
    noKK: '5108022010110002',
    noHandphone: '08123999111',
    noBpjsKes: '0001020304050',
    noBpjsTk: '12049182374',
    birthPlace: 'Singaraja',
    birthDate: '1988-08-15',
    motherFullName: 'Ni Ketut Sunastri',
    lastEducation: 'STM Teknik Elektro',
    address: 'Jl. Lembongan Indah, Nusa Lembongan',
    email: 'darmawan@aquanusa.co.id',
    emergencyContact: 'Ni Wayan Desi',
    relationship: 'Wife',
    references: 'Pak Wayan (Lembongan Dive Center)',
    alBalance: 16,
    dpBalance: 5,
    signDate: '2026-04-10',
    contractEndDate: '2027-04-10',
    outletId: 'O1', // Main
    departmentId: 'D5' // Maintenance
  }
];

export const INITIAL_RESIGNED_EMPLOYEES: ResignedEmployee[] = [
  {
    id: 'RES001',
    name: 'I Ketut Astawa',
    position: 'Waiter',
    startingDate: '2023-01-15',
    resignationDate: '2026-04-30',
    reason: 'Pindah kerja ke daratan utama Bali',
    gender: 'Male',
    religion: 'Hindu',
    outletId: 'O2',
    departmentId: 'D3'
  },
  {
    id: 'RES002',
    name: 'Ni Nyoman Citra',
    position: 'Spa Therapist',
    startingDate: '2024-05-10',
    resignationDate: '2026-05-15',
    reason: 'Urusan keluarga / menikah',
    gender: 'Female',
    religion: 'Hindu',
    outletId: 'O3',
    departmentId: 'D3'
  }
];

export const INITIAL_TRAINEE_EMPLOYEES: TraineeEmployee[] = [
  {
    id: 'TRN001',
    name: 'Kadek Dwi Saputra',
    position: 'Trainee Front Office',
    startingDate: '2026-05-01',
    durationMonths: 6,
    gender: 'Male',
    religion: 'Hindu',
    outletId: 'O1',
    departmentId: 'D1'
  },
  {
    id: 'TRN002',
    name: 'Ni Luh Putu Devi',
    position: 'Trainee Housekeeping',
    startingDate: '2026-05-15',
    durationMonths: 3,
    gender: 'Female',
    religion: 'Hindu',
    outletId: 'O2',
    departmentId: 'D2'
  }
];

export const INITIAL_PROBATION_EMPLOYEES: ProbationEmployee[] = [
  {
    id: 'PRB001',
    name: 'Agus Setiawan',
    position: 'DW Housekeeping',
    startingDate: '2026-04-01',
    probationEndDate: '2026-07-01',
    gender: 'Male',
    religion: 'Moslem',
    outletId: 'O2',
    departmentId: 'D2'
  },
  {
    id: 'PRB002',
    name: 'Sarah Claudia',
    position: 'DW Receptionist',
    startingDate: '2026-05-01',
    probationEndDate: '2026-08-01',
    gender: 'Female',
    religion: 'Christian/Catholic',
    outletId: 'O1',
    departmentId: 'D1'
  }
];

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
 * Gets the number of holidays applicable to an employee based on their religion in 2026.
 * Rule: Government holidays apply to EVERY employee, and division-specific holidays apply to employees of that religion.
 */
export function calculateEmployeePublicHolidaysCount(religion: string, holidays: PublicHoliday[]): number {
  let count = 0;
  holidays.forEach(h => {
    // Government is for everyone
    if (h.category === 'Government') {
      count++;
    } else if (h.category === 'Christian/Catholic' && religion === 'Christian/Catholic') {
      count++;
    } else if (h.category === 'Hindu' && religion === 'Hindu') {
      count++;
    } else if (h.category === 'Moslem' && religion === 'Moslem') {
      count++;
    }
  });
  return count;
}

/**
 * Checks if a specific date is a Public Holiday applicable to this employee based on religion
 */
export function isDatePHForEmployee(dateStr: string, religion: string, holidays: PublicHoliday[]): boolean {
  return holidays.some(h => {
    if (h.date !== dateStr) return false;
    return h.category === 'Government' || h.category === religion;
  });
}

/**
 * Calculate dynamic schedule metrics like al- (taking AL), dp- (taking DP), and dp+ (working on a PH date)
 */
export function calculateRosterStats(
  dates: { [dateStr: string]: string },
  religion: string,
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
      if (isDatePHForEmployee(dateStr, religion, holidays)) {
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
    const stats = calculateRosterStats(datesData, emp.religion, holidaysReference);
    
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
