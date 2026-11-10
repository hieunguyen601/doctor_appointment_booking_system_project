import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./db.js";
import Doctor from "./models/Doctor.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import router from "./routes/appointmentRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/appointments", router);

app.post("/api/doctors", async (req, res) => {
  try {
    const { name, specialization, experience } = req.body;

    const doctor = await Doctor.create({
      name,
      specialization,
      experience,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

const startServer = async () => {
  try {
    await connectDB();

    await DoctorAvailability.init();
    console.log("Doctor availability indexes ready");

    app.listen(port, () => {
      console.log("Server is running on port", port);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
