# Mhadys

A modern full-stack web application built with **Next.js 16**, **React 19**, and **Supabase**, designed for both web and Android mobile deployment via Capacitor.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture Layers](#architecture-layers)
- [Getting Started](#getting-started)
- [Development](#development)
- [Mobile Deployment](#mobile-deployment)
- [Environment Variables](#environment-variables)

---

## Architecture Overview

Mhadys follows a **modern full-stack architecture** with clear separation of concerns across presentation, state management, data, and deployment layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js App Router (React 19)                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │   Layout    │  │   Pages     │  │   Components    │  │  │
│  │  │  (Root)     │  │  (Routes)   │  │  (shadcn/ui)    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  │         │                │                │               │  │
│  │  ┌──────▼────────────────▼────────────────▼───────┐     │  │
│  │  │           State Management Layer                │     │  │
│  │  │  ┌──────────────┐  ┌────────────────────────┐  │     │  │
│  │  │  │   Zustand    │  │  TanStack React Query  │  │     │  │
│  │  │  │ (Client State)│  │   (Server State)      │  │     │  │
│  │  │  └──────────────┘  └────────────────────────┘  │     │  │
│  │  └──────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Supabase)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │  Auth       │  │  Database   │  │  Storage            │    │
│  │  (Users)    │  │  (Postgres) │  │  (Files/Media)      │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Build Output
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TARGETS                           │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Static Host           │  │   Android (Capacitor)       │  │
│  │   (Vercel/Netlify)      │  │   (APK via Android Studio)  │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.2.10 | React framework with App Router |
| [React](https://react.dev/) | 19.2.4 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | 4.12.0 | Component library (Radix Nova style) |
| [Radix UI](https://www.radix-ui.com/) | 1.6.1 | Accessible primitive components |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Dark/light mode theming |
| [Lucide React](https://lucide.dev/) | 1.23.0 | Icon library |
| [Motion](https://motion.dev/) | 12.42.2 | Animations |

### State & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| [Zustand](https://docs.pmnd.rs/zustand) | 5.0.14 | Client-side state management |
| [TanStack React Query](https://tanstack.com/query) | 5.101.2 | Server state & caching |
| [Axios](https://axios-http.com/) | 1.18.1 | HTTP client |

### Forms & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| [React Hook Form](https://react-hook-form.com/) | 7.80.0 | Form state management |
| [Zod](https://zod.dev/) | 4.4.3 | Schema validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Supabase](https://supabase.com/) | 2.109.0 | Backend-as-a-Service |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) | 0.12.0 | SSR support |

### Mobile
| Technology | Version | Purpose |
|------------|---------|---------|
| [Capacitor](https://capacitorjs.com/) | 8.4.1 | Native mobile wrapper |

---

## Project Structure

```
mhadys/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (fonts, metadata)
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Global styles & Tailwind
│   └── favicon.ico                   # Favicon
│
├── components/                       # Reusable components
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── sonner.tsx                # Toast notifications
│       └── ... (25+ components)
│
├── lib/                              # Utilities
│   └── utils.ts                      # cn() class merger
│
├── public/                           # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── android/                          # Capacitor Android project
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/example/app/
│   │       │   └── MainActivity.java
│   │       └── res/                  # Android resources
│   ├── build.gradle
│   └── capacitor.settings.gradle
│
├── docs/                             # Documentation
│   └── architecture.md               # Detailed architecture docs
│
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js config (static export)
├── capacitor.config.ts               # Capacitor config
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn/ui config
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## Architecture Layers

### 1. Presentation Layer

**Next.js App Router** handles routing and rendering:
- **`app/layout.tsx`**: Root layout with Geist fonts, HTML structure, and metadata
- **`app/page.tsx`**: Main landing page
- **`app/globals.css`**: Tailwind CSS v4 imports, CSS variables for theming, dark mode support

**Component System** (shadcn/ui):
- Built on **Radix UI** primitives for accessibility
- Styled with **Tailwind CSS** and **class-variance-authority** for variants
- Uses `data-slot` attributes for styling hooks
- `cn()` utility merges classes with `clsx` + `tailwind-merge`

### 2. State Management Layer

| Layer | Technology | Use Case |
|-------|------------|----------|
| **Client State** | Zustand | Global UI state, user preferences |
| **Server State** | TanStack React Query | API data, caching, background refetching |
| **Form State** | React Hook Form | Form inputs, validation, submission |

### 3. Data Layer

**Supabase** provides:
- **Authentication**: Email/password, OAuth providers
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: File uploads and management
- **Edge Functions**: Serverless backend logic

**Axios** handles HTTP requests with interceptors for auth tokens.

### 4. Build & Deployment Layer

**Static Export Strategy**:
```typescript
// next.config.ts
{
  output: "export",        // Static site generation
  trailingSlash: true,     // Clean URLs
  images: { unoptimized: true }
}
```

**Mobile Build Pipeline**:
1. `npm run build` → Static files in `/out`
2. `npx cap sync android` → Syncs to Android project
3. Android Studio → Builds native APK

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Android Studio (for mobile builds)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local .env.local  # Add your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Development

### Available Scripts

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production (static export)
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding Components

```bash
# Add a shadcn/ui component
npx shadcn@latest add button
```

### Path Aliases

```typescript
// Use @/ to reference project root
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

---

## Mobile Deployment

### Build for Android

```bash
# 1. Build static export
npm run build

# 2. Sync to Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK/AAB from Android Studio
```

### Configuration

- **App ID**: `com.example.app`
- **App Name**: `mhadys`
- **Web Directory**: `out` (Next.js static export)

---

## Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Key Design Patterns

| Pattern | Implementation |
|---------|----------------|
| **Component Composition** | Radix UI primitives + Tailwind styling |
| **Variant System** | class-variance-authority (CVA) |
| **Class Merging** | `cn()` with clsx + tailwind-merge |
| **Theming** | CSS variables + next-themes |
| **Static Export** | Next.js `output: "export"` |
| **Type Safety** | TypeScript + Zod validation |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check code quality
5. Submit a pull request

---

## License

See [LICENSE](LICENSE) file for details.

---

## Documentation

For detailed architecture documentation, see [docs/architecture.md](docs/architecture.md).
