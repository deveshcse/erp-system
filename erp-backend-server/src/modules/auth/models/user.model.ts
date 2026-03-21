import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, type Role } from "@/constants/index.js";
import { env } from "@/config/env.js";

// ---------------------------------------------------------------------------
// Interface — the shape of a User document.
// ---------------------------------------------------------------------------
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  // CompanyAdmin and Employee belong to a company; SuperAdmin does not.
  companyId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance method — password comparison
  comparePassword(candidate: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Instance methods interface — passed as the third generic to Schema so
// Mongoose 9 correctly types the methods object and avoids the SaveOptions
// collision that occurs with methods["key"] indexed assignment.
// ---------------------------------------------------------------------------
interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

// ---------------------------------------------------------------------------
// Schema — typed with the methods generic
// ---------------------------------------------------------------------------
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      // Never return password in queries by default.
      // Callers must .select("+password") when they need it.
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>)["password"];
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>)["password"];
        return ret;
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// userSchema.index({ email: 1 }, { unique: true }); // Removed to avoid duplicate index warning
userSchema.index({ companyId: 1, role: 1 });
userSchema.index({ companyId: 1, isActive: 1 });

// ---------------------------------------------------------------------------
// Pre-save hook — hash password whenever it is modified.
// Regular function (not arrow) so Mongoose binds `this` as the document.
// ---------------------------------------------------------------------------
userSchema.pre("save", async function () {
  // Mongoose 9: pre("save") callback takes no next() — it is async-native.
  if (!this.isModified("password")) return;

  // Cast to access the select:false password field safely.
  const doc = this as unknown as { password: string };
  doc.password = await bcrypt.hash(doc.password, env.BCRYPT_SALT_ROUNDS);
});

// ---------------------------------------------------------------------------
// Instance method — comparePassword
// Declared via userSchema.methods (the typed methods object from the generic)
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (
  this: IUser & { password: string },
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const User = mongoose.model<IUser, UserModel>("User", userSchema);
