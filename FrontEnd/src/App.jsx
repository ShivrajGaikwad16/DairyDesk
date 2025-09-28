// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
   return (
      <BrowserRouter>
         <AllRoutes />
         <SpeedInsights/>
      </BrowserRouter>
   );
}

export default App;
