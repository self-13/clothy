require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// Routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const shopWishlistRouter = require("./routes/shop/wishlist-routes");

const app = express();
const PORT = process.env.PORT || 3003;

// ✅ Allowed frontend origins
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [process.env.FRONTEND_URL || "http://localhost:5173"];
console.log("Allowed origins:", allowedOrigins);

// ✅ Middlewares
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());

app.set("trust proxy", 1);

// ✅ Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"], // Added OPTIONS and PATCH
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
      "X-Requested-With",
      "x-user-id",
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// ✅ Handle preflight requests globally
app.options("*", cors());

// ✅ Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // max 20 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// ✅ Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${
      req.headers.origin
    }`
  );
  next();
});

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/shop/wishlist", shopWishlistRouter);

// Health check
app.get("/", (req, res) => res.status(200).send("OK - Server is running"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.message);

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS Error: Origin not allowed",
      allowedOrigins: allowedOrigins,
    });
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Connect to MongoDB
const db_url = process.env.MONGODB_URI;
if (db_url) {
  mongoose
    .connect(db_url)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => console.error("MongoDB connection error:", error));
} else {
  console.error("MONGODB_URI environment variable is not defined.");
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    console.log("Server closed.");
    process.exit(0);
  });
});
