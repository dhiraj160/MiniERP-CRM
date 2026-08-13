# Mini ERP + CRM Operations Portal

A full-stack Mini ERP and CRM system built for wholesale and distribution companies. It gives internal teams (Admin, Sales, Warehouse, Accounts) one place to manage customer relationships, product inventory, and sales challans — instead of juggling spreadsheets and disconnected tools.

## Why this exists

Small distribution businesses usually end up tracking customers in one spreadsheet, stock in another, and sales notes in a notebook or WhatsApp thread. Nothing talks to anything else, and stock counts drift out of sync with what's actually been sold. This project ties those three pieces together into a single, role-based workflow so that confirming a sale automatically and safely updates inventory — no manual reconciliation required.

## Architecture

The system follows a standard three-tier architecture: a React SPA talks to a stateless Express/TypeScript REST API, which is the only thing allowed to touch the PostgreSQL database. Everything is wired together with Prisma ORM and containerized with Docker.

```
┌────────────┐      REST/JSON       ┌──────────────┐      Prisma ORM      ┌────────────┐
│   React    │  ───────────────▶   │  Express API  │  ───────────────▶   │ PostgreSQL │
│  (Vite SPA)│  ◀───────────────   │ (TypeScript)  │  ◀───────────────   │            │
└────────────┘     JWT in header    └──────────────┘   SQL / transactions └────────────┘
      │                                    │
      │ served via NGINX                   │ role checked on every route
      ▼                                    ▼
   Docker container                  Docker container
```

**Why this shape:**

- **Stateless API, JWT auth** — the backend doesn't hold session state; every request carries a JWT, and role (Admin/Sales/Warehouse/Accounts) is decoded from the token and checked per-route. This keeps the API horizontally scalable and keeps role logic in one place (middleware) instead of scattered across controllers.
- **Identity vs. state separation for products** — product identity (SKU, price, category) and product state (current stock) are modeled separately, with every state change written to an immutable stock movement log. This means stock levels are always derivable/auditable from history, not just a mutable counter that can silently drift.
- **Challan as the transactional boundary** — the Sales Challan module is the only place stock actually moves. Confirming a challan runs inside a single Prisma `$transaction`: it re-checks stock, writes the OUT movement, and snapshots product name/price at that moment — all atomically. This is what stops overselling under concurrent requests and keeps historical challans accurate even if a product's price changes later.
- **Containerized by service** — frontend, backend, and database each run in their own container behind Docker Compose, with NGINX handling SPA routing for the frontend. This mirrors how the pieces would be deployed independently in production (e.g., Render's separate web/static/DB services) and keeps local dev identical in shape to the hosted version.

## How the system is organized

The whole app is built around one controlled flow:

```
Employee → Authentication → Role Identification → Customer/Product Data
  → Sales Challan → Inventory Validation → Stock Movement → Invoice (PDF) → Final Record
```

**Authentication & Roles**
Only authenticated employees can access the portal, and Role-Based Access Control (RBAC) makes sure each person only sees what their role needs.

**Customer CRM**
The first layer of business data — customer details, leads, active relationships, and sales follow-up notes.

**Product & Inventory**
The operational core. Product *identity* (SKU, price, category) is kept separate from product *state* (current stock), and every stock change is logged in a full IN/OUT movement history.

**Sales Challan — the bridge between CRM and Inventory**
Sales staff draft challans freely. The moment a challan is **confirmed**, the system:
- Validates stock atomically
- If stock is sufficient → creates an OUT movement and snapshots the pricing at that moment
- If stock is insufficient → returns a hard API error, so inventory integrity is never silently broken

**Invoice Export (PDF)**
Once a challan is Confirmed, it can be exported as a PDF invoice directly from the challan detail view — pulling the same snapshotted customer, product, and pricing data stored on the challan, so the PDF always matches what was actually recorded at confirmation time (not current live prices).

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js, TypeScript, Express.js, Prisma ORM |
| Database | PostgreSQL (transactional integrity for stock checks) |
| Frontend | React, TypeScript, Vite, Vanilla CSS |
| PDF Generation | PDFKit (server-side, from challan snapshot data) |
| Deployment | Docker, Docker Compose, NGINX (SPA routing) |

## Getting it running locally

Everything is containerized, so the entire stack (database, API, and UI) comes up with one command.

**Prerequisites**
- Docker Desktop installed and running
- Git installed

**1. Clone the repo**
```bash
git clone https://github.com/<your-username>/Mini-CRM.git
cd Mini-CRM
```

**2. Set up environment variables**

Copy the example files and fill in your own values — don't commit real secrets.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` expects:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://<db_user>:<db_password>@postgres:5432/crm_db?schema=public"
JWT_SECRET="<generate-a-long-random-string>"
JWT_EXPIRES_IN="1d"
```

`frontend/.env` expects:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**3. Launch everything**
```bash
docker-compose up -d --build
```

This will:
- Pull and initialize the PostgreSQL 15 image
- Build and start the Node.js backend, running Prisma migrations and seeding default accounts
- Build the React frontend and serve it via NGINX

**4. Open it up**
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000/api/v1`

## Test credentials

The database seeds a few accounts for local testing:

| Role | Email | Password |
|---|---|---|
| Admin | admin@minierp.com | password123 |
| Sales | sales@minierp.com | password123 |
| Warehouse | warehouse@minierp.com | password123 |
| Accounts | accounts@minierp.com | password123 |

> ⚠️ These are for local development only. Disable or change them before any public or production deployment.

## ☁️ Online Deployment (Render)

This repository is pre-configured for a 1-click deployment on Render, completely free of charge. The deployment uses a `render.yaml` Blueprint which automatically provisions a PostgreSQL Database, a Node.js Backend, and a Vite/React Static Frontend.

**Deployment Steps:**
1. **Push your code to GitHub** — make sure this repository is pushed to your own GitHub account.
2. **Sign in to Render** — go to render.com and log in with your GitHub account.
3. **New Blueprint** — click **New** at the top right and select **Blueprint**.
4. **Connect Repository** — connect the GitHub repository containing this code.
5. **Deploy** — Render reads `render.yaml` and automatically provisions all 3 services.
6. **URLs** — once the deployment finishes, your Frontend URL and Backend API URL will be visible in the Render dashboard.

> Note: The database is automatically seeded with test credentials during the first deployment.

## ☁️ Deploying to AWS (or any cloud VM)

1. **Provision a server** — a basic Ubuntu EC2 instance (t2.micro/t3.small is enough to start). Open ports 80 (HTTP), 443 (HTTPS), and 22 (SSH) in the security group.
2. **Install Docker** — SSH in and install Docker + Docker Compose.
3. **Clone & configure** — pull the repo, then set a strong `JWT_SECRET` and real database credentials in `backend/.env`. Point `frontend/.env` at your server's domain or public IP instead of `localhost`.
4. **Deploy** — `docker-compose up -d --build`.
5. **(Recommended) Reverse proxy + SSL** — put NGINX in front of the containers on the host and attach a free Let's Encrypt certificate.

## 🧪 Postman Collection & API Documentation

A ready-to-import Postman collection is included: `Mini-CRM.postman_collection.json`.

Open Postman → **Import** → select the file. It has pre-built requests for Authentication, Customers, Products, Inventory, and Challans. Log in first and set the returned JWT as your Bearer Token variable before hitting the other endpoints.

## Known limitations & assumptions

- **Purchase Orders** — mentioned in the original business context but intentionally left out, since they weren't part of the core modules this system was scoped to cover.
- **Invoice** — implemented as a PDF export generated from a Confirmed challan's snapshotted data, rather than as a separate standalone Invoice module/entity.
- **Database transactions** — stock reduction on challan confirmation relies on atomic transactions (via Prisma's `$transaction`) to prevent race conditions under concurrent use.
- **Draft challans don't reserve stock** — per the requirements, a Draft doesn't touch inventory. Stock is only reduced when a challan is Confirmed.
- **Security posture** — locally, Postgres is only reachable inside the Docker network. For a real production deployment, use a managed database (e.g., Amazon RDS) inside a private VPC rather than a containerized DB on the same host.

## Project structure

```
Mini-CRM/
├── backend/          # Express + Prisma API
├── frontend/          # React + Vite UI
├── docker-compose.yml
└── Mini-CRM.postman_collection.json
```
