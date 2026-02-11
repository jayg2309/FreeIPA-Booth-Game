import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `Generate 10 tricky quiz questions about FreeIPA internals for college students at a tech booth.

HARD RULES — violating any of these makes the question REJECTED:
1. The word "FreeIPA" must NEVER appear in ANY answer option. Every option is already about FreeIPA.
2. No option may contain generic phrases like "centralized system", "identity platform", "security solution", "management tool", or "open-source solution". Be SPECIFIC.
3. All 3 options MUST be real, named technologies, protocols, daemons, file paths, commands, or standards. No vague descriptions.
4. A student who has never heard of FreeIPA should find all 3 options equally plausible. If one option "sounds more correct" than the others, the question is too easy.
5. Questions must test SPECIFIC knowledge, not common sense.

REFERENCE DOCUMENTATION — use these projects and facts as source material for questions:

FreeIPA (https://freeipa.readthedocs.io/, https://www.freeipa.org):
- Integrated identity & policy management for Linux/UNIX networks
- Combines LDAP, Kerberos, DNS, NTP, and Certificate Authority into one solution
- CLI commands: ipa user-add, ipa group-add, ipa host-add, ipa sudorule-add, ipa hbacrule-add (NOT useradd, NOT ldapadd)
- Web UI runs on Apache HTTP Server with mod_wsgi (not Nginx, not Tomcat)
- ipa-server-install sets up the server; ipa-replica-install creates replicas
- Multi-master replication between replicas (not primary-secondary)
- Manages host keytabs, service principals, and automount maps
- Password policy: configurable min length, complexity, history, max failures, lockout duration
- Account lifecycle: stage → active → preserved users

SSSD — System Security Services Daemon (https://sssd.io/):
- Connects Linux clients to FreeIPA (or AD, LDAP)
- Caches credentials locally enabling offline login
- Config file: /etc/sssd/sssd.conf
- Provides NSS and PAM integration
- id_provider, auth_provider, access_provider configured per domain
- Replaces older nscd / nslcd daemons

389 Directory Server (https://www.port389.org/, https://directory.fedoraproject.org/):
- The LDAP backend for all FreeIPA data (users, groups, hosts, sudo rules, HBAC, DNS)
- NOT OpenLDAP, NOT Apache Directory Studio
- Default ports: 389 (LDAP), 636 (LDAPS)
- Uses cn=Directory Manager as the root admin DN
- Supports multi-supplier replication (changelog-based)
- Plugin architecture: memberOf, referential integrity, DNA (distributed numeric assignment)
- Schema: inetOrgPerson, posixAccount, krbPrincipalAux

MIT Kerberos (https://web.mit.edu/kerberos/):
- Provides ticket-based authentication (SSO)
- Key concepts: TGT (Ticket Granting Ticket), KDC (Key Distribution Center), realm, principal
- Commands: kinit (get ticket), klist (show tickets), kdestroy (remove tickets), kpasswd (change password)
- Realm name = UPPERCASE domain (e.g., EXAMPLE.COM)
- Requires time synchronization — max clock skew default is 5 minutes
- Service principal format: HTTP/host.example.com@EXAMPLE.COM
- Keytab file: /etc/krb5.keytab stores host/service keys
- Config: /etc/krb5.conf

Dogtag Certificate System (https://www.dogtagpki.org/):
- The CA (Certificate Authority) inside FreeIPA
- Issues and manages X.509 certificates
- NOT Let's Encrypt, NOT OpenSSL CA, NOT EJBCA
- Sub-systems: CA, KRA (Key Recovery Authority), OCSP, TKS, TPS
- Stores certs and keys in 389 DS
- Supports certificate profiles and automatic renewal

Certmonger (https://pagure.io/certmonger):
- Daemon that tracks certificate expiration and auto-renews
- Command: getcert list, getcert request, getcert start-tracking
- NOT crontab, NOT systemd timers, NOT certbot
- Works with Dogtag CA, self-signed, or external CAs
- Auto-enrolled during ipa-client-install

DNS / BIND (https://bind9.readthedocs.io/):
- FreeIPA includes integrated BIND DNS server
- SRV records for service discovery: _kerberos._tcp, _ldap._tcp, _kpasswd._tcp
- Clients use DNS to find KDC and LDAP servers automatically
- DNSSEC signing supported
- ipa dnsrecord-add / ipa dnszone-add commands
- Zone transfers between replicas

Samba / Trust with Active Directory (https://www.samba.org/):
- Cross-realm trust between FreeIPA and Microsoft Active Directory
- Uses Samba libraries (smbd, winbindd components)
- NOT ADFS, NOT Azure AD Connect, NOT Okta federation
- ipa trust-add command establishes trust
- Allows AD users to access Linux resources and vice versa
- ID range management for UID/GID mapping

NTP / Chrony (https://chrony-project.org/):
- Time sync is critical for Kerberos (max skew = 5 minutes)
- FreeIPA uses chronyd (replaced ntpd)
- If clocks are out of sync, Kerberos authentication fails silently

Automount (https://freeipa.readthedocs.io/en/latest/designs/automount.html):
- Centrally managed NFS mount maps stored in LDAP
- ipa automountmap-add, ipa automountkey-add
- Replaces local /etc/auto.master files

HBAC — Host-Based Access Control:
- Controls which users/groups can access which hosts/services
- ipa hbacrule-add, ipa hbacrule-add-user, ipa hbacrule-add-host
- Default rule: allow_all (often disabled in production)
- NOT TCP Wrappers, NOT firewall rules, NOT SELinux booleans

Sudo Rules:
- Centrally stored in LDAP (NOT /etc/sudoers, NOT sudoers.d files)
- ipa sudorule-add, ipa sudorule-add-allow-command
- Distributed via SSSD to enrolled clients
- Can scope by user, group, host, host group, and command

OTP / Two-Factor Auth:
- FreeIPA supports TOTP (time-based) and HOTP (counter-based) natively
- NOT FIDO2/WebAuthn, NOT SMS codes, NOT push notifications
- Configured per-user; token enrolled via Web UI or CLI
- ipa otptoken-add command

SELinux User Mapping:
- FreeIPA can map IPA users to SELinux contexts on enrolled hosts
- ipa selinuxusermap-add
- Ensures users get correct SELinux context at login

Vault / Secret Storage (KRA):
- FreeIPA's Key Recovery Authority stores secrets (passwords, keys)
- ipa vault-add, ipa vault-archive, ipa vault-retrieve
- Symmetric, asymmetric, or standard vault types

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
    const timeout = setTimeout(() => controller.abort(), 30_000);

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
