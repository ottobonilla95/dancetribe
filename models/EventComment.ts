import mongoose, { Schema, models } from "mongoose";

const EventCommentSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "DJEvent",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Ensure one comment per user per event
EventCommentSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventComment =
  models.EventComment || mongoose.model("EventComment", EventCommentSchema);

export default EventComment;

