## 1. Hapus Panggilan loadDefaultMockData Unconditional

- [ ] 1.1 Hapus `useEffect(() => { loadDefaultMockData(); }, [])` dari HRContext.tsx
- [ ] 1.2 Pindahkan `loadDefaultMockData()` sebagai fallback terakhir di dalam `fetchAndSyncFirestore`

## 2. Implementasi Caching localStorage

- [ ] 2.1 Buat fungsi `saveStateToLocalStorage(state)` yang menyimpan seluruh state ke localStorage dengan key `LOCAL_STORAGE_KEY`
- [ ] 2.2 Buat fungsi `loadStateFromLocalStorage()` yang membaca dan me-restore state dari localStorage
- [ ] 2.3 Ubah inisialisasi: cek localStorage dulu, restore jika ada data

## 3. Ubah fetchAndSyncFirestore untuk Tidak Overwrite dengan Seed

- [ ] 3.1 Di `fetchAndSyncFirestore`, hapus seeding data ke Firestore jika Firestore kosong (agar tidak mengirim seed ke Firestore)
- [ ] 3.2 Simpan state dari Firestore ke localStorage setelah berhasil sync
- [ ] 3.3 Jika Firestore gagal dan tidak ada cache localStorage, baru panggil `loadDefaultMockData()` sebagai fallback

## 4. Finalisasi & Validasi

- [ ] 4.1 Pastikan `resetDatabaseToDefault()` masih berfungsi dan menyimpan ke localStorage
- [ ] 4.2 Jalankan typecheck (`npm run lint`)
- [ ] 4.3 Review akhir untuk memastikan tidak ada kode mati yang tersisa
