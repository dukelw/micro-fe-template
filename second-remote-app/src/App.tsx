import React from "react";
import { Routes, Route, Link, MemoryRouter } from "react-router-dom";
import PageX from "./pages/PageX";
import PageY from "./pages/PageY";
import PageZ from "./pages/PageZ";
import PageExportFromSecondRemote from "./pages/PageExportFromSecondRemote";

export default function App(): React.JSX.Element {
  return (
    <MemoryRouter>
      <nav>
        <Link to="/x">Page X</Link> | <Link to="/y">Page Y</Link> |{" "}
        <Link to="/z">Page Z</Link> |{" "}
        <Link to="/second-remote-app-page-export">
          Second Remote App Page Export
        </Link>
      </nav>

      <Routes>
        <Route path="/x" element={<PageX />} />
        <Route path="/y" element={<PageY />} />
        <Route path="/z" element={<PageZ />} />
        <Route
          path="/second-remote-app-page-export"
          element={<PageExportFromSecondRemote />}
        />
        <Route path="*" element={<PageX />} />
      </Routes>
    </MemoryRouter>
  );
}
