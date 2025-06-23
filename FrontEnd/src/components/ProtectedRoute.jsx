import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
   const token = localStorage.getItem("token");
   const user = JSON.parse(localStorage.getItem("user") || "{}");

   if (!token || !user.role) {
      return <Navigate to="/" replace />;
   }

   if (user.role !== allowedRole) {
      return <Navigate to="/" replace />;
   }

   return children;
};

export default ProtectedRoute;
