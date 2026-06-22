## Why

Default AL PREV untuk staff baru adalah 12 (standar 12 hari cuti per tahun). User ingin defaultnya 0 karena staff baru belum punya hak cuti yang terakumulasi.

## What Changes

Ubah semua default `alPrev` / `alBalance` dari 12 menjadi 0 di:
- EmployeeDatabase.tsx (2 tempat — form tambah karyawan)
- HRContext.tsx (4 tempat — batchImport, updateSchedule, batchUpdateSchedule, leaverBalances)
- SchedulePanel.tsx (2 tempat — balanceForm state, startEditingBalances fallback)

## Capabilities

### Modified Capabilities
- (none)

## Impact

- 3 file berubah, 8 lokasi default dari 12 → 0
