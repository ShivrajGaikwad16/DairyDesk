import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AddMilkEntry = () => {
   const { t } = useTranslation();

   const getCurrentSession = () => {
      const hour = new Date().getHours();
      return hour < 12 ? "morning" : "evening";
   };

   const getTodayDate = () => {
      const today = new Date();
      return today.toISOString().split("T")[0];
   };

   const [form, setForm] = useState({
      customerId: "",
      date: getTodayDate(),
      session: getCurrentSession(),
      liters: "",
      fat: "",
   });

   const [customers, setCustomers] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [showSuggestions, setShowSuggestions] = useState(false);
   const token = localStorage.getItem("token");

   useEffect(() => {
      axios
         .get("https://dairy-desk.vercel.app/api/v1/customers/", {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         })
         .then((res) => setCustomers(res.data.data))
         .catch((err) => console.error("Failed to load customers", err));
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await axios.post("https://dairy-desk.vercel.app/api/v1/milkentry", form, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         alert("Milk entry added successfully");

         setForm({
            customerId: "",
            date: getTodayDate(),
            session: getCurrentSession(),
            liters: "",
            fat: "",
         });
         setSearchTerm("");
         setShowSuggestions(false);
      } catch (err) {
         alert("Failed to add milk entry");
         console.error(err);
      }
   };

   const filteredCustomers = customers.filter((cust) =>
      `${cust.fullName} ${cust.mobile}`
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
   );

   const handleSelectFromDropdown = (e) => {
      const selectedId = e.target.value;
      const selectedCustomer = customers.find((c) => c._id === selectedId);
      if (selectedCustomer) {
         setForm({ ...form, customerId: selectedCustomer._id });
         setSearchTerm(
            `${selectedCustomer.fullName} - ${selectedCustomer.mobile}`
         );
         setShowSuggestions(false);
      }
   };

   return (
      <div className="bg-green-50 min-h-screen flex items-center justify-center px-4 py-10">
         <div className="bg-white shadow-md rounded-lg w-full max-w-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-800">
               {t("add_milk_entry") || "Add Milk Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
               {/* 🔍 Search OR Dropdown */}
               <div className="relative">
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("select_customer") || "Select Customer"}
                  </label>

                  {/* Text Search */}
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setForm({ ...form, customerId: "" });
                        setShowSuggestions(true);
                     }}
                     placeholder={
                        t("searchPlaceholder") || "Search by name or mobile..."
                     }
                     className="w-full border p-2 rounded mb-2"
                  />
                  {showSuggestions &&
                     searchTerm &&
                     filteredCustomers.length > 0 &&
                     !form.customerId && (
                        <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto shadow mt-1">
                           {filteredCustomers.map((cust) => (
                              <li
                                 key={cust._id}
                                 className="p-2 hover:bg-green-100 cursor-pointer"
                                 onClick={() => {
                                    setForm({ ...form, customerId: cust._id });
                                    setSearchTerm(
                                       `${cust.fullName} - ${cust.mobile}`
                                    );
                                    setShowSuggestions(false);
                                 }}
                              >
                                 {cust.fullName} - {cust.mobile}
                              </li>
                           ))}
                        </ul>
                     )}

                  {/* Dropdown Selection */}
                  <select
                     value={form.customerId}
                     onChange={handleSelectFromDropdown}
                     className="w-full border border-gray-300 p-2 rounded"
                  >
                     <option value="">{t("select_customer")}</option>
                     {customers.map((cust) => (
                        <option key={cust._id} value={cust._id}>
                           {cust.fullName} - {cust.mobile}
                        </option>
                     ))}
                  </select>
               </div>

               {/* 📅 Date Picker */}
               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("date") || "Date"}
                  </label>
                  <input
                     type="date"
                     name="date"
                     value={form.date}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                     required
                  />
               </div>

               {/* 🌞🌙 Session Dropdown */}
               <div>
                  <label className="block mb-1 font-medium text-gray-700">
                     {t("session") || "Session"}
                  </label>
                  <select
                     name="session"
                     value={form.session}
                     onChange={handleChange}
                     className="w-full border border-gray-300 p-2 rounded"
                     required
                  >
                     <option value="morning">
                        {t("morning") || "Morning"}
                     </option>
                     <option value="evening">
                        {t("evening") || "Evening"}
                     </option>
                  </select>
               </div>

               {/* 📥 Liters & Fat */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block mb-1 font-medium text-gray-700">
                        {t("liters") || "Liters"}
                     </label>
                     <input
                        type="number"
                        name="liters"
                        value={form.liters}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., 5"
                        required
                     />
                  </div>

                  <div>
                     <label className="block mb-1 font-medium text-gray-700">
                        {t("fat_percentage") || "Fat %"}
                     </label>
                     <input
                        type="number"
                        step="0.1"
                        name="fat"
                        value={form.fat}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., 4.5"
                        required
                     />
                  </div>
               </div>

               {/* ✅ Submit Button */}
               <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
               >
                  {t("submit") || "Submit"}
               </button>
            </form>
         </div>
      </div>
   );
};

export default AddMilkEntry;
