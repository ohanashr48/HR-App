/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from '../types';

/**
 * Downloads data as a CSV or TSV file.
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  // Prepend UTF-8 BOM so Excel opens it with right encoding and alignment
  const bomContent = content.startsWith('\uFEFF') ? content : '\uFEFF' + content;
  const blob = new Blob([bomContent], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports employee list to CSV/TSV format.
 */
export function exportEmployeesToCSV(employees: Employee[], outletsMap: Record<string, string>, deptMap: Record<string, string>, delimiter: string = ','): string {
  const headers = [
    'NAME', 'POSITION', 'STARTING DATE', 'GENDER', 'RELIGION', 'MARITAL STATUS',
    'NIK/PASSPORT', 'NO KK', 'NO HANDPHONE', 'NO BPJSKES', 'NO BPJSTK',
    'BIRTH PLACE', 'BIRTH DATE', 'MOTHER’S FULL NAME', 'LAST EDUCATION',
    'ADDRESS', 'EMAIL', 'EMERGENCY CONTACT', 'RELATIONSHIP', 'REFERENCES',
    'AL', 'DP', 'AL+DP', 'SIGN DATE', 'CONTRACT END DATE', 'OUTLET', 'DEPARTMENT'
  ];

  const escapeField = (val: any) => {
    const s = val === undefined || val === null ? '' : String(val);
    if (s.includes(delimiter) || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = employees.map(emp => {
    return [
      emp.name,
      emp.position,
      emp.startingDate,
      emp.gender,
      emp.religion,
      emp.maritalStatus,
      emp.nikPassport,
      emp.noKK,
      emp.noHandphone,
      emp.noBpjsKes,
      emp.noBpjsTk,
      emp.birthPlace,
      emp.birthDate,
      emp.motherFullName,
      emp.lastEducation,
      emp.address,
      emp.email,
      emp.emergencyContact,
      emp.relationship,
      emp.references,
      emp.alBalance,
      emp.dpBalance,
      emp.alBalance + emp.dpBalance,
      emp.signDate,
      emp.contractEndDate,
      outletsMap[emp.outletId] || emp.outletId,
      deptMap[emp.departmentId] || emp.departmentId
    ].map(escapeField);
  });

  return [headers.join(delimiter), ...rows.map(row => row.join(delimiter))].join('\n');
}

/**
 * Parses pasted text (TSV from Excel, or standard CSV) into partial objects.
 */
export function parsePastedEmployees(text: string): Partial<Employee>[] {
  if (!text || !text.trim()) return [];

  // Detect delimiter (tab is typical for Excel paste, comma or semicolon for standard CSV)
  let delimiter = '\t';
  if (!text.includes('\t') && text.includes(',')) {
    delimiter = ',';
  } else if (!text.includes('\t') && text.includes(';')) {
    delimiter = ';';
  }

  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().toUpperCase().replace(/’/g, "'"));
  const results: Partial<Employee>[] = [];

  // Map header words to Employee fields
  const getFieldIndex = (words: string[]) => {
    return headers.findIndex(h => words.some(w => h.includes(w)));
  };

  const nameIdx = getFieldIndex(['NAME']);
  const posIdx = getFieldIndex(['POSITION', 'JABATAN']);
  const startIdx = getFieldIndex(['STARTING', 'MASUK', 'START']);
  const genderIdx = getFieldIndex(['GENDER', 'KELAMIN', 'SEX']);
  const religionIdx = getFieldIndex(['RELIGION', 'AGAMA']);
  const maritalIdx = getFieldIndex(['MARITAL', 'STATUS']);
  const nikIdx = getFieldIndex(['NIK', 'PASSPORT', 'KTP']);
  const kkIdx = getFieldIndex(['KK', 'KELUARGA']);
  const hpIdx = getFieldIndex(['HANDPHONE', 'PHONE', 'TELP', 'HP']);
  const bpjsKesIdx = getFieldIndex(['BPJSKES', 'BPJS KESEHATAN', 'BPJS KES']);
  const bpjsTkIdx = getFieldIndex(['BPJSTK', 'BPJS KETENAGAKERJAAN', 'BPJS TK']);
  const birthPlaceIdx = getFieldIndex(['BIRTH PLACE', 'TEMPAT LAHIR']);
  const birthDateIdx = getFieldIndex(['BIRTH DATE', 'TANGGAL LAHIR']);
  const motherIdx = getFieldIndex(["MOTHER'S", "MOTHER", "IBU"]);
  const eduIdx = getFieldIndex(['EDUCATION', 'PENDIDIKAN', 'LAST EDU']);
  const addrIdx = getFieldIndex(['ADDRESS', 'ALAMAT']);
  const emailIdx = getFieldIndex(['EMAIL']);
  const emergencyIdx = getFieldIndex(['EMERGENCY', 'DARURAT']);
  const relationIdx = getFieldIndex(['RELATIONSHIP', 'HUBUNGAN']);
  const referencesIdx = getFieldIndex(['REFERENCES', 'REFERENSI', 'REFEREN']);
  const alIdx = getFieldIndex(['AL']);
  const dpIdx = getFieldIndex(['DP']);
  const signIdx = getFieldIndex(['SIGN', 'KONTRAK TTD']);
  const endIdx = getFieldIndex(['END', 'BERAKHIR']);
  const outletIdx = getFieldIndex(['OUTLET', 'LOKASI']);
  const deptIdx = getFieldIndex(['DEPARTMENT', 'DEPARTEMEN', 'DEPT']);

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    // Smart splitter that handles quotes
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let j = 0; j < rawLine.length; j++) {
      const char = rawLine[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length === 0 || cells.every(c => !c)) continue;

    const getVal = (idx: number, fallback: string = '') => {
      if (idx === -1 || idx >= cells.length) return fallback;
      // strip quotes if present
      let s = cells[idx];
      if (s.startsWith('"') && s.endsWith('"')) {
        s = s.slice(1, -1);
      }
      return s.trim();
    };

    const name = getVal(nameIdx);
    if (!name) continue; // skip nameless rows

    const religionVal = getVal(religionIdx, 'Other');
    let religion: any = 'Other';
    if (religionVal.toLowerCase().includes('hindu')) religion = 'Hindu';
    else if (religionVal.toLowerCase().includes('moslem') || religionVal.toLowerCase().includes('islam')) religion = 'Moslem';
    else if (religionVal.toLowerCase().includes('christ') || religionVal.toLowerCase().includes('catholic') || religionVal.toLowerCase().includes('kristen') || religionVal.toLowerCase().includes('katolik')) religion = 'Christian/Catholic';
    else if (religionVal.toLowerCase().includes('buddha') || religionVal.toLowerCase().includes('buddhist')) religion = 'Buddhist';

    const genderVal = getVal(genderIdx, 'Male');
    const gender: any = genderVal.toLowerCase().startsWith('f') || genderVal.toLowerCase().includes('perempuan') || genderVal.toLowerCase().includes('wanita') ? 'Female' : 'Male';

    const maritalVal = getVal(maritalIdx, 'Single');
    let maritalStatus: any = 'Single';
    if (maritalVal.toLowerCase().includes('marr') || maritalVal.toLowerCase().includes('nikah') || maritalVal.toLowerCase().includes('kawin')) {
      maritalStatus = 'Married';
    } else if (maritalVal.toLowerCase().includes('divorc') || maritalVal.toLowerCase().includes('janda') || maritalVal.toLowerCase().includes('duda') || maritalVal.toLowerCase().includes('cerai')) {
      maritalStatus = 'Divorced';
    }

    const startingDate = getVal(startIdx, new Date().toISOString().split('T')[0]);
    const signDate = getVal(signIdx, startingDate);
    
    // Auto calculate 1 year after signDate
    let contractEndDate = getVal(endIdx);
    if (!contractEndDate) {
      try {
        const sign = new Date(signDate);
        if (!isNaN(sign.getTime())) {
          sign.setFullYear(sign.getFullYear() + 1);
          contractEndDate = sign.toISOString().split('T')[0];
        } else {
          contractEndDate = new Date().toISOString().split('T')[0];
        }
      } catch (e) {
        contractEndDate = new Date().toISOString().split('T')[0];
      }
    }

    results.push({
      name,
      position: getVal(posIdx, 'Staff'),
      startingDate,
      gender,
      religion,
      maritalStatus,
      nikPassport: getVal(nikIdx, '-'),
      noKK: getVal(kkIdx, '-'),
      noHandphone: getVal(hpIdx, '-'),
      noBpjsKes: getVal(bpjsKesIdx, '-'),
      noBpjsTk: getVal(bpjsTkIdx, '-'),
      birthPlace: getVal(birthPlaceIdx, '-'),
      birthDate: getVal(birthDateIdx, '1995-01-01'),
      motherFullName: getVal(motherIdx, '-'),
      lastEducation: getVal(eduIdx, 'SMA/SMK'),
      address: getVal(addrIdx, 'Nusa Lembongan'),
      email: getVal(emailIdx, `${name.toLowerCase().replace(/\s+/g, '')}@aquanusa.co.id`),
      emergencyContact: getVal(emergencyIdx, '-'),
      relationship: getVal(relationIdx, '-'),
      references: getVal(referencesIdx, 'Direct Application'),
      alBalance: Number(getVal(alIdx, '12')),
      dpBalance: Number(getVal(dpIdx, '0')),
      signDate,
      contractEndDate,
      outletId: getVal(outletIdx, 'O1'), // Default to Lembongan Main Office id or we map it
      departmentId: getVal(deptIdx, 'D1') // Default FO
    });
  }

  return results;
}

/**
 * Custom function to convert Department Schedule table to CSV Excel file format.
 */
export function exportScheduleToCSV(
  dates: string[],
  employees: Employee[],
  entries: Record<string, any>,
  deptName: string,
  periodName: string
): string {
  // Title Rows with explicit separator declaration for Excel
  let csv = `sep=;\n`;
  csv += `PT. AQUA NUSA LEMBONGAN\n`;
  csv += `ROSTER SCHEDULE - DEPARTEMENT: ${deptName.toUpperCase()}\n`;
  csv += `PERIODE: ${periodName.toUpperCase()}\n\n`;

  // Row Headers (Mirroring UI: Name & Position, then dates, then balances)
  const topHeaders = [
    'NAME', 'POSITION',
    ...dates.map(d => {
      // Return just the day number e.g., "26", "27"
      const parts = d.split('-');
      return parts[2] ? parts[2] : d;
    }),
    'AL PREV', 'AL-', 'AL+', 'TOTAL AL',
    'DP PREV', 'DP-', 'DP+', 'TOTAL DP',
    'TOTAL AL + TOTAL DP'
  ];

  csv += topHeaders.join(';') + '\n';

  employees.forEach(emp => {
    const entry = entries[emp.id] || { dates: {} };
    const datesMap = entry.dates || {};

    const alPrev = entry.alPrev ?? emp.alBalance;
    const alMinus = entry.alMinus ?? 0;
    const alPlus = entry.alPlus ?? 0;
    const dpPrev = entry.dpPrev ?? emp.dpBalance;
    const dpMinus = entry.dpMinus ?? 0;
    const dpPlus = entry.dpPlus ?? 0;

    const tal = alPrev + alPlus - alMinus;
    const tdp = dpPrev + dpPlus - dpMinus;
    const grandTotal = tal + tdp;

    const row = [
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.position.replace(/"/g, '""')}"`,
      ...dates.map(d => {
        const val = datesMap[d] || 'OFF';
        return `"${val.replace(/"/g, '""')}"`;
      }),
      alPrev,
      alMinus,
      alPlus,
      tal,
      dpPrev,
      dpMinus,
      dpPlus,
      tdp,
      grandTotal
    ];

    csv += row.join(';') + '\n';
  });

  return csv;
}

/**
 * Generates a clean empty template CSV for batch employee monthly schedules
 */
export function exportScheduleTemplateCSV(dates: string[], employees: Employee[]): string {
  const headers = ['EMPLOYEE_ID', 'EMPLOYEE_NAME', ...dates];
  let csv = `sep=;\n`;
  csv += headers.join(';') + '\n';

  employees.forEach(emp => {
    const row = [
      `"${emp.id}"`,
      `"${emp.name.replace(/"/g, '""')}"`,
      ...dates.map(() => 'OFF')
    ];
    csv += row.join(';') + '\n';
  });

  return csv;
}

