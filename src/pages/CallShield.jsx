import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "callshield-intro",
    prompt: "Unknown number: 'Sir, this is the bank. Your account will freeze in 5 minutes unless you read the OTP we just sent.'",
    choices: [
      { text: "Share the OTP to be safe", feedback: "Never share OTPs. That's a direct takeover." },
      { text: "Ask for employee ID and say you'll call back via the official number", correct: true, feedback: "Great. Break the scammer's script and call the bank yourself." },
      { text: "Install the support app they sent", feedback: "Remote-control apps give attackers full access." },
    ],
  },
  {
    id: "callshield-remote",
    prompt: "The caller insists you install an APK to 'verify KYC'. What now?",
    choices: [
      { text: "Download and follow instructions quickly", feedback: "Malicious APK = instant phone compromise." },
      { text: "Hang up, uninstall unknown apps, and report inside the bank app", correct: true, feedback: "Disconnect, clean up, and report in official channels." },
      { text: "Keep chatting to learn more", feedback: "They'll keep manipulating while recording your info." },
    ],
  },
  {
    id: "callshield-escalate",
    prompt: "Minutes later you get the real bank's SMS about suspicious activity. Best follow-up?",
    choices: [
      { text: "Ignore; it must be spam", feedback: "Verify alerts by calling the official helpline." },
      { text: "Call the bank via the app and freeze the card if needed", correct: true, feedback: "Control the channel. Use in-app helplines or official numbers." },
      { text: "Reply to SMS with details", feedback: "Never respond to random SMS links." },
    ],
  },
];

export default function CallShield() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 30 + (perfect ? 40 : 0);
    const badge = perfect ? "Call Shield" : null;
    const gameMeta = {
      id: "call-shield",
      name: "Call Shield",
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
        message: "Strong defense! Sign in so your Call Shield badge sticks next time.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP defended`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "Unbreakable call defense." : "Bank helplines over unknown callers every time.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Call Shield"
        description="Intercept voice-phishing scripts, keep your OTPs secret, and slam the door on remote-access attacks."
        rounds={ROUNDS}
        accentColor="#38bdf8"
        onComplete={handleComplete}
        footer="Reminder: banks never ask for OTPs, card PINs, or remote access on calls."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in to claim XP and badges from your defensive plays.</div>
      )}
    </div>
  );
}
