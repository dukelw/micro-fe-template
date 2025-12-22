import React from "react";
import { Routes, Route, Link, MemoryRouter } from "react-router-dom";
import PageX from "./pages/PageX";
import PageY from "./pages/PageY";
import PageZ from "./pages/PageZ";

export default function App() {
  return (
    <MemoryRouter>
      <nav>
        <Link to="/x">Page X</Link> |{" "}
        <Link to="/y">Page Y</Link> |{" "}
        <Link to="/z">Page Z</Link>
      </nav>

      <Routes>
        <Route path="/x" element={<PageX />} />
        <Route path="/y" element={<PageY />} />
        <Route path="/z" element={<PageZ />} />
        <Route path="*" element={<PageX />} /> {/* default */}
      </Routes>
    </MemoryRouter>
  );
}
