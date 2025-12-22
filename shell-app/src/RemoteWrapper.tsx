import { useEffect, useRef } from "react";

export default function RemoteWrapper() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("remoteApp/mount").then(({ mount }) => {
      if (ref.current) {
        mount(ref.current);
      }
    });
  }, []);

  return <div ref={ref} />;
}
