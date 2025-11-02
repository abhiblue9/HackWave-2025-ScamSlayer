import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ChatScenario from "../components/ChatScenario";
import MemePopup from "../components/MemePopup";
import Confetti from "../components/Confetti";
import BadgePopup from "../components/BadgePopup";
import ShareProgress from "../components/ShareProgress";
import MiniGame from "./MiniGame";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../store/userStore";
import { useSfx } from "../hooks/useSfx";
import { showToast } from "../utils/toast";
import { awardXp } from "../utils/firebaseUtils";
import { missionDefs } from "../data/missions";

// Rotate spotlight mission daily based on date, but still respect completion streaks.
const getDailyIndex = (array) => {
  if (!array?.length) return 0;
  const today = new Date();
  return Math.floor((today.getTime() / (1000 * 60 * 60 * 24)) % array.length);
};

const initialMissionId = missionDefs.length
  ? missionDefs[getDailyIndex(missionDefs)]?.id ?? missionDefs[0]?.id ?? null
  : null;

export default function Missions() {
  const [xp, setXp] = useState(0);
  const [activeMissionId, setActiveMissionId] = useState(initialMissionId);
  const [popup, setPopup] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(null);
  const [localCompleted, setLocalCompleted] = useState([]);

  const { user, profile, setProfile } = useUserStore();
  const { success, fail } = useSfx();

  // Keep mission progress in sync with Firestore profile, but fall back to single read during bootstrap.
  useEffect(() => {
    if (!user) return;
    try {
      setError(null);
      if (profile) {
        setXp(profile.xp || 0);
        setBadges(Array.isArray(profile.badges) ? profile.badges : []);
        setLocalCompleted(Array.isArray(profile.missionsCompleted) ? profile.missionsCompleted : []);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Ignore snapshot race conditions; fallback getDoc below will pick things up.
    }

    (async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const userDoc = await getDoc(ref);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setXp(data.xp || 0);
          setBadges(Array.isArray(data.badges) ? data.badges : []);
          setLocalCompleted(Array.isArray(data.missionsCompleted) ? data.missionsCompleted : []);
        } else {
          await setDoc(ref, {
            uid: user.uid,
            xp: 0,
            badges: [],
            missionsCompleted: [],
            createdAt: serverTimestamp(),
          }, { merge: true });
          setXp(0);
          setBadges([]);
          setLocalCompleted([]);
        }
        setLoading(false);
      } catch (err) {
        console.warn("Progress fetch failed, relying on live snapshot:", err);
        setLoading(false);
      }
    })();
  }, [user, profile]);

  useEffect(() => {
    if (profile && error) setError(null);
  }, [profile, error]);

  useEffect(() => {
    const onErr = (event) => {
      try {
        const message = event?.message || (event?.error && event.error.message) || String(event);
        console.error("Global error captured:", event);
        setError(message);
      } catch (e) {
        setError("Unknown runtime error");
      }
    };
    const onRejection = (ev) => {
      try {
        const reason = ev?.reason?.message || JSON.stringify(ev?.reason) || String(ev);
        console.error("Unhandled rejection:", ev);
        setError(`Unhandled promise rejection: ${reason}`);
      } catch (e) {
        setError("Unhandled promise rejection");
      }
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (!missionDefs.length) return;
    const completedSet = new Set(localCompleted);
    const firstIncomplete = missionDefs.find((mission) => !completedSet.has(mission.id));

    if (!activeMissionId && firstIncomplete) {
      setActiveMissionId(firstIncomplete.id);
      return;
    }

    if (activeMissionId && !firstIncomplete && !missionDefs.some((m) => m.id === activeMissionId)) {
      setActiveMissionId(missionDefs[0]?.id ?? null);
    }

    if (activeMissionId && completedSet.has(activeMissionId) && firstIncomplete) {
      setActiveMissionId((prev) => (prev === firstIncomplete.id ? prev : firstIncomplete.id));
    }
  }, [activeMissionId, localCompleted]);

  const completedSet = useMemo(() => new Set(localCompleted.filter(Boolean)), [localCompleted]);
  const completedCount = completedSet.size;
  const totalMissions = missionDefs.length;
  const progressPercent = totalMissions ? Math.round((completedCount / totalMissions) * 100) : 0;
  const allCleared = totalMissions > 0 && completedCount >= totalMissions;
  const featuredMissionId = missionDefs.length
    ? missionDefs[getDailyIndex(missionDefs)]?.id ?? missionDefs[0]?.id ?? null
    : null;

  const activeMission = missionDefs.find((mission) => mission.id === activeMissionId) ?? missionDefs[0] ?? null;
  const missionCleared = activeMission ? completedSet.has(activeMission.id) : false;

  const updateProgress = async (deltaXP, newBadge, extra = {}, missionMeta = null) => {
    if (!user) return;
    try {
      await awardXp({ user, profile, setProfile, delta: deltaXP, badge: newBadge || null, extra, mission: missionMeta });
      if (deltaXP > 0) showToast(`+${deltaXP} XP earned!`, { type: "success" });
      else if (deltaXP < 0) showToast(`${deltaXP} XP penalty`, { type: "warning" });
      if (newBadge) showToast(`${newBadge} unlocked!`, { type: "success" });
    } catch (err) {
      console.error("Error updating progress:", err);
      setError("Failed to save progress");
    }
  };

  const handleResult = async (result, mission) => {
    if (!result) return;
    try {
      const delta = Number.isFinite(result.deltaXP) ? result.deltaXP : 0;
      const badge = result?.badge || null;
      const missionId = mission?.id;
      const alreadyCleared = missionId ? completedSet.has(missionId) : false;

      if (alreadyCleared && delta > 0) {
        setPopup("Mission already cleared. Pick a fresh challenge!");
        return;
      }

      setXp((x) => Math.max(0, x + delta));
      setPopup(result?.feedback || "");
      if (delta > 0) {
        setConfetti(true);
        success();
      } else if (delta < 0) {
        fail();
      }

      if (badge) {
        setBadges((prev) => (prev.includes(badge) ? prev : [...prev, badge]));
        setShowBadgePopup(badge);
      }

      let extra = {};
      const missionMeta = missionId ? {
        id: missionId,
        name: mission?.title,
        type: mission?.type,
        badge,
        feedback: result?.feedback,
        xp: delta > 0 ? delta : 0,
        delta,
        success: delta > 0,
        completed: delta > 0 && !alreadyCleared,
      } : null;
      if (missionId && delta > 0 && !alreadyCleared) {
        extra = { missionsCompleted: arrayUnion(missionId) };
        setLocalCompleted((prev) => (prev.includes(missionId) ? prev : [...prev, missionId]));
      }

  if (user) await updateProgress(delta, badge, extra, missionMeta);

      if (delta > 0 && missionId) {
        const afterComplete = new Set([...completedSet, missionId]);
        const nextMission = missionDefs.find((m) => !afterComplete.has(m.id));
        if (nextMission) {
          setTimeout(() => setActiveMissionId(nextMission.id), 500);
        }
      }
    } catch (err) {
      console.error("Error handling result:", err);
      setError("An error occurred while processing the result.");
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-200">Error Loading Missions</h3>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="glass h-8 w-40 animate-pulse" />
        <div className="grid gap-3">
          <div className="glass h-20 animate-pulse" />
          <div className="glass h-24 animate-pulse" />
          <div className="glass h-24 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!activeMission) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="glass p-5 text-center text-sm text-white/70">
          Mission catalog unavailable. Please try again shortly.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Mission Control</h2>
          <p className="text-sm text-white/60">Beat curated scam scenarios once. New drills rotate daily.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wide text-white/50">XP</div>
            <div className="text-lg font-semibold text-[--color-neon2]">{xp}</div>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Share progress"
            type="button"
          >
            📤
          </button>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {badges.map((badge, i) => (
            <div
              key={badge}
              className="flex-shrink-0 px-3 py-1.5 bg-[--color-neon]/20 rounded-full border border-[--color-neon]/30 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <span className="text-sm">🏆 {badge}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Mission streak</span>
              <span>{completedCount}/{totalMissions}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[--color-neon] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-white/50">
              {allCleared
                ? "All missions cleared! Fresh ops drop tomorrow."
                : `${Math.max(totalMissions - completedCount, 0)} missions left to complete the set.`}
            </div>
          </div>

          <div className="space-y-2">
            {missionDefs.map((mission) => {
              const done = completedSet.has(mission.id);
              const isActive = mission.id === activeMission.id;
              const spotlight = mission.id === featuredMissionId;
              return (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => setActiveMissionId(mission.id)}
                  className={`glass w-full text-left p-3 rounded-xl transition-all border ${
                    isActive ? "border-[--color-neon] shadow-[0_0_16px_rgba(34,211,238,0.25)]" : "border-transparent hover:border-white/20"
                  } ${done ? "opacity-70" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{mission.title}</div>
                    <span className={`text-[10px] uppercase tracking-wide ${done ? "text-[--color-neon]" : "text-white/60"}`}>
                      {done ? "Cleared" : mission.type}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">{mission.summary}</div>
                  {spotlight && (
                    <div className="text-[10px] text-[--color-neon2] mt-2 tracking-wide uppercase">Daily spotlight</div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="space-y-4">
          <div className="glass p-5 space-y-4 rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-white/50">{activeMission.type} mission</div>
                <h3 className="text-2xl font-semibold mt-1">{activeMission.title}</h3>
              </div>
              {missionCleared && (
                <div className="px-3 py-1 rounded-lg bg-[--color-neon]/20 text-[--color-neon] text-xs font-semibold uppercase">Cleared</div>
              )}
            </div>
            <p className="text-sm text-white/70">{activeMission.summary}</p>

            {missionCleared && (
              <div className="glass border border-[--color-neon]/30 bg-[--color-neon]/10 text-[--color-neon] text-xs font-semibold px-3 py-2 rounded-lg">
                Mission complete. Check another challenge or flex on the leaderboard.
              </div>
            )}

            {activeMission.type === "chat" && (
              <ChatScenario
                scenario={activeMission.data}
                disabled={missionCleared}
                onResult={(result) => handleResult(result, activeMission)}
              />
            )}

            {activeMission.type === "quiz" && (
              <div className="space-y-3">
                <div className="glass p-4">
                  <div className="font-medium mb-2">{activeMission.data.question}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeMission.data.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={missionCleared}
                        className={`glass px-3 py-2 text-left ${missionCleared ? "opacity-60 cursor-not-allowed" : "hover:bg-white/20"}`}
                        onClick={() => handleResult(choice.result, activeMission)}
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                  {activeMission.data.tip && (
                    <div className="mt-3 text-sm text-white/70">Tip: {activeMission.data.tip}</div>
                  )}
                </div>
              </div>
            )}

            {activeMission.type === "interactive" && (
              <div className="space-y-3">
                <div className="glass p-4">
                  {activeMission.data.description && (
                    <div className="font-medium mb-2">{activeMission.data.description}</div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeMission.data.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={missionCleared}
                        className={`glass px-3 py-2 text-left ${missionCleared ? "opacity-60 cursor-not-allowed" : "hover:bg-white/20"}`}
                        onClick={() => handleResult(choice.result, activeMission)}
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                  {activeMission.data.tip && (
                    <div className="mt-3 text-sm text-white/70">Tip: {activeMission.data.tip}</div>
                  )}
                </div>
              </div>
            )}

            {activeMission.type === "dailyTip" && (
              <div className="glass p-4 space-y-3">
                <div className="font-medium">{activeMission.data.title}</div>
                <div className="text-sm text-white/70">{activeMission.data.content}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-lg ${missionCleared ? "bg-white/10 cursor-not-allowed opacity-60" : "bg-[--color-neon]"}`}
                    disabled={missionCleared}
                    onClick={() => handleResult(activeMission.data.reward, activeMission)}
                  >
                    Claim reward
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                    onClick={() => {
                      const idx = missionDefs.findIndex((mission) => mission.id === activeMission.id);
                      const next = missionDefs[(idx + 1) % missionDefs.length];
                      setActiveMissionId(next?.id ?? activeMission.id);
                    }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {activeMission.type === "game" && (
              <div className="space-y-3">
                <div className="glass p-4 space-y-3">
                  <div className="font-medium">Play OTP Rush inside Missions</div>
                  <div className="text-sm text-white/70">
                    Rack up points, then claim the mission reward once you're done. The mini-game grants bonus XP based on score.
                  </div>
                  <MiniGame />
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/mini-game"
                      className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm"
                    >
                      Open in full view
                    </Link>
                    <button
                      type="button"
                      disabled={missionCleared}
                      className={`px-3 py-2 rounded-lg ${missionCleared ? "bg-white/10 cursor-not-allowed opacity-60" : "bg-[--color-neon]"}`}
                      onClick={() => handleResult(activeMission.data.reward, activeMission)}
                    >
                      Claim mission reward
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!user && (
            <div className="text-xs text-white/60">Sign in to lock in XP and appear on the leaderboard.</div>
          )}

          {allCleared && (
            <div className="glass border border-[--color-neon]/20 p-4 text-center text-sm text-[--color-neon]">
              You cleared every drill—legend status unlocked. Check back tomorrow for fresh ops or grind the arcade mini-games meanwhile.
            </div>
          )}
        </main>
      </div>

      <MemePopup show={!!popup} text={popup} tone="medium" onClose={() => setPopup("")} />
      <Confetti show={confetti} onDone={() => setConfetti(false)} />
      {showBadgePopup && <BadgePopup badge={showBadgePopup} onClose={() => setShowBadgePopup(null)} />}
      {showShare && <ShareProgress xp={xp} badges={badges} onClose={() => setShowShare(false)} />}
    </div>
  );
}
