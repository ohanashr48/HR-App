# OpenSpec — AI-Native Spec-Driven Development

Proyek ini menggunakan **OpenSpec** untuk menjaga kualitas dan konsistensi pengembangan. Selalu gunakan perintah OpenSpec saat memulai perubahan baru, bukan langsung coding.

## Perintah Cepat

| Perintah | Fungsi |
|----------|--------|
| `/opsx:propose <nama-fitur>` | Buat change + semua planning artifacts (proposal, specs, design, tasks) |
| `/opsx:apply` | Implementasi tasks dari change |
| `/opsx:explore` | Eksplorasi ide sebelum commit ke change |
| `/opsx:sync` | Merge delta specs ke main specs |
| `/opsx:archive` | Selesaikan dan arsipkan change |

## Cara Kerja

### 1. Mulai dengan `/opsx:propose`
```
/opsx:propose tambah-fitur-rekrutmen
```
Ini akan membuat folder `openspec/changes/tambah-fitur-rekrutmen/` dengan:
- `proposal.md` — kenapa dan apa yang berubah
- `specs/` — requirements detail (ADDED/MODIFIED/REMOVED)
- `design.md` — pendekatan teknis
- `tasks.md` — checklist implementasi

### 2. Implementasi dengan `/opsx:apply`
Kerjakan task satu per satu dari `tasks.md`, checklist selesai.

### 3. Arsipkan dengan `/opsx:archive`
Merge specs ke `openspec/specs/` dan pindahkan change ke archive.

## Stack Proyek

- **Frontend:** React 19 + TypeScript + Vite 6
- **Styling:** Tailwind CSS v4 + Motion (animasi)
- **Database:** Firebase Firestore
- **Backend:** Express
- **AI:** Google Gemini AI
- **Icons:** Lucide React

## Struktur OpenSpec

```
openspec/
├── specs/           # Source of truth — spesifikasi sistem
│   └── <domain>/
│       └── spec.md
├── changes/         # Proposed changes (satu folder per fitur)
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/
│           └── <domain>/
│               └── spec.md
└── config.yaml      # Konfigurasi proyek
```
