import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import "./db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import vehicleHistoryRoutes from "./routes/vehicleHistoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    process.env.FRONTEND_URL
  );
}

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      /*
        Allow requests with no Origin header
        e.g. Postman / server-to-server
      */
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

/* =========================
   BODY
========================= */

app.use(
  express.json()
);

/* =========================
   UPLOADS
========================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "backend",
      "uploads"
    )
  )
);

/* =========================
   ROOT
========================= */

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "PSEB Vehicle Management Backend is running",
    });
  }
);

/* =========================
   HEALTH CHECK
========================= */

app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp:
        new Date().toISOString(),
    });
  }
);

/* =========================
   ROUTES
========================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/audit-logs",
  auditRoutes
);

app.use(
  "/api/vehicles",
  vehicleRoutes
);

app.use(
  "/api/drivers",
  driverRoutes
);

app.use(
  "/api/trips",
  tripRoutes
);

app.use(
  "/api/fuel",
  fuelRoutes
);

app.use(
  "/api/maintenance",
  maintenanceRoutes
);

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/incidents",
  incidentRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/vehicle-history",
  vehicleHistoryRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend server running on port ${PORT}`
    );
  }
);