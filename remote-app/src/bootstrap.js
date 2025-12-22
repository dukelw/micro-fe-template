import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/AppContext";

export function mount(el) {
  const wrapper = document.createElement("div");
  el.appendChild(wrapper);

  const root = createRoot(wrapper);
  root.render(
    <AppProvider>
      <App />
    </AppProvider>
  );

  return root;
}

// dev standalone
export function devMount() {
  const el = document.getElementById("root");
  if (el) mount(el);
}
