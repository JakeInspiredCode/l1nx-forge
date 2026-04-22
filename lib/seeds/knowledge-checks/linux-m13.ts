import type { MCQuestion } from "@/lib/types/campaign";

// linux-m13 "systemd Deep Dive" — covers lxa-s1 (Units/Targets) + lxa-s2 (Timers/Overrides/cgroups)

export const LINUX_M13_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m13-q01",
    question:
      "A colleague tells you `systemctl status nightly-import.service` reports the unit as `active` but the job hasn't run in four days. `journalctl -u nightly-import` shows no errors. What's the most likely misconfiguration?",
    choices: [
      { label: "A", text: "The service is crashed but not reporting — run `systemctl restart` to force a fresh state" },
      { label: "B", text: "The `nightly-import.service` is a one-shot meant to be triggered by a `.timer` unit; the timer isn't enabled, so the service just sits dormant" },
      { label: "C", text: "`journalctl -u` only shows the last hour by default; errors are there but not being displayed" },
      { label: "D", text: "systemd caches unit status and needs `daemon-reload` to refresh it" },
    ],
    correctAnswer: "B",
    explanation:
      "Timers and services are separate units. `nightly-import.service` being 'active' with `Type=oneshot` just means it last exited cleanly — if its paired `.timer` isn't enabled, nothing is triggering it. Check `systemctl list-timers --all | grep nightly` and `systemctl status nightly-import.timer` to confirm. This is the archetypal systemd gotcha when migrating from cron.",
  },
  {
    id: "linux-m13-q02",
    question:
      "Which of these dependency directives does **not** create an ordering relationship between two units?",
    choices: [
      { label: "A", text: "`After=` — says \"start after\"" },
      { label: "B", text: "`Before=` — says \"start before\"" },
      { label: "C", text: "`Requires=` — pulls the unit in but does not order it" },
      { label: "D", text: "`After=multi-user.target` in the `[Unit]` section" },
    ],
    correctAnswer: "C",
    explanation:
      "`Requires=` is a **requirement** directive: it guarantees the other unit will be pulled into the transaction. It does NOT constrain start order. Without an accompanying `After=`, two units with a Requires relationship may start in parallel — which is the classic cause of \"sometimes the dependent service fails on boot\" bugs. The fix is to pair `Requires=X` with `After=X` on the same unit.",
  },
  {
    id: "linux-m13-q03",
    question:
      "A service makes HTTPS calls on startup. You add `After=network.target` and it still fails at boot with DNS resolution errors, though it works when restarted manually. What's the fix?",
    choices: [
      { label: "A", text: "Replace `After=network.target` with `After=network-online.target` and add `Wants=network-online.target`" },
      { label: "B", text: "Add `RestartSec=30` so the service retries after the network is up" },
      { label: "C", text: "Move the DNS resolver into the same unit file as a `BindsTo=` dependency" },
      { label: "D", text: "Change the start command to use `sleep 10` before the HTTPS call" },
    ],
    correctAnswer: "A",
    explanation:
      "`network.target` fires when networking is *configured* (NetworkManager has started) — not when the network is actually usable. `network-online.target` is the one that waits for carrier/route/DNS. You need both `After=network-online.target` (for order) and `Wants=network-online.target` (to pull it into the transaction at all). Without the `Wants`, nothing activates `network-online.target` for your unit's sake and the After is a no-op.",
  },
  {
    id: "linux-m13-q04",
    question:
      "You hand-edit `/etc/systemd/system/nginx.service.d/override.conf` to add `MemoryMax=1G`, then run `systemctl restart nginx`. The running service still has no memory cap. Why?",
    choices: [
      { label: "A", text: "`MemoryMax=` requires a kernel reboot to take effect" },
      { label: "B", text: "You forgot `sudo systemctl daemon-reload` — systemd is running the cached old unit file, not your edit" },
      { label: "C", text: "Drop-in files aren't read unless you re-enable the unit with `systemctl enable`" },
      { label: "D", text: "`MemoryMax` only works on `user.slice`, not `system.slice`" },
    ],
    correctAnswer: "B",
    explanation:
      "systemd parses unit files once and caches them. If you hand-edit a unit file (or its drop-in), `systemctl restart` reloads the *running* service — but from the cached old definition. `systemctl daemon-reload` is what re-reads the files from disk. `systemctl edit` does this for you automatically; hand-edits do not. This single gotcha eats a surprising amount of senior-engineer time.",
  },
  {
    id: "linux-m13-q05",
    question:
      "Which command would you run first when investigating \"this node is doing *something* weird after reboot\" with no more specific symptom?",
    choices: [
      { label: "A", text: "`dmesg | tail -100` — kernel ring buffer" },
      { label: "B", text: "`top` — see which process is hot" },
      { label: "C", text: "`systemctl list-units --failed` — every unit that tried to start and couldn't" },
      { label: "D", text: "`df -h` — check disk usage" },
    ],
    correctAnswer: "C",
    explanation:
      "When the question is \"something's off after reboot,\" the single most productive first command is `systemctl list-units --failed`. If a unit failed to start, it's flagged there with one-line status. Follow up with `journalctl -xe` for surrounding context. All the other commands are useful but assume you already know what you're looking for.",
  },
  {
    id: "linux-m13-q06",
    question:
      "You're migrating a cron job to a systemd timer. The job runs daily at 02:30 and you want every node in a 1000-node fleet to *eventually* run it, but not all at the same instant. Which configuration accomplishes this?",
    choices: [
      { label: "A", text: "`OnCalendar=*-*-* 02:30:00` plus `RandomizedDelaySec=900`" },
      { label: "B", text: "`OnCalendar=*-*-* 02:30:00` plus `Persistent=false`" },
      { label: "C", text: "`OnBootSec=9000` (fires ~2.5 hours after boot)" },
      { label: "D", text: "Put `sleep $((RANDOM % 900))` at the top of the script" },
    ],
    correctAnswer: "A",
    explanation:
      "`OnCalendar=*-*-* 02:30:00` sets the schedule. `RandomizedDelaySec=900` jitters each node's firing by up to 15 minutes, spreading 1000 nodes across a 15-minute window. This is the fleet-safety pattern: without it, a shared downstream (S3, a DNS server, a license server) sees 1000 simultaneous requests. The sleep hack works but hides the behavior from `systemctl list-timers`; the systemd way surfaces it.",
  },
  {
    id: "linux-m13-q07",
    question:
      "A service with `MemoryMax=4G` gets OOM-killed within seconds of starting, every time. `systemd-cgtop` confirms its cgroup hits 4.0G before death. Which statement is correct?",
    choices: [
      { label: "A", text: "`MemoryMax=` is a soft limit; it's being violated because the system has pressure from elsewhere" },
      { label: "B", text: "The cgroup enforcement is broken — raise the limit and file a kernel bug" },
      { label: "C", text: "`MemoryMax=` is a hard cap enforced by the kernel; the workload genuinely needs more than 4G, or it has a leak. Either raise the cap, use `MemoryHigh=` for throttling, or fix the leak" },
      { label: "D", text: "Only `user.slice` services honor `MemoryMax=`" },
    ],
    correctAnswer: "C",
    explanation:
      "`MemoryMax=` is a hard cap — when the cgroup tries to allocate past it, the kernel OOM-kills the offender. Working as intended. If the service genuinely needs more, raise the limit. If you want graceful degradation instead of hard kills, use `MemoryHigh=` which throttles before the kill threshold. If growth is unbounded, the cgroup just exposed a real leak you were silently ignoring.",
  },
  {
    id: "linux-m13-q08",
    question:
      "You need to see all log messages from the `sshd` service since the previous boot, at `err` priority or higher. Which `journalctl` invocation is correct?",
    choices: [
      { label: "A", text: "`journalctl sshd --last` " },
      { label: "B", text: "`journalctl -u sshd -b -1 -p err`" },
      { label: "C", text: "`journalctl -s sshd --priority=error`" },
      { label: "D", text: "`cat /var/log/sshd.log | grep ERROR`" },
    ],
    correctAnswer: "B",
    explanation:
      "`-u sshd` filters to the sshd unit. `-b -1` selects the previous boot (`-b` alone or `-b 0` is current; `-b -1` is the one before). `-p err` filters to error priority and above. Together that's exactly the scoped query you want. sshd doesn't write to `/var/log/sshd.log` by default on systemd-based systems — everything goes through the journal.",
  },
  {
    id: "linux-m13-q09",
    question:
      "A co-worker adds `ExecStart=/usr/local/bin/patched-nginx` directly to `/usr/lib/systemd/system/nginx.service`. What's the problem with this approach?",
    choices: [
      { label: "A", text: "systemd refuses to read files in `/usr/lib/systemd/system/` if they've been modified" },
      { label: "B", text: "`/usr/lib/systemd/system/` is package-managed; the next `apt upgrade` (or `yum update`) will overwrite the file and revert the change" },
      { label: "C", text: "`ExecStart=` can only appear in `.service.d/override.conf` drop-ins, never in the base unit" },
      { label: "D", text: "The file is read-only and the edit will silently fail" },
    ],
    correctAnswer: "B",
    explanation:
      "`/usr/lib/systemd/system/` holds vendor/package files and is managed by the package manager. Any direct edit survives only until the next package upgrade. The correct path is a drop-in: `/etc/systemd/system/nginx.service.d/override.conf` — systemd merges it with the vendor file, your change persists, and `apt upgrade` leaves your override alone. `systemctl edit nginx.service` creates this path for you.",
  },
  {
    id: "linux-m13-q10",
    question:
      "A service has `Requires=mysql.service` with no `After=`. You reboot; sometimes the dependent service comes up fine, sometimes it fails with \"connection refused\". On a `systemctl restart` after boot, it always works. Which best explains the intermittent failure?",
    choices: [
      { label: "A", text: "MySQL takes different amounts of time to initialize; `Requires=` without `After=` lets both units start in parallel, so the dependent service races MySQL's readiness" },
      { label: "B", text: "A race in systemd's kernel scheduler" },
      { label: "C", text: "`Requires=` is deprecated in newer systemd; use `Needs=` instead" },
      { label: "D", text: "The dependent service is leaking a socket from a previous run" },
    ],
    correctAnswer: "A",
    explanation:
      "`Requires=` guarantees the dependency is **started** — it says nothing about when, in what order, or whether it's ready. Without `After=mysql.service`, the two units can start in parallel. Your service may try to connect before MySQL has opened its listening socket; whether that race wins or loses depends on hardware, I/O timing, and other load. Manual `systemctl restart` after boot succeeds because MySQL is already fully up. Fix: always pair `Requires=X` with `After=X`. For services that need the *application* (not just the process) to be ready, you may additionally need `Type=notify` on the dependency or a readiness wrapper in `ExecStartPre=`.",
  },
];
