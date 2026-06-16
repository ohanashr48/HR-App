/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ReligionType = 'Hindu' | 'Moslem' | 'Christian/Catholic' | 'Buddhist' | 'Other';
export type GenderType = 'Male' | 'Female';
export type MaritalStatusType = 'Single' | 'Married' | 'Divorced';

export type HolidayCategory = 'Government' | 'Christian/Catholic' | 'Hindu' | 'Moslem';

export interface Employee {
  id: string; // Employee ID or generated UUID
  name: string;
  position: string;
  startingDate: string; // YYYY-MM-DD
  gender: GenderType;
  religion: ReligionType;
  maritalStatus: MaritalStatusType;
  nikPassport: string;
  noKK: string;
  noHandphone: string;
  noBpjsKes: string;
  noBpjsTk: string;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  motherFullName: string;
  lastEducation: string;
  address: string;
  email: string;
  emergencyContact: string; // Name & Phone
  relationship: string; // Relationship of emergency contact
  references: string; // References
  alBalance: number; // Initial/Prev Annual Leave balance
  dpBalance: number; // Initial/Prev Delay Pass balance
  signDate: string; // YYYY-MM-DD (Contract signature date)
  contractEndDate: string; // YYYY-MM-DD (Contract expiration date, automatically 1 year after sign)
  outletId: string;
  departmentId: string;
}

export interface ResignedEmployee {
  id: string;
  name: string;
  position: string;
  startingDate: string;
  resignationDate: string;
  reason: string;
  gender: GenderType;
  religion: ReligionType;
  outletId: string;
  departmentId: string;
}

export interface TraineeEmployee {
  id: string;
  name: string;
  position: string;
  startingDate: string;
  durationMonths: number;
  gender: GenderType;
  religion: ReligionType;
  outletId: string;
  departmentId: string;
}

export interface ProbationEmployee {
  id: string;
  name: string;
  position: string;
  startingDate: string;
  probationEndDate: string;
  gender: GenderType;
  religion: ReligionType;
  outletId: string;
  departmentId: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: HolidayCategory;
  isExtra: boolean; // Extra PH / Cuti Bersama added by HR
  year: number;
}

export interface ScheduleEntry {
  employeeId: string;
  dates: { [dateStr: string]: string }; // Map key is "YYYY-MM-DD", val is shift notation e.g., "P", "S", "M", "OFF", "AL", "DP"
  alPrev: number;
  alMinus: number;
  alPlus: number;
  dpPrev: number;
  dpMinus: number;
  dpPlus: number;
}

export interface DepartmentSchedule {
  id: string; // unique ID
  periodId: string; // e.g. "2026-06-26_2026-07-25"
  departmentId: string;
  entries: { [employeeId: string]: ScheduleEntry };
}

export interface SchedulePeriod {
  id: string; // e.g. "2026-06-26_2026-07-25"
  name: string; // e.g. "Periode 26 Jun - 25 Jul 2026"
  startDate: string; // "2026-06-26"
  endDate: string; // "2026-07-25"
}

export interface Outlet {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export type RoleType = 'super admin' | 'Manager' | 'Maria' | 'HR' | 'head departement';

export interface UserSession {
  role: RoleType;
  departmentId?: string; // If role is head departement, they manage this department
  outletId?: string; // If restricted, only manage this outlet
}
