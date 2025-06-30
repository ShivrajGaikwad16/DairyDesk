import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend,
} from "chart.js";

ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend
);

const AdminDashboard = () => {
   const [users, setUsers] = useState([]);
   const [payouts, setPayouts] = useState([]);
   const [milkEntries, setMilkEntries] = useState([]);
   const [customers, setCustomers] = useState([]);
   const { t } = useTranslation();

   const token = localStorage.getItem("token");

   useEffect(() => {
      const fetchData = async () => {
         try {
            const config = {
               headers: { Authorization: `Bearer ${token}` },
            };

            const [usersRes, payoutsRes, entriesRes, customersRes] =
               await Promise.all([
                  axios.get("https://dairy-desk.vercel.app/api/v1/customers/", config),
                  axios.get(
                     "https://dairy-desk.vercel.app/api/v1/milkentry/all-weekly-payouts",
                     config
                  ),
                  axios.get(
                     "https://dairy-desk.vercel.app/api/v1/milkentry/entries",
                     config
                  ),
                  axios.get("https://dairy-desk.vercel.app/api/v1/customers", config),
               ]);

            setUsers(usersRes.data.data);
            setPayouts(payoutsRes.data.data);
            setMilkEntries(entriesRes.data.data);
            setCustomers(customersRes.data.data);
         } catch (err) {
            console.error(t("fetchError"), err);
         }
      };

      if (token) fetchData();
   }, [token, t]);

   const totalProfit = payouts?.reduce((acc, p) => acc + (p.profit || 0), 0);

   const chartData = {
      labels: payouts?.map((p) => `${p.customerName?.split(" ")[0] || "N/A"}`),
      datasets: [
         {
            label: t("weeklyProfit"),
            data: payouts?.map((p) => p.profit),
            backgroundColor: "rgba(34,197,94,0.6)",
         },
      ],
   };

   const downloadWeeklySalaryPDF = () => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Weekly Salary Report", 70, 15);

      const tableData = payouts.map((p) => [
         p.customerName || "N/A",
         `Rs. ${p.totalAmount?.toFixed(2) || "0.00"}`,
      ]);

      const totalAmount = payouts.reduce(
         (acc, p) => acc + (p.totalAmount || 0),
         0
      );

      tableData.push([
         { content: "Total", styles: { fontStyle: "bold" } },
         {
            content: `Rs. ${totalAmount.toFixed(2)}`,
            styles: { fontStyle: "bold" },
         },
      ]);

      autoTable(doc, {
         startY: 25,
         head: [["Customer Name", "Total Amount"]],
         body: tableData,
      });

      const base64 = doc.output("datauristring");
      if (window.AndroidInterface) {
         window.AndroidInterface.downloadBase64Pdf(
            base64,
            "WeeklySalaryReport.pdf"
         );
      } else {
         doc.save("WeeklySalaryReport.pdf"); // fallback for web
      }

   };

   return (
      <div className="p-6 bg-gray-50 min-h-screen">
         <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
            {t("adminDashboard")}
         </h1>

         <div className="flex justify-end mb-4">
            <button
               onClick={downloadWeeklySalaryPDF}
               className="bg-green-600 text-white px-4 py-2 rounded shadow"
            >
               {t("downloadSalaryPDF")}
            </button>
         </div>

         <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
               {t("profitLossOverview")}
            </h2>
            <Bar data={chartData} />
            <p className="mt-4 text-green-800 font-bold text-right">
               {t("totalProfit")}: ₹{totalProfit?.toFixed(2)}
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard label={t("users")} value={users?.length} />
            <SummaryCard label={t("customers")} value={customers?.length} />
            <SummaryCard label={t("milkEntries")} value={milkEntries?.length} />
            <SummaryCard label={t("weeklyPayouts")} value={payouts?.length} />
         </div>

         <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
               {t("allUsers")}
            </h2>
            <table className="w-full text-sm border">
               <thead className="bg-gray-100">
                  <tr>
                     <th className="p-2 text-left">{t("name")}</th>
                     <th className="p-2 text-left">{t("mobile")}</th>
                     <th className="p-2 text-left">{t("role")}</th>
                  </tr>
               </thead>
               <tbody>
                  {users?.map((user, idx) => (
                     <tr key={idx} className="border-t text-gray-700">
                        <td className="p-2">{user.fullName}</td>
                        <td className="p-2">{user.mobile}</td>
                        <td className="p-2 capitalize">{t(user.role)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

const SummaryCard = ({ label, value }) => (
   <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-green-600">{value}</p>
   </div>
);

export default AdminDashboard;
