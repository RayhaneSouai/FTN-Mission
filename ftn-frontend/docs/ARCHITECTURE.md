# Frontend architecture (FTN)

All domain work lives under **`src/app/features/<domain>`** using the same shape:

| Area | Purpose |
|------|---------|
| `components/` | Smart and presentational UI for that domain |
| `services/` | HTTP and state for that domain |
| `models/` | TypeScript types and DTOs |
| `guards/` | Route guards (optional) |
| `styles/` | SCSS partials for the feature (optional) |
| `*.routes.ts` | Lazy-loaded route definitions (optional) |

Shared shell (not tied to one domain) lives in **`src/app/layout/`** (navbar, footer).

The root **`src/app/`** keeps only application wiring: `app.module.ts`, `app-routing.module.ts`, `app.component.*`.

## Current features

- **`layout/`** — `navbar`, `footer` (used in `AppComponent` template).
- **`features/home/`** — landing page.
- **`features/clubs/`** — clubs CRUD and listing (`components/club-list`, `services`, `models`).
- **`features/competitions/`** — competitions module (standalone components, lazy route `competition.routes.ts`).

## Adding a new domain (e.g. press, licenses)

1. Create `src/app/features/<name>/` with `components/`, `services/`, `models/` as needed.
2. Register routes in `app-routing.module.ts` (eager component or `loadChildren` to a `*.routes.ts` file in that feature).
3. Declare components in `AppModule` **or** use **standalone** components and import them only from their routes (same pattern as competitions).

## Backend

REST APIs stay in **`ftn-backend`**; feature services call them via absolute URLs or a future shared `environment` API prefix. No backend layout changes are required for this frontend structure.
