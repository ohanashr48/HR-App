## Why

Dua masalah pada halaman Roster/SchedulePanel:

1. **Cell shift terbatas**: Dropdown hanya berisi OFF, AL, DP, PH, A-G. Padahal user perlu mengisi nilai lain seperti huruf H-Z atau angka 1-99. Dropdown dengan 129+ opsi tidak praktis — perlu diganti dengan input teks langsung.

2. **Filter departemen tidak intuitif**: Default department filter ke 'D1' (Front Office). Non-head user harus mengganti manual setiap kali. Yang diinginkan adalah default "Semua Departemen". Untuk head departement, hanya lihat departemen sendiri.

## What Changes

1. Ganti `<select>` dropdown shift cell menjadi `<input>` teks biasa sehingga user bisa mengetik nilai apapun (OFF, PH, AL, DP, A-Z, 1-99)
2. Ubah default `selectedDeptId` dari 'D1' menjadi `undefined` / 'all'
3. Tambah opsi "Semua Departemen" di dropdown departemen untuk non-head user
4. Sesuaikan logika filtering karyawan agar support "all" department

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none)

## Impact

- File diubah: `src/components/SchedulePanel.tsx`
