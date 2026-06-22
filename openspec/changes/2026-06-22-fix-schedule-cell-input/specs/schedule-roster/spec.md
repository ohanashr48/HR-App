## ADDED Requirements

### Requirement: schedule-create-if-missing
Sistem harus otomatis membuat dokumen schedule roster baru jika schedule untuk department+period yang dipilih belum ada.

#### Scenario: user mengetik shift di periode baru
- **WHEN** user mengganti periode roster ke periode yang belum pernah dipakai
- **WHEN** user mengetik shift di cell schedule
- **THEN** sistem membuat schedule baru untuk department+period tersebut
- **THEN** data shift tersimpan di state lokal
- **THEN** data shift tersimpan di Firestore

#### Scenario: user upload batch roster di periode baru
- **WHEN** user upload file CSV roster untuk periode yang belum pernah dipakai
- **THEN** sistem membuat schedule baru untuk department+period tersebut
- **THEN** semua data shift dari file tersimpan dengan stats AL/DP yang dihitung kumulatif

### Requirement: schedule-cell-input-all-departments
Saat filter "Semua Departemen" aktif, input cell harus tetap bisa menyimpan data ke schedule departemen yang benar.

#### Scenario: user mengetik dengan filter Semua Departemen
- **WHEN** user memilih "Semua Departemen" di filter departemen
- **WHEN** user mengetik shift di cell schedule karyawan
- **THEN** data tersimpan ke schedule departemen asli karyawan tersebut
- **THEN** data tidak hilang setelah re-render

#### Scenario: user upload batch dengan filter Semua Departemen
- **WHEN** user memilih "Semua Departemen" di filter departemen
- **WHEN** user upload file CSV roster
- **THEN** update di-group per department asli karyawan
- **THEN** setiap group tersimpan ke schedule department masing-masing

## MODIFIED Requirements

### Requirement: schedule-cell-free-input
- **Perubahan:** Sekarang input cell berfungsi di semua periode roster, bukan hanya periode default.
- **Perubahan:** Sekarang input cell berfungsi saat filter "Semua Departemen" aktif.
