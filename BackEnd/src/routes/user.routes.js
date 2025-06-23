import express from "express";
import {
  registerAdmin,
  loginUser,
  loginCustomer,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);
router.post("/login-customer", loginCustomer);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentUserPassword);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
