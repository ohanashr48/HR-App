## Context

Halaman SchedulePanel menggunakan `<select>` dropdown terbatas untuk memasukkan shift karyawan per hari. Juga filter departemen default ke 'D1' yang tidak sesuai kebutuhan.

## Goals / Non-Goals

**Goals:**
- User bisa mengetik nilai shift secara langsung (OFF, PH, AL, DP, A-Z, 1-99)
- Filter departemen default ke "Semua Departemen" untuk non-head user
- Head departement tetap hanya melihat departemen sendiri

**Non-Goals:**
- Tidak mengubah logika penyimpanan data (updateSchedule tetap sama)
- Tidak mengubah balance columns atau fitur lainnya

## Decisions

1. **Input text > dropdown** — karena pilihan terlalu banyak (129+), input teks langsung lebih praktis
2. **Default 'all' untuk departemen** — menggunakan string `'all'` untuk merepresentasikan semua departemen, konsisten dengan filter outlet
3. **Head departement tetap locked** — badge locked dengan nama departemen, tanpa opsi all

## Risks / Trade-offs

- Input teks bisa dimasuki nilai invalid — tidak ada validasi karena shift bisa berupa teks bebas (OFF/AL/DP/PH/huruf/angka)
- Perlu update CSS agar input terlihat rapi di cell
