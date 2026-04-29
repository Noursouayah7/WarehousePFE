# Warehouse Pfe Project Documentary

## 1. Executive Story

This project is a full-stack Warehouse Management System built as two coordinated applications:

- `warehouse-backend`: a NestJS API with Prisma + PostgreSQL.
- `warehouse-frontend`: a Next.js App Router client with role-based workspaces.

At a narrative level, the system tells a clear operational story:

1. A person can register and enters the system as `PENDING`.
2. An administrator validates users and assigns operational roles.
3. Customers place product orders.
4. Managers and admins review, approve, reject, or trigger restock requests.
5. Shipments move through inbound states and replenish stock.
6. Orders are eventually completed and marked delivered.

The application is designed around traceable status transitions and strict role-based access control.

---

## 2. System Architecture

### 2.1 Backend Architecture

The backend follows modular NestJS architecture:

- `AuthModule`: login and current-session identity (`/auth/login`, `/auth/me`).
- `UserModule`: registration/profile management.
- `AdminModule`: user governance and role assignment.
- `WarehouseModule`: warehouse master data.
- `BlocModule`: storage units inside warehouses.
- `ProductModule`: inventory records linked to blocs.
- `OrderModule`: customer demand and delivery lifecycle.
- `ShipmentModule`: inbound logistics and restock completion.
- `PrismaModule`: persistence adapter.

Persistence is modeled in Prisma with strongly typed enums for roles and workflow states.

### 2.2 Frontend Architecture

The frontend uses Next.js with App Router plus client-side role state:

- Auth context keeps in-memory token and role.
- Route guard component (`AuthRedirect`) enforces access mode:
  - public-only pages (login/register).
  - protected pages with allowed role lists.
- Dedicated role areas under `/admin`, `/manager`, `/technicien`, `/customer`, and `/pending`.

This gives each actor a focused workspace while reusing shared shell/navigation components.

---

## 3. Domain Model and Entities

### 3.1 Core Entities

- `User`: identity, contact info, CIN, role.
- `Warehouse`: top-level physical facility.
- `Bloc`: storage subdivision of a warehouse, with capacity and current usage.
- `Product`: inventory item in a specific bloc.
- `Order`: customer demand request with approval and delivery state.
- `Shipment`: inbound replenishment unit, optionally linked to an order.

### 3.2 Key Enums (Business States)

- `UserRole`: `ADMIN`, `MANAGER`, `TECHNICIEN`, `CUSTOMER`, `PENDING`.
- `OrderStatus`: `PENDING`, `APPROVED`, `REJECTED`, `RESTOCK_REQUESTED`, `COMPLETED`.
- `DeliveryStatus`: `PENDING`, `IN_DELIVERY`, `DELIVERED`.
- `ShipmentStatus`: `REQUESTED`, `IN_TRANSIT`, `RECEIVED`.

### 3.3 Data Integrity Logic

Operational integrity is encoded directly in service logic:

- Bloc usage cannot exceed bloc capacity.
- Product create/update/delete updates bloc usage atomically.
- Order approval checks aggregate stock across matching products.
- Shipment receiving checks capacity and only then increments stock.
- Shipment receive can reset linked order status for re-review.

The project heavily uses transactions for consistency in stock movements.

---

## 4. Actors and User Roles (Detailed)

This section describes each actor as implemented by backend guards and frontend routing.

### 4.1 Actor: Administrator (`ADMIN`)

Mission:
- Governance and system control.
- User lifecycle supervision.
- Full participation in operational decision points (orders, stock structures).

Backend capabilities:
- Full `/admin/users` management (create/read/update/delete users).
- Can access order decision endpoints (`approve`, `reject`, `restock-request`, `delivered`).
- Can manage warehouses and blocs.
- Can manage products.
- Can access shipment management endpoints.

Frontend experience:
- Redirect target: `/admin`.
- Main areas: users, warehouses, warehouse details/blocs, products, profile.
- Critical responsibility: moving users out of `PENDING` into active roles.

Narrative importance:
- Administrator is the gatekeeper that transforms anonymous registration into controlled access.
- This role is the primary policy actor of the platform.

### 4.2 Actor: Manager (`MANAGER`)

Mission:
- Orchestrate the fulfillment lifecycle from pending order to delivery.
- Drive restock decisions when stock is insufficient.

Backend capabilities:
- Read all orders.
- Approve/reject orders.
- Trigger restock requests for specific blocs.
- Mark orders as delivered.
- Full shipment operations (`create`, `in-transit`, `receive`, etc.).
- Manage warehouses, blocs, and products (shared with admin/technicien depending on area).

Frontend experience:
- Redirect target: `/manager`.
- Workspaces:
  - Orders (table/kanban/calendar perspective, action buttons).
  - Shipments (transit + receive workflows).
  - Products and Warehouses (operational visibility).

Narrative importance:
- Manager is the control tower of the warehouse: converting demand signals into stock, shipment, and delivery actions.

### 4.3 Actor: Technician (`TECHNICIEN`)

Mission:
- Maintain inventory-level operations.

Backend capabilities:
- Product management rights exist in backend role guards for product endpoints.
- No warehouse/bloc structural management rights.

Frontend experience:
- Redirect target: `/technicien`.
- Current dashboard is lighter and mostly a shell for product-centric work.

Narrative importance:
- Technician is modeled as an operational specialist role, currently less feature-rich on UI than manager/admin.
- The backend already reserves a meaningful product-management authority for this role.

### 4.4 Actor: Customer (`CUSTOMER`)

Mission:
- Discover available products and submit demand.
- Track progress of own orders.

Backend capabilities:
- Access only customer-specific order endpoints:
  - available product names + total quantities.
  - own order list.
  - order creation.
  - order tracking restricted to own order ID.

Frontend experience:
- Redirect target: `/customer`.
- Workspace tabs:
  - Products list.
  - Orders list with status filtering.
  - New order form prefilled from profile data.

Narrative importance:
- Customer is the demand origin actor.
- Their actions trigger internal workflows handled by manager/admin.

### 4.5 Actor: Pending User (`PENDING`)

Mission:
- Await administrative approval and role assignment.

Backend/registration behavior:
- Public registration endpoint creates users as `PENDING`.
- This role cannot enter operational workspaces.

Frontend behavior:
- Redirect target: `/pending`.
- Pending page communicates approval waiting state.

Narrative importance:
- This role is a deliberate quarantine state to protect business operations from unvetted access.

---

## 5. End-to-End Workflow Documentary

### 5.1 Onboarding and Access Control Flow

1. User registers through public registration.
2. Backend stores hashed password and marks role `PENDING`.
3. User can authenticate but is redirected to pending workspace.
4. Admin reviews user and updates role.
5. On next login, role-based redirect lands the user in the assigned domain workspace.

This creates a secure two-step onboarding: account creation then authorization.

### 5.2 Customer Order Lifecycle

1. Customer browses available product aggregates (`/orders/products`).
2. Customer submits order (`/orders/create`).
3. Order starts `PENDING` and waits manager/admin decision.
4. Decision branch:
   - Approve: stock is decremented, delivery goes in-progress.
   - Reject: rejection reason is persisted.
   - Restock request: order enters restock waiting path.
5. Delivered marking closes lifecycle into `COMPLETED` + `DELIVERED`.

### 5.3 Restock and Shipment Lifecycle

1. Restock request creates shipment tied to order and bloc.
2. Shipment transitions:
   - `REQUESTED` -> `IN_TRANSIT` -> `RECEIVED`.
3. On receive:
   - capacity validation runs,
   - product quantity increments,
   - bloc usage increments,
   - linked order may be reset to pending review.

This loop couples replenishment with order readiness.

### 5.4 Capacity and Inventory Control

Capacity is not decorative metadata; it actively constrains operations:

- Product creation/update enforces bloc capacity margins.
- Shipment reception cannot overfill a bloc.
- Order approval consumes stock and reduces bloc usage accordingly.

The system models physical limits as first-class domain rules.

---

## 6. Role-to-Capability Matrix

### 6.1 Functional Summary

- `ADMIN`
  - User governance.
  - Full operational control across warehouses, blocs, products, orders, shipments.
- `MANAGER`
  - Operational execution: orders and shipments.
  - Broad inventory visibility and management tooling.
- `TECHNICIEN`
  - Product-focused inventory role.
  - Restricted from warehouse/bloc structural governance.
- `CUSTOMER`
  - Create and monitor own orders only.
- `PENDING`
  - Authenticated but blocked from operations pending approval.

### 6.2 Security Model Notes

- Role checks are enforced server-side by guards and decorators.
- Frontend route guards improve UX but backend remains final authority.
- JWT payload carries role and identity claims used for guard decisions.

---

## 7. UX and Product Design Perspective

The frontend intentionally separates concerns by actor workspaces:

- Admin area: governance and configuration.
- Manager area: high-tempo operational actions.
- Customer area: simplified demand + tracking experience.
- Pending area: waiting room to avoid unauthorized workflow access.

Common UX patterns include:

- role-colored workspace shells,
- status badges,
- optimistic refresh after actions,
- explicit error extraction from backend messages.

---

## 8. Technical Strengths and Observations

### 8.1 Strengths

- Clean domain model and status-driven workflow.
- Strong role taxonomy with practical business meaning.
- Transactional updates for stock-sensitive operations.
- Clear separation between customer-facing demand and internal fulfillment.
- Frontend route segmentation mirrors backend role model well.

### 8.2 Observations / Opportunities

- Some controllers still import guards from `auth_old` paths while app uses current auth module; behavior works but consolidation would reduce architectural ambiguity.
- Frontend auth state is memory-only (token not persisted across reload), which may be intentional for security but impacts session continuity.
- Technician backend authority is richer than current technician UI, suggesting room to expand this workspace.

---

## 9. Documentary Conclusion

Warehouse Pfe is a role-driven warehouse operations platform where identity, approval, inventory capacity, and fulfillment state transitions are tightly connected.

The heart of the system is not just CRUD over warehouses and products; it is the choreography between actors:

- customers create demand,
- managers/admins arbitrate fulfillment,
- shipments restore supply,
- administrators enforce governance,
- pending users are held until explicitly trusted.

In short, this project behaves like an operational control system with layered access, physical constraints, and traceable business state changes, rather than a simple inventory listing tool.
