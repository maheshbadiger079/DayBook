# WorkTrack — Daily Activity, Project & Assignment Management System

> **Tagline:** *Track. Organize. Complete. Improve.*

WorkTrack is a full-stack web application designed to track, organize, and analyze daily professional activities, ongoing projects, tasks, assignments, learning milestones, and time expenditure with precision.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 / Vite, HTML5, CSS3 Modern Design System, Lucide Icons |
| **Backend** | Node.js (v24), Express.js (v4.21), REST API architecture |
| **Database** | PostgreSQL 18 (Relational database with connection pooling via `pg.Pool`) |
| **Security** | Helmet HTTP headers, CORS origin protection, Rate Limiting, Environment Isolation |
| **Tooling** | Git, npm, nodemon, concurrently |

---

## 🏛️ System Architecture

```text
+-------------------------------------------------------+
|                 WorkTrack React Client                |
|                    (Port: 5173)                       |
+-------------------------------------------------------+
                           │
             HTTP Requests │ (Reverse Proxy /api)
                           ▼
+-------------------------------------------------------+
|             WorkTrack Express Backend REST API        |
|                    (Port: 5000)                       |
+-------------------------------------------------------+
  │ Security & Middleware (Helmet, CORS, Rate-Limiter)
  │ Routing & Controllers
  │ Services & Repositories
  │ Connection Pool (pg.Pool)
                           ▼
+-------------------------------------------------------+
|                 PostgreSQL 18 Database                |
|             Database: worktrack (Port: 5432)          |
+-------------------------------------------------------+
```

---

## 📂 Project Structure

```text
Daily_activities_Form/
├── .gitignore
├── package.json                 # Root script runner (concurrently)
├── README.md                    # System documentation
├── backend/                     # Node.js + Express.js API
│   ├── .env                     # Local environment variables (git-ignored)
│   ├── .env.example             # Example environment template
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── env.js           # Centralized environment validator
│       │   └── db.js            # PostgreSQL connection pooling & queries
│       ├── controllers/
│       │   └── healthController.js # System health & DB check
│       ├── routes/
│       │   └── healthRoutes.js  # /api/health router
│       ├── middleware/
│       │   ├── errorHandler.js   # Centralized error handler
│       │   └── notFoundHandler.js# 404 handler
│       ├── utils/
│       │   └── response.js      # Standard JSON response helpers
│       ├── app.js               # Express app configuration
│       └── server.js            # Server entrypoint & graceful shutdown
└── frontend/                    # React + Vite application
    ├── index.html
    ├── package.json
    ├── vite.config.js           # Configured with /api proxy to backend
    └── src/
        ├── App.jsx              # Phase 1 Live Verification Dashboard
        ├── index.css            # Dark/SaaS Design System
        └── main.jsx             # React DOM entrypoint
```

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js** (v18+ or v24+ recommended)
- **PostgreSQL 18** running locally on port `5432` with database `worktrack`

### 2. Database Setup
PostgreSQL database `worktrack` was created:
```sql
CREATE DATABASE worktrack;
```

### 3. Environment Configuration
Verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=worktrack
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Running the Applications

#### Option A: Run Both Together (Recommended)
From the root project directory:
```bash
npm run dev
```
*This concurrently starts the Express backend on `http://localhost:5000` and the Vite React frontend on `http://localhost:5173`.*

#### Option B: Run Individually

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📡 Live Endpoints (Phase 1)

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API Info:** [http://localhost:5000/api](http://localhost:5000/api)
- **Database Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
