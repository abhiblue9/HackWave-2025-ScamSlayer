import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useUserStore } from "../store/userStore";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, onSnapshot, orderBy, query, increment } from "firebase/firestore";

export default function Teams() {
  const { user, profile, setProfile } = useUserStore();
  const [name, setName] = useState("");
  const [teamIdInput, setTeamIdInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "teams"), orderBy("xp", "desc"));
    const unsub = onSnapshot(q, (snap) => setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const createTeam = async () => {
    if (!user) return alert("Sign in first");
    if (!name.trim()) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "teams"), {
        name: name.trim().slice(0, 24),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        xp: 0,
        memberCount: 1,
      });
      await updateDoc(doc(db, "users", user.uid), { teamId: ref.id });
      setProfile({ ...(profile || {}), teamId: ref.id });
      setName("");
    } finally { setBusy(false); }
  };

  const joinTeam = async () => {
    if (!user) return alert("Sign in first");
    const id = teamIdInput.trim();
    if (!id) return;
    setBusy(true);
    try {
      const tref = doc(db, "teams", id);
      const snap = await getDoc(tref);
      if (!snap.exists()) return alert("Team not found");
      await updateDoc(doc(db, "users", user.uid), { teamId: id });
      await updateDoc(tref, { memberCount: increment(1) });
      setProfile({ ...(profile || {}), teamId: id });
      setTeamIdInput("");
    } finally { setBusy(false); }
  };

  const leaveTeam = async () => {
    if (!user || !profile?.teamId) return;
    setBusy(true);
    try {
      const tref = doc(db, "teams", profile.teamId);
      await updateDoc(tref, { memberCount: increment(-1) });
      await updateDoc(doc(db, "users", user.uid), { teamId: null });
      setProfile({ ...(profile || {}), teamId: null });
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h2 className="text-2xl font-bold">Teams</h2>

      {!user && <div className="glass p-3 text-sm text-white/70">Sign in to create or join a team.</div>}

      {user && (
        <div className="glass p-4 space-y-3">
          <div className="text-sm text-white/70">Your team: <span className="text-white">{profile?.teamId || 'None'}</span></div>
          <div className="flex flex-wrap gap-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Team name" className="px-3 py-2 rounded-lg bg-white/10 outline-none" />
            <button disabled={busy} onClick={createTeam} className="btn-neon">Create Team</button>
            <input value={teamIdInput} onChange={(e)=>setTeamIdInput(e.target.value)} placeholder="Team ID" className="px-3 py-2 rounded-lg bg-white/10 outline-none" />
            <button disabled={busy} onClick={joinTeam} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Join</button>
            {profile?.teamId && (
              <button disabled={busy} onClick={leaveTeam} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Leave</button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Team Leaderboard</h3>
        <div className="space-y-2">
          {teams.map((t, i) => (
            <div key={t.id} className="glass p-3 flex items-center justify-between hover-pop hover-glow">
              <div className="flex items-center gap-3">
                <div className="w-8 text-center text-sm text-white/70">#{i + 1}</div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-white/40">ID: {t.id}</div>
              </div>
              <div className="text-[--color-neon2] font-semibold">{t.xp || 0} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
