import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { friendlyAuthError } from '../utils/firebaseErrors'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const handleReset = async (e) => {
    e?.preventDefault()
    setErr('')
    setDone(false)
    if (!/.+@.+\..+/.test(email)) {
      setErr('Enter the email linked to your ScamSlayer account.')
      return
    }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setDone(true)
    } catch (e) {
      setErr(friendlyAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hero-aurora">
      <div className="mx-auto max-w-md p-6 min-h-[70vh] grid place-items-center">
        <div className="w-full glass rounded-2xl p-6 shadow-lg hover-glow space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Reset password</h2>
            <p className="text-white/60 text-sm">We&apos;ll send you a secure link to set a new password.</p>
          </div>
          <form onSubmit={handleReset} className="space-y-3">
            <label className="block text-sm text-white/70">
              <span className="mb-1 inline-block">Account email</span>
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
            <button disabled={busy} className="btn-neon btn-glow rounded-lg w-full">
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            {err && <div className="text-sm text-red-400">{err}</div>}
            {done && (
              <div className="text-sm text-emerald-300">
                Reset link sent! Check your inbox (and spam) for the password reset email.
              </div>
            )}
          </form>
          <div className="text-xs text-white/60 space-y-2">
            <p>If you signed up with Google, use the Google button on the sign-in screen instead of resetting a password.</p>
            <p>Still stuck? Reach out to the event admin for manual assistance.</p>
          </div>
          <div className="text-sm text-white/70">
            <Link to="/login" className="text-[--color-neon] underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
