import express from "express";
import {
  addMilkEntry,
  getAllMilkEntries,
  getMilkEntryById,
  updateMilkEntry,
  deleteMilkEntry,
  getMilkEntriesByCustomer,
  getWeeklyMilkSummary,
  getAllMilkEntriesAdmin,
  getAllWeeklyPayouts,
} from "../controllers/milkentry.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🚨 Place specific routes before dynamic ones
router.get("/customer-milk-entry", verifyJWT, getMilkEntriesByCustomer);

router.get("/summary/weekly", getWeeklyMilkSummary);
router.get("/entries", verifyJWT, getAllMilkEntries);
router.get("/all-weekly-payouts",verifyJWT,getAllWeeklyPayouts);
router.post("/", verifyJWT, addMilkEntry);
router.get("/", verifyJWT, getAllMilkEntries);
router.get("/:id", verifyJWT, getMilkEntryById);
router.put("/:id", verifyJWT, updateMilkEntry);
router.delete("/:id", verifyJWT, deleteMilkEntry);


export default router;
