import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/config.js";
import cors from "cors";

import Student_Route from "./routers/Student_Route.js"

const app = express();
const port = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/student", Student_Route);

app.get("/api/test", (req, res) => {
  res.json({
    message: "API working successfully",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});