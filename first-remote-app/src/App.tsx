import React from "react";
import { Routes, Route, Link, MemoryRouter } from "react-router-dom";
import PageOne from "./pages/PageOne";
import PageThree from "./pages/PageThree";
import PageTwo from "./pages/PageTwo";
import PageExportFromFirstRemoteApp from "./pages/PageExportFromFirstRemoteApp";
import TradingViewPage from "./pages/PageTradingView";
import PageGrid from "./pages/PageGrid";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import PriceBoard from "./components/PriceBoard";
import PriceBoardJson from "./components/PriceBoardJson";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function App(): React.JSX.Element {
  return (
    <MemoryRouter>
      <nav>
        <Link to="/one">Page One</Link> | <Link to="/two">Page Two</Link> |{" "}
        <Link to="/three">Page Three</Link> | <Link to="/grid">Page Grid</Link>{" "}
        |{" "}
        <Link to="/first-remote-app-page-export">
          First Remote App Page Export
        </Link>{" "}
        | <Link to="/trading-view">Trading View</Link>
      </nav>

      <Routes>
        <Route path="/one" element={<PageOne />} />
        <Route path="/two" element={<PageTwo />} />
        <Route path="/grid" element={<PageGrid />} />
        <Route path="/three" element={<PageThree />} />
        <Route
          path="/first-remote-app-page-export"
          element={<PageExportFromFirstRemoteApp />}
        />
        <Route path="/trading-view" element={<TradingViewPage />} />
        <Route path="*" element={<PageOne />} />
      </Routes>
      <PriceBoard />
      <PriceBoardJson />
    </MemoryRouter>
  );
}
