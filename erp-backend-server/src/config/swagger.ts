import swaggerAutogen from "swagger-autogen";
import path from "path";

// ---------------------------------------------------------------------------
// Swagger document definition — metadata and global definitions.
// swagger-autogen scans the route files listed in endpointsFiles and
// merges the JSDoc @swagger annotations with this base document.
// ---------------------------------------------------------------------------
const doc = {
  info: {
    title: "ERP Backend API",
    version: "1.0.0",
    description:
      "Production-grade ERP REST API with role-based access control (RBAC), " +
      "multi-tenancy, JWT authentication with refresh token rotation, " +
      "and comprehensive business modules.",
    contact: {
      name: "ERP Development Team",
      email: "dev@erp.com",
    },
    license: {
      name: "Private",
    },
  },
  host: "localhost:5000",
  basePath: "/api/v1",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],

  // ── Security definitions ─────────────────────────────────────────────────
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        'JWT access token. Format: "Bearer &lt;token&gt;". ' +
        "Obtain from POST /api/v1/auth/login.",
    },
  },

  // ── Reusable response schemas ────────────────────────────────────────────
  definitions: {
    SuccessResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: { type: "object" },
        meta: {
          type: "object",
          properties: {
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 20 },
                total: { type: "integer", example: 100 },
                totalPages: { type: "integer", example: 5 },
                hasNextPage: { type: "boolean", example: true },
                hasPrevPage: { type: "boolean", example: false },
              },
            },
          },
        },
      },
    },
    ErrorResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          type: "object",
          properties: {
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
              description: "Machine-readable error code for programmatic handling",
            },
            message: {
              type: "string",
              example: "Validation failed on request body",
            },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email address" },
                },
              },
            },
          },
        },
      },
    },
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        role: { type: "string", enum: ["SuperAdmin", "CompanyAdmin", "Employee"] },
        companyId: { type: "string", nullable: true },
        isActive: { type: "boolean" },
        lastLoginAt: { type: "string", format: "date-time", nullable: true },
      },
    },
    Company: {
      type: "object",
      properties: {
        _id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        address: { type: "string" },
        contactNumber: { type: "string" },
        gstNumber: { type: "string", nullable: true },
        adminId: { type: "string", nullable: true },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    Employee: {
      type: "object",
      properties: {
        _id: { type: "string" },
        employeeId: { type: "string", example: "EMP-00001" },
        fullName: { type: "string" },
        email: { type: "string" },
        department: { type: "string" },
        designation: { type: "string" },
        salary: { type: "number" },
        status: { type: "string", enum: ["Active", "Inactive"] },
        joiningDate: { type: "string", format: "date" },
      },
    },
  },

  // ── Tags ordering in the Swagger UI ────────────────────────────────────
  tags: [
    { name: "Health", description: "Health check endpoints" },
    { name: "Auth", description: "Authentication and session management" },
    { name: "Companies", description: "Company management (SuperAdmin)" },
    { name: "Employees", description: "Employee management (CompanyAdmin)" },
    { name: "Attendance", description: "Attendance tracking" },
    { name: "Payslips", description: "Payroll processing" },
    { name: "Tasks", description: "Task assignment and tracking" },
    { name: "Leads", description: "Customer lead management" },
    { name: "Quotations", description: "Sales quotations" },
    { name: "Invoices", description: "Invoice management" },
  ],
};

// ---------------------------------------------------------------------------
// Output path — the generated spec file. swagger-ui-express serves this.
// ---------------------------------------------------------------------------
const outputFile = path.resolve(__dirname, "../../swagger.json");

// ---------------------------------------------------------------------------
// Route files to scan — swagger-autogen reads the @swagger JSDoc annotations
// from these files and merges them into the output document.
// ---------------------------------------------------------------------------
const endpointsFiles = [
  path.resolve(__dirname, "../routes/v1/index.ts"),
  path.resolve(__dirname, "../routes/v1/auth.routes.ts"),
  path.resolve(__dirname, "../routes/v1/company.routes.ts"),
  path.resolve(__dirname, "../routes/v1/modules.routes.ts"),
];

// ---------------------------------------------------------------------------
// Run generation — called via `npm run swagger` before starting the server.
// In development, the app.ts file regenerates the spec on startup.
// ---------------------------------------------------------------------------
const generate = swaggerAutogen({ openapi: "3.0.0" });
generate(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅  Swagger spec generated at", outputFile);
});

export default generate;
