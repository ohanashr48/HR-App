## Context

Setelah perubahan sebelumnya, `resetDatabaseToDefault()` masih ada di HRContext. Fungsi ini memanggil `loadDefaultMockData()` yang menginjeksi seed data. Untuk keamanan dan konsistensi (data hanya dari Firebase), kedua fungsi harus dihapus.

## Goals / Non-Goals

**Goals:**
- Hapus `resetDatabaseToDefault()` dari interface dan implementasi
- Hapus `loadDefaultMockData()` — satu-satunya pemanggil
- Hapus imports konstanta seed yang tidak terpakai
- Typecheck tetap lulus

**Non-Goals:**
- Tidak mengubah mekanisme Firestore sync atau CRUD
- Tidak menghapus fungsi helper lain dari initialData (seperti `calculateMonthsWorked`, dll)

## Decisions

1. **Hapus total** — Bukan disembunyikan atau di-deprecate. Tidak ada jalur untuk reset data seed.
2. **Bersihkan imports** — Hapus hanya konstanta seed, sisakan fungsi helper yang masih dipakai.

## Risks / Trade-offs

- **Rendah** — Tidak ada komponen lain yang menggunakan `resetDatabaseToDefault` (diverifikasi via code search).
