import dotenv from "dotenv";
dotenv.config();
import express from "express";

import cors from "cors";
import chalk from "chalk"; // for colors
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import session from "express-session";
import passport from "./config/passport.js";



const app = express();

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/api/auth", authRoutes);

// start server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(chalk.green("✅ MongoDB Connected")); // colored message
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        chalk.cyan(`🚀 Server running on port ${process.env.PORT || 5000}`)
      )
    );
  } catch (err) {
    console.error(chalk.red("❌ Error connecting to MongoDB"), err.message);
    process.exit(1);
  }
};
start();

export default app;
