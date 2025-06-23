import mongoose from "mongoose"; // 👈 add this line first
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MilkEntry } from "../models/milkentry.model.js";
import { User } from "../models/user.model.js";

// 💡 Helper to calculate amount based on liters, fat, and baseRate
const calculateMilkAmount = (liters, fatPercent, baseRate) => {
  return parseFloat((liters * fatPercent * baseRate).toFixed(2));
};
// ➕ Add Milk Entry
const addMilkEntry = AsyncHandler(async (req, res) => {
  const { customerId, date, session, liters, fat } = req.body;

  if (!customerId || !date || !session || liters == null || fat == null) {
    throw new ApiError(400, "All fields are required");
  }

  const customer = await User.findById(customerId);
  if (!customer || customer.role !== "customer") {
    throw new ApiError(404, "Customer not found");
  }

  const baseRate = customer.baseFatRate || 0;

  const amount = calculateMilkAmount(liters, fat, baseRate);

  const entry = await MilkEntry.create({
    customerId,
    date,
    session,
    liters,
    fat,
    amount,
  });

  res
    .status(201)
    .json(new ApiResponse(201, entry, "Milk entry added successfully"));
});

// 📋 Get All Entries (with filters)
// 📋 Get All Entries (supporting only specific date)
const getAllMilkEntries = AsyncHandler(async (req, res) => {
  const { customerId, date } = req.query;

  const filter = {};

  if (customerId) filter.customerId = customerId;

  if (date) {
    const specificDate = new Date(date);
    const nextDate = new Date(specificDate);
    nextDate.setDate(nextDate.getDate() + 1);

    filter.date = {
      $gte: specificDate,
      $lt: nextDate,
    };
  }

  const entries = await MilkEntry.find(filter)
    .populate("customerId", "fullName mobile")
    .sort({ date: -1 });

  res.status(200).json(new ApiResponse(200, entries, "Milk entries fetched"));
});

// 🔍 Get Entry By ID
const getMilkEntryById = AsyncHandler(async (req, res) => {
  const entry = await MilkEntry.findById(req.params.id).populate(
    "customerId",
    "fullName"
  );
  if (!entry) throw new ApiError(404, "Milk entry not found");

  res.status(200).json(new ApiResponse(200, entry, "Milk entry found"));
});

// ✏️ Update Milk Entry
const updateMilkEntry = AsyncHandler(async (req, res) => {
  const { liters, fat } = req.body;

  const entry = await MilkEntry.findById(req.params.id).populate("customerId");
  if (!entry) throw new ApiError(404, "Milk entry not found");

  if (liters != null) entry.liters = liters;
  if (fat != null) entry.fat = fat;

  const baseRate = entry.customerId?.baseFatRate || 0;
  entry.amount = calculateMilkAmount(entry.liters, entry.fat, baseRate);

  await entry.save();

  res.status(200).json(new ApiResponse(200, entry, "Milk entry updated"));
});

// ❌ Delete Entry
const deleteMilkEntry = AsyncHandler(async (req, res) => {
  const entry = await MilkEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, "Milk entry not found");

  await entry.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Milk entry deleted"));
});

const getMilkEntriesByCustomer = AsyncHandler(async (req, res) => {
  const { customerId } = req.query;

  if (!customerId) {
    throw new ApiError(400, "Customer ID is required");
  }

  const entries = await MilkEntry.find({ customerId }).sort({ date: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, entries, "Milk entries fetched successfully"));
});

const getWeeklyMilkSummary = AsyncHandler(async (req, res) => {
  const { customerId, startDate, endDate } = req.query;

  if (!customerId) {
    throw new ApiError(400, "Customer ID is required");
  }

  // Calculate default week range: Saturday (start) to Friday (end)
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate last Saturday
    const daysSinceSaturday = (day + 1) % 7; // E.g., if today is Sunday (0), subtract 1 → Saturday
    start = new Date(today);
    start.setDate(today.getDate() - daysSinceSaturday);
    start.setHours(0, 0, 0, 0);

    // Friday is 6 days after Saturday
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  const result = await MilkEntry.aggregate([
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(customerId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
        },
        totalLiters: { $sum: "$liters" },
        totalFat: { $sum: "$fat" },
        totalAmount: { $sum: "$amount" },
        entries: { $push: "$$ROOT" },
      },
    },
    {
      $sort: { "_id.day": 1 },
    },
  ]);

  const weeklyTotal = result.reduce(
    (acc, cur) => {
      acc.liters += cur.totalLiters;
      acc.fat += cur.totalFat;
      acc.amount += cur.totalAmount;
      return acc;
    },
    { liters: 0, fat: 0, amount: 0 }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { daily: result, weeklyTotal },
        "Weekly milk summary"
      )
    );
});


const getAllMilkEntriesAdmin = AsyncHandler(async (req, res) => {
  const entries = await MilkEntry.find().populate("customerId", "fullName");
  res.status(200).json(new ApiResponse(200, entries, "All milk entries"));
});
const getAllWeeklyPayouts = AsyncHandler(async (req, res) => {
  const today = new Date();

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const currentDay = today.getDay(); // Sunday = 0, Saturday = 6

  // Calculate how many days to subtract to get back to last Saturday
  const diffToSaturday = (currentDay + 1) % 7;

  // Set start date to last Saturday (00:00:00)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - diffToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);

  // Set end date to upcoming Friday (23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const payouts = await MilkEntry.aggregate([
    {
      $match: {
        date: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: "$customerId",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $project: {
        customerName: "$customer.fullName",
        totalAmount: 1,
        weekRange: {
          $concat: [
            { $dateToString: { format: "%Y-%m-%d", date: startOfWeek } },
            " to ",
            { $dateToString: { format: "%Y-%m-%d", date: endOfWeek } },
          ],
        },
        profit: "$totalAmount",
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, payouts, "Weekly payouts calculated"));
});

export {
  addMilkEntry,
  getAllMilkEntries,
  getMilkEntryById,
  updateMilkEntry,
  deleteMilkEntry,
  getMilkEntriesByCustomer,
  getWeeklyMilkSummary,
  getAllMilkEntriesAdmin,
  getAllWeeklyPayouts,
};
