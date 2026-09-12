# Portfolio Backend

Professional Node.js + Express backend for a MERN Stack Developer Portfolio.

---

## Current Scope

| Feature | Status |
|---|---|
| Node.js + Express REST API | ✅ Implemented |
| ES Modules (import/export) | ✅ Implemented |
| CORS (origin-restricted) | ✅ Implemented |
| Environment configuration | ✅ Implemented |
| Centralized error handling | ✅ Implemented |
| API 404 handling | ✅ Implemented |
| Health endpoint (with DB status) | ✅ Implemented |
| MongoDB Atlas | ✅ Connected |
| Mongoose | ✅ Connected |
| Graceful shutdown (SIGINT/SIGTERM) | ✅ Implemented |
| Portfolio Database Models | ✅ Implemented |
| **Public Read-Only REST API** | ✅ **Implemented** |
| **Admin Auth (JWT + bcrypt)** | ✅ **Implemented** |
| Admin CRUD APIs | 🔜 Planned |
| Admin Dashboard | 🔜 Planned |
| Frontend API Integration | ✅ Implemented |
| Contact Message API | ✅ Implemented |

---

## Public REST API

All endpoints are **public** and **read-only (GET only)**.  
Admin CRUD and authentication are planned for future milestones.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check with database connection status |

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "environment": "development",
    "database": "connected"
  }
}
```

---

### Profile

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/profile` | Get active portfolio profile | ✅ |

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": { ... }
}
```

---

### Skills

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/skills` | Get all active skills sorted by order | ✅ |

---

### Projects

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/projects` | Get all active projects | ✅ |
| GET | `/api/projects?featured=true` | Get featured projects only | ✅ |
| GET | `/api/projects?category=Full-Stack` | Filter by category | ✅ |
| GET | `/api/projects/:slug` | Get single project by slug | ✅ |

**404 response when slug not found:**
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

### Experience

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/experience` | Get all active experience records | ✅ |

---

### Education

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/education` | Get all active education records | ✅ |

---

### Certifications

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/certifications` | Get all active certifications | ✅ |

---

### Services

| Method | Endpoint | Description | Public |
|---|---|---|---|
| GET | `/api/services` | Get all active services | ✅ |
| GET | `/api/services?featured=true` | Get featured services only | ✅ |

---

### Messages

| Method | Endpoint | Description | Public |
|---|---|---|---|
| POST | `/api/messages` | Submit a new contact message | ✅ |

**Note**: `GET` endpoints for messages are omitted intentionally for privacy. Messages are securely stored and will only be accessible via the future authenticated Admin API. Email sending is not yet implemented.

**Request Body Example:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Project Inquiry",
  "message": "Hello, I am interested in...",
  "projectType": "Web Development"
}
```

---

### Standard Response Format

**Success (collection):**
```json
{ "success": true, "message": "...", "data": [ ... ] }
```

**Success (single resource):**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "..." }
```

---

## Database Models

| Model | File | Purpose |
|---|---|---|
| `Profile` | `models/Profile.js` | Portfolio identity and contact info |
| `Skill` | `models/Skill.js` | Technologies and skill categories |
| `Project` | `models/Project.js` | Projects with unique slug and case-study fields |
| `Experience` | `models/Experience.js` | Professional work experience timeline |
| `Education` | `models/Education.js` | Academic background |
| `Certification` | `models/Certification.js` | Professional certificates and credentials |
| `Service` | `models/Service.js` | Developer service offerings |

> The database is currently **empty**. Portfolio content will be added via Admin Panel in a future milestone.

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Module system**: ES Modules (`"type": "module"`)
- **Database**: MongoDB Atlas
- **ODM**: Mongoose

---

## Installation

```bash
cd backend
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the backend runs on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `MONGODB_URI` | Full MongoDB Atlas connection string including database name |

---

## Running the Server

```bash
npm run dev   # Development (Nodemon)
npm start     # Production
```

---

## Local URLs

| Service | URL |
|---|---|
| Backend API | `http://localhost:5000` |
| Health | `http://localhost:5000/api/health` |
| Frontend (Vite) | `http://localhost:5173` |

---

## Admin Authentication

Admin authentication uses **bcryptjs** for password hashing and **JSON Web Tokens (JWT)** for session management.

### Admin Model

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, indexed, lowercase |
| `password` | String | bcrypt hash only, `select: false` |
| `role` | String | Enum: `admin`, default: `admin` |
| `isActive` | Boolean | Default: `true` |
| `lastLoginAt` | Date | Updated on successful login |
| `createdAt/updatedAt` | Date | Auto via Mongoose `timestamps` |

> The password hash is **never** returned in any API response. The `select: false` option and `toJSON`/`toObject` transforms ensure this at the model level.

---

### Auth Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate admin, return JWT | Public |
| GET | `/api/auth/me` | Get current admin profile | 🔒 Protected |

There is **NO** `POST /api/auth/register`. Admin accounts are provisioned only via the `createAdmin` script (see below).

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "your-password"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "admin": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```

**Failure (401):** `{ "success": false, "message": "Invalid email or password." }`

Both wrong-password and unknown-email return the same generic message to prevent account enumeration.

---

### Protected Requests

Include the JWT in every protected request:

```http
Authorization: Bearer <JWT_TOKEN>
```

**GET `/api/auth/me` — Success (200):**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "admin": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```

---

### Authentication Middleware

`backend/middleware/authMiddleware.js` provides:

- **`protect`** — Verifies the JWT, loads the Admin from MongoDB, confirms `isActive === true`, attaches safe `req.admin` (no password hash).
- **`requireAdmin`** — Shorthand for `authorizeRoles('admin')`.
- **`authorizeRoles(...roles)`** — Flexible role-based authorization factory.

Usage in routes:
```js
router.get('/protected-route', protect, requireAdmin, controller);
```

The `role` on `req.admin` always comes from the **database**, never from the token claim or request body.

---

### Environment Variables for Auth

| Variable | Description |
|---|---|
| `JWT_SECRET` | Random string, minimum 32 characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`, `7d` |

---

### Creating an Admin Account (Development)

There is **no public registration endpoint**. Use the CLI script:

```bash
# Option 1: Interactive prompts (password input is hidden)
npm run create-admin

# Option 2: Environment variables (remove from .env after use)
ADMIN_NAME="Your Name" ADMIN_EMAIL="you@yourdomain.com" ADMIN_PASSWORD="StrongPass" npm run create-admin

# Option 3: Reset password for an existing account
npm run create-admin -- --reset-password
```

The script:
- Prevents duplicate accounts
- Refuses well-known placeholder emails/passwords
- Stores only the bcrypt hash — password is never logged
- Does not run automatically with the server

---

### Security Notes

- Passwords are hashed with **bcryptjs** (cost factor 12)
- Plaintext passwords are never stored, logged, or returned
- JWT payload contains only `{ id, role }` — no sensitive data
- Expired and tampered JWTs are rejected with HTTP 401
- MongoDB operator injection (`$ne`, `$gt`) is blocked by strict string-type validation
- All credential failures return the same generic message
- Rate limiting is **not yet implemented** — planned for a future hardening milestone

---
