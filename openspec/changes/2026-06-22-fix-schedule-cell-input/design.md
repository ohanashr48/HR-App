## Context

Setelah cell shift diganti dari `<select>` dropdown ke `<input>` teks dan filter departemen default ke "Semua Departemen", muncul masalah: user tidak bisa mengetik di cell schedule roster. Ini disebabkan oleh dua bug:

1. Saat filter "Semua Departemen" aktif, `activeDeptId === 'all'` dikirim sebagai `departmentId` ke `updateSchedule` — padahal schedule roster disimpan per department ID yang sesungguhnya (D1, D2, dst.).

2. Schedule hanya dibuat untuk *current period* (`2026-06-26_2026-07-25`) saat department dibuat. Firestore menyimpan data untuk periode lain, tapi state lokal tidak punya referensi schedule untuk periode tersebut, jadi `updateSchedule` tidak bisa menyimpan perubahan.

## Goals / Non-Goals

**Goals:**
- User bisa mengetik shift di cell schedule roster di semua periode roster (Mei-Jun, Jun-Jul, Jul-Agu, Agu-Sep, Sep-Okt, Okt-Nov, Nov-Des)
- User bisa mengetik shift saat filter "Semua Departemen" dipilih
- Batch upload roster berfungsi di semua periode dan semua filter departemen
- Data tersimpan ke Firestore dan state lokal

**Non-Goals:**
- Tidak mengubah UI atau tampilan
- Tidak mengubah logika balance (AL/DP prev, minus, plus)
- Tidak menambah fitur baru

## Decisions

1. **Resolve departmentId di component layer** — `handleShiftChange` dan batch import mencari `departmentId` asli karyawan saat `activeDeptId === 'all'`, bukan mengubah arsitektur context.

2. **Auto-create schedule di context layer** — `updateSchedule` dan `batchUpdateSchedule` mendeteksi jika schedule untuk department+period belum ada, lalu membuatnya otomatis. Ini lebih future-proof daripada pre-create semua periode saat department dibuat.

3. **Stats kumulatif** — Saat batch update membuat schedule baru, stats AL/DP dihitung dari akumulasi semua dates per employee, bukan per date individual.

## Risks / Trade-offs

- `updateSchedule` masih pakai closure `schedules` (bukan functional updater `setSchedules(prev => ...)`). Risiko stale closure rendah karena typing tidak secepat itu.
- `updateScheduleLeaverBalances` belum diperbaiki — jika user ingin override saldo manual di periode baru, mungkin belum bisa.
