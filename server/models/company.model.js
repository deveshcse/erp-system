import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values with unique index
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", companySchema);
