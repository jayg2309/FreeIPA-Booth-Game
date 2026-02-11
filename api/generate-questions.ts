import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are a quiz question generator for a FreeIPA booth game at a tech conference targeting college students.

Your goal is to make students CURIOUS about FreeIPA and its ecosystem by asking genuinely challenging questions that require real knowledge — not guessing.

Reference documentation & components (use these as source material):
- FreeIPA official docs: https://freeipa.readthedocs.io/
- SSSD (System Security Services Daemon): https://sssd.io/ — caches credentials, enables offline login, connects Linux clients to FreeIPA
- 389 Directory Server (LDAP backend): https://www.port389.org/ — stores all FreeIPA user/group/host data
- MIT Kerberos: https://web.mit.edu/kerberos/ — provides ticket-based authentication in FreeIPA
- Dogtag Certificate System: https://www.dogtagpki.org/ — manages X.509 certificates within FreeIPA
- Certmonger: automatically tracks and renews certificates on enrolled hosts
- DNS integration: FreeIPA includes a built-in DNS server for service discovery via SRV records
- OTP / Two-Factor Auth: FreeIPA supports TOTP and HOTP tokens natively
- Trust & Federation: FreeIPA can create cross-realm trusts with Active Directory
- Sudo & HBAC rules: centrally managed access control — who can run what, where

CRITICAL — Question difficulty & answer design rules:
- NEVER make "FreeIPA" or "Use FreeIPA" an answer option. The quiz is ABOUT FreeIPA — every answer relates to FreeIPA already. Putting "FreeIPA" as an option makes it a giveaway.
- All 3 options must sound equally plausible to someone unfamiliar with the topic. Wrong options should be real technologies or real approaches — not obviously silly.
- Ask about SPECIFIC technical details: which protocol, which component, which command, which port, which file, which mechanism. Don't ask generic "what should you use?" questions.
- Good question types: "Which component does X?", "What protocol handles Y?", "What happens when Z?", "Which file/command configures X?", "What is the default behavior when Y?"
- Examples of GOOD options: "Kerberos TGT ticket" vs "SAML assertion" vs "OAuth2 token" — all real, all plausible.
- Examples of BAD options: "Use FreeIPA" vs "Use nothing" vs "Ask your professor" — one is obviously correct.
- Mix up which option position (1st, 2nd, 3rd) is correct — don't always put the correct answer first.

Formatting rules:
- Each question scenario: 1-2 sentences, maximum 25 words. Students have 25 seconds to read and answer.
- Each answer option: maximum 10 words. Prefer 4-7 word options.
- Exactly 3 answer options: 1 correct, 2 plausible-but-wrong.
- Explanation (1-2 sentences, max 25 words): teach something specific. Mention the actual component (SSSD, Dogtag, 389 DS, Kerberos, Certmonger, etc.).
- Concept category from: Single Sign-On, SSSD & Caching, Central Identity, Kerberos Tickets, Kerberos & Time Sync, Groups & RBAC, Least Privilege, Account Lifecycle, Password Policy, Certificates & Dogtag, Certmonger, Host Identity, Open Source, Sudo Rules, HBAC Rules, DNS & Discovery, Two-Factor Auth, Trust & AD, Audit & Logging, 389 Directory Server.
- Vary categories — don't repeat the same one more than twice.
- Frame as real problems: campus lab, student club server, hackathon, research cluster, dorm network.

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
              "Generate 10 challenging FreeIPA quiz questions. IMPORTANT: Do NOT use 'FreeIPA' as an answer option — it's too obvious. Instead ask about specific components, protocols, and mechanisms: e.g. 'Which daemon caches credentials for offline login?' (SSSD vs nscd vs autofs), 'What type of token does Kerberos issue?' (TGT vs JWT vs SAML), 'Which backend stores FreeIPA's LDAP data?' (389 DS vs OpenLDAP vs MariaDB). All 3 options must be real technologies that sound equally plausible. Use varied campus/lab/hackathon scenarios. Spread across different categories.",
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
