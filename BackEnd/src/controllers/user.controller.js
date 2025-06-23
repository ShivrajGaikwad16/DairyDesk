import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// 🔐 Utility to generate tokens
const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// 📌 Admin Registration
const registerAdmin = AsyncHandler(async (req, res) => {
  const { secret, username, fullName, password } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    throw new ApiError(403, "Invalid Admin Secret");
  }

  if (!username || !fullName || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const exists = await User.findOne({ username });
  if (exists) throw new ApiError(409, "Username already exists");

  const user = await User.create({
    role: "admin",
    username: username.toLowerCase(),
    fullName,
    password,
  });

  const result = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(201)
    .json(new ApiResponse(201, result, "Admin Registered Successfully"));
});

// 🧑‍💼 Owner/Admin Login
const loginUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    throw new ApiError(400, "Username and Password are required");

  const user = await User.findOne({ username });
  if (!user || user.role === "customer") {
    throw new ApiError(401, "Invalid Credentials");
  }

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid Credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const responseUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        { user: responseUser, accessToken },
        "Login Successful"
      )
    );
});

// 📱 Customer Login via Mobile Number
const loginCustomer = AsyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) throw new ApiError(400, "Mobile number is required");

  const user = await User.findOne({ mobile, role: "customer" });
  if (!user) throw new ApiError(404, "Customer not found");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const result = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        { user: result, accessToken },
        "Customer Login Successful"
      )
    );
});

// 🔁 Refresh Access Token
const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Refresh Token required");

  const user = await User.findOne({ refreshToken: incomingToken });
  if (!user) throw new ApiError(403, "Invalid Refresh Token");

  jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || decoded.id !== user._id.toString()) {
        throw new ApiError(403, "Token verification failed");
      }

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(200, { accessToken }, "Access Token Refreshed"));
    }
  );
});

// 🚪 Logout
const logoutUser = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, {
    $unset: { refreshToken: 1 },
  });

  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "Logout Successful"));
});

// 🔐 Change Password (Owner/Admin)
const changeCurrentUserPassword = AsyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    throw new ApiError(400, "All fields are required");
  if (currentPassword === newPassword)
    throw new ApiError(400, "Passwords must differ");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

// 👤 Get Current User
const getCurrentUser = AsyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "User retrieved"));
});

export {
  registerAdmin,
  loginUser,
  loginCustomer,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
};
