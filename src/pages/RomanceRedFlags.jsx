import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "romance-giftcards",
    prompt: "Online match (2 weeks old): 'Babe my card got blocked, send 3 Amazon gift cards please.'",
    choices: [
      { text: "Buy and send gift card codes", feedback: "Gift card asks are a hallmark of romance scams." },
      { text: "Offer a small loan", feedback: "Any money sent will vanish." },
      { text: "Refuse, block, and report the profile", correct: true, feedback: "Protect your wallet by cutting contact immediately." },
    ],
  },
  {
    id: "romance-invest",
    prompt: "They invite you to 'invest together' on a crypto site only they recommend.",
    choices: [
      { text: "Invest together to build trust", feedback: "Pig-butchering scams use fake investment dashboards." },
      { text: "Ask friends for their opinion", feedback: "Scammers will isolate you from advice." },
      { text: "Decline, do not send funds, and screenshot as evidence", correct: true, feedback: "Collect evidence and stop responding." },
    ],
  },
  {
    id: "romance-id",
    prompt: "They avoid video calls and request copies of your ID 'to book tickets'.",
    choices: [
      { text: "Share ID to show trust", feedback: "Identity theft risk skyrockets." },
      { text: "Suggest meeting in public place first", feedback: "Scammers rarely agree to meet." },
      { text: "Refuse, secure accounts, and warn platform", correct: true, feedback: "Cut ties and secure your accounts." },
    ],
  },
];

export default function RomanceRedFlags() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 25 + (perfect ? 30 : 0);
    const badge = perfect ? "Heart Guard" : null;
    const gameMeta = {
      id: "romance-red-flags",
      name: "Romance Red Flags",
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
        message: "Heart shielded! Sign in to keep your badge next time.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP protected`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "Romance scammers can't pierce your armor." : "Stay cautious with digital relationships.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Romance Red Flags"
        description="Recognise emotional manipulation, spot pig-butchering plays, and keep your heart (and money) safe."
        rounds={ROUNDS}
        accentColor="#fca5a5"
        onComplete={handleComplete}
        footer="Protect personal data, refuse pressure for money, and report abusive profiles."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in so your Heart Guard badge sticks after a perfect run.</div>
      )}
    </div>
  );
}
