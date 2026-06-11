import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/RRHApp.tsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;