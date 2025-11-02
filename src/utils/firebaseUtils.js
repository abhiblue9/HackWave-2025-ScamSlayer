import { doc, updateDoc, setDoc, getDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Award XP and optional badge to the current user.
// Params: { user, profile, setProfile, delta, badge, extra, game, mission }
export async function awardXp({ user, profile, setProfile, delta = 0, badge = null, extra = {}, game = null, mission = null }) {
	if (!user) return;
	const ref = doc(db, "users", user.uid);
	const updates = { xp: increment(delta), lastPlayed: new Date(), ...extra };
	if (badge) updates.badges = arrayUnion(badge);

	if (game?.id) {
		const key = `gameStats.${game.id}`;
		const prev = profile?.gameStats?.[game.id] || {};
		const now = new Date();
		const score = typeof game.score === "number" ? game.score : undefined;
		const streak = typeof game.streak === "number" ? game.streak : undefined;
		const accuracy = typeof game.correct === "number" && typeof game.total === "number" && game.total > 0
			? Math.round((game.correct / game.total) * 100)
			: undefined;
		updates[`${key}.gameName`] = game.name || game.id;
		updates[`${key}.lastPlayedAt`] = now;
		updates[`${key}.playCount`] = increment(1);
		if (typeof game.xp === "number") updates[`${key}.lastXp`] = game.xp;
		if (typeof game.correct === "number") updates[`${key}.lastCorrect`] = game.correct;
		if (typeof game.total === "number") updates[`${key}.lastTotal`] = game.total;
		if (accuracy !== undefined) updates[`${key}.lastAccuracy`] = accuracy;
		if (score !== undefined) {
			updates[`${key}.lastScore`] = score;
			const prevBest = typeof prev.bestScore === "number" ? prev.bestScore : Number.NEGATIVE_INFINITY;
			if (score > prevBest) updates[`${key}.bestScore`] = score;
		}
		if (streak !== undefined) {
			updates[`${key}.lastStreak`] = streak;
			const prevBestStreak = typeof prev.bestStreak === "number" ? prev.bestStreak : Number.NEGATIVE_INFINITY;
			if (streak > prevBestStreak) updates[`${key}.bestStreak`] = streak;
		}
		if (game.perfect) updates[`${key}.perfectRuns`] = increment(1);
		if (Array.isArray(game.history) && game.history.length) updates[`${key}.lastHistory`] = game.history.slice(-5);
	}

	if (mission?.id) {
		const key = `missionStats.${mission.id}`;
		const prev = profile?.missionStats?.[mission.id] || {};
		const now = new Date();
		updates[`${key}.missionName`] = mission.name || mission.id;
		updates[`${key}.missionType`] = mission.type || null;
		updates[`${key}.lastAttemptAt`] = now;
		updates[`${key}.attemptCount`] = increment(1);
		if (typeof mission.delta === "number") updates[`${key}.lastDelta`] = mission.delta;
		if (typeof mission.xp === "number") {
			updates[`${key}.lastXp`] = mission.xp;
			const prevBestXp = typeof prev.bestXp === "number" ? prev.bestXp : Number.NEGATIVE_INFINITY;
			if (mission.xp > prevBestXp) updates[`${key}.bestXp`] = mission.xp;
		}
		if (mission.badge) updates[`${key}.lastBadge`] = mission.badge;
		if (mission.feedback) updates[`${key}.lastFeedback`] = mission.feedback;
		if (typeof mission.success === "boolean") {
			updates[`${key}.lastSuccess`] = mission.success;
			if (mission.success) updates[`${key}.successCount`] = increment(1);
		}
		if (mission.completed) updates[`${key}.completed`] = true;
	}
	try {
		await updateDoc(ref, updates);
	} catch (e) {
		// Create or merge the user document if it doesn't exist
		const base = {
			uid: user.uid,
			name: user.displayName || user.email?.split("@")[0] || "Anon",
			photoURL: user.photoURL || "",
			xp: 0,
			badges: [],
			missionsCompleted: [],
			createdAt: serverTimestamp(),
		};
		await setDoc(ref, { ...base, ...updates }, { merge: true });
	}

	try {
		const snap = await getDoc(ref);
		if (snap.exists() && setProfile) setProfile(snap.data());
	} catch {}

	// Team XP mirror
	try {
		if (profile?.teamId) {
			const teamRef = doc(db, "teams", profile.teamId);
			await updateDoc(teamRef, { xp: increment(delta), lastActive: new Date() });
		}
	} catch {}
}
