import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PageDA from "./PageDA";
import FirstRemotePageExport from "../imports/FirstRemote/FirstRemoteExportPageWrapper";
import SecondRemotePageExport from "../imports/SecondRemote/SecondRemoteExportPageWrapper";

export default function PageD(): React.JSX.Element {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Page D - Menu</h1>

      <nav
        style={{
          background: "#f0f0f0",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "4px",
        }}
      >
        <Link to="/d/a" style={{ marginRight: "10px" }}>
          D.A (Shell)
        </Link>{" "}
        |
        <Link to="/d/first-remote-app-page-export" style={{ margin: "10px" }}>
          D.First Remote App Page Export (Remote)
        </Link>
        |
        <Link
          to="/d/second-remote-app-page-export"
          style={{ marginLeft: "10px" }}
        >
          D.Second Remote App Page Export (Remote)
        </Link>
      </nav>

      <div style={{ border: "1px solid #ccc", padding: "16px" }}>
        <Routes>
          <Route path="a" element={<PageDA />} />
          <Route
            path="first-remote-app-page-export"
            element={<FirstRemotePageExport />}
          />
          <Route
            path="second-remote-app-page-export"
            element={<SecondRemotePageExport />}
          />
          <Route path="*" element={<PageDA />} /> {/* default */}
        </Routes>
      </div>
    </div>
  );
}
