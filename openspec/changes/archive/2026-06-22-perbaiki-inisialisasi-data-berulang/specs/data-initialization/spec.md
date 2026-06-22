## MODIFIED Requirements

### Requirement: Data Initialization Flow
The system SHALL initialize application data with a priority-based approach: localStorage cache → Firestore sync → seed fallback.

#### Scenario: First visit (no localStorage, no Firestore)
- **WHEN** user opens the app for the first time
- **AND** there is no cached data in localStorage
- **AND** Firestore is empty or unavailable
- **THEN** the system SHALL fall back to seed/default data
- **AND** the system SHALL save this seed data to localStorage for future use

#### Scenario: Returning visit with localStorage cache
- **WHEN** user opens the app on a subsequent visit
- **AND** there is cached data in localStorage
- **THEN** the system SHALL restore state from localStorage immediately
- **AND** THEN attempt to sync from Firestore in the background
- **AND** if Firestore data differs, the system SHALL update state with Firestore data and update localStorage

#### Scenario: Returning visit when Firestore succeeds
- **WHEN** user opens the app
- **AND** Firestore sync completes successfully with data
- **THEN** the system SHALL update all state from Firestore data
- **AND** the system SHALL save the Firestore data to localStorage

#### Scenario: Returning visit when Firestore is offline
- **WHEN** user opens the app
- **AND** Firestore sync fails (offline/error)
- **AND** localStorage has cached data
- **THEN** the system SHALL continue using localStorage data
- **AND** the system SHALL NOT fall back to seed data

#### Scenario: Public holidays, outlets, departments are not reset
- **WHEN** user opens the app
- **AND** data already exists in localStorage or Firestore
- **THEN** the system SHALL NOT replace holidays, outlets, or departments with seed data
- **AND** the system SHALL preserve existing data

### Requirement: Seed Data Unchanged
The seed data constants SHALL remain available for manual reset and first-visit fallback.

#### Scenario: Manual reset still works
- **WHEN** admin calls `resetDatabaseToDefault()`
- **THEN** the system SHALL reset all state to seed data
- **AND** the system SHALL save the seed data to localStorage
