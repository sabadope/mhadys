# Mhadys Application Architecture

## Overview

**Mhadys** is a modern full-stack web application built with **Next.js 16** and **React 19**, designed for both web and mobile (Android) deployment. The application uses a component-driven architecture with shadcn/ui, Supabase for backend services, and Capacitor for native mobile packaging.

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.10 | React framework with App Router |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui** | 4.12.0 | Component library (Radix Nova style) |
| **Radix UI** | 1.6.1 | Accessible primitive components |
| **next-themes** | 0.4.6 | Dark/light mode theming |
| **Lucide React** | 1.23.0 | Icon library |
| **Motion (Framer Motion)** | 12.42.2 | Animations |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 5.0.14 | Client-side state management |
| **TanStack React Query** | 5.101.2 | Server state management & caching |
| **Axios** | 1.18.1 | HTTP client |

### Forms & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.80.0 | Form state management |
| **Zod** | 4.4.3 | Schema validation |
| **@hookform/resolvers** | 5.4.0 | Form validation integration |

### Backend & Auth
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.109.0 | Backend-as-a-Service (auth, database, storage) |
| **@supabase/ssr** | 0.12.0 | Supabase SSR support |

### Mobile Deployment
| Technology | Version | Purpose |
|------------|---------|---------|
| **Capacitor** | 8.4.1 | Native mobile app wrapper |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **clsx** | 2.1.1 | Conditional class names |
| **tailwind-merge** | 3.6.0 | Tailwind class merging |
| **class-variance-authority** | 0.7.1 | Component variant management |
| **date-fns** | 4.4.0 | Date utilities |
| **Sonner** | 2.0.7 | Toast notifications |
| **react-day-picker** | 10.0.1 | Calendar/date picker |
| **react-icons** | 5.7.0 | Additional icon library |

---

## Project Structure

```
mhadys/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with fonts & metadata
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles & Tailwind imports
│   └── favicon.ico               # Favicon
│
├── components/                   # Reusable UI components
│   └── ui/                       # shadcn/ui components
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── navigation-menu.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── lib/                          # Utility functions
│   └── utils.ts                  # cn() helper for class merging
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── android/                      # Capacitor Android project
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/example/app/
│   │       │   └── MainActivity.java
│   │       └── res/              # Android resources
│   ├── build.gradle
│   ├── capacitor.settings.gradle
│   └── ...
│
├── docs/                         # Documentation
│   └── architecture.md           # This file
│
├── .env.local                    # Environment variables (Supabase)
├── next.config.ts                # Next.js configuration
├── capacitor.config.ts           # Capacitor configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.mjs            # PostCSS configuration
├── components.json               # shadcn/ui configuration
├── package.json                  # Dependencies & scripts
├── eslint.config.mjs             # ESLint configuration
└── README.md                     # Project README
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

#### App Router Structure
- **`app/layout.tsx`**: Root layout with Geist font families, HTML structure, and metadata
- **`app/page.tsx`**: Main landing page
- **`app/globals.css`**: Global styles with Tailwind CSS v4, CSS variables for theming, and dark mode support

#### Component Architecture
- **shadcn/ui Components**: Located in `components/ui/`, built on Radix UI primitives with Tailwind CSS styling
- **Component Pattern**: Each component uses `data-slot` attributes for styling hooks and `cn()` utility for class merging
- **Variant System**: Uses `class-variance-authority` (CVA) for component variants (e.g., Button variants)

#### Theming
- **CSS Variables**: Custom properties defined in `:root` and `.dark` selectors
- **next-themes**: Handles theme switching between light/dark modes
- **Color System**: Uses OKLCH color space for perceptually uniform colors

### 2. State Management Layer

#### Client State (Zustand)
- Lightweight state management for global client state
- Used for UI state, user preferences, and application-level data

#### Server State (TanStack React Query)
- Caching, background refetching, and optimistic updates
- Manages API responses and server-side data synchronization

#### Form State (React Hook Form)
- Form validation and state management
- Integrated with Zod for schema validation via `@hookform/resolvers`

### 3. Data Layer

#### Supabase Integration
- **Authentication**: User auth via Supabase Auth
- **Database**: PostgreSQL via Supabase
- **Storage**: File storage via Supabase Storage
- **SSR Support**: `@supabase/ssr` for server-side rendering compatibility

#### HTTP Client
- **Axios**: Used for API requests with interceptors for auth tokens

### 4. Build & Deployment Layer

#### Next.js Configuration
```typescript
// next.config.ts
{
  output: "export",      // Static site generation
  trailingSlash: true,   // Clean URLs
  images: { unoptimized: true }  // Static image handling
}
```

#### Capacitor Configuration
```typescript
// capacitor.config.ts
{
  appId: 'com.example.app',
  appName: 'mhadys',
  webDir: 'out'  // Points to Next.js static export
}
```

#### Build Pipeline
1. `npm run build` → Next.js builds static export to `/out`
2. `npx cap sync android` → Syncs web assets to Android project
3. Android Studio/Gradle builds native APK

---

## Key Design Patterns

### 1. Component Composition
- Components are built as composable primitives (e.g., Card, Dialog, Select)
- Uses Radix UI for accessible, unstyled primitives
- Styled with Tailwind CSS and CVA variants

### 2. Utility-First Styling
- `cn()` function merges Tailwind classes with `clsx` and `tailwind-merge`
- CSS variables for dynamic theming
- Dark mode via `.dark` class selector

### 3. Type Safety
- Full TypeScript coverage
- Zod schemas for runtime validation
- Path aliases (`@/*` → `./*`)

### 4. Static Export Strategy
- Next.js configured for static site generation (`output: "export"`)
- Enables deployment to any static host (Vercel, Netlify, etc.)
- Compatible with Capacitor for mobile builds

---

## Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Path Aliases
```json
{
  "@/*": ["./*"]
}
```

---

## Development Workflow

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production (static export)
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Mobile Development
```bash
npm run build
npx cap sync android
npx cap open android  # Opens Android Studio
```

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js 16 + React 19** | Latest features, improved performance, Server Components |
| **Static Export** | Simplifies deployment, enables Capacitor mobile builds |
| **shadcn/ui** | Copy-paste components, full customization control |
| **Supabase** | Rapid backend development, built-in auth & database |
| **Zustand + React Query** | Separation of client vs server state concerns |
| **Tailwind CSS v4** | Modern CSS features, improved performance |
| **Capacitor** | Single codebase for web and Android |

---

## Future Considerations

- Add more feature routes in `app/` directory
- Implement authentication flows with Supabase
- Add API routes or route handlers for backend logic
- Expand Zustand stores for global state
- Add more shadcn/ui components as needed
- Implement error boundaries and loading states
- Add testing framework (Jest/Vitest + Testing Library)
