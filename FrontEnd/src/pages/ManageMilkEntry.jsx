import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ManageMilkEntry = () => {
   const [entries, setEntries] = useState([]);
   const [filteredEntries, setFilteredEntries] = useState([]);
   const [search, setSearch] = useState("");
   const [sessionFilter, setSessionFilter] = useState("");
   const today = new Date().toISOString().split("T")[0];
   const [date, setDate] = useState(today);
   const [editingEntry, setEditingEntry] = useState(null);
   const [formData, setFormData] = useState({
      liters: "",
      fat: "",
      session: "",
   });

   const token = localStorage.getItem("token");
   const { t } = useTranslation();

   useEffect(() => {
      if (date) fetchEntriesByDate(date);
   }, [date]);

   const fetchEntriesByDate = async (selectedDate) => {
      try {
         const res = await axios.get(
            `https://dairy-desk.vercel.app/api/v1/milkentry?date=${selectedDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         setEntries(res.data.data);
         applyFilters(res.data.data, search, sessionFilter);
      } catch (err) {
         console.error(t("fetchFailed"), err);
      }
   };

   const applyFilters = (data, nameSearch, sessionVal) => {
      const filtered = data.filter((entry) => {
         const matchesName = entry.customerId?.fullName
            ?.toLowerCase()
            .includes(nameSearch.toLowerCase());
         const matchesSession = sessionVal
            ? entry.session === sessionVal
            : true;
         return matchesName && matchesSession;
      });
      setFilteredEntries(filtered);
   };

   const handleSearch = (e) => {
      const val = e.target.value;
      setSearch(val);
      applyFilters(entries, val, sessionFilter);
   };

   const handleSessionFilter = (e) => {
      const val = e.target.value;
      setSessionFilter(val);
      applyFilters(entries, search, val);
   };

   const openEditModal = (entry) => {
      setEditingEntry(entry);
      setFormData({
         liters: entry.liters,
         fat: entry.fat,
         session: entry.session,
      });
   };

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const saveChanges = async () => {
      try {
         await axios.put(
            `https://dairy-desk.vercel.app/api/v1/milkentry/${editingEntry._id}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         setEditingEntry(null);
         fetchEntriesByDate(date);
      } catch {
         alert(t("updateFailed"));
      }
   };

   const deleteEntry = async (id) => {
      if (window.confirm(t("confirmDelete"))) {
         try {
            await axios.delete(`https://dairy-desk.vercel.app/api/v1/milkentry/${id}`, {
               headers: { Authorization: `Bearer ${token}` },
            });
            fetchEntriesByDate(date);
         } catch {
            alert(t("deleteFailed"));
         }
      }
   };

   return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
         <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-6">
            {t("manageMilkEntries")}
         </h1>

         {/* Filters */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
               type="date"
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="border p-2 rounded w-full focus:ring-2 focus:ring-green-400"
            />
            <input
               type="text"
               value={search}
               onChange={handleSearch}
               placeholder={t("searchByCustomer")}
               className="border p-2 rounded w-full focus:ring-2 focus:ring-green-400"
            />
            <select
               value={sessionFilter}
               onChange={handleSessionFilter}
               className="border p-2 rounded w-full focus:ring-2 focus:ring-green-400"
            >
               <option value="">{t("allSessions")}</option>
               <option value="morning">{t("morning")}</option>
               <option value="evening">{t("evening")}</option>
            </select>
         </div>

         {/* Table */}
         <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm text-gray-700">
               <thead className="bg-green-100 text-green-700 text-left">
                  <tr>
                     <th className="p-3">{t("date")}</th>
                     <th className="p-3">{t("customer")}</th>
                     <th className="p-3">{t("session")}</th>
                     <th className="p-3">{t("liters")}</th>
                     <th className="p-3">{t("fat")}</th>
                     <th className="p-3">{t("amount")}</th>
                     <th className="p-3 text-center">{t("actions")}</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredEntries.map((e, i) => (
                     <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                           {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="p-3">{e.customerId?.fullName}</td>
                        <td className="p-3 capitalize">{t(e.session)}</td>
                        <td className="p-3">{e.liters}</td>
                        <td className="p-3">{e.fat}</td>
                        <td className="p-3">₹{e.amount.toFixed(2)}</td>
                        <td className="p-3 text-center space-x-2 ">
                           <button
                              onClick={() => openEditModal(e)}
                              className="bg-yellow-500 px-3 py-1 rounded text-white"
                           >
                              {t("edit")}
                           </button>
                           <button
                              onClick={() => deleteEntry(e._id)}
                              className="bg-red-500 px-3 py-1 rounded text-white mt-1 md:mt-0"
                           >
                              {t("delete")}
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Edit Modal */}
         {editingEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
               <div className="bg-white p-6 rounded shadow-md w-full max-w-md mx-4">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">
                     {t("editMilkEntry")}
                  </h2>

                  <input
                     name="liters"
                     value={formData.liters}
                     onChange={handleChange}
                     className="w-full mb-3 border px-3 py-2 rounded"
                     placeholder={t("liters")}
                     type="number"
                  />
                  <input
                     name="fat"
                     value={formData.fat}
                     onChange={handleChange}
                     className="w-full mb-3 border px-3 py-2 rounded"
                     placeholder={t("fat")}
                     type="number"
                  />
                  <select
                     name="session"
                     value={formData.session}
                     onChange={handleChange}
                     className="w-full mb-4 border px-3 py-2 rounded"
                  >
                     <option value="">{t("selectSession")}</option>
                     <option value="morning">{t("morning")}</option>
                     <option value="evening">{t("evening")}</option>
                  </select>

                  <div className="flex justify-end space-x-2 ">
                     <button
                        onClick={() => setEditingEntry(null)}
                        className="px-4 py-2 bg-gray-300 rounded"
                     >
                        {t("cancel")}
                     </button>
                     <button
                        onClick={saveChanges}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                     >
                        {t("save")}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ManageMilkEntry;
