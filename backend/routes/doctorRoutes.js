import express from "express";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import authMiddleware from "../middleware/authMiddleware.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import requireRole from "../middleware/requireRole.js";
import { DateTime } from "luxon";
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

doctorRoutes.post(
  "/:id/availability",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { dayOfWeek, startTime, endTime } = req.body;

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

      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          message: "Day must be between 0 and 6",
        });
      }

      const timeFormat = /^([01]\d|2[0-3]):(00|30)$/;

      if (
        typeof startTime !== "string" ||
        typeof endTime !== "string" ||
        !timeFormat.test(startTime) ||
        !timeFormat.test(endTime) ||
        startTime >= endTime
      ) {
        return res.status(400).json({
          message: "Invalid working hours",
        });
      }

      const availability = await DoctorAvailability.create({
        doctor: id,
        dayOfWeek,
        startTime,
        endTime,
      });

      return res.status(201).json({
        message: "Doctor availability created successfully!",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Schedule already exists for this day",
        });
      }

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
  },
);

doctorRoutes.get(":/id/slots", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.query;
    const timeZone = "America/Chicago";

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        message: "Invalid doctor ID",
      });
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Date must be YYYY-MM-DD",
      });
    }

    const selectedDate = DateTime.fromISO(date, {
      zone: timeZone,
    });

    if (!selectedDate.isValid || selectedDate.toISODate() !== date) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const dayOfWeek = selectedDate.weekday % 7;

    const schedule = await DoctorAvailability.findOne({
      doctor: id,
      dayOfWeek,
    });

    if (!doctor.available || !schedule) {
      return res.status(200).json({
        date,
        timeZone,
        availableSlots: [],
      });
    }

    const start = DateTime.fromISO(`${date}T${schedule.startTime}`, {
      zone: timeZone,
    });

    const end = DateTime.fromISO(`${date}T${schedule.endTime}`, {
      zone: timeZone,
    });

    if (!start.isValid || !end.isValid || start >= end) {
      return res.status(500).json({
        message: "Invalid doctor schedule",
      });
    }

    const bookings = await Appointment.find({
      doctor: id,
      status: "booked",
      startsAt: {
        $gte: start.toJSDate(),
        $lt: end.toJSDate(),
      },
    }).select("startsAt");

    const bookedTimes = new Set(bookings.map((a) => a.startsAt.getTime()));

    const availableSlots = [];

    for (
      let slot = start;
      slot.plus({ minutes: 30 }) <= end;
      slot = slot.plus({ minutes: 30 })
    ) {
      if (slot.toMillis() > Date.now() && !bookedTimes.has(slot.toMillis())) {
        availableSlots.push({
          time: slot.toFormat("h:mm a"),
          startsAt: slot.toUTC().toISO(),
        });
      }
    }

    return res.status(200).json({
      doctor: doctor.name,
      date,
      timeZone,
      availableSlots,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

export default doctorRoutes;
