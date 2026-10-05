# Healthcare System - Backend

Node.js, Express, and MySQL backend for the Healthcare application.

## Prerequisites

- Node.js (v18+)
- XAMPP with MySQL running on port 3306

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   Copy `.env.example` to `.env` if not already present:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=healthcare_db
   JWT_SECRET=super_secret_healthcare_jwt_key_2026
   ```

3. **Database Schema:**
   The schema can be imported into MySQL via phpMyAdmin or MySQL CLI:
   ```bash
   mysql -u root healthcare_db < sql/schema.sql
   ```

4. **Seed Initial Data:**
   ```bash
   npm run seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

6. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
