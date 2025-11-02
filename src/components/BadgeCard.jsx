export default function BadgeCard({ title, emoji, desc }) {
  return (
    <div className="glass p-4 flex items-center gap-3 hover-pop hover-glow">
      <div className="text-2xl">{emoji}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-white/60 text-sm">{desc}</div>
      </div>
    </div>
  );
}
