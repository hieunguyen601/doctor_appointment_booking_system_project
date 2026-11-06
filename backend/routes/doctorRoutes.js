import express from "express";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";

const doctorRoutes = express.Router();

doctorRoutes.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({
      message: "Doctor retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

doctorRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

doctorRoutes.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, experience, available } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const updates = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (specialization !== undefined) {
      updates.specialization = specialization;
    }

    if (experience !== undefined) {
      updates.experience = experience;
    }

    if (available !== undefined) {
      updates.available = available;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      message: "Doctor updated successfully",
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

doctorRoutes.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default doctorRoutes;
