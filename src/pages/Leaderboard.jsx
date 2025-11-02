import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import LeaderboardList from "../components/LeaderboardList";

const FALLBACK_ROWS = [
  { id: "ghost-cyberninja", name: "CyberNinja", xp: 2450, missionsCompletedCount: 18, tagline: "Zero-click nemesis", synthetic: true },
  { id: "ghost-phantombyte", name: "PhantomByte", xp: 2310, missionsCompletedCount: 17, tagline: "Daily streak: 14", synthetic: true },
  { id: "ghost-scamslayer", name: "ScamSlayer", xp: 2310, missionsCompletedCount: 17, tagline: "Level 9 Defender", synthetic: true },
  { id: "ghost-packetpirates", name: "Packet Pirates", xp: 2245, missionsCompletedCount: 16, tagline: "Team Firewall captain", synthetic: true },
  { id: "ghost-spamurai", name: "Spamurai", xp: 2200, missionsCompletedCount: 15, tagline: "Inbox sweep speedrun", synthetic: true },
  { id: "ghost-bytebuster", name: "ByteBuster", xp: 2200, missionsCompletedCount: 15, tagline: "Tied for top 5", synthetic: true }
];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      // Map docs and de-duplicate by uid/id to avoid any accidental duplicates
      const seen = new Set();
      const list = [];
      for (const d of snap.docs) {
        const data = { id: d.id, ...d.data() };
        const key = data.uid || d.id;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(data);
      }
      const combined = list.slice();
      let fallbackUsed = false;
      if (combined.length < 6) {
        fallbackUsed = true;
        combined.push(...FALLBACK_ROWS.slice(0, 6 - combined.length));
      }
      combined.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setRows(combined);
      setUsingFallback(fallbackUsed);
      setLoading(false);
      setError("");
    }, (err) => {
      console.error('Leaderboard snapshot error:', err);
      setError("Failed to load leaderboard.");
      setUsingFallback(false);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Leaderboard</h2>
      {loading && <div className="glass p-4 animate-pulse">Loading leaderboard…</div>}
      {error && !loading && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm">{error}</div>
      )}
      {!loading && !error && (
        <>
          {usingFallback && (
            <div className="glass p-3 text-xs text-white/60">
              Waiting for real match data? We seeded the board with scrim legends so the race already looks intense. Earn XP to replace them.
            </div>
          )}
          <LeaderboardList users={rows} usingFallback={usingFallback} />
        </>
      )}
    </div>
  );
}
