import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "profile-privacy",
    prompt: "You just hit 1k followers. Which privacy reset keeps scammers away?",
    choices: [
      { text: "Leave everything public", feedback: "Public DMs and posts invite phishing attempts." },
      { text: "Friends-only posts, but DMs open", feedback: "Scammers still slide into open DMs." },
      { text: "Friends-only posts, restrict DMs to followers", correct: true, feedback: "Limit who can message you to reduce attack surface." },
    ],
  },
  {
    id: "profile-2fa",
    prompt: "A phishing wave hits your friend group. Secure your account now.",
    choices: [
      { text: "Enable email-based 2FA", feedback: "Email-only MFA is better than nothing but can be compromised." },
      { text: "Enable app-based 2FA and remove old sessions", correct: true, feedback: "App-based 2FA plus device review stops most hijacks." },
      { text: "Change password to a simpler one to remember", feedback: "Strong unique password + MFA is required." },
    ],
  },
  {
    id: "profile-details",
    prompt: "Brands keep spamming after scraping your profile. What now?",
    choices: [
      { text: "Hide phone/email, review third-party app access", correct: true, feedback: "Limit data exposure and revoke shady app permissions." },
      { text: "Post a status asking scammers to stop", feedback: "Broadcasting invites more attacks." },
      { text: "Share more personal info to look authentic", feedback: "Oversharing fuels social engineering." },
    ],
  },
];

export default function ProfileLock() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 20 + (perfect ? 25 : 0);
    const badge = perfect ? "Profile Guardian" : null;
    const gameMeta = {
      id: "profile-lock",
      name: "Profile Lock",
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
        message: "Social fortress built! Sign in so XP sticks next run.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP secured`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "Profile fully locked." : "Keep reviewing privacy + app access regularly.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Profile Lock"
        description="Lock down social accounts, enable resilient MFA, and hide the breadcrumbs scammers love."
        rounds={ROUNDS}
        accentColor="#60a5fa"
        onComplete={handleComplete}
        footer="Review privacy settings each quarter and revoke third-party access you no longer use."
      />
      {!user && (
        <div className="text-xs text-white/60">Sign in to cement your Profile Guardian badge on a perfect run.</div>
      )}
    </div>
  );
}
