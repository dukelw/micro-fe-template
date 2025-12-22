import { useEffect, useRef } from "react";

export default function FirstRemoteWrapper() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("firstRemoteApp/FirstMount").then(({ mount }) => {
      if (ref.current) {
        mount(ref.current);
      }
    });
  }, []);

  return <div ref={ref} />;
}
