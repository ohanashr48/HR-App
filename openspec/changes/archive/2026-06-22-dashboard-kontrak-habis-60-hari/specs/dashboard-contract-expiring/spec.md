## ADDED Requirements

### Requirement: dashboard-contract-expiring
Dashboard menampilkan card yang berisi jumlah dan daftar karyawan yang kontraknya akan habis dalam 60 hari ke depan.

#### Scenario: tampilkan jumlah karyawan
- **WHEN** dashboard dimuat
- **THEN** card menampilkan jumlah karyawan dengan `contractEndDate` antara 15 Juni 2026 s.d. 14 Agustus 2026

#### Scenario: daftar karyawan
- **WHEN** ada karyawan dengan kontrak akan habis
- **THEN** card menampilkan daftar nama + tanggal habis kontrak

#### Scenario: tidak ada karyawan
- **WHEN** tidak ada karyawan dengan kontrak akan habis dalam 60 hari
- **THEN** card menampilkan pesan "Tidak ada karyawan dengan kontrak akan habis dalam 60 hari ke depan."
