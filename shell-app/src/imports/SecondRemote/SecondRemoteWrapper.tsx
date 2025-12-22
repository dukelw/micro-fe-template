import { useEffect, useRef } from "react";

export default function SecondRemoteWrapper() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("secondRemoteApp/SecondMount").then(({ mount }) => {
      if (ref.current) {
        mount(ref.current);
      }
    });
  }, []);

  return <div ref={ref} />;
}
