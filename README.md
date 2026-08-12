# Mini ERP + CRM Operations Portal

A complete, full-stack Mini ERP and CRM system built for wholesale and distribution companies. This application provides a centralized operational workflow for internal employees (Admin, Sales, Warehouse, Accounts) to manage customer CRM, product inventory, and sales challans.

## 🌟 Architecture & Theoretical Workflow

This system is built around a controlled operational flow:

**Employee → Authentication → Role Identification → Customer/Product Data → Sales Challan → Inventory Validation → Stock Movement → Final Operational Record**

### The Core Flow
1. **Authentication & Roles:** Only authenticated internal employees can access the portal. Role-Based Access Control (RBAC) ensures employees only see what they are authorized to see.
2. **Customer CRM:** The first layer of business information. Tracks customer details, leads, active relationships, and sales follow-up notes.
3. **Product & Inventory:** The operational foundation. Maintains a separation between **Identity** (SKU, Price, Category) and **State** (Current Stock). Includes a full historical stock movement log (IN/OUT).
4. **Sales Challan (The Bridge):** Connects CRM to Inventory. Allows sales staff to draft challans. When a challan is **Confirmed**, the system atomically validates stock. If sufficient, it creates an OUT stock movement and preserves a historical snapshot of the product pricing. If insufficient, it returns a hard API error to protect inventory integrity.

---

## 🚀 Tech Stack

- **Backend:** Node.js, TypeScript, Express.js, Prisma ORM
- **Database:** PostgreSQL (with transactional integrity for stock validation)
- **Frontend:** React, TypeScript, Vite, Vanilla CSS
- **Deployment:** Docker, Docker Compose, NGINX (SPA Routing)

---

## 🛠️ Setup Instructions (Local Deployment)

This project is fully containerized with Docker, meaning you can launch the entire stack (Database, Backend API, and Frontend UI) with a single command.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git installed.

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd Mini-CRM
```

### 2. Environment Variables
The `.env` files are already configured with sensible defaults for local Docker testing. 
*Note: For production AWS deployment, you must change these variables.*

**Backend `.env`** (`backend/.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://crm_user:crm_password@postgres:5432/crm_db?schema=public"
JWT_SECRET="supersecretjwtkeythatshouldbechangedinproduction"
JWT_EXPIRES_IN="1d"
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Launch the Application
Open a terminal in the root directory and run:
```bash
docker-compose up -d --build
```
This will:
1. Pull the PostgreSQL 15 image and initialize the database.
2. Build and start the Node.js backend (automatically running Prisma migrations and seeding default accounts).
3. Build the React frontend and serve it using NGINX.

### 4. Access the Application
- **Frontend Web Portal:** [http://localhost](http://localhost)
- **Backend API Base URL:** `http://localhost:3000/api/v1`

---

## 🔐 Test Credentials

The database is automatically seeded with the following accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@minierp.com` | `password123` |
| **Sales** | `sales@minierp.com` | `password123` |
| **Warehouse** | `warehouse@minierp.com` | `password123` |
| **Accounts** | `accounts@minierp.com` | `password123` |

---

## ☁️ Server Setup & AWS Deployment Guide

To deploy this to AWS or any cloud provider:

1. **Provision an EC2 Instance:** Launch a basic Ubuntu EC2 instance (t2.micro or t3.small) and open ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) in the Security Group.
2. **Install Docker:** SSH into your instance and install Docker and Docker Compose.
3. **Clone & Configure:** Clone your repository to the server. Update the `backend/.env` file with a strong `JWT_SECRET` and secure database password. Update the `frontend/.env` to point to your server's public IP or Domain instead of localhost.
4. **Deploy:** Run `docker-compose up -d --build`. 
5. **(Optional) Reverse Proxy & SSL:** Set up an NGINX reverse proxy on the host machine to route traffic to the Docker containers and attach a free Let's Encrypt SSL certificate.

---

## 🧪 Postman Collection & API Documentation

A fully configured Postman collection is included in the repository to test all endpoints.
- **File:** `Mini-CRM.postman_collection.json`
- **Instructions:** Open Postman -> Click "Import" -> Select this file. 
- The collection contains pre-configured requests for Authentication, Customers, Products, Inventory, and Challans. *Ensure you log in first and set the JWT token as a Bearer Token variable.*

---

## ⚠️ Known Limitations & Assumptions

1. **Invoice & Purchase Orders:** While mentioned in the business context, these were not implemented as they were explicitly omitted from the "Core Modules Required" section to keep the system scoped appropriately.
2. **Database Transactions:** The stock reduction during challan confirmation assumes atomic database transactions (handled via Prisma `$transaction`) to prevent race conditions in concurrent environments.
3. **Draft State Deductions:** As per requirements, creating a Draft Challan does *not* reserve inventory. Stock is only reduced upon Confirmation.
4. **Security:** In this local configuration, the PostgreSQL database is exposed to internal Docker networking only. For a true production AWS deployment, a managed database like Amazon RDS inside a private VPC is recommended over a containerized database.
