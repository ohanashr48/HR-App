## MODIFIED Requirements

### Requirement: No Reset Function
The system SHALL NOT provide any function to reset application data to seed/default values.

#### Scenario: resetDatabaseToDefault removed
- **WHEN** code references `resetDatabaseToDefault`
- **THEN** the system SHALL NOT have this function available
- **AND** typecheck SHALL pass without errors

#### Scenario: No seed data injection
- **WHEN** the app loads
- **THEN** the system SHALL NOT call `loadDefaultMockData()` under any circumstances
- **AND** all data SHALL come exclusively from Firebase Firestore
