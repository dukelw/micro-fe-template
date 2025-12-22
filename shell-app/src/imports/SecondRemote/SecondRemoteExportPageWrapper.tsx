import React, { lazy, Suspense } from "react";

const SecondRemotePageExport = lazy(() => import("secondRemoteApp/SecondRemotePageExport"));

export default function SecondRemotePageExportWrapper(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading Remote Page Export...</div>}>
      <SecondRemotePageExport />
    </Suspense>
  );
}
