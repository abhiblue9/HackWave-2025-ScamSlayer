import { useLocation, Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function RequireAuth({ children }) {
  const { user, authReady } = useUserStore()
  const location = useLocation()
  // While auth state is initializing, don't redirect; show a minimal splash/loading
  if (!authReady) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-white/70 animate-pulse">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
