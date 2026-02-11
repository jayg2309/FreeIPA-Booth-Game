import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `Generate 10 tricky quiz questions about FreeIPA internals for college students at a tech booth.

HARD RULES — violating any of these makes the question REJECTED:
1. The word "FreeIPA" must NEVER appear in ANY answer option. Every option is already about FreeIPA.
2. No option may contain generic phrases like "centralized system", "identity platform", "security solution", "management tool", or "open-source solution". Be SPECIFIC.
3. All 3 options MUST be real, named technologies, protocols, daemons, file paths, commands, or standards. No vague descriptions.
4. A student who has never heard of FreeIPA should find all 3 options equally plausible. If one option "sounds more correct" than the others, the question is too easy.
5. Questions must test SPECIFIC knowledge, not common sense.

FreeIPA facts to draw from:
- SSSD caches credentials locally, enabling offline login. Config: /etc/sssd/sssd.conf
- 389 Directory Server is the LDAP backend (not OpenLDAP). Default port 389/636.
- MIT Kerberos handles authentication. Issues TGT tickets. kinit/klist/kdestroy commands. Requires time sync (NTP). Default realm is uppercase domain.
- Dogtag PKI manages certificates (not Let's Encrypt, not OpenSSL CA).
- Certmonger auto-renews certs via getcert command (not crontab, not systemd timer).
- DNS SRV records (_kerberos._tcp, _ldap._tcp) enable auto-discovery. BIND is the DNS backend.
- ipa-client-install enrolls a host (not ipa-join, not realm join).
- HBAC (Host-Based Access Control) restricts which users can log into which hosts.
- Sudo rules in FreeIPA are stored centrally in LDAP (not /etc/sudoers).
- OTP: supports TOTP and HOTP tokens natively (not FIDO2, not SMS).
- Cross-realm trust with AD uses Samba components (not ADFS, not Azure AD Connect).
- Replication: multi-master between replicas (not primary-secondary).
- Web UI runs on Apache with mod_wsgi (not Nginx, not Tomcat).
- ipa user-add / ipa group-add are CLI commands (not useradd, not ldapadd).

EXAMPLE GOOD QUESTIONS (generate new ones in this style, DO NOT copy these):

{"scenario":"Your lab's Linux machines need to log in even when the network is down. Which daemon caches credentials locally?","options":[{"text":"SSSD","isCorrect":true},{"text":"nscd","isCorrect":false},{"text":"nslcd","isCorrect":false}],"explanation":"SSSD caches Kerberos tickets and LDAP data so enrolled hosts work offline.","concept":"SSSD & Caching"}

{"scenario":"You need to check your active Kerberos ticket. Which command shows current tickets?","options":[{"text":"klist","isCorrect":true},{"text":"ticketctl status","isCorrect":false},{"text":"krb5-list","isCorrect":false}],"explanation":"klist displays cached Kerberos tickets. Use kinit to get a new one.","concept":"Kerberos Tickets"}

{"scenario":"The hackathon server needs its certificate renewed automatically. Which tool tracks cert expiry and renews it?","options":[{"text":"openssl cron job","isCorrect":false},{"text":"Certmonger","isCorrect":true},{"text":"Let's Encrypt certbot","isCorrect":false}],"explanation":"Certmonger monitors certs and auto-renews them via Dogtag CA.","concept":"Certmonger"}

{"scenario":"You want to enroll a new Linux laptop into the identity domain. Which command do you run?","options":[{"text":"realm join","isCorrect":false},{"text":"ipa-client-install","isCorrect":true},{"text":"ldap-enroll --host","isCorrect":false}],"explanation":"ipa-client-install configures SSSD, Kerberos, and DNS on the client.","concept":"Host Identity"}

{"scenario":"The club server stores user accounts in LDAP. Which directory server is the backend?","options":[{"text":"OpenLDAP","isCorrect":false},{"text":"Apache Directory","isCorrect":false},{"text":"389 Directory Server","isCorrect":true}],"explanation":"389 DS is the LDAP backend. It stores users, groups, hosts, and policies.","concept":"389 Directory Server"}

Categories to spread across (use each at most twice):
Single Sign-On, SSSD & Caching, Kerberos Tickets, Kerberos & Time Sync, Groups & RBAC, Least Privilege, Account Lifecycle, Password Policy, Certificates & Dogtag, Certmonger, Host Identity, Open Source, Sudo Rules, HBAC Rules, DNS & Discovery, Two-Factor Auth, Trust & AD, Audit & Logging, 389 Directory Server

Format: scenarios max 25 words, options max 10 words, explanation max 25 words. Vary correct answer position.

Return ONLY a JSON array of 10 objects (no markdown, no commentary):
[{"scenario":"...","options":[{"text":"...","isCorrect":true/false},...],"explanation":"...","concept":"..."}]`;

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
              "Generate 10 NEW tricky questions (different from the examples). Every option must be a specific named tool, command, protocol, daemon, or standard — never 'FreeIPA' itself, never vague descriptions. All 3 options must be real and equally plausible. Use campus/lab/hackathon scenarios. Vary categories.",
          },
        ],
        temperature: 0.9,
        max_tokens: 3500,
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
