import { useLocation, useNavigate } from "react-router-dom";
import {
  tallyScore,
  recordGameLocal,
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
      </div>

      <button className="btn btn--outline" onClick={() => navigate("/")}>
        Home
      </button>

      {/* ── Explore & Contribute ── */}
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
          Linux/UNIX. It handles users, groups, hosts, Kerberos authentication,
          certificates, and access policies — all from one place.
        </p>

        <h4
          style={{
            marginTop: "1rem",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
            color: "var(--text)",
          }}
        >
          Explore & Contribute
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <a
            href="https://www.freeipa.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              fontSize: "0.85rem",
              padding: "0.7rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🌐&ensp;freeipa.org — Official Website
          </a>
          <a
            href="https://github.com/freeipa/freeipa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              fontSize: "0.85rem",
              padding: "0.7rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            💻&ensp;GitHub — Source Code
          </a>
          <a
            href="https://pagure.io/freeipa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              fontSize: "0.85rem",
              padding: "0.7rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🐛&ensp;Pagure — File a Bug / Contribute
          </a>
          <a
            href="https://freeipa.readthedocs.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{
              fontSize: "0.85rem",
              padding: "0.7rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📖&ensp;Docs — Read the Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
