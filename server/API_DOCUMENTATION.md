# ERP System API Documentation

The server is built with Node.js, Express, and MongoDB. All API endpoints are prefixed with `/api/v1`.

## Base URL
`http://localhost:5000/api/v1` (Default development)

---

## Authentication

### POST `/auth/register`
- **Summary**: Register a new user. Restricted to `SUPER_ADMIN`.
- **Authentication**: Required (JWT), Roles: `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securepassword",
    "role": "COMPANY_ADMIN", // Optional: SUPER_ADMIN, COMPANY_ADMIN, EMPLOYEE
    "companyId": "mongo_id" // Required for COMPANY_ADMIN/EMPLOYEE
  }
  ```
- **Response**: 201 Created

### POST `/auth/login`
- **Summary**: Login a user and receive tokens.
- **Authentication**: None
- **Input (Body)**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    },
    "message": "User logged in successfully",
    "success": true
  }
  ```

### POST `/auth/logout`
- **Summary**: Logout the current user and clear cookies.
- **Authentication**: Required (JWT)
- **Response**: 200 OK

### POST `/auth/refresh-token`
- **Summary**: Refresh the access token using a refresh token.
- **Authentication**: None (Requires `refreshToken` in cookie or body)
- **Input (Body)**:
  ```json
  {
    "refreshToken": "..."
  }
  ```
- **Response**: 200 OK

---

## Companies

### POST `/companies`
- **Summary**: Create a new company along with its primary admin.
- **Authentication**: Required (JWT), Roles: `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "companyName": "Tech Corp",
    "companyEmail": "contact@techcorp.com",
    "companyAddress": "123 Street, City",
    "contactNumber": "1234567890",
    "gstNumber": "GST123456",
    "adminData": {
      "name": "Admin Name",
      "email": "admin@techcorp.com",
      "password": "adminpassword"
    }
  }
  ```
- **Response**: 201 Created

### GET `/companies`
- **Summary**: List all companies with pagination.
- **Authentication**: Required (JWT), Roles: `SUPER_ADMIN`
- **Input (Query)**: `page` (default 1), `limit` (default 10), `search`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "companies": [
        {
          "_id": "id",
          "companyName": "Tech Corp",
          "adminUserId": { "_id": "id", "name": "Admin", "email": "admin@example.com" },
          "companyEmail": "...",
          "createdAt": "..."
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    },
    "message": "Companies fetched successfully",
    "success": true
  }
  ```


### GET `/companies/stats`
- **Summary**: Get overall company statistics.
- **Authentication**: Required (JWT), Roles: `SUPER_ADMIN`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "totalCompanies": 10,
      "recentCompanies": [
        { "_id": "id", "companyName": "Recent Co" }
      ],
      "stats": { "count": 10 }
    },
    "message": "Company statistics fetched",
    "success": true
  }
  ```

### GET `/companies/:id`
- **Summary**: Get specific company details.
- **Authentication**: Required (JWT), Roles: `SUPER_ADMIN`
- **Input (Path)**: `id` (Company Mongo ID)
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "id",
      "companyName": "Tech Corp",
      "adminUserId": { "_id": "id", "name": "Admin", "email": "admin@example.com" }
    },
    "message": "Company details fetched",
    "success": true
  }
  ```

---

## Employees

### POST `/employees`
- **Summary**: Add a new employee to the company.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`
- **Input (Body)**:
  ```json
  {
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "department": "Engineering",
    "designation": "Software Engineer",
    "joiningDate": "2024-01-01",
    "salary": 50000
  }
  ```
- **Response**: 201 Created

### GET `/employees`
- **Summary**: List employees with pagination and filters.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`
- **Input (Query)**: `page`, `limit`, `search`, `department`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "employees": [
        {
          "_id": "id",
          "fullName": "John Doe",
          "employeeId": "EMP001",
          "department": "Engineering"
        }
      ],
      "pagination": { ... }
    },
    "message": "Employees fetched successfully",
    "success": true
  }
  ```

### PUT `/employees/:id`
- **Summary**: Update employee details.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`
- **Input (Path)**: `id` (Employee Mongo ID)
- **Input (Body)**: Any employee fields to update.
- **Response**: 200 OK

### DELETE `/employees/:id`
- **Summary**: Delete an employee.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`
- **Input (Path)**: `id` (Employee Mongo ID)
- **Response**: 200 OK

---

## Attendance

### POST `/attendance/mark`
- **Summary**: Mark attendance for an employee manually.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "employeeId": "id",
    "date": "2024-03-20",
    "checkIn": "2024-03-20T09:00:00Z",
    "checkOut": "2024-03-20T18:00:00Z",
    "status": "PRESENT" // PRESENT, ABSENT, LEAVE
  }
  ```
- **Response**: 200 OK

### GET `/attendance`
- **Summary**: View attendance history.
- **Authentication**: Required (JWT)
- **Input (Query)**: `employeeId`, `startDate`, `endDate`
- **Response**: 200 OK
  - **Example (Admin/Super Admin)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "history": [
          {
            "_id": "id",
            "employeeId": { "_id": "id", "fullName": "John Doe", "employeeId": "EMP001" },
            "date": "2024-03-20",
            "status": "PRESENT"
          }
        ],
        "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
      },
      "message": "Attendance history fetched",
      "success": true
    }
    ```
  - **Example (Employee - Self View)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "history": [
          {
            "_id": "id",
            "employeeId": { "_id": "id", "fullName": "My Name", "employeeId": "EMP-ME" },
            "date": "2024-03-20",
            "status": "PRESENT"
          }
        ],
        "pagination": { "total": 20, "page": 1, "limit": 10, "totalPages": 2 }
      },
      "message": "Attendance history fetched",
      "success": true
    }
    ```

### GET `/attendance/report`
- **Summary**: Generate monthly attendance report.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Query)**: `month` (1-12), `year`, `employeeId` (optional)
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "_id": "employee_id",
        "fullName": "John Doe",
        "employeeId": "EMP001",
        "totalPresent": 20,
        "totalAbsent": 2,
        "totalLeave": 0,
        "attendanceRate": 90.9
      }
    ],
    "message": "Attendance report generated",
    "success": true
  }
  ```

---

## Payroll

### POST `/payroll/process`
- **Summary**: Process payroll and generate a payslip.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "employeeId": "id",
    "month": "2024-03",
    "workingDays": 22,
    "leaveDays": 1,
    "allowances": 2000,
    "deductions": 500
  }
  ```
- **Response**: 201 Created

### GET `/payroll/payslips/:employeeId`
- **Summary**: View payslips for a specific employee.
- **Authentication**: Required (JWT)
- **Input (Path)**: `employeeId`
- **Input (Query)**: `month` (optional)
- **Response**: 200 OK
  - **Example (Admin/Super Admin - Any Employee)**:
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "_id": "id",
          "employeeId": { "fullName": "John Doe", "employeeId": "EMP001", ... },
          "month": "2024-03",
          "netSalary": 51500
        }
      ],
      "message": "Payslips fetched successfully",
      "success": true
    }
    ```
  - **Example (Employee - Own Payslips Only)**:
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "_id": "id",
          "employeeId": { "fullName": "My Name", "employeeId": "EMP-ME", ... },
          "month": "2024-03",
          "netSalary": 48000
        }
      ],
      "message": "Payslips fetched successfully",
      "success": true
    }
    ```

### GET `/payroll/all`
- **Summary**: View all payslips for the company.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Query)**: `month`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "payslips": [ ... ],
      "pagination": { ... }
    },
    "message": "Company payslips fetched successfully",
    "success": true
  }
  ```

### GET `/payroll/my-payslips`
- **Summary**: View own payslips.
- **Authentication**: Required (JWT)
- **Input (Query)**: `month`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": [ ... ],
    "message": "Your payslips fetched successfully",
    "success": true
  }
  ```

---

## Tasks

### POST `/tasks`
- **Summary**: Create and assign a new task.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "title": "Fix Bug",
    "description": "Resolve the issue in login flow",
    "assignedTo": "employee_id",
    "deadline": "2024-03-25T17:00:00Z",
    "priority": "HIGH" // LOW, MEDIUM, HIGH, URGENT
  }
  ```
- **Response**: 201 Created

### GET `/tasks`
- **Summary**: View tasks (Employees see their own, Admins see all).
- **Authentication**: Required (JWT)
- **Input (Query)**: `status`, `priority`
- **Response**: 200 OK
  - **Example (Admin - All Tasks)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "tasks": [
          {
            "_id": "id",
            "title": "Fix Bug",
            "assignedTo": { "fullName": "John Doe", "employeeId": "EMP001" },
            "assignedBy": { "name": "Admin", "email": "admin@example.com" },
            "status": "PENDING"
          }
        ],
        "pagination": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
      },
      "message": "Tasks fetched successfully",
      "success": true
    }
    ```
  - **Example (Employee - Own Tasks)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "tasks": [
          {
            "_id": "id",
            "title": "Assigned to Me",
            "assignedTo": { "fullName": "My Name", "employeeId": "EMP-ME" },
            "assignedBy": { "name": "Manager", "email": "manager@example.com" },
            "status": "IN_PROGRESS"
          }
        ],
        "pagination": { "total": 2, "page": 1, "limit": 10, "totalPages": 1 }
      },
      "message": "Tasks fetched successfully",
      "success": true
    }
    ```

### PUT `/tasks/:id/status`
- **Summary**: Update task status.
- **Authentication**: Required (JWT)
- **Input (Path)**: `id` (Task Mongo ID)
- **Input (Body)**:
  ```json
  {
    "status": "IN_PROGRESS" // PENDING, IN_PROGRESS, COMPLETED
  }
  ```
- **Response**: 200 OK

---

## Leads

### POST `/leads`
- **Summary**: Create a new sales lead.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "customerName": "Jane Smith",
    "companyName": "Blue Sky Inc",
    "phone": "9876543210",
    "email": "jane@bluesky.com",
    "leadSource": "Website",
    "status": "NEW", // NEW, CONTACTED, NEGOTIATION, CLOSED, LOST
    "notes": "Interested in ERP solution"
  }
  ```
- **Response**: 201 Created

### GET `/leads`
- **Summary**: List leads with pagination and filters.
- **Authentication**: Required (JWT)
- **Input (Query)**: `page`, `limit`, `search`, `status`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "leads": [
        {
          "_id": "id",
          "customerName": "Jane Smith",
          "status": "NEW"
        }
      ],
      "pagination": { ... }
    },
    "message": "Leads fetched successfully",
    "success": true
  }
  ```

### PUT `/leads/:id`
- **Summary**: Update lead details.
- **Authentication**: Required (JWT)
- **Input (Path)**: `id`
- **Input (Body)**: Update fields.
- **Response**: 200 OK

### DELETE `/leads/:id`
- **Summary**: Delete a lead.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Response**: 200 OK

---

## Quotations

### POST `/quotations`
- **Summary**: Create a new quotation.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "customerName": "Jane Smith",
    "items": [
      { "name": "Service A", "quantity": 1, "price": 1000 }
    ],
    "tax": 18,
    "validityDate": "2024-04-01T00:00:00Z",
    "status": "SENT" // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  }
  ```
- **Response**: 201 Created

### GET `/quotations`
- **Summary**: List quotations.
- **Authentication**: Required (JWT)
- **Input (Query)**: `customerName`, `status`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "quotations": [
        {
          "_id": "id",
          "customerName": "Jane Smith",
          "totalAmount": 1180
        }
      ],
      "pagination": { ... }
    },
    "message": "Quotations fetched successfully",
    "success": true
  }
  ```

### GET `/quotations/:id`
- **Summary**: Get quotation details.
- **Authentication**: Required (JWT)
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "id",
      "customerName": "Jane Smith",
      "items": [ ... ],
      "totalAmount": 1180
    },
    "message": "Quotation fetched successfully",
    "success": true
  }
  ```

---

## Invoices

### POST `/invoices`
- **Summary**: Create a new invoice.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "invoiceNumber": "INV-2024-001",
    "customerName": "Jane Smith",
    "items": [
      { "name": "Service A", "quantity": 1, "price": 1000 }
    ],
    "tax": 18,
    "paymentStatus": "PENDING" // PENDING, PAID, PARTIALLY_PAID
  }
  ```
- **Response**: 201 Created

### GET `/invoices`
- **Summary**: List invoices.
- **Authentication**: Required (JWT)
- **Input (Query)**: `invoiceNumber`, `customerName`, `paymentStatus`
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "invoices": [
        {
          "_id": "id",
          "invoiceNumber": "INV-001",
          "total": 1180
        }
      ],
      "pagination": { ... }
    },
    "message": "Invoices fetched successfully",
    "success": true
  }
  ```

### GET `/invoices/:id`
- **Summary**: Get invoice details.
- **Authentication**: Required (JWT)
- **Response**: 200 OK
  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "id",
      "invoiceNumber": "INV-001",
      "total": 1180,
      "paymentStatus": "PENDING"
    },
    "message": "Invoice fetched successfully",
    "success": true
  }
  ```

### PATCH `/invoices/:id/status`
- **Summary**: Update invoice payment status.
- **Authentication**: Required (JWT), Roles: `COMPANY_ADMIN`, `SUPER_ADMIN`
- **Input (Body)**:
  ```json
  {
    "paymentStatus": "PAID"
  }
  ```
- **Response**: 200 OK

---

## Dashboard

### GET `/dashboard/stats`
- **Summary**: Get role-based dashboard statistics for charts.
- **Authentication**: Required (JWT)
- **Response**: 200 OK
  - **Example (SUPER_ADMIN)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "registrationTrend": [ { "_id": { "year": 2024, "month": 3 }, "count": 2 } ],
        "totalCompanies": 10
      },
      "message": "Dashboard statistics fetched successfully",
      "success": true
    }
    ```
  - **Example (COMPANY_ADMIN)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "leadStats": [ { "_id": "NEW", "count": 5 }, { "_id": "CLOSED", "count": 2 } ],
        "revenueTrend": [ { "_id": { "year": 2024, "month": 3 }, "revenue": 50000 } ]
      },
      "message": "Dashboard statistics fetched successfully",
      "success": true
    }
    ```
  - **Example (EMPLOYEE)**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "taskStats": [ { "_id": "PENDING", "count": 2 }, { "_id": "COMPLETED", "count": 1 } ],
        "attendanceStats": [ { "_id": "PRESENT", "count": 15 }, { "_id": "ABSENT", "count": 1 } ]
      },
      "message": "Dashboard statistics fetched successfully",
      "success": true
    }
    ```

---

## Health Check

### GET `/healthcheck`
- **Summary**: Check if the API is running.
- **Authentication**: None
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "message": "Health check passed"
  }
  ```
