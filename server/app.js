import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import healthcheckRouter from './routes/healthcheck.routes.js';

const app = express();

// Global Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1", healthcheckRouter);

// Root Route for Health Check
app.get("/", (req, res) => {
    res.json({ message: "ERP System API is running" });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
