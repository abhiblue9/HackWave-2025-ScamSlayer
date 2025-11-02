import { useEffect } from "react";

function buildShareText(badgeName) {
  return `I just unlocked ${badgeName} on ScamSlayer! Can you beat me?`;
}

export default function ShareModal({ open, badgeName, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const link = window.location.origin;
  const text = buildShareText(badgeName);

  const doWebShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ScamSlayer', text, url: link });
        onClose?.();
      }
    } catch {}
  };
  const openWin = (u) => window.open(u, '_blank', 'noopener,noreferrer');
  const shareWhatsApp = () => openWin(`https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`);
  const shareTwitter = () => openWin(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4">
      <div className="glass max-w-sm w-full p-4 space-y-3">
        <div className="text-lg font-semibold">Share achievement</div>
        <div className="text-sm text-white/70">{badgeName}</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 rounded-lg bg-[--color-neon] text-black font-semibold" onClick={shareWhatsApp}>WhatsApp</button>
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20" onClick={shareTwitter}>Twitter/X</button>
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20" onClick={doWebShare}>Web Share</button>
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20" onClick={copyLink}>Copy Link</button>
        </div>
        <div className="text-xs text-white/60">Instagram/Snapchat: use Web Share on mobile, or Copy Link and post manually. (Direct web intents are limited.)</div>
        <div className="flex justify-end">
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
