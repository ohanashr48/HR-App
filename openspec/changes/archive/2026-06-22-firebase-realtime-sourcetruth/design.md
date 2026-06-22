## Context

HRContext.tsx saat ini memiliki alur inisialisasi:
1. `loadDefaultMockData()` dipanggil unconditionally → reset semua state ke seed
2. `fetchAndSyncFirestore()` dipanggil → load dari Firestore (jika ada)

Ini menyebabkan data selalu di-reset. Padahal user ingin Firebase sebagai satu-satunya sumber data realtime.

## Goals / Non-Goals

**Goals:**
- Firebase Firestore sebagai satu-satunya source of truth
- Tidak ada data dummy/seed yang muncul otomatis
- Jika Firestore kosong → tampilkan empty state
- `resetDatabaseToDefault()` tetap berfungsi untuk reset manual

**Non-Goals:**
- Tidak menggunakan localStorage caching
- Tidak mengubah struktur data Firestore
- Tidak mengubah mekanisme CRUD

## Decisions

1. **Hapus unconditional `loadDefaultMockData()` dari mount** — Ini akar masalah.

2. **Firestore first** — Di mount, langsung coba load dari Firestore. Tampilkan loading state sampai selesai.

3. **Jika Firestore kosong** — Biarkan state kosong (jangan seed data dummy). Tabel akan menampilkan "Tidak ada data".

4. **Jika Firestore error/offline** — Tampilkan pesan error atau state kosong. Jangan fallback ke seed data.

5. **`loadDefaultMockData()` hanya dipanggil dari `resetDatabaseToDefault()`** — Untuk reset manual oleh admin.

## Risks / Trade-offs

- **Ketergantungan Firebase** — Jika Firebase down, app tidak bisa menampilkan data. Ini sesuai dengan keinginan user (realtime Firebase).
- **Loading time** — Perlu menambahkan loading state saat Firestore sync berlangsung.
