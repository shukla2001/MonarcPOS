# 👑 Monarc Ice Creams — Full-Stack POS Kiosk & Enterprise Management Platform

> **Domain:** `admin.monarcicecreams.com`  
> **Brand Identity:** Monarc Ice Creams (Premium Parlour, Artisanal Scoops, Signature Sundaes, Waffles, Thick Shakes, Pastries & Desserts)  
> **Color Palette:** Rich Imperial Gold (`#DFB870`, `#C68A4C`, `#B45309`), Soft Cream Surface (`#FFFDF9`, `#FAF3E7`), Peach Blossom Accent (`#F7E2D8`), Clean Slate Typography.

---

## 🍨 1. Executive Overview & Architecture

Monarc POS is a production-grade, full-stack Point of Sale (POS) Kiosk and Enterprise Admin platform designed specifically for dessert parlours and high-volume ice cream kiosks.

```
[ Cashier / Admin Terminal ]
       │
       ▼ (HTTPS / TLS on admin.monarcicecreams.com)
┌────────────────────────────────────────────────────────┐
│  Frontend SPA (React 18 + Vite + Tailwind CSS)         │
│  ├── Touch Kiosk Catalog with Fast Search & Category Bar│
│  ├── Real-time Cart with 5% GST & Payment Selectors    │
│  ├── 80mm Standard Thermal Receipt (window.print())    │
│  └── Admin Portals: Inventory CRUD, Staff, & Analytics │
└──────────────────────┬─────────────────────────────────┘
                       │ REST API (Bearer JWT Tokens)
                       ▼
┌────────────────────────────────────────────────────────┐
│  Backend API (Node.js & Express + TypeScript)          │
│  ├── RBAC Guards (verifyToken, requireAdmin)           │
│  ├── Atomic Checkout Engine (Prisma $transaction)      │
│  ├── Input Sanitization (Joi Middleware)               │
│  └── Daily / Monthly / Yearly Sales Aggregators        │
└──────────────────────┬─────────────────────────────────┘
                       │ ACID Transactions
                       ▼
┌────────────────────────────────────────────────────────┐
│  Relational Database (PostgreSQL & Prisma ORM)         │
│  ├── Users / Workers (Bcrypt-hashed credentials, RBAC) │
│  ├── Categories & Items (Units, prices, stock counts)  │
│  ├── Orders & OrderItems (Cashier audit linkage)       │
│  └── Indexed Timestamps for High-Speed Analytics       │
└────────────────────────────────────────────────────────┘
```

---

## 👥 2. Role-Based Access Control (RBAC) Specifications

| Feature / Action | 🍦 Worker (Cashier) | 👑 Store Administrator |
| :--- | :---: | :---: |
| **POS Desk & Touch Catalog** | ✅ Full Access | ✅ Full Access |
| **Add Items / Manage Cart** | ✅ Full Access | ✅ Full Access |
| **Checkout & Select Payment Mode** | ✅ Full Access (Cash/UPI/Card) | ✅ Full Access |
| **Print 80mm Thermal Receipts** | ✅ Stamped with Cashier Name | ✅ Stamped with Admin Name |
| **Search & Reprint Past Orders** | ✅ Full Access | ✅ Full Access |
| **Inventory & Item Management** | ❌ **403 Forbidden** | ✅ Add / Edit / Restock / Delete |
| **Add & Manage Staff Accounts** | ❌ **403 Forbidden** | ✅ Full Worker Management |
| **Sales & Financial Reports** | ❌ **403 Forbidden** | ✅ Daily, Monthly, Yearly Analytics |

---

## ⚡ 3. Default Credentials (Pre-seeded)

| Role | Username | Password | Full Name | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Store Admin** | `admin` | `Admin@123` | Monarc Store Manager | All 4 Tabs (POS, Inventory, Staff, Reports) |
| **Cashier #1** | `cashier1` | `Worker@123` | Rajesh Sharma | POS Desk Only |
| **Cashier #2** | `cashier2` | `Worker@123` | Ananya Iyer | POS Desk Only |

---

## 🚀 4. Quick Start Guide

### Option A: Running with Docker Compose (Instant Deployment)

```bash
# 1. Clone or navigate to the repository
cd MonarcPOS

# 2. Spin up PostgreSQL, Backend API, and Frontend SPA
docker-compose up --build -d

# 3. Seed initial admin accounts and rich dessert catalog
docker exec -it monarc_pos_backend npx prisma db seed
```

- **Frontend Kiosk URL:** `http://localhost` (or `http://admin.monarcicecreams.com`)
- **Backend API URL:** `http://localhost:5000/api`
- **PostgreSQL Port:** `localhost:5432`

---

### Option B: Running Locally for Development

#### Step 1: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma db push

# Seed the database
npm run prisma:seed

# Start backend server
npm run dev
# -> Server running on http://localhost:5000
```

#### Step 2: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# -> Kiosk UI running on http://localhost:3000
```

---

## 🧪 5. Automated Test Suites

### Backend Integration Tests (Jest & Supertest)
Tests authentication, 403 RBAC authorization barriers, and atomic order stock deduction:
```bash
cd backend
npm test
```

### Frontend Unit & Component Tests (Vitest & RTL)
Tests real-time cart calculations, 5% GST tax formulas, and stock overflow protection:
```bash
cd frontend
npm test
```

---

## 📋 6. Key API Endpoints Summary

### Authentication & Staff
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token
- `GET /api/auth/me` — Verify authenticated profile
- `GET /api/workers` — *(Admin Only)* List all employees
- `POST /api/workers` — *(Admin Only)* Register new cashier/admin account
- `PUT /api/workers/:id` — *(Admin Only)* Update employee info or reset password
- `PATCH /api/workers/:id/toggle` — *(Admin Only)* Toggle active/deactivated state

### Menu & Inventory Management
- `GET /api/items` — List active items (supports `?categoryId=`, `?search=`, `?lowStock=true`)
- `GET /api/items/categories` — List menu categories with item counts
- `POST /api/items` — *(Admin Only)* Create new flavour/dessert
- `PUT /api/items/:id` — *(Admin Only)* Update price, serving unit, or stock
- `PATCH /api/items/:id/restock` — *(Admin Only)* Increment item stock (+10, +50, custom)
- `DELETE /api/items/:id` — *(Admin Only)* Safe deletion with past order checks

### POS Checkout & Orders
- `POST /api/orders` — **Atomic Checkout Engine**: Validates stock, calculates 5% GST, decrements stock in a serializable ACID transaction, and generates receipt data.
- `GET /api/orders` — View recent order transactions
- `GET /api/orders/:id` — Fetch complete order details for reprint

### Enterprise Sales Analytics
- `GET /api/reports/sales?period=daily|monthly|yearly&year=YYYY&month=MM` — *(Admin Only)* Aggregates revenue, order counts, dessert volume sold, payment mode split, hourly/daily/monthly trend charts, and top 10 best-selling items.

---

## 🧾 7. 80mm Thermal Bill Print Specifications
The frontend includes `@media print` optimized CSS formatted for standard 80mm ESC/POS thermal receipt printers (`window.print()`).
The bill contains:
1. Monarc Royal Crest & Parlour Banner
2. FSSAI & GSTIN registration numbers
3. Order Number (`#ORD-XXXXXX`) & Timestamp
4. Cashier identification stamp
5. Itemized line items with serving units (`scoop`, `glass`, `piece`, `tub`)
6. Subtotal, CGST (2.5%), SGST (2.5%), and Grand Total
7. Loyalty / Feedback QR Code

---

## 🛡️ 8. Security Best Practices
- Passwords hashed with `bcrypt` (10 salt rounds).
- Requests validated strictly using `Joi` schemas.
- Concurrency-safe transactions powered by PostgreSQL & Prisma.
- Role-based route guards on both API middleware and React router state.

---

*© Monarc Ice Creams. All rights reserved.*
