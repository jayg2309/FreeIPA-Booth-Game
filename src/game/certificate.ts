/**
 * Certificate generator — draws a professional certificate using Canvas API.
 * Logos: FreeIPA (drawn inline) + DevConf (loaded from /devconf-logo.png).
 */

const W = 1400;
const H = 900;

const FREEIPA_BLUE = "#0066cc";
const DEVCONF_PURPLE = "#7c5cbf";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#daa520";
const DARK = "#1a1a2e";

/* ────────────────────────────────────────────── */
/*  Helper: load an image from a URL              */
/* ────────────────────────────────────────────── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ────────────────────────────────────────────── */
/*  Main: generate certificate as PNG Blob        */
/* ────────────────────────────────────────────── */

export async function generateCertificate(
  playerName: string,
  score: number,
  correct: number,
  total: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Try loading logos (graceful fallback to drawn/text versions if they fail)
  let freeipaImg: HTMLImageElement | null = null;
  let devconfImg: HTMLImageElement | null = null;
  try {
    [freeipaImg, devconfImg] = await Promise.all([
      loadImage("/freeipa-logo.png").catch(() => null),
      loadImage("/devconf-logo.png").catch(() => null),
    ]);
  } catch {
    // Logos not available — will use fallbacks
  }

  /* ── White background ── */
  ctx.fillStyle = "#fffef8";
  ctx.fillRect(0, 0, W, H);

  /* ── Decorative borders ── */
  drawBorders(ctx);

  /* ── Top accent stripe ── */
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, FREEIPA_BLUE);
  grad.addColorStop(1, DEVCONF_PURPLE);
  ctx.fillStyle = grad;
  ctx.fillRect(50, 50, W - 100, 6);

  /* ── FreeIPA logo (top-left) ── */
  drawFreeIPALogo(ctx, 80, 75, freeipaImg);

  /* ── DevConf logo (top-right) ── */
  drawDevConfLogo(ctx, W - 310, 75, devconfImg);

  /* ── "Certificate of Achievement" ── */
  ctx.fillStyle = GOLD;
  ctx.font = "small-caps 18px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("CERTIFICATE OF ACHIEVEMENT", W / 2, 190);
  ctx.letterSpacing = "0px";

  /* ── Gold divider ── */
  drawDivider(ctx, W / 2 - 200, 205, 400);

  /* ── Title ── */
  ctx.fillStyle = DARK;
  ctx.font = "bold 36px Georgia, 'Times New Roman', serif";
  ctx.fillText("Policy Panic", W / 2, 260);
  ctx.font = "italic 20px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#555";
  ctx.fillText("FreeIPA Identity Management Challenge", W / 2, 295);

  /* ── "This certifies that" ── */
  ctx.fillStyle = "#666";
  ctx.font = "17px Georgia, 'Times New Roman', serif";
  ctx.fillText("This is to certify that", W / 2, 355);

  /* ── Player name ── */
  ctx.fillStyle = FREEIPA_BLUE;
  ctx.font = "bold 52px Georgia, 'Times New Roman', serif";
  ctx.fillText(playerName, W / 2, 420);

  /* ── Underline beneath name ── */
  const nameWidth = ctx.measureText(playerName).width;
  drawDivider(ctx, W / 2 - nameWidth / 2 - 20, 435, nameWidth + 40);

  /* ── Score details ── */
  ctx.fillStyle = DARK;
  ctx.font = "22px Georgia, 'Times New Roman', serif";
  ctx.fillText(
    `scored ${score.toLocaleString()} points`,
    W / 2,
    485
  );
  ctx.fillStyle = "#666";
  ctx.font = "18px Georgia, 'Times New Roman', serif";
  ctx.fillText(`(${correct} out of ${total} questions correct)`, W / 2, 520);

  /* ── Description ── */
  ctx.fillStyle = "#555";
  ctx.font = "italic 17px Georgia, 'Times New Roman', serif";
  ctx.fillText(
    "and has demonstrated curiosity and knowledge in the field of",
    W / 2,
    575
  );
  ctx.fillText(
    "open-source identity management using FreeIPA",
    W / 2,
    600
  );

  /* ── Date ── */
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillStyle = "#888";
  ctx.font = "15px Georgia, 'Times New Roman', serif";
  ctx.fillText(date, W / 2, 660);

  /* ── Bottom divider ── */
  drawDivider(ctx, W / 2 - 250, 685, 500);

  /* ── Links footer ── */
  ctx.fillStyle = "#888";
  ctx.font = "13px Arial, Helvetica, sans-serif";
  ctx.fillText(
    "freeipa.org   |   github.com/freeipa/freeipa   |   pagure.io/freeipa",
    W / 2,
    725
  );

  /* ── Taglines ── */
  ctx.fillStyle = FREEIPA_BLUE;
  ctx.font = "bold 14px Arial, Helvetica, sans-serif";
  ctx.fillText("FreeIPA — Identity, Policy, Audit", W / 2, 760);

  ctx.fillStyle = DEVCONF_PURPLE;
  ctx.font = "bold 13px Arial, Helvetica, sans-serif";
  ctx.fillText("Presented at DevConf", W / 2, 785);

  /* ── Bottom accent stripe ── */
  const grad2 = ctx.createLinearGradient(0, 0, W, 0);
  grad2.addColorStop(0, DEVCONF_PURPLE);
  grad2.addColorStop(1, FREEIPA_BLUE);
  ctx.fillStyle = grad2;
  ctx.fillRect(50, H - 56, W - 100, 6);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

/* ────────────────────────────────────────────── */
/*  Drawing helpers                               */
/* ────────────────────────────────────────────── */

function drawBorders(ctx: CanvasRenderingContext2D) {
  // Outer border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Inner border
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Corner ornaments
  const inset = 42;
  const len = 35;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(inset, inset + len);
  ctx.lineTo(inset, inset);
  ctx.lineTo(inset + len, inset);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - inset - len, inset);
  ctx.lineTo(W - inset, inset);
  ctx.lineTo(W - inset, inset + len);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(inset, H - inset - len);
  ctx.lineTo(inset, H - inset);
  ctx.lineTo(inset + len, H - inset);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - inset - len, H - inset);
  ctx.lineTo(W - inset, H - inset);
  ctx.lineTo(W - inset, H - inset - len);
  ctx.stroke();

  // Small diamond corners
  const dInset = 55;
  const dSize = 5;
  for (const [cx, cy] of [
    [dInset, dInset],
    [W - dInset, dInset],
    [dInset, H - dInset],
    [W - dInset, H - dInset],
  ]) {
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dSize);
    ctx.lineTo(cx + dSize, cy);
    ctx.lineTo(cx, cy + dSize);
    ctx.lineTo(cx - dSize, cy);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  const cx = x + width / 2;
  // Line left
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(cx - 12, y);
  ctx.stroke();
  // Line right
  ctx.beginPath();
  ctx.moveTo(cx + 12, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  // Center diamond
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, y - 4);
  ctx.lineTo(cx + 6, y);
  ctx.lineTo(cx, y + 4);
  ctx.lineTo(cx - 6, y);
  ctx.closePath();
  ctx.fill();
}

function drawFreeIPALogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  img: HTMLImageElement | null
) {
  if (img) {
    // Draw the actual FreeIPA logo image, scaled to fit ~85px tall
    const targetH = 85;
    const scale = targetH / img.naturalHeight;
    const targetW = img.naturalWidth * scale;
    ctx.drawImage(img, x, y, targetW, targetH);
  } else {
    // Fallback: text-only if image failed to load
    ctx.fillStyle = FREEIPA_BLUE;
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("FreeIPA", x + 10, y + 48);
    ctx.font = "12px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText("Identity · Policy · Audit", x + 10, y + 66);
    ctx.textAlign = "center";
  }
}

function drawDevConfLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  img: HTMLImageElement | null
) {
  if (img) {
    // Draw the actual DevConf logo image, scaled to fit ~80px tall
    const targetH = 80;
    const scale = targetH / img.naturalHeight;
    const targetW = img.naturalWidth * scale;
    ctx.drawImage(img, x, y, targetW, targetH);

    // "DevConf" text beside the logo
    ctx.fillStyle = DEVCONF_PURPLE;
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("DevConf", x + targetW + 12, y + 48);
    ctx.font = "12px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText("devconf.info", x + targetW + 12, y + 66);
    ctx.textAlign = "center";
  } else {
    // Fallback: text-only if image failed to load
    ctx.fillStyle = DEVCONF_PURPLE;
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("DevConf", x + 10, y + 48);
    ctx.font = "12px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText("devconf.info", x + 10, y + 66);
    ctx.textAlign = "center";
  }
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
  // Try Web Share API first (mobile-friendly, can share the image file)
  if (certBlob && navigator.share && navigator.canShare) {
    const file = new File(
      [certBlob],
      `FreeIPA-Certificate-${playerName.replace(/\s+/g, "_")}.png`,
      { type: "image/png" }
    );
    const shareData = {
      title: "FreeIPA Policy Panic Certificate",
      text: `I scored ${score.toLocaleString()} points on the FreeIPA Policy Panic quiz at DevConf! 🛡️ #FreeIPA #OpenSource #Linux #DevConf`,
      files: [file],
    };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to LinkedIn URL
      }
    }
  }

  // Fallback: open LinkedIn share page
  const url = encodeURIComponent("https://www.freeipa.org");
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    "_blank",
    "width=600,height=500"
  );
}
