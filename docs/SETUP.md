# Dairy Intelligent Document Intake & Decision Hub - Setup Guide

## Prerequisites

- **Node.js**: v18+ or v20+ (v24 supported)
- **MySQL Database**: v8.0+
- **Google Gemini API Key**: Optional (AI pipeline falls back gracefully if key is unconfigured)

---

## 1. Project Installation

Clone the repository and install dependencies for both backend and frontend:

```bash
# Install root package dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Environment Configuration

### Backend Environment (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update credentials:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dairy_hub
DB_USER=root
DB_PASSWORD=rootpassword
JWT_SECRET=super_secret_dairy_hub_jwt_key_2026_production_style
JWT_EXPIRES_IN=8h
GEMINI_API_KEY=your_gemini_api_key_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=20971520
NODE_ENV=development
```

### Frontend Environment (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 3. Database Initialization & Seeding (MySQL)

Execute the schema migration and seed scripts:

```bash
# Run MySQL Database Schema DDL Migration
cd backend
npm run migrate

# Seed Initial Dataset (Users, Orgs, Roles, Cases, Docs)
npm run seed
```

---

## 4. Running the Application

### Option A: Concurrent Start (Backend + Frontend)

From project root:

```bash
npm start
```

### Option B: Individual Service Start

**Terminal 1 (Backend API Service):**
```bash
cd backend
npm run dev
# Express API runs on http://localhost:5000
```

**Terminal 2 (Frontend SPA):**
```bash
cd frontend
npm run dev
# Vite UI runs on http://localhost:5173
```

---

## 5. Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Reviewer** | `reviewer@dairycoop.com` | `Password123!` |
| **Supervisor** | `supervisor@dairycoop.com` | `Password123!` |
| **Compliance Admin** | `admin@dairycoop.com` | `Password123!` |
| **Applicant** | `applicant@dairycoop.com` | `Password123!` |
| **Org B Reviewer** | `reviewer@valleyfresh.com` | `Password123!` |

---

## 6. Running Automated Tests

```bash
cd backend
npm test
```
