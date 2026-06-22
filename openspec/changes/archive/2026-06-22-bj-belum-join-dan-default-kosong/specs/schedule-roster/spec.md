## MODIFIED Requirements

### Requirement: bj-belum-join
Cell schedule otomatis menampilkan "BJ" untuk tanggal sebelum TMT karyawan dan tidak bisa diedit.

#### Scenario: cell sebelum TMT
- **WHEN** tanggal schedule < `emp.startingDate`
- **THEN** cell menampilkan "BJ" dengan tampilan disabled
- **THEN** user tidak bisa mengedit cell tersebut

### Requirement: default-kosong
Cell schedule untuk tanggal setelah TMT yang belum diisi harus kosong, bukan OFF.

#### Scenario: cell belum diisi
- **WHEN** tidak ada entry schedule untuk tanggal tersebut
- **AND** tanggal >= emp.startingDate
- **THEN** cell menampilkan kosong (bukan "OFF")
