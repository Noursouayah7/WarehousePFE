# Sprint Log — Warehouse Pfe (PFE Appendix)

This sprint log matches the sprint plan in `PROJECT_DOCUMENTARY.md` (Sprint 0 + Sprints 1–6). Each sprint lists concrete tasks, acceptance criteria, and demo steps you can include in your PFE report appendix.

---

## Sprint 0 — Project Setup & Research (Weeks 1-2)
Goal: Prepare environment, finalize stack, scaffold projects.

Tasks:
- Initialize Git repository and main branches (`main`, `dev`).
- Scaffold `warehouse-backend` (NestJS) and `warehouse-frontend` (Next.js App Router).
- Add `prisma` schema baseline and run `prisma migrate dev`.
- Configure Postgres local instance or Docker Compose.
- Add ESLint, Prettier, basic CI lint job (GitHub Actions or equivalent).
- Create initial `README.md` and `PROJECT_DOCUMENTARY.md`.

Acceptance criteria:
- `npm run dev` for both backend and frontend starts without fatal errors.
- `prisma migrate dev` and `prisma generate` succeed.
- README contains quick start and environment variables.

Demo steps:
1. Show the repository structure in VS Code (open root tree).
2. Start backend and frontend locally and show both landing pages running.
3. Run `prisma studio` or `psql` to show empty schema created.

Artifacts to attach: `README.md` snapshot, initial commit hash, Docker Compose (if used).

---

## Sprint 1 — Auth & Onboarding (Weeks 3-4)
Goal: Implement authentication, `PENDING` onboarding, and profile.

Tasks:
- Implement registration endpoint and hashed password storage.
- Implement login endpoint that returns JWT.
- Implement `PENDING` default role on registration.
- Implement guards to protect routes (JWT + Roles guard).
- Build frontend login, register, and pending pages.
- Add basic integration tests for auth endpoints.

Acceptance criteria:
- Users can register and appear as `PENDING` in the database.
- Login returns a valid JWT and protected endpoints return 401 when unauthenticated.
- Admin can change a user's role via API.

Demo steps:
1. Register a new user and show the `users` table row with `PENDING` role.
2. Attempt to access a protected endpoint without token (show 401).
3. Login as admin and change new user's role to `CUSTOMER`, then login as that user and access customer workspace.

Artifacts: sample JWT payload, test results, screenshots of login/register flows.

---

## Sprint 2 — User Management & RBAC (Weeks 5-6)
Goal: Full admin user governance and UI.

Tasks:
- Implement `/admin/users` endpoints (create, read, update, delete).
- Add `UpdateUserDto` to support role changes and profile edits.
- Create frontend admin users dashboard with role dropdown and delete action.
- Add server-side unit tests for guard-protected operations.

Acceptance criteria:
- Admin can list, create, update (including roles), and delete users via API and UI.
- Role-protected endpoints deny access to unauthorized roles (tests pass).

Demo steps:
1. Use admin UI to create a user with `MANAGER` role.
2. Show that a `MANAGER` token can access manager endpoints but cannot access admin-only endpoints.
3. Show unit test run and results for role guards.

Artifacts: API snippets, screenshots of admin users page, test logs.

---

## Sprint 3 — Warehouse & Bloc Management (Weeks 7-8)
Goal: Model storage, enforce capacity, and build management UI.

Tasks:
- Implement `Warehouse` and `Bloc` Prisma models and CRUD endpoints.
- Implement bloc `capacity` and `currentUsage` logic in services.
- Build admin warehouse pages for CRUD and bloc listing.
- Add validation that receiving stock cannot exceed bloc capacity.
- Add tests for capacity constraints.

Acceptance criteria:
- Admin can create/update/delete warehouses and blocs.
- Attempts to overfill a bloc produce a 4xx error and leave DB unchanged.

Demo steps:
1. Create a warehouse and two blocs via admin UI.
2. Demonstrate an attempted receive or product create that would exceed capacity and show the error.
3. Show test verifying capacity rule.

Artifacts: schema diff (Prisma), screenshots, test outputs.

---

## Sprint 4 — Product Catalog & Dynamic Pricing (Weeks 9-10)
Goal: Product CRUD, bloc assignment and pricing rules.

Tasks:
- Implement `Product` model and endpoints (CRUD, findByBloc).
- Add server-side `unitPrice` and `totalAmount` calculation logic.
- Optionally add simple quantity-tier pricing rules (e.g., discounts at thresholds).
- Frontend: admin product pages and customer product catalogue view.
- Tests for pricing calculation and product/bloc integrity.

Acceptance criteria:
- Products can be created/updated and assigned to blocs; product reads show quantity and price.
- `POST /orders/create` is validated against server-side `totalAmount` calculation.

Demo steps:
1. Create products via admin UI and assign to blocs.
2. Show customer product catalog with prices and availability.
3. Create an order and show server validation of `totalAmount`.

Artifacts: sample pricing rules, API call examples, screenshots.

---

## Sprint 5 — Orders & Shipments (Weeks 11-12)
Goal: Multi-item orders and shipment/restock lifecycle.

Tasks:
- Add `OrderItem` model and link to `Order`.
- Implement `POST /orders/create` to accept multiple items.
- Manager endpoints: approve/reject, mark delivered, create restock request.
- Implement shipment endpoints (create, in-transit, receive) with receive logic that updates stock and bloc usage atomically.
- Frontend: multi-item order modal, manager order list with actions.
- Integration tests for end-to-end flow (order create → approve → stock update).

Acceptance criteria:
- Customer can place multi-item orders; manager can approve/reject; stock decrements on approve.
- Shipment receive increments stock and respects bloc capacity.

Demo steps:
1. Place a multi-item order as a customer and show `orders` + `order_items` rows.
2. Approve as manager and show stock decrement in `products` table.
3. Create a shipment and receive it; show stock increment and bloc usage update.

Artifacts: SQL snapshots before/after approve/receive, integration test logs, UI screenshots.

---

## Sprint 6 — Inventory Ops, Support Tickets, Data & Chatbot, Real-time & Hardening (Weeks 13-16)
Goal: Complete operational UX, collect analytics data, add chatbot & real-time updates, and finalize PFE packaging.

Tasks:
- Technician-focused UI for product placement and quick quantity adjustments.
- Implement `SupportTicket` model and endpoints; add technician create and admin/manager boards.
- Add an operational events table to record receipts, placements, and manual adjustments.
- Implement simple ETL/export scripts that produce CSV snapshots for analytics.
- Integrate a lightweight browser chatbot for ticket creation (token-forwarding).
- Implement SSE or WebSocket to broadcast order/shipment status changes.
- Run E2E tests, finalize documentation, and prepare demo script for PFE.

Acceptance criteria:
- Technician can record product movements and open tickets; tickets route to admin/manager.
- Operational events are recorded and ETL exports a clean CSV sample.
- Chatbot can create a support ticket and confirm ticket ID.
- Real-time updates are visible to connected clients when statuses change.
- Demo script (documented in README) reproduces main flows for grading.

Demo steps:
1. Technician creates a ticket via chatbot; show ticket created via API and UI.
2. Trigger an order status change and show connected client receiving update via SSE/WebSocket.
3. Export operational events as CSV and open the CSV to show sample rows.
4. Run final E2E test and show green results.

Artifacts: CSV sample, chatbot request/response transcript, real-time demo recording or terminal logs, E2E test results.

---

## Appendix: Demo Script (single-page)
Use this script during your PFE demo to show the critical flows in 10–15 minutes.

1. Sprint 0 validation: show repo and `README` quick-start.
2. Auth & onboarding: register a user → show `PENDING` → admin role assignment → login as role.
3. Admin users: create a user and change role (show UI).
4. Warehouse/blocs: create a warehouse and bloc and demonstrate capacity protection.
5. Products: add product(s) and assign to bloc.
6. Customer order: place a multi-item order and show manager approval decrementing stock.
7. Shipment: create + receive shipment to restock; show stock update and event logged.
8. Technician & tickets: create a ticket via chatbot and update as admin.
9. Real-time: show order/shipment status update reflecting across clients.
10. Reports: export CSV and open sample.

---

If you want, I can now:
- create a printable `SPRINT_LOG.pdf` (requires a PDF generator on your machine),
- export the backlog into `BACKLOG.csv`, or
- render the Mermaid diagrams from `PROJECT_DOCUMENTARY.md` into PNGs for report figures.

Which should I do next?