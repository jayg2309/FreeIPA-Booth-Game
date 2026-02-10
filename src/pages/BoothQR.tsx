import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

/**
 * Full-screen page meant to be displayed on the booth laptop / big screen.
 * Shows a QR code that attendees scan to open the game on their phones.
 *
 * The URL defaults to the current origin, but you can override it
 * by adding ?url=<encoded-url> to the /booth path.
 */
export default function BoothQR() {
  const params = new URLSearchParams(window.location.search);
  const defaultUrl = window.location.origin + "/";
  const [gameUrl] = useState(params.get("url") || defaultUrl);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        background: "var(--bg)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>🛡️ Policy Panic</h1>
      <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", maxWidth: 480 }}>
        Scan the QR code to play! Answer identity-security scenarios as fast as
        you can and see how you score.
      </p>

      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "1.25rem",
          display: "inline-flex",
        }}
      >
        <QRCodeSVG value={gameUrl} size={280} level="H" />
      </div>

      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
        {gameUrl}
      </p>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href="https://www.freeipa.org"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--outline"
          style={{ fontSize: "1rem" }}
        >
          freeipa.org
        </a>
        <a
          href="https://github.com/freeipa/freeipa"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--outline"
          style={{ fontSize: "1rem" }}
        >
          Contribute on GitHub
        </a>
      </div>
    </div>
  );
}
