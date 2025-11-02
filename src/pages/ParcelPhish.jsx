import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "parcel-link",
    prompt: "SMS: 'DTDC: your parcel is held. Pay ₹49 here: bit.ly/dtdc-pay to release today.'",
    choices: [
      { text: "Tap link and pay the small fee", feedback: "Shortened links + fee = classic phishing trick." },
      { text: "Ignore, track parcel from the courier's official app", correct: true, feedback: "Always verify deliveries inside the official portal." },
      { text: "Call the number in SMS", feedback: "Numbers in scam SMS route directly to fraudsters." },
    ],
  },
  {
    id: "parcel-otp",
    prompt: "Fake delivery agent calls asking for the OTP you received to 'confirm address'.",
    choices: [
      { text: "Share OTP so parcel arrives", feedback: "OTP lets them hijack your accounts." },
      { text: "Refuse, hang up, and contact support via official app", correct: true, feedback: "OTP is only for your use inside official apps." },
      { text: "Text them the OTP but change one digit", feedback: "Any OTP exposure is game over." },
    ],
  },
  {
    id: "parcel-form",
    prompt: "Email: 'Customs: fill out attached form with PAN + card details to release imported item.'",
    choices: [
      { text: "Download form and submit details", feedback: "Attachments from random senders = malware." },
      { text: "Forward the email to report@indiapost.gov.in and delete", correct: true, feedback: "Report phishing and handle duties from official portals only." },
      { text: "Pay via UPI ID mentioned", feedback: "Fraud UPI IDs collect instant payments." },
    ],
  },
];

export default function ParcelPhish() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 25 + (perfect ? 30 : 0);
    const badge = perfect ? "Parcel Patroller" : null;
    const gameMeta = {
      id: "parcel-phish",
      name: "Parcel Phish",
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
        message: "Delivery defense on point! Sign in so XP sticks next run.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP delivered safely`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "No courier scam can sneak through." : "Stay in official tracking apps to stay safe.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Parcel Phish"
        description="Outsmart fake courier texts, OTP grabs, and customs fee scams before they grab your wallet."
        rounds={ROUNDS}
        accentColor="#f472b6"
        onComplete={handleComplete}
        footer="Couriers never charge through random links. Track orders inside their official apps or websites."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in so your parcel-defense XP lands on the leaderboard.</div>
      )}
    </div>
  );
}
