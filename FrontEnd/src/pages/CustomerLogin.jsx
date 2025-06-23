import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const CustomerLogin = () => {
   const { t } = useTranslation();
   const [mobile, setMobile] = useState("");
   const [error, setError] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      try {
         const res = await axios.post(
            "http://localhost:3000/api/v1/users/login-customer",
            {
               mobile,
            }
         );

         const { accessToken, user } = res.data.data;

         // Store full user object and token
         localStorage.setItem("token", accessToken);
         localStorage.setItem("user", JSON.stringify(user));
         localStorage.setItem("customerId", user._id); // Store ID if needed separately

         // Redirect to customer dashboard
         window.location.href = "/customer-dashboard";
      } catch (err) {
         console.error("Login failed", err);
         setError("Login failed. Please check your credentials.");
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
         <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
         >
            <h2 className="text-2xl font-semibold text-green-700 text-center mb-6">
               {t("customer_login") || "Customer Login"}
            </h2>

            {error && (
               <div className="mb-4 text-red-600 text-sm text-center">
                  {error}
               </div>
            )}

            <input
               type="number"
               placeholder={t("mobile_number")}
               className="w-full border border-gray-300 px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
               value={mobile}
               onChange={(e) => setMobile(e.target.value)}
               required
            />
            <button
               type="submit"
               className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
               {t("login")}
            </button>
         </form>
      </div>
   );
};

export default CustomerLogin;
