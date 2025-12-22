import React, { createContext, useContext } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const value = {
    appName: "Remote App",
    version: "1.0.0",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
