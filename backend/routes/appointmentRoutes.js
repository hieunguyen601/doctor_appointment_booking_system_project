import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("patient"), async (req, res) => {
  try {
    const { doctorId, startsAt } = req.body;

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    if (!doctor.available) {
      return res.status(409).json({
        message: "Doctor is not available",
      });
    }

    if (
      typeof startsAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:(00|30):00\.000Z$/.test(startsAt)
    ) {
      return res.status(400).json({
        message: "Use a 30-minute UTC appointment slot",
      });
    }

    const date = new Date(startsAt);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString() !== startsAt ||
      date <= new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or past appointment date",
      });
    }

    const appointment = await Appointment.create({
      patient: req.userId,
      doctor: doctorId,
      startsAt: date,
    });

    return res.status(201).json({
      message: "Appointment booked successfully!",
      data: appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This appointment slot is already booked",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get(
  "/mine",
  authMiddleware,
  requireRole("patient"),
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        patient: req.userId,
      })
        .populate("doctor", "name specialization")
        .sort({ startsAt: 1 });

      res.status(200).json({
        message: "Appointment retrieved successfully!",
        data: appointments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  requireRole("patient"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid appointment ID",
        });
      }

      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: id,
          patient: req.userId,
          status: "booked",
          startsAt: { $gt: new Date() },
        },
        {
          $set: { status: "cancelled" },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!appointment) {
        return res.status(404).json({
          message: "Active future appointment not found",
        });
      }

      res.status(200).json({
        message: "Update the appointment successfully",
        data: appointment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  },
);

export default router;
