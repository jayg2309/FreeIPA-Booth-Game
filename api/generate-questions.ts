import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are a quiz question generator for a FreeIPA booth game at a tech conference targeting college students.

Generate identity management and security scenario questions that teach students about FreeIPA and open source.

Rules:
- Each question scenario MUST be short: ONE sentence, maximum 20 words. Students have only 15 seconds to read the question AND all options AND choose an answer.
- Each answer option MUST be concise: maximum 8 words per option. Prefer 3-5 word options.
- Exactly 3 answer options: 1 correct, 2 plausible-but-wrong.
- A short explanation (1 sentence, max 15 words) that ties the answer back to FreeIPA.
- A concept category from this list: Single Sign-On, Central Identity, Kerberos Tickets, Kerberos & Time Sync, Groups & RBAC, Least Privilege, Account Lifecycle, Password Policy, Certificates, Host Identity, Open Source, Sudo Rules, DNS & Discovery, Two-Factor Auth, Trust & Federation, Audit & Logging.
- Vary the categories — don't repeat the same category more than twice.
- Keep language accessible for students who may be new to sysadmin topics.
- IMPORTANT: brevity is critical — if a student can't read everything in under 10 seconds, the question is too long.

Return ONLY a valid JSON array (no markdown fences, no commentary) of 10 objects:
[{"scenario":"...","options":[{"text":"...","isCorrect":true},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false}],"explanation":"...","concept":"..."}]`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI generation not configured" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content:
              "Generate 10 unique, creative FreeIPA identity-security quiz questions. Use varied realistic scenarios (college campus, research lab, student club, startup, hackathon). Spread across different concept categories.",
          },
        ],
        temperature: 0.95,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OpenAI ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in AI response");

    const raw: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error("Empty or invalid array from AI");
    }

    const questions = raw.slice(0, 10).map((q: any, i: number) => {
      const opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length < 2) throw new Error(`Q${i}: too few options`);

      const correctCount = opts.filter((o: any) => o.isCorrect).length;
      if (correctCount !== 1) throw new Error(`Q${i}: need exactly 1 correct`);

      return {
        id: 2000 + i,
        scenario: String(q.scenario ?? ""),
        options: opts.map((o: any) => ({
          text: String(o.text ?? ""),
          isCorrect: Boolean(o.isCorrect),
        })),
        explanation: String(q.explanation ?? ""),
        concept: String(q.concept ?? "FreeIPA"),
      };
    });

    return res.status(200).json({ questions });
  } catch (err: any) {
    console.error("AI generation failed:", err.message);
    return res.status(500).json({ error: "AI generation failed" });
  }
}
