export default function LeaderboardList({ users = [], usingFallback = false }) {
  const topXp = users.reduce((max, user) => Math.max(max, user?.xp || 0), 0) || 1;
  const tierIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {users.map((u, i) => {
        const xp = u?.xp || 0;
        const ratio = Math.min(100, Math.max(8, Math.round((xp / topXp) * 100)));
        const missions = Array.isArray(u?.missionsCompleted)
          ? u.missionsCompleted.length
          : u?.missionsCompletedCount ?? 0;
        const tag = u?.tagline || (u?.synthetic ? "Team scrim performance" : "");
        const rankIcon = tierIcons[i] || `#${i + 1}`;
        const highlight = i === 0 ? "from-yellow-500/50 via-yellow-400/40 to-yellow-300/30" : i === 1 ? "from-slate-200/40 via-slate-100/30 to-white/20" : i === 2 ? "from-orange-500/30 to-red-400/30" : null;

        return (
          <div
            key={u.id || i}
            className={`glass p-4 rounded-2xl border border-white/10 transition-all ${
              highlight ? `bg-gradient-to-r ${highlight}` : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 grid place-items-center rounded-lg text-lg ${
                  highlight ? "bg-black/20" : "bg-white/10"
                }`}>
                  {rankIcon}
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">{u?.name || "Anon"}</div>
                  {(tag || missions) && (
                    <div className="text-[11px] text-white/60 mt-0.5">
                      {missions ? `${missions} missions cleared` : tag}
                      {missions && tag ? ` · ${tag}` : ""}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[--color-neon2] font-semibold text-sm sm:text-base">{xp} XP</div>
                {u?.synthetic && <div className="text-[10px] uppercase text-white/50">Scrim data</div>}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-3">
              <div className="h-full bg-[--color-neon]" style={{ width: `${ratio}%` }} />
            </div>
          </div>
        );
      })}

      {usingFallback && (
        <div className="text-xs text-white/50 text-center">
          Real players appear here as soon as they gain XP. Keep grinding to dethrone the scrim leaders.
        </div>
      )}
    </div>
  );
}
