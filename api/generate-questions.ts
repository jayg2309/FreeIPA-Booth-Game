import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You generate quiz questions for a college tech conference booth about Linux identity management.

The students are beginners. The goal is to teach them cool facts and make them curious enough to Google things afterward. Questions should feel like fun trivia, not an exam.

TOPIC KNOWLEDGE (base every question on one of these facts):

1. SSSD is a daemon on Linux clients that caches your login credentials locally. If the network goes down, you can still log in because SSSD saved your info. Its config file is /etc/sssd/sssd.conf. It replaced older tools called nscd and nslcd.

2. 389 Directory Server is the LDAP database where all user accounts, groups, and policies live. It is a separate open-source project from OpenLDAP. It listens on port 389 for LDAP and port 636 for encrypted LDAPS. Its admin account is called "Directory Manager."

3. Kerberos is the authentication protocol — it uses tickets instead of sending passwords over the network. You type "kinit" to get a ticket called a TGT (Ticket Granting Ticket). "klist" shows your tickets. "kdestroy" deletes them. The Kerberos realm name is always UPPERCASE like EXAMPLE.COM. If your computer clock is off by more than 5 minutes, Kerberos breaks.

4. Dogtag is the built-in Certificate Authority that issues digital certificates for servers and services. It is different from Let's Encrypt and from using OpenSSL manually. It has a sub-component called KRA (Key Recovery Authority) for storing secret keys.

5. Certmonger is a daemon that watches your certificates and renews them automatically before they expire. You manage it with the "getcert" command. It is different from certbot (that is Let's Encrypt's tool).

6. DNS discovery: the system uses SRV records like _kerberos._tcp and _ldap._tcp so that client machines can automatically find the server without manual configuration. The DNS server is based on BIND.

7. Samba libraries are used to create a trust relationship with Microsoft Active Directory, letting Windows and Linux users share resources. The command is "ipa trust-add."

8. To enroll a Linux machine, you run "ipa-client-install." To set up a server, "ipa-server-install." To add a replica, "ipa-replica-install."

9. HBAC (Host-Based Access Control) rules control which users are allowed to log into which machines.

10. Sudo rules are stored centrally in LDAP and delivered to machines through SSSD. They replace editing /etc/sudoers files on each machine individually.

11. OTP support: time-based one-time passwords (TOTP, like Google Authenticator) and counter-based (HOTP) are supported natively. You add tokens with "ipa otptoken-add."

12. Time sync uses chronyd. If clocks are out of sync by more than 5 minutes, Kerberos authentication fails completely.

13. Replication is multi-master — every server can accept changes, unlike setups where only one primary server handles writes.

14. User lifecycle has three stages: staged (not yet active), active (can log in), and preserved (disabled but not deleted, for auditing).

15. The web interface runs on Apache HTTP Server with mod_wsgi.

QUESTION RULES:
- Write the scenario as a short, relatable campus/lab situation (1-2 sentences).
- Give exactly 3 answer options. Each option must be a specific technical name: a command, daemon, protocol, file path, port number, or tool.
- FORBIDDEN in answer options: the words "FreeIPA", "IPA", "identity management", "centralized", "security solution", or any vague phrase. Only specific technical names allowed.
- Wrong answers must be real things that exist and sound plausible. Example: if the right answer is "SSSD", good wrong answers are "nscd" and "nslcd" (all three are real Linux daemons).
- The correct answer should be in a different position (1st, 2nd, or 3rd) for each question.
- The explanation should be 1-2 sentences that teach a cool fact and make the student want to learn more.

Each question must also include a "docUrl" field — a direct link to relevant documentation or source code for that topic. Use these URLs based on the concept:
- SSSD → https://sssd.io/docs/introduction.html
- Kerberos → https://web.mit.edu/kerberos/
- Directory Server → https://www.port389.org/docs/389ds/documentation.html
- Certificates → https://www.dogtagpki.org/wiki/PKI_Main_Page
- Certmonger → https://pagure.io/certmonger
- DNS → https://freeipa.readthedocs.io/en/latest/designs/dns.html
- AD Trust → https://freeipa.readthedocs.io/en/latest/designs/adtrust.html
- Host Enrollment → https://freeipa.readthedocs.io/en/latest/designs/client.html
- HBAC → https://freeipa.readthedocs.io/en/latest/designs/hbac.html
- Sudo → https://freeipa.readthedocs.io/en/latest/designs/sudo.html
- OTP → https://freeipa.readthedocs.io/en/latest/designs/otp.html
- Time Sync → https://chrony-project.org/documentation.html
- Replication → https://www.port389.org/docs/389ds/design/replication.html
- User Lifecycle → https://freeipa.readthedocs.io/en/latest/designs/user-lifecycle.html
- Web UI → https://github.com/freeipa/freeipa/tree/master/install/ui

OUTPUT FORMAT — return ONLY a raw JSON array, no markdown, no commentary:
[{"scenario":"...","options":[{"text":"...","isCorrect":true},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false}],"explanation":"...","concept":"...","docUrl":"..."}]

The "concept" field should be one of: SSSD, Kerberos, Directory Server, Certificates, Certmonger, DNS, AD Trust, Host Enrollment, HBAC, Sudo, OTP, Time Sync, Replication, User Lifecycle, Web UI`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI generation not configured" });
  }

  // Support both OpenAI and Groq — detect from env or default to Groq
  const apiBase = process.env.AI_API_BASE || "https://api.groq.com/openai/v1";
  const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content:
              "Generate 10 questions. Use a different fact from the topic knowledge for each question. Make sure no answer option contains the word FreeIPA or IPA. Every option must be a real specific technical name. Put the correct answer in a different position each time.",
          },
        ],
        temperature: 0.85,
        max_tokens: 3500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`AI API ${response.status}: ${body.slice(0, 200)}`);
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

      // Fallback docUrl by concept if the AI didn't provide one
      const DOC_URLS: Record<string, string> = {
        "SSSD": "https://sssd.io/docs/introduction.html",
        "Kerberos": "https://web.mit.edu/kerberos/",
        "Directory Server": "https://www.port389.org/docs/389ds/documentation.html",
        "Certificates": "https://www.dogtagpki.org/wiki/PKI_Main_Page",
        "Certmonger": "https://pagure.io/certmonger",
        "DNS": "https://freeipa.readthedocs.io/en/latest/designs/dns.html",
        "AD Trust": "https://freeipa.readthedocs.io/en/latest/designs/adtrust.html",
        "Host Enrollment": "https://freeipa.readthedocs.io/en/latest/designs/client.html",
        "HBAC": "https://freeipa.readthedocs.io/en/latest/designs/hbac.html",
        "Sudo": "https://freeipa.readthedocs.io/en/latest/designs/sudo.html",
        "OTP": "https://freeipa.readthedocs.io/en/latest/designs/otp.html",
        "Time Sync": "https://chrony-project.org/documentation.html",
        "Replication": "https://www.port389.org/docs/389ds/design/replication.html",
        "User Lifecycle": "https://freeipa.readthedocs.io/en/latest/designs/user-lifecycle.html",
        "Web UI": "https://github.com/freeipa/freeipa/tree/master/install/ui",
      };

      const concept = String(q.concept ?? "FreeIPA");
      const docUrl = String(q.docUrl ?? "") || DOC_URLS[concept] || "https://www.freeipa.org";

      return {
        id: 2000 + i,
        scenario: String(q.scenario ?? ""),
        options: opts.map((o: any) => ({
          text: String(o.text ?? "")
            .replace(/\bFreeIPA\b/gi, "the identity system")
            .replace(/\bIPA\b/g, "the identity system"),
          isCorrect: Boolean(o.isCorrect),
        })),
        explanation: String(q.explanation ?? ""),
        concept,
        docUrl,
      };
    });

    return res.status(200).json({ questions });
  } catch (err: any) {
    console.error("AI generation failed:", err.message);
    return res.status(500).json({ error: "AI generation failed" });
  }
}
