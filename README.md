# ERP System — MERN Stack

A modular Enterprise Resource Planning system built with MongoDB, Express.js, React.js, and Node.js. Supports multiple companies with role-based access control (RBAC) for Super Admin, Company Admin, and Employee roles.

---

## Features

| Module | Description |
|---|---|
| **Authentication** | JWT-based login/logout with bcrypt password hashing, refresh token rotation |
| **Company Management** | Super Admin creates companies and assigns Company Admins |
| **Employee Management** | CRUD operations for employee records within a company |
| **Attendance** | Mark attendance, view history, generate monthly reports |
| **Payroll & Payslip** | Define salary structures, calculate payroll prorated by attendance, generate payslips |
| **Task Management** | Admin creates/assigns tasks; employees update status |
| **Lead Management** | CRM-style lead tracking with status pipeline |
| **Quotation System** | Generate sales quotations with line items and tax |
| **Invoice System** | Create invoices, track payment status |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Query, React Router |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | express-validator |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/erp-system.git
cd erp-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp-system
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Seed Super Admin

Use the following script or directly create a Super Admin user via the MongoDB shell:

```bash
cd server
node scripts/seedSuperAdmin.js
```

---

## Architecture

```
erp-system/
├── client/                     # React frontend
│   └── src/
│       ├── api/                # API client modules (axios)
│       ├── components/         # Reusable UI components (by module)
│       ├── context/            # React Context (Auth)
│       ├── hooks/              # Custom hooks
│       ├── layouts/            # DashboardLayout, AuthLayout
│       ├── pages/              # Page-level components (by module)
│       ├── routes/             # AppRoutes, ProtectedRoute, RoleProtectedRoute
│       └── utils/              # Formatters and helpers
│
├── server/                     # Express backend
│   ├── config/                 # DB connection config
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Auth (JWT verify, RBAC), error handler
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions (with Swagger docs)
│   ├── services/               # Business logic layer
│   ├── validators/             # express-validator rule sets
│   ├── utils/                  # ApiError, ApiResponse, asyncHandler
│   ├── scripts/                # DB seed scripts
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
```

### Design Patterns

- **Service Layer**: Business logic is separated into `/services` — controllers are thin and only handle HTTP concerns.
- **RBAC Middleware**: `authorizeRoles("SUPER_ADMIN", "COMPANY_ADMIN")` applied at route level.
- **Company Isolation**: Every data query is scoped by `companyId` to ensure tenant separation.
- **Token Rotation**: Refresh tokens are rotated on each use and stored in httpOnly cookies.

---

## Database Schema

### Collections

| Collection | Key Fields |
|---|---|
| `users` | name, email, password, role (SUPER_ADMIN / COMPANY_ADMIN / EMPLOYEE), companyId, refreshToken |
| `companies` | companyName, companyEmail, companyAddress, contactNumber, gstNumber (optional), adminUserId |
| `employees` | employeeId, fullName, email, phoneNumber, department, designation, joiningDate, salary, status, allowances, deductions, companyId, userId |
| `attendance` | employeeId, date, checkIn, checkOut, status (PRESENT / ABSENT / LEAVE), note, companyId |
| `payslips` | employeeId, month, basicSalary, allowances, deductions, workingDays, leaveDays, netSalary, companyId |
| `tasks` | title, description, assignedTo, assignedBy, deadline, priority, status, companyId |
| `leads` | customerName, companyName, phone, email, leadSource, status, notes, companyId |
| `quotations` | customerName, items [{name, quantity, price}], tax, totalAmount, validityDate, companyId |
| `invoices` | invoiceNumber, customerName, items [{name, quantity, price}], tax, total, paymentStatus, companyId |

### Relationships

```
User ──1:1──> Company (adminUserId)
Employee ──N:1──> Company (companyId)
Employee ──1:1──> User (userId)
Attendance ──N:1──> Employee (employeeId)
Payslip ──N:1──> Employee (employeeId)
Task ──N:1──> Employee (assignedTo)
Task ──N:1──> User (assignedBy)
```

---

## API Documentation

When the server is running, Swagger docs are available at:

```
http://localhost:5000/api-docs
```

### Core Endpoints

| Module | Method | Endpoint | Auth |
|---|---|---|---|
| Auth | POST | `/api/v1/auth/login` | Public |
| Auth | POST | `/api/v1/auth/register` | Super Admin |
| Auth | POST | `/api/v1/auth/logout` | Authenticated |
| Companies | POST | `/api/v1/companies` | Super Admin |
| Companies | GET | `/api/v1/companies` | Super Admin |
| Employees | POST/GET/PUT/DELETE | `/api/v1/employees` | Company Admin |
| Attendance | POST | `/api/v1/attendance/mark` | Company Admin |
| Attendance | GET | `/api/v1/attendance` | Authenticated |
| Attendance | GET | `/api/v1/attendance/report` | Company Admin |
| Payroll | POST | `/api/v1/payroll/process` | Company Admin |
| Payroll | GET | `/api/v1/payroll/all` | Company Admin |
| Payroll | GET | `/api/v1/payroll/my-payslips` | Employee |
| Tasks | POST/GET/PUT | `/api/v1/tasks` | Authenticated |
| Leads | POST/GET/PUT/DELETE | `/api/v1/leads` | Company Admin |
| Quotations | POST/GET | `/api/v1/quotations` | Company Admin |
| Invoices | POST/GET | `/api/v1/invoices` | Company Admin |
| Invoices | PATCH | `/api/v1/invoices/:id/status` | Company Admin |

---

## Roles & Permissions

| Feature | Super Admin | Company Admin | Employee |
|---|---|---|---|
| Manage Companies | ✅ | ❌ | ❌ |
| Manage Employees | ❌ | ✅ | ❌ |
| Mark Attendance | ❌ | ✅ | ❌ |
| View Attendance | ❌ | ✅ (all) | ✅ (own) |
| Process Payroll | ❌ | ✅ | ❌ |
| View Payslips | ❌ | ✅ (all) | ✅ (own) |
| Manage Tasks | ❌ | ✅ (create/assign) | ✅ (update status) |
| Manage Leads | ❌ | ✅ | ❌ |
| Manage Quotations | ❌ | ✅ | ❌ |
| Manage Invoices | ❌ | ✅ | ❌ |

---

## Payroll Calculation

Salary is **prorated by attendance**:

```
totalWeekdays = weekdays in the month (Mon-Fri)
dailyRate = basicSalary / totalWeekdays
proratedSalary = dailyRate × workingDays
netSalary = proratedSalary + allowances - deductions
```

If `workingDays` is not provided manually, it is auto-calculated from the attendance records for that month.