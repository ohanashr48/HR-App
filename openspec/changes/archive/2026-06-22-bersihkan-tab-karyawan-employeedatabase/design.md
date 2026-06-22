## Context

Saat ini halaman `EmployeeDatabase.tsx` memiliki sistem tab klasifikasi yang memisahkan karyawan ke dalam 4 kategori: **Tetap & Kontrak**, **Trainee**, **Probation**, dan **Karyawan Resign**. Masing-masing tab menampilkan tabel terpisah dengan kolom yang berbeda-beda.

Data untuk Trainee, Probation, dan Resign diinisialisasi dari array kosong (`INITIAL_TRAINEE_EMPLOYEES = []`, `INITIAL_PROBATION_EMPLOYEES = []`, `INITIAL_RESIGNED_EMPLOYEES = []`), sehingga ketiga tab tersebut selalu kosong dan tidak memiliki fungsi.

Tujuan perubahan ini adalah menyederhanakan halaman dengan hanya menampilkan karyawan resmi (Tetak & Kontrak) tanpa tab klasifikasi.

## Goals / Non-Goals

**Goals:**
- Hanya menampilkan tabel karyawan tetap & kontrak di EmployeeDatabase
- Menghapus tab Trainee, Probation, dan Resign beserta state/filter terkait
- Membersihkan kode yang tidak lagi diperlukan (import, handler, state)
- Mempertahankan fungsionalitas yang ada untuk karyawan tetap & kontrak

**Non-Goals:**
- Tidak mengubah struktur data di context/HRContext
- Tidak mengubah fungsionalitas CRUD karyawan tetap & kontrak
- Tidak menghapus tipe data TraineeEmployee, ProbationEmployee, ResignedEmployee dari types.ts
- Tidak mengubah halaman lain di luar EmployeeDatabase

## Decisions

1. **Hapus tab sepenuhnya, bukan disembunyikan** — Kode untuk tab dan tabel trainee/probation/resign dihapus total karena tidak ada rencana penggunaan dalam waktu dekat. Jika diperlukan di masa depan, bisa ditambahkan kembali.

2. **State `activeClassification` dihapus** — Tidak lagi diperlukan karena hanya ada satu tampilan.

3. **Filter state (`searchTerm`, `filterOutlet`, `filterDept`) tetap dipertahankan** — Fungsionalitas pencarian dan filtering masih relevan untuk karyawan tetap & kontrak.

4. **Handler delete untuk trainee/probation/resign dihapus dari destructuring** — Fungsi dari context (`deleteTraineeEmployee`, `deleteProbationEmployee`, `deleteResignedEmployee`) tidak lagi digunakan di komponen ini.

## Risks / Trade-offs

- **Rendah** — Perubahan ini bersifat menghapus kode (subtractive), bukan menambah fungsionalitas baru, sehingga risiko regresi minimal.
- Jika di masa depan fitur tab trainee/probation/resign diperlukan, harus ditulis ulang dari awal.
- Data trainee, probation, dan resign masih bisa diakses melalui mekanisme lain jika diperlukan (Super Admin Panel atau langsung dari context).
