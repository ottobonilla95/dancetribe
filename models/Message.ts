import mongoose, { Schema, models } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderImage: {
      type: String,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
// Critical index for unread message queries (used in polling)
MessageSchema.index({ conversationId: 1, senderId: 1, isRead: 1 });

const Message = models.Message || mongoose.model("Message", MessageSchema);

export default Message;

