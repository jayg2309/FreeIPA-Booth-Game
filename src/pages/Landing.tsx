import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchLeaderboard,
  type LeaderboardEntry,
} from "../game/scoring";

export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
  }, []);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canPlay = name.trim().length > 0 && validEmail && !checking;

  const handlePlay = async () => {
    if (!canPlay) return;
    setChecking(true);
    setEmailError("");

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.alreadyPlayed) {
          setEmailError("This email has already been used. One attempt per person!");
          setChecking(false);
          return;
        }
      }
    } catch {
      // Network error — allow play, server will reject on submit if duplicate
    }

    setChecking(false);
    navigate("/play", {
      state: { playerName: name.trim(), playerEmail: email.trim() },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canPlay) handlePlay();
  };

  return (
    <div className="page fade-in">
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🛡️</div>

      <h1>Policy Panic</h1>
      <p style={{ maxWidth: 320, fontSize: "0.9rem", lineHeight: 1.6 }}>
        Identity crises are happening across the network! Tap the right
        security control before time runs out.
      </p>

      {/* ── Inputs ── */}
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={24}
          autoFocus
          className="name-input"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
          onKeyDown={handleKeyDown}
          maxLength={64}
          className="name-input"
          style={emailError ? { borderColor: "var(--danger)", boxShadow: "0 0 0 3px rgba(239,68,68,0.15)" } : undefined}
        />
        {emailError && (
          <p style={{ color: "var(--danger)", fontSize: "0.78rem", margin: 0, textAlign: "left" }}>
            {emailError}
          </p>
        )}
      </div>

      <button
        className="btn btn--large"
        onClick={handlePlay}
        disabled={!canPlay}
      >
        {checking ? "Checking..." : "▶\u2002Play"}
      </button>

      {/* ── Leaderboard ── */}
      {leaderboard.length > 0 && (
        <div className="card" style={{ textAlign: "left" }}>
          <h3 style={{ marginBottom: "0.5rem", textAlign: "center" }}>
            Leaderboard
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div key={i} className="lb-row">
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{
                    fontWeight: 700,
                    color: i < 3 ? "var(--warning)" : "var(--text-muted)",
                    minWidth: "1.5rem",
                    fontSize: i < 3 ? "1.1rem" : "0.85rem",
                  }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span style={{ fontWeight: 500 }}>{entry.name}</span>
                </span>
                <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: "0.9rem" }}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── High Score ── */}
      {leaderboard.length > 0 && (
        <div className="high-score-card">
          <div style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "0.2rem",
            fontWeight: 600,
          }}>
            High Score
          </div>
          <div className="score-hero">
            {leaderboard[0].score.toLocaleString()}
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
        <p style={{ fontSize: "0.78rem" }}>
          Learn more about{" "}
          <a href="https://www.freeipa.org" target="_blank" rel="noopener noreferrer">
            FreeIPA
          </a>
          {" "}— open-source identity management for Linux
        </p>
      </div>
    </div>
  );
}
