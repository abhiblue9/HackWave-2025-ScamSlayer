import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";
import ScenarioGame from "../components/ScenarioGame";

const ROUNDS = [
  {
    id: "forge-anchor",
    prompt: "You're setting up a FinTech wallet holding crypto and savings. Which password keeps attackers out?",
    details: ["Must survive credential dumps", "Should be unique and long"],
    choices: [
      { text: "Password@123", feedback: "Predictable pattern. Attackers try these first." },
      { text: "G@nesha2024", feedback: "Still guessable — based on personal info." },
      { text: "Glass-Mango!39River", correct: true, feedback: "Long, random mix with symbols and words." },
      { text: "wallet$$$", feedback: "Too short and repetitive." },
    ],
  },
  {
    id: "forge-breach",
    prompt: "An email says one of your old passwords leaked. What is the safest immediate response?",
    choices: [
      { text: "Reuse the same password but add !23", feedback: "Patchwork reuse keeps you exposed." },
      { text: "Change the password everywhere and enable 2FA", correct: true, feedback: "Rotate to unique passwords and add a second factor." },
      { text: "Ignore; breaches are fake", feedback: "Assume breach notifications are serious. Verify on HaveIBeenPwned." },
    ],
  },
  {
    id: "forge-sharing",
    prompt: "Your flatmate wants the OTT login. What's the safest play?",
    choices: [
      { text: "Share current password via chat", feedback: "Never send passwords in clear text." },
      { text: "Create a new unique password, store in manager, and add them as a viewer", correct: true, feedback: "Use password manager sharing or separate profiles." },
      { text: "Set password to their birthday so they remember", feedback: "Dates are easy to brute-force." },
    ],
  },
  {
    id: "forge-mfa",
    prompt: "You just hardened your main email password. Which additional control makes it a fortress?",
    choices: [
      { text: "Enable SMS OTP only", feedback: "Better than nothing, but SIM swaps exist." },
      { text: "Turn on authenticator app / passkeys", correct: true, feedback: "App-based MFA or passkeys stop most takeovers." },
      { text: "Rely on security questions", feedback: "Security answers are easy to guess from social media." },
    ],
  },
];

export default function PasswordForge() {
  const { user, profile, setProfile } = useUserStore();

  const handleComplete = async (result) => {
    const { correct, perfect, score, maxStreak, total, history } = result;
    const xp = correct * 25 + (perfect ? 35 : 0);
    const badge = perfect ? "Password Blacksmith" : null;
    const gameMeta = {
      id: "password-forge",
      name: "Password Forge",
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
        message: "Solid forging! Sign in next run so the XP and badge stick to your profile.",
        game: gameMeta,
      };
    }

    await awardXp({ user, profile, setProfile, delta: xp, badge, game: gameMeta });
    if (xp > 0) showToast(`+${xp} XP forged`, { type: "success" });
    if (badge) showToast(`${badge} unlocked!`, { type: "success" });

    return {
      xp,
      badge,
      message: badge ? "Perfect forge! Vault upgraded." : "Password game on point — keep the streak alive.",
      game: gameMeta,
    };
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <ScenarioGame
        title="Password Forge"
        description="Craft elite passwords, rotate after breaches, and layer in MFA to stay unhackable."
        rounds={ROUNDS}
        accentColor="#fb923c"
        onComplete={handleComplete}
        footer="Use a password manager to generate unique credentials and enable passkeys wherever possible."
      />
      {!user && (
        <div className="text-xs text-white/60">
          Sign in to lock earned XP and badges to your ScamSlayer profile.
        </div>
      )}
    </div>
  );
}
