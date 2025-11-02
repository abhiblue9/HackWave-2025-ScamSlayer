import { Link } from "react-router-dom";

export default function Games() {
  const cards = [
    { to: "/games/otp", title: "OTP Rush", desc: "Tap only legit OTPs. Score high to earn XP." },
    { to: "/games/linksniper", title: "Link Sniper", desc: "Snipe safe links, dodge phishy bait." },
    { to: "/games/qr", title: "QR Scam Dodge", desc: "Avoid fake QR prompts, collect legit ones." },
    { to: "/games/password", title: "Password Forge", desc: "Pick the strongest password combos." },
    { to: "/games/callshield", title: "Call Shield", desc: "Defend against fake bank-call scripts." },
    { to: "/games/invest", title: "Hype Buster", desc: "Bust too-good-to-be-true investment pitches." },
    { to: "/games/jobwatch", title: "Job Watch", desc: "Spot red flags in job offers." },
    { to: "/games/parcel", title: "Parcel Phish", desc: "Smell the bait in delivery text scams." },
    { to: "/games/romance", title: "Heart Guard", desc: "Catch romance-scam red flags." },
    { to: "/games/dealdetective", title: "Deal Detective", desc: "Verify shopping deals before paying." },
    { to: "/games/profilelock", title: "Profile Lock", desc: "Harden your social account settings." },
    { to: "/games/inbox", title: "Phishing Inbox", desc: "Drag emails into Safe or Scam bins." },
  ];
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Games</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="glass p-4 hover-pop hover-glow">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-white/60">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
