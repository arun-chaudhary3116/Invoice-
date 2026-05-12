import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import initPassport from "./config/passport.js";

/* ───────────────────────────────
   INIT APP (MUST BE FIRST)
─────────────────────────────── */
const app = express();

/* ───────────────────────────────
   PATH SETUP
─────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ───────────────────────────────
   ENV CHECK
─────────────────────────────── */
const requiredEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
const missing = requiredEnvVars.filter((v) => !process.env[v]);

if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}

/* ───────────────────────────────
   CORS
─────────────────────────────── */
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ───────────────────────────────
   SECURITY HEADERS
─────────────────────────────── */
app.use((req, res, next) => {
  res.header("Cross-Origin-Opener-Policy", "unsafe-none");
  res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

/* ───────────────────────────────
   BODY PARSER
─────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ───────────────────────────────
   SESSION
─────────────────────────────── */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

/* ───────────────────────────────
   PASSPORT
─────────────────────────────── */
initPassport();
app.use(passport.initialize());
app.use(passport.session());

/* ───────────────────────────────
   STATIC FILES
─────────────────────────────── */
app.use(express.static(path.resolve(__dirname, "../public")));

/* ───────────────────────────────
   LOGGING
─────────────────────────────── */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/* ───────────────────────────────
   HEALTH CHECK
─────────────────────────────── */
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

/* ───────────────────────────────
   ROUTES
─────────────────────────────── */
import authRouter from "./route/auth.route.js";
import clientRouter from "./route/client.route.js";
import invoiceRouter from "./route/invoice.route.js";
import paymentRouter from "./route/payment.route.js";
import stripeRouter from "./route/stripe.route.js";
console.log("📍 Mounting routes...");

app.use("/api/auth", authRouter);
app.use("/api/clients", clientRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/payments", paymentRouter);

/* ───────────────────────────────
   404
─────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

/* ───────────────────────────────
   ERROR HANDLER
─────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Server error",
  });
});

export { app };
