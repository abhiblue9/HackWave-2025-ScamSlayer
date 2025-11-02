import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "jobwatch-deposit",
    prompt: "Recruiter email: 'Congratulations! Pay ₹2,999 security deposit today and join tomorrow.'",
    choices: [
      { text: "Pay deposit quickly to lock role", feedback: "Legit employers never ask for deposits." },
      { text: "Ask for official offer letter sent from company domain", correct: true, feedback: "Verify via company domains, not free mail IDs." },
      { text: "Share PAN + bank login for verification", feedback: "Never share sensitive info pre-offer." },
    ],
  },
  {
    id: "jobwatch-telegram",
    prompt: "'HR' wants to interview you over Telegram with questions copy-pasted from Google forms.",
    choices: [
      { text: "Proceed; remote interviews are now normal", feedback: "No official email, no portal? Major red flag." },
      { text: "Ask for video interview plus LinkedIn connection", feedback: "Still risky without company verification." },
      { text: "Decline and report the profile", correct: true, feedback: "Report fake recruiters and alert peers." },
    ],
  },
  {
    id: "jobwatch-offer",
    prompt: "You finish a legit interview. What's a safe next step before accepting?",
    choices: [
      { text: "Sign immediately, no questions", feedback: "Check compensation + offer terms first." },
      { text: "Verify offer letter format, company address, and HR contact", correct: true, feedback: "Always validate details before resigning current role." },
      { text: "Share bank login for payroll setup", feedback: "Employers never need your login credentials." },
    ],
  },
];

export default function JobWatch() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 25 + (perfect ? 35 : 0);
    const badge = perfect ? "Job Watch" : null;
    const gameMeta = {
      id: "job-watch",
      name: "Job Watch",
      score,
      streak: maxStreak,
      correct,
      total,
      perfect,
      xp,
      history,
    };

    if (!user) {
      return {
        xp,
        badge,
        locked: true,
        message: "Recruitment radar sharp! Sign in to keep your Job Watch streak next time.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP earned`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "No fake HR slips past you." : "Keep scanning LinkedIn and email headers carefully.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Job Watch"
        description="Filter legit offers from deposit scams, script interviews, and data grabs."
        rounds={ROUNDS}
        accentColor="#c084fc"
        onComplete={handleComplete}
        footer="Cross-check recruiters on LinkedIn, never pay joining fees, and use official portals only."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in so job-scam wins add to your leaderboard climb.</div>
      )}
    </div>
  );
}
