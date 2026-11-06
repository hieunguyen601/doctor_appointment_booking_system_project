import mongoose, { mongo } from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: true,
    },

    startsAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index(
  { doctor: 1, startsAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "booked",
    },
  },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
