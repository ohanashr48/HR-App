## Why

AL+ saat ini hardcoded (default 1) dan harus di-set manual via modal override. User ingin AL+ otomatis: 1 jika karyawan aktif sejak awal periode, 0 jika mulai di pertengahan periode.

## What Changes

1. `calculateRosterStats()` di-update untuk menerima employeeStartDate & periodStartDate → return alPlus
2. `updateSchedule()` di HRContext menggunakan stats.alPlus yang baru
3. `batchUpdateSchedule()` di HRContext menggunakan stats.alPlus yang baru
4. Default entry display di SchedulePanel menggunakan alPlus dinamis

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- `src/utils/initialData.ts` — fungsi calculateRosterStats
- `src/context/HRContext.tsx` — updateSchedule, batchUpdateSchedule
- `src/components/SchedulePanel.tsx` — default entry display
