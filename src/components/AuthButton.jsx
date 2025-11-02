import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../store/userStore";
import { friendlyAuthError } from "../utils/firebaseErrors";

export default function AuthButton() {
  const { user, setUser, setProfile, setAuthReady } = useUserStore();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Subscribe to auth state and keep a real-time subscription to user's Firestore doc
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      // Mark auth ready immediately to avoid gate delays; we'll update profile via snapshot below
      setAuthReady(true);
      // Clean up any previous snapshot subscription by returning in outer cleanup
      if (!u) {
        setProfile(null);
        return;
      }

      const ref = doc(db, "users", u.uid);

      // Ensure document exists
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: u.uid,
          name: u.displayName || u.email?.split("@")[0] || "Anon",
          photoURL: u.photoURL || "",
          xp: 0,
          badges: [],
          missionsCompleted: [],
          createdAt: serverTimestamp(),
        });
      }

      // Subscribe to real-time updates on the user doc so profile stays in sync
      const unsubSnap = onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) setProfile(docSnap.data());
        else setProfile(null);
      }, (err) => {
        console.error('User snapshot error:', err);
      });

      // When auth changes or effect cleans up, unsubscribe snapshot
      // We return nothing here because outer cleanup will call unsubAuth and we need to ensure unsubSnap is cleaned there.
      // Store unsubSnap on the auth unsubscribe closure via a property so cleanup can access it.
      (unsubAuth)._unsubSnap = unsubSnap;
    });

    return () => {
      try {
        // If the auth unsubscribe has an attached snapshot unsub, call it
        if (unsubAuth && typeof unsubAuth._unsubSnap === 'function') unsubAuth._unsubSnap();
      } catch (e) {}
      try { unsubAuth(); } catch (e) {}
    };
  }, [setUser, setProfile, setAuthReady]);

  const google = async () => {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setErr("");
    } catch (e) {
      setErr(friendlyAuthError(e));
    } finally { setBusy(false); }
  };

  const emailFlow = async () => {
    const email = window.prompt("Email"); if (!email) return;
    const password = window.prompt("Password (min 6 chars)"); if (!password) return;
    setBusy(true);
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setErr("");
    } catch (e) {
      setErr(friendlyAuthError(e));
    } finally { setBusy(false); }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button disabled={busy} onClick={google} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Sign in</button>
        <button disabled={busy} onClick={emailFlow} className="px-3 py-1.5 rounded-lg bg-[--color-neon] text-sm">Email</button>
        {err && <div className="text-xs text-red-400 max-w-[220px]">{err}</div>}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <img src={user.photoURL} alt="pfp" className="w-7 h-7 rounded-full" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs">{(user.email||"?")[0].toUpperCase()}</div>
      )}
      <button disabled={busy} onClick={() => signOut(auth)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Sign out</button>
      {err && <div className="text-xs text-red-400 max-w-[220px]">{err}</div>}
    </div>
  );
}
