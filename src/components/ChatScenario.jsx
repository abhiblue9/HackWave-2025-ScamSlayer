import { useMemo, useState } from "react";

// Minimal branching engine to run short chat-style missions.
// Accepts either a single step object or an array of steps so legacy data keeps working.
export default function ChatScenario({ scenario, onResult, disabled = false }) {
  const steps = useMemo(() => {
    if (!scenario) return [];
    return Array.isArray(scenario) ? scenario.filter(Boolean) : [scenario];
  }, [scenario]);

  const [step, setStep] = useState(0);
  const node = steps[step] ?? steps[steps.length - 1];

  if (!node) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {node.messages?.map((m, i) => (
          <div key={i} className={`max-w-[80%] ${m.from === "npc" ? "ml-0" : "ml-auto"}`}>
            <div className={`px-3 py-2 rounded-2xl ${m.from === "npc" ? "bg-white/10 animate-bubble-left" : "bg-[--color-neon]/30 animate-bubble-right"}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {node.choices?.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            className={`glass transition-colors px-3 py-2 text-left animate-slide-up ${
              disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white/20 hover-pop"
            }`}
            onClick={() => {
              if (disabled) return;
              onResult?.(c.result);
              if (typeof c.result?.next === "number") setStep(c.result.next);
            }}
          >
            {c.text}
          </button>
        ))}
      </div>
      {node.feedback && (
        <div className="glass p-3 text-sm">
          {node.feedback}
        </div>
      )}
    </div>
  );
}
