import { useState } from "react";
import type { Page } from "../types";

/* Page imports */
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import VerifyPage from "./VerifyPage";
import HelpPage from "./HelpPage";
import AboutPage from "./AboutPage";
import Dashboard from "./dashboard/Dashboard";

import "../shared.css";

/**
 * RRH Router - Route manager for all pages
 * Displays different pages based on the current page state
 */
export default function RRHApp() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div>
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "register" && <RegisterPage setPage={setPage} />}
      {page === "forgot" && <ForgotPasswordPage setPage={setPage} />}
      {page === "verify" && <VerifyPage setPage={setPage} />}
      {page === "help" && <HelpPage setPage={setPage} />}
      {page === "about" && <AboutPage setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </div>
  );
}
