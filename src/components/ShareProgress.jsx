import { useState } from 'react';

export default function ShareProgress({ xp, badges, onClose }) {
  const [sharing, setSharing] = useState(false);

  const shareText = `🛡️ Level up! Just earned ${xp} XP on ScamSlayer!\n${
    badges.length ? `🏆 Latest badge: ${badges[badges.length - 1]}\n` : ''
  }Join me in fighting scams! 💪`;

  const share = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My ScamSlayer Progress',
          text: shareText,
          url: window.location.origin
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard! 📋');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
    setSharing(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[--color-bg] rounded-xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-xl font-bold">Share Your Progress</h3>
        
        <div className="p-4 bg-white/5 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{shareText}</pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={share}
            disabled={sharing}
            className="flex-1 px-4 py-2 bg-[--color-neon] hover:bg-[--color-neon2] rounded-lg transition-colors"
          >
            {sharing ? 'Sharing...' : 'Share 🚀'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}