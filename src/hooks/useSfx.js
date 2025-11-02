import { useCallback, useRef } from "react";

export function useSfx() {
  const ctxRef = useRef(null);
  const ensure = () => (ctxRef.current ??= new (window.AudioContext || window.webkitAudioContext)());

  const beep = useCallback((freq = 880, duration = 0.08, type = "sine", gain = 0.06) => {
    try {
      const ctx = ensure();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + duration);
      // quick fade out
      g.gain.setValueAtTime(gain, now + duration - 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } catch {}
  }, []);

  const pop = useCallback(() => beep(660, 0.09, "triangle", 0.08), [beep]);
  const success = useCallback(() => { beep(523.25, 0.07, "sine", 0.06); setTimeout(() => beep(659.25, 0.08, "sine", 0.06), 70); }, [beep]);
  const fail = useCallback(() => beep(196, 0.12, "sawtooth", 0.05), [beep]);

  return { pop, success, fail };
}
