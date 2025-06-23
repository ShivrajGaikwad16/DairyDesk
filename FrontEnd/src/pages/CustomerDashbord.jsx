import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

const WEEK_BUTTONS_PER_PAGE = 2;

const CustomerDashboard = () => {
   const [weeklyGrouped, setWeeklyGrouped] = useState({});
   const [selectedWeek, setSelectedWeek] = useState("");
   const [loading, setLoading] = useState(true);
   const [weekPage, setWeekPage] = useState(1);

   const customerId = localStorage.getItem("customerId");
   const token = localStorage.getItem("token");
   const { t } = useTranslation();

   useEffect(() => {
      const fetchData = async () => {
         try {
            const res = await axios.get(
               `https://dairy-desk.vercel.app/api/v1/milkentry/customer-milk-entry?customerId=${customerId}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const grouped = groupByCustomWeek(res.data.data);
            setWeeklyGrouped(grouped);
            const latestWeek = Object.keys(grouped).sort().reverse()[0];
            setSelectedWeek(latestWeek);
         } catch (err) {
            console.error("Error fetching milk entries", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [customerId, token]);

   const getWeekStart = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      const offset = (day + 1) % 7;
      date.setDate(date.getDate() - offset + 1);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split("T")[0];
   };

   const groupByCustomWeek = (entries) => {
      const grouped = {};
      entries.forEach((entry) => {
         const weekKey = getWeekStart(entry.date);
         if (!grouped[weekKey]) grouped[weekKey] = [];
         grouped[weekKey].push(entry);
      });
      return grouped;
   };

   const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
   };

   const formatWeekRange = (weekStartStr) => {
      const start = new Date(weekStartStr);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${formatDate(start)} - ${formatDate(end)}`;
   };

   const exportToPDF = () => {
      const doc = new jsPDF();
      const weekEntries = weeklyGrouped[selectedWeek] || [];

      doc.text(
         `${t("milkSummary")} - ${formatWeekRange(selectedWeek)}`,
         14,
         20
      );

      autoTable(doc, {
         startY: 30,
         head: [[t("date"), t("session"), t("liters"), t("fat"), t("amount")]],
         body: weekEntries.map((e) => [
            new Date(e.date).toLocaleDateString(),
            t(e.session),
            e.liters,
            e.fat,
            `Rs. ${e.amount.toFixed(2)}`,
         ]),
      });

      const total = weekEntries.reduce((sum, e) => sum + e.amount, 0);
      doc.text(
         `${t("total")}: Rs. ${total.toFixed(2)}`,
         14,
         doc.lastAutoTable.finalY + 10
      );

      const base64 = doc.output("datauristring");
      if (window.AndroidInterface) {
         window.AndroidInterface.downloadBase64Pdf(
            base64,
            `milk-summary-${selectedWeek}.pdf`
         );
      } else {
         doc.save(`milk-summary-${selectedWeek}.pdf`);
      }
   };

   const sortedWeeks = Object.keys(weeklyGrouped).sort().reverse();
   const weekPageCount = Math.ceil(sortedWeeks.length / WEEK_BUTTONS_PER_PAGE);
   const paginatedWeeks = sortedWeeks.slice(
      (weekPage - 1) * WEEK_BUTTONS_PER_PAGE,
      weekPage * WEEK_BUTTONS_PER_PAGE
   );

   const weekEntries = weeklyGrouped[selectedWeek] || [];

   return (
      <div className="p-6 bg-green-50 min-h-screen">
         <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">
            {t("weeklyMilkPaymentSummary")}
         </h1>

         {loading ? (
            <p className="text-center text-gray-600">{t("loading")}</p>
         ) : sortedWeeks.length === 0 ? (
            <p className="text-center text-gray-500">{t("noData")}</p>
         ) : (
            <>
               {/* Week Pagination */}
               <div className="flex justify-center items-center gap-2 mb-6 flex-wrap">
                  <button
                     onClick={() => setWeekPage((p) => Math.max(p - 1, 1))}
                     className="px-2 py-1 border rounded disabled:opacity-50"
                     disabled={weekPage === 1}
                  >
                     ◀ {t("prev")}
                  </button>

                  {paginatedWeeks.map((week) => (
                     <button
                        key={week}
                        onClick={() => setSelectedWeek(week)}
                        className={`px-3 py-1 text-sm rounded ${
                           selectedWeek === week
                              ? "bg-green-700 text-white"
                              : "bg-white border"
                        }`}
                     >
                        {formatWeekRange(week)}
                     </button>
                  ))}

                  <button
                     onClick={() =>
                        setWeekPage((p) => Math.min(p + 1, weekPageCount))
                     }
                     className="px-2 py-1 border rounded disabled:opacity-50"
                     disabled={weekPage === weekPageCount}
                  >
                     {t("next")} ▶
                  </button>
               </div>

               {/* Week Table */}
               <div className="bg-white p-4 rounded shadow overflow-x-auto">
                  <div className="flex justify-between items-center mb-2 min-w-[600px]">
                     <h2 className="font-semibold text-lg text-green-700">
                        {t("week")}: {formatWeekRange(selectedWeek)}
                     </h2>
                     <button
                        onClick={exportToPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                     >
                        {t("downloadPdf")}
                     </button>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-sm border-t border-gray-200 min-w-[600px]">
                        <thead>
                           <tr className="bg-gray-100 text-center">
                              <th className="p-2">{t("date")}</th>
                              <th className="p-2">{t("session")}</th>
                              <th className="p-2">{t("liters")}</th>
                              <th className="p-2">{t("fat")}</th>
                              <th className="p-2">{t("amount")}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {weekEntries.map((entry, i) => (
                              <tr key={i} className="border-b text-center">
                                 <td className="p-2">
                                    {new Date(entry.date).toLocaleDateString()}
                                 </td>
                                 <td className="p-2 capitalize">
                                    {t(entry.session)}
                                 </td>
                                 <td className="p-2">{entry.liters}</td>
                                 <td className="p-2">{entry.fat}</td>
                                 <td className="p-2">
                                    Rs. {entry.amount.toFixed(2)}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="text-right mt-4 font-semibold min-w-[600px]">
                     {t("total")} (Rs.):{" "}
                     {weekEntries
                        .reduce((acc, e) => acc + e.amount, 0)
                        .toFixed(2)}
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default CustomerDashboard;
