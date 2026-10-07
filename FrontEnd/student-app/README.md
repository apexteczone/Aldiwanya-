# ⚡ TechZone — React & Tailwind Frontend Workspace

A modern, high-performance React frontend project configured with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite 8**.

---

## 🚀 Quick Start

The development server is already prepared. To start coding:

```bash
# 1. Start the Vite development server (hot reload enabled)
npm run dev

# 2. Type-check and build for production
npm run build

# 3. Preview production build locally
npm run preview

# 4. Run Oxlint code analysis
npm run lint
```

---

## 🛠️ Stack & Tooling

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.2.x` | Modern UI library with concurrent rendering & actions |
| **TypeScript** | `6.0.x` | Type safety and autocompletion |
| **Tailwind CSS** | `4.3.x` | Zero-config, CSS-first modern utility engine |
| **Vite** | `8.3.x` | Ultra-fast build tool and development server |
| **Lucide React** | Latest | Lightweight, modern icon library |
| **clsx & tailwind-merge** | Latest | Conflict-free conditional CSS classes |

---

## 📂 Directory Layout

```
TechZone/
├── public/                 # Static assets served directly
├── src/
│   ├── assets/             # Images, SVGs, and media
│   ├── components/         # Feature components & views
│   │   ├── ui/             # Design system atomic components
│   │   │   ├── Button.tsx  # Multi-variant button component
│   │   │   ├── Card.tsx    # Glassmorphism container card
│   │   │   └── Badge.tsx   # Status & category badges
│   │   ├── Header.tsx      # Sticky navigation bar
│   │   ├── Footer.tsx      # Application footer
│   │   └── ...
│   ├── hooks/              # Custom React hooks (e.g. useLocalStorage)
│   ├── types/              # TypeScript interface & type declarations
│   ├── utils/              # Helper utilities (e.g. cn for Tailwind merge)
│   ├── App.tsx             # Root React view
│   ├── index.css           # Global Tailwind CSS imports & base styles
│   └── main.tsx            # React DOM mounting entrypoint
├── index.html              # HTML shell with Google Fonts preloaded
├── tsconfig.json           # TypeScript project configuration & @/ alias
├── vite.config.ts          # Vite configuration with Tailwind v4 & aliases
└── package.json            # Scripts and dependencies
```

---

## 🧩 Path Aliases

You can import any file inside `src/` using the `@/` alias:

```tsx
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { TechStackItem } from '@/types'
```
