## Why

Dua masalah pada input cell schedule roster:

1. **Tidak bisa mengetik di cell schedule** — Saat filter departemen "Semua Departemen" dipilih (`activeDeptId === 'all'`), fungsi `handleShiftChange` dan `handleProcessBatchRoster` mengirim `activeDeptId='all'` ke `updateSchedule` / `batchUpdateSchedule`. Karena tidak ada dokumen schedule dengan `departmentId === 'all'`, data tidak pernah tersimpan dan input kosong kembali setelah re-render.

2. **Hanya periode default yang bisa digunakan** — Schedule cuma dibuat untuk *current period* (`26 Jun - 25 Jul 2026`) saat department dibuat. Untuk periode lain (Jul-Agu, Agu-Sep, dst.), tidak ada dokumen schedule di state lokal. Fungsi `updateSchedule` dan `batchUpdateSchedule` tidak menemukan target → data tidak tersimpan.

## What Changes

1. `SchedulePanel.tsx` — `handleShiftChange` pakai `departmentId` asli karyawan jika `activeDeptId === 'all'`
2. `SchedulePanel.tsx` — Batch import: update di-group per department jika `activeDeptId === 'all'`
3. `HRContext.tsx` — `updateSchedule`: buat schedule baru jika belum ada untuk department+period tsb.
4. `HRContext.tsx` — `batchUpdateSchedule`: buat schedule baru jika belum ada untuk department+period tsb., dengan stats kumulatif

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `schedule-cell-free-input`: Sekarang berfungsi di semua periode, bukan hanya periode default
- `schedule-create-if-missing`: Schedule roster otomatis dibuat jika belum ada untuk periode yang dipilih

## Impact

- File diubah: `src/components/SchedulePanel.tsx`, `src/context/HRContext.tsx`
