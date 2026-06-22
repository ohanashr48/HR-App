## Context

AL+ selama ini hardcoded 1 per bulan. User ingin otomatis: 1 jika TMT ≤ awal periode, 0 jika TMT > awal periode.

## Goals / Non-Goals

**Goals:**
- calculateRosterStats menghitung alPlus otomatis
- Semua fungsi yang pakai calculateRosterStats ikut update

**Non-Goals:**
- Tidak mengubah perhitungan AL PREV, AL-, DP-, DP+
- Tidak mengubah UI

## Decisions

1. **Tambahkan parameter** `employeeStartDate` dan `periodStartDate` ke `calculateRosterStats`
2. **Logika**: `new Date(employeeStartDate) <= new Date(periodStartDate) ? 1 : 0`
3. **Default** di SchedulePanel juga dihitung dinamis, bukan hardcoded 1

## Risks / Trade-offs

- Tidak ada risiko signifikan — perubahan hanya menambahkan perhitungan alPlus
