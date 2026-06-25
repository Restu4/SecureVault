<div align="center">
  <h1>🔐 SecureVault</h1>
  <p><strong>Enterprise Authentication & Access Management Platform</strong></p>
  <p>Production-ready IAM system with JWT authentication, RBAC, session management, audit logging & security monitoring</p>
</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Access + Refresh token rotation (15m / 7d) |
| **RBAC** | Role & granular permission management |
| **Account Lockout** | 5 failed attempts → 15 min lockout |
| **Password Policy** | 8+ chars, upper, lower, digit, symbol enforced |
| **Password Reset** | Secure token-based forgot/change flow |
| **Session Management** | Track IP, device, browser, location per session |
| **Audit Logs** | Immutable trail of every security event |
| **Security Center** | Login attempt monitoring & threat detection |
| **Rate Limiting** | 100 req/60s per IP via @nestjs/throttler |
| **Dashboard** | Real-time charts & analytics (Recharts) |

---

## 🏗️ Tech Stack

**Backend:** NestJS 10, TypeORM, PostgreSQL, Passport.js, JWT, bcryptjs, Helmet

**Frontend:** React 18, TypeScript, Vite 5, TanStack React Query 5, Tailwind CSS 3, Recharts, React Router DOM 6

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (default port: 5434)

### 1. Clone & Install

```bash
git clone https://github.com/Restu4/SecureVault.git
cd SecureVault

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `.env` with your database credentials and JWT secret.

### 3. Seed Database

```bash
cd backend && npm run seed
```

### 4. Run

```bash
# Backend (terminal 1)
cd backend && npm run start:dev

# Frontend (terminal 2)
cd frontend && npm run dev
```

### Default Admin Login
| Email | Password |
|---|---|
| `admin@securevault.io` | `Admin@123` |

---

## 📁 Project Structure

```
backend/                         # NestJS API
├── src/
│   ├── common/                  # Guards, decorators, interceptors, filters
│   │   ├── guards/              # JwtAuthGuard, RolesGuard, PermissionsGuard
│   │   ├── decorators/          # @Public(), @Roles(), @Permissions()
│   │   └── filters/             # AllExceptionsFilter
│   ├── config/                  # App & database configuration
│   ├── database/                # Seed script
│   └── modules/
│       ├── auth/                # Register, login, refresh, logout
│       ├── users/               # User CRUD
│       ├── roles/               # Role management
│       ├── permissions/         # Permission definitions
│       ├── sessions/            # Session tracking
│       ├── audit-logs/          # Audit trail
│       ├── security/            # Login attempts & lockout
│       └── password/            # Password reset flow

frontend/                        # React Dashboard
├── src/
│   ├── pages/                   # Login, Register, Dashboard, Users, etc.
│   ├── layouts/                 # DashboardLayout (sidebar + navbar)
│   ├── contexts/                # AuthContext (auth state)
│   ├── services/                # API client (axios)
│   └── types/                   # TypeScript interfaces
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Sign in (returns tokens + session) |
| POST | `/api/v1/auth/refresh` | Rotate tokens |
| POST | `/api/v1/auth/logout` | Terminate session |
| POST | `/api/v1/auth/forgot-password` | Request reset email |
| POST | `/api/v1/auth/reset-password` | Reset with token |
| POST | `/api/v1/auth/change-password` | Change password |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user details |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Roles & Permissions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/roles` | List roles |
| POST | `/api/v1/roles` | Create role |
| GET | `/api/v1/permissions` | List permissions |

### Sessions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/sessions` | List active sessions |
| DELETE | `/api/v1/sessions/:id` | Terminate session |

### Audit Logs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/audit-logs` | Query audit trail |

---

## 🧪 Seed Data

| Role | Permissions |
|---|---|
| **Super Admin** | All (13 permissions) |
| **Admin** | User & session management |
| **User** | None |
| **Auditor** | View audit logs & reports |

---

## 📄 License

MIT
