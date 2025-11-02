import { Link } from "react-router-dom";

export default function Minigames() {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Mini-Games</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/minigames/otp" className="glass p-4 hover-pop hover-glow">
          <div className="font-semibold">OTP Rush</div>
          <div className="text-sm text-white/60">Tap only legit OTPs. Score high to earn XP.</div>
        </Link>
        <Link to="/minigames/linksniper" className="glass p-4 hover-pop hover-glow">
          <div className="font-semibold">Link Sniper</div>
          <div className="text-sm text-white/60">Snipe safe links, dodge phishy bait.</div>
        </Link>
        <Link to="/minigames/qr" className="glass p-4 hover-pop hover-glow">
          <div className="font-semibold">QR Scam Dodge</div>
          <div className="text-sm text-white/60">Avoid fake QR prompts, collect legit ones.</div>
        </Link>
      </div>
    </div>
  );
}
