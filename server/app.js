import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import healthcheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';
import companyRouter from './routes/company.routes.js';
import employeeRouter from './routes/employee.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import payrollRouter from './routes/payroll.routes.js';
import taskRouter from './routes/task.routes.js';
import leadRouter from './routes/lead.routes.js';
import quotationRouter from './routes/quotation.routes.js';
import invoiceRouter from './routes/invoice.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({ 
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true 
}));

// Request Logger
if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/payroll", payrollRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/quotations", quotationRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Root Route for Health Check
app.get("/", (req, res) => {
    res.json({ message: "ERP System API is running" });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
