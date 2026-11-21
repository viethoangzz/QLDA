import React from "react";
import { createRoot } from "react-dom/client";
import { App as AntApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#176b60",
          borderRadius: 8,
          fontFamily: "Segoe UI, Arial, sans-serif",
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
