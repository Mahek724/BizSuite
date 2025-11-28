import cors from "cors";
import morgan from "morgan";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import chalk from "chalk";
import connectDB from "./config/db.js";
import session from "express-session";
import passport from "./config/passport.js";

// ✅ Import Routes
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import leadRoutes from "./routes/leadRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiSummaryRoute from "./routes/aiSummary.js";

const app = express();

// ✅ Dynamic CORS setup
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile/postman
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(express.json());

// ✅ Sessions + Passport
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai-summary", aiSummaryRoute);


// ✅ Health check (for Render)
app.get("/_health", (_req, res) => res.json({ ok: true }));

// ✅ Start Server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(chalk.green("✅ MongoDB Connected"));
    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(chalk.cyan(`🚀 Server running on port ${port}`))
    );
  } catch (err) {
    console.error(chalk.red("❌ Error connecting to MongoDB"), err.message);
    process.exit(1);
  }
};

start();
export default app;
