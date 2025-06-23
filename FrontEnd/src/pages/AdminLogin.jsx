import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AdminLogin = () => {
   const { t } = useTranslation();
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const res = await axios.post(
            "http://localhost:3000/api/v1/users/login",
            {
               username,
               password,
            }
         );
         localStorage.setItem("token", res.data.data.accessToken);
         localStorage.setItem("user", JSON.stringify(res.data.data.user));
         localStorage.setItem("role", res.data.data.user.role);
         window.location.href = "/add-entry"; // Redirect after login
      } catch  {
         alert("Login failed. Please check credentials.");
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
         <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
         >
            <h2 className="text-2xl font-semibold text-green-700 text-center mb-6">
               {t("admin_login")}
            </h2>

            <input
               type="text"
               placeholder={t("username")}
               className="w-full border border-gray-300 px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
            />

            <input
               type="password"
               placeholder={t("password")}
               className="w-full border border-gray-300 px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
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

export default AdminLogin;
