## ADDED Requirements

### Requirement: git-commit-all-changes
Semua perubahan yang belum di-commit harus di-stage dan di-commit ke branch main.

#### Scenario: commit semua modified files
- **WHEN** perintah commit dijalankan
- **THEN** file yang modified (Dashboard.tsx, EmployeeDatabase.tsx, SchedulePanel.tsx, HRContext.tsx, initialData.ts) harus ter-stage dan ter-commit

#### Scenario: commit deleted files
- **WHEN** perintah commit dijalankan
- **THEN** file yang deleted (setup-git-commit-deploy-vercel/) harus tercatat sebagai penghapusan

#### Scenario: commit untracked OpenSpec files
- **WHEN** perintah commit dijalankan
- **THEN** folder openspec/changes/archive/ dan openspec/changes/2026-06-22-fix-schedule-cell-input/ harus ikut ter-commit

### Requirement: git-push-to-remote
Semua commit harus ter-push ke remote origin.

#### Scenario: push ke GitHub
- **WHEN** perintah push dijalankan
- **THEN** semua commit terkirim ke origin/main
- **THEN** Vercel auto-deploy terpicu
