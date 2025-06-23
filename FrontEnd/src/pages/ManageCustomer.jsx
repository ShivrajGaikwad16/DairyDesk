import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ManageCustomer = () => {
   const [customers, setCustomers] = useState([]);
   const [filteredCustomers, setFilteredCustomers] = useState([]);
   const [search, setSearch] = useState("");
   const [editingCustomer, setEditingCustomer] = useState(null);
   const [formData, setFormData] = useState({
      fullName: "",
      mobile: "",
      baseFatRate: "",
   });
   const [weeklySummary, setWeeklySummary] = useState(null);
   const [viewingCustomer, setViewingCustomer] = useState(null);
   const [loadingSummary, setLoadingSummary] = useState(false);
   const [summaryError, setSummaryError] = useState("");

   const token = localStorage.getItem("token");
   const { t } = useTranslation();

   useEffect(() => {
      fetchCustomers();
   }, []);

   const fetchCustomers = async () => {
      try {
         const res = await axios.get("https://dairy-desk.vercel.app/api/v1/customers", {
            headers: { Authorization: `Bearer ${token}` },
         });
         setCustomers(res.data.data || []);
         setFilteredCustomers(res.data.data || []);
      } catch (error) {
         console.error("Failed to fetch customers", error);
      }
   };

   const handleSearch = (e) => {
      const keyword = e.target.value.toLowerCase();
      setSearch(keyword);
      const filtered = customers.filter((c) =>
         `${c.fullName} ${c.mobile}`.toLowerCase().includes(keyword)
      );
      setFilteredCustomers(filtered);
   };

   const openEditModal = (customer) => {
      setEditingCustomer(customer);
      setFormData({
         fullName: customer.fullName,
         mobile: customer.mobile,
         baseFatRate: customer.baseFatRate || "",
      });
   };

   const handleEditChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const saveChanges = async () => {
      try {
         await axios.put(
            `https://dairy-desk.vercel.app/api/v1/customers/${editingCustomer._id}`,
            { ...formData, baseFatRate: parseFloat(formData.baseFatRate) },
            { headers: { Authorization: `Bearer ${token}` } }
         );
         setEditingCustomer(null);
         fetchCustomers();
      } catch {
         alert(t("updateFailed"));
      }
   };

   const deleteCustomer = async (id) => {
      if (window.confirm(t("confirmDelete"))) {
         try {
            await axios.delete(`https://dairy-desk.vercel.app/api/v1/customers/${id}`, {
               headers: { Authorization: `Bearer ${token}` },
            });
            fetchCustomers();
         } catch {
            alert(t("deleteFailed"));
         }
      }
   };

   const fetchWeeklySummary = async (customerId, name) => {
      setWeeklySummary(null);
      setSummaryError("");
      setLoadingSummary(true);
      try {
         const res = await axios.get(
            `https://dairy-desk.vercel.app/api/v1/milkentry/summary/weekly?customerId=${customerId}`,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         setViewingCustomer(name);
         setWeeklySummary(res.data.data);
      } catch {
         setSummaryError(t("summaryFetchFailed"));
      } finally {
         setLoadingSummary(false);
      }
   };

   return (
      <div className="p-4 bg-gray-50 min-h-screen">
         <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
            {t("manageCustomers")}
         </h1>

         {/* Search Input */}
         <div className="w-full max-w-xl mx-auto mb-6">
            <input
               list="customerOptions"
               value={search}
               onChange={handleSearch}
               placeholder={t("searchPlaceholder")}
               className="w-full p-2 border rounded shadow-sm"
            />
            <datalist id="customerOptions">
               {customers.map((c) => (
                  <option key={c._id} value={`${c.fullName} - ${c.mobile}`} />
               ))}
            </datalist>
         </div>

         {/* Customer Table */}
         <div className="relative overflow-x-auto bg-white rounded shadow">
            <table className="w-full min-w-[640px] text-sm text-left text-gray-700">
               <thead className="text-xs text-green-700 bg-green-100 uppercase">
                  <tr>
                     <th className="px-6 py-3">{t("fullName")}</th>
                     <th className="px-6 py-3">{t("phone")}</th>
                     <th className="px-6 py-3">{t("baseFatRate")}</th>
                     <th className="px-6 py-3 text-center">{t("actions")}</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCustomers.map((c) => (
                     <tr key={c._id} className="border-b hover:bg-green-50">
                        <td
                           onClick={() => fetchWeeklySummary(c._id, c.fullName)}
                           className="px-6 py-4 text-green-800 font-medium cursor-pointer hover:underline"
                        >
                           {c.fullName}
                        </td>
                        <td className="px-6 py-4">{c.mobile}</td>
                        <td className="px-6 py-4">
                           ₹{c.baseFatRate?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                           <button
                              onClick={() => openEditModal(c)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded"
                           >
                              {t("edit")}
                           </button>
                           <button
                              onClick={() => deleteCustomer(c._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded"
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
         {editingCustomer && (
            <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
               <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md">
                  <h2 className="text-xl font-bold text-green-700 mb-4">
                     {t("editCustomer")}
                  </h2>
                  <input
                     name="fullName"
                     value={formData.fullName}
                     onChange={handleEditChange}
                     className="w-full border mb-3 px-3 py-2 rounded"
                     placeholder={t("fullName")}
                  />
                  <input
                     name="mobile"
                     value={formData.mobile}
                     onChange={handleEditChange}
                     className="w-full border mb-3 px-3 py-2 rounded"
                     placeholder={t("phone")}
                  />
                  <input
                     name="baseFatRate"
                     value={formData.baseFatRate}
                     onChange={handleEditChange}
                     type="number"
                     step="0.01"
                     className="w-full border mb-4 px-3 py-2 rounded"
                     placeholder={t("baseFatRate")}
                  />
                  <div className="flex justify-end gap-2">
                     <button
                        onClick={() => setEditingCustomer(null)}
                        className="bg-gray-300 px-4 py-2 rounded"
                     >
                        {t("cancel")}
                     </button>
                     <button
                        onClick={saveChanges}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                     >
                        {t("save")}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Weekly Summary Modal */}
         {viewingCustomer && (
            <div className="fixed inset-0 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
               <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg">
                  <h2 className="text-xl font-bold text-green-700 mb-4">
                     {t("weeklySummary")} - {viewingCustomer}
                  </h2>
                  {loadingSummary ? (
                     <p>{t("loading")}</p>
                  ) : summaryError ? (
                     <p className="text-red-600">{summaryError}</p>
                  ) : weeklySummary?.daily?.length ? (
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                           <thead className="bg-gray-100 text-left">
                              <tr>
                                 <th className="p-2">{t("date")}</th>
                                 <th className="p-2">{t("session")}</th>
                                 <th className="p-2">{t("liters")}</th>
                                 <th className="p-2">{t("fat")}</th>
                                 <th className="p-2">{t("amount")}</th>
                              </tr>
                           </thead>
                           <tbody>
                              {weeklySummary.daily.flatMap((day) =>
                                 day.entries.map((e, idx) => (
                                    <tr key={idx} className="border-t">
                                       <td className="p-2">{day._id.day}</td>
                                       <td className="p-2 capitalize">
                                          {t(e.session)}
                                       </td>
                                       <td className="p-2">{e.liters}</td>
                                       <td className="p-2">{e.fat}</td>
                                       <td className="p-2">
                                          ₹{e.amount.toFixed(2)}
                                       </td>
                                    </tr>
                                 ))
                              )}
                              <tr className="bg-gray-100 font-semibold">
                                 <td colSpan="4" className="p-2 text-right">
                                    {t("total")}
                                 </td>
                                 <td className="p-2">
                                    ₹
                                    {weeklySummary.weeklyTotal?.amount?.toFixed(
                                       2
                                    ) || "0.00"}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  ) : (
                     <p>{t("noData")}</p>
                  )}
                  <div className="flex justify-end mt-4">
                     <button
                        onClick={() => {
                           setWeeklySummary(null);
                           setViewingCustomer(null);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                     >
                        {t("close")}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ManageCustomer;
