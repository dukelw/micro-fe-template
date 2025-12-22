import React from "react";
import { AppProvider } from "../context/AppContext";
import PageExportFromFirstRemoteApp from "../pages/PageExportFromFirstRemoteApp";

export default function RemotePageExportFromFirstRemoteApp(): React.JSX.Element {
  return (
    <AppProvider>
      <PageExportFromFirstRemoteApp />
    </AppProvider>
  );
}
