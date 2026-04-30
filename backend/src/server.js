import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.routes.js";
import serviceRouter from "./modules/services/service.routes.js";
import expertRouter from "./modules/experts/expert.routes.js";
import offerRouter from "./modules/offers/offer.routes.js";
import slotRouter from "./modules/slots/slot.routes.js";
import appointmentRouter from "./modules/appointments/appointment.routes.js";
import shopsRouter from "./modules/shops/shop.routes.js";
import customerRouter from "./modules/customers/customer.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

const allowedOrigins =
  process.env.NODE_ENV === "production" && process.env.FRONTEND_URL_PROD
    ? [process.env.FRONTEND_URL_PROD]
    : true; // allow all origins in development

// Middlewares
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));

console.log("allowedOrigins",allowedOrigins);



// Respond to all pre-flight OPTIONS requests
// app.options("/*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/expert", expertRouter);
app.use("/api/v1/offers", offerRouter);
app.use("/api/v1/slots", slotRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/shops", shopsRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRouter);

app.get("/health", (req, res) => {
  res.send("Nodejs server is running....");
});

app.listen(port, () => {
  console.log(`Server is running at the port ${port}`);
});
