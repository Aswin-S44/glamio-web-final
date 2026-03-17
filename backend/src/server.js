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

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

var corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? process.env.FRONTEND_URL_LOCAL
      : process.env.FRONTEND_URL_PROD,
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors(corsOptions));

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

app.get("/health", (req, res) => {
  res.send("Nodejs server is running....");
});

app.listen(port, () => {
  console.log(`Server is running at the port ${port}`);
});
