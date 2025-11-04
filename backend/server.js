import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import chalk from "chalk";
import connectDB from "./config/db.js";
import session from "express-session";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import leadRoutes from "./routes/leadRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";



const app = express();

// ✅ Apply CORS first (before anything else)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// ✅ Sessions + passport after CORS
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/activities", activityRoutes);


// ✅ Start Server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(chalk.green("✅ MongoDB Connected"));
    app.listen(process.env.PORT || 5000, () =>
      console.log(chalk.cyan(`🚀 Server running on port ${process.env.PORT || 5000}`))
    );
  } catch (err) {
    console.error(chalk.red("❌ Error connecting to MongoDB"), err.message);
    process.exit(1);
  }
};
start();

export default app;
