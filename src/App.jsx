import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
const Home = lazy(() => import('./pages/Home'))
const Missions = lazy(() => import('./pages/Missions'))
const MiniGame = lazy(() => import('./pages/MiniGame'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Teams = lazy(() => import('./pages/Teams'))
const Games = lazy(() => import('./pages/Games'))
const PasswordForge = lazy(() => import('./pages/PasswordForge'))
const CallShield = lazy(() => import('./pages/CallShield'))
const InvestScam = lazy(() => import('./pages/InvestScam'))
const JobWatch = lazy(() => import('./pages/JobWatch'))
const ParcelPhish = lazy(() => import('./pages/ParcelPhish'))
const RomanceRedFlags = lazy(() => import('./pages/RomanceRedFlags'))
const DealDetective = lazy(() => import('./pages/DealDetective'))
const ProfileLock = lazy(() => import('./pages/ProfileLock'))
const PhishingInbox = lazy(() => import('./pages/PhishingInbox'))
const LinkSniper = lazy(() => import('./pages/LinkSniper'))
const QRScam = lazy(() => import('./pages/QRScam'))
const QuizSpot = lazy(() => import('./pages/QuizSpot'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
import RequireAuth from './components/RequireAuth'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div key={location.pathname} className="animate-fade-in">
        <ErrorBoundary>
          <Suspense fallback={<div className="mx-auto max-w-6xl p-6"><div className="glass p-6 animate-pulse">Loading…</div></div>}>
            <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route path="/missions" element={<RequireAuth><Missions /></RequireAuth>} />
            <Route path="/minigame" element={<RequireAuth><MiniGame /></RequireAuth>} />
            {/* New Games hub */}
            <Route path="/games" element={<RequireAuth><Games /></RequireAuth>} />
            <Route path="/games/otp" element={<RequireAuth><MiniGame /></RequireAuth>} />
            <Route path="/games/linksniper" element={<RequireAuth><LinkSniper /></RequireAuth>} />
            <Route path="/games/qr" element={<RequireAuth><QRScam /></RequireAuth>} />
            <Route path="/games/password" element={<RequireAuth><PasswordForge /></RequireAuth>} />
            <Route path="/games/callshield" element={<RequireAuth><CallShield /></RequireAuth>} />
            <Route path="/games/invest" element={<RequireAuth><InvestScam /></RequireAuth>} />
            <Route path="/games/jobwatch" element={<RequireAuth><JobWatch /></RequireAuth>} />
            <Route path="/games/parcel" element={<RequireAuth><ParcelPhish /></RequireAuth>} />
            <Route path="/games/romance" element={<RequireAuth><RomanceRedFlags /></RequireAuth>} />
            <Route path="/games/dealdetective" element={<RequireAuth><DealDetective /></RequireAuth>} />
            <Route path="/games/profilelock" element={<RequireAuth><ProfileLock /></RequireAuth>} />
            <Route path="/games/inbox" element={<RequireAuth><PhishingInbox /></RequireAuth>} />

            {/* Backward compatibility with old /minigames paths */}
            <Route path="/minigames" element={<RequireAuth><Games /></RequireAuth>} />
            <Route path="/minigames/otp" element={<RequireAuth><MiniGame /></RequireAuth>} />
            <Route path="/minigames/linksniper" element={<RequireAuth><LinkSniper /></RequireAuth>} />
            <Route path="/minigames/qr" element={<RequireAuth><QRScam /></RequireAuth>} />
            <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
            <Route path="/teams" element={<RequireAuth><Teams /></RequireAuth>} />
            <Route path="/quiz" element={<RequireAuth><QuizSpot /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
  <Toast />
        </div>
      </main>
    </div>
  )
}

export default App
