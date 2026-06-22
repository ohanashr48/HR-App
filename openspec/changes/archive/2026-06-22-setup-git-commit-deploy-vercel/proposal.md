## Why

Semua perubahan pada aplikasi HR (HRContext.tsx, EmployeeDatabase, dll.) serta folder OpenSpec (`openspec/`, `.gemini/`, `.github/`) belum di-commit ke GitHub. Selain itu, aplikasi belum ter-deploy secara otomatis ke Vercel. Perlu dilakukan commit, push, dan setup CI/CD agar setiap perubahan otomatis live.

## What Changes

1. Commit semua perubahan yang ada (6 modified files + 4 untracked items) ke GitHub
2. Setup Vercel auto-deployment agar setiap push ke `main` otomatis di-deploy

## Capabilities

### New Capabilities
- `git-commit-push`: Stage, commit, dan push semua perubahan ke GitHub
- `vercel-auto-deploy`: Setup Vercel deployment yang terhubung ke GitHub repo

### Modified Capabilities
- (none)

## Impact

- Semua file di lokal akan tersimpan di GitHub
- Setiap push ke `main` akan otomatis mendeploy aplikasi ke Vercel
- Membutuhkan login Vercel (user perlu login via browser)
