import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import PageA from "./pages/PageA";
import PageB from "./pages/PageB";
import PageD from "./pages/PageD";
import FirstRemoteWrapper from "./imports/FirstRemote/FirstRemoteWrapper";
import SecondRemoteWrapper from "./imports/SecondRemote/SecondRemoteWrapper";

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
        <a href="/first-remote-app" style={{ margin: "0 15px" }}>
          First Remote App
        </a>{" "}
        |
        <a href="/second-remote-app" style={{ margin: "0 15px" }}>
          Second Remote App
        </a>{" "}
        |
        <Link to="/d" style={{ marginLeft: "15px" }}>
          Page D (Menu)
        </Link>
      </nav>

      <Routes>
        <Route path="/a" element={<PageA />} />
        <Route path="/b" element={<PageB />} />
        <Route path="/first-remote-app" element={<FirstRemoteWrapper />} />
        <Route path="/second-remote-app" element={<SecondRemoteWrapper />} />
        <Route path="/d/*" element={<PageD />} />
        <Route path="*" element={<PageA />} />
      </Routes>
    </BrowserRouter>
  );
}
