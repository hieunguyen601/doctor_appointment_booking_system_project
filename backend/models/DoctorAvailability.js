import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

availabilitySchema.index({ doctor: 1, dayOfWeek: 1 }, { unique: true });

const DoctorAvailability = mongoose.model(
  "DoctorAvailability",
  availabilitySchema,
);

export default DoctorAvailability;
