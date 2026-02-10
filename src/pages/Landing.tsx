import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBestScore,
  fetchLeaderboard,
  type LeaderboardEntry,
} from "../game/scoring";

export default function Landing() {
  const navigate = useNavigate();
  const best = getBestScore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
  }, []);

  const validEmail = /^[^\s@]+@gmail\.com$/i.test(email.trim());
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
          setEmailError("This email has already been used to play. One attempt per person!");
          setChecking(false);
          return;
        }
      }
      // If API is unreachable (local dev / offline), allow play anyway
    } catch {
      // Network error — let them play, server will reject on submit if duplicate
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
      {/* Shield icon */}
      <div style={{ fontSize: "4rem", lineHeight: 1 }}>🛡️</div>

      <h1>Policy Panic</h1>
      <p style={{ maxWidth: 320 }}>
        Identity crises are happening across the network! Tap the right
        security control before time runs out.
      </p>

      {/* Name + Email inputs */}
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
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
          placeholder="Your Gmail (example@gmail.com)"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          onKeyDown={handleKeyDown}
          maxLength={64}
          className="name-input"
          style={emailError ? { borderColor: "var(--danger)" } : undefined}
        />
        {emailError && (
          <p
            style={{
              color: "var(--danger)",
              fontSize: "0.8rem",
              margin: 0,
              textAlign: "left",
            }}
          >
            {emailError}
          </p>
        )}
      </div>

      <button
        className="btn btn--large"
        onClick={handlePlay}
        disabled={!canPlay}
        style={{ marginTop: "0.25rem", opacity: canPlay ? 1 : 0.4 }}
      >
        {checking ? "Checking..." : "▶\u2002Play"}
      </button>

      {/* Shared Leaderboard — shows rank + name + score (no emails) */}
      {leaderboard.length > 0 && (
        <div className="card" style={{ textAlign: "left" }}>
          <h3 style={{ marginBottom: "0.6rem", textAlign: "center" }}>
            Leaderboard
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.9rem",
                  padding: "0.35rem 0",
                  borderBottom:
                    i < Math.min(leaderboard.length, 10) - 1
                      ? "1px solid #334155"
                      : "none",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: i < 3 ? "var(--warning)" : "var(--text-muted)",
                      minWidth: "1.5rem",
                    }}
                  >
                    {i === 0
                      ? "🥇"
                      : i === 1
                      ? "🥈"
                      : i === 2
                      ? "🥉"
                      : `${i + 1}.`}
                  </span>
                  <span style={{ fontWeight: 500 }}>{entry.name}</span>
                </span>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {best > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "1rem 1.5rem",
            background: "rgba(56, 189, 248, 0.08)",
            border: "2px solid var(--accent)",
            borderRadius: "1rem",
            width: "100%",
            maxWidth: 340,
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.25rem",
              fontWeight: 600,
            }}
          >
            High Score
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "var(--accent)",
              lineHeight: 1.1,
            }}
          >
            {best.toLocaleString()}
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
        <p style={{ fontSize: "0.8rem" }}>
          Learn more about{" "}
          <a
            href="https://www.freeipa.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            FreeIPA
          </a>{" "}
          — open-source identity management for Linux
        </p>
      </div>
    </div>
  );
}
