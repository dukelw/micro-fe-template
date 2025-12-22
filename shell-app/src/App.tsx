import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PageA from "./pages/PageA";
import PageB from "./pages/PageB";
import RemoteWrapper from "./RemoteWrapper";

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/a">Page A</Link> |{" "}
        <Link to="/b">Page B</Link> |{" "}
        <Link to="/c">Remote Page C</Link>
      </nav>

      <Routes>
        <Route path="/a" element={<PageA />} />
        <Route path="/b" element={<PageB />} />
        <Route path="/c" element={<RemoteWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}