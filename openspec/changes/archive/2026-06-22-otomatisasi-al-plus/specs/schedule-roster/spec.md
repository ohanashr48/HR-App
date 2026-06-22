## MODIFIED Requirements

### Requirement: calculate-al-plus
AL+ harus otomatis dihitung berdasarkan TMT karyawan vs awal periode.

#### Scenario: karyawan TMT sebelum atau sama dengan awal periode
- **WHEN** karyawan memiliki `startingDate` ≤ `periodStartDate`
- **THEN** `alPlus` harus = 1

#### Scenario: karyawan TMT setelah awal periode
- **WHEN** karyawan memiliki `startingDate` > `periodStartDate`
- **THEN** `alPlus` harus = 0
