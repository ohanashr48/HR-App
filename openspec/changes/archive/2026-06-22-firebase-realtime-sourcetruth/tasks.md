## 1. Hapus Inisialisasi Seed Otomatis

- [x] 1.1 Hapus `useEffect(() => { loadDefaultMockData(); }, [])` dari HRContext.tsx
- [x] 1.2 Hapus seeding data ke Firestore di dalam `fetchAndSyncFirestore` (blok `else` yang seed `INITIAL_EMPLOYEES` dll)

## 2. Ubah fetchAndSyncFirestore Jadi Sumber Utama

- [x] 2.1 Pindahkan `loadDefaultMockData()` hanya ke dalam `resetDatabaseToDefault()`
- [x] 2.2 Jika Firestore snapshot kosong untuk suatu koleksi, biarkan state kosong (jangan seed)
- [x] 2.3 Tambahkan loading state di HRContext agar UI tahu sedang memuat data dari Firestore

## 3. Validasi & Review

- [x] 3.1 Jalankan typecheck (`npm run lint`)
- [x] 3.2 Review akhir untuk memastikan tidak ada panggilan seed yang terlewat
