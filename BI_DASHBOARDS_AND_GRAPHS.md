# BI Dashboards and Graphs

This document describes the Business Intelligence dashboards and visual analytics currently implemented in the warehouse management system.

## Purpose

The BI layer gives admins, managers, and technicians a fast operational view of the warehouse. It focuses on inventory health, warehouse capacity, order and shipment status, support activity, and recent stock movement. The website also includes an AI price planning dashboard for olive oil price forecasting in `TND / 1L bottle`.

## Main BI Architecture

The BI feature is split into a backend summary API and reusable frontend dashboard components.

Frontend:
- `warehouse-frontend/app/admin/page.tsx`
- `warehouse-frontend/src/manager/ManagerDashboardPage.tsx`
- `warehouse-frontend/src/technicien/TechnicienDashboardPage.tsx`
- `warehouse-frontend/src/bi/BiDashboardPanel.tsx`
- `warehouse-frontend/src/bi/BiDashboard.tsx`
- `warehouse-frontend/src/bi/bi.api.ts`

Backend:
- `warehouse-backend/src/bi/bi.controller.ts`
- `warehouse-backend/src/bi/bi.service.ts`
- `warehouse-backend/src/bi/bi.module.ts`

API endpoints:
- `GET /bi/admin-summary`
- `GET /bi/manager-summary`
- `GET /bi/technician-summary`

The backend aggregates Prisma data, returns a single BI summary payload, and the frontend renders the summary as KPI cards, status bars, capacity bars, lists, and alerts.

## Role-Based Dashboard Pages

### Admin Dashboard

Route:
- `/admin`

Component:
- `warehouse-frontend/app/admin/page.tsx`

Dashboard title:
- `Admin's dashboard`

Purpose:
- Global operational overview across inventory, warehouses, users, orders, shipments, support, and visitor contact requests.

BI component used:
- `BiDashboardPanel role="ADMIN"`

### Manager Dashboard

Route:
- `/manager`

Component:
- `warehouse-frontend/src/manager/ManagerDashboardPage.tsx`

Dashboard title:
- `Manager's Dashboard`

Purpose:
- Operational decision-making for stock, orders, shipments, support, reclamations, and public contact requests.

BI component used:
- `BiDashboardPanel role="MANAGER"`

### Technician Dashboard

Route:
- `/technicien`

Component:
- `warehouse-frontend/src/technicien/TechnicienDashboardPage.tsx`

Purpose:
- Warehouse execution view for capacity, block usage, low stock, movement types, recent inventory movements, and technician tickets.

BI component used:
- `BiDashboardPanel role="TECHNICIEN"`

The technician role also has related operational pages:
- `/technicien/mouvements`
- `/technicien/restock-alerts`

## BI KPI Cards

The dashboard starts with KPI cards. These are not chart components, but they are the primary BI indicators users scan first.

### Admin and Manager KPI Cards

Displayed cards:
- `Total products`: number of registered products.
- `Total stock`: total quantity across all products.
- `Low stock`: number of products at or below the low-stock threshold.
- `Capacity usage`: global occupied storage percentage.
- `Warehouses`: total warehouses, with total storage blocks in the hint.
- `Customers`: registered customer accounts.
- `Orders`: total orders, with approved and rejected counts in the hint.
- `Active issues`: open support tickets plus open reclamations.
- `Visitor inquiries`: new public contact form requests.

Data source:
- `BiService.summary()`
- `products`
- `warehouses`
- `orders`
- `supportTicket`
- `reclamation`
- `contactRequest`
- `user`

### Technician KPI Cards

Displayed cards:
- `Total products`: products visible in stock.
- `Stock quantity`: total units across blocs.
- `Capacity usage`: occupied warehouse capacity.
- `My open tickets`: active support tickets created by the logged-in technician.

Data source:
- `BiService.summary('TECHNICIEN', userId)`

## Graphs and Visual BI Elements

The current BI dashboard does not use a third-party charting library like Recharts. The graphs are implemented as lightweight UI visualizations using cards, progress bars, and proportional horizontal bars.

### Warehouse Capacity Usage

Where it appears:
- Admin dashboard
- Manager dashboard

Frontend component:
- `CapacityBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.warehouse.warehouseUsage`

What it shows:
- Each warehouse's used capacity compared with total capacity.
- Displayed as a horizontal progress bar.
- Shows occupied amount, total capacity, and usage percentage.

Color logic:
- `>= 90%`: error color.
- `>= 75%`: warning color.
- `< 75%`: success color.

Business meaning:
- Helps admins and managers identify warehouses close to saturation.
- Supports decisions about transfers, restocking, and warehouse allocation.

### Block Capacity Usage

Where it appears:
- Technician dashboard

Frontend component:
- `CapacityBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.warehouse.blockUsage`

What it shows:
- Highest-used storage blocks, sorted by usage percentage.
- Displayed as horizontal progress bars.
- Shows block name, warehouse name, current usage, capacity, and usage percentage.

Business meaning:
- Helps technicians detect overloaded storage blocks.
- Supports decisions about moving products between blocs.

### Order Status Bars

Where it appears:
- Admin dashboard
- Manager dashboard

Frontend component:
- `StatusBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.orders.statusCounts`

Tracked statuses include:
- `PENDING`
- `APPROVED`
- `REJECTED`
- `RESTOCK_REQUESTED`
- `COMPLETED`

What it shows:
- Count of orders by status.
- Each status is displayed as a proportional horizontal bar.

Business meaning:
- Helps managers understand order flow and bottlenecks.
- Makes pending, rejected, and restock-related orders visible.

### Shipment Status Bars

Where it appears:
- Admin dashboard
- Manager dashboard

Frontend component:
- `StatusBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.shipments.statusCounts`

Tracked statuses include:
- `REQUESTED`
- `IN_TRANSIT`
- `RECEIVED`

What it shows:
- Count of shipments by status.
- Active shipments are calculated as `REQUESTED + IN_TRANSIT`.

Business meaning:
- Helps managers follow shipment progress.
- Confirms whether approved orders have become visible shipment operations.

### Movement Type Bars

Where it appears:
- Technician dashboard

Frontend component:
- `StatusBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.inventory.movementTypeCounts`

Tracked movement types include:
- `STOCK_IN`
- `STOCK_OUT`
- `TRANSFER`
- `DAMAGE`
- `RESTOCK`
- `RESTOCK_ALERT`
- `SHIPMENT_CREATED`
- `ORDER_APPROVED`

What it shows:
- Count of inventory movements by operation type.
- Displayed as proportional horizontal bars.

Business meaning:
- Helps technicians and supervisors understand what kind of stock activity is happening most often.
- Useful for spotting abnormal damage, transfer, or restock activity.

### Support and Reclamation Status Bars

Where it appears:
- Admin dashboard
- Manager dashboard
- Technician dashboard

Frontend component:
- `StatusBars` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data fields:
- `summary.support.ticketStatusCounts`
- `summary.support.reclamationStatusCounts`

Tracked support ticket statuses include:
- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

Tracked reclamation statuses include:
- `PENDING`
- `IN_PROGRESS`
- `RESOLVED`
- `REJECTED`

What it shows:
- Combined support and reclamation counts.
- Displayed as status bars.

Business meaning:
- Makes operational issues and customer complaints visible from the dashboard.
- Helps prioritize unresolved support workload.

## BI Lists and Alerts

### Low Stock Products

Where it appears:
- Admin dashboard
- Manager dashboard
- Technician dashboard

Frontend component:
- `LowStockList` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data fields:
- `summary.inventory.lowStockProducts`
- `summary.inventory.lowStockProductsCount`
- `summary.lowStockThreshold`

Current threshold:
- `10`

What it shows:
- Products whose quantity is at or below the threshold.
- Product name, warehouse name, bloc name, and quantity.

Business meaning:
- Highlights products that may need restocking.
- Helps managers and technicians act before stock becomes unavailable.

### Recent Movements

Where it appears:
- Admin dashboard
- Manager dashboard
- Technician dashboard

Frontend component:
- `RecentMovements` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data field:
- `summary.inventory.recentMovements`

What it shows:
- Recent inventory movement records.
- Product name, movement type, quantity, movement date, source bloc, and destination bloc.

Business meaning:
- Gives traceability for recent stock operations.
- Helps users verify that restocks, transfers, shipment-related stock changes, and damage records were captured.

### Public Contact Requests

Where it appears:
- Admin dashboard
- Manager dashboard

Frontend component:
- `ContactRequestsAlert` in `warehouse-frontend/src/bi/BiDashboard.tsx`

Data fields:
- `summary.support.newContactRequests`
- `summary.support.latestContactRequests`

What it shows:
- New visitor inquiries submitted from the public landing page contact form.
- Email, phone, reason, creation date, and a `Mark contacted` action.

Business meaning:
- Turns website contact submissions into dashboard alerts.
- Helps managers follow up on external inquiries directly from the operational dashboard.

## AI Price Planning Dashboard

The website also includes a dashboard for olive oil price prediction. This is separate from the operational BI summary but still acts as an analytics dashboard.

Routes:
- `/admin/pred-dashboard`
- `/manager/pred-dashboard`

Components:
- `warehouse-frontend/app/admin/pred-dashboard/page.tsx`
- `warehouse-frontend/app/manager/pred-dashboard/page.tsx`
- `warehouse-frontend/src/components/PriceForecastWidget.tsx`

Backend endpoints:
- `GET /ai/price/widget`
- `POST /ai/price/predict`
- `GET /ai/price/health`

Displayed analytics:
- Predicted next price.
- Current reference price.
- Price change in TND.
- Price change percentage.
- Trend badge: rise, soften, or steady.
- Model version.
- Last update date.
- Scenario planner inputs: year, month, stock, and quantity sold.
- Scenario result compared with the current reference.

Unit:
- `TND / 1L bottle`

Reference price:
- The widget uses a current reference price for comparison.
- The backend can use a configured reference, an online market source if configured, or fallback product price.

Business meaning:
- Helps admins and managers plan procurement, stock allocation, and customer pricing.
- Allows what-if scenario testing without asking the user to enter the bottle price they are trying to predict.

## Older Prediction Chart Component

There is also an older/full prediction dashboard component:

- `warehouse-frontend/src/components/PredictionDashboard.tsx`

It includes:
- Forecast line chart implemented with SVG.
- Relative trend bars.
- Prediction KPI cards.
- Scenario inputs.
- Model notes.

Important note:
- The active admin and manager prediction pages currently render `PriceForecastWidget`, not `PredictionDashboard`.
- `PredictionDashboard.tsx` remains in the codebase as an available but currently unused chart-style prediction dashboard.

## Backend BI Data Calculations

The BI backend computes:
- Total products.
- Total stock quantity.
- Low-stock products using threshold `10`.
- Total warehouses.
- Total blocks.
- Total warehouse capacity.
- Total occupied usage.
- Capacity usage percentage.
- High-usage blocks.
- Order counts by status.
- Shipment counts by status.
- Support ticket counts by status.
- Reclamation counts by status.
- Inventory movement counts by operation type.
- Recent movement records.
- Technician-specific open tickets.
- New public contact requests.

Main service:
- `warehouse-backend/src/bi/bi.service.ts`

The service uses Prisma queries and `groupBy` aggregations, then returns one structured payload consumed by the frontend.

## Summary of BI Visuals

| Visual | Pages | Data | Purpose |
| --- | --- | --- | --- |
| KPI cards | Admin, Manager, Technician | BI summary totals | Fast operational overview |
| Warehouse capacity bars | Admin, Manager | Warehouse usage | Detect storage saturation |
| Block capacity bars | Technician | Block usage | Detect overloaded blocs |
| Order status bars | Admin, Manager | Order status counts | Track order flow |
| Shipment status bars | Admin, Manager | Shipment status counts | Track logistics progress |
| Movement type bars | Technician | Inventory movement counts | Understand stock activity |
| Support/reclamation bars | All BI dashboards | Ticket and reclamation statuses | Monitor unresolved issues |
| Low stock list | All BI dashboards | Products below threshold | Trigger restock decisions |
| Recent movements list | All BI dashboards | Inventory movement records | Trace stock operations |
| Contact request alerts | Admin, Manager | Landing page inquiries | Follow up with visitors |
| Price forecast widget | Admin, Manager prediction pages | AI prediction API | Plan 1L olive oil pricing |

