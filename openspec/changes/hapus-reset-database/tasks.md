## 1. Hapus resetDatabaseToDefault & loadDefaultMockData

- [x] 1.1 Hapus interface `resetDatabaseToDefault` dari HRContextProps
- [x] 1.2 Hapus implementasi `resetDatabaseToDefault()` dan `loadDefaultMockData()`
- [x] 1.3 Hapus `resetDatabaseToDefault` dari provider value

## 2. Bersihkan Unused Imports

- [x] 2.1 Hapus imports yang tidak terpakai: `INITIAL_EMPLOYEES`, `INITIAL_RESIGNED_EMPLOYEES`, `INITIAL_TRAINEE_EMPLOYEES`, `INITIAL_PROBATION_EMPLOYEES`, `INITIAL_PUBLIC_HOLIDAYS`, `INITIAL_OUTLETS`, `INITIAL_DEPARTMENTS`, `generateInitialSchedule`
- [x] 2.2 Pastikan fungsi helper lain (`calculateMonthsWorked`, `calculateRosterStats`, dll) tetap di-import

## 3. Validasi

- [x] 3.1 Jalankan typecheck (`npm run lint`)
- [x] 3.2 Review akhir untuk memastikan tidak ada kode mati yang tersisa
