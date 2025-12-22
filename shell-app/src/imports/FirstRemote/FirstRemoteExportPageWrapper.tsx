import React, { lazy, Suspense } from "react";

const FirstRemotePageExport = lazy(() => import("firstRemoteApp/FirstRemotePageExport"));

export default function FirstRemotePageExportWrapper(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading Remote Page Export...</div>}>
      <FirstRemotePageExport />
    </Suspense>
  );
}
