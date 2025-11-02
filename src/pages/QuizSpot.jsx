import { useState } from "react";
import MemePopup from "../components/MemePopup";
import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";

const QUESTIONS = [
  {
    prompt: "A friend DM's: 'Send me the OTP asap, it's urgent.'",
    options: ["Share OTP to help", "Call to verify identity and never share OTP"],
    correct: 1,
    explain: "Never share OTP. Verify via call if unsure.",
  },
  {
    prompt: "You get a UPI request 'Claim ₹5000 prize now'",
    options: ["Accept quickly", "Decline and check official app/balance"],
    correct: 1,
    explain: "Pull requests take money from you. Verify in your app.",
  },
  {
    prompt: "Bank alert link: bank-verify-login.com",
    options: ["Click link to login", "Open bank app or type official URL"],
    correct: 1,
    explain: "Avoid links. Use official app/URL.",
  },
];

export default function QuizSpot() {
  const { user, profile, setProfile } = useUserStore();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [popup, setPopup] = useState("");
  const q = QUESTIONS[idx];

  const answer = async (choice) => {
    const correct = choice === q.correct;
    setScore((s) => s + (correct ? 10 : 0));
    setPopup(correct ? "W move 🧠" : "Nope 🚫");
    const next = idx + 1;
    if (next < QUESTIONS.length) {
      setTimeout(() => { setIdx(next); setPopup(""); }, 700);
    } else {
      const total = (correct ? score + 10 : score);
      const delta = total; // 10 per correct
      if (user) {
        await awardXp({ user, profile, setProfile, delta, badge: total >= 20 ? "Scam Spotter" : null });
        if (delta > 0) showToast(`+${delta} XP earned!`, { type: 'success' });
        if (total >= 20) showToast('Scam Spotter unlocked!', { type: 'success' });
      }
      setTimeout(() => setPopup(`Score ${total} — ${total>=20?"Scam Spotter unlocked!":"keep training!"}`), 400);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Quiz: Spot the Scam</h2>
      <div className="glass p-4 space-y-3">
        <div className="text-sm text-white/60">Question {idx + 1} / {QUESTIONS.length}</div>
        <div className="text-base">{q.prompt}</div>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button key={i} className="glass px-3 py-2 text-left hover-pop hover:bg-white/20" onClick={() => answer(i)}>
              {opt}
            </button>
          ))}
        </div>
        <div className="text-sm text-white/70">Score: <span className="text-[--color-neon2] font-semibold">{score}</span></div>
        {!user && <div className="text-xs text-white/60">Sign in to save XP and earn badges.</div>}
      </div>
      <MemePopup show={!!popup} text={popup} tone="medium" onClose={() => setPopup("")} />
    </div>
  );
}
