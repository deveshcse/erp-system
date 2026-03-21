import mongoose, { Schema, type Document, type Model } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  address: string;
  contactNumber: string;
  gstNumber: string | null;
  // The user who manages this company (role: CompanyAdmin).
  adminId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [200, "Company name must not exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
      maxlength: [500, "Address must not exceed 500 characters"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, "Please provide a valid contact number"],
    },
    gstNumber: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please provide a valid GST number",
      ],
      sparse: true, // Allow multiple null values in the unique-like field.
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
companySchema.index({ email: 1 }, { unique: true });
companySchema.index({ isActive: 1 });
companySchema.index({ name: "text" }); // For text search

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  companySchema
);
