import { useState } from "react";
import { fetchAdminList, type AdminEntry } from "../game/scoring";

export default function Admin() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<AdminEntry[]>([]);

  const handleUnlock = async () => {
    if (!pin) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminList(pin);
      setEntries(data);
      setUnlocked(true);
    } catch {
      setError("Invalid PIN or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const header = "Rank,Name,Email,Score,Date";
    const rows = entries.map(
      (e, i) =>
        `${i + 1},"${e.name}","${e.email}",${e.score},${e.created_at}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policy-panic-leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <div className="page fade-in">
        <h2>Admin Access</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Enter the admin PIN to view player details.
        </p>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          className="name-input"
          style={{ maxWidth: 200, textAlign: "center" }}
        />
        <button
          className="btn"
          onClick={handleUnlock}
          disabled={loading}
          style={{ marginTop: "0.5rem" }}
        >
          {loading ? "Checking..." : "Unlock"}
        </button>
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="page fade-in"
      style={{ justifyContent: "flex-start", paddingTop: "1.5rem" }}
    >
      <h2>Admin — Full Leaderboard</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        {entries.length} entries
      </p>

      <button
        className="btn btn--outline"
        onClick={handleExportCSV}
        style={{ fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}
      >
        Export CSV
      </button>

      {entries.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No games played yet.</p>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            marginTop: "0.75rem",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #334155",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "0.5rem 0.3rem" }}>#</th>
                <th style={{ padding: "0.5rem 0.3rem" }}>Name</th>
                <th style={{ padding: "0.5rem 0.3rem" }}>Email</th>
                <th style={{ padding: "0.5rem 0.3rem", textAlign: "right" }}>
                  Score
                </th>
                <th style={{ padding: "0.5rem 0.3rem", textAlign: "right" }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #1e293b",
                  }}
                >
                  <td
                    style={{
                      padding: "0.4rem 0.3rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "0.4rem 0.3rem" }}>{entry.name}</td>
                  <td
                    style={{
                      padding: "0.4rem 0.3rem",
                      color: "var(--accent)",
                      wordBreak: "break-all",
                    }}
                  >
                    {entry.email}
                  </td>
                  <td
                    style={{
                      padding: "0.4rem 0.3rem",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "0.4rem 0.3rem",
                      textAlign: "right",
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
