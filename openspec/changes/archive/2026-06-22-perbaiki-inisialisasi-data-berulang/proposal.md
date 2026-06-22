## Why

Setiap kali aplikasi dibuka, **data dummy (seed data)** selalu di-reset ulang. Ini terjadi karena:

1. `loadDefaultMockData()` dipanggil **tanpa syarat** di mount component HRContext
2. Data seed (64 public holidays, 5 departemen, 4 outlet, jadwal) selalu ditimpa
3. Sinkronisasi Firestore berjalan setelahnya, tapi jika Firestore offline/catch error, data seed-lah yang tampil
4. Tidak ada mekanisme penyimpanan lokal (localStorage) yang membedakan "kunjungan pertama" vs "kunjungan berikutnya"

Akibatnya: setiap refresh browser, data seperti public holidays, outlet, departemen, dan jadwal selalu kembali ke default. Ini membuat pengguna frustrasi karena data yang sudah diedit/ditambahkan hilang.

## What Changes

1. **Hapus panggilan `loadDefaultMockData()` unconditional** dari `useEffect` mount
2. **Prioritaskan Firestore** — load dari Firestore terlebih dahulu
3. **Gunakan localStorage sebagai cache fallback** — simpan state terakhir agar bisa dipulihkan saat Firestore offline
4. **Seed data hanya jika benar-benar fresh** — hanya jalankan seed data jika tidak ada data di Firestore AND tidak ada cache localStorage
5. **Jangan seed ke Firestore** — menghindari overwrite data yang sudah ada

## Capabilities

### Modified Capabilities

- `data-initialization`: HRContext initialization — ubah flow inisialisasi agar tidak mereset data setiap load

## Impact

- **File utama:** `src/context/HRContext.tsx`
- Menghapus/memodifikasi `useEffect(() => { loadDefaultMockData(); }, [])`
- Mengubah `fetchAndSyncFirestore` effect untuk menangani caching localStorage
- Data flow baru: localStorage → Firestore → seed fallback
