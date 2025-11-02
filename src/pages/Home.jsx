import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useMemo } from "react";

export default function Home() {
  const { user, profile } = useUserStore();
  const xp = profile?.xp ?? 0;
  const level = 1 + Math.floor(xp / 250);
  const nextLevelAt = level * 250;
  const pct = Math.min(100, Math.round((xp / nextLevelAt) * 100));
  const missionsDone = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("missions_done") || "[]"); } catch { return []; }
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 relative">
      <div className="aurora-bg" aria-hidden></div>

      <section className="glass hero-aurora p-6 rounded-2xl grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div className="text-sm text-white/70">Welcome{user?`, ${profile?.name || user.email?.split('@')[0]}`:""}!</div>
          <h1 className="text-3xl font-extrabold">Ready to outsmart fraudsters?</h1>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[--color-neon] to-[--color-neon2]" style={{width: pct+"%"}}></div>
          </div>
          <div className="text-sm text-white/70">Level <span className="font-semibold text-white">{level}</span> • {xp} XP</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/missions" className="glass p-4 rounded-xl hover-pop hover-glow">
            <div className="text-xs text-white/60">Progress</div>
            <div className="text-2xl font-bold">{missionsDone.length}/3</div>
            <div className="text-xs text-white/60">Missions</div>
          </Link>
          <Link to="/profile" className="glass p-4 rounded-xl hover-pop hover-glow">
            <div className="text-xs text-white/60">Badges</div>
            <div className="text-2xl font-bold">{(profile?.badges||[]).length}</div>
            <div className="text-xs text-white/60">Earned</div>
          </Link>
          <Link to="/minigames" className="glass p-4 rounded-xl hover-pop hover-glow col-span-2">
            <div className="text-xs text-white/60">Mini Game</div>
            <div className="text-lg font-semibold">Spot the Scam • Play now</div>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-lg font-semibold">Missions</div>
        <div className="grid md:grid-cols-3 gap-3">
          <MissionCard
            title="The Phishing Test"
            diff="Easy"
            xp={150}
            done={missionsDone.includes(0)}
            to="/missions"
          />
          <MissionCard
            title="OTP Guardian"
            diff="Medium"
            xp={200}
            done={missionsDone.includes(1)}
            to="/missions"
          />
          <MissionCard
            title="The Prize Trap"
            diff="Hard"
            xp={250}
            done={missionsDone.includes(2)}
            to="/missions"
          />
        </div>
      </section>
    </div>
  );
}

function MissionCard({ title, diff, xp, done, to }) {
  return (
    <Link to={to} className="glass p-5 rounded-2xl hover-pop hover-glow block">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-white/70">{diff}</div>
        <div className={`text-xs px-2 py-1 rounded-lg ${done?"bg-white/10 text-white/80":"bg-[--color-neon] text-black font-semibold"}`}>
          {done?"Completed":"Start"}
        </div>
      </div>
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-white/60 mt-1">+{xp} XP</div>
    </Link>
  );
}
