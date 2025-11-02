import { useMemo, useState } from "react";
import { useUserStore } from "../store/userStore";
import { awardXp } from "../utils/firebaseUtils";

const ITEMS = [
  { id: 1, text: "Your parcel is held. Pay Rs. 49 to release.", scam: true },
  { id: 2, text: "Login from new device? If this wasn't you, secure your account in app.", scam: false },
  { id: 3, text: "Congratulations! Click to claim prize.", scam: true },
  { id: 4, text: "Monthly statement available in bank app.", scam: false },
  { id: 5, text: "Urgent: KYC suspended. Submit PAN via this form.", scam: true },
];

export default function PhishingInbox() {
  const pool = useMemo(() => ITEMS.map(i => ({ ...i })), []);
  const { user, profile, setProfile } = useUserStore();
  const [left, setLeft] = useState(pool); // remaining emails
  const [safe, setSafe] = useState([]);
  const [scam, setScam] = useState([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const onDrop = (target, item) => {
    setLeft((prev) => prev.filter((x) => x.id !== item.id));
    const correct = (target === "safe" && !item.scam) || (target === "scam" && item.scam);
    if (correct) setScore((s) => s + 10);
    if (target === "safe") setSafe((s) => [...s, item]);
    else setScam((s) => [...s, item]);
  };

  const finish = async () => {
    const delta = score;
    if (user) await awardXp({ user, profile, setProfile, delta, badge: score >= 30 ? "Inbox Inspector" : null });
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Phishing Inbox</h2>
      {!done ? (
        <>
          <div className="text-sm text-white/60">Drag each message into Safe or Scam.</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="glass p-3">
              <div className="text-sm font-semibold mb-2">Inbox</div>
              <div className="space-y-2 min-h-[220px]">
                {left.map((mail) => (
                  <div key={mail.id} draggable onDragStart={(e)=>{e.dataTransfer.setData('text/plain', JSON.stringify(mail));}} className="glass p-2 cursor-move text-sm">{mail.text}</div>
                ))}
              </div>
            </div>
            <DropZone title="Safe" onDrop={(item)=>onDrop('safe', item)} items={safe} />
            <DropZone title="Scam" onDrop={(item)=>onDrop('scam', item)} items={scam} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">Score: <span className="text-[--color-neon2] font-semibold">{score}</span></div>
            <button className="px-4 py-2 bg-[--color-neon] rounded-lg" disabled={left.length>0} onClick={finish}>Finish</button>
          </div>
        </>
      ) : (
        <div className="glass p-4">
          <div className="mb-2">Final score: <span className="text-[--color-neon2] font-semibold">{score}</span></div>
          <div className="text-sm text-white/70">{score>=30?"Inbox Inspector unlocked!":"Classify at least 3 correctly to unlock a badge."}</div>
        </div>
      )}
    </div>
  );
}

function DropZone({ title, onDrop, items }) {
  const [over, setOver] = useState(false);
  return (
    <div className={`glass p-3 min-h-[280px] ${over? 'ring-2 ring-[--color-neon]':''}`}
      onDragOver={(e)=>{e.preventDefault(); setOver(true)}}
      onDragLeave={()=>setOver(false)}
      onDrop={(e)=>{e.preventDefault(); setOver(false); try{ const item=JSON.parse(e.dataTransfer.getData('text/plain')); onDrop?.(item);}catch{}}}
    >
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        {items.map((mail) => (
          <div key={mail.id} className="glass p-2 text-sm">{mail.text}</div>
        ))}
      </div>
    </div>
  );
}
