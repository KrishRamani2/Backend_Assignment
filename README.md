# 🏦 Finance Dashboard Backend

> **Finance Data Processing and Access Control Backend** — Built with Express.js, TypeScript, Prisma ORM, JWT Authentication, and Role-Based Access Control.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Architecture & Flows](#-architecture--flows)
- [Authentication & Roles](#-authentication--roles)
- [Switching to PostgreSQL](#-switching-to-postgresql)
- [Deployment](#-deployment)
- [Assumptions](#-assumptions)

---

## ✨ Features

- **User Management** — Register, login, list users (admin), activate/deactivate accounts
- **Role-Based Access Control** — VIEWER, ANALYST, ADMIN with granular permissions
- **Financial Records CRUD** — Create, read, update, soft-delete with ownership enforcement
- **Advanced Filtering** — Filter by date range, category, transaction type
- **Pagination & Sorting** — Configurable page size, multiple sort fields
- **Dashboard Analytics** — Total income/expense, net balance, category breakdown, monthly trends, recent records
- **JWT Authentication** — Secure Bearer token authentication with active-user checks
- **Input Validation** — Zod schemas for all endpoints with descriptive error messages
- **Rate Limiting** — Global + stricter auth-specific rate limiting
- **Swagger Documentation** — Interactive API docs at `/api-docs`
- **Soft Delete** — Records are soft-deleted (never permanently removed)
- **Centralized Error Handling** — Consistent JSON error responses
- **Graceful Shutdown** — Proper SIGTERM/SIGINT handling

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js + Express.js** | HTTP server & routing |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access & migrations |
| **SQLite** | Development database (switchable to PostgreSQL) |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Zod** | Input validation |
| **swagger-ui-express** | API documentation |
| **express-rate-limit** | Rate limiting |
| **Helmet** | Security headers |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Setup

```bash
# 1. Clone & install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database (creates SQLite DB)
npx prisma db push

# 5. Seed the database with sample data
npm run seed

# 6. Start development server
npm run dev
```

Or use the one-liner:
```bash
npm run setup && npm run dev
```

### Default Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@example.com | password123 |
| ANALYST | analyst@example.com | password123 |
| VIEWER | viewer@example.com | password123 |

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run seed` | Seed database with sample data |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:reset` | Reset DB and re-seed |
| `npm run setup` | Full setup (install + generate + push + seed) |

---

## 📁 Project Structure

```
finance-dashboard-backend/
├── prisma/
│   └── schema.prisma          # Database schema (User, FinancialRecord)
├── src/
│   ├── config/
│   │   ├── index.ts            # Environment variables
│   │   └── swagger.ts          # OpenAPI/Swagger configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Auth request handlers
│   │   ├── dashboard.controller.ts
│   │   ├── record.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   ├── roleGuard.ts        # Role-based access middleware
│   │   └── validate.ts         # Zod validation middleware
│   ├── prisma/
│   │   ├── client.ts           # Prisma client singleton
│   │   └── seed.ts             # Database seed script
│   ├── routes/
│   │   ├── auth.routes.ts      # POST /register, /login, GET /me
│   │   ├── dashboard.routes.ts # GET /summary
│   │   ├── record.routes.ts    # CRUD /records
│   │   └── user.routes.ts      # GET /users, PATCH /status
│   ├── services/
│   │   ├── auth.service.ts     # Auth business logic
│   │   ├── dashboard.service.ts # Dashboard aggregations
│   │   ├── record.service.ts   # Record CRUD logic
│   │   └── user.service.ts     # User management logic
│   ├── utils/
│   │   ├── apiError.ts         # Custom error class
│   │   ├── constants.ts        # Role & type enums
│   │   ├── response.ts         # Response helpers
│   │   └── validators.ts       # Zod schemas
│   └── server.ts               # Express app entry point
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔗 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login & get JWT | ❌ |
| GET | `/api/auth/me` | Get current profile | ✅ |

### Users (`/api/users`) — Admin Only
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | List all users | ADMIN |
| GET | `/api/users/:id` | Get user by ID | ADMIN |
| PATCH | `/api/users/:id/status` | Activate/deactivate user | ADMIN |

### Financial Records (`/api/records`)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/records` | Create record | All authenticated |
| GET | `/api/records` | List records (filtered, paginated) | All (VIEWER: own only) |
| GET | `/api/records/:id` | Get record by ID | All (VIEWER: own only) |
| PUT | `/api/records/:id` | Update record | Owner or ADMIN |
| DELETE | `/api/records/:id` | Soft-delete record | Owner or ADMIN |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/summary` | Full analytics summary | ANALYST, ADMIN |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api-docs` | Swagger UI |
| GET | `/api-docs/json` | Raw OpenAPI JSON |

---

## 🏗 Architecture & Flows

### 1. System Architecture

```mermaid
graph TB
    Client["🖥️ Client / Frontend"] -->|HTTP Requests| API["🌐 Express API Gateway"]
    
    API --> AuthMW["🔒 Auth Middleware"]
    API --> RateLimiter["⏱️ Rate Limiter"]
    API --> Validator["✅ Zod Validator"]
    
    AuthMW --> RoleGuard["🛡️ Role Guard"]
    RoleGuard --> Routes["📍 Routes"]
    
    Routes --> AuthCtrl["Auth Controller"]
    Routes --> UserCtrl["User Controller"]
    Routes --> RecordCtrl["Record Controller"]
    Routes --> DashCtrl["Dashboard Controller"]
    
    AuthCtrl --> AuthSvc["Auth Service"]
    UserCtrl --> UserSvc["User Service"]
    RecordCtrl --> RecordSvc["Record Service"]
    DashCtrl --> DashSvc["Dashboard Service"]
    
    AuthSvc --> Prisma["🗄️ Prisma ORM"]
    UserSvc --> Prisma
    RecordSvc --> Prisma
    DashSvc --> Prisma
    
    Prisma --> DB[("💾 SQLite / PostgreSQL")]
    
    AuthSvc --> JWT["🔑 JWT"]
    AuthSvc --> Bcrypt["🔐 Bcrypt"]
    
    API --> Swagger["📚 Swagger UI"]
    API --> ErrorHandler["❌ Error Handler"]
```

### 2. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Route
    participant V as Zod Validator
    participant S as Auth Service
    participant DB as Database
    participant J as JWT

    C->>A: POST /api/auth/login {email, password}
    A->>V: Validate request body
    V-->>A: Validation passed
    A->>S: AuthService.login(email, password)
    S->>DB: Find user by email
    DB-->>S: User record
    S->>S: bcrypt.compare(password, hash)
    alt Password valid
        S->>J: Sign JWT {userId, email, role}
        J-->>S: Token
        S-->>A: {user, token}
        A-->>C: 200 OK {success: true, data: {user, token}}
    else Password invalid
        S-->>A: Throw 401 Unauthorized
        A-->>C: 401 {success: false, error: "Invalid credentials"}
    end
```

### 3. Role-Based Access Control Flow

```mermaid
flowchart TD
    Start["🔐 Incoming Request"] --> AuthCheck{"Has Bearer Token?"}
    
    AuthCheck -->|No| Reject401["❌ 401 Unauthorized"]
    AuthCheck -->|Yes| VerifyJWT{"Verify JWT Token"}
    
    VerifyJWT -->|Invalid/Expired| Reject401
    VerifyJWT -->|Valid| CheckActive{"User Active?"}
    
    CheckActive -->|No| Reject403["🚫 403 Forbidden"]
    CheckActive -->|Yes| RoleCheck{"Check Role Guard"}
    
    RoleCheck -->|ADMIN| AdminAccess["✅ Full Access"]
    RoleCheck -->|ANALYST| AnalystAccess["📊 Read + Dashboard"]
    RoleCheck -->|VIEWER| ViewerAccess["👁️ Own Data Only"]
    RoleCheck -->|Wrong Role| Reject403
    
    AdminAccess --> Process["Process Request"]
    AnalystAccess --> Process
    ViewerAccess --> OwnerCheck{"Owns Resource?"}
    
    OwnerCheck -->|Yes| Process
    OwnerCheck -->|No| Reject403
    
    Process --> Response["📤 Send Response"]
```

### 4. Financial Record CRUD Flow

```mermaid
flowchart LR
    subgraph CREATE
        C1[POST /records] --> C2[Validate Body]
        C2 --> C3[Attach userId]
        C3 --> C4[Create in DB]
        C4 --> C5[Return 201]
    end
    
    subgraph READ
        R1[GET /records] --> R2[Parse Filters]
        R2 --> R3{Role?}
        R3 -->|VIEWER| R4[Own records only]
        R3 -->|ANALYST/ADMIN| R5[All records]
        R4 --> R6[Apply pagination]
        R5 --> R6
        R6 --> R7[Return paginated]
    end
    
    subgraph UPDATE
        U1[PUT /records/:id] --> U2[Find record]
        U2 --> U3{Owner or Admin?}
        U3 -->|No| U4[403 Forbidden]
        U3 -->|Yes| U5[Update record]
        U5 --> U6[Return updated]
    end
    
    subgraph DELETE
        D1[DELETE /records/:id] --> D2[Find record]
        D2 --> D3{Owner or Admin?}
        D3 -->|No| D4[403 Forbidden]
        D3 -->|Yes| D5[Soft delete]
        D5 --> D6[Return success]
    end
```

### 5. Dashboard Analytics Flow

```mermaid
flowchart TD
    Req["GET /api/dashboard/summary"] --> Auth["🔒 Authenticate"]
    Auth --> RoleCheck{"Role is ANALYST or ADMIN?"}
    
    RoleCheck -->|No| Forbidden["🚫 403 Forbidden"]
    RoleCheck -->|Yes| Parallel["⚡ Parallel Queries"]
    
    Parallel --> Q1["SUM income"]
    Parallel --> Q2["SUM expense"]
    Parallel --> Q3["GROUP BY category"]
    Parallel --> Q4["TOP 5 recent"]
    Parallel --> Q5["Monthly trends 12mo"]
    Parallel --> Q6["COUNT records"]
    
    Q1 --> Aggregate["📊 Aggregate Results"]
    Q2 --> Aggregate
    Q3 --> Aggregate
    Q4 --> Aggregate
    Q5 --> Aggregate
    Q6 --> Aggregate
    
    Aggregate --> Response["📤 Response"]
    
    Response --> Overview["overview: totalIncome, totalExpense, netBalance"]
    Response --> Categories["categoryBreakdown: [{category, type, total}]"]
    Response --> Recent["recentTransactions: [top 5]"]
    Response --> Trends["monthlyTrends: [{month, income, expense}]"]
```

---

## 🔐 Authentication & Roles

### Role Permissions Matrix

| Feature | VIEWER | ANALYST | ADMIN |
|---------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View own records | ✅ | ✅ | ✅ |
| View all records | ❌ | ✅ | ✅ |
| Create records | ✅ | ✅ | ✅ |
| Update own records | ✅ | ✅ | ✅ |
| Update any record | ❌ | ❌ | ✅ |
| Delete own records | ✅ | ✅ | ✅ |
| Delete any record | ❌ | ❌ | ✅ |
| Dashboard summary | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🐘 Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
   ```

3. Regenerate Prisma client and push:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

---

## 🚢 Deployment

### Railway / Render

1. Push code to GitHub
2. Connect repository to Railway or Render
3. Set environment variables:
   ```
   DATABASE_URL=<your-postgresql-url>
   JWT_SECRET=<strong-random-secret>
   NODE_ENV=production
   PORT=3000
   ```
4. Build command: `npm run build && npx prisma generate && npx prisma db push`
5. Start command: `npm start`

### Docker

```bash
# Build image
docker build -t finance-dashboard-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV=production \
  finance-dashboard-backend
```

---

## 📝 Assumptions

1. **SQLite for development** — Easy setup with zero configuration. Switch to PostgreSQL for production via Prisma datasource config.
2. **Soft delete** — Financial records are never permanently deleted (`isDeleted` flag). This preserves audit trails.
3. **Single-role per user** — Each user has exactly one role (VIEWER, ANALYST, or ADMIN). No multi-role support.
4. **Self-registration** — Any user can register and defaults to VIEWER role. Role upgrade must be done by an ADMIN.
5. **JWT expiration** — Tokens expire in 24 hours. No refresh token mechanism (can be added).
6. **Rate limiting** — 100 requests per 15 minutes globally, 20 for auth endpoints.
7. **Amount stored as Float** — For simplicity. In a production financial system, use Decimal type with a PostgreSQL backend.
8. **No email verification** — Registration is immediate. Add email verification for production use.
9. **Category is free-text** — Categories are not predefined. Users can create any category string.
10. **Dashboard access** — Only ANALYST and ADMIN roles can access the dashboard summary. VIEWER role is restricted to their own records only.

---

## 📄 License

MIT © Krish Ramani
