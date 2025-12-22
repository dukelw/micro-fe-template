import React from "react";
import { AppProvider } from "../context/AppContext";
import PageDB from "../pages/PageDB";

export default function RemotePageDB(): React.JSX.Element {
  return (
    <AppProvider>
      <PageDB />
    </AppProvider>
  );
}
