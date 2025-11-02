import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "deal-form",
    prompt: "Instagram ad: 'Latest iPhone for ₹14,999. Pay now via Google Form checkout.'",
    choices: [
      { text: "Fill the form and pay to reserve", feedback: "External forms with upfront fee scream scam." },
      { text: "Verify seller history and insist on platform checkout", correct: true, feedback: "Protected payments + ratings help avoid fraud." },
      { text: "DM seller for direct bank transfer discount", feedback: "Bank transfers remove buyer protection." },
    ],
  },
  {
    id: "deal-escrow",
    prompt: "Seller says, 'Pay 30% advance outside the marketplace to skip fees.'",
    choices: [
      { text: "Agree and send advance", feedback: "No refunds when they disappear." },
      { text: "Offer cash on delivery", feedback: "COD may still be risky without official listing." },
      { text: "Stay within marketplace escrow / payment gateway", correct: true, feedback: "Stay on-platform to keep dispute rights." },
    ],
  },
  {
    id: "deal-tracking",
    prompt: "After payment, seller sends tracking screenshot from unknown courier with .xyz domain.",
    choices: [
      { text: "Trust screenshot and wait", feedback: "Fake tracking keeps you quiet until dispute window closes." },
      { text: "Cross-check order status inside platform and raise ticket", correct: true, feedback: "If tracking isn't verified, escalate immediately." },
      { text: "Message courier on WhatsApp", feedback: "Fraudsters control fake support numbers." },
    ],
  },
];

export default function DealDetective() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 25 + (perfect ? 35 : 0);
    const badge = perfect ? "Deal Detective" : null;
    const gameMeta = {
      id: "deal-detective",
      name: "Deal Detective",
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
        message: "Deal detective instincts! Sign in to log XP next run.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP secured`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "Marketplace fraudsters caught in 4K." : "Keep deals inside verified platforms.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Deal Detective"
        description="Hunt down fake marketplace listings, dodgy payment requests, and bogus tracking."
        rounds={ROUNDS}
        accentColor="#22d3ee"
        onComplete={handleComplete}
        footer="Never leave platform escrow, cross-check tracking, and file disputes at the first red flag."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in so your shopping-smarts push you up the leaderboard.</div>
      )}
    </div>
  );
}
