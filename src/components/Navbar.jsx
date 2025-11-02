import { Link, NavLink, useLocation } from "react-router-dom";
import { Shield, Gamepad2, Crown, Home, User, Users } from "lucide-react";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";
import { prefetchRoute } from "../utils/prefetchRoutes";
import { useEffect } from "react";

export default function Navbar() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors nav-underline hover-pop ${
      isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
    }`;

  // Prefetch common routes on first mount to speed first navigation
  useEffect(() => {
    if (!isAuthPage) {
      prefetchRoute('home');
      prefetchRoute('missions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[--color-bg]/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="text-[--color-neon]" size={20} />
          <span className="font-bold tracking-wide">ScamSlayer</span>
        </Link>
        {!isAuthPage && (
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={link} end onMouseEnter={() => prefetchRoute('home')}>
              <Home size={16} />
            </NavLink>
            <NavLink to="/missions" className={link} onMouseEnter={() => prefetchRoute('missions')}>
              <Gamepad2 size={16} />
            </NavLink>
            <NavLink to="/games" className={link} onMouseEnter={() => prefetchRoute('games')} title="Games">
              <Gamepad2 size={16} />
            </NavLink>
            <NavLink to="/leaderboard" className={link} onMouseEnter={() => prefetchRoute('leaderboard')}>
              <Crown size={16} />
            </NavLink>
            <NavLink to="/teams" className={link} onMouseEnter={() => prefetchRoute('teams')}>
              <Users size={16} />
            </NavLink>
            <NavLink to="/profile" className={link} onMouseEnter={() => prefetchRoute('profile')}>
              <User size={16} />
            </NavLink>
          </nav>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isAuthPage && <AuthButton />}
        </div>
      </div>
    </header>
  );
}
