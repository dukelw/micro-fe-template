import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PageA from "./pages/PageA";
import PageB from "./pages/PageB";
import RemoteWrapper from "./imports/RemoteWrapper";
import PageD from "./pages/PageD";

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/a" style={{ marginRight: "15px" }}>
          Page A
        </Link>{" "}
        |
        <Link to="/b" style={{ margin: "0 15px" }}>
          Page B
        </Link>{" "}
        |
        <Link to="/c" style={{ margin: "0 15px" }}>
          Remote Page C
        </Link>{" "}
        |
        <Link to="/d" style={{ marginLeft: "15px" }}>
          Page D (Menu)
        </Link>
      </nav>

      <Routes>
        <Route path="/a" element={<PageA />} />
        <Route path="/b" element={<PageB />} />
        <Route path="/c" element={<RemoteWrapper />} />
        <Route path="/d/*" element={<PageD />} />
        <Route path="*" element={<PageA />} />
      </Routes>
    </BrowserRouter>
  );
}
