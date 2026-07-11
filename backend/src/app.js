import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors()); //{ origin: process.env.CLIENT_URL, credentials: true }
app.use(helmet());
app.use(morgan("dev"));

import authRouter from "./routes/auth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import receptionistRouter from "./routes/receptionist.routes.js";
import slotRouter from "./routes/slot.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";

import patientRouter from "./routes/patient.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/receptionists", receptionistRouter);
app.use("/api/v1/slots", slotRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/patients", patientRouter);

// Global Error Handler
app.use(errorHandler);

export default app;