import React from "react";
import { useTranslation } from "react-i18next";

const FeatureCard = ({ title, desc }) => (
   <div className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
   </div>
);

const FeaturesSection = () => {
   const { t } = useTranslation();

   const features = [
      {
         title: t("feature_1_title"),
         desc: t("feature_1_desc"),
      },
      {
         title: t("feature_2_title"),
         desc: t("feature_2_desc"),
      },
      {
         title: t("feature_3_title"),
         desc: t("feature_3_desc"),
      },
   ];

   return (
      <section className="py-12 px-4 max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
         {features.map((f, i) => (
            <FeatureCard key={i} title={f.title} desc={f.desc} />
         ))}
      </section>
   );
};

export default FeaturesSection;
