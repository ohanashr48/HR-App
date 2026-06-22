## Why

Card "Karyawan Resign Bulan Ini" di halaman Dashboard kurang relevan dengan kebutuhan operasional HR. Yang lebih penting adalah mengetahui karyawan mana yang kontraknya akan segera habis dalam 60 hari ke depan, agar HR bisa melakukan perpanjangan kontrak tepat waktu.

## What Changes

1. Hapus card "KARYAWAN RESIGN BULAN INI" beserta logika filtering `resignedThisMonth`
2. Tambah card baru "KARYAWAN AKAN HABIS KONTRAK 60 HARI" yang menghitung karyawan dengan `contractEndDate` dalam rentang 60 hari dari tanggal simulasi (15 Juni 2026)

## Capabilities

### New Capabilities
- `dashboard-contract-expiring`: Menampilkan daftar karyawan yang kontraknya akan habis dalam 60 hari

### Modified Capabilities
- (none)

## Impact

- File diubah: `src/components/Dashboard.tsx`
- Logika `resignedThisMonth` dihapus
- Logika baru: filter employees berdasarkan `contractEndDate` (15 Juni 2026 + 60 hari = 14 Agustus 2026)
