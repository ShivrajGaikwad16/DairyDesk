import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "owner", "customer"],
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: function () {
        return this.role !== "customer";
      },
      sparse: true,
    },

    mobile: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "customer";
      },
      unique: function () {
        return this.role === "customer";
      },
      sparse: true,
    },

    password: {
      type: String,
      required: function () {
        return this.role !== "customer"; // Customers login with mobile only
      },
    },

    paymentMode: {
      type: String,
      enum: ["weekly", "monthly"],
      default: "weekly",
    },
    baseFatRate: {
      type: Number,
      required: true,
      default: 1,
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

// Access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
