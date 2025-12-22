declare module "firstRemoteApp/FirstMount" {
  import { Root } from "react-dom/client";

  export function mount(el: HTMLElement): Root;
  export function devMount(): void;
}

declare module "secondRemoteApp/SecondMount" {
  import { Root } from "react-dom/client";

  export function mount(el: HTMLElement): Root;
  export function devMount(): void;
}

// ============================================
// First Remote
// ============================================
declare module "firstRemoteApp/FirstRemotePageExport" {
  import React from "react";
  const FirstRemotePageExport: React.ComponentType;
  export default FirstRemotePageExport;
}

// ============================================
// Second Remote
// ============================================
declare module "secondRemoteApp/SecondRemotePageExport" {
  import React from "react";
  const SecondRemotePageExport: React.ComponentType;
  export default SecondRemotePageExport;
}
