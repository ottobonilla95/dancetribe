import mongoose, { Schema, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Ensure only 2 participants per conversation
ConversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    next(new Error("A conversation must have exactly 2 participants"));
  }
  next();
});

const Conversation =
  models.Conversation || mongoose.model("Conversation", ConversationSchema);

export default Conversation;

