import { useEffect, useMemo } from "react";

export default function Confetti({ show, onDone, emojis = ["🎉","✨","⚡","🔥","🧠","💎"] }) {
  const parts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ i })), []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), 1400);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <style>{`
        @keyframes popDrop { 0%{transform:translateY(-20px) scale(.6); opacity:0} 15%{opacity:1} 100%{transform:translateY(120vh) rotate(360deg); opacity:0} }
      `}</style>
      {parts.map((p, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const dur = 0.9 + Math.random() * 0.7;
        const rot = (Math.random() * 60 - 30) + "deg";
        const emoji = emojis[idx % emojis.length];
        const style = {
          position: "absolute",
          left: left + "%",
          top: "-10px",
          fontSize: `${18 + Math.random()*10}px`,
          filter: "drop-shadow(0 0 8px rgba(124,58,237,.6))",
          animation: `popDrop ${dur}s ${delay}s ease-in forwards`,
          transform: `rotate(${rot})`,
        };
        return <span key={idx} style={style}>{emoji}</span>;
      })}
    </div>
  );
}
