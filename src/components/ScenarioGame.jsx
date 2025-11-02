import { useMemo, useState } from "react";
import clsx from "clsx";

/**
 * ScenarioGame renders competitive multi-round decision games with combo scoring.
 * rounds: [{
 *   id?: string,
 *   prompt: string,
 *   context?: string,
 *   details?: string[],
 *   hint?: string,
 *   choices: [{ text: string, correct?: boolean, feedback?: string, points?: number }]
 * }]
 */
export default function ScenarioGame({
  title,
  description,
  rounds = [],
  accentColor = "var(--color-neon)",
  basePoints = 120,
  comboBonus = 40,
  onComplete,
  allowRestart = true,
  footer,
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [rewardInfo, setRewardInfo] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const totalRounds = rounds.length;
  const isFinished = !!finalResult;
  const currentRound = !isFinished && totalRounds ? rounds[Math.min(roundIndex, totalRounds - 1)] : null;

  const accentStyle = useMemo(() => ({ "--accent-color": accentColor }), [accentColor]);
  const accent = "var(--accent-color)";

  const reset = () => {
    setRoundIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setHistory([]);
    setLastOutcome(null);
    setFinalResult(null);
    setRewardInfo(null);
    setError("");
  };

  const handleSelect = (choice, idx) => {
    if (isFinished || finishing || selectedIndex !== null || !currentRound) return;
    const isCorrect = !!choice.correct;
    const gainedBase = choice.points ?? basePoints;
    const gained = isCorrect ? gainedBase + streak * comboBonus : 0;

    setSelectedIndex(idx);
    setHistory((prev) => [...prev, {
      round: currentRound.id ?? roundIndex,
      prompt: currentRound.prompt,
      choice: choice.text,
      isCorrect,
      gained,
    }]);

    if (isCorrect) {
      setScore((prev) => prev + gained);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + 1);
      setLastOutcome({
        isCorrect: true,
        gained,
        message: choice.feedback || "Flawless defense!",
      });
    } else {
      setStreak(0);
      setLastOutcome({
        isCorrect: false,
        gained: 0,
        message: choice.feedback || "That move gifts scammers an opening.",
      });
    }
  };

  const handleAdvance = async () => {
    if (selectedIndex === null || finishing) return;
    const lastRound = roundIndex >= totalRounds - 1;

    if (lastRound) {
      const result = {
        score,
        correct: correctCount,
        total: totalRounds,
        maxStreak,
        history,
        perfect: correctCount === totalRounds && totalRounds > 0,
      };
      setFinishing(true);
      setError("");
      try {
        const reward = onComplete ? await onComplete(result) : null;
        setRewardInfo(reward || null);
      } catch (err) {
        console.error("Scenario reward failed", err);
        setError("Could not save rewards. Try again once you are online.");
      } finally {
        setFinishing(false);
        setFinalResult(result);
      }
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setLastOutcome(null);
  };

  if (!totalRounds) {
    return (
      <div className="glass p-5 text-sm text-white/70">
        No rounds configured for this game yet. Check back soon!
      </div>
    );
  }

  const displayScore = finalResult ? finalResult.score : score;
  const displayCorrect = finalResult ? finalResult.correct : correctCount;
  const displayMaxStreak = finalResult ? finalResult.maxStreak : maxStreak;
  const displayRound = finalResult ? totalRounds : roundIndex + 1;
  const progressPercent = totalRounds ? Math.round((displayCorrect / totalRounds) * 100) : 0;

  return (
    <div className="space-y-5" style={accentStyle}>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="glass p-4 rounded-xl space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-white/50">Score</div>
          <div className="text-2xl font-semibold" style={{ color: accent }}>{displayScore}</div>
        </div>
        <div className="glass p-4 rounded-xl space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-white/50">Correct</div>
          <div className="text-xl font-semibold" style={{ color: accent }}>{displayCorrect}/{totalRounds}</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full" style={{ width: `${progressPercent}%`, backgroundColor: accent }} />
          </div>
        </div>
        <div className="glass p-4 rounded-xl space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-white/50">Max streak</div>
          <div className="text-xl font-semibold" style={{ color: accent }}>{displayMaxStreak}</div>
        </div>
        <div className="glass p-4 rounded-xl space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-white/50">Round</div>
          <div className="text-xl font-semibold" style={{ color: accent }}>{displayRound}/{totalRounds}</div>
        </div>
      </div>

      <div className="glass p-5 rounded-2xl space-y-4">
        <div>
          {title && <h2 className="text-2xl font-semibold">{title}</h2>}
          {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
        </div>

        {!isFinished && currentRound && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-white/60">Scenario {roundIndex + 1}</div>
              <div className="text-lg font-semibold">{currentRound.prompt}</div>
              {currentRound.context && (
                <div className="text-sm text-white/70">{currentRound.context}</div>
              )}
              {Array.isArray(currentRound.details) && currentRound.details.length > 0 && (
                <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                  {currentRound.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {lastOutcome && (
              <div
                className={clsx(
                  "rounded-xl px-4 py-3 text-sm",
                  lastOutcome.isCorrect ? "bg-emerald-400/15 border border-emerald-400/40 text-emerald-200" : "bg-red-500/15 border border-red-500/40 text-red-200"
                )}
              >
                <div className="font-medium flex items-center justify-between gap-3">
                  <span>{lastOutcome.isCorrect ? "Correct" : "Risky"}</span>
                  <span>{lastOutcome.isCorrect ? `+${lastOutcome.gained} pts` : "+0"}</span>
                </div>
                <div className="mt-1 text-xs text-white/80">{lastOutcome.message}</div>
              </div>
            )}

            <div className="grid gap-3">
              {currentRound.choices.map((choice, idx) => {
                const isSelected = selectedIndex === idx;
                const reveal = selectedIndex !== null;
                const isCorrect = !!choice.correct;
                const isBest = reveal && isCorrect;
                const isMistake = reveal && isSelected && !isCorrect;

                return (
                  <button
                    key={choice.text}
                    type="button"
                    onClick={() => handleSelect(choice, idx)}
                    disabled={reveal}
                    className={clsx(
                      "glass text-left px-4 py-3 rounded-xl transition-all border",
                      reveal
                        ? isBest
                          ? "border-emerald-400/70 bg-emerald-400/10"
                          : isMistake
                            ? "border-red-500/60 bg-red-500/10"
                            : "opacity-60 border-white/10"
                        : "hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <div className="font-medium text-sm">{choice.text}</div>
                    {reveal && isSelected && choice.feedback && (
                      <div className="text-xs text-white/60 mt-1">{choice.feedback}</div>
                    )}
                    {reveal && isBest && !isSelected && choice.feedback && (
                      <div className="text-xs text-emerald-200 mt-1">{choice.feedback}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {currentRound.hint && selectedIndex === null && (
              <div className="text-xs text-white/40">Hint: {currentRound.hint}</div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-white/50">
                {selectedIndex === null ? "Lock in your answer to continue." : lastOutcome?.isCorrect ? "Combo streak active." : "Streak reset."}
              </div>
              <button
                type="button"
                onClick={handleAdvance}
                disabled={selectedIndex === null || finishing}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-semibold",
                  selectedIndex === null || finishing
                    ? "bg-white/15 text-white/40 cursor-not-allowed"
                    : "bg-white/15 hover:bg-white/25 text-white"
                )}
              >
                {roundIndex >= totalRounds - 1 ? (finishing ? "Saving…" : "Finish") : "Next"}
              </button>
            </div>
          </div>
        )}

        {isFinished && finalResult && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">Run summary</div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/70">
              <Stat label="Perfect" value={finalResult.perfect ? "Yes" : "No"} accent={accent} />
              <Stat label="Highest combo" value={`${finalResult.maxStreak}x`} accent={accent} />
              <Stat label="Avg points / round" value={finalResult.total ? Math.round(finalResult.score / finalResult.total) : 0} accent={accent} />
              <Stat label="Correct answers" value={`${finalResult.correct}/${finalResult.total}`} accent={accent} />
            </div>

            {rewardInfo && (
              <div className="glass border border-white/10 rounded-xl px-4 py-3 space-y-1">
                {typeof rewardInfo.message === "string" && (
                  <div className="text-sm text-white/70">{rewardInfo.message}</div>
                )}
                {typeof rewardInfo.xp === "number" && rewardInfo.xp > 0 && (
                  <div className="text-sm" style={{ color: accent }}>+{rewardInfo.xp} XP</div>
                )}
                {rewardInfo.badge && (
                  <div className="text-xs text-white/60">Badge unlocked: {rewardInfo.badge}</div>
                )}
                {rewardInfo.locked && (
                  <div className="text-xs text-white/50">Sign in to bank XP and badges on your profile.</div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-4 py-2">{error}</div>
            )}

            {allowRestart && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm"
                >
                  Play again
                </button>
              </div>
            )}
          </div>
        )}

        {footer && !isFinished && (
          <div className="text-xs text-white/60 border-t border-white/10 pt-3">{footer}</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="glass border border-white/5 rounded-xl px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className="text-lg font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  );
}
