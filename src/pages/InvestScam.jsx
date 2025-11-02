import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "invest-hype",
    prompt: "Telegram broadcast: 'Guaranteed 5x returns in 7 days if you join our premium crypto group today.'",
    choices: [
      { text: "Stake immediately before the slots fill", feedback: "'Guaranteed returns' is Ponzi language." },
      { text: "Join group but invest only a little", feedback: "Entry fees and pressure equals grift." },
      { text: "Ignore, research via SEBI-registered platforms", correct: true, feedback: "Legit investments never guarantee outsized returns." },
    ],
  },
  {
    id: "invest-kyc",
    prompt: "An influencer DM says an IPO allotment is sure-shot if you wire ₹50k upfront for their 'KYC fast-track'.",
    choices: [
      { text: "Wire money to lock the allotment", feedback: "No third party can fast-track IPO KYC." },
      { text: "Ask for SEBI registration number and verify", correct: true, feedback: "Check credentials on SEBI's website before trusting offers." },
      { text: "Share PAN and Aadhaar to stay in queue", feedback: "Never share full IDs over random DMs." },
    ],
  },
  {
    id: "invest-diversify",
    prompt: "Your friend pushes a referral app promising daily 3% interest and 'locked wallet'.",
    choices: [
      { text: "Deposit to test with small amount", feedback: "High daily interest is the classic Ponzi hook." },
      { text: "Report app in app store + guide friend on risks", correct: true, feedback: "Warn others and report suspicious apps." },
      { text: "Keep money in app but monitor closely", feedback: "You'll be trapped when withdrawals freeze." },
    ],
  },
  {
    id: "invest-plan",
    prompt: "You want to invest sign-up bonus wisely. What's the best play?",
    choices: [
      { text: "Chase the latest hype coin", feedback: "Speculation without research is gambling." },
      { text: "Set up SIP in diversified index funds", correct: true, feedback: "Diversification + regulated brokers beats FOMO." },
      { text: "Keep cash idle until the next 'tip' shows up", feedback: "Idle cash loses value; follow a plan." },
    ],
  },
];

export default function InvestScam() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 30 + (perfect ? 50 : 0);
    const badge = perfect ? "Hype Buster" : null;
    const gameMeta = {
      id: "hype-buster",
      name: "Hype Buster",
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
        message: "Market pro! Sign in next run so XP & badges persist.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP invested wisely`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "You nuked every hype trap." : "Smart capital stays with regulated, diversified plans.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Hype Buster"
        description="Spot Ponzi pitches, reject fake IPO fast-tracks, and lock your money behind solid research."
        rounds={ROUNDS}
        accentColor="#34d399"
        onComplete={handleComplete}
        footer="Check SEBI registrations, avoid guaranteed returns, and automate diversified investing."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in to bank XP from your smart investment calls.</div>
      )}
    </div>
  );
}
