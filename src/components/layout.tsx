import { getSystemInfo } from "zmp-sdk";
import { App } from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "@/pages/index";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";

const Layout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </App>
  );
};
export default Layout;
