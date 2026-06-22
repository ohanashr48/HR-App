## Context

Halaman Dashboard saat ini menampilkan card "Karyawan Resign Bulan Ini" yang menghitung jumlah resign di bulan Juni 2026. Fungsi ini kurang bermanfaat — lebih penting menampilkan karyawan yang kontraknya akan habis agar HR bisa proaktif memperpanjang.

## Goals / Non-Goals

**Goals:**
- Card "Karyawan Akan Habis Kontrak 60 Hari" muncul menggantikan card resign
- Menampilkan jumlah dan daftar nama karyawan yang `contractEndDate` antara 15 Juni 2026 s.d. 14 Agustus 2026
- Desain card konsisten dengan card lainnya (dark theme, accent rose-red)

**Non-Goals:**
- Tidak mengubah kard lainnya
- Tidak mengubah logika dashboard secara keseluruhan

## Decisions

1. **60 hari dari 15 Juni 2026** = 14 Agustus 2026 (inklusif)
2. **Filter berdasarkan `contractEndDate`** pada array `employees` — hanya karyawan aktif
3. **Format card tetap sama** — hanya konten yang berubah

## Risks / Trade-offs

- Jika ada banyak karyawan dengan kontrak habis, daftar bisa panjang — diatasi dengan max-height scroll
- Tanggal simulasi hardcoded (15 Juni 2026) — konsisten dengan card lain
