## Why

Halaman **EmployeeDatabase** saat ini menampilkan 4 klasifikasi karyawan dalam bentuk tab: **Tetap & Kontrak**, **Trainee**, **Probation**, dan **Karyawan Resign**. Data untuk Trainee, Probation, dan Resign terbuat secara otomatis dari seed data kosong (array `[]`), sehingga yang muncul hanyalah tab kosong yang tidak informatif.

Ini membingungkan user karena:
1. Tab yang tidak terpakai menambah kompleksitas visual
2. Data Trainee, Probation, dan Resign belum ada isinya (semua array kosong)
3. Fokus utama hanyalah karyawan yang resmi tercatat (Tetap & Kontrak)

## What Changes

1. **Hapus 3 tab klasifikasi** — Trainee, Probation, dan Karyawan Resign dari halaman EmployeeDatabase
2. **Hanya tampilkan tabel karyawan tetap & kontrak** — sebagai satu-satunya tampilan database
3. **Hapus filter/state yang tidak diperlukan** — terkait classification tabs
4. **Bersihkan import dan kode** — yang hanya digunakan untuk tab yang dihapus

## Capabilities

### Modified Capabilities

- `employee-database`: Halaman database karyawan — hapus tab klasifikasi (Trainee, Probation, Resign), hanya tampilkan karyawan resmi (Tetap & Kontrak)

## Impact

- **File utama:** `src/components/EmployeeDatabase.tsx`
- Menghapus state `activeClassification`, `filteredTrainees`, `filteredProbations`, `filteredResigned`
- Menghapus 3 tabel trainee, probation, resign
- Menghapus kode yang tidak diperlukan (import, handler delete untuk trainee/probation/resign)
