/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  PublicHoliday,
  DepartmentSchedule,
  Outlet,
  Department,
  RoleType,
  UserSession,
  SchedulePeriod,
  ResignedEmployee,
  TraineeEmployee,
  ProbationEmployee,
  HolidayCategory
} from '../types';
import {
  calculateEmployeePublicHolidaysCount,
  calculateMonthsWorked,
  calculateRosterStats,
  getDefaultPublicHolidayCategory
} from '../utils/initialData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface HRContextProps {
  employees: Employee[];
  resignedEmployees: ResignedEmployee[];
  traineeEmployees: TraineeEmployee[];
  probationEmployees: ProbationEmployee[];
  publicHolidays: PublicHoliday[];
  schedules: DepartmentSchedule[];
  outlets: Outlet[];
  departments: Department[];
  currentPeriod: SchedulePeriod;
  userSession: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Simulated State Handlers
  setRole: (role: RoleType, departmentId?: string, outletId?: string) => void;
  login: (role: RoleType) => void;
  logout: () => void;
  
  // Database handlers
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  batchImportEmployees: (emps: Partial<Employee>[]) => number;
  transferEmployee: (employeeId: string, targetDeptId: string, targetOutletId?: string) => void;

  // New Table Handlers
  addResignedEmployee: (emp: Omit<ResignedEmployee, 'id'>) => ResignedEmployee;
  deleteResignedEmployee: (id: string) => void;
  addTraineeEmployee: (emp: Omit<TraineeEmployee, 'id'>) => TraineeEmployee;
  deleteTraineeEmployee: (id: string) => void;
  addProbationEmployee: (emp: Omit<ProbationEmployee, 'id'>) => ProbationEmployee;
  deleteProbationEmployee: (id: string) => void;

  // Outlets & Departments
  addOutlet: (name: string) => Promise<void>;
  editOutletContext: (id: string, name: string) => Promise<void>;
  deleteOutletContext: (id: string) => Promise<void>;
  addDepartment: (name: string) => Promise<void>;
  editDepartment: (id: string, name: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  
  // Holidays Handlers
  addPublicHoliday: (ph: Omit<PublicHoliday, 'id'>) => Promise<void>;
  deletePublicHoliday: (id: string) => Promise<void>;
  addExtraPH: (name: string, date: string, category: 'Government' | 'Christian/Catholic' | 'Hindu' | 'Moslem') => Promise<void>;
  clearPublicHolidays: () => Promise<void>;
  addWebOperator: (data: { user_id: string, password: string, role: string, name: string, departmentScope: string, outletScope: string, status: 'Active' | 'Non-active', lastActive: string }) => Promise<void>;
  
  // Schedule handlers
  batchUpdateSchedule: (
    departmentId: string,
    periodId: string,
    updates: { employeeId: string; dateStr: string; shiftVal: string }[]
  ) => void;
  updateSchedule: (departmentId: string, periodId: string, employeeId: string, dateStr: string, shiftVal: string) => void;
  updateScheduleLeaverBalances: (
    departmentId: string,
    periodId: string,
    employeeId: string,
    balances: { alPrev?: number; alMinus?: number; alPlus?: number; dpPrev?: number; dpMinus?: number; dpPlus?: number }
  ) => void;
  
  // System overrides
  refreshData: () => Promise<void>;
  updateFullDatabase: (rawState: {
    employees: Employee[];
    resignedEmployees: ResignedEmployee[];
    traineeEmployees: TraineeEmployee[];
    probationEmployees: ProbationEmployee[];
    publicHolidays: PublicHoliday[];
    schedules: DepartmentSchedule[];
    outlets: Outlet[];
    departments: Department[];
  }) => void;
  
  // Calculations helper in context
  getAccruedALCount: (emp: Employee) => number;
  getPHCount: (emp: Employee) => number;
  getCombinedALDPCount: (emp: Employee) => number;
}

const HRContext = createContext<HRContextProps | undefined>(undefined);



export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Configured default period: June 26, 2026 to July 25, 2026
  const currentPeriod: SchedulePeriod = {
    id: '2026-06-26_2026-07-25',
    name: 'Periode Roster 26 Jun - 25 Jul 2026',
    startDate: '2026-06-26',
    endDate: '2026-07-25'
  };

  // State loading from Local/Firestore
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [resignedEmployees, setResignedEmployees] = useState<ResignedEmployee[]>([]);
  const [traineeEmployees, setTraineeEmployees] = useState<TraineeEmployee[]>([]);
  const [probationEmployees, setProbationEmployees] = useState<ProbationEmployee[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [schedules, setSchedules] = useState<DepartmentSchedule[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  // Consolidated session and auth state
  const [sessionData, setSessionData] = useState<{
    userSession: UserSession | null;
    isAuthenticated: boolean;
  }>(() => {
    try {
      const savedAuth = localStorage.getItem('aquanusa_auth_v1') === 'true';
      if (!savedAuth) return { userSession: null, isAuthenticated: false };

      const saved = localStorage.getItem('aquanusa_session_v1');
      if (saved && typeof saved === 'string' && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.role) {
          return { userSession: parsed, isAuthenticated: true };
        }
      }
    } catch (e) {
      console.error("Failed to parse session during initialization", e);
      localStorage.removeItem('aquanusa_session_v1');
      localStorage.setItem('aquanusa_auth_v1', 'false');
    }
    return { userSession: null, isAuthenticated: false };
  });

  const userSession = sessionData.userSession;
  const isAuthenticated = sessionData.isAuthenticated;

  const setUserSession = (session: UserSession | null) => {
    setSessionData({ 
      userSession: session, 
      isAuthenticated: !!session 
    });
  };

  const setIsAuthenticated = (auth: boolean) => {
    setSessionData(prev => ({ 
      ...prev, 
      isAuthenticated: auth 
    }));
  };

  // Persist session to local storage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('aquanusa_session_v1', JSON.stringify(userSession));
      localStorage.setItem('aquanusa_auth_v1', 'true');
    } else {
      localStorage.removeItem('aquanusa_session_v1');
      localStorage.setItem('aquanusa_auth_v1', 'false');
    }
  }, [userSession]);

  // Sync with Firestore as the single source of truth
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAndSyncFirestore = async () => {
      try {
        // Load active employees — no seeding if empty
        const empsSnap = await getDocs(collection(db, 'employees'));
        if (!empsSnap.empty) {
          const lEmps = empsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Employee));
          setEmployees(lEmps);
        }

        // Load resigned employees — no seeding if empty
        const resSnap = await getDocs(collection(db, 'resigned_employees'));
        if (!resSnap.empty) {
          const lRes = resSnap.docs.map(d => ({ ...d.data(), id: d.id } as ResignedEmployee));
          setResignedEmployees(lRes);
        }

        // Load trainees — no seeding if empty
        const traineeSnap = await getDocs(collection(db, 'trainee_employees'));
        if (!traineeSnap.empty) {
          const lTrn = traineeSnap.docs.map(d => ({ ...d.data(), id: d.id } as TraineeEmployee));
          setTraineeEmployees(lTrn);
        }

        // Load probation — no seeding if empty
        const probSnap = await getDocs(collection(db, 'probation_employees'));
        if (!probSnap.empty) {
          const lPrb = probSnap.docs.map(d => ({ ...d.data(), id: d.id } as ProbationEmployee));
          setProbationEmployees(lPrb);
        }

        // Load schedules
        const schedSnap = await getDocs(collection(db, 'schedules'));
        if (!schedSnap.empty) {
          const lSched = schedSnap.docs.map(d => ({ ...d.data(), id: d.id } as DepartmentSchedule));
          setSchedules(lSched);
        }

        // Load outlets
        const outSnap = await getDocs(collection(db, 'outlets'));
        if (!outSnap.empty) {
          const lOut = outSnap.docs.map(d => ({ ...d.data(), id: d.id } as Outlet));
          setOutlets(lOut);
        }

        // Load depts
        const deptSnap = await getDocs(collection(db, 'departments'));
        if (!deptSnap.empty) {
          const lDept = deptSnap.docs.map(d => ({ ...d.data(), id: d.id } as Department));
          setDepartments(lDept);
        }

        // Load public holidays
        const phSnap = await getDocs(collection(db, 'public_holidays'));
        if (!phSnap.empty) {
          const lPh = phSnap.docs.map(d => ({ ...d.data(), id: d.id } as PublicHoliday));
          setPublicHolidays(lPh);
        }

      } catch (err) {
        console.warn("Firestore sync offline or terms not completed yet.", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSyncFirestore();
  }, []);

  const login = (role: RoleType) => {
    const session: UserSession = { 
      role, 
      departmentId: 'D1', // Default access
      outletId: 'O1'     // Default access
    };
    setUserSession(session);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserSession(null);
    setIsAuthenticated(false);
  };

  const setRole = (role: RoleType, departmentId?: string, outletId?: string) => {
    setUserSession({ role, departmentId, outletId });
  };

  const getAccruedALCount = (emp: Employee): number => {
    const months = calculateMonthsWorked(emp.startingDate, '2026-06-15');
    return months >= 1 ? Math.floor(months) : 0;
  };

  const getPHCount = (emp: Employee): number => {
    return calculateEmployeePublicHolidaysCount(emp.publicHolidayCategory ?? getDefaultPublicHolidayCategory(emp.religion), publicHolidays);
  };

  const getCombinedALDPCount = (emp: Employee): number => {
    return emp.alBalance + emp.dpBalance;
  };

  const fireStoreSave = async (col: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, col, id), data);
    } catch (e) {
      console.error(`Firestore save to ${col}/${id} failed!`, e);
      throw e; // Rethrow to let caller handle it
    }
  };

  // Firebase integration helper for deleting objects
  const fireStoreDelete = async (col: string, id: string) => {
    try {
      await deleteDoc(doc(db, col, id));
    } catch (e) {
      console.error(`Firestore delete of ${col}/${id} failed!`, e);
      throw e; // Rethrow to let caller handle it
    }
  };

  // Handlers for ACTIVE Employees
  const addEmployee = (newEmpData: Omit<Employee, 'id'>): Employee => {
    const id = `EMP${String(employees.length + 1).padStart(3, '0')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp: Employee = { ...newEmpData, id };
    const nextEmployees = [...employees, newEmp];
    setEmployees(nextEmployees);
    
    const nextSchedules = schedules.map(sched => {
      if (sched.departmentId === newEmp.departmentId && sched.periodId === currentPeriod.id) {
        return {
          ...sched,
          entries: {
            ...sched.entries,
            [id]: {
              employeeId: id,
              dates: {},
              alPrev: newEmp.alBalance,
              alMinus: 0,
              alPlus: 0,
              dpPrev: newEmp.dpBalance,
              dpMinus: 0,
              dpPlus: 0
            }
          }
        };
      }
      return sched;
    });

    setSchedules(nextSchedules);
    
    // Attempt Firebase sync
    fireStoreSave('employees', id, newEmp);
    return newEmp;
  };

  const updateEmployee = (updatedEmp: Employee) => {
    const nextEmployees = employees.map(emp => (emp.id === updatedEmp.id ? updatedEmp : emp));
    setEmployees(nextEmployees);
    
    const nextSchedules = schedules.map(sched => {
      if (sched.periodId === currentPeriod.id && sched.entries[updatedEmp.id]) {
        return {
          ...sched,
          entries: {
            ...sched.entries,
            [updatedEmp.id]: {
              ...sched.entries[updatedEmp.id],
              alPrev: updatedEmp.alBalance,
              dpPrev: updatedEmp.dpBalance
            }
          }
        };
      }
      return sched;
    });

    setSchedules(nextSchedules);
    
    fireStoreSave('employees', updatedEmp.id, updatedEmp);
  };

  const deleteEmployee = (id: string) => {
    const nextEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(nextEmployees);
    const nextSchedules = schedules.map(sched => {
      const entriesCopy = { ...sched.entries };
      delete entriesCopy[id];
      return { ...sched, entries: entriesCopy };
    });
    setSchedules(nextSchedules);
    
    fireStoreDelete('employees', id);
  };

  // Handlers for RESIGNED Employees (Tabel Karyawan Resign)
  const addResignedEmployee = (newResData: Omit<ResignedEmployee, 'id'>): ResignedEmployee => {
    const id = `RES${String(resignedEmployees.length + 1).padStart(3, '0')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes: ResignedEmployee = { ...newResData, id };
    const nextResigned = [...resignedEmployees, newRes];
    setResignedEmployees(nextResigned);
    
    fireStoreSave('resigned_employees', id, newRes);
    return newRes;
  };

  const deleteResignedEmployee = (id: string) => {
    const nextResigned = resignedEmployees.filter(emp => emp.id !== id);
    setResignedEmployees(nextResigned);
    
    fireStoreDelete('resigned_employees', id);
  };

  // Handlers for TRAINEES (Tabel Trainee)
  const addTraineeEmployee = (newTrnData: Omit<TraineeEmployee, 'id'>): TraineeEmployee => {
    const id = `TRN${String(traineeEmployees.length + 1).padStart(3, '0')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newTrn: TraineeEmployee = { ...newTrnData, id };
    const nextTrainees = [...traineeEmployees, newTrn];
    setTraineeEmployees(nextTrainees);
    
    fireStoreSave('trainee_employees', id, newTrn);
    return newTrn;
  };

  const deleteTraineeEmployee = (id: string) => {
    const nextTrainees = traineeEmployees.filter(emp => emp.id !== id);
    setTraineeEmployees(nextTrainees);
    
    fireStoreDelete('trainee_employees', id);
  };

  // Handlers for PROBATION Employees (Tabel Karyawan Probation)
  const addProbationEmployee = (newProbData: Omit<ProbationEmployee, 'id'>): ProbationEmployee => {
    const id = `PRB${String(probationEmployees.length + 1).padStart(3, '0')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newProb: ProbationEmployee = { ...newProbData, id };
    const nextProbation = [...probationEmployees, newProb];
    setProbationEmployees(nextProbation);
    
    fireStoreSave('probation_employees', id, newProb);
    return newProb;
  };

  const deleteProbationEmployee = (id: string) => {
    const nextProbation = probationEmployees.filter(emp => emp.id !== id);
    setProbationEmployees(nextProbation);
    
    fireStoreDelete('probation_employees', id);
  };

  const addOutlet = async (name: string) => {
    const id = `O${outlets.length + 1}_${Date.now()}`;
    const newOutlet: Outlet = { id, name };
    const nextOutlets = [...outlets, newOutlet];
    setOutlets(nextOutlets);
    try {
      await fireStoreSave('outlets', id, newOutlet);
    } catch (e) {
      console.error(`DEBUG: Failed to save outlet ${id}:`, e);
      throw e;
    }
  };

  const editOutletContext = async (id: string, name: string) => {
    console.log(`DEBUG: editOutletContext called for ${id}, name: ${name}. Current outlets:`, outlets);
    const nextOutlets = outlets.map(o => o.id === id ? { ...o, name } : o);
    setOutlets(nextOutlets);
    try {
      await fireStoreSave('outlets', id, { id, name });
    } catch (e) {
      console.error(`DEBUG: Failed to edit outlet ${id}:`, e);
      throw e;
    }
  };

  const deleteOutletContext = async (id: string) => {
    console.log(`DEBUG: deleteOutletContext called for ${id}. Current outlets:`, outlets);
    try {
      const nextOutlets = outlets.filter(o => o.id !== id);
      setOutlets(nextOutlets);
      await fireStoreDelete('outlets', id);
      console.log(`DEBUG: Outlet ${id} deleted successfully.`);
    } catch (e) {
      console.error(`DEBUG: Failed to delete outlet ${id}:`, e);
      // Re-fetch what outlets should be if delete failed
      // Or just keep the current state
      throw e;
    }
  };

  const addDepartment = async (name: string) => {
    const id = `D${departments.length + 1}_${Date.now()}`;
    const newDept: Department = { id, name };
    const nextDepts = [...departments, newDept];
    setDepartments(nextDepts);
    
    // Auto-create of empty schedule structure for this department
    const newSched: DepartmentSchedule = {
      id: `SCHED_${id}_${currentPeriod.id}`,
      periodId: currentPeriod.id,
      departmentId: id,
      entries: {}
    };
    const nextSchedules = [...schedules, newSched];
    setSchedules(nextSchedules);

    await fireStoreSave('departments', id, newDept);
    await fireStoreSave('schedules', newSched.id, newSched);
  };

  const editDepartment = async (id: string, name: string) => {
    const nextDepts = departments.map(d => d.id === id ? { ...d, name } : d);
    setDepartments(nextDepts);
    await fireStoreSave('departments', id, { id, name });
  };

  const deleteDepartment = async (id: string) => {
    const nextDepts = departments.filter(d => d.id !== id);
    setDepartments(nextDepts);
    
    const nextSchedules = schedules.filter(s => s.departmentId !== id);
    setSchedules(nextSchedules);

    await fireStoreDelete('departments', id);
  };

  const batchImportEmployees = (incoming: Partial<Employee>[]): number => {
    let importedCount = 0;
    const nextEmployees = [...employees];
    const nextSchedules = [...schedules];

    incoming.forEach(partial => {
      if (!partial.name) return;
      const countIndex = nextEmployees.length + 1;
      const id = `EMP${String(countIndex).padStart(3, '0')}_${Math.floor(1000 + Math.random() * 9000)}`;
      
      const fullEmp: Employee = {
        id,
        name: partial.name,
        position: partial.position || 'Staff',
        startingDate: partial.startingDate || '2026-01-01',
        gender: partial.gender || 'Male',
        religion: partial.religion || 'Other',
        maritalStatus: partial.maritalStatus || 'Single',
        nikPassport: partial.nikPassport || '-',
        noKK: partial.noKK || '-',
        noHandphone: partial.noHandphone || '-',
        noBpjsKes: partial.noBpjsKes || '-',
        noBpjsTk: partial.noBpjsTk || '-',
        birthPlace: partial.birthPlace || '-',
        birthDate: partial.birthDate || '1995-01-01',
        motherFullName: partial.motherFullName || '-',
        lastEducation: partial.lastEducation || 'SMA/SMK',
        address: partial.address || 'Nusa Lembongan',
        email: partial.email || `${(partial.name || 'user').toLowerCase().replace(/\s+/g, '')}@aquanusa.co.id`,
        emergencyContact: partial.emergencyContact || '-',
        relationship: partial.relationship || '-',
        references: partial.references || '-',
        alBalance: partial.alBalance !== undefined ? partial.alBalance : 12,
        dpBalance: partial.dpBalance !== undefined ? partial.dpBalance : 0,
        signDate: partial.signDate || '2026-01-01',
        contractEndDate: partial.contractEndDate || '2027-01-01',
        outletId: partial.outletId || 'O1',
        departmentId: partial.departmentId || 'D1'
      };

      nextEmployees.push(fullEmp);
      importedCount++;

      // Create schedule entry
      const deptId = fullEmp.departmentId;
      const schedIndex = nextSchedules.findIndex(s => s.departmentId === deptId && s.periodId === currentPeriod.id);
      if (schedIndex !== -1) {
        nextSchedules[schedIndex] = {
          ...nextSchedules[schedIndex],
          entries: {
            ...nextSchedules[schedIndex].entries,
            [id]: {
              employeeId: id,
              dates: {},
              alPrev: fullEmp.alBalance,
              alMinus: 0,
              alPlus: 0,
              dpPrev: fullEmp.dpBalance,
              dpMinus: 0,
              dpPlus: 0
            }
          }
        };
      }
      fireStoreSave('employees', id, fullEmp);
    });

    setEmployees(nextEmployees);
    setSchedules(nextSchedules);
    return importedCount;
  };

  const transferEmployee = (employeeId: string, targetDeptId: string, targetOutletId?: string) => {
    const nextEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        const u = {
          ...emp,
          departmentId: targetDeptId,
          outletId: targetOutletId || emp.outletId
        };
        fireStoreSave('employees', employeeId, u);
        return u;
      }
      return emp;
    });

    const movedEmp = employees.find(e => e.id === employeeId);
    if (!movedEmp) return;

    const oldDeptId = movedEmp.departmentId;
    const nextSchedules = schedules.map(sched => {
      if (sched.departmentId === oldDeptId && sched.periodId === currentPeriod.id) {
        const nextEntries = { ...sched.entries };
        delete nextEntries[employeeId];
        return { ...sched, entries: nextEntries };
      }
      if (sched.departmentId === targetDeptId && sched.periodId === currentPeriod.id) {
        const nextEntries = { ...sched.entries };
        if (!nextEntries[employeeId]) {
          nextEntries[employeeId] = {
            employeeId,
            dates: {},
            alPrev: movedEmp.alBalance,
            alMinus: 0,
            alPlus: 0,
            dpPrev: movedEmp.dpBalance,
            dpMinus: 0,
            dpPlus: 0
          };
        }
        return { ...sched, entries: nextEntries };
      }
      return sched;
    });

    setEmployees(nextEmployees);
    setSchedules(nextSchedules);
  };

  const addPublicHoliday = async (newPh: Omit<PublicHoliday, 'id'>) => {
    const id = `PH_CUSTOM_${Date.now()}`;
    const completeHoliday: PublicHoliday = { ...newPh, id };
    const nextHolidays = [...publicHolidays, completeHoliday];
    setPublicHolidays(nextHolidays);
    
    try {
      await fireStoreSave('public_holidays', id, completeHoliday);
    } catch (err) {
      console.error(`Failed to save public holiday ${id}:`, err);
      setPublicHolidays(publicHolidays);
      throw err;
    }
  };

  const deletePublicHoliday = async (id: string) => {
    const nextHolidays = publicHolidays.filter(p => p.id !== id);
    setPublicHolidays(nextHolidays);
    
    try {
      await fireStoreDelete('public_holidays', id);
    } catch (err) {
      console.error(`Failed to delete public holiday ${id}:`, err);
      setPublicHolidays(publicHolidays);
      throw err;
    }
  };

  const clearPublicHolidays = async () => {
    try {
      const phSnap = await getDocs(collection(db, 'public_holidays'));
      const deletePromises = phSnap.docs.map((docSnap) => fireStoreDelete('public_holidays', docSnap.id));
      await Promise.all(deletePromises);
      setPublicHolidays([]);
    } catch (err) {
      console.error('Failed to clear public holidays:', err);
      throw err;
    }
  };

  const addExtraPH = async (name: string, date: string, category: 'Government' | 'Christian/Catholic' | 'Hindu' | 'Moslem') => {
    const id = `PH_EXTRA_${Date.now()}`;
    const completePh = {
      id,
      name: `${name} (Extra Cutber)`,
      date,
      category,
      isExtra: true,
      year: parseInt(date.split('-')[0]) || 2026
    };
    const nextHolidays = [...publicHolidays, completePh];
    setPublicHolidays(nextHolidays);
    
    try {
      await fireStoreSave('public_holidays', id, completePh);
    } catch (err) {
      console.error(`Failed to save extra public holiday ${id}:`, err);
      setPublicHolidays(publicHolidays);
      throw err;
    }
  };

  const batchUpdateSchedule = (
    departmentId: string,
    periodId: string,
    updates: { employeeId: string; dateStr: string; shiftVal: string }[]
  ) => {
    setSchedules(prevSchedules => {
      const schedIndex = prevSchedules.findIndex(s => s.departmentId === departmentId && s.periodId === periodId);
      if (schedIndex === -1) return prevSchedules;

      const targetSched = prevSchedules[schedIndex];
      const nextEntries = { ...targetSched.entries };

      updates.forEach(({ employeeId, dateStr, shiftVal }) => {
        const employeeEntry = nextEntries[employeeId] || {
          employeeId,
          dates: {},
          alPrev: 12, alMinus: 0, alPlus: 0,
          dpPrev: 0, dpMinus: 0, dpPlus: 0
        };

        const updatedDates = { ...employeeEntry.dates, [dateStr]: shiftVal };
        const employeeObj = employees.find(e => e.id === employeeId);
        const phCategory = employeeObj?.publicHolidayCategory ?? getDefaultPublicHolidayCategory(employeeObj?.religion ?? 'Other');

        const stats = calculateRosterStats(updatedDates, phCategory, publicHolidays);

        nextEntries[employeeId] = {
          ...employeeEntry,
          dates: updatedDates,
          alMinus: stats.alMinus,
          dpMinus: stats.dpMinus,
          dpPlus: stats.dpPlus
        };
      });

      const uSched = { ...targetSched, entries: nextEntries };
      const nextSchedules = [...prevSchedules];
      nextSchedules[schedIndex] = uSched;

      fireStoreSave('schedules', uSched.id, uSched);
      return nextSchedules;
    });
  };

  const updateSchedule = (
    departmentId: string,
    periodId: string,
    employeeId: string,
    dateStr: string,
    shiftVal: string
  ) => {
    const nextSchedules = schedules.map(sched => {
      if (sched.departmentId === departmentId && sched.periodId === periodId) {
        const employeeEntry = sched.entries[employeeId] || {
          employeeId,
          dates: {},
          alPrev: 12,
          alMinus: 0,
          alPlus: 0,
          dpPrev: 0,
          dpMinus: 0,
          dpPlus: 0
        };

        const updatedDates = { ...employeeEntry.dates, [dateStr]: shiftVal };
        const employeeObj = employees.find(e => e.id === employeeId);
        const publicHolidayCategory = employeeObj?.publicHolidayCategory ?? getDefaultPublicHolidayCategory(employeeObj?.religion ?? 'Other');

        const stats = calculateRosterStats(updatedDates, publicHolidayCategory, publicHolidays);

        const updatedEntry = {
          ...employeeEntry,
          dates: updatedDates,
          alMinus: stats.alMinus,
          dpMinus: stats.dpMinus,
          dpPlus: stats.dpPlus
        };

        const uSched = {
          ...sched,
          entries: {
            ...sched.entries,
            [employeeId]: updatedEntry
          }
        };

        fireStoreSave('schedules', uSched.id, uSched);
        return uSched;
      }
      return sched;
    });

    setSchedules(nextSchedules);
  };

  const updateScheduleLeaverBalances = (
    departmentId: string,
    periodId: string,
    employeeId: string,
    balances: { alPrev?: number; alMinus?: number; alPlus?: number; dpPrev?: number; dpMinus?: number; dpPlus?: number }
  ) => {
    const nextSchedules = schedules.map(sched => {
      if (sched.departmentId === departmentId && sched.periodId === periodId) {
        const employeeEntry = sched.entries[employeeId] || {
          employeeId,
          dates: {},
          alPrev: 12,
          alMinus: 0,
          alPlus: 0,
          dpPrev: 0,
          dpMinus: 0,
          dpPlus: 0
        };

        const updatedEntry = {
          ...employeeEntry,
          ...balances
        };

        const uSched = {
          ...sched,
          entries: {
            ...sched.entries,
            [employeeId]: updatedEntry
          }
        };

        fireStoreSave('schedules', uSched.id, uSched);
        return uSched;
      }
      return sched;
    });

    setSchedules(nextSchedules);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const empsSnap = await getDocs(collection(db, 'employees'));
      if (!empsSnap.empty) {
        setEmployees(empsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Employee)));
      }

      const resSnap = await getDocs(collection(db, 'resigned_employees'));
      if (!resSnap.empty) {
        setResignedEmployees(resSnap.docs.map(d => ({ ...d.data(), id: d.id } as ResignedEmployee)));
      }

      const traineeSnap = await getDocs(collection(db, 'trainee_employees'));
      if (!traineeSnap.empty) {
        setTraineeEmployees(traineeSnap.docs.map(d => ({ ...d.data(), id: d.id } as TraineeEmployee)));
      }

      const probSnap = await getDocs(collection(db, 'probation_employees'));
      if (!probSnap.empty) {
        setProbationEmployees(probSnap.docs.map(d => ({ ...d.data(), id: d.id } as ProbationEmployee)));
      }

      const schedSnap = await getDocs(collection(db, 'schedules'));
      if (!schedSnap.empty) {
        setSchedules(schedSnap.docs.map(d => ({ ...d.data(), id: d.id } as DepartmentSchedule)));
      }

      const outSnap = await getDocs(collection(db, 'outlets'));
      if (!outSnap.empty) {
        setOutlets(outSnap.docs.map(d => ({ ...d.data(), id: d.id } as Outlet)));
      }

      const deptSnap = await getDocs(collection(db, 'departments'));
      if (!deptSnap.empty) {
        setDepartments(deptSnap.docs.map(d => ({ ...d.data(), id: d.id } as Department)));
      }

      const phSnap = await getDocs(collection(db, 'public_holidays'));
      if (!phSnap.empty) {
        setPublicHolidays(phSnap.docs.map(d => ({ ...d.data(), id: d.id } as PublicHoliday)));
      }
    } catch (err) {
      console.warn("Refresh from Firestore failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFullDatabase = (rawState: any) => {
    if (rawState.employees) setEmployees(rawState.employees);
    if (rawState.resignedEmployees) setResignedEmployees(rawState.resignedEmployees);
    if (rawState.traineeEmployees) setTraineeEmployees(rawState.traineeEmployees);
    if (rawState.probationEmployees) setProbationEmployees(rawState.probationEmployees);
    if (rawState.publicHolidays) setPublicHolidays(rawState.publicHolidays);
    if (rawState.schedules) setSchedules(rawState.schedules);
    if (rawState.outlets) setOutlets(rawState.outlets);
    if (rawState.departments) setDepartments(rawState.departments);
  };

  const addWebOperator = async (data: { user_id: string, password: string, role: string, name: string, departmentScope: string, outletScope: string, status: 'Active' | 'Non-active', lastActive: string }) => {
    const id = `OP_${data.user_id}_${Date.now()}`;
    await fireStoreSave('web_operators', id, {
      ...data,
      id: data.user_id
    });
  };

  return (
    <HRContext.Provider
      value={{
        employees,
        resignedEmployees,
        traineeEmployees,
        probationEmployees,
        publicHolidays,
        schedules,
        outlets,
        departments,
        currentPeriod,
        userSession,
        isAuthenticated,
        isLoading,
        
        login,
        logout,
        setRole,
        
        addEmployee,
        updateEmployee,
        deleteEmployee,
        batchImportEmployees,
        transferEmployee,

        addResignedEmployee,
        deleteResignedEmployee,
        addTraineeEmployee,
        deleteTraineeEmployee,
        addProbationEmployee,
        deleteProbationEmployee,

        addOutlet,
        editOutletContext,
        deleteOutletContext,
        addDepartment,
        editDepartment,
        deleteDepartment,
        
        addPublicHoliday,
        deletePublicHoliday,
        addExtraPH,
        clearPublicHolidays,
        addWebOperator,
        
        batchUpdateSchedule,
        updateSchedule,
        updateScheduleLeaverBalances,
        
        refreshData,
        updateFullDatabase,
        
        getAccruedALCount,
        getPHCount,
        getCombinedALDPCount
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
