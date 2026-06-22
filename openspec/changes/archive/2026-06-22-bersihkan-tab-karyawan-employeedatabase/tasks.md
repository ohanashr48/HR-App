## 1. Hapus Classification Tabs & State

- [ ] 1.1 Hapus state `activeClassification` dan setter `setActiveClassification`
- [ ] 1.2 Hapus classification tab buttons (Regular, Trainee, Probation, Resigned)
- [ ] 1.3 Hapus tabel untuk `activeClassification === 'trainee'`
- [ ] 1.4 Hapus tabel untuk `activeClassification === 'probation'`
- [ ] 1.5 Hapus tabel untuk `activeClassification === 'resigned'`

## 2. Bersihkan Filtered Data & Imports

- [ ] 2.1 Hapus `filteredTrainees`, `filteredProbations`, `filteredResigned` useMemo
- [ ] 2.2 Hapus destructuring `deleteTraineeEmployee`, `deleteProbationEmployee`, `deleteResignedEmployee` dari `useHR()`
- [ ] 2.3 Hapus import yang hanya dipakai oleh tab yang dihapus

## 3. Finalisasi & Validasi

- [ ] 3.1 Pastikan tabel regular employees tetap muncul tanpa tab
- [ ] 3.2 Jalankan typecheck (`npm run lint` / `tsc --noEmit`)
- [ ] 3.3 Review akhir untuk memastikan tidak ada kode mati yang tersisa
