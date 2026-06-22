## MODIFIED Requirements

### Requirement: Employee Database Table
The EmployeeDatabase page SHALL display a single table of officially registered employees (Tetap & Kontrak).

#### Scenario: Display only regular employees
- **WHEN** user accesses EmployeeDatabase
- **THEN** the system SHALL display only the table of regular employees (Tetap & Kontrak)
- **AND** the system SHALL NOT display classification tabs (Trainee, Probation, Resigned)
- **AND** the system SHALL NOT display tables for Trainee, Probation, or Resigned employees

#### Scenario: Search and filter still functional
- **WHEN** user uses search bar, outlet filter, or department filter
- **THEN** the system SHALL filter the regular employees table accordingly

#### Scenario: CRUD operations unchanged
- **WHEN** user adds, edits, or deletes an employee
- **THEN** the system SHALL behave identically to the previous implementation
- **AND** all existing fields and validation SHALL be preserved
