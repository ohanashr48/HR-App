## Context

Saat ini, `HRContext.tsx` memiliki dua `useEffect` yang berjalan saat mount:

```typescript
// Effect 1: Selalu reset ke seed data
useEffect(() => {
    loadDefaultMockData();
}, []);

// Effect 2: Sync dari Firestore (async)
useEffect(() => {
    const fetchAndSyncFirestore = async () => { ... };
    fetchAndSyncFirestore();
}, []);
```

**Masalah:**
- Effect 1 **selalu** menimpa state dengan seed data (64 holidays, 4 outlets, 5 depts, jadwal)
- Jika Firestore offline atau error, data seed-lah yang bertahan
- Tidak ada mekanisme persistensi lokal (localStorage sudah didefinisikan `LOCAL_STORAGE_KEY` tapi tidak dipakai)
- User kehilangan data setiap refresh browser

## Goals / Non-Goals

**Goals:**
- Data tidak hilang saat browser di-refresh
- Flow: localStorage (cached) → Firestore (sinkron) → seed data (fallback pertama kali)
- Seed data hanya dipakai jika benar-benar tidak ada data sama sekali (first visit)
- Data yang sudah ada di Firestore tetap diambil dan tidak ditimpa seed

**Non-Goals:**
- Tidak mengubah struktur data atau tipe
- Tidak mengubah fungsionalitas CRUD
- Tidak mengubah mekanisme Firestore sync untuk operasi write

## Decisions

1. **Hapus `loadDefaultMockData()` dari mount effect** — Panggilan unconditional ini adalah akar masalah. Diganti dengan mekanisme bertahap.

2. **Prioritas inisialisasi baru** (dari yang paling prioritas):
   - **Langkah 1:** Cek localStorage — jika ada data tersimpan, restore dulu (tampilkan cepat)
   - **Langkah 2:** Coba load dari Firestore — jika berhasil, timpa state dengan data Firestore + simpan ke localStorage
   - **Langkah 3:** Jika Firestore gagal (offline) dan tidak ada cache localStorage → fallback ke seed data

3. **Gunakan `LOCAL_STORAGE_KEY` yang sudah ada** — `aquanusa_hr_state_v2` sudah didefinisikan tapi tidak digunakan. Simpan state lengkap (employees, holidays, schedules, outlets, departments, dll) sebagai JSON.

4. **Firestore sync tidak perlu diubah** — Hanya mengubah flow inisialisasi. Fungsi write ke Firestore tetap sama.

5. **`resetDatabaseToDefault()` tetap ada** — Untuk reset manual oleh user.

## Risks / Trade-offs

- **Ukuran localStorage** — Data bisa menjadi besar jika banyak employees/schedules. Perlu batasan atau kompresi.
- **Staleness** — Data localStorage bisa usang jika ada perubahan dari perangkat lain via Firestore. Tapi ini hanya fallback sementara, Firestore akan overwrite setelah sync.
- **JSON serialization** — Semua state harus serializable. Pastikan tidak ada fungsi atau class instance di state.
