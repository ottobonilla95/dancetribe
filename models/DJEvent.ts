import mongoose, { Schema, models } from "mongoose";

const DJEventSchema = new Schema(
  {
    djId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    venue: {
      type: String,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      maxlength: 100,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
    },
    genres: {
      type: [String],
      default: [],
    },
    // Statistics
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
DJEventSchema.index({ djId: 1, eventDate: -1 });
DJEventSchema.index({ eventDate: -1 });

const DJEvent = models.DJEvent || mongoose.model("DJEvent", DJEventSchema);

export default DJEvent;

