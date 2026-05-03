import { useState } from "react";
import { apiService } from "../services/api";
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
import { Navbar } from "../components/shared";

import "../shared.css";

const NO_NAV_PAGES: Page[] = ["dashboard", "forgot", "verify"];

export default function RRHApp() {
  const [page, setPage] = useState<Page>(apiService.isAuthenticated() ? "dashboard" : "landing");

  const showNav = !NO_NAV_PAGES.includes(page);

  return (
    <div>
      {showNav && <Navbar setPage={setPage} cur={page} />}

      {page === "landing"  && <LandingPage        setPage={setPage} />}
      {page === "login"    && <LoginPage           setPage={setPage} />}
      {page === "register" && <RegisterPage        setPage={setPage} />}
      {page === "forgot"   && <ForgotPasswordPage  setPage={setPage} />}
      {page === "verify"   && <VerifyPage          setPage={setPage} />}
      {page === "help"     && <HelpPage            setPage={setPage} />}
      {page === "about"    && <AboutPage           setPage={setPage} />}
      {page === "dashboard"&& <Dashboard           setPage={setPage} />}
    </div>
  );
}
