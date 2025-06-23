import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AddCustomer = () => {
   const { t } = useTranslation();

   const [form, setForm] = useState({
      fullName: "",
      mobile: "",
      paymentMode: "weekly", // or "monthly"
      baseFatRate: "", // ✅ NEW FIELD
   });

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const token = localStorage.getItem("token");

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await axios.post(
            "http://localhost:3000/api/v1/customers/",
            {
               ...form,
               baseFatRate: parseFloat(form.baseFatRate), // Ensure it's a number
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );
         alert("Customer added successfully");
         setForm({
            fullName: "",
            mobile: "",
            paymentMode: "weekly",
            baseFatRate: "",
         });
      } catch (err) {
         console.error(err);
         alert("Failed to add customer");
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-10">
         <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-800">
               {t("add_customer") || "Add Customer"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("full_name") || "Full Name"}
                  </label>
                  <input
                     type="text"
                     name="fullName"
                     value={form.fullName}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                     placeholder={t("fullName")}
                     required
                  />
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("mobile_number") || "Mobile Number"}
                  </label>
                  <input
                     type="tel"
                     name="mobile"
                     value={form.mobile}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                     placeholder={t("mobile_number") || "Mobile Number"}
                     required
                  />
               </div>
               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("base_fat_rate") ||
                        "Base Fat Rate (₹ per fat per litre)"}
                  </label>
                  <input
                     type="number"
                     name="baseFatRate"
                     value={form.baseFatRate}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                     placeholder={
                        t("base_fat_rate") ||
                        "Base Fat Rate (₹ per fat per litre)"
                     }
                     required
                     step="0.01"
                     min="0"
                  />
               </div>

               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("payment_mode") || "Payment Mode"}
                  </label>
                  <select
                     name="paymentMode"
                     value={form.paymentMode}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                  >
                     <option value="weekly">{t("weekly") || "Weekly"}</option>
                     <option value="monthly">
                        {t("monthly") || "Monthly"}
                     </option>
                  </select>
               </div>

               <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
               >
                  {t("submit") || "Submit"}
               </button>
            </form>
         </div>
      </div>
   );
};

export default AddCustomer;
