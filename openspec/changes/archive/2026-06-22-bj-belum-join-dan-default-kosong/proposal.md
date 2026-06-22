## Why

Tiga masalah pada cell schedule:

1. Nilai 1-99 tidak praktis karena terlalu banyak variasi. Lebih baik tambahkan "BJ" (Belum Join) untuk menandai karyawan yang belum mulai bekerja di tanggal tersebut.
2. Cell untuk tanggal sebelum TMT (startingDate) harus otomatis BJ, bukan bisa diedit.
3. Default untuk cell yang belum diisi setelah TMT harus kosong, bukan OFF, agar user sadar bahwa cell tersebut belum dijadwalkan.

## What Changes

1. Hapus "1-99" dari legend, tambah "BJ: Belum Join"
2. Di cell rendering: jika date < emp.startingDate → tampilkan "BJ" (disabled/read-only)
3. Default shiftVal: dari `'OFF'` jadi `''` (string kosong)
4. Input disabled untuk cell yang menunjukkan BJ

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- File diubah: `src/components/SchedulePanel.tsx`
- Tidak ada perubahan di HRContext atau initialData (BJ display-only, tidak disimpan)
