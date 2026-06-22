## Context

Aplikasi HR telah melalui beberapa perubahan signifikan (HRContext.tsx, EmployeeDatabase.tsx, LoginPage.tsx, SchedulePanel.tsx, initialData.ts, vite.config.ts) serta penambahan folder OpenSpec (`openspec/`, `.gemini/`, `.github/`, `AGENTS.md`). Semua perubahan ini masih di lokal dan belum ada di GitHub. Juga belum ada deployment otomatis ke Vercel.

## Goals / Non-Goals

**Goals:**
- Semua file perubahan ter-commit dan ter-push ke GitHub (branch main)
- Vercel terhubung dengan GitHub repo dan auto-deploy setiap push ke main
- User bisa langsung mengakses aplikasi via URL Vercel

**Non-Goals:**
- Tidak mengubah kode aplikasi
- Tidak setup domain kustom
- Tidak setup environment variable production (sudah via Firebase config)

## Decisions

1. **GitHub sebagai source of truth** — semua code di-push ke `github.com/ohanashr48/HR-App.git`
2. **Vercel + GitHub Integration** — cara termudah dan paling stabil untuk auto-deploy. Vercel akan otomatis mendeteksi push ke `main` dan menjalankan `vite build`
3. **No GitHub Actions** — Vercel integration sudah cukup untuk deployment. Tidak perlu workflow tambahan
4. **Commit terpisah untuk openspec/** — folder OpenSpec di-commit bersama perubahan code agar semuanya sinkron

## Risks / Trade-offs

- User harus login ke Vercel via browser (tidak bisa fully headless)
- Jika GitHub repo bersifat private, Vercel tetap bisa deploy (Vercel mendukung private repo)
- Build mungkin gagal jika ada dependency yang tidak cocok — perlu verifikasi setelah deploy
