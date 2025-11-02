import { useEffect, useRef } from "react";

export default function PhaserCanvas({ createGame }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    let disposed = false;
    let gameInstance = null;
    const maybePromise = createGame(ref.current);
    const attach = async () => {
      try {
        const g = await maybePromise; // supports sync or promise
        if (!disposed) gameInstance = g;
      } catch {}
    };
    attach();
    return () => {
      disposed = true;
      try { gameInstance?.destroy?.(true); } catch {}
    };
  }, [createGame]);
  return <div ref={ref} className="w-full h-[420px] glass overflow-hidden" />;
}
