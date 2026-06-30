import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/config.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import Student_Route from "./routers/Student_Route.js";
import Attendence_Route from "./routers/Attendence_Route.js";
import Fee_Route from "./routers/Fee_Route.js";
import Auth_Route from "./routers/Auth_Route.js";
import Class_Route from "./routers/Class_Route.js";
import teacherRoutes from "./routers/Teacher_Route.js";
import examRoutes from "./routers/Exam_Routes.js";
import noticeRoutes from "./routers/Notice_Routes.js";
import subjectRoutes from "./routers/Subject_Routes.js";
import timetableRoutes from "./routers/Timetable_Routes.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost / 127.0.0.1 origin regardless of port
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use("/image", express.static(path.join(__dirname, "public/image")));

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/auth", Auth_Route);
app.use("/api/students", Student_Route);
app.use("/api/attendance", Attendence_Route);
app.use("/api/fee", Fee_Route);
app.use("/api/classes", Class_Route);
app.use("/api/teachers", teacherRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/timetable", timetableRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "API working successfully" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
