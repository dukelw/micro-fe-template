import React from "react";
import { useAppContext } from "./context/AppContext";

export default function RemoteComponent() {
  const ctx = useAppContext();

  return (
    <div style={{ border: "2px solid red", padding: 16 }}>
      <h2>{ctx.appName}</h2>
      <p>Version: {ctx.version}</p>
    </div>
  );
}
