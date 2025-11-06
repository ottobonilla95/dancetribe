import mongoose from "mongoose";

const releaseSchema = new mongoose.Schema(
  {
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["spotify", "youtube"],
      required: true,
    },
    // Extracted IDs for embedding
    spotifyTrackId: {
      type: String,
    },
    youtubeVideoId: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for querying releases by producer
releaseSchema.index({ producer: 1, createdAt: -1 });

export default mongoose.models.Release || 
  mongoose.model("Release", releaseSchema);

