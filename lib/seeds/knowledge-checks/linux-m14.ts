import type { MCQuestion } from "@/lib/types/campaign";

// linux-m14 "Security Fundamentals" — covers lxa-s3 (Firewalls) + lxa-s4 (SELinux/AppArmor/Hardening)

export const LINUX_M14_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m14-q01",
    question:
      "You SSH into a remote server and type `iptables -P INPUT DROP` to set default-deny. Before the command returns, your terminal hangs. What happened?",
    choices: [
      { label: "A", text: "iptables refused to apply the policy because you were still connected" },
      { label: "B", text: "The new DROP policy applied to your in-flight SSH session, dropping your next packet because no ESTABLISHED-connections rule was in place first" },
      { label: "C", text: "The SSH daemon crashed from a race with iptables" },
      { label: "D", text: "`-P` is a no-op without a `COMMIT` — nothing actually changed" },
    ],
    correctAnswer: "B",
    explanation:
      "Firewall rules apply to **every** packet on the host, including your open SSH session. Without a prior rule accepting `ct state established,related`, your session's next ACK/keystroke is dropped by the new default policy. The fix: always pre-seed ESTABLISHED+RELATED *before* tightening the default policy, and ideally schedule an `at` job that auto-reverts in 5 minutes as a deadman switch.",
  },
  {
    id: "linux-m14-q02",
    question:
      "A developer on an Ubuntu server adds firewall rules with `ufw allow 443`. A week later, someone else adds rules directly with `iptables -A INPUT ...`. Why does this combination cause rule drift?",
    choices: [
      { label: "A", text: "iptables and ufw target different kernel subsystems" },
      { label: "B", text: "ufw manages its own rule file; hand-edited iptables rules aren't persisted by ufw and can be silently overwritten when ufw reloads" },
      { label: "C", text: "ufw requires a reboot to see iptables changes" },
      { label: "D", text: "ufw uses eBPF, bypassing the iptables chains entirely" },
    ],
    correctAnswer: "B",
    explanation:
      "ufw is a scripted wrapper that maintains its own rule file and re-applies them as a set on reload. Any hand-placed iptables rules exist only in the kernel's live table and get clobbered on the next `ufw reload`. The lesson: pick one management frontend per host and stick with it (ufw, firewalld, or raw nft/iptables) — don't mix.",
  },
  {
    id: "linux-m14-q03",
    question:
      "What is the purpose of the `ct state established,related accept` rule near the top of a nftables input chain?",
    choices: [
      { label: "A", text: "Block connection hijacking attempts" },
      { label: "B", text: "Let return traffic and related flows through without needing an explicit rule for every ephemeral port" },
      { label: "C", text: "Log all established connections for audit" },
      { label: "D", text: "Enable SYN-cookie protection" },
    ],
    correctAnswer: "B",
    explanation:
      "Conntrack tracks the state of every flow the kernel sees. Accepting ESTABLISHED (return traffic for flows we started) and RELATED (e.g., FTP data channels, ICMP error responses) is what makes stateful filtering practical — otherwise you'd need an explicit rule for every possible reply port. It goes near the *top* of the chain so it short-circuits common traffic before deeper rule processing.",
  },
  {
    id: "linux-m14-q04",
    question:
      "An API gateway under heavy load starts silently dropping new outbound connections. `dmesg` contains \"nf_conntrack: table full, dropping packet\". What's the fix?",
    choices: [
      { label: "A", text: "Disable conntrack entirely with `iptables -t raw ... -j NOTRACK`" },
      { label: "B", text: "Raise `net.netfilter.nf_conntrack_max`, and optionally tune timeouts like `nf_conntrack_tcp_timeout_established` down so idle flows expire faster" },
      { label: "C", text: "Increase the kernel's TCP backlog with `net.core.somaxconn`" },
      { label: "D", text: "Reboot — the table is a one-time allocation that can't grow at runtime" },
    ],
    correctAnswer: "B",
    explanation:
      "The conntrack table has a size limit (`nf_conntrack_max`). High-connection workloads exhaust the default. Raise the max (accounting for ~300 bytes of kernel memory per entry) and lower established-flow timeouts so idle connections free their slots sooner. `NOTRACK` is a hammer you'd only use on a dedicated-LB path where you don't need stateful filtering at all.",
  },
  {
    id: "linux-m14-q05",
    question:
      "A developer says their nginx service on RHEL works when SELinux is in `permissive` mode but fails with \"Permission denied\" in `enforcing`, even though DAC permissions are correct. What's the most appropriate first diagnostic command?",
    choices: [
      { label: "A", text: "`setenforce 0` — permanently switch to permissive" },
      { label: "B", text: "`ausearch -m avc -ts recent | audit2why` — read the actual SELinux denial reason" },
      { label: "C", text: "`chmod -R 777 /var/www` — widen the filesystem permissions" },
      { label: "D", text: "`systemctl restart selinux`" },
    ],
    correctAnswer: "B",
    explanation:
      "The failure pattern (works in permissive, fails in enforcing) is the signature of an SELinux denial. `ausearch -m avc -ts recent` pulls the Access Vector Cache denial log; piping to `audit2why` translates the cryptic output into a human explanation, often suggesting a boolean or label fix. `setenforce 0` masks the problem; widening DAC permissions doesn't address MAC at all; `selinux` isn't a systemd service.",
  },
  {
    id: "linux-m14-q06",
    question:
      "Your nginx is serving files from `/srv/newsite/` but getting 403 errors. The files have correct ownership. `ls -Z` reveals the file type is `default_t`. What's the correct persistent fix?",
    choices: [
      { label: "A", text: "`chcon -R -t httpd_sys_content_t /srv/newsite/`" },
      { label: "B", text: "`semanage fcontext -a -t httpd_sys_content_t \"/srv/newsite(/.*)?\"; restorecon -Rv /srv/newsite`" },
      { label: "C", text: "`setenforce 0`" },
      { label: "D", text: "`chmod -R o+r /srv/newsite`" },
    ],
    correctAnswer: "B",
    explanation:
      "`semanage fcontext` registers the path's correct label in the SELinux policy database, and `restorecon` applies it. This persists across relabels and reboots. `chcon` would work temporarily but doesn't survive a filesystem relabel. `setenforce 0` disables SELinux enforcement globally — removing the MAC layer for *every* service, not just nginx — and is never the production fix.",
  },
  {
    id: "linux-m14-q07",
    question:
      "Which sshd_config setting has the largest positive security impact with effectively zero operational downside for a team using SSH keys?",
    choices: [
      { label: "A", text: "`Port 2222` — moving SSH off port 22" },
      { label: "B", text: "`PasswordAuthentication no` — disabling password-based auth entirely" },
      { label: "C", text: "`Protocol 2` — enforcing SSHv2" },
      { label: "D", text: "`TCPKeepAlive no` — disabling keepalive" },
    ],
    correctAnswer: "B",
    explanation:
      "Passwords are the #1 SSH attack vector; brute-force attempts run constantly on every internet-facing port-22. Disabling password auth cuts that surface to zero. Port-knocking/moving port slows scanners a little but isn't real defense. `Protocol 2` is the default (and SSHv1 is long-deprecated). `TCPKeepAlive` is unrelated to security hardening.",
  },
  {
    id: "linux-m14-q08",
    question:
      "A teammate adds `deploy ALL=(root) NOPASSWD: ALL` to `/etc/sudoers.d/50-deploy` to \"let the CI agent run whatever it needs.\" What's the security implication?",
    choices: [
      { label: "A", text: "None — it's a standard pattern" },
      { label: "B", text: "`deploy` is now effectively a root account; if its SSH key leaks, the attacker has full root with no additional barrier" },
      { label: "C", text: "It's invalid syntax and `visudo` will reject it" },
      { label: "D", text: "Only interactive sessions are affected; CI runs are separate" },
    ],
    correctAnswer: "B",
    explanation:
      "`NOPASSWD: ALL` grants password-less execution of any command as root. That's root-equivalent. An attacker who compromises the `deploy` user's keys skips the normal sudo authentication step and owns the box. The correct pattern is to enumerate specific command paths (`/usr/bin/systemctl restart myapp.service`, etc.) with no wildcards, scoped to exactly what the automation needs.",
  },
  {
    id: "linux-m14-q09",
    question:
      "The difference between SELinux's `enforcing` and `permissive` modes is best described as:",
    choices: [
      { label: "A", text: "`enforcing` loads the policy; `permissive` doesn't" },
      { label: "B", text: "`enforcing` blocks and logs denials; `permissive` only logs denials while still allowing the action through" },
      { label: "C", text: "`enforcing` runs in the kernel; `permissive` runs in userspace" },
      { label: "D", text: "`enforcing` applies to system services; `permissive` applies to user processes" },
    ],
    correctAnswer: "B",
    explanation:
      "Both modes have the policy loaded and actively matching — the difference is the *response* to a denial. Enforcing blocks the action. Permissive lets the action succeed but logs the denial, which makes permissive extremely useful as a diagnostic mode: run the misbehaving service, collect the AVC messages, then build a targeted policy without production impact.",
  },
  {
    id: "linux-m14-q10",
    question:
      "On a Ubuntu server, which command tells you whether AppArmor is actively enforcing profiles and what profiles are loaded?",
    choices: [
      { label: "A", text: "`systemctl status apparmor` shows only whether the daemon is running" },
      { label: "B", text: "`aa-status` — lists profiles in enforce, complain, and unconfined modes" },
      { label: "C", text: "`dmesg | grep apparmor` — but only if violations are happening right now" },
      { label: "D", text: "`apparmor-check`" },
    ],
    correctAnswer: "B",
    explanation:
      "`aa-status` is the canonical status command: it prints how many profiles are loaded, which are in enforce mode, which are in complain (log-only) mode, and any unconfined processes that would normally be covered. `systemctl status apparmor` only tells you the daemon is running, not whether profiles are applied. `dmesg | grep apparmor DENIED` is useful for live violations but isn't a status snapshot.",
  },
];
