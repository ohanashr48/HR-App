## ADDED Requirements

### Requirement: schedule-cell-free-input
Cell shift pada tabel roster harus bisa menerima input teks bebas.

#### Scenario: user mengetik nilai shift
- **WHEN** user klik cell shift dan mengetik nilai
- **THEN** nilai tersebut harus tersimpan sebagai shift untuk karyawan dan tanggal tersebut

### Requirement: department-filter-default-all
Filter departemen harus default ke "Semua Departemen" untuk user non-head-departement.

#### Scenario: non-head user membuka halaman
- **WHEN** user dengan role selain head departement membuka SchedulePanel
- **THEN** dropdown departemen menampilkan "Semua Departemen" sebagai default
- **THEN** tabel menampilkan karyawan dari semua departemen di outlet terpilih

#### Scenario: head departement membuka halaman
- **WHEN** user dengan role head departement membuka SchedulePanel
- **THEN** filter departemen terkunci (locked) ke departemen miliknya
- **THEN** tidak ada opsi "Semua Departemen"
