## Why

Setiap kali aplikasi dibuka, `loadDefaultMockData()` dipanggil tanpa syarat dan mereset seluruh state ke data seed/default. Ini menyebabkan:

1. **Data hilang** — data yang sudah ditambahkan/diedit user hilang setelah refresh browser
2. **Dummy data muncul** — 64 public holidays, 5 departemen, 4 outlet selalu di-reset
3. **Firebase tidak dijadikan sumber kebenaran** — padahal user ingin data realtime dari Firestore

## What Changes

1. **Hapus panggilan `loadDefaultMockData()` dari mount useEffect** — tidak boleh mereset data setiap load
2. **Firebase Firestore sebagai satu-satunya source of truth** — semua data di-load dari Firestore
3. **Data seed hanya untuk `resetDatabaseToDefault()`** — hanya user yang memicu reset secara manual
4. **Tidak ada localStorage caching** — data murni dari Firestore, tampilkan loading state saat sinkronasi
5. **Jika Firestore kosong, tampilkan empty state** — bukan data dummy

## Capabilities

### Modified Capabilities

- `data-initialization`: HRContext initialization — hapus seed otomatis, prioritaskan Firestore sebagai satu-satunya sumber data

## Impact

- **File utama:** `src/context/HRContext.tsx`
- Hapus `useEffect(() => { loadDefaultMockData(); }, [])`
- Ubah `fetchAndSyncFirestore` untuk tidak seeding data ke Firestore
- Tampilkan empty state jika Firestore kosong
- `resetDatabaseToDefault()` tetap ada untuk reset manual
