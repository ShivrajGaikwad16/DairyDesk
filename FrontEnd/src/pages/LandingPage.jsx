import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";

const LandingPage = () => {
   return (
      <div className="relative min-h-screen flex flex-col">
         <HeroSection />
         <FeaturesSection />
      </div>
   );
};

export default LandingPage;
