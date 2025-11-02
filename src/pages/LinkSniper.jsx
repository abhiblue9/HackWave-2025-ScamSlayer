import { useCallback, useState } from "react";
import Phaser from "phaser";
import PhaserCanvas from "../components/PhaserCanvas";
import MemePopup from "../components/MemePopup";
import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";
import { showToast } from "../utils/toast";

function makeGame(container, onFinish) {
  let score = 0;
  let timeLeft = 20;
  const safeDomains = ["upi.pay", "bank.app", "paytm.com", "gpay.google", "phonepe.com"]; // examples
  const baitWords = ["free", "prize", "verify", "urgent", "gift"];

  const randomUrl = () => {
    const legit = Math.random() < 0.55;
    if (legit) {
      const d = safeDomains[Math.floor(Math.random() * safeDomains.length)];
      return { text: `https://${d}/${Math.floor(Math.random()*9999)}`, legit: true };
    } else {
      const w = baitWords[Math.floor(Math.random() * baitWords.length)];
      return { text: `http://scam.${w}.${Math.floor(Math.random()*9)}xyz`, legit: false };
    }
  };

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: 720,
    height: 420,
    backgroundColor: "#0f1520",
    scene: {
      create() {
        const centerX = 360;
        this.add.text(centerX, 24, "LINK SNIPER", { fontSize: 24, color: "#22d3ee" }).setOrigin(0.5, 0);
        const scoreTxt = this.add.text(16, 16, `Score: ${score}`, { fontSize: 18, color: "#fff" });
        const timerTxt = this.add.text(590, 16, `00:${String(timeLeft).padStart(2, "0")}`, { fontSize: 18, color: "#fff" });

        const spawn = () => {
          const { text, legit } = randomUrl();
          const y = 90 + Math.random() * 300;
          const x = Math.random() < 0.5 ? -50 : 770;
          const color = legit ? "#22d3ee" : "#ff5a5f";
          const label = this.add.text(x, y, text, { fontSize: 18, color }).setInteractive({ useHandCursor: true });
          const speed = 90 + Math.random() * 90;
          const dir = x < 0 ? 1 : -1;
          label.on("pointerdown", () => {
            if (legit) score += 10; else score -= 10;
            scoreTxt.setText(`Score: ${score}`);
            label.destroy();
          });
          this.tweens.add({ targets: label, x: dir > 0 ? 770 : -50, duration: (720 + 100) / speed * 1000, onComplete: () => label.destroy() });
        };

        const spawnLoop = this.time.addEvent({ delay: 650, loop: true, callback: spawn });
        const timer = this.time.addEvent({ delay: 1000, loop: true, callback: () => {
          timeLeft -= 1; timerTxt.setText(`00:${String(timeLeft).padStart(2, "0")}`);
          if (timeLeft <= 0) { spawnLoop.remove(); timer.remove(); this.time.delayedCall(300, () => onFinish?.(score)); }
        }});
      },
    },
  });
}

export default function LinkSniper() {
  const { user, profile, setProfile } = useUserStore();
  const [popup, setPopup] = useState("");
  const [lastScore, setLastScore] = useState(null);

  const createGame = useCallback((el) => makeGame(el, async (score) => {
    setLastScore(score);
    const delta = Math.max(0, score);
    const badge = score >= 50 ? "Link Sniper" : null;
    const gameMeta = {
      id: "link-sniper",
      name: "Link Sniper",
      score,
      xp: delta,
      history: [{ score, ts: new Date().toISOString() }],
    };
    if (user) {
      await awardXp({ user, profile, setProfile, delta, badge, game: gameMeta });
      if (delta > 0) showToast(`+${delta} XP earned!`, { type: 'success' });
      if (badge) showToast('Link Sniper unlocked!', { type: 'success' });
    }
    setPopup(score >= 50 ? `Sharp! ${score} pts — Link Sniper unlocked!` : `Score ${score} — keep grinding!`);
  }), [user, profile, setProfile]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Mini-Game: Link Sniper</h2>
      <PhaserCanvas createGame={createGame} />
      {lastScore != null && (
        <div className="text-sm text-white/70">Last score: <span className="text-[--color-neon2] font-semibold">{lastScore}</span></div>
      )}
      <MemePopup show={!!popup} text={popup} tone="medium" onClose={() => setPopup("")} />
    </div>
  );
}
