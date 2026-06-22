## ADDED Requirements

### Requirement: vercel-login
User harus login ke Vercel via CLI agar bisa deploy.

#### Scenario: login via browser
- **WHEN** perintah `npx vercel login` dijalankan
- **THEN** browser terbuka untuk login Vercel
- **THEN** setelah login, CLI akan terautentikasi

### Requirement: vercel-project-link
Project lokal harus terhubung ke Vercel project.

#### Scenario: link project ke Vercel
- **WHEN** perintah `npx vercel link` dijalankan
- **THEN** project terdaftar di Vercel dengan nama sesuai folder
- **THEN** file `.vercel/project.json` dibuat

### Requirement: vercel-auto-deploy
Setiap push ke GitHub branch main harus otomatis memicu deployment ke Vercel.

#### Scenario: GitHub integration
- **WHEN** Vercel project terhubung dengan GitHub repo
- **THEN** setiap push ke main otomatis trigger build dan deploy
- **THEN** aplikasi bisa diakses via URL Vercel (.vercel.app)
