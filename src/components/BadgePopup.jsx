import { useEffect } from 'react';
import { useSfx } from '../hooks/useSfx';

export default function BadgePopup({ badge, onClose }) {
  const { success } = useSfx();

  useEffect(() => {
    success();
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose, success]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-[100]">
      <div className="pointer-events-auto max-w-md bg-[--color-neon]/20 backdrop-blur-sm border border-[--color-neon] rounded-xl p-6 shadow-[0_0_50px_rgba(124,58,237,0.5)] animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-3">
          <div className="text-6xl animate-bounce">🏆</div>
          <h3 className="text-xl font-bold">New Badge Unlocked!</h3>
          <p className="text-[--color-neon2] font-semibold">{badge}</p>
        </div>
      </div>
    </div>
  );
}