import React from "react";
import { useTranslation } from "react-i18next";
import heroImage from "../assets/Hero-image.jpg";

const HeroSection = () => {
   const { t } = useTranslation();

   return (
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-16 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Left: Text */}
            <div className="md:w-1/2 text-center md:text-left">
               <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800">
                  {t("title")}
               </h1>
               <p className="text-lg md:text-xl text-gray-700 mb-6">
                  {t("subtitle")}
               </p>
               <a
                  href="/admin/login"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
               >
                  {t("get_started")}
               </a>
            </div>

            {/* Right: Image */}
            <div className="md:w-1/2 flex justify-center">
               <img
                  src={heroImage}
                  alt="Milk dairy hero illustration"
                  className="w-full max-w-sm h-auto object-contain"
               />
            </div>
         </div>
      </section>
   );
};

export default HeroSection;
