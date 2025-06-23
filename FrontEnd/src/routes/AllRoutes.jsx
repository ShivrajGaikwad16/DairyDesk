import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LandingPage from "../pages/LandingPage";
import AddMilkEntry from "../pages/AddMilkEntry";
import AdminLogin from "../pages/AdminLogin";
import AddCustomer from "../pages/AddCustomer";
import CustomerDashboard from "../pages/CustomerDashbord";
import CustomerLogin from "../pages/CustomerLogin";
import AdminDashboard from "../pages/AdminDashbord";
import ManageCustomer from "../pages/ManageCustomer";
import ManageMilkEntry from "../pages/ManageMilkEntry";
import ProtectedRoute from "../components/ProtectedRoute";
const AllRoutes = () => {
   return (
      <Routes>
         {/* Public Routes */}
         <Route path="/admin/login" element={<AdminLogin />} />
         <Route path="/customer/login" element={<CustomerLogin />} />

         {/* Shared Layout */}
         <Route element={<Layout />}>
            {/* Home (Public) */}
            <Route path="/" element={<LandingPage />} />

            {/* 🛡️ Admin Routes */}
            <Route
               path="/add-entry"
               element={
                  <ProtectedRoute allowedRole="admin">
                     <AddMilkEntry />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/add-customer"
               element={
                  <ProtectedRoute allowedRole="admin">
                     <AddCustomer />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/admin-dashboard"
               element={
                  <ProtectedRoute allowedRole="admin">
                     <AdminDashboard />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/manage-customer"
               element={
                  <ProtectedRoute allowedRole="admin">
                     <ManageCustomer />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/manage-milk-entry"
               element={
                  <ProtectedRoute allowedRole="admin">
                     <ManageMilkEntry />
                  </ProtectedRoute>
               }
            />

            {/* 🛡️ Customer Route */}
            <Route
               path="/customer-dashboard"
               element={
                  <ProtectedRoute allowedRole="customer">
                     <CustomerDashboard />
                  </ProtectedRoute>
               }
            />
         </Route>
      </Routes>
   );
};

export default AllRoutes;
