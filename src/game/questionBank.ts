export interface Question {
  id: number;
  scenario: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  concept: string;
  /** Optional link to related documentation or source code */
  docUrl?: string;
}

const allQuestions: Question[] = [
  // ═══════════════════════════════════════════
  // ── Central Identity & SSO (1–7) ──
  // ═══════════════════════════════════════════
  {
    id: 1,
    scenario:
      "A student has separate passwords for email, wiki, and Git. They keep forgetting them.",
    options: [
      { text: "Enable Single Sign-On", isCorrect: true },
      { text: "Write passwords on a sticky note", isCorrect: false },
      { text: "Use the same password everywhere", isCorrect: false },
    ],
    explanation:
      "FreeIPA provides SSO so one login works across all services — no sticky notes needed.",
    concept: "Single Sign-On",
  },
  {
    id: 2,
    scenario:
      "Each server in the lab has its own user database. Adding a new member takes hours.",
    options: [
      { text: "Centralize identity with FreeIPA", isCorrect: true },
      { text: "Clone the user file to each server", isCorrect: false },
      { text: "Give everyone the root password", isCorrect: false },
    ],
    explanation:
      "A central directory lets you add a user once and they're recognized everywhere.",
    concept: "Central Identity",
  },
  {
    id: 3,
    scenario:
      "Your campus has 50 Linux machines. A new student needs access to all of them today.",
    options: [
      { text: "Create one FreeIPA account", isCorrect: true },
      { text: "Create 50 local accounts manually", isCorrect: false },
      { text: "Share a group login", isCorrect: false },
    ],
    explanation:
      "Central identity means one account grants access to every enrolled machine automatically.",
    concept: "Central Identity",
  },
  {
    id: 4,
    scenario:
      "After a merger, two departments each have their own LDAP servers with overlapping usernames.",
    options: [
      { text: "Consolidate into one FreeIPA directory", isCorrect: true },
      { text: "Rename every user manually", isCorrect: false },
      { text: "Keep both and hope for the best", isCorrect: false },
    ],
    explanation:
      "A single authoritative directory eliminates conflicts and simplifies administration.",
    concept: "Central Identity",
  },
  {
    id: 5,
    scenario:
      "A professor needs temporary access to three research services. She doesn't want three logins.",
    options: [
      { text: "Use FreeIPA SSO with one account", isCorrect: true },
      { text: "Create three separate accounts", isCorrect: false },
      { text: "Share a lab-wide credential", isCorrect: false },
    ],
    explanation:
      "SSO means one credential, many services — exactly the convenience and security balance you need.",
    concept: "Single Sign-On",
  },
  {
    id: 6,
    scenario:
      "You're managing users with flat files (/etc/passwd) across 20 servers. Updating one user takes 20 edits.",
    options: [
      { text: "Enroll all servers into FreeIPA", isCorrect: true },
      { text: "Write a script to scp passwd files around", isCorrect: false },
      { text: "Give up and use one shared account", isCorrect: false },
    ],
    explanation:
      "FreeIPA replaces scattered local files with a single source of truth via LDAP + SSSD.",
    concept: "Central Identity",
  },
  {
    id: 7,
    scenario:
      "A student logs into the campus portal once but still gets prompted for credentials in Jupyter and GitLab.",
    options: [
      { text: "Configure Kerberos-based SSO for all web apps", isCorrect: true },
      { text: "Store the password in the browser", isCorrect: false },
      { text: "Tell the student to just type faster", isCorrect: false },
    ],
    explanation:
      "Kerberos-based SSO lets the browser forward your ticket automatically — no more re-typing.",
    concept: "Single Sign-On",
  },

  // ═══════════════════════════════════════════
  // ── Kerberos (8–13) ──
  // ═══════════════════════════════════════════
  {
    id: 8,
    scenario:
      "A user logs in once in the morning but has to re-enter credentials for every app.",
    options: [
      { text: "Issue a Kerberos ticket at login", isCorrect: true },
      { text: "Cache the password in each app", isCorrect: false },
      { text: "Remove authentication entirely", isCorrect: false },
    ],
    explanation:
      "Kerberos gives you a ticket-granting ticket (TGT) at login — apps trust the ticket, not a retyped password.",
    concept: "Kerberos Tickets",
  },
  {
    id: 9,
    scenario:
      "Two servers disagree on the current time by 10 minutes. Kerberos auth is failing.",
    options: [
      { text: "Sync clocks with NTP", isCorrect: true },
      { text: "Increase the password length", isCorrect: false },
      { text: "Restart both servers", isCorrect: false },
    ],
    explanation:
      "Kerberos tickets are time-sensitive. Clock skew > 5 min causes failures — NTP keeps things in sync.",
    concept: "Kerberos & Time Sync",
  },
  {
    id: 10,
    scenario:
      "A user's Kerberos ticket was issued 24 hours ago and SSH suddenly stops working.",
    options: [
      { text: "Renew or re-obtain the ticket (kinit)", isCorrect: true },
      { text: "Reboot the client machine", isCorrect: false },
      { text: "Disable Kerberos and use passwords only", isCorrect: false },
    ],
    explanation:
      "Kerberos tickets have a lifetime. Running 'kinit' refreshes your TGT — no reboot needed.",
    concept: "Kerberos Tickets",
  },
  {
    id: 11,
    scenario:
      "A password is being sent in plaintext over the network every time a user logs into a service.",
    options: [
      { text: "Switch to Kerberos — it never sends the password over the wire", isCorrect: true },
      { text: "Encrypt the password with Base64", isCorrect: false },
      { text: "Use a shorter password so less data is exposed", isCorrect: false },
    ],
    explanation:
      "Kerberos proves identity using tickets and encrypted exchanges — your password never crosses the network.",
    concept: "Kerberos Tickets",
  },
  {
    id: 12,
    scenario:
      "A service needs to verify it's really talking to the KDC and not an impersonator.",
    options: [
      { text: "Use mutual authentication built into Kerberos", isCorrect: true },
      { text: "Check the server's IP address", isCorrect: false },
      { text: "Trust that the network is safe", isCorrect: false },
    ],
    explanation:
      "Kerberos provides mutual authentication — both client and service prove their identity to each other.",
    concept: "Kerberos Tickets",
  },
  {
    id: 13,
    scenario:
      "Your keytab file, which stores service credentials, was accidentally left world-readable.",
    options: [
      { text: "Restrict permissions immediately and regenerate the keytab", isCorrect: true },
      { text: "It's fine — keytabs are encrypted anyway", isCorrect: false },
      { text: "Delete the keytab and disable the service", isCorrect: false },
    ],
    explanation:
      "A leaked keytab lets anyone impersonate that service. Regenerate it and lock down file permissions.",
    concept: "Kerberos Tickets",
  },

  // ═══════════════════════════════════════════
  // ── Groups / RBAC (14–19) ──
  // ═══════════════════════════════════════════
  {
    id: 14,
    scenario:
      "The robotics club needs access to the 3D printer server, but not the finance database.",
    options: [
      { text: "Create a 'robotics' group with targeted access", isCorrect: true },
      { text: "Give every club member admin rights", isCorrect: false },
      { text: "Let them use a shared account", isCorrect: false },
    ],
    explanation:
      "Groups let you grant exactly the right access — no more, no less. That's least privilege in action.",
    concept: "Groups & RBAC",
  },
  {
    id: 15,
    scenario:
      "An intern was accidentally added to the 'server-admins' group. They can delete VMs.",
    options: [
      { text: "Remove them from the group immediately", isCorrect: true },
      { text: "Hope they don't notice", isCorrect: false },
      { text: "Delete their entire account", isCorrect: false },
    ],
    explanation:
      "Fine-grained groups let you fix access mistakes without nuking the account. Audit your group memberships!",
    concept: "Least Privilege",
  },
  {
    id: 16,
    scenario:
      "Five teams each need access to different project repos. Managing per-user permissions is a nightmare.",
    options: [
      { text: "Create a group per team and assign repo access to groups", isCorrect: true },
      { text: "Give all five teams access to all repos", isCorrect: false },
      { text: "Have one person manage all commits", isCorrect: false },
    ],
    explanation:
      "Role-based groups scale: add a user to a team group and they instantly get the right repo access.",
    concept: "Groups & RBAC",
  },
  {
    id: 17,
    scenario:
      "A teaching assistant needs read access to student submissions but not write access to grades.",
    options: [
      { text: "Assign them to a 'TA' group with read-only rules", isCorrect: true },
      { text: "Give them full instructor access temporarily", isCorrect: false },
      { text: "Email grade files to them manually", isCorrect: false },
    ],
    explanation:
      "Granular group-based rules let you separate read and write privileges cleanly.",
    concept: "Groups & RBAC",
  },
  {
    id: 18,
    scenario:
      "A group called 'lab-users' should automatically include all members of 'physics-dept' and 'chem-dept'.",
    options: [
      { text: "Use nested groups — add both dept groups as members", isCorrect: true },
      { text: "Manually copy every user from both departments", isCorrect: false },
      { text: "Give everyone in the university lab access", isCorrect: false },
    ],
    explanation:
      "FreeIPA supports nested (indirect) groups — memberships cascade automatically.",
    concept: "Groups & RBAC",
  },
  {
    id: 19,
    scenario:
      "A developer left the company but is still in 12 different access groups.",
    options: [
      { text: "Disable the account — group access revokes automatically", isCorrect: true },
      { text: "Remove them from each group one by one", isCorrect: false },
      { text: "Just delete the groups", isCorrect: false },
    ],
    explanation:
      "Central identity means disabling one account cuts off all access immediately, regardless of group count.",
    concept: "Least Privilege",
  },

  // ═══════════════════════════════════════════
  // ── Account Lifecycle (20–24) ──
  // ═══════════════════════════════════════════
  {
    id: 20,
    scenario:
      "A student graduated last semester but still has active access to the research cluster.",
    options: [
      { text: "Disable the account centrally", isCorrect: true },
      { text: "Change the cluster password", isCorrect: false },
      { text: "Wait until the account expires on its own", isCorrect: false },
    ],
    explanation:
      "Central identity lets you disable access everywhere in one step — no orphaned accounts.",
    concept: "Account Lifecycle",
  },
  {
    id: 21,
    scenario:
      "A contractor's project ended a month ago. Nobody remembered to revoke their VPN access.",
    options: [
      { text: "Set account expiration dates upfront", isCorrect: true },
      { text: "Manually check every month", isCorrect: false },
      { text: "It's fine, they probably won't use it", isCorrect: false },
    ],
    explanation:
      "FreeIPA supports automatic account expiration — set it when onboarding and never forget deprovisioning.",
    concept: "Account Lifecycle",
  },
  {
    id: 22,
    scenario:
      "A new hire starts Monday. They need email, VPN, and lab access ready on day one.",
    options: [
      { text: "Create one FreeIPA account and add to the right groups", isCorrect: true },
      { text: "File three separate tickets to three teams", isCorrect: false },
      { text: "Lend them a colleague's login for the first week", isCorrect: false },
    ],
    explanation:
      "Centralized identity + groups means onboarding is one account creation, not a dozen manual steps.",
    concept: "Account Lifecycle",
  },
  {
    id: 23,
    scenario:
      "Summer interns arrive every June. You need 30 accounts created and removed by August.",
    options: [
      { text: "Batch-create accounts with expiration dates set to end of internship", isCorrect: true },
      { text: "Reuse last year's intern accounts", isCorrect: false },
      { text: "Give them all the same shared login", isCorrect: false },
    ],
    explanation:
      "Automating lifecycle with expiration dates means zero orphaned accounts after the program ends.",
    concept: "Account Lifecycle",
  },
  {
    id: 24,
    scenario:
      "A user changed departments but still has access to their old team's confidential data.",
    options: [
      { text: "Move them to the new department group and remove the old one", isCorrect: true },
      { text: "Assume they won't look at old data", isCorrect: false },
      { text: "Delete and recreate the account", isCorrect: false },
    ],
    explanation:
      "FreeIPA group management handles role transitions without recreating accounts.",
    concept: "Account Lifecycle",
  },

  // ═══════════════════════════════════════════
  // ── Password Policy (25–28) ──
  // ═══════════════════════════════════════════
  {
    id: 25,
    scenario: "Users are setting passwords like 'password123' and 'qwerty'.",
    options: [
      { text: "Enforce a strong password policy", isCorrect: true },
      { text: "Send a polite email reminder", isCorrect: false },
      { text: "Disable password login entirely", isCorrect: false },
    ],
    explanation:
      "FreeIPA lets you enforce minimum length, complexity, and history rules across all users centrally.",
    concept: "Password Policy",
  },
  {
    id: 26,
    scenario:
      "An attacker is brute-forcing a student's SSH login — thousands of attempts per minute.",
    options: [
      { text: "Enable account lockout after failed attempts", isCorrect: true },
      { text: "Change the SSH port number", isCorrect: false },
      { text: "Unplug the server", isCorrect: false },
    ],
    explanation:
      "Centralized lockout policy blocks brute-force across all enrolled services automatically.",
    concept: "Password Policy",
  },
  {
    id: 27,
    scenario:
      "A user keeps alternating between the same two passwords every time they're forced to change.",
    options: [
      { text: "Enforce password history — block reuse of recent passwords", isCorrect: true },
      { text: "Increase the change frequency to daily", isCorrect: false },
      { text: "Allow it — at least they're changing", isCorrect: false },
    ],
    explanation:
      "FreeIPA password policies include history checks that prevent cycling through old passwords.",
    concept: "Password Policy",
  },
  {
    id: 28,
    scenario:
      "Different departments want different password rules: IT needs 16 chars, marketing needs 10.",
    options: [
      { text: "Create per-group password policies in FreeIPA", isCorrect: true },
      { text: "Use the strictest rule for everyone", isCorrect: false },
      { text: "Let each department manage their own LDAP", isCorrect: false },
    ],
    explanation:
      "FreeIPA supports multiple password policies assigned to different groups — flexible and central.",
    concept: "Password Policy",
  },

  // ═══════════════════════════════════════════
  // ── Certificates (29–32) ──
  // ═══════════════════════════════════════════
  {
    id: 29,
    scenario:
      "A web service's TLS certificate expired overnight. Users see scary browser warnings.",
    options: [
      { text: "Renew the certificate via FreeIPA's CA", isCorrect: true },
      { text: "Tell users to click 'proceed anyway'", isCorrect: false },
      { text: "Switch the service to HTTP", isCorrect: false },
    ],
    explanation:
      "FreeIPA includes a built-in Certificate Authority — renew and track certs before they expire.",
    concept: "Certificates",
  },
  {
    id: 30,
    scenario:
      "A developer's laptop was stolen. It had a client certificate used to access internal APIs.",
    options: [
      { text: "Revoke the certificate immediately", isCorrect: true },
      { text: "Rotate every API key in the company", isCorrect: false },
      { text: "Nothing — laptops have disk encryption", isCorrect: false },
    ],
    explanation:
      "FreeIPA's CA lets you revoke individual certs instantly, blocking stolen credentials.",
    concept: "Certificates",
  },
  {
    id: 31,
    scenario:
      "You have 40 internal web services. Manually requesting certs from an external CA is slow and expensive.",
    options: [
      { text: "Use FreeIPA's built-in CA to issue certs internally", isCorrect: true },
      { text: "Run all 40 services on plain HTTP", isCorrect: false },
      { text: "Buy a wildcard cert and share the private key", isCorrect: false },
    ],
    explanation:
      "FreeIPA's integrated Dogtag CA issues and manages certs for internal services at no cost.",
    concept: "Certificates",
  },
  {
    id: 32,
    scenario:
      "A service auto-renews its certificate but the new cert has a different key. Clients stop trusting it.",
    options: [
      { text: "Ensure clients trust the FreeIPA CA root — individual cert keys can change safely", isCorrect: true },
      { text: "Pin the old certificate in every client", isCorrect: false },
      { text: "Disable auto-renewal to avoid surprises", isCorrect: false },
    ],
    explanation:
      "When clients trust the CA root, they'll accept any valid cert signed by it — rotation is seamless.",
    concept: "Certificates",
  },

  // ═══════════════════════════════════════════
  // ── Host / Service Identity (33–35) ──
  // ═══════════════════════════════════════════
  {
    id: 33,
    scenario:
      "Someone set up a rogue server on the network pretending to be the print server.",
    options: [
      { text: "Require host-based authentication via FreeIPA", isCorrect: true },
      { text: "Check the server room manually", isCorrect: false },
      { text: "Ignore it — probably a misconfiguration", isCorrect: false },
    ],
    explanation:
      "FreeIPA manages host identities too — only enrolled, authenticated machines are trusted.",
    concept: "Host Identity",
  },
  {
    id: 34,
    scenario:
      "A new server was added to the cluster but nobody can SSH into it using their FreeIPA credentials.",
    options: [
      { text: "Enroll the server into the FreeIPA domain (ipa-client-install)", isCorrect: true },
      { text: "Copy /etc/passwd from another server", isCorrect: false },
      { text: "Create local accounts for everyone", isCorrect: false },
    ],
    explanation:
      "Servers need to be enrolled into FreeIPA before they can authenticate domain users.",
    concept: "Host Identity",
  },
  {
    id: 35,
    scenario:
      "You want to restrict which users can log into a specific lab machine, not all machines.",
    options: [
      { text: "Use host-based access control (HBAC) rules in FreeIPA", isCorrect: true },
      { text: "Edit /etc/ssh/sshd_config on that one machine", isCorrect: false },
      { text: "Put a physical lock on the machine", isCorrect: false },
    ],
    explanation:
      "HBAC rules let you control who can access which hosts and services — all managed centrally.",
    concept: "Host Identity",
  },

  // ═══════════════════════════════════════════
  // ── Open Source & Community (36–39) ──
  // ═══════════════════════════════════════════
  {
    id: 36,
    scenario:
      "You find a bug in FreeIPA's web UI. What's the best first step?",
    options: [
      { text: "File a bug report on the public tracker", isCorrect: true },
      { text: "Complain on social media", isCorrect: false },
      { text: "Switch to a proprietary product", isCorrect: false },
    ],
    explanation:
      "FreeIPA is open source — filing bugs helps the whole community and your fix might ship in the next release!",
    concept: "Open Source",
  },
  {
    id: 37,
    scenario:
      "You want to add a feature to FreeIPA but you're 'just a student'.",
    options: [
      { text: "Fork the repo, make a PR — contributions welcome!", isCorrect: true },
      { text: "Wait until you're a senior engineer", isCorrect: false },
      { text: "Pay someone to do it", isCorrect: false },
    ],
    explanation:
      "Open-source projects thrive on student contributions. FreeIPA's community actively mentors new contributors.",
    concept: "Open Source",
  },
  {
    id: 38,
    scenario:
      "Your university wants identity management but can't afford a commercial product license.",
    options: [
      { text: "Use FreeIPA — it's completely free and open source", isCorrect: true },
      { text: "Build your own system from scratch", isCorrect: false },
      { text: "Just use spreadsheets to track accounts", isCorrect: false },
    ],
    explanation:
      "FreeIPA is enterprise-grade identity management with zero licensing cost — backed by Red Hat and a global community.",
    concept: "Open Source",
  },
  {
    id: 39,
    scenario:
      "You're reading FreeIPA's source code and notice the documentation for a feature is outdated.",
    options: [
      { text: "Submit a documentation patch — it's a valuable contribution", isCorrect: true },
      { text: "Ignore it — docs aren't real code", isCorrect: false },
      { text: "Wait for someone else to fix it", isCorrect: false },
    ],
    explanation:
      "Documentation contributions are highly valued in open source. It's often the easiest way to start contributing!",
    concept: "Open Source",
  },

  // ═══════════════════════════════════════════
  // ── Sudo / Privilege Escalation (40–42) ──
  // ═══════════════════════════════════════════
  {
    id: 40,
    scenario:
      "Every developer has unrestricted sudo on production servers 'because it's easier'.",
    options: [
      { text: "Define sudo rules centrally in FreeIPA", isCorrect: true },
      { text: "Remove sudo entirely", isCorrect: false },
      { text: "Log everything and hope for the best", isCorrect: false },
    ],
    explanation:
      "FreeIPA manages sudo rules centrally — grant only the specific commands each role needs.",
    concept: "Sudo Rules",
  },
  {
    id: 41,
    scenario:
      "A CI bot needs to restart a service on deploy but shouldn't have full root access.",
    options: [
      { text: "Grant a narrow sudo rule for just that command", isCorrect: true },
      { text: "Run the bot as root", isCorrect: false },
      { text: "Disable the service restart step", isCorrect: false },
    ],
    explanation:
      "Targeted sudo rules are a core FreeIPA feature — least privilege even for automation.",
    concept: "Sudo Rules",
  },
  {
    id: 42,
    scenario:
      "Sudo rules are scattered across 30 servers in /etc/sudoers files. Nobody knows who has what access.",
    options: [
      { text: "Migrate all sudo rules to FreeIPA for central management", isCorrect: true },
      { text: "Grep each server manually once a quarter", isCorrect: false },
      { text: "Remove sudoers files and give everyone root", isCorrect: false },
    ],
    explanation:
      "FreeIPA centralizes sudo rules so you can audit and update them from one place.",
    concept: "Sudo Rules",
  },

  // ═══════════════════════════════════════════
  // ── DNS & Service Discovery (43–45) ──
  // ═══════════════════════════════════════════
  {
    id: 43,
    scenario:
      "A student types 'ssh lab-server' but gets 'host not found'. The IP address works fine.",
    options: [
      { text: "Register the hostname in FreeIPA's integrated DNS", isCorrect: true },
      { text: "Tell everyone to memorize IP addresses", isCorrect: false },
      { text: "Edit /etc/hosts on every client machine", isCorrect: false },
    ],
    explanation:
      "FreeIPA includes an integrated DNS server — hostnames resolve automatically for enrolled clients.",
    concept: "DNS & Discovery",
  },
  {
    id: 44,
    scenario:
      "New machines join the network but clients can't find them by name until someone manually adds DNS records.",
    options: [
      { text: "Enable auto-DNS registration when hosts enroll in FreeIPA", isCorrect: true },
      { text: "Run a cron job to scan the network", isCorrect: false },
      { text: "Use IP addresses only", isCorrect: false },
    ],
    explanation:
      "FreeIPA can automatically create DNS records when hosts are enrolled — no manual zone editing.",
    concept: "DNS & Discovery",
  },
  {
    id: 45,
    scenario:
      "Kerberos clients can't automatically find the KDC because there are no SRV records in DNS.",
    options: [
      { text: "Let FreeIPA manage DNS — it creates Kerberos SRV records automatically", isCorrect: true },
      { text: "Hardcode the KDC address on every client", isCorrect: false },
      { text: "Disable Kerberos and use simple passwords", isCorrect: false },
    ],
    explanation:
      "FreeIPA's DNS integration publishes SRV records so clients auto-discover the KDC and other services.",
    concept: "DNS & Discovery",
  },

  // ═══════════════════════════════════════════
  // ── OTP / Two-Factor Auth (46–48) ──
  // ═══════════════════════════════════════════
  {
    id: 46,
    scenario:
      "A student's password was phished. You want to add a second factor to prevent future breaches.",
    options: [
      { text: "Enable OTP (one-time password) in FreeIPA", isCorrect: true },
      { text: "Make the password longer", isCorrect: false },
      { text: "Require password changes every week", isCorrect: false },
    ],
    explanation:
      "FreeIPA supports TOTP/HOTP tokens — even a stolen password is useless without the second factor.",
    concept: "Two-Factor Auth",
  },
  {
    id: 47,
    scenario:
      "Admins want 2FA for SSH but regular users only need passwords for now.",
    options: [
      { text: "Apply an OTP policy to the admin group only", isCorrect: true },
      { text: "Force 2FA on everyone or no one", isCorrect: false },
      { text: "Buy a separate 2FA product for admins", isCorrect: false },
    ],
    explanation:
      "FreeIPA allows per-user or per-group authentication policies — 2FA where it matters most.",
    concept: "Two-Factor Auth",
  },
  {
    id: 48,
    scenario:
      "A researcher lost their hardware OTP token. They're locked out of everything.",
    options: [
      { text: "Admin revokes the old token and issues a new one from FreeIPA", isCorrect: true },
      { text: "Disable 2FA for the whole organization", isCorrect: false },
      { text: "Tell them to buy a new token themselves", isCorrect: false },
    ],
    explanation:
      "FreeIPA's self-service + admin portal makes token management painless — revoke, reissue, done.",
    concept: "Two-Factor Auth",
  },

  // ═══════════════════════════════════════════
  // ── Trust & Federation (49–50) ──
  // ═══════════════════════════════════════════
  {
    id: 49,
    scenario:
      "Your Linux lab needs to let Windows Active Directory users log in without creating separate accounts.",
    options: [
      { text: "Set up a cross-realm trust between FreeIPA and AD", isCorrect: true },
      { text: "Manually sync passwords between AD and Linux", isCorrect: false },
      { text: "Replace all Linux machines with Windows", isCorrect: false },
    ],
    explanation:
      "FreeIPA supports AD trust — Windows users authenticate with their existing AD credentials on Linux.",
    concept: "Trust & Federation",
  },
  {
    id: 50,
    scenario:
      "Two organizations want to share a research cluster but each has their own identity system.",
    options: [
      { text: "Establish a trust relationship between the two domains", isCorrect: true },
      { text: "Merge both organizations into one directory", isCorrect: false },
      { text: "Create duplicate accounts in both systems", isCorrect: false },
    ],
    explanation:
      "Federation / cross-realm trusts let separate identity domains cooperate without merging.",
    concept: "Trust & Federation",
  },

  // ═══════════════════════════════════════════
  // ── Audit & Logging (51–53) ──
  // ═══════════════════════════════════════════
  {
    id: 51,
    scenario:
      "Someone deleted a critical group last night. Nobody knows who did it or when.",
    options: [
      { text: "Check FreeIPA's audit log — every change is recorded", isCorrect: true },
      { text: "Restore from backup and move on", isCorrect: false },
      { text: "Send an angry email to the whole team", isCorrect: false },
    ],
    explanation:
      "FreeIPA logs every administrative action with timestamps and the responsible user — full accountability.",
    concept: "Audit & Logging",
  },
  {
    id: 52,
    scenario:
      "An auditor asks: 'Who has had admin access in the last 90 days?' You have no records.",
    options: [
      { text: "Use FreeIPA's audit trail and group membership history", isCorrect: true },
      { text: "Guess from memory", isCorrect: false },
      { text: "Tell the auditor it's not possible to know", isCorrect: false },
    ],
    explanation:
      "Central identity with audit logging means you can answer compliance questions in minutes.",
    concept: "Audit & Logging",
  },
  {
    id: 53,
    scenario:
      "You suspect someone is adding themselves to privileged groups after hours.",
    options: [
      { text: "Review FreeIPA's change logs for group modifications", isCorrect: true },
      { text: "Disable group changes entirely", isCorrect: false },
      { text: "Assume good intentions and ignore it", isCorrect: false },
    ],
    explanation:
      "FreeIPA records who made what change and when — catch unauthorized escalations quickly.",
    concept: "Audit & Logging",
  },
];

/**
 * Returns `count` randomly-selected questions (shuffled).
 * Each question's options are also shuffled so the correct answer
 * isn't always in the same position.
 */
export function pickQuestions(count = 10): Question[] {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    ...q,
    options: [...q.options].sort(() => Math.random() - 0.5),
  }));
}
