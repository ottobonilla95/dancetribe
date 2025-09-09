import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// COUNTRY SCHEMA
const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    continent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Continent",
      required: true,
    },
    totalDancers: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
countrySchema.plugin(toJSON);

export default mongoose.models.Country || mongoose.model("Country", countrySchema);
