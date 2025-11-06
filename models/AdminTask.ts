import mongoose from "mongoose";

const adminTaskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastRunAt: {
      type: Date,
      required: true,
    },
    lastRunBy: {
      type: String, // Admin email
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminTask || 
  mongoose.model("AdminTask", adminTaskSchema);

