import React from "react";
import { AppProvider } from "../context/AppContext";
import PageExportFromSecondRemote from "../pages/PageExportFromSecondRemote";

export default function RemotePageExportFromSecondRemote(): React.JSX.Element {
  return (
    <AppProvider>
      <PageExportFromSecondRemote />
    </AppProvider>
  );
}
