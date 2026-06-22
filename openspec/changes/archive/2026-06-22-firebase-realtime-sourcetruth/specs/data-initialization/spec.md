## MODIFIED Requirements

### Requirement: Data Initialization from Firebase Only
The system SHALL initialize application data exclusively from Firebase Firestore.

#### Scenario: App loads with data in Firestore
- **WHEN** user opens the app
- **AND** Firestore has existing data (employees, holidays, schedules, etc.)
- **THEN** the system SHALL load all data from Firestore
- **AND** the system SHALL display the data without any seed/reset

#### Scenario: App loads with empty Firestore
- **WHEN** user opens the app for the first time
- **AND** Firestore collections are empty
- **THEN** the system SHALL display empty states in all panels
- **AND** the system SHALL NOT generate or seed any dummy data

#### Scenario: Firestore is offline/unavailable
- **WHEN** user opens the app
- **AND** Firestore is offline or returns an error
- **THEN** the system SHALL display an empty state with appropriate message
- **AND** the system SHALL NOT fall back to localStorage or seed data

#### Scenario: Manual reset
- **WHEN** admin calls `resetDatabaseToDefault()`
- **THEN** the system SHALL reset all state to initial seed data
