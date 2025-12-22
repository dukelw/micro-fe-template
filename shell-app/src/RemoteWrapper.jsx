import { useEffect, useRef } from "react";

export default function RemoteWrapper() {
  const ref = useRef(null);

  useEffect(() => {
    import("remoteApp/mount").then(({ mount }) => {
      mount(ref.current);
    });
  }, []);

  return <div ref={ref} />;
}
