# Healthcare System

Full-stack Healthcare application with React frontend and Express + MySQL backend.

## Project Structure

```text
healthcare-system/
├── frontend/          # React + Vite + TypeScript Frontend
└── backend/           # Node.js + Express + MySQL Backend
```

## Quick Start

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

### 2. Backend Setup

Prerequisites:
- Local MySQL server running via XAMPP on port 3306.
- Database `healthcare_db` created in MySQL / phpMyAdmin.
- Tables imported from `backend/sql/schema.sql` (and `backend/sql/seed.sql` for initial data).

Start the backend:

```bash
cd backend
npm install
npm run dev
```

The backend API will run at `http://localhost:5000`.

### 3. Health Check

```bash
curl http://localhost:5000/api/health
```
