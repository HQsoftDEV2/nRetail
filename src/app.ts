// Reset CSS
import "@/css/reset.scss";
// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

// React core
import React from "react";
import { createRoot } from "react-dom/client";

// Mount the app
import Layout from "@/components/layout";

// MSW: start worker in development before rendering app
async function prepareMocks() {
  if (import.meta.env.MODE === "development") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

// Expose app configuration
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const root = createRoot(document.getElementById("app")!);
prepareMocks()
  .then(() => {
    root.render(React.createElement(Layout));
  })
  .catch(() => {
    // In case MSW fails to start, still render the app
    root.render(React.createElement(Layout));
  });
