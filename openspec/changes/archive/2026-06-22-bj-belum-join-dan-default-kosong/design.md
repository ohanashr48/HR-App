## Context

Saat ini cell schedule default ke 'OFF' jika belum diisi. Juga tidak ada cara untuk menandai bahwa seorang karyawan belum join (belum TMT) di tanggal tertentu.

## Goals / Non-Goals

**Goals:**
- Cell sebelum TMT otomatis menampilkan "BJ" dan tidak bisa diedit
- Cell setelah TMT yang belum diisi menampilkan kosong (bukan OFF)
- Legend diperbarui

**Non-Goals:**
- Tidak mengubah penyimpanan data — BJ display-only
- Tidak mengubah perhitungan AL/DP

## Decisions

1. **BJ display-only**: Tidak disimpan ke entry.dates. Dihitung saat render berdasarkan emp.startingDate vs dateStr
2. **Default kosong**: `shiftVal = entry.dates[dateStr] || ''` bukan `|| 'OFF'`
3. **Disabled input**: Cell dengan BJ pakai `disabled` attribute agar tidak bisa diedit
4. **CSS**: BJ pakai warna slate-400 italic agar beda dari nilai aktif

## Risks / Trade-offs

- Tidak ada risiko — hanya perubahan display
