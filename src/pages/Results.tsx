import { useLocation, useNavigate } from "react-router-dom";
import {
  tallyScore,
  recordGameLocal,
  submitScore,
  type RoundResult,
} from "../game/scoring";
import {
  generateCertificate,
  downloadBlob,
  shareOnLinkedIn,
} from "../game/certificate";
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
  const [certLoading, setCertLoading] = useState(false);
  const certBlobRef = useRef<Blob | null>(null);

  const submitted = useRef(false);
  useEffect(() => {
    if (submitted.current || roundResults.length === 0) return;
    submitted.current = true;
    submitScore(playerName, playerEmail, score.total)
      .then(({ ok, duplicate }) => {
        if (duplicate) setSubmitMsg("This email already has a score on the leaderboard.");
        else if (!ok) setSubmitMsg("Could not submit to leaderboard — score saved locally.");
      })
      .catch(() => setSubmitMsg("Could not submit to leaderboard — score saved locally."));
  }, [playerName, playerEmail, score.total, roundResults.length]);

  useEffect(() => {
    if (roundResults.length === 0) return;
    generateCertificate(playerName, score.total, score.correct, roundResults.length)
      .then((blob) => { certBlobRef.current = blob; });
  }, [playerName, score.total, score.correct, roundResults.length]);

  if (roundResults.length === 0) {
    return (
      <div className="page fade-in">
        <h2>No results found</h2>
        <button className="btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const accuracy = Math.round((score.correct / roundResults.length) * 100);

  const handleDownloadCert = async () => {
    setCertLoading(true);
    try {
      const blob = certBlobRef.current ?? await generateCertificate(playerName, score.total, score.correct, roundResults.length);
      certBlobRef.current = blob;
      downloadBlob(blob, `Quiz-Badge-${playerName.replace(/\s+/g, "_")}.png`);
    } finally { setCertLoading(false); }
  };

  const handleShareLinkedIn = async () => {
    const blob = certBlobRef.current ?? await generateCertificate(playerName, score.total, score.correct, roundResults.length);
    certBlobRef.current = blob;
    await shareOnLinkedIn(playerName, score.total, blob);
  };

  return (
    <div className="page fade-in">
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }} className="pop-in">
        {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "👏" : "💪"}
      </div>

      <h2 style={{ color: "var(--text-muted)", fontWeight: 500 }}>
        Nice work,{" "}
        <span style={{ color: "var(--accent)" }}>{playerName}</span>!
      </h2>

      <div className="score-hero pop-in" style={{ animationDelay: "0.1s" }}>
        {score.total.toLocaleString()}
        {isNewBest && (
          <span className="badge badge--new" style={{ marginLeft: "0.5rem", fontSize: "0.55rem", verticalAlign: "middle" }}>
            New Best!
          </span>
        )}
      </div>

      {submitMsg && (
        <p style={{ color: "var(--warning)", fontSize: "0.78rem", margin: 0 }}>{submitMsg}</p>
      )}

      <div className="stats-grid">
        <div className="stat-box">
          <div className="value">{score.correct}/{roundResults.length}</div>
          <div className="label">Correct</div>
        </div>
        <div className="stat-box">
          <div className="value">{accuracy}%</div>
          <div className="label">Accuracy</div>
        </div>
      </div>

      {/* ── Certificate actions ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
        <button
          className="btn btn--large"
          onClick={handleDownloadCert}
          disabled={certLoading}
          style={{ gap: "0.5rem" }}
        >
          {certLoading ? "Generating..." : "📜  Download Badge"}
        </button>

        <button
          className="btn"
          onClick={handleShareLinkedIn}
          style={{
            background: "#0a66c2",
            color: "#fff",
            border: "none",
            gap: "0.5rem",
            boxShadow: "0 2px 12px rgba(10,102,194,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </button>
      </div>

      <button className="btn btn--outline" onClick={() => navigate("/")}>
        Home
      </button>

      {/* ── Explore & Contribute ── */}
      <div className="card" style={{ textAlign: "left", lineHeight: 1.7 }}>
        <h3 style={{ marginBottom: "0.3rem" }}>What is FreeIPA?</h3>
        <p style={{ fontSize: "0.85rem" }}>
          FreeIPA is a free, open-source identity management system for
          Linux/UNIX. It handles users, groups, hosts, Kerberos authentication,
          certificates, and access policies — all from one place.
        </p>

        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Explore & Contribute
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
          <a href="https://www.freeipa.org" target="_blank" rel="noopener noreferrer" className="explore-link">
            <span className="icon">🌐</span> freeipa.org — Official Website
          </a>
          <a href="https://github.com/freeipa/freeipa" target="_blank" rel="noopener noreferrer" className="explore-link">
            <span className="icon">💻</span> GitHub — Source Code
          </a>
          <a href="https://pagure.io/freeipa" target="_blank" rel="noopener noreferrer" className="explore-link">
            <span className="icon">🐛</span> Pagure — File a Bug / Contribute
          </a>
          <a href="https://freeipa.readthedocs.io/" target="_blank" rel="noopener noreferrer" className="explore-link">
            <span className="icon">📖</span> Docs — Read the Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
