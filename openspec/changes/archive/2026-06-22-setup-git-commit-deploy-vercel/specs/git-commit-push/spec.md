## ADDED Requirements

### Requirement: git-commit-all-changes
Semua perubahan yang belum di-commit harus di-stage dan di-commit ke branch main.

#### Scenario: commit semua modified files
- **WHEN** user menjalankan perintah commit
- **THEN** semua modified files (6 files) harus ter-stage dan ter-commit dengan message yang deskriptif

#### Scenario: commit semua untracked files
- **WHEN** user menjalankan perintah commit
- **THEN** folder openspec/, .gemini/, .github/, AGENTS.md harus ikut ter-commit

### Requirement: git-push-to-remote
Semua commit harus ter-push ke remote origin.

#### Scenario: push ke GitHub
- **WHEN** perintah push dijalankan
- **THEN** semua commit terkirim ke github.com/ohanashr48/HR-App.git branch main
- **THEN** origin/main dan HEAD lokal harus sinkron
