import { useMemo, useState } from "react";
import { useUserStore } from "../store/userStore";
import ShareModal from "../components/ShareModal";
import { missionDefs } from "../data/missions";

const BADGE_LIBRARY = {
  "Careful Clicker": { emoji: "🛑", desc: "Paused before tapping shady links." },
  "Link Detective": { emoji: "🕵️", desc: "Verified sender details like a pro." },
  "OTP Guardian": { emoji: "🔐", desc: "Protected OTPs from imposters." },
  "Friend or Foe": { emoji: "🤔", desc: "Double-checked the 'urgent' friend call." },
  "UPI Warrior": { emoji: "🛡️", desc: "Blocked fraudulent UPI requests." },
  "Scam Spotter": { emoji: "🕵️‍♀️", desc: "Nailed the scam quiz." },
  "Security Pro": { emoji: "🧰", desc: "Enabled 2FA like a legend." },
  "Email Inspector": { emoji: "📬", desc: "Flagged sus emails instantly." },
  "Link Sniper": { emoji: "🎯", desc: "Only clicked legit URLs." },
  "QR Slayer": { emoji: "🧾⚡", desc: "Dodged fake QR codes." },
  "Password Blacksmith": { emoji: "🛠️", desc: "Crafted an elite password." },
  "Call Shield": { emoji: "📞", desc: "Walled off phone phishers." },
  "Hype Buster": { emoji: "📉", desc: "Ignored guaranteed-return traps." },
  "Job Watch": { emoji: "💼", desc: "Spotted shady job offers." },
  "Parcel Patroller": { emoji: "📦", desc: "Refused delivery-fee scams." },
  "Heart Guard": { emoji: "❤️", desc: "Protected wallet from romance scams." },
  "Deal Detective": { emoji: "🛍️", desc: "Verified deals before paying." },
  "Profile Guardian": { emoji: "🔒", desc: "Locked down social settings." },
  "Inbox Inspector": { emoji: "📧", desc: "Sorted scam emails like a beast." }
};

export default function Profile() {
  const { user, profile } = useUserStore();
  const [share, setShare] = useState("");
  const badges = profile?.badges || [];
  const earned = useMemo(() => new Set(badges), [badges]);
  const xp = profile?.xp ?? 0;
  const level = 1 + Math.floor(xp / 250);
  const levelBase = (level - 1) * 250;
  const levelCap = level * 250;
  const progress = levelCap === levelBase ? 0 : Math.min(100, Math.round(((xp - levelBase) / (levelCap - levelBase)) * 100));
  const lastBadge = badges.length ? badges[badges.length - 1] : null;
  const joinDate = profile?.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000) : null;
  const missionsCompleted = Array.isArray(profile?.missionsCompleted) ? profile.missionsCompleted : [];
  const missionProgress = missionDefs.length ? Math.round((missionsCompleted.length / missionDefs.length) * 100) : 0;
  const recentMissions = missionsCompleted.slice(-4).reverse();
  const gameStats = useMemo(() => {
    if (!profile?.gameStats) return [];
    return Object.entries(profile.gameStats).map(([id, data = {}]) => {
      const raw = data.lastPlayedAt;
      const lastPlayedAt = raw?.seconds
        ? new Date(raw.seconds * 1000)
        : typeof raw?.toDate === "function"
          ? raw.toDate()
          : raw instanceof Date
            ? raw
            : null;
      return {
        id,
        name: data.gameName || id,
        lastScore: data.lastScore ?? null,
        bestScore: data.bestScore ?? null,
        playCount: data.playCount ?? 0,
        lastAccuracy: data.lastAccuracy ?? null,
        lastStreak: data.lastStreak ?? null,
        bestStreak: data.bestStreak ?? null,
        lastXp: data.lastXp ?? null,
        lastPlayedAt,
      };
    }).sort((a, b) => {
      const aTime = a.lastPlayedAt ? a.lastPlayedAt.getTime() : 0;
      const bTime = b.lastPlayedAt ? b.lastPlayedAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [profile?.gameStats]);
  const missionStats = useMemo(() => {
    if (!profile?.missionStats) return [];
    return Object.entries(profile.missionStats).map(([id, data = {}]) => {
      const raw = data.lastAttemptAt;
      const lastAttemptAt = raw?.seconds
        ? new Date(raw.seconds * 1000)
        : typeof raw?.toDate === "function"
          ? raw.toDate()
          : raw instanceof Date
            ? raw
            : null;
      return {
        id,
        name: data.missionName || id,
        type: data.missionType || "mission",
        attemptCount: data.attemptCount ?? 0,
        successCount: data.successCount ?? 0,
        lastSuccess: data.lastSuccess ?? null,
        lastDelta: data.lastDelta ?? null,
        lastXp: data.lastXp ?? null,
        bestXp: data.bestXp ?? null,
        lastBadge: data.lastBadge ?? null,
        lastFeedback: data.lastFeedback ?? null,
        completed: !!data.completed,
        lastAttemptAt,
      };
    }).sort((a, b) => {
      const aTime = a.lastAttemptAt ? a.lastAttemptAt.getTime() : 0;
      const bTime = b.lastAttemptAt ? b.lastAttemptAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [profile?.missionStats]);

  const badgeEntries = useMemo(() => {
    const libraryEntries = Object.entries(BADGE_LIBRARY);
    const unknownEarned = badges.filter((b) => !BADGE_LIBRARY[b]);
    return [
      ...libraryEntries,
      ...unknownEarned.map((b) => [b, { emoji: "🏅", desc: "Exclusive event badge." }])
    ];
  }, [badges]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Profile</h2>
      </div>

      {!user && (
        <div className="glass p-5 text-sm text-white/70">
          Sign in to view and save your progress.
        </div>
      )}

      {user && (
        <div className="glass p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="pfp" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 grid place-items-center text-xl font-semibold">
              {(profile?.name || user.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 space-y-1">
            <div className="text-lg font-semibold">{profile?.name || user.displayName || user.email}</div>
            <div className="text-white/60 text-sm">{user.email}</div>
            {joinDate && (
              <div className="text-white/50 text-xs">Joined {joinDate.toLocaleDateString()}</div>
            )}
          </div>
        </div>
      )}

      {user && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">Level</div>
              <div className="text-white text-lg font-semibold">{level}</div>
            </div>
            <div className="text-sm text-white/70">XP {xp} / {levelCap}</div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[--color-neon]" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-white/60">{levelCap - xp} XP to next level</div>
          </div>

          <div className="glass p-4 space-y-2">
            <div className="text-sm text-white/60">Badges unlocked</div>
            <div className="text-3xl font-bold text-[--color-neon2]">{badges.length}</div>
            <div className="text-xs text-white/60">Keep grinding missions & games to flex your collection.</div>
          </div>

          <div className="glass p-4 space-y-2">
            <div className="text-sm text-white/60">Last badge</div>
            <div className="text-lg font-semibold">{lastBadge || "No badges yet"}</div>
            {lastBadge && <div className="text-xs text-white/60">Share your win or grind another mission.</div>}
          </div>

          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">Missions cleared</div>
              <div className="text-white text-lg font-semibold">{missionsCompleted.length}</div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[--color-neon]" style={{ width: `${missionProgress}%` }} />
            </div>
            <div className="text-xs text-white/60">
              {missionsCompleted.length
                ? `Completed ${missionsCompleted.length} of ${missionDefs.length} ops.`
                : "Crack your first mission to start the streak."}
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Badge Cabinet</h3>
            <div className="text-xs text-white/60">Unlocked badges glow — others show what to aim for.</div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badgeEntries.map(([name, info]) => {
              const unlocked = earned.has(name);
              return (
                <div
                  key={name}
                  className={`glass p-4 rounded-xl transition-all ${unlocked ? "border border-[--color-neon]/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]" : "opacity-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{info.emoji}</span>
                    {unlocked && (
                      <button
                        className="text-xs px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20"
                        onClick={() => setShare(name)}
                      >
                        Share
                      </button>
                    )}
                  </div>
                  <div className="mt-3 font-semibold">{name}</div>
                  <div className="text-xs text-white/60 mt-1">{info.desc}</div>
                  {!unlocked && <div className="text-[10px] uppercase tracking-wide mt-3 text-white/40">Locked</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {user && (
        <div className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Mission Log</h3>
            <div className="text-xs text-white/60">
              {missionsCompleted.length ? `Latest ${Math.min(4, missionsCompleted.length)} completions` : "Finish missions to build your log."}
            </div>
          </div>
          {missionsCompleted.length === 0 ? (
            <div className="text-sm text-white/60">No missions cleared yet. Visit the Missions hub to begin.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {recentMissions.map((missionId) => {
                const meta = missionDefs.find((mission) => mission.id === missionId);
                return (
                  <div key={missionId} className="glass p-4 rounded-xl border border-white/10">
                    <div className="text-sm font-semibold">{meta?.title || missionId}</div>
                    <div className="text-xs text-white/60 mt-1 line-clamp-2">{meta?.summary || "Mission complete."}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Mission Stats</h3>
            <div className="text-xs text-white/60">
              {missionStats.length ? "Latest mission outcomes and streaks." : "Complete missions to populate stats."}
            </div>
          </div>
          {missionStats.length === 0 ? (
            <div className="text-sm text-white/60">No mission attempts recorded yet. Clear your first mission in Mission Control.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {missionStats.map((mission) => {
                const attemptLabel = mission.lastAttemptAt ? mission.lastAttemptAt.toLocaleString() : "—";
                const successRate = mission.attemptCount > 0
                  ? Math.round((mission.successCount / mission.attemptCount) * 100)
                  : 0;
                return (
                  <div key={mission.id} className="glass p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{mission.name}</div>
                      {mission.completed && (
                        <span className="text-[10px] uppercase tracking-wide text-emerald-300">Cleared</span>
                      )}
                    </div>
                    <div className="text-xs text-white/60">
                      Attempts {mission.attemptCount} · Success {mission.successCount} · Rate {successRate}%
                    </div>
                    <div className="text-xs text-white/60">
                      {mission.lastXp != null ? `Last XP ${mission.lastXp}` : "XP pending"}
                      {mission.bestXp != null && <span className="ml-1 text-white/50">(PB {mission.bestXp})</span>}
                    </div>
                    {mission.lastBadge && (
                      <div className="text-xs text-[--color-neon2]">Badge: {mission.lastBadge}</div>
                    )}
                    {mission.lastFeedback && (
                      <div className="text-[11px] text-white/50">{mission.lastFeedback}</div>
                    )}
                    <div className="text-[11px] text-white/50">Last attempt {attemptLabel}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Arcade Stats</h3>
            <div className="text-xs text-white/60">
              {gameStats.length ? "Your latest runs across ScamSlayer arcade." : "Play any arcade game to populate your stats."}
            </div>
          </div>
          {gameStats.length === 0 ? (
            <div className="text-sm text-white/60">No arcade scores recorded yet. Jump into OTP Rush, Link Sniper, or missions to get rolling.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {gameStats.map((stat) => {
                const playedLabel = stat.lastPlayedAt ? stat.lastPlayedAt.toLocaleString() : "—";
                return (
                  <div key={stat.id} className="glass p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{stat.name}</div>
                      {stat.lastScore != null && (
                        <div className="text-xs text-[--color-neon2] font-semibold">Last {stat.lastScore}</div>
                      )}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-white/40">Plays {stat.playCount}</div>
                    <div className="text-xs text-white/60">
                      {stat.bestScore != null && <span>PB {stat.bestScore}</span>}
                      {stat.bestScore != null && (stat.lastAccuracy != null || stat.bestStreak != null) && <span className="mx-1">•</span>}
                      {stat.lastAccuracy != null && <span>Accuracy {stat.lastAccuracy}%</span>}
                      {stat.lastAccuracy != null && stat.bestStreak != null && <span className="mx-1">•</span>}
                      {stat.bestStreak != null && <span>Max Streak {stat.bestStreak}</span>}
                      {stat.bestScore == null && stat.lastAccuracy == null && stat.bestStreak == null && <span>Keep playing to build streaks.</span>}
                    </div>
                    <div className="text-[11px] text-white/50">Last played {playedLabel}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="glass p-5 space-y-3">
          <h3 className="text-xl font-semibold">Tips to level up faster</h3>
          <ul className="text-sm text-white/70 space-y-2 list-disc list-inside">
            <li>Complete the daily mission and claim the security tip for bonus XP.</li>
            <li>Play arcade games like OTP Rush or Phishing Inbox to stack combo badges.</li>
            <li>Join a team to contribute XP together and climb the leaderboard.</li>
          </ul>
        </div>
      )}

      <ShareModal open={!!share} badgeName={share} onClose={() => setShare("")} />
    </div>
  );
}
