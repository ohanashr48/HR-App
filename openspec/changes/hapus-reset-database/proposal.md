## Why

Fungsi `resetDatabaseToDefault()` dan `loadDefaultMockData()` masih menyediakan jalur untuk menginjeksi data seed/dummy ke dalam aplikasi. Untuk meminimalisir kesalahan di masa depan, kedua fungsi ini harus dihapus total agar tidak ada kemungkinan data ter-reset ke default.

## What Changes

1. **Hapus `resetDatabaseToDefault()`** dari interface dan implementasi HRContext
2. **Hapus `loadDefaultMockData()`** — satu-satunya pemanggil adalah `resetDatabaseToDefault()`
3. **Hapus imports yang tidak terpakai** — konstanta seed dan `generateInitialSchedule` tidak lagi diperlukan
4. **Hapus `resetDatabaseToDefault` dari provider value**

## Capabilities

### Modified Capabilities

- `data-initialization`: Hapus `resetDatabaseToDefault` dan `loadDefaultMockData` — tidak ada lagi jalur reset data seed

## Impact

- **File:** `src/context/HRContext.tsx`
- Hapus interface `resetDatabaseToDefault`
- Hapus implementasi `resetDatabaseToDefault` dan `loadDefaultMockData`
- Hapus imports: `INITIAL_EMPLOYEES`, `INITIAL_RESIGNED_EMPLOYEES`, `INITIAL_TRAINEE_EMPLOYEES`, `INITIAL_PROBATION_EMPLOYEES`, `INITIAL_PUBLIC_HOLIDAYS`, `INITIAL_OUTLETS`, `INITIAL_DEPARTMENTS`, `generateInitialSchedule`
