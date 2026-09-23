# AGENTS.md

Monorepo with two apps: `backend/` (Laravel 13 JSON API) and `frontend/` (Next.js storefront + admin console).

## Architecture

- The Laravel app is an API only. `backend/resources/views`, `routes/web.php`, and the Breeze auth pages are scaffold boilerplate — the real storefront and admin UI live entirely in `frontend/`.
- Backend serves JSON API on port `:8000`; frontend runs on `:3000`.
- Every frontend request must go through `frontend/lib/api.ts` (`api()`, `apiUpload()`, `downloadExport()`). Base URL is `NEXT_PUBLIC_API_URL ?? "http://localhost:8000"` — never hardcode URLs in components. A 401 on any `/api/admin/*` call auto-clears the token and redirects to `/admin/login`.
- Admin auth is a Sanctum personal access token (POST `/api/admin/login`) stored in `localStorage` under `admin_token`. APIs are unauthenticated for catalog except `/api/admin/*`, which requires `auth:sanctum`.
- All endpoints are defined in `backend/routes/api.php` (public catalog/orders/newsletter + `/api/admin/*`). Expects JSON for anything under `api/*` (see `backend/bootstrap/app.php`).
- Bilingual storefront (English + Arabic, RTL): copy lives in `frontend/lib/i18n.tsx`; admin-content fields have `_ar` variants (e.g. `name_ar`, `promo_title_ar`, `home.ar`). Storefront sections (hero, testimonials, marquee) render admin settings when present, else built-in defaults.
- Multi-currency is modeled end-to-end: products, prices, inventory batches all carry a `currency` code.
- Types in `frontend/types/index.ts` mirror the backend JSON. Laravel pagination is the `Paginated<T>` envelope; the public catalog returns `{ data, meta }`.

## Backend dev

- Start: `composer run dev` (or `php artisan serve`) — port 8000.
- MySQL: `backend/.env` is gitignored and uncommitted (currently db `landing`, user `admin` / pw `root`). Note the tracked `backend/.env.example` was deleted on disk.
- Setup a fresh DB: `php artisan migrate --seed`. The seeder creates an admin user + a complete demo catalog, routing all stock/orders through the services.
- Admin seed credentials default to `admin@portage.test` / `admin123`; override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.
- Stock and order logic must go through `backend/app/Services/{Inventory,Order,Product}Service.php` — seeders and controllers use them so batches/movements/stock stay consistent. Controller code also relies on `backend/app/helpers.php` (autoloaded via composer.json).
- Tests: `composer test` (Pest on in-memory SQLite per `phpunit.xml`; no MySQL needed). Only scaffold Breeze auth/profile tests exist — the catalog/admin API has **no** test coverage. Lint: `vendor/bin/pint`.
- `backend/landingpage.sql` is a stale manual phpMyAdmin dump from an earlier state — `database/migrations/` is the source of truth. Don't edit or import the dump.

## Frontend dev

- Commands: `npm run dev`, `npm run build`, `npm run lint`. There is no typecheck script — run `npx tsc --noEmit`.
- Next.js 16 + React 19 + Tailwind v4 + Radix/shadcn-style components in `components/ui/`. Read `frontend/AGENTS.md` first: it carries a `next dev`-managed warning that this Next version has breaking changes and that relevant guides live in `node_modules/next/dist/docs/`. Keep that managed block intact — it regenerates automatically.
- Cart/checkout state is in `lib/cart.tsx`; guest checkout posts to `/api/orders` (cash-on-delivery; prices/stock computed server-side).
- The admin console is part of the same Next app under `app/admin/*` (own layout + `/admin/login`).