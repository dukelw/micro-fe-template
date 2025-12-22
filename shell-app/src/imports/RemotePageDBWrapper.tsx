import React, { lazy, Suspense } from "react";

const RemotePageDB = lazy(() => import("remoteApp/PageDB"));

export default function RemotePageDBWrapper(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading Remote Page D.B...</div>}>
      <RemotePageDB />
    </Suspense>
  );
}
