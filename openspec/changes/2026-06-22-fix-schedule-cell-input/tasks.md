## 1. Fix handleShiftChange untuk "Semua Departemen"

- [x] 1.1 `handleShiftChange` pakai `departmentId` asli karyawan jika `activeDeptId === 'all'`
- [x] 1.2 Batch import: group update per department jika `activeDeptId === 'all'`

## 2. Fix updateSchedule untuk Periode Baru

- [x] 2.1 `updateSchedule`: deteksi jika schedule tidak ada → buat baru + fireStoreSave
- [x] 2.2 `batchUpdateSchedule`: deteksi jika schedule tidak ada → buat baru dengan stats kumulatif

## 3. Validasi

- [x] 3.1 Typecheck (`npx tsc --noEmit`) — lulus
- [x] 3.2 Code review — lulus
- [x] 3.3 Test browser: ketik OFF di periode Jul-Agu 2026 — berhasil
- [x] 3.4 Test browser: ketik AL di periode Agu-Sep 2026 — berhasil
