import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

// ➕ Add Customer
const addCustomer = AsyncHandler(async (req, res) => {
  const { fullName, mobile, paymentMode = "weekly",baseFatRate  } = req.body;

  if (!fullName || !mobile || baseFatRate == null) {
    throw new ApiError(400, "Full name, mobile, and baseFatRate are required");
  }

  const exists = await User.findOne({ mobile, role: "customer" });
  if (exists) {
    throw new ApiError(409, "Customer with this mobile number already exists");
  }

  const newCustomer = await User.create({
    role: "customer",
    fullName,
    mobile,
    paymentMode,
    baseFatRate
  });

  res
    .status(201)
    .json(new ApiResponse(201, newCustomer, "Customer added successfully"));
});

// 📋 Get All Customers
const getAllCustomers = AsyncHandler(async (req, res) => {
  const customers = await User.find({ role: "customer" }).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(new ApiResponse(200, customers, "Customers fetched successfully"));
});

// 🔍 Get Single Customer
const getCustomerById = AsyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );

  if (!customer || customer.role !== "customer") {
    throw new ApiError(404, "Customer not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer fetched successfully"));
});

// ✏️ Update Customer
const updateCustomer = AsyncHandler(async (req, res) => {
  const { fullName, mobile, paymentMode, baseFatRate } = req.body;

  const customer = await User.findById(req.params.id);
  if (!customer || customer.role !== "customer") {
    throw new ApiError(404, "Customer not found");
  }

  if (mobile && mobile !== customer.mobile) {
    const mobileExists = await User.findOne({ mobile, role: "customer" });
    if (mobileExists) throw new ApiError(409, "Mobile number already used");
  }

  customer.fullName = fullName || customer.fullName;
  customer.mobile = mobile || customer.mobile;
  customer.paymentMode = paymentMode || customer.paymentMode;
  customer.baseFatRate = baseFatRate ?? customer.baseFatRate; 

  await customer.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer updated successfully"));
});

// ❌ Delete Customer
const deleteCustomer = AsyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer || customer.role !== "customer") {
    throw new ApiError(404, "Customer not found");
  }

  await customer.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Customer deleted successfully"));
});

export {
  addCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
