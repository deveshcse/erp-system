/**
 * swagger.ts
 *
 * Single source of truth for the OpenAPI specification.
 *
 * - Imported by app.ts to serve the live Swagger UI.
 * - Run directly via `npm run swagger` to write a static swagger.json
 *   (useful for CI, deployment previews, or frontend code-gen tools).
 */

import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// process.cwd() resolves to the project root (erp-backend-server/)
// regardless of how the file is invoked, so source paths are always correct.
const srcDir = path.resolve(process.cwd(), "src");

// ---------------------------------------------------------------------------
// OpenAPI definition
// ---------------------------------------------------------------------------
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERP Backend API",
      version: "1.0.0",
      description:
        "Production-grade ERP REST API with role-based access control (RBAC), " +
        "multi-tenancy, JWT authentication with refresh token rotation, " +
        "and comprehensive business modules.",
      contact: { name: "ERP Development Team", email: "dev@erp.com" },
      license: { name: "Private" },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 5001}/api/${process.env.API_VERSION ?? "v1"}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: 'Obtain via POST /api/v1/auth/login, then pass as "Bearer <token>".',
        },
      },
    },
    tags: [
      { name: "Health",     description: "Health check endpoints" },
      { name: "Auth",       description: "Authentication and session management" },
      { name: "Companies",  description: "Company management (SuperAdmin)" },
      { name: "Employees",  description: "Employee management (CompanyAdmin)" },
      { name: "Attendance", description: "Attendance tracking" },
      { name: "Payslips",   description: "Payroll processing" },
      { name: "Tasks",      description: "Task assignment and tracking" },
      { name: "Leads",      description: "Customer lead management" },
      { name: "Quotations", description: "Sales quotations" },
      { name: "Invoices",   description: "Invoice management" },
    ],
  },
  // Route files that contain @swagger JSDoc annotations
  apis: [
    path.join(srcDir, "routes/v1/index.ts"),
    path.join(srcDir, "modules/auth/routes/auth.routes.ts"),
    path.join(srcDir, "modules/company/routes/company.routes.ts"),
    path.join(srcDir, "modules/employee/routes/employee.routes.ts"),
    path.join(srcDir, "modules/attendance/routes/attendance.routes.ts"),
    path.join(srcDir, "modules/payslip/routes/payslip.routes.ts"),
    path.join(srcDir, "modules/task/routes/task.routes.ts"),
    path.join(srcDir, "modules/crm/routes/crm.routes.ts"),
  ],
};

// ---------------------------------------------------------------------------
// Build the spec — exported so app.ts can import and serve it directly.
// ---------------------------------------------------------------------------
export const swaggerSpec = swaggerJsdoc(options);

// ---------------------------------------------------------------------------
// When run directly (`npm run swagger`), write a static swagger.json.
// Useful for CI, API client code-gen, or deployment previews.
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const outputFile = path.resolve(__dirname, "../../swagger.json");
  fs.writeFileSync(outputFile, JSON.stringify(swaggerSpec, null, 2), "utf-8");
  console.log("✅  swagger.json written to", outputFile);
}
