import React, { CSSProperties } from "react";
import { useAppContext } from "./context/AppContext";

const containerStyle: CSSProperties = {
  border: "2px solid red",
  padding: 16,
};

export default function RemoteComponent(): React.JSX.Element {
  const ctx = useAppContext();

  return (
    <div style={containerStyle}>
      <h2>{ctx.appName}</h2>
      <p>Version: {ctx.version}</p>
    </div>
  );
}
