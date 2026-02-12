/**
 * Badge generator — draws a simple congratulations badge using Canvas API.
 */

const W = 1000;
const H = 600;

const ACCENT = "#38bdf8";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#daa520";
const DARK = "#1a1a2e";

/* ────────────────────────────────────────────── */
/*  Main: generate badge as PNG Blob              */
/* ────────────────────────────────────────────── */

export async function generateCertificate(
  playerName: string,
  score: number,
  _correct: number,
  _total: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* ── Background ── */
  ctx.fillStyle = "#fffef8";
  ctx.fillRect(0, 0, W, H);

  /* ── Borders ── */
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  /* ── Top accent line ── */
  ctx.fillStyle = ACCENT;
  ctx.fillRect(40, 40, W - 80, 5);

  /* ── Congratulations ── */
  ctx.fillStyle = GOLD;
  ctx.font = "bold small-caps 38px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "8px";
  ctx.fillText("CONGRATULATIONS", W / 2, 120);
  ctx.letterSpacing = "0px";

  /* ── Divider ── */
  drawDivider(ctx, W / 2 - 180, 140, 360);

  /* ── Player name ── */
  ctx.fillStyle = DARK;
  ctx.font = "bold 48px Georgia, 'Times New Roman', serif";
  ctx.fillText(playerName, W / 2, 210);

  /* ── Message ── */
  ctx.fillStyle = "#555";
  ctx.font = "22px Georgia, 'Times New Roman', serif";
  ctx.fillText("on successfully completing the quiz", W / 2, 270);

  /* ── Divider ── */
  drawDivider(ctx, W / 2 - 140, 300, 280);

  /* ── Score ── */
  ctx.fillStyle = "#888";
  ctx.font = "20px Georgia, 'Times New Roman', serif";
  ctx.fillText("Your Score", W / 2, 350);

  ctx.fillStyle = ACCENT;
  ctx.font = "bold 72px Georgia, 'Times New Roman', serif";
  ctx.fillText(score.toLocaleString(), W / 2, 440);

  /* ── Date ── */
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillStyle = "#aaa";
  ctx.font = "15px Georgia, 'Times New Roman', serif";
  ctx.fillText(date, W / 2, 510);

  /* ── Bottom accent line ── */
  ctx.fillStyle = ACCENT;
  ctx.fillRect(40, H - 45, W - 80, 5);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

/* ────────────────────────────────────────────── */
/*  Divider helper                                */
/* ────────────────────────────────────────────── */

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  const cx = x + width / 2;
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(cx - 8, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 8, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, y - 3);
  ctx.lineTo(cx + 5, y);
  ctx.lineTo(cx, y + 3);
  ctx.lineTo(cx - 5, y);
  ctx.closePath();
  ctx.fill();
}

/* ────────────────────────────────────────────── */
/*  Download helper                               */
/* ────────────────────────────────────────────── */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ────────────────────────────────────────────── */
/*  LinkedIn share helper                         */
/* ────────────────────────────────────────────── */

export async function shareOnLinkedIn(
  playerName: string,
  score: number,
  certBlob?: Blob
) {
  if (certBlob && navigator.share && navigator.canShare) {
    const file = new File(
      [certBlob],
      `Quiz-Badge-${playerName.replace(/\s+/g, "_")}.png`,
      { type: "image/png" }
    );
    const shareData = {
      title: "Policy Panic Quiz Badge",
      text: `I scored ${score.toLocaleString()} points on the Policy Panic quiz! 🛡️`,
      files: [file],
    };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through
      }
    }
  }

  const url = encodeURIComponent("https://www.freeipa.org");
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    "_blank",
    "width=600,height=500"
  );
}
