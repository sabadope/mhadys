# STRUCTURE.md — mhadys (Nimbus OS)

> Navigation guide: **where is each file, and what does it do?**
> Repo: https://github.com/sabadope/mhadys (branch `main`)

## 1. What this repo is

A premium, dark, "Liquid Glass" **3-in-1 SaaS frontend MVP** (product name in code: **Nimbus OS**) combining three business modules in one shell:

| Module    | Module ID  | Route prefix    | Purpose                                                    |
| --------- | ---------- | --------------- | ---------------------------------------------------------- |
| Event     | `event`    | `/app/events`   | Events, tickets, bookings, attendees, QR check-in          |
| Commerce  | `commerce` | `/app/commerce` | Products, inventory, orders, discounts, storefront         |
| Auto Care | `autocare` | `/app/autocare` | Appointments, vehicles, services, work orders, bays, staff |

It is a **frontend-only MVP**: all data is mock data held in a local store, structured so it can later be swapped for a real backend (REST / GraphQL / Supabase).

## 2. Tech stack

- **Framework:** TanStack Start + TanStack Router (file-based routing), React 19, TypeScript
- **Build:** Vite (via `@lovable.dev/vite-tanstack-config`), Tailwind CSS v4
- **UI:** shadcn/ui (new-york style, Radix), Lucide icons, Motion (Framer Motion successor), cmdk, date-fns, react-day-picker
- **Data:** TanStack Query + local in-memory store (`src/lib/store.tsx`)
- **Package managers present:** npm (`package-lock.json`) and bun (`bun.lock`)
- **Origin:** generated and synced with [Lovable](https://lovable.dev); see `AGENTS.md`

## 3. Top-level tree

```
mhadys/
├── .lovable/            Lovable project metadata (do not edit)
├── docs/                Architecture, system design, UI patterns
├── public/              Static files served as-is (favicon, robots.txt)
├── src/                 ALL application code (see section 4)
├── AGENTS.md            Rules for AI agents (don't rewrite pushed git history; Lovable sync)
├── INSTRUCTION.md       Copy-instructions for the standalone glass-button.css
├── README.md            Contains the original product brief / prompt + dev setup
├── SYSTEM_DESIGN.md     System design document (root copy; also in docs/)
├── glass-button.css     Standalone, zero-dependency glass button styles (not part of the app build)
├── components.json      shadcn/ui config (aliases, style, Tailwind CSS path)
├── eslint.config.js     ESLint config
├── .prettierrc / .prettierignore   Prettier config
├── bunfig.toml / bun.lock          Bun config + lockfile
├── package.json / package-lock.json  Dependencies and scripts
├── tsconfig.json        TypeScript config (`@/` alias → `src/`)
└── vite.config.ts       Vite config (Lovable TanStack preset; server entry → src/server.ts)
```

**Scripts:** `npm run dev` · `build` · `build:dev` · `preview` · `lint` · `format`

## 4. `src/` in detail

```
src/
├── assets/          Images used by mock data
├── components/      Reusable UI, grouped by purpose
├── data/            Mock data per module
├── hooks/           Custom React hooks
├── lib/             Utilities, store, session, navigation, error handling
├── routes/          Pages (file-based routing)
├── types/           Domain TypeScript types
├── router.tsx       Router + QueryClient creation
├── routeTree.gen.ts AUTO-GENERATED route tree (never edit by hand)
├── server.ts        SSR entry with error-handling wrapper
├── start.ts         TanStack Start setup + error middleware
└── styles.css       Tailwind import, design tokens, theme, glass styles
```

### 4.1 `src/assets/`

| Path                  | Contents                                                |
| --------------------- | ------------------------------------------------------- |
| `auth-bg.jpg`         | Login/landing background                                |
| `autocare/studio.jpg` | Auto Care visual                                        |
| `events/`             | `summit.jpg`, `workshop.jpg`, `expo.jpg` (event covers) |
| `products/`           | `hoodie.jpg`, `shirt.jpg`, `cap.jpg`, `jacket.jpg`      |

### 4.2 `src/components/`

**`shell/`: app frame (layout)**

| File                     | Role                                                  |
| ------------------------ | ----------------------------------------------------- |
| `AppShell.tsx`           | Main layout: top bar + sidebar + content + mobile nav |
| `Sidebar.tsx`            | Desktop sidebar (changes per active module)           |
| `TopBar.tsx`             | Top navigation (search, notifications, help, avatar)  |
| `ModuleSwitcher.tsx`     | Event / Commerce / Auto Care workspace switcher       |
| `MobileNav.tsx`          | Mobile bottom navigation                              |
| `SearchCommand.tsx`      | Global Cmd/Ctrl+K command palette                     |
| `NotificationCenter.tsx` | Notifications panel (read/unread)                     |
| `Brand.tsx`              | Logo / product name                                   |

**`kit/`: shared design-system components** (barrel export: `kit/index.ts`)

| File                | Role                                              |
| ------------------- | ------------------------------------------------- |
| `GlassPanel.tsx`    | Glass surface container                           |
| `MetricCard.tsx`    | Metric/stat display                               |
| `DataTable.tsx`     | Reusable table (cards on mobile)                  |
| `StatusBadge.tsx`   | Status pill (tone from `lib/status.ts`)           |
| `PageHeader.tsx`    | Page title/heading block                          |
| `FormField.tsx`     | Form field wrapper                                |
| `ConfirmDialog.tsx` | Confirmation modal                                |
| `PaymentPanel.tsx`  | Shared payment UI (cash / card / online)          |
| `Timeline.tsx`      | Generic timeline (used by order/work-order flows) |
| `Charts.tsx`        | Chart components                                  |
| `Avatar.tsx`        | Avatar                                            |
| `States.tsx`        | Empty / loading / error states                    |

**`events/`:** `EventCard`, `EventCalendar`, `TicketCard`, `DigitalTicket`, `AttendeeTable`, `CapacityBar`, `QRCodeCheckIn`
**`commerce/`:** `ProductCard`, `Cart`, `OrderTimeline`, `StockAdjustDialog`, `VariantEditor`, `StoreLayout` (storefront layout)
**`autocare/`:** `BayCard`, `ResourceScheduler` (service + staff + bay + time), `ServiceCard`, `ServiceTimeline`, `StaffCard`, `VehicleBadge`, `VehicleCard`, `WorkOrderCard`, `lib.ts` (Auto Care helpers)

**`ui/`: shadcn/ui primitives** (accordion, button, dialog, drawer, sheet, select, tabs, table, sidebar, sonner, etc.). Generated by shadcn; prefer wrapping them over editing them. Add new ones via the shadcn CLI (`components.json`).

### 4.3 `src/data/`: mock data (the future-backend seam)

| File           | Contents                                                            |
| -------------- | ------------------------------------------------------------------- |
| `events.ts`    | Events, bookings, attendees                                         |
| `commerce.ts`  | Categories, products, orders, discounts                             |
| `autocare.ts`  | Services, add-ons, vehicles, appointments, work orders, staff, bays |
| `customers.ts` | Current user, business, customers                                   |
| `shared.ts`    | Notifications, payments, activity feed                              |

### 4.4 `src/lib/`

| File                                                              | Role                                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `store.tsx`                                                       | **Local app store**: all collections + `actions`. Replace its bodies with API calls to connect a backend |
| `session.ts`                                                      | Demo/account session (localStorage key `nimbus.session`)                                                 |
| `navigation.ts`                                                   | Sidebar / mobile nav definitions per module (icons + links)                                              |
| `status.ts`                                                       | Maps statuses → badge tones                                                                              |
| `format.ts`                                                       | `peso()` currency, date helpers, fixed demo `TODAY` / `NOW`                                              |
| `utils.ts`                                                        | `cn()` class merge helper                                                                                |
| `error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts` | SSR/runtime error handling and reporting                                                                 |

### 4.5 `src/hooks/`

- `use-mobile.tsx`: mobile breakpoint detection
- `use-simulated-loading.ts`: fake loading to show skeleton states

### 4.6 `src/types/index.ts`

All domain types in one file: `ModuleId`, User, Business, Customer, Event, Ticket, Booking, Attendee, Product, Order, Vehicle, Service, Appointment, WorkOrder, StaffMember, Bay, Payment, Notification, etc.

## 5. Routes (`src/routes/`)

File naming → URL: dots become slashes, `$param` is dynamic, `index` is the folder root. **Never edit `routeTree.gen.ts`.**

### Public / entry

| File                     | URL                                     |
| ------------------------ | --------------------------------------- |
| `__root.tsx`             | Root layout wrapping every page         |
| `index.tsx`              | `/` landing                             |
| `login.tsx`              | `/login` (includes Demo mode)           |
| `pricing.tsx`            | `/pricing`                              |
| `book.index.tsx`         | `/book` customer event browsing         |
| `book.$eventId.tsx`      | `/book/:eventId` event booking/checkout |
| `store.index.tsx`        | `/store` storefront                     |
| `store.$slug.tsx`        | `/store/:slug` product detail           |
| `store.cart.tsx`         | `/store/cart`                           |
| `store.checkout.tsx`     | `/store/checkout`                       |
| `store.confirmation.tsx` | `/store/confirmation`                   |

### App (authenticated shell: `app.tsx` is the layout)

| File                                                        | URL                                    |
| ----------------------------------------------------------- | -------------------------------------- |
| `app.tsx`                                                   | `/app` layout (AppShell)               |
| `app.index.tsx`                                             | `/app` global dashboard                |
| `app.modules.tsx`                                           | `/app/modules` mobile module picker    |
| `app.activity.tsx`                                          | `/app/activity`                        |
| `app.notifications.tsx`                                     | `/app/notifications`                   |
| `app.reports.tsx`                                           | `/app/reports`                         |
| `app.settings.tsx`                                          | `/app/settings`                        |
| `app.customers.index.tsx` / `app.customers.$customerId.tsx` | `/app/customers`, `/app/customers/:id` |

**Events** (`/app/events/...`): `index` (dashboard), `list`, `new`, `$eventId`, `calendar`, `bookings`, `attendees`, `tickets`, `checkin`
**Commerce** (`/app/commerce/...`): `index`, `products.index`, `products.new`, `products.$productId`, `categories`, `inventory`, `orders.index`, `orders.$orderId`, `customers`, `discounts`
**Auto Care** (`/app/autocare/...`): `index`, `appointments.index`, `appointments.new` (booking flow), `calendar` (resource scheduling), `vehicles.index`, `vehicles.$vehicleId`, `services`, `work-orders.index`, `work-orders.$workOrderId`, `staff`, `bays`, `customers`, `payments`

(Each is a file named `app.<module>.<page>.tsx` in `src/routes/`.)

## 6. Docs

| File                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `docs/architecture.md`  | Technical structure: component hierarchy, routing, state, data flow |
| `docs/system-design.md` | System design                                                       |
| `docs/ui-patterns.md`   | UI/design patterns                                                  |
| `src/routes/README.md`  | File-based routing conventions for TanStack Start                   |

## 7. "I want to change X → go to Y"

| Task                                          | Location                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| Add/edit a page                               | `src/routes/` (new file → route auto-generated)                                 |
| Change sidebar / bottom-nav links             | `src/lib/navigation.ts`                                                         |
| Change app layout, top bar, module switcher   | `src/components/shell/`                                                         |
| Change colors, tokens, glass look, fonts      | `src/styles.css`                                                                |
| Reusable glass panel / table / badge / metric | `src/components/kit/`                                                           |
| Add a status color                            | `src/lib/status.ts`                                                             |
| Edit mock data                                | `src/data/<module>.ts`                                                          |
| Add/change a data type                        | `src/types/index.ts`                                                            |
| Mutate or connect real data/API               | `src/lib/store.tsx`                                                             |
| Currency/date formatting, demo "today"        | `src/lib/format.ts`                                                             |
| Demo mode / session                           | `src/lib/session.ts`, `src/routes/login.tsx`                                    |
| Event QR check-in                             | `components/events/QRCodeCheckIn.tsx`, `routes/app.events.checkin.tsx`          |
| Bay/staff/time scheduling                     | `components/autocare/ResourceScheduler.tsx`, `routes/app.autocare.calendar.tsx` |
| Order status timeline                         | `components/commerce/OrderTimeline.tsx`                                         |
| Shared payment UI                             | `components/kit/PaymentPanel.tsx`                                               |
| Global search (Cmd+K)                         | `components/shell/SearchCommand.tsx`                                            |
| Add a shadcn component                        | `npx shadcn add <name>` → `src/components/ui/`                                  |
| Build/dev config                              | `vite.config.ts`, `package.json`                                                |

## 8. Rules / gotchas

- **Do not edit** `src/routeTree.gen.ts` (auto-generated).
- **Do not use** Next.js conventions (`src/pages/`, `app/layout.tsx`). The only root layout is `src/routes/__root.tsx`.
- **Do not add** TanStack/Tailwind/tsconfig-paths plugins to `vite.config.ts`; the Lovable preset already includes them.
- **Do not rewrite pushed git history** (force-push, rebase, amend). It breaks Lovable sync.
- Import with the `@/` alias (`@/components/...`, `@/lib/...`).
- Keep business logic in `lib/` and `data/`, not inside JSX.
- `glass-button.css` and `INSTRUCTION.md` are a standalone copy-paste asset, separate from the app's styling in `src/styles.css`.
