import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { friendlyAuthError } from '../utils/firebaseErrors'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])

  const passwordStrength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    const labels = ['Weak', 'Okay', 'Good', 'Strong', 'Elite']
    return {
      score,
      label: labels[score] || labels[0],
      percent: (score / 4) * 100,
    }
  }, [password])

  const doSignup = async (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      setErr('Enter your name so teammates recognize you.')
      return
    }
    if (!emailValid) {
      setErr('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters long.')
      return
    }
    if (!/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setErr('Use at least one number and one symbol in your password.')
      return
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match.')
      return
    }
    setBusy(true); setErr('')
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      if (name && userCred.user) await updateProfile(userCred.user, { displayName: name })
      navigate('/', { replace: true })
    } catch (e) {
      setErr(friendlyAuthError(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="hero-aurora">
      <div className="mx-auto max-w-md p-6 min-h-[70vh] grid place-items-center">
        <div className="w-full glass rounded-2xl p-6 shadow-lg hover-glow">
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-white/60 text-sm mb-4">Join ScamSlayer and start earning XP and badges.</p>
          <form onSubmit={doSignup} className="space-y-3">
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Display name</span>
              <input
                className="w-full glass px-3 py-2 rounded-lg"
                placeholder="Zara Cyber-Ninja"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Email</span>
              <input
                type="email"
                className="w-full glass px-3 py-2 rounded-lg"
                placeholder="you@email.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full glass px-3 py-2 rounded-lg pr-12"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-white/60 hover:text-white"
                  onClick={()=>setShowPassword((v)=>!v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[--color-neon]" style={{ width: `${passwordStrength.percent}%` }} />
              </div>
              <div className="text-xs text-white/60 mt-1">
                Strength: <span className="font-semibold text-white/80">{passwordStrength.label}</span> — use 12+ characters, numbers & symbols.
              </div>
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Confirm password</span>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full glass px-3 py-2 rounded-lg pr-12"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-white/60 hover:text-white"
                  onClick={()=>setShowConfirm((v)=>!v)}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <div className="text-xs text-white/50">
              By creating an account you agree to uphold ScamSlayer&apos;s community rules and keep your credentials secure.
            </div>
            <div className="flex gap-2">
              <button disabled={busy} className="btn-neon btn-glow rounded-lg flex-1">Create account</button>
            </div>
            {err && <div className="text-sm text-red-400">{err}</div>}
          </form>
          <div className="text-sm mt-4">Already have an account? <Link to="/login" className="text-[--color-neon] underline">Sign in</Link></div>
        </div>
      </div>
    </div>
  )
}
