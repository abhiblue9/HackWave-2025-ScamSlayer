import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { friendlyAuthError } from '../utils/firebaseErrors'

const REMEMBER_KEY = 'scamslayer:lastEmail'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY)
      if (stored) {
        setEmail(stored)
        setRememberEmail(true)
      }
    } catch (_) {
      // ignore storage access issues (private mode, etc.)
    }
  }, [])

  const emailValid = useMemo(() => {
    if (!email) return false
    return /.+@.+\..+/.test(email)
  }, [email])

  useEffect(() => {
    try {
      if (rememberEmail && emailValid) {
        localStorage.setItem(REMEMBER_KEY, email)
      }
      if (!rememberEmail) {
        localStorage.removeItem(REMEMBER_KEY)
      }
    } catch (_) {
      // silent storage errors
    }
  }, [rememberEmail, email, emailValid])

  const doEmail = async (e) => {
    e?.preventDefault()
    if (!emailValid) {
      setErr('Enter a valid email address.')
      return
    }
    if (!password) {
      setErr('Enter your password.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setErr(friendlyAuthError(e))
    } finally { setBusy(false) }
  }

  const doGoogle = async () => {
    setBusy(true)
    setErr('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate(from, { replace: true })
    } catch (e) {
      setErr(friendlyAuthError(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="hero-aurora">
      <div className="mx-auto max-w-md p-6 min-h-[70vh] grid place-items-center">
        <div className="w-full glass rounded-2xl p-6 shadow-lg hover-glow">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-white/60 text-sm mb-4">Sign in to continue your ScamSlayer journey.</p>
          <form onSubmit={doEmail} className="space-y-3">
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Email</span>
              <input
                type="email"
                className="w-full glass px-3 py-2 rounded-lg"
                placeholder="name@email.com"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </label>
            <div className="flex items-center justify-between text-xs text-white/70">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[--color-neon]"
                  checked={rememberEmail}
                  onChange={(e)=>setRememberEmail(e.target.checked)}
                />
                Remember email
              </label>
              <Link to="/forgot-password" className="text-[--color-neon] hover:underline">Forgot password?</Link>
            </div>
            <div className="flex gap-2">
              <button disabled={busy} className="btn-neon btn-glow rounded-lg flex-1">Sign in</button>
              <button type="button" disabled={busy} onClick={doGoogle} className="px-4 py-2 glass rounded-lg flex-1">Google</button>
            </div>
            {err && <div className="text-sm text-red-400">{err}</div>}
          </form>
          <div className="text-sm mt-4">No account? <Link to="/signup" className="text-[--color-neon] underline">Create one</Link></div>
          <div className="text-xs text-white/50 mt-3">
            Trouble signing in? Ensure you use the same provider you signed up with or reset your password above.
          </div>
        </div>
      </div>
    </div>
  )
}
