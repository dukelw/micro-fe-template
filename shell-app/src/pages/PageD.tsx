import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PageDA from "./PageDA";
import RemotePageDBWrapper from "../imports/RemotePageDBWrapper";

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
        <Link to="/d/b" style={{ marginLeft: "10px" }}>
          D.B (Remote)
        </Link>
      </nav>

      <div style={{ border: "1px solid #ccc", padding: "16px" }}>
        <Routes>
          <Route path="a" element={<PageDA />} />
          <Route path="b" element={<RemotePageDBWrapper />} />
          <Route path="*" element={<PageDA />} /> {/* default */}
        </Routes>
      </div>
    </div>
  );
}
