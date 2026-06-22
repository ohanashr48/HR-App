## Context

Perubahan yang perlu di-commit:
- **Modified files (5):** Dashboard.tsx, EmployeeDatabase.tsx, SchedulePanel.tsx, HRContext.tsx, initialData.ts
- **Deleted files (6):** File OpenSpec lama dari `setup-git-commit-deploy-vercel` yang sudah dipindah ke archive
- **Untracked (9):** Folder archive OpenSpec (8 perubahan sebelumnya) + change `fix-schedule-cell-input` yang baru

## Goals / Non-Goals

**Goals:**
- Semua perubahan kode ter-commit dan ter-push ke GitHub
- Vercel auto-deploy terpicu dan build berjalan
- OpenSpec artifacts ikut ter-commit

**Non-Goals:**
- Tidak ada perubahan kode
- Tidak setup ulang Vercel

## Decisions

1. **Stage all-in-one** — satu commit besar lebih praktis untuk deploy. Commit message mencakup semua perubahan.
2. **OpenSpec archive ikut di-commit** — agar history perubahan terdokumentasi penuh di GitHub.

## Risks / Trade-offs

- Commit besar → sulit di-revert per-fitur. Tapi untuk deployment ke Vercel, ini lebih sederhana.
