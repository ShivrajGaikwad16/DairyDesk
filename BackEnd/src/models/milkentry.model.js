import mongoose from "mongoose";

const milkEntrySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    session: {
      type: String,
      enum: ["morning", "evening"],
      required: true,
    },
    liters: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const MilkEntry = mongoose.model("MilkEntry", milkEntrySchema);
