import mongoose, { Schema, Document } from "mongoose";

export interface ISuggestion extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  category: "feature" | "improvement" | "bug" | "other";
  suggestion: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  adminNotes?: string;
  completedAt?: Date;
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["feature", "improvement", "bug", "other"],
      default: "other",
      required: true,
    },
    suggestion: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "rejected"],
      default: "pending",
      required: true,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    completedAt: {
      type: Date,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SuggestionSchema.index({ userId: 1, createdAt: -1 });
SuggestionSchema.index({ status: 1, createdAt: -1 });
SuggestionSchema.index({ category: 1, status: 1 });

export default mongoose.models.Suggestion ||
  mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

