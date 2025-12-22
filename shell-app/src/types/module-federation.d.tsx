declare module "remoteApp/mount" {
  import { Root } from "react-dom/client";

  export function mount(el: HTMLElement): Root;
  export function devMount(): void;
}

declare module "remoteApp/PageDB" {
  import React from "react";
  const RemotePageDB: React.ComponentType;
  export default RemotePageDB;
}
