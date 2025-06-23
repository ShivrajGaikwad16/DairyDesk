import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
   const { i18n } = useTranslation();

   const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      localStorage.setItem("lng", lng);
   };

   return (
      <div className="absolute top-4 right-4">
         <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="border p-2 rounded text-sm"
         >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
         </select>
      </div>
   );
};

export default LanguageSwitcher;
