import React from "react";
import { Routes, Route, Link, MemoryRouter } from "react-router-dom";
import PageOne from "./pages/PageOne";
import PageThree from "./pages/PageThree";
import PageTwo from "./pages/PageTwo";
import PageExportFromFirstRemoteApp from "./pages/PageExportFromFirstRemoteApp";

export default function App(): React.JSX.Element {
  return (
    <MemoryRouter>
      <nav>
        <Link to="/one">Page One</Link> | <Link to="/two">Page Two</Link> |{" "}
        <Link to="/three">Page Three</Link> |{" "}
        <Link to="/first-remote-app-page-export">
          First Remote App Page Export
        </Link>
      </nav>

      <Routes>
        <Route path="/one" element={<PageOne />} />
        <Route path="/two" element={<PageTwo />} />
        <Route path="/three" element={<PageThree />} />
        <Route
          path="/first-remote-app-page-export"
          element={<PageExportFromFirstRemoteApp />}
        />
        <Route path="*" element={<PageOne />} />
      </Routes>
    </MemoryRouter>
  );
}
