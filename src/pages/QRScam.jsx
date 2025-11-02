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

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: 720,
    height: 420,
    backgroundColor: "#0f1520",
    scene: {
      create() {
        const centerX = 360;
        this.add.text(centerX, 24, "QR SCAM DODGE", { fontSize: 24, color: "#22d3ee" }).setOrigin(0.5, 0);
        const scoreTxt = this.add.text(16, 16, `Score: ${score}`, { fontSize: 18, color: "#fff" });
        const timerTxt = this.add.text(590, 16, `00:${String(timeLeft).padStart(2, "0")}`, { fontSize: 18, color: "#fff" });

        const spawn = () => {
          const legit = Math.random() < 0.55;
          const size = 28 + Math.random() * 10;
          const y = 90 + Math.random() * 300;
          const x = Math.random() < 0.5 ? -50 : 770;
          const label = this.add.text(x, y, legit ? "🟩 QR" : "🟥 QR", { fontSize: size, color: "#fff" }).setInteractive({ useHandCursor: true });
          const speed = 80 + Math.random() * 90;
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

export default function QRScam() {
  const { user, profile, setProfile } = useUserStore();
  const [popup, setPopup] = useState("");
  const [lastScore, setLastScore] = useState(null);

  const createGame = useCallback((el) => makeGame(el, async (score) => {
    setLastScore(score);
    const delta = Math.max(0, score);
    const badge = score >= 50 ? "QR Slayer" : null;
    const gameMeta = {
      id: "qr-scam-dodge",
      name: "QR Scam Dodge",
      score,
      xp: delta,
      history: [{ score, ts: new Date().toISOString() }],
    };
    if (user) {
      await awardXp({ user, profile, setProfile, delta, badge, game: gameMeta });
      if (delta > 0) showToast(`+${delta} XP earned!`, { type: 'success' });
      if (badge) showToast('QR Slayer unlocked!', { type: 'success' });
    }
    setPopup(score >= 50 ? `Nice! ${score} pts — QR Slayer unlocked!` : `Score ${score} — try for 50+!`);
  }), [user, profile, setProfile]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Mini-Game: QR Scam Dodge</h2>
      <PhaserCanvas createGame={createGame} />
      {lastScore != null && (
        <div className="text-sm text-white/70">Last score: <span className="text-[--color-neon2] font-semibold">{lastScore}</span></div>
      )}
      <MemePopup show={!!popup} text={popup} tone="medium" onClose={() => setPopup("")} />
    </div>
  );
}
