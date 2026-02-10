import { useLocation, useNavigate } from "react-router-dom";
import {
  tallyScore,
  recordGameLocal,
  getBestScore,
  submitScore,
  type RoundResult,
} from "../game/scoring";
import { useMemo, useEffect, useRef, useState } from "react";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const roundResults: RoundResult[] = state?.results ?? [];
  const playerName: string = state?.playerName ?? "Player";
  const playerEmail: string = state?.playerEmail ?? "";

  const score = useMemo(() => tallyScore(roundResults), [roundResults]);
  const isNewBest = useMemo(() => recordGameLocal(score.total), [score.total]);
  const bestScore = getBestScore();

  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  // Submit score to shared leaderboard (once)
  const submitted = useRef(false);
  useEffect(() => {
    if (submitted.current || roundResults.length === 0) return;
    submitted.current = true;
    submitScore(playerName, playerEmail, score.total)
      .then(({ ok, duplicate }) => {
        if (duplicate) {
          setSubmitMsg("This email already has a score on the leaderboard.");
        } else if (!ok) {
          setSubmitMsg("Could not submit to leaderboard — score saved locally.");
        }
      })
      .catch(() => {
        setSubmitMsg("Could not submit to leaderboard — score saved locally.");
      });
  }, [playerName, playerEmail, score.total, roundResults.length]);

  // If someone navigates here directly with no results, bounce to landing
  if (roundResults.length === 0) {
    return (
      <div className="page fade-in">
        <h2>No results found</h2>
        <button className="btn" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const accuracy = Math.round((score.correct / roundResults.length) * 100);

  return (
    <div className="page fade-in">
      <div style={{ fontSize: "3rem", lineHeight: 1 }} className="pop-in">
        {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "👏" : "💪"}
      </div>

      <h2 style={{ color: "var(--text-muted)", fontWeight: 500 }}>
        Nice work,{" "}
        <span style={{ color: "var(--accent)" }}>{playerName}</span>!
      </h2>

      <h1>
        {score.total.toLocaleString()}
        {isNewBest && (
          <span
            className="badge badge--new"
            style={{
              marginLeft: "0.5rem",
              fontSize: "0.6rem",
              verticalAlign: "middle",
            }}
          >
            New Best!
          </span>
        )}
      </h1>

      {submitMsg && (
        <p style={{ color: "var(--warning)", fontSize: "0.8rem", margin: 0 }}>
          {submitMsg}
        </p>
      )}

      <div className="stats-grid">
        <div className="stat-box">
          <div className="value">
            {score.correct}/{roundResults.length}
          </div>
          <div className="label">Correct</div>
        </div>
        <div className="stat-box">
          <div className="value">{accuracy}%</div>
          <div className="label">Accuracy</div>
        </div>
        <div className="stat-box">
          <div className="value">{score.maxStreak}</div>
          <div className="label">Best Streak</div>
        </div>
        <div className="stat-box">
          <div className="value">{bestScore.toLocaleString()}</div>
          <div className="label">Personal Best</div>
        </div>
      </div>

      <button className="btn btn--outline" onClick={() => navigate("/")}>
        Home
      </button>

      <div
        className="card"
        style={{
          marginTop: "0.5rem",
          textAlign: "left",
          fontSize: "0.9rem",
          lineHeight: 1.7,
        }}
      >
        <h3 style={{ marginBottom: "0.4rem" }}>What is FreeIPA?</h3>
        <p style={{ color: "var(--text-muted)" }}>
          FreeIPA is a free, open-source identity management system for
          Linux/UNIX. It handles users, groups, hosts, services, Kerberos
          authentication, certificates, and access policies — all from one
          place.
        </p>
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://www.freeipa.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              flex: "1 1 auto",
              fontSize: "0.85rem",
              padding: "0.6rem 1rem",
            }}
          >
            freeipa.org
          </a>
          <a
            href="https://github.com/freeipa/freeipa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              flex: "1 1 auto",
              fontSize: "0.85rem",
              padding: "0.6rem 1rem",
            }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
