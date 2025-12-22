declare module "remoteApp/mount" {
  import { Root } from "react-dom/client";

  export function mount(el: HTMLElement): Root;
  export function devMount(): void;
}
