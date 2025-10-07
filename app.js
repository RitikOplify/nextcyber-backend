import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import Logger from "morgan";
import generatedErrors from "./middlewares/errors.js";
import ErrorHandler from "./utils/errorHandler.js";
import adminRoute from "./routes/adminRoutes.js";
import planRoute from "./routes/planRoute.js";
import authRoute from "./routes/authRoutes.js";
import studentRoute from "./routes/studentRoute.js";
import companyRoute from "./routes/companyRoute.js";
import jobRoute from "./routes/jobRoutes.js";

import fileUpload from "express-fileupload";

const app = express();

configDotenv({ path: "./.env" });

const allowedOrigins = [process.env.ADMIN_URL, process.env.CLIENT_URL];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

app.use(fileUpload());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(Logger("tiny"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "Hello, From Server!" });
});

app.use("/admin", adminRoute);
app.use("/auth", authRoute);
app.use("/student", studentRoute);
app.use("/company", companyRoute);
app.use("/plan", planRoute);
app.use("/job", jobRoute);

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found`, 404));
});

app.use(generatedErrors);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}\nhttp://localhost:${PORT}`);
});
