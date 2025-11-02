import { useEffect } from "react";
import { useSfx } from "../hooks/useSfx";

export default function MemePopup({ show, text = "", tone = "medium", onClose }) {
  const { pop } = useSfx();
  useEffect(() => {
    if (!show) return;
    pop();
    const t = setTimeout(() => onClose?.(), 1800);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;
  const toneClass = tone === "spicy" ? "border-red-500/70" : tone === "mild" ? "border-white/20" : "border-[--color-neon]/70";

  return (
    <div className="fixed inset-0 pointer-events-none flex items-start justify-center mt-16 px-4 z-[100]">
      <div className={`pointer-events-auto glass ${toneClass} border-2 max-w-md w-full p-4 text-center shadow-[0_0_40px_rgba(124,58,237,.35)] animate-in fade-in zoom-in-95`}>
        <div className="text-lg font-semibold">{text}</div>
      </div>
    </div>
  );
}
