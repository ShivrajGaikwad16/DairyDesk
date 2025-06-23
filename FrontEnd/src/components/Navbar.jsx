// components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
   const { t, i18n } = useTranslation();
   const [menuOpen, setMenuOpen] = useState(false);
   const [role, setRole] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
         try {
            const user = JSON.parse(storedUser);
            setRole(user.role);
         } catch {
            console.error("Invalid user data");
         }
      }
   }, []);

   const handleLogout = () => {
      localStorage.clear();
      setRole(null);
      navigate("/");
   };

   const handleLanguageChange = (e) => {
      i18n.changeLanguage(e.target.value);
   };

   const renderLinks = () => {
      if (!role) {
         return (
            <>
               <div className="block">
                  <Link
                     to="/admin/login"
                     className="block py-1 text-gray-700 hover:text-green-600"
                  >
                     {t("admin_login")}
                  </Link>
               </div>
               <div className="block">
                  <Link
                     to="/customer/login"
                     className="block py-1 text-gray-700 hover:text-green-600"
                  >
                     {t("customer_login")}
                  </Link>
               </div>
            </>
         );
      }

      if (role === "admin") {
         return (
            <>
               {[
                  {
                     to: "/admin-dashboard",
                     label: t("adminDashboard") || "Dashboard",
                  },
                  { to: "/add-entry", label: t("add_milk_entry") },
                  { to: "/add-customer", label: t("add_customer") },
                  { to: "/manage-customer", label: t("manageCustomers") },
                  { to: "/manage-milk-entry", label: t("manageMilkEntries") },
               ].map((item, idx) => (
                  <div key={idx} className="block">
                     <Link
                        to={item.to}
                        className="block py-1 text-gray-700 hover:text-green-600"
                     >
                        {item.label}
                     </Link>
                  </div>
               ))}
               <div className="block">
                  <button
                     onClick={handleLogout}
                     className="block py-1 text-red-600 hover:text-red-800"
                  >
                     {t("logout") || "Logout"}
                  </button>
               </div>
            </>
         );
      }

      if (role === "customer") {
         return (
            <>
               <div className="block">
                  <Link
                     to="/customer-dashboard"
                     className="block py-1 text-gray-700 hover:text-green-600"
                  >
                     {t("dashboard") || "Dashboard"}
                  </Link>
               </div>
               <div className="block">
                  <button
                     onClick={handleLogout}
                     className="block py-1 text-red-600 hover:text-red-800"
                  >
                     {t("logout") || "Logout"}
                  </button>
               </div>
            </>
         );
      }

      return null;
   };
   

   return (
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-16">
         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-green-600">
               🐄 DairyLedger
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
               {renderLinks()}
               <select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="border p-1 rounded text-sm"
               >
                  <option value="en">EN</option>
                  <option value="mr">मराठी</option>
               </select>
            </div>

            {/* Mobile Menu Button */}
            <button
               className="md:hidden text-gray-600"
               onClick={() => setMenuOpen(!menuOpen)}
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor">
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d={
                        menuOpen
                           ? "M6 18L18 6M6 6l12 12"
                           : "M4 6h16M4 12h16M4 18h16"
                     }
                  />
               </svg>
            </button>
         </div>

         {/* Mobile Dropdown */}
         {menuOpen && (
            <div className="md:hidden bg-white shadow-md px-4 pb-4 space-y-2 transition-all">
               {renderLinks()}
               <select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="w-full border p-1 rounded text-sm"
               >
                  <option value="en">EN</option>
                  <option value="mr">मराठी</option>
               </select>
            </div>
         )}
      </nav>
   );
};

export default Navbar;
