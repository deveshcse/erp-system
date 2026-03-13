import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const registerUser = async (userData) => {
  const { name, email, password, role, companyId } = userData;

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "EMPLOYEE",
    companyId: role === "SUPER_ADMIN" ? undefined : companyId,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return createdUser;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return { user: loggedInUser, accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1, // removes the field from document
      },
    },
    {
      new: true,
    }
  );
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token has been revoked or already used");
  }

  // Rotate tokens — issue a new access + refresh token pair
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return { user: updatedUser, accessToken, refreshToken };
};
