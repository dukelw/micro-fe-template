import { createRoot } from "react-dom/client";
import RemoteComponent from "./RemoteComponent";
import { AppProvider } from "./context/AppContext";

export function mount(el) {
  const wrapper = document.createElement("div");
  el.appendChild(wrapper);

  const root = createRoot(wrapper);
  root.render(
    <AppProvider>
      <RemoteComponent />
    </AppProvider>
  );

  return root;
}

// Chỉ dùng khi DEV standalone
export function devMount() {
  const el = document.getElementById("root");
  if (el) {
    mount(el);
  }
}
