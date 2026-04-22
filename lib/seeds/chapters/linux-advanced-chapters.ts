import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Deep Shell — Advanced Linux chapters (lxa-s1 .. lxa-s16)
// Audience: techs who cleared linux-core. Start where core left off.
// Each mission (linux-m13..linux-m20) pulls from 2 chapter sections.
// ═══════════════════════════════════════════════════════════════════════════

// ── linux-m13 systemd Deep Dive ─────────────────────────────────────────────

const lxaS1: ChapterSection = {
  id: "lxa-s1",
  topicId: "linux",
  title: "Units, Targets, and the systemd Mental Model",
  subtitle: "Everything on the system is a unit. Everything systemd does is wire them up.",
  icon: "⬢",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "systemd isn't a service you *debug* — it's the operating system's *air*. When a node won't boot, when a job disappears silently, when mounts come up in the wrong order, when a timer never fires — you're in systemd's territory. The `linux-core` side taught you *what to type*. Now you learn how to **read systemd's wiring diagram** so you can tell, in under a minute, whether a service is misconfigured, waiting on something upstream, or actually broken.",
    },
    {
      kind: "prose",
      html:
        "It's 3 AM. A colleague pings you: `nightly-import.service` hasn't run in four days. `systemctl status nightly-import` says it's **active**. `journalctl -u nightly-import` shows no errors. But the dashboard is flat and the data is stale. Somewhere in a web of units, targets, timers, and dependencies, someone wired this thing together in a way that *looks* right and *is* silently broken. Your job is to read the wiring.",
    },
    { kind: "heading", level: 3, text: "What systemd actually is" },
    {
      kind: "prose",
      html:
        "systemd runs as **PID 1** — the very first process the kernel hands control to — on almost every modern Linux distribution (RHEL/Alma/Rocky 7+, Ubuntu 16.04+, Debian 8+, Fedora, Arch, SUSE 12+). It replaced **SysV init** and **Upstart**. What it does differently: starts services **in parallel** from a declared **dependency graph**, activates services on demand via **sockets, timers, and paths**, isolates resources using **cgroups**, and ships a unified **structured log** (journald). One piece of software now covers what used to be four or five.",
    },
    { kind: "heading", level: 3, text: "Units — the nouns of systemd" },
    {
      kind: "prose",
      html:
        "Everything systemd manages is a **unit**. A unit is a text file in INI-ish format, with a type suffix (`.service`, `.timer`, `.mount`) that tells systemd what kind of thing it's looking at. A server in steady state has **hundreds** of units active; most you'll never touch, but you need to recognize the type when you see it.",
    },
    {
      kind: "collapsible",
      intro: "The unit types you'll actually interact with in production:",
      items: [
        {
          title: ".service — a process to run",
          body:
            "The workhorse: a long-running daemon (`nginx.service`, `sshd.service`) or a one-shot command. Roughly 80% of the units you'll edit are services. Key directives: `ExecStart=`, `User=`, `Restart=`, `Environment=`.",
          color: "#50C8FF",
        },
        {
          title: ".target — a grouping / synchronization point",
          body:
            "Targets don't *do* anything themselves — they represent a state (`multi-user.target`, `network-online.target`, `graphical.target`). You order other units relative to them. Think of them as SysV runlevels' smarter descendant.",
          color: "#FFA832",
        },
        {
          title: ".socket — activates a service on first connection",
          body:
            "The socket listens; systemd hands it to the service only when a client connects. Used for **socket activation** (e.g., `ssh.socket` starts sshd on demand). Saves resources for rarely-used services.",
          color: "#7AE87A",
        },
        {
          title: ".timer — a scheduled trigger",
          body:
            "Replaces most cron use. A `.timer` fires a same-named `.service` on a schedule — calendar-based (`OnCalendar=`) or elapsed-time (`OnBootSec=`, `OnUnitActiveSec=`). Failures log to journal; you can `systemctl status` it.",
          color: "#FF6B6B",
        },
        {
          title: ".mount / .automount — filesystem mounts",
          body:
            "Generated automatically from `/etc/fstab`, or hand-authored. Automount units mount lazily on first access. Debugging mount failures is easier when you `systemctl status srv-data.mount` than reading fstab by eye.",
          color: "#C58AFF",
        },
        {
          title: ".path — watches files and directories",
          body:
            "Triggers a service when a path appears, changes, or becomes non-empty. Useful for pipelines: drop a file in `/var/spool/in/`, a `.path` unit fires an importer `.service`.",
          color: "#5AD0D0",
        },
        {
          title: ".slice — a cgroup for resource isolation",
          body:
            "A named slice of memory/CPU/IO that many services can live inside. `user.slice` holds every user session; `system.slice` holds system services. You can create your own to cap a group of related services together.",
          color: "#50C8FF",
        },
        {
          title: ".scope — an externally-managed process group",
          body:
            "Used for processes systemd didn't start (login sessions, containers). You rarely author `.scope` units — systemd creates them on the fly via `systemd-run --scope`. Knowing they exist helps when reading `systemd-cgls`.",
          color: "#FFA832",
        },
      ],
    },
    { kind: "heading", level: 3, text: "The dependency graph — ordering is not requirement" },
    {
      kind: "prose",
      html:
        "When you `systemctl start nginx`, systemd doesn't just start nginx. It walks the **dependency graph**, pulls in every prerequisite, and brings the whole thing up in the right order. The directives that shape this graph trip up everyone at least once, because **ordering and requirement are orthogonal concepts**. Mixing them up is the single most common cause of \"the service comes up but fails sometimes on boot.\"",
    },
    {
      kind: "table",
      headers: ["Directive", "What it does", "Cascades on failure?"],
      rows: [
        ["`Wants=`", "Weak dependency — pull this unit in when I start", "No — if it fails, we still start"],
        ["`Requires=`", "Hard dependency — pull in and track", "Yes — if it fails, we fail too"],
        ["`Requisite=`", "Must already be active; don't start it yourself", "Yes — fails if prereq isn't up"],
        ["`BindsTo=`", "Like Requires, plus follow active state", "Yes — stops us when it stops"],
        ["`After=` / `Before=`", "**Ordering only** — doesn't imply presence", "N/A — just sequences the start"],
        ["`Conflicts=`", "Cannot be active at the same time", "Starting us stops the other"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The two-directive rule",
      body:
        "Most of the time you want **both** an ordering directive (`After=X`) **and** a requirement directive (`Wants=X` or `Requires=X`). One without the other is the bug. `Requires=` without `After=` lets both start in parallel — the dependent service can race ahead and crash on a not-ready dependency. `After=` without `Requires=` orders correctly but never pulls the dependency in if nothing else wants it.",
    },
    {
      kind: "code",
      label: "READING A UNIT'S DEPENDENCIES",
      language: "bash",
      code:
        "systemctl cat nginx.service                   # show the merged unit file (all drop-ins)\nsystemctl show nginx -p Requires -p Wants -p After\nsystemctl list-dependencies nginx               # tree of what nginx pulls in\nsystemctl list-dependencies nginx --reverse     # what pulls in nginx\nsystemctl list-units --failed                    # every unit in a failed state",
    },
    { kind: "heading", level: 3, text: "Targets — the synchronization points" },
    {
      kind: "prose",
      html:
        "In SysV init you changed 'runlevels' (0=halt, 1=single-user, 3=multi-user, 5=graphical). systemd replaces runlevels with **targets** — named synchronization points that group units. Booting into a target means \"bring up everything below this target in the graph.\" `default.target` is usually a symlink to `multi-user.target` on a server or `graphical.target` on a desktop.",
    },
    {
      kind: "flip-cards",
      intro:
        "The targets you'll actually invoke on a fleet. Flip each to remember when it applies.",
      cards: [
        {
          front: "`multi-user.target`",
          back: "Normal server boot: all services up, no GUI. Equivalent to SysV runlevel 3. `default.target` typically points here on headless servers.",
        },
        {
          front: "`graphical.target`",
          back: "Multi-user plus a display manager (GDM/SDDM/LightDM). Adds `display-manager.service` to multi-user. SysV runlevel 5.",
        },
        {
          front: "`rescue.target`",
          back: "Single-user mode with basic system up (filesystems mounted, no network services). Password required. Use for non-destructive recovery.",
        },
        {
          front: "`emergency.target`",
          back: "Absolute minimum — read-only root, no other filesystems. The 'init=/bin/bash' of systemd. Use when even rescue fails.",
        },
        {
          front: "`network-online.target`",
          back: "Network is **actually up** — a NIC has carrier, routes are installed, DNS usually works. Services needing outbound connectivity must `After=` AND `Wants=` this.",
        },
        {
          front: "`network.target`",
          back: "Network management is *configured* — NOT the same as up. Setting `After=network.target` is almost always wrong for services that make outbound calls on start.",
        },
      ],
    },
    {
      kind: "custom-component",
      id: "systemd-unit-graph",
      props: {
        title: "Explore a typical boot tree",
        caption:
          "Click a node to inspect its dependencies. Red edges are Requires; yellow edges are Wants; arrows show After/Before ordering.",
      },
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "The first command you run when things are broken",
      body:
        "`systemctl list-units --failed` lists every unit in a failed state on the system. Three-second summary of what's wrong. Combine with `journalctl -xe` (extended details for recent failures) to read the surrounding events. If you remember nothing else from this chapter, remember these two commands.",
    },
    {
      kind: "mcq-inline",
      question:
        "A service file has `Requires=postgresql.service` and nothing else — no `After=`, no `Wants=`. The service runs `psql -c ...` in its ExecStart. What happens at boot?",
      choices: [
        { label: "A", text: "systemd starts postgres first, then the service — `Requires=` implies ordering" },
        { label: "B", text: "Postgres and the service start in parallel; the service may race and fail to connect" },
        { label: "C", text: "The service refuses to start until postgres is confirmed listening on its port" },
        { label: "D", text: "systemd rejects the unit file at parse time because `Requires=` without `After=` is invalid" },
      ],
      correctAnswer: "B",
      explanation:
        "`Requires=` pulls postgres into the transaction but does *not* order the start. Without `After=postgresql.service`, systemd can (and will) start both in parallel. The dependent service often wins the race and fails to connect. Always pair the two: `Requires=postgresql.service` **and** `After=postgresql.service`.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You add `After=network.target` to a service that makes outbound HTTPS calls on startup. It fails intermittently at boot with DNS resolution errors, but works fine when restarted manually after boot completes. What's going on and what do you change?",
      hint:
        "`network.target` doesn't mean what most people think it means.",
      answer:
        "`network.target` fires once networking is **managed** — NetworkManager (or equivalent) has started and declared itself ready. It does NOT mean an interface has a carrier, a route is installed, or DNS is resolving. For services that need real outbound connectivity on start, you need **both** `After=network-online.target` and `Wants=network-online.target`. The `Wants` is the subtle part: without it, `network-online.target` is never pulled into the transaction, so your `After=` ordering is effectively a no-op. With both, systemd holds your service until `NetworkManager-wait-online` (or equivalent) confirms the network is genuinely up.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague shows you a `backup.service` file with a single dependency line: `Requires=nfs-client.target`. Backups occasionally fail with 'No such file or directory' on the NFS mountpoint. Walk through what's likely happening and how you'd fix the unit file.",
      answer:
        "`Requires=` pulls `nfs-client.target` into the transaction, so the NFS machinery is *started* alongside `backup.service` — but without an `After=nfs-client.target` directive, they start in parallel. backup.service can race ahead and try to read from the mountpoint before the NFS mount has completed, which surfaces as 'No such file or directory.' Two fixes, depending on what you need: (1) add `After=nfs-client.target` to sequence them, and ideally also `After=` the specific `.mount` unit (`srv-backup.mount`) so you wait for *that particular mount*, not just the NFS subsystem starting. (2) If this is a production-critical path, use `RequiresMountsFor=/srv/backup` which tells systemd specifically to ensure that mount is present before starting. Either way, the lesson is the mnemonic: **Wants/Requires = who comes with me; After/Before = in what order**. They're orthogonal and you almost always need both.",
    },
  ],
};

// ── lxa-s2 — Timers, Unit Overrides, and Resource Control ───────────────────

const lxaS2: ChapterSection = {
  id: "lxa-s2",
  topicId: "linux",
  title: "Timers, Unit Overrides, and Resource Control",
  subtitle: "How you make systemd do what *you* want, not just what the package shipped.",
  icon: "◐",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Running the default version of every service is how junior techs operate. Senior techs know that production nodes are a pile of **overrides** — timers tuned to the fleet's needs, resource limits preventing one runaway process from eating a rack, drop-ins that change `Restart=` without touching the vendor's unit file. This chapter is how to reach into systemd without breaking package upgrades.",
    },
    {
      kind: "prose",
      html:
        "A developer files a ticket: \"cron job `/etc/cron.d/report-generator` runs with different permissions depending on when it fires — sometimes as root, sometimes as the `reports` user. Can we fix it?\" You read the file. It's a classic mess: two cron entries, one with `USER=reports`, one without, both `*/30 * * * *`. No logs survive past `/var/log/cron`. No way to know which fired when. This is why teams migrate scheduled jobs off cron and into **systemd timers**.",
    },
    { kind: "heading", level: 3, text: "Timers — the modern cron" },
    {
      kind: "prose",
      html:
        "A systemd timer is **two files**: a `.timer` (the schedule) and a `.service` (what runs). By convention they share a name — `backup.timer` pairs with `backup.service`. Starting the timer schedules the service; the service is the unit that actually executes.",
    },
    {
      kind: "code",
      label: "ANATOMY OF A TIMER PAIR",
      language: "ini",
      code:
        "# /etc/systemd/system/backup.timer\n[Unit]\nDescription=Nightly backup\n\n[Timer]\nOnCalendar=*-*-* 02:30:00       # every day at 2:30 AM\nPersistent=true                   # run on boot if a fire was missed\nRandomizedDelaySec=300            # jitter up to 5 min across the fleet\n\n[Install]\nWantedBy=timers.target\n\n# /etc/systemd/system/backup.service\n[Unit]\nDescription=Nightly backup job\n\n[Service]\nType=oneshot\nUser=backup\nExecStart=/usr/local/bin/backup.sh\nNice=10",
    },
    {
      kind: "bullets",
      items: [
        "**`Persistent=true`** — if the node was off at the scheduled time, run the service on next boot. Fixes cron's silent missed-execution problem.",
        "**`RandomizedDelaySec=`** — adds up to N seconds of jitter. Critical at fleet scale; without it, 10,000 nodes all hit your S3 bucket at exactly 02:30:00.",
        "**`OnBootSec=`, `OnUnitActiveSec=`** — monotonic timers relative to boot or last run. Great for \"every 15 minutes while this unit has been running.\"",
        "**Logs live in the journal.** `journalctl -u backup.service` shows every run. No more scraping `/var/log/syslog` for `CRON:` lines.",
        "**Failures are first-class.** `systemctl status backup.timer` tells you the next scheduled run; `--failed` catches broken schedules.",
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "You want the timer to fire the first of every month at 03:15 AM with up to 10 minutes of jitter. Fill in the `OnCalendar=` and `RandomizedDelaySec=` values.",
      sentence:
        "OnCalendar={0}\nRandomizedDelaySec={1}",
      blanks: [
        {
          answer: "*-*-01 03:15:00",
          alternates: ["*-*-01 03:15", "monthly 03:15", "*-*-1 03:15:00"],
          hint: "YYYY-MM-DD HH:MM:SS",
        },
        {
          answer: "600",
          alternates: ["10min", "10m"],
          hint: "seconds",
        },
      ],
      reveal:
        "`OnCalendar=*-*-01 03:15:00` fires the 1st of every month at 03:15. `RandomizedDelaySec=600` spreads the fleet's firings across 10 minutes so downstream services don't see a thundering herd. Use `systemd-analyze calendar '*-*-01 03:15:00'` to verify a schedule expression before you commit it.",
    },
    {
      kind: "table",
      headers: ["", "cron", "systemd timer"],
      rows: [
        ["Logs", "Plain-text, often lost on rotation", "Journal — structured, filterable, retained"],
        ["Missed runs", "Silently skipped", "`Persistent=true` runs on next boot"],
        ["Jitter across fleet", "Manual (`sleep $((RANDOM % 600))`)", "`RandomizedDelaySec=`"],
        ["Dependencies", "None — order by hand", "Full unit graph (`After=`, `Requires=`)"],
        ["Resource control", "Limited (`ulimit` in script)", "`MemoryMax=`, `CPUQuota=`, slices"],
        ["Observability", "`crontab -l` + grep", "`systemctl list-timers` — scheduled runs at a glance"],
      ],
    },
    { kind: "heading", level: 3, text: "Unit overrides — how you edit without breaking upgrades" },
    {
      kind: "prose",
      html:
        "Unit files live in three places, in precedence order: **`/run/systemd/system/`** (runtime, volatile), **`/etc/systemd/system/`** (admin overrides, persistent), and **`/usr/lib/systemd/system/`** (vendor/package, never hand-edited). When the same unit name exists in multiple locations, systemd reads them all and higher-precedence files win. This is how you override a vendor's `nginx.service` without the next `apt upgrade` blowing away your changes.",
    },
    {
      kind: "prose",
      html:
        "The canonical way to override is a **drop-in**: a file at `/etc/systemd/system/<unit>.d/override.conf` that sets only the fields you want to change. The vendor's unit file stays untouched; your drop-in layers on top. `systemctl edit <unit>` does this for you — it opens `$EDITOR` on the right path and runs `daemon-reload` on exit.",
    },
    {
      kind: "code",
      label: "OVERRIDING WITHOUT REPLACING",
      language: "bash",
      code:
        "sudo systemctl edit nginx.service\n# opens /etc/systemd/system/nginx.service.d/override.conf\n\n# Example drop-in — cap memory and change restart policy only:\n# [Service]\n# MemoryMax=2G\n# Restart=on-failure\n# RestartSec=5s\n\nsudo systemctl daemon-reload      # needed whenever you hand-edit a file\nsudo systemctl restart nginx\nsystemctl cat nginx               # shows the merged result — base + drop-ins",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Always `daemon-reload` after you touch a unit file",
      body:
        "systemd caches parsed unit files in memory. If you `vim` a file and `systemctl restart`, you restart the *old* cached version — and the service starts \"clean\" but your change didn't apply. `systemctl edit` reloads for you; hand-edits don't. When a service comes up looking wrong despite your edit, this is the culprit 9 times out of 10.",
    },
    { kind: "heading", level: 3, text: "Resource control — cgroups via systemd" },
    {
      kind: "prose",
      html:
        "systemd puts every service into its own **cgroup** (control group) — the kernel mechanism that caps memory, CPU, I/O, and process count. Slices let you group services into a bigger bucket (`system.slice`, `user.slice`, or your own `ml-training.slice`). Limits set on a slice apply to everything inside it, so you can cap the whole inference fleet to 80% of the box without touching each service individually.",
    },
    {
      kind: "table",
      headers: ["Directive", "Purpose", "Example"],
      rows: [
        ["`MemoryMax=`", "Hard cap; process is OOM-killed if exceeded", "`MemoryMax=4G`"],
        ["`MemoryHigh=`", "Soft cap; throttles before OOM kill", "`MemoryHigh=3G`"],
        ["`CPUQuota=`", "% of one CPU — 200% = two cores", "`CPUQuota=150%`"],
        ["`CPUWeight=`", "Relative share (1–10000, default 100)", "`CPUWeight=500`"],
        ["`TasksMax=`", "Max PIDs/threads in the cgroup", "`TasksMax=512`"],
        ["`IOWeight=`", "Relative disk-I/O priority", "`IOWeight=200`"],
      ],
    },
    {
      kind: "code",
      label: "CAP A RUNAWAY SERVICE LIVE",
      language: "bash",
      code:
        "# Apply limits without editing a file — takes effect immediately:\nsudo systemctl set-property nginx.service MemoryMax=1G CPUQuota=50%\n\n# Inspect: what's actually applied right now?\nsystemctl show nginx.service -p MemoryMax -p CPUQuota\n\n# Live view of per-service resource usage — like `top` for cgroups:\nsystemd-cgtop\nsystemd-cgls                          # the whole tree\ncat /sys/fs/cgroup/system.slice/nginx.service/memory.current",
    },
    {
      kind: "flip-cards",
      intro:
        "Three commands that turn \"systemd is a black box\" into \"systemd is a dashboard.\"",
      cards: [
        {
          front: "`systemd-cgtop`",
          back: "Live top-like view sorted by CPU or memory *per cgroup*. Shows which service is actually spending your resources — not just which process.",
        },
        {
          front: "`systemd-cgls`",
          back: "Tree of the entire cgroup hierarchy: slices, services, scopes, and every process beneath them. Run it once and the mental model clicks.",
        },
        {
          front: "`systemd-run`",
          back: "Launch a one-off command under a transient unit — with full cgroup controls. `systemd-run --scope --slice=ops.slice -p MemoryMax=2G ./heavy.sh`",
        },
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "You set `MemoryMax=4G` on `ml-inference.service`. The service starts consuming 4G and gets OOM-killed within seconds, over and over. You watch `systemd-cgtop` and confirm the cgroup is at 4.0G when it dies. A teammate insists `MemoryMax` is broken. What's actually happening and how would you fix it?",
      hint: "`MemoryMax` is doing its job. The question is whether 4G is the right *limit* for this workload.",
      answer:
        "`MemoryMax` is a **hard cap** — the kernel OOM-kills the cgroup the instant it tries to allocate past the limit. If the service's working set genuinely needs more than 4G, capping it at 4G will kill it predictably. Three real fixes: (1) raise the limit to match the workload's real requirement (profile with `cgtop` or `systemd-cgls` over a few runs). (2) Use `MemoryHigh=` instead — that throttles the service before killing, giving you time to react. (3) If memory growth is a leak, the cgroup is exposing a bug you were ignoring; either fix the leak or set `Restart=on-failure` with `RestartSec=` so systemd recycles the process before it takes down a bigger blast radius. The cgroup is not broken — it's giving you ground truth about resource use you were previously guessing at.",
    },
    {
      kind: "knowledge-check",
      question:
        "Describe when you'd use `systemd-run --scope --slice=ops.slice -p MemoryMax=2G ./expensive.sh` instead of just running `./expensive.sh` directly. Walk through what the flags do and why an SRE would reach for this instead of, say, a bash script with `ulimit`.",
      answer:
        "`systemd-run` launches the command under a **transient unit** — systemd manages it the same way it manages any long-running service, with full cgroup controls, proper logging (journal), and clean shutdown. The flags: `--scope` means \"don't fork a new process; put *this shell's* work into a cgroup\" (alternative: omit `--scope` to fork into a .service-like transient). `--slice=ops.slice` puts it in a named slice where you've already set fleet-wide policies (say, total memory cap of 20G across all ops jobs). `-p MemoryMax=2G` caps this specific invocation. Why better than `ulimit`: ulimit is per-process and uses older RLIMIT mechanisms that many modern programs ignore or work around; cgroup-based limits are enforced by the kernel on the *whole tree of children*, logged, observable in `systemd-cgtop`, and can be adjusted live with `systemctl set-property`. For ad-hoc heavy jobs on production nodes, this is the difference between \"I hope it doesn't take the box down\" and \"the kernel will kill it if it tries.\"",
    },
  ],
};

// ── linux-m14 Security Fundamentals ─────────────────────────────────────────

const lxaS3: ChapterSection = {
  id: "lxa-s3",
  topicId: "linux",
  title: "Firewalls — netfilter, nftables, iptables, and the Frontends",
  subtitle: "The kernel decides what packets live or die. You're writing the rules.",
  icon: "▦",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "At hyperscale, the firewall is the **first layer of defense** between your fleet and the internet — and the fastest way for an overconfident tech to brick a production node from the other side of the country. Knowing the packet path through netfilter (not just what `iptables -L` spits out) is how you harden a server *and* how you recover when you or someone else accidentally blocks yourself.",
    },
    {
      kind: "prose",
      html:
        "It's a Wednesday afternoon. You SSH into `lab-gpu-07` to clean up some old firewall rules. You type `iptables -P INPUT DROP` to \"just set the default to deny and then allow what I want.\" The policy flips. The kernel immediately drops your SSH session's next packet because you hadn't yet added a rule allowing ESTABLISHED connections. Your terminal freezes. Ten minutes later, you're filing a BMC console ticket because the only way back in is the out-of-band port. This exact sequence plays out somewhere, every week, in every datacenter on earth. The firewall is not forgiving of the wrong order.",
    },
    { kind: "heading", level: 3, text: "The Linux firewall stack — one kernel, many frontends" },
    {
      kind: "prose",
      html:
        "Under the hood there is exactly one firewall: the kernel's **netfilter** subsystem. Everything else is a frontend that talks to netfilter. The two major programming interfaces are **iptables** (legacy, still ubiquitous) and **nftables** (its replacement since Linux 3.13, finally standard in all modern distros). On top of those sit two human-friendly wrappers: **firewalld** (RHEL/Fedora default) and **ufw** (Ubuntu default). Knowing which frontend is active — and whether it's layered on top of another — prevents a huge class of \"my rule vanished\" mysteries.",
    },
    {
      kind: "table",
      headers: ["Tool", "Role", "You'll see it on"],
      rows: [
        ["netfilter", "Kernel subsystem — actually filters packets", "Everything (it's the engine)"],
        ["iptables", "Legacy userspace CLI — most scripts still reference this", "Older Ubuntu, custom setups, ancient runbooks"],
        ["nftables (`nft`)", "Modern replacement — atomic updates, sets, maps, IPv4+IPv6 unified", "RHEL 8+, Debian 10+, modern Ubuntu"],
        ["firewalld", "Zone-based daemon on top of nftables", "RHEL/Fedora servers by default"],
        ["ufw", "Scripted wrapper on top of iptables/nftables", "Ubuntu desktops, small deployments"],
        ["eBPF / XDP", "Kernel-bypass packet filtering (Cilium, Katran)", "Hyperscale load balancers — beyond iptables"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Check which frontend is actually running before you touch anything",
      body:
        "`systemctl status firewalld nftables iptables`. On a modern RHEL box, firewalld likely owns the ruleset — touching raw `nft` commands behind its back will cause drift. On Ubuntu, ufw may be managing rules in its own way. Always match the tool to what the system expects.",
    },
    { kind: "heading", level: 3, text: "nftables — the modern mental model" },
    {
      kind: "prose",
      html:
        "nftables organizes rules into a three-layer hierarchy: **table → chain → rule**. A *table* groups rules by address family (`inet` for IPv4+IPv6 together, `ip` for IPv4-only, `ip6`, `arp`, `bridge`, `netdev`). A *chain* is a hook into the kernel's packet flow: `input` (traffic to us), `output` (traffic from us), `forward` (traffic through us, for routers), plus `prerouting` and `postrouting` for NAT. *Rules* inside a chain match packets and take actions (`accept`, `drop`, `reject`, `jump`, `log`).",
    },
    {
      kind: "code",
      label: "A MINIMAL SERVER RULESET (nftables)",
      language: "bash",
      code:
        "# /etc/nftables.conf\ntable inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n\n    # Always allow loopback and already-open connections FIRST.\n    iif \"lo\" accept\n    ct state established,related accept\n    ct state invalid drop\n\n    # ICMPv4 + ICMPv6 (needed for Path MTU Discovery and neighbor discovery).\n    ip protocol icmp accept\n    ip6 nexthdr icmpv6 accept\n\n    # SSH from the management network only.\n    ip saddr 10.99.0.0/16 tcp dport 22 accept\n\n    # HTTPS from anywhere.\n    tcp dport { 80, 443 } accept\n\n    # Log anything that got this far, then drop per the policy above.\n    log prefix \"nft-drop: \" level info\n  }\n\n  chain forward { type filter hook forward priority 0; policy drop; }\n  chain output  { type filter hook output  priority 0; policy accept; }\n}",
    },
    {
      kind: "bullets",
      items: [
        "**Order matters.** Rules are evaluated top-down. The first match wins (for terminal actions like `accept` or `drop`).",
        "**`ct state established,related accept` goes near the top.** It's cheap, it covers most legitimate traffic, and it prevents the lockout trap.",
        "**Policy `drop` at the bottom** is your safety net. Nothing unmatched gets through.",
        "**Log before drop** if you want to see what's being blocked. Use `nft monitor trace` for real-time trace of a specific packet through the ruleset.",
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "Translate this legacy iptables rule into nftables syntax. The rule: allow inbound TCP to port 8443 from any source.",
      sentence:
        "Legacy: iptables -A INPUT -p tcp --dport 8443 -j ACCEPT\nnftables: add rule inet filter input {0} dport {1} accept",
      blanks: [
        {
          answer: "tcp",
          alternates: ["TCP"],
          hint: "protocol",
        },
        {
          answer: "8443",
          hint: "port",
        },
      ],
      reveal:
        "`add rule inet filter input tcp dport 8443 accept`. The `inet` family means it matches both IPv4 and IPv6 in one rule — a big ergonomics win over iptables/ip6tables, where you had to maintain two parallel rulesets. Verify with `nft list ruleset`.",
    },
    { kind: "heading", level: 3, text: "iptables — the legacy you still have to read" },
    {
      kind: "prose",
      html:
        "Even on modern systems, half the runbooks and Stack Overflow answers are iptables. The key concepts map almost 1:1 to nftables, just with a different syntax and an older feel. iptables uses **tables** (`filter`, `nat`, `mangle`, `raw`) and **built-in chains** (`INPUT`, `OUTPUT`, `FORWARD`, `PREROUTING`, `POSTROUTING`).",
    },
    {
      kind: "collapsible",
      intro:
        "The four chains you'll actually touch. Click each for the canonical behavior and a common pitfall.",
      items: [
        {
          title: "`INPUT` — traffic destined for this host",
          body:
            "Rules here decide what the host itself accepts. `iptables -A INPUT -p tcp --dport 22 -j ACCEPT`. Pitfall: on containers/VMs, confusion between the host's INPUT chain and the guest's is a common incident cause.",
          color: "#50C8FF",
        },
        {
          title: "`OUTPUT` — traffic originating from this host",
          body:
            "Often left at `ACCEPT` on servers. Useful for blocking outbound to known-bad ranges or sanity-checking that a service isn't exfiltrating data. Pitfall: breaking package managers by blocking HTTPS outbound.",
          color: "#FFA832",
        },
        {
          title: "`FORWARD` — traffic through this host (routing)",
          body:
            "Only matters when IP forwarding is on (`/proc/sys/net/ipv4/ip_forward=1`), which turns the host into a router or NAT gateway. Relevant for container networking: Docker manipulates FORWARD extensively.",
          color: "#7AE87A",
        },
        {
          title: "`PREROUTING` / `POSTROUTING` (NAT table)",
          body:
            "The NAT chains. PREROUTING happens before routing decision — use for DNAT (port forwarding). POSTROUTING happens after — use for SNAT/MASQUERADE (making a LAN appear as one IP on the WAN). Pitfall: loopback NAT, aka 'hairpinning', needs special handling.",
          color: "#FF6B6B",
        },
      ],
    },
    {
      kind: "code",
      label: "iptables incantations you'll encounter in runbooks",
      language: "bash",
      code:
        "iptables -L -n -v --line-numbers           # list rules with packet counters, numeric, verbose\niptables -S                                 # print rules in save/restore format\niptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\niptables -I INPUT 1 -p tcp --dport 22 -j ACCEPT    # insert at top (-I, index 1)\niptables -D INPUT -p tcp --dport 22 -j ACCEPT      # delete an exact rule\niptables-save > /etc/iptables/rules.v4              # persist (location varies)\niptables-restore < /etc/iptables/rules.v4           # reload atomically",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "The \"don't lock yourself out\" pattern",
      body:
        "Before setting a default-DROP policy, always pre-seed the ESTABLISHED-RELATED rule so your current SSH session survives. Better: schedule a job like `at now + 5 minutes <<< 'iptables -F'` that auto-flushes the ruleset in 5 minutes unless you cancel it. If you lose your session, the revert still fires. Pros run these kinds of deadman switches in any risky-change scenario.",
    },
    { kind: "heading", level: 3, text: "Conntrack and state — why stateful filtering matters" },
    {
      kind: "prose",
      html:
        "`ct state established,related accept` isn't magic — it uses the **conntrack** subsystem, which tracks every flow the kernel sees and classifies each packet by its state. Dropping invalid states costs almost nothing; letting established traffic through is how you avoid writing a rule for every port an outbound connection might reply on.",
    },
    {
      kind: "flip-cards",
      intro: "The four conntrack states you'll reason about.",
      cards: [
        {
          front: "`NEW`",
          back: "A packet starting a new flow — a TCP SYN, a UDP datagram to a host never-before-seen, an ICMP echo-request. Your explicit accept rules (SSH port 22, HTTPS port 443) match this state.",
        },
        {
          front: "`ESTABLISHED`",
          back: "A packet belonging to an already-seen flow. The TCP ACK that replies to your SSH SYN. You accept these blanket to avoid writing a rule for every ephemeral source port.",
        },
        {
          front: "`RELATED`",
          back: "A new flow that is related to an existing one — most commonly FTP data channels, or ICMP errors (\"destination unreachable\") that belong to an existing TCP session. Accept these too.",
        },
        {
          front: "`INVALID`",
          back: "Packets that don't match any tracked flow or look malformed. Drop these unconditionally; they shouldn't reach your services.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You flip the default input policy to DROP with `nft add rule inet filter input drop` but your nftables ruleset does NOT have a `ct state established,related accept` rule. You apply it while SSH-ed into the box. What happens?",
      choices: [
        { label: "A", text: "Nothing — existing SSH sessions are exempt from firewall rules" },
        { label: "B", text: "Your SSH session hangs on the next packet and eventually times out; you've locked yourself out" },
        { label: "C", text: "The system reboots automatically to apply the policy cleanly" },
        { label: "D", text: "nftables refuses to apply a rule that could terminate its own control session" },
      ],
      correctAnswer: "B",
      explanation:
        "Firewall rules apply to all packets, including those on your open SSH session. Without an established-connections accept rule, your SSH ACKs and keystrokes get dropped at the next packet. The session hangs, the connection eventually times out, and you need BMC console access to recover. This is the textbook lockout that every tech falls into once — and then builds a deadman switch into every future change.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A dev team reports their app intermittently fails outbound HTTPS to a third-party API. tcpdump shows the SYN leaves, the SYN-ACK comes back, then your box silently drops the next packet. `iptables -L -v` shows no rule obviously matching. The box is under moderate load. What should you check?",
      hint: "conntrack is a table with a size limit.",
      answer:
        "You've almost certainly exhausted the conntrack table. The kernel drops new flows when the table is full and logs 'nf_conntrack: table full, dropping packet' to dmesg. Check `sysctl net.netfilter.nf_conntrack_count` vs `net.netfilter.nf_conntrack_max`. At high-connection loads (reverse proxies, API gateways), the default 65K or 262K limit falls over. Two fixes: raise `nf_conntrack_max` to match the workload (remember: each conntrack entry eats ~300 bytes of kernel memory), and lower `nf_conntrack_tcp_timeout_established` so idle flows expire faster. Also look at `dmesg | grep conntrack` for \"dropping packet\" messages — if you see those, it's confirmed.",
    },
    {
      kind: "knowledge-check",
      question:
        "A teammate wants to add \"just one rule\" to allow a new service on port 9090, but your nftables ruleset has a trailing `drop` as policy. Walk through the exact nft command, and explain why the *position* of the new rule in the chain matters.",
      answer:
        "The command: `nft insert rule inet filter input position 0 tcp dport 9090 accept` — or more commonly `nft add rule inet filter input tcp dport 9090 accept` which appends. Position matters because nftables evaluates rules top-down; the first terminal match wins. If your chain has `policy drop` at the bottom, any `accept` rule placed *above* the drop will let the traffic through. If you somehow placed your new rule *after* a bulk `drop` rule (possible if that drop was added first), packets would be dropped before your accept ever matched. In a default-deny setup, new service allows go near the top of the chain, below only the loopback/established/related accepts. Always verify with `nft list ruleset` after the change and confirm the rule is in the expected position.",
    },
  ],
};

const lxaS4: ChapterSection = {
  id: "lxa-s4",
  topicId: "linux",
  title: "SELinux, AppArmor, and Hardening the Shell",
  subtitle: "Mandatory access control, and the dozen sshd lines that stop most attacks.",
  icon: "⬣",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Unix permissions (`rwx`) answer *who* can do *what* to a file. That's **DAC** — discretionary access control. **MAC** — mandatory access control — is a separate layer beneath it that says: even if DAC allows this, the kernel can still refuse based on labels, profiles, or policy. SELinux and AppArmor are the MAC layer. They're the reason that an RCE in nginx can't just `cat /etc/shadow` — the kernel blocks it before the DAC check runs.",
    },
    {
      kind: "prose",
      html:
        "A developer pings you: \"The app works perfectly on my laptop but on prod it hits *Permission denied* the moment it tries to read its config file.\" You check ownership. Fine. You check modes. Fine. The user exists, the group exists, everything looks right. Then you run `getenforce` and see `Enforcing`. **This is an SELinux denial pretending to be a DAC problem.** The kernel's AVC (Access Vector Cache) silently said no — the standard error message doesn't distinguish. Learning to recognize this pattern saves you hours of staring at `ls -l` output.",
    },
    { kind: "heading", level: 3, text: "SELinux — labels, types, and domains" },
    {
      kind: "prose",
      html:
        "SELinux (Security-Enhanced Linux, originally NSA) assigns every process, file, port, and resource a **context label**. Policy rules describe which labels are allowed to interact. A typical context has three parts: `user_u:role_r:type_t`. The `type` is the one you'll actually reason about daily — `httpd_t` for the nginx/apache process, `httpd_sys_content_t` for files it's allowed to serve, `ssh_t` for sshd, and so on.",
    },
    {
      kind: "code",
      label: "READING LABELS",
      language: "bash",
      code:
        "ls -Z /var/www/html/index.html\n# -rw-r--r--. root root unconfined_u:object_r:httpd_sys_content_t:s0 index.html\n\nps -eZ | grep nginx\n# system_u:system_r:httpd_t:s0  12345 ?  00:00:01 nginx\n\ngetenforce                       # Enforcing | Permissive | Disabled\nsestatus                         # full SELinux status\nsealert -a /var/log/audit/audit.log    # human-readable AVC denials",
    },
    {
      kind: "collapsible",
      intro: "SELinux has three modes. Know which your system is in, and never disable lightly.",
      items: [
        {
          title: "`Enforcing` — policy is active and denials are blocked",
          body:
            "Production default on RHEL/Fedora. Violations log to the audit log AND are prevented. If something breaks, the fix is almost always a policy/label adjustment, not turning SELinux off.",
          color: "#FF6B6B",
        },
        {
          title: "`Permissive` — policy is active and denials are logged only",
          body:
            "Every denial is logged, but the action still succeeds. Use this for diagnostics: run the broken service, collect the AVC messages, then build a targeted policy. Never leave a production box permissive permanently.",
          color: "#FFA832",
        },
        {
          title: "`Disabled` — policy is not loaded at all",
          body:
            "Requires a reboot to switch to Enforcing (labels aren't maintained). Treat as a legacy migration mode only. If a team leaves prod on Disabled because \"SELinux is hard,\" they are giving up their MAC layer entirely.",
          color: "#50C8FF",
        },
      ],
    },
    {
      kind: "code",
      label: "DIAGNOSING AN AVC DENIAL",
      language: "bash",
      code:
        "# 1. Reproduce the failure, then inspect recent AVC messages:\nausearch -m avc -ts recent\n\n# 2. Translate the cryptic denial into a human-readable suggestion:\nausearch -m avc -ts recent | audit2why\n\n# 3. Generate a targeted policy module to allow the action:\nausearch -m avc -ts recent | audit2allow -M my_app_fix\nsudo semodule -i my_app_fix.pp     # load the module\n\n# 4. When the real fix is a wrong file label, not a policy gap:\nsudo semanage fcontext -a -t httpd_sys_content_t \"/srv/app(/.*)?\"\nsudo restorecon -Rv /srv/app",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Booleans before policy modules",
      body:
        "Before writing a custom policy, check if there's an SELinux boolean already designed for your case: `getsebool -a | grep httpd`. Need nginx to make outbound HTTP calls? `setsebool -P httpd_can_network_connect on`. Way safer than compiling a policy module every time.",
    },
    { kind: "heading", level: 3, text: "AppArmor — the simpler cousin" },
    {
      kind: "prose",
      html:
        "AppArmor (default on Ubuntu, SUSE, some Debian) does the same job with a different philosophy: **path-based profiles** instead of label-based. Each profile is a text file at `/etc/apparmor.d/<program>` that says \"this binary can read these paths, write these paths, and nothing else.\" Easier to author by hand; less granular for anything not-a-filesystem (network sockets, IPC).",
    },
    {
      kind: "table",
      headers: ["", "SELinux", "AppArmor"],
      rows: [
        ["Model", "Label-based (types on every object)", "Path-based (rules reference filesystem paths)"],
        ["Learning curve", "Steep — dozens of concepts", "Gentler — profiles are readable"],
        ["Granularity", "Very high — can confine any kernel object", "Good for files/paths, weaker elsewhere"],
        ["Default distro", "RHEL, Fedora, CentOS, Alma, Rocky", "Ubuntu, SUSE, some Debian"],
        ["Modes", "enforcing / permissive / disabled", "enforce / complain / unconfined"],
        ["Debug tools", "`ausearch`, `audit2why`, `audit2allow`", "`aa-logprof`, `aa-complain`, `aa-enforce`"],
      ],
    },
    {
      kind: "code",
      label: "APPARMOR CHEAT SHEET",
      language: "bash",
      code:
        "aa-status                            # what profiles are loaded, in what mode\naa-complain /etc/apparmor.d/usr.sbin.nginx     # put nginx profile in log-only mode\naa-enforce  /etc/apparmor.d/usr.sbin.nginx     # back to enforcing\ndmesg | grep apparmor | grep DENIED   # violations are logged here\naa-logprof                           # interactive: walks you through recent denials\n                                     # and generates profile entries",
    },
    { kind: "heading", level: 3, text: "SSH hardening — the high-leverage dozen lines" },
    {
      kind: "prose",
      html:
        "`sshd` is the single most-attacked service on any internet-facing Linux box. Most compromises happen through default settings that nobody ever questioned. The following `/etc/ssh/sshd_config` changes harden the surface dramatically with zero functional downside for a properly-run team:",
    },
    {
      kind: "code",
      label: "THE HARDENED sshd_config",
      language: "ini",
      code:
        "# /etc/ssh/sshd_config (relevant lines)\nPort 22\nAddressFamily any\nListenAddress 0.0.0.0\n\n# Never allow root to log in directly over SSH.\nPermitRootLogin no\n\n# No passwords at all — keys only.\nPasswordAuthentication no\nChallengeResponseAuthentication no\nPermitEmptyPasswords no\nUsePAM yes\n\n# Kill idle sessions so a forgotten terminal isn't a persistent foothold.\nClientAliveInterval 300\nClientAliveCountMax 2\n\n# Rate-limit and brute-force-bait.\nMaxAuthTries 3\nMaxSessions 10\nLoginGraceTime 30\n\n# Tight scope — only specific users/groups can log in.\nAllowGroups sshusers\n\n# Log verbosely so fail2ban / crowdsec has something to chew on.\nLogLevel VERBOSE",
    },
    {
      kind: "bullets",
      items: [
        "**`PermitRootLogin no`** — force people to log in as themselves, then `sudo`. Audit trails become legible. Worth it even for sole operators.",
        "**`PasswordAuthentication no`** — passwords are the attack surface. Keys only. Pair with key rotation and a central key management system.",
        "**`ClientAliveInterval 300`** — kill dead sessions after 10 minutes. An unattended terminal in a coffee shop is a threat model.",
        "**`AllowGroups sshusers`** — explicit allow-list. If a new service account accidentally gets a shell, it's not reachable via SSH.",
        "**Two-factor** — `pam_google_authenticator` or hardware tokens (YubiKey + `u2f_mapping`). Big leap in protection for a small implementation cost.",
      ],
    },
    { kind: "heading", level: 3, text: "sudo discipline — drop-ins, timeouts, NOPASSWD" },
    {
      kind: "prose",
      html:
        "`/etc/sudoers` is almost never the right file to edit. The right file is `/etc/sudoers.d/<thing>` — a drop-in that `visudo` validates. This keeps your changes scoped, reviewable, and upgrade-safe. Two patterns that cover 95% of what operators want:",
    },
    {
      kind: "code",
      label: "Two good sudoers.d patterns",
      language: "bash",
      code:
        "# /etc/sudoers.d/10-ops-team\n# Ops group: full sudo, with password prompt, timeout 5 min.\n%ops    ALL=(ALL:ALL) ALL\nDefaults:%ops  timestamp_timeout=5\n\n# /etc/sudoers.d/20-ansible-bootstrap\n# A narrow NOPASSWD rule for automation, scoped to exact commands.\nansible ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx, \\\n                              /usr/bin/systemctl reload nginx, \\\n                              /usr/bin/apt-get install -y *, \\\n                              /usr/bin/apt-get update",
    },
    {
      kind: "fill-blank",
      prompt:
        "Write a sudoers.d rule that lets the `deploy` user run **only** `systemctl restart myapp.service` without a password, and nothing else.",
      sentence:
        "deploy ALL=({0}) {1}: /usr/bin/systemctl restart myapp.service",
      blanks: [
        {
          answer: "root",
          alternates: ["ALL", "ALL:ALL"],
          hint: "target user",
        },
        {
          answer: "NOPASSWD",
          alternates: ["nopasswd"],
          hint: "keyword",
        },
      ],
      reveal:
        "`deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart myapp.service`. Narrow the target user (`root`), the command path (absolute — *never* `/usr/bin/*` or bare `systemctl`), and list only what's genuinely needed. Save under `/etc/sudoers.d/50-deploy` and validate with `visudo -cf /etc/sudoers.d/50-deploy` before trusting it.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "NOPASSWD on a wildcard is a root-equivalent grant",
      body:
        "`deploy ALL=(root) NOPASSWD: ALL` or `NOPASSWD: /usr/bin/*` effectively makes `deploy` a root account. If that user's SSH key leaks, game over. Scope every NOPASSWD rule to specific absolute paths with no wildcards — and prefer a password prompt if the action is infrequent.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A service runs fine with `setenforce 0` (permissive) but fails with \"Permission denied\" in enforcing. `ls -Z` shows the files are labeled `httpd_sys_content_t`. The service is nginx serving from `/srv/newsite/`. What's the actual command to fix it permanently?",
      hint:
        "SELinux doesn't care about the path you expect — it cares about the label it actually finds.",
      answer:
        "The file labels *look* right, but the issue is usually that `/srv/newsite/` itself isn't registered with SELinux as a web-content location. Two steps: (1) `sudo semanage fcontext -a -t httpd_sys_content_t \"/srv/newsite(/.*)?\"` — registers the path with the file-context database, so relabeling and future file creation uses the right type. (2) `sudo restorecon -Rv /srv/newsite` — actually applies the labels now. A bare `chcon` would *also* fix it temporarily but won't survive a relabel event (`fixfiles relabel` or a reboot with `.autorelabel` set). Always use `semanage fcontext` + `restorecon` as the pair — that's the persistent fix.",
    },
    {
      kind: "knowledge-check",
      question:
        "A new hire sets `setenforce 0` \"so the deploy works\" and closes the ticket. A month later, the box is compromised through a known nginx vulnerability that SELinux would have contained. How would you coach them on the right workflow the next time SELinux blocks a legitimate action — and what three commands should they have run instead?",
      answer:
        "The workflow: treat SELinux denials as bugs to *fix*, not as features to *disable*. The muscle memory should be (1) `ausearch -m avc -ts recent` — see exactly what was denied. (2) `audit2why` (or `sealert`) — translate the denial into a human explanation, often including a suggested fix (commonly a boolean or a missing label). (3) Either toggle the boolean (`setsebool -P httpd_can_network_connect on`) or apply the correct file context (`semanage fcontext -a -t X \"path\"` + `restorecon`) or, as a last resort, generate a targeted policy module (`audit2allow -M my_fix && semodule -i my_fix.pp`). The coaching point: `setenforce 0` is a global switch that removes the MAC layer for *every* service on the box. Fixing one broken service that way disables SELinux for sshd, cron, your database, and the rest. It's never the right answer on a production host — it's a diagnostic tool, not a fix.",
    },
  ],
};

// ── linux-m15 Bash Scripting ────────────────────────────────────────────────

const lxaS5: ChapterSection = {
  id: "lxa-s5",
  topicId: "linux",
  title: "Scripting Fundamentals — Quoting, Exit Codes, and `set -euo`",
  subtitle: "Bash is the glue of operations. Write it like it'll run on 10,000 nodes, because it will.",
  icon: "❯",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Every senior operator carries a handful of **scripts that have run without incident for years**. And every team also has a drawer full of one-offs that *seemed* to work until the day a filename contained a space, or a grep returned zero lines, or a pipe failed in the middle. The difference between those two outcomes is a dozen mechanical habits. This chapter is those habits.",
    },
    {
      kind: "prose",
      html:
        "A monitoring script you wrote eight months ago has been \"running\" on 200 nodes. Today someone notices the metrics are all zero. You read the script. It starts with `#!/bin/bash` and — that's it. No `set -e`. No `set -u`. The third line does `cd /var/log/$APP` where `APP` is an env var that was silently unset. `cd /var/log/` succeeds. The next line does `rm -rf ./old/*`, which is now running in `/var/log/`. The only reason you aren't fired is that the `rm` matched nothing. Every line in that script needs one of the mechanical habits in this chapter. We fix it now so you don't have to learn the lesson the other way.",
    },
    { kind: "heading", level: 3, text: "Variables, quoting, and word splitting" },
    {
      kind: "prose",
      html:
        "Bash splits unquoted variables on whitespace. That's the single biggest foot-gun in the language. `rm -rf $DIR` works until `DIR=\"my logs\"` — then you're running `rm -rf my logs` which tries to delete both `my` and `logs`. The rule is: **quote every variable expansion, always, unless you have a specific reason not to.**",
    },
    {
      kind: "table",
      headers: ["Syntax", "What it does", "When to use"],
      rows: [
        ['`"$var"`', "Expands the variable, preserves it as one word even if it contains spaces", "Default for almost everything"],
        ['`\'$var\'`', "Single quotes — no expansion at all; literal dollar sign", "When you truly want the literal text"],
        ['`$var`', "Unquoted — expands AND word-splits AND glob-expands", "Rarely correct; only for unique-token scenarios"],
        ['`"${var}"`', "Same as quoted, but braces help disambiguate", '`"${name}_log"` vs `"$name_log"` (the latter reads $name_log)'],
        ['`"${var:-default}"`', "Expand, use 'default' if unset or empty", "Graceful handling of missing env vars"],
        ['`"${var:?message}"`', "Expand, error out if unset or empty", "Fail fast at the top of a script"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The `$*` vs `$@` trap",
      body:
        '`"$@"` expands to the script arguments, each as a separate quoted word. `"$*"` joins them into one string. Almost always you want `"$@"`. Passing `"$*"` through to another command merges arguments that had spaces and breaks things in hard-to-reproduce ways. Remember: **`"$@"` is the one that preserves arguments correctly**.',
    },
    { kind: "heading", level: 3, text: "Exit codes — every command speaks in numbers" },
    {
      kind: "prose",
      html:
        "Every command that runs returns an **exit code**: 0 for success, anything else for failure (conventionally 1–255). Bash tracks the last one in `$?`. A script that doesn't check exit codes is a script that happily continues after a critical step failed, producing zero output and no errors.",
    },
    {
      kind: "code",
      label: "THE THREE-LINE PREAMBLE EVERY SCRIPT NEEDS",
      language: "bash",
      code:
        "#!/usr/bin/env bash\nset -euo pipefail\nIFS=$'\\n\\t'\n\n# -e           exit immediately if any command fails (non-zero return)\n# -u           treat unset variables as errors\n# -o pipefail  a pipeline's exit code is the first non-zero step, not the last\n# IFS=$'\\n\\t'  use only newline and tab as field separators — not space\n#              (prevents word-splitting on filenames with spaces)",
    },
    {
      kind: "collapsible",
      intro:
        "Each flag in that preamble prevents a specific class of bug. Click to see the classic failure it stops.",
      items: [
        {
          title: "`set -e` — exit on error",
          body:
            "Without it: `cp /src/file /dst/ && echo done` — if cp fails, the script prints 'done' anyway unless you check `$?`. With `set -e`, the cp failure aborts the script. Caveat: `set -e` doesn't fire inside conditionals (`if cmd`, `cmd || other`, `cmd && other`) — that's by design.",
          color: "#FF6B6B",
        },
        {
          title: "`set -u` — unset variables are errors",
          body:
            "Without it: `rm -rf $DIR` silently becomes `rm -rf` (no args, no-op) if `DIR` is unset — or worse, `rm -rf /$DIR` becomes `rm -rf /`. With `set -u`, referencing an unset `DIR` aborts the script immediately with a clear error.",
          color: "#FFA832",
        },
        {
          title: "`set -o pipefail` — pipelines report the first failure",
          body:
            "Without it: `curl bad-url | grep token` returns 0 if curl fails but grep succeeds on nothing, because only the last command's exit code matters. With `pipefail`, the pipeline fails if any stage fails — so you can actually trust `&&` after a pipe.",
          color: "#50C8FF",
        },
        {
          title: "`IFS=$'\\n\\t'` — no word-split on spaces",
          body:
            "Without it: `for f in $(ls *.log)` breaks if any filename contains a space. With a narrow IFS, command-substitution output is split only on newlines and tabs — which is almost always what you wanted anyway.",
          color: "#7AE87A",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Conditionals — `[`, `[[`, and `((`" },
    {
      kind: "prose",
      html:
        "Bash has three conditional forms. Most ops scripts only need one of them, but knowing which is which prevents subtle bugs.",
    },
    {
      kind: "table",
      headers: ["Form", "Purpose", "Example"],
      rows: [
        ['`[ ... ]` (a.k.a. `test`)', "POSIX string/file tests — portable, quirky", '`[ -f "$f" ] && echo "exists"`'],
        ['`[[ ... ]]`', "Bash-only, safer — no word-split, supports `=~`, `&&`, `\\|\\|`", '`[[ "$s" =~ ^v[0-9]+$ ]]`'],
        ['`(( ... ))`', "Integer arithmetic — inside, no `$` on variables", '`(( count > 5 )) && echo big'],
        ['`[ -z "$x" ]`', "True if string is empty", '`[ -z "${DIR:-}" ] && exit 1`'],
        ['`[[ -n "$x" ]]`', "True if string is non-empty (bash-y preferred form)", '`[[ -n "$TOKEN" ]]`'],
      ],
    },
    { kind: "heading", level: 3, text: "Parameter expansion — the swiss-army knife" },
    {
      kind: "prose",
      html:
        "Bash has a lot of compact parameter-expansion forms that replace what you might otherwise do with `sed` or `awk`. They run in the shell with no external process, so they're fast in a tight loop.",
    },
    {
      kind: "flip-cards",
      intro: "The parameter expansions that come up over and over.",
      cards: [
        {
          front: "`${VAR:-default}`",
          back: "Expand VAR; if unset or empty, use 'default'. Does NOT assign. Ideal for optional args: `PORT=\"${PORT:-8080}\"`.",
        },
        {
          front: "`${VAR:=default}`",
          back: "Like `:-` but also *assigns* 'default' to VAR so downstream code sees it too. Use at the top of a script to normalize env.",
        },
        {
          front: "`${VAR:?error message}`",
          back: "Expand VAR; if unset or empty, abort with the message. Replaces hand-rolled `if [ -z ... ] then echo && exit`.",
        },
        {
          front: "`${VAR#pattern}` / `${VAR##pattern}`",
          back: "Strip shortest / longest match of pattern from the *front*. `${path##*/}` gives the basename; `${file%.*}` gives name without extension.",
        },
        {
          front: "`${VAR/pattern/replacement}`",
          back: "Substitute first occurrence. `${VAR//pattern/replacement}` substitutes all. `sed` for free, in-shell.",
        },
        {
          front: "`${#VAR}`",
          back: "Length of the string in VAR (or count of elements in an array). Faster than `echo \"$VAR\" | wc -c`.",
        },
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "You want to set `PORT` to the env value if it's provided, otherwise default to 8080, AND you want the script to exit with a clear error if `API_TOKEN` is unset.",
      sentence:
        'PORT="${PORT:{0}8080}"\nAPI_TOKEN="${API_TOKEN:{1}API_TOKEN must be set}"',
      blanks: [
        {
          answer: "-",
          hint: "one char",
        },
        {
          answer: "?",
          hint: "one char",
        },
      ],
      reveal:
        '`PORT="${PORT:-8080}"` — expand PORT, or fall back to 8080 if unset/empty. `API_TOKEN="${API_TOKEN:?API_TOKEN must be set}"` — expand, or abort with the message. These two forms cover 80% of \"make my script resilient to missing env vars\" cases without a single `if`.',
    },
    {
      kind: "mcq-inline",
      question:
        'A script does `for f in $(find /data -name "*.log")`. Today one of the filenames is `access log.2024.log` (note the space). What happens when the loop reaches that file?',
      choices: [
        { label: "A", text: "It works — `find` quotes its output when filenames have spaces" },
        { label: "B", text: "The unquoted command substitution word-splits the filename on the space, so the loop sees two separate entries: `access` and `log.2024.log`" },
        { label: "C", text: "Bash raises a syntax error about unmatched quotes" },
        { label: "D", text: "The script hangs waiting for input" },
      ],
      correctAnswer: "B",
      explanation:
        "`$(find ...)` substitutes the output as plain text, which then gets word-split on IFS (default: space/tab/newline). The filename splits on its embedded space. The correct pattern uses `while IFS= read -r f; do ... done < <(find /data -name '*.log' -print0 | xargs -0 ...)` or, simpler, `find /data -name '*.log' -exec process {} \\;`. And set `IFS=$'\\n\\t'` at the top so this category of bug gets smaller.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A script worked perfectly during development on your laptop. On the prod fleet, it silently corrupts a config file about 1% of the time. You can't reproduce it on your laptop. The script uses `echo \"$VAR\" > /etc/config` where `$VAR` is assembled earlier from multiple sources. What's the likely failure mode?",
      hint: "What happens if any assignment silently produces an empty string?",
      answer:
        'Any time you write `echo "$VAR" > /etc/config` without checking that `$VAR` is non-empty, an empty `$VAR` truncates the file to zero bytes and looks like a success. On the fleet\'s 1%, one of the upstream inputs (env var, remote response, file read) returns empty. The fix is a defensive pattern: read the value into a temporary, check it\'s non-empty (`[[ -n "$tmp" ]] || { echo "empty result, aborting"; exit 1; }`), then write to a temp file and rename (`mv tmp /etc/config`) so a failure partway never exposes a half-written config. Also: `set -u` at the top so referencing an unset variable aborts immediately — the "1%" is almost always an unset var you never noticed in dev.',
    },
    {
      kind: "knowledge-check",
      question:
        "Walk through what each line of this three-line script preamble does and what specific bug class each prevents: `#!/usr/bin/env bash`, `set -euo pipefail`, `IFS=$'\\n\\t'`.",
      answer:
        "`#!/usr/bin/env bash` tells the kernel to find `bash` on `$PATH` rather than hard-coding `/bin/bash` — portable across distros where bash lives in different places. `set -e` aborts the script the instant any command returns non-zero, preventing the \"script continues past a failed critical step\" class of silent bug. `set -u` makes referencing an unset variable an error instead of expanding to empty string — prevents `rm -rf $UNDEFINED/` disasters and forces you to handle missing inputs explicitly. `set -o pipefail` makes a pipeline's exit code reflect the first failing stage, not just the last — without it, `curl bad | grep ok` can exit 0 even when curl failed. `IFS=$'\\n\\t'` narrows word-splitting to newlines and tabs only, which prevents filenames-with-spaces from fracturing in command substitutions and for-loops. Together, these four lines eliminate the most common footguns in the language and cost you nothing to write.",
    },
  ],
};

const lxaS6: ChapterSection = {
  id: "lxa-s6",
  topicId: "linux",
  title: "Robust Fleet Automation — Arrays, Traps, Parallelism, Locking",
  subtitle: "Scripts that run on one laptop are a weekend hobby. Scripts that run on 10,000 nodes are infrastructure.",
  icon: "❱",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "The difference between a shell script and **infrastructure-grade automation** is not the language — it's the disciplines around it. You already know bash syntax. What separates this chapter from chapter 1 is the patterns that make scripts **restart-safe, concurrent-safe, signal-safe, and parallel-safe**. The senior-engineer patterns aren't clever; they're disciplined.",
    },
    {
      kind: "prose",
      html:
        "You're paged at 02:14. A batch job that normally takes 90 seconds has been running for 47 minutes on one of 3,000 nodes. The job is a bash script you inherited. SSH in. `ps aux | grep` shows the script is in a `while read` loop, and the loop is reading from `/dev/tcp/remote/9000` — a socket that the other side silently half-closed an hour ago. Your script is waiting forever. No timeout. No trap. No signal handler. This chapter is the toolbox for writing scripts that **don't leave you holding the pager**.",
    },
    { kind: "heading", level: 3, text: "Arrays — the right iteration primitive" },
    {
      kind: "prose",
      html:
        "For collections, always use **arrays**, not space-separated strings. Arrays preserve each element as a distinct item, regardless of spaces, tabs, or weird characters in the values. Iterating `\"${arr[@]}\"` does the right thing for each element.",
    },
    {
      kind: "code",
      label: "ARRAYS VS STRINGS",
      language: "bash",
      code:
        "# WRONG — breaks on any filename with whitespace:\nfiles=\"$(ls /var/log/*.log)\"\nfor f in $files; do\n  process \"$f\"\ndone\n\n# RIGHT — array, per-element, preserves odd characters:\nfiles=( /var/log/*.log )          # glob directly into an array\nfor f in \"${files[@]}\"; do        # the quoted [@] is the magic\n  process \"$f\"\ndone\n\n# RIGHT — read from find (works with arbitrarily weird names):\nmapfile -t files < <(find /var/log -name '*.log' -print)\nfor f in \"${files[@]}\"; do\n  process \"$f\"\ndone",
    },
    {
      kind: "bullets",
      items: [
        '**`\"${arr[@]}\"`** — each element, individually quoted. Almost always what you want.',
        '**`\"${arr[*]}\"`** — all elements joined by IFS into one string. Rarely what you want.',
        '**`${#arr[@]}`** — count of elements.',
        '**`${arr[i]}`** — element by index (0-based).',
        '**`mapfile -t name < <(cmd)`** — read command output, one line per array element, no trailing newlines.',
      ],
    },
    { kind: "heading", level: 3, text: "Traps — cleaning up no matter how you exit" },
    {
      kind: "prose",
      html:
        "A `trap` catches signals (Ctrl-C, kill, system shutdown) AND normal exits. Use it to remove temp files, release locks, close connections, and report failure reason. If your script creates state anywhere — a lockfile, a temp directory, a background process — it needs a trap.",
    },
    {
      kind: "code",
      label: "THE CANONICAL CLEANUP PATTERN",
      language: "bash",
      code:
        '#!/usr/bin/env bash\nset -euo pipefail\n\n# Set up a private temp dir; remove it on ANY exit (success, error, signal).\ntmpdir=$(mktemp -d)\ncleanup() {\n  local exit_code=$?\n  rm -rf "$tmpdir"\n  if (( exit_code != 0 )); then\n    echo "Aborted (exit $exit_code)" >&2\n  fi\n  exit "$exit_code"\n}\ntrap cleanup EXIT INT TERM\n\n# ... do work ...\ncurl -fsSL https://api.example.com/data > "$tmpdir/data.json"\njq . "$tmpdir/data.json" > "$tmpdir/sorted.json"\nmv "$tmpdir/sorted.json" /srv/app/data.json',
    },
    {
      kind: "callout",
      variant: "info",
      title: "EXIT runs after INT/TERM, not instead of",
      body:
        "If you only `trap ... INT TERM`, a clean exit (e.g., `exit 0` or end of script) won't fire the handler and your temp dir stays. Use `trap cleanup EXIT` and the handler runs on every path out — signal, error, or clean exit. EXIT is the trap you want 95% of the time.",
    },
    { kind: "heading", level: 3, text: "Parallelism — the fleet-scale pattern" },
    {
      kind: "prose",
      html:
        "A serial loop over 3,000 nodes with a 500 ms SSH cost each is a 25-minute operation. A parallel version of the same loop with 50-way concurrency is 30 seconds. At fleet scale, **sequential is always wrong**. Three idioms cover almost every parallel job.",
    },
    {
      kind: "table",
      headers: ["Idiom", "Best for", "Gotcha"],
      rows: [
        ['`cmd1 & cmd2 & wait`', "A fixed, small number of jobs", "No concurrency cap — don't use for 1000 tasks"],
        ['`xargs -P 50 -I {} cmd {}`', "Large homogeneous job list, standard tool on every box", "Output from jobs interleaves unless each writes to its own file"],
        ['`parallel -j 50 cmd ::: inputs`', "GNU parallel — richer features, better output handling", "Not always installed; may need a package"],
      ],
    },
    {
      kind: "code",
      label: "RUN A CHECK ACROSS A FLEET, 50 NODES IN PARALLEL",
      language: "bash",
      code:
        '#!/usr/bin/env bash\nset -euo pipefail\n\n# hosts.txt: one hostname per line\nxargs -a hosts.txt -P 50 -I {} bash -c \'\n  host="$1"\n  if out=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "uptime" 2>&1); then\n    printf "%-30s OK %s\\n" "$host" "$out"\n  else\n    printf "%-30s FAIL %s\\n" "$host" "$out"\n  fi\n\' _ {}\n\n# Key flags:\n#   -P 50          up to 50 jobs concurrently\n#   ConnectTimeout avoids a hung host blocking the whole run\n#   BatchMode=yes  never prompts (no passwords, no host-key prompts)',
    },
    { kind: "heading", level: 3, text: "Locking — one script at a time, please" },
    {
      kind: "prose",
      html:
        "Two copies of the same cron job running in parallel on one host can corrupt state, double-bill external APIs, exhaust connections. **`flock`** is a one-line way to ensure at most one instance runs at a time. It uses a kernel file lock, so it survives process crashes (the lock releases automatically when the file descriptor closes).",
    },
    {
      kind: "code",
      label: "SINGLE-INSTANCE PATTERN",
      language: "bash",
      code:
        "#!/usr/bin/env bash\nset -euo pipefail\n\n# Acquire an exclusive lock on the script's own file, or exit if held.\nexec 200>/var/lock/nightly-import.lock\nif ! flock -n 200; then\n  echo \"Another instance is running\" >&2\n  exit 1\nfi\n# Lock is released when FD 200 closes (script exit).\n\n# ... do work ...\n\n# Variant: wait up to 30 seconds for the lock before failing:\n# flock -w 30 200 || exit 1",
    },
    { kind: "heading", level: 3, text: "Idempotency — safe to re-run" },
    {
      kind: "prose",
      html:
        "A script is **idempotent** if running it twice produces the same result as running it once. Idempotent scripts are safe to retry, safe to partially re-run after a failure, safe to invoke from a timer that may fire overlapping. Non-idempotent scripts are the source of \"I ran it twice by mistake and now there are duplicate rows\" incidents.",
    },
    {
      kind: "bullets",
      items: [
        "**Create-or-no-op, don't create-always.** `mkdir -p path` not `mkdir path`. `useradd -r foo || true` not `useradd -r foo`.",
        "**Check-then-act is a race.** If you can use atomic primitives (`mv`, `ln -sf`, `flock`), do. Otherwise, lock first.",
        "**Writes should be atomic.** Write to `foo.tmp`, fsync, then `mv foo.tmp foo`. Readers never see a half-written file.",
        "**Log what you did, not what you tried to do.** \"Configured nginx\" is useless; \"nginx already configured, skipped\" and \"nginx config written\" are actionable.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "A deploy script runs fine on the first run. On retries (after a transient failure), it fails with \"user already exists\" and \"symlink exists\" errors, leaving the deploy half-done. How do you make it safe to re-run?",
      hint: "Every create operation should be idempotent at the tool level, not at the script level.",
      answer:
        'Make each create-step idempotent with the tools themselves. `useradd -r deploy || true` is better than `id -u deploy || useradd -r deploy` (the latter has a race and is more complex). For files: `install -D -m 0644 src/file /dst/file` both creates and overwrites atomically. For symlinks: `ln -sf target linkname` replaces an existing link. For directories: `mkdir -p /opt/app/bin` never errors on existing. For config: write to a temp file in the same directory, then `mv tmp target` (atomic on the same filesystem). The meta-pattern: every step should report "no-op" when already done, never error. This makes the script re-runnable, which makes it resilient to transient network failures, OOMs, and partial executions.',
    },
    {
      kind: "knowledge-check",
      question:
        "A script iterates over 3,000 hostnames doing an SSH health check. Sequential it takes 45 minutes. Some hosts are unreachable and hang. Walk through the exact shape of a production-grade version — how you parallelize, handle timeouts, capture per-host results, and clean up.",
      answer:
        "Outline the production-grade version: (1) Read the host list into an array with `mapfile`. (2) Parallelize with `xargs -P 50` — a reasonable default for SSH; higher can overload the local machine's file descriptors or the downstream SSH servers. (3) Every SSH call gets `-o ConnectTimeout=5 -o ServerAliveInterval=5 -o ServerAliveCountMax=2 -o BatchMode=yes`. ConnectTimeout stops an unreachable host from blocking a worker; ServerAlive detects a half-dead TCP session; BatchMode prevents password/host-key prompts. (4) Each parallel worker writes its result to a per-host temp file (`$tmpdir/$host.result`) so output doesn't interleave. (5) A `trap cleanup EXIT` removes the tmpdir on any exit. (6) After the parallel run, `cat $tmpdir/*.result` is your aggregated output. (7) Exit code reflects whether *any* host failed, so a wrapping orchestrator knows. (8) If this is a cron or timer job, wrap it in `flock` so two invocations don't step on each other. The net effect: 45 minutes becomes roughly 30 seconds, no host can wedge the job forever, failures are per-host and visible, and re-running is safe.",
    },
  ],
};

// ── linux-m16 Advanced Storage ──────────────────────────────────────────────

const lxaS7: ChapterSection = {
  id: "lxa-s7",
  topicId: "linux",
  title: "LVM in Depth — PV, VG, LV, and Snapshots",
  subtitle: "The abstraction that turns physical disks into flexible, live-resizable storage.",
  icon: "▣",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "LVM is the cheat code of Linux storage. A node that's been running for two years on LVM can grow its `/var` onto a new disk without a reboot, take a consistent snapshot for backups, and survive a failed disk by migrating extents. A node on straight partitions can't do any of that without downtime. Every production storage decision at hyperscale is made with LVM (or something like it) in mind.",
    },
    {
      kind: "prose",
      html:
        "It's 02:40. An alert fires: `/var` on `db-replica-12` is 98% full. Traditional answer: schedule downtime, boot from rescue, shrink something, grow `/var`, pray. LVM answer: attach a new block device, `pvcreate`, `vgextend`, `lvextend`, `xfs_growfs`. Done. No reboot. No downtime. You're back in bed in 10 minutes. The **same filesystem** now has more room. That's LVM's whole pitch.",
    },
    { kind: "heading", level: 3, text: "The three layers — PV, VG, LV" },
    {
      kind: "prose",
      html:
        "LVM sits between your physical devices and your filesystems. It has **three layers**, each abstracting the one below. Learning the layers by name is most of what makes LVM click.",
    },
    {
      kind: "collapsible",
      intro: "Work from the bottom up. Each layer hides the complexity of the one below.",
      items: [
        {
          title: "PV — Physical Volume (the bottom)",
          body:
            "A block device (a whole disk like `/dev/sdb`, or a partition like `/dev/sdb1`) that's been 'initialized' for LVM with `pvcreate`. The PV now stores metadata and a pool of **physical extents (PEs)** — usually 4 MiB chunks. Commands: `pvs`, `pvdisplay`, `pvscan`, `pvresize`.",
          color: "#50C8FF",
        },
        {
          title: "VG — Volume Group (the pool)",
          body:
            "One or more PVs combined into a named pool of extents. `myvg` might contain `/dev/sdb` + `/dev/sdc` with 2 TB of total free PEs. You allocate from the VG to create LVs. Commands: `vgs`, `vgdisplay`, `vgextend`, `vgreduce`.",
          color: "#FFA832",
        },
        {
          title: "LV — Logical Volume (what the filesystem sits on)",
          body:
            "A named chunk of extents from a VG, presented as a block device at `/dev/<vg>/<lv>` (and `/dev/mapper/<vg>-<lv>`). You `mkfs.xfs` on it like any other block device. Commands: `lvs`, `lvdisplay`, `lvextend`, `lvreduce`, `lvremove`.",
          color: "#7AE87A",
        },
        {
          title: "PE — Physical Extent (the atomic unit)",
          body:
            "The smallest chunk LVM allocates. Default 4 MiB. A 1 GB LV is 256 PEs. Understanding PEs matters when reading `pvs -o +pv_used` or diagnosing 'VG is full but free space exists somewhere' edge cases.",
          color: "#C58AFF",
        },
      ],
    },
    {
      kind: "code",
      label: "BUILDING AN LVM STACK FROM SCRATCH",
      language: "bash",
      code:
        "# 1. Initialize a physical device as a PV.\nsudo pvcreate /dev/sdb\n\n# 2. Create a volume group using that PV.\nsudo vgcreate datavg /dev/sdb\n\n# 3. Carve an LV out of the VG — 500 GB.\nsudo lvcreate -L 500G -n datalv datavg\n\n# 4. Make a filesystem on the LV.\nsudo mkfs.xfs /dev/datavg/datalv\n\n# 5. Mount it like a normal block device.\nsudo mkdir /srv/data\nsudo mount /dev/datavg/datalv /srv/data\n\n# Persistent via /etc/fstab — use the LV path or UUID:\n# /dev/datavg/datalv  /srv/data  xfs  defaults  0  0",
    },
    { kind: "heading", level: 3, text: "Growing (and shrinking) online" },
    {
      kind: "prose",
      html:
        "Extending an LV on a mounted, active filesystem is LVM's headline feature. Shrinking is possible with ext4 (offline or online depending on kernel) but **impossible with XFS** — XFS can only grow. This is why storage teams usually size LVs conservatively and extend as needed.",
    },
    {
      kind: "code",
      label: "ONLINE EXTEND — ADD 100G TO /srv/data",
      language: "bash",
      code:
        "# 1. Add more capacity to the VG (if the VG is full):\nsudo pvcreate /dev/sdc\nsudo vgextend datavg /dev/sdc\n\n# 2. Extend the LV by 100G.\nsudo lvextend -L +100G /dev/datavg/datalv\n\n# 3. Grow the filesystem to match the LV.\nsudo xfs_growfs /srv/data        # XFS (uses mount point, not device)\n# sudo resize2fs /dev/datavg/datalv   # ext4 equivalent\n\n# Shortcut: extend LV and grow FS in one command:\nsudo lvextend -r -L +100G /dev/datavg/datalv   # -r invokes resize tool",
    },
    {
      kind: "fill-blank",
      prompt:
        "You're out of space on `/var`. The VG has 50 GB of free extents. Write the one-line command to extend the `/dev/rootvg/varlv` LV by 20 GB and resize the filesystem in one shot.",
      sentence:
        "sudo lvextend {0} {1} /dev/rootvg/varlv",
      blanks: [
        {
          answer: "-r",
          alternates: ["--resizefs"],
          hint: "flag",
        },
        {
          answer: "-L +20G",
          alternates: ["--size +20G", "-L+20G"],
          hint: "size spec",
        },
      ],
      reveal:
        "`sudo lvextend -r -L +20G /dev/rootvg/varlv`. The `-r` flag tells lvextend to run the appropriate filesystem-resize tool automatically after the LV resize — `xfs_growfs` for XFS, `resize2fs` for ext4. The `-L +20G` is the relative size increase. Use `-L 40G` for an absolute size. Always use `+` for 'grow by' to avoid accidentally specifying a smaller size that would be a shrink request.",
    },
    { kind: "heading", level: 3, text: "Snapshots — the copy-on-write safety net" },
    {
      kind: "prose",
      html:
        "An LVM snapshot is a **copy-on-write** view of an LV at a point in time. Creating one is instant — no data is copied. As the origin LV changes, the snapshot stores the *old* blocks in its own space so you still see the original. Used for consistent backups (snapshot first, back up the snapshot, drop it), for safe upgrades (snapshot, upgrade, roll back if broken), and for read-only analysis of a live dataset.",
    },
    {
      kind: "table",
      headers: ["Type", "Size matters?", "When to use"],
      rows: [
        ["Thick (classic) snapshot", "Yes — size for changed blocks during snapshot lifetime", "Short-lived (minutes to hours): backups, test-and-rollback"],
        ["Thin snapshot (thin pool)", "No hard preallocation — draws from a thin pool", "Long-lived, multi-level, nested — containers, VM-style disk images"],
        ["Snapshot overflow", "If a thick snapshot fills, it becomes invalid", "Monitor `lvs` size usage; alert at 80%"],
      ],
    },
    {
      kind: "code",
      label: "CLASSIC SNAPSHOT WORKFLOW",
      language: "bash",
      code:
        "# Create a 20G snapshot of the active LV (for a busy DB, size ~10-20% of LV).\nsudo lvcreate --size 20G --snapshot --name datalv-snap /dev/datavg/datalv\n\n# The snapshot is a read/write LV at /dev/datavg/datalv-snap. Mount it read-only:\nsudo mkdir /mnt/snap\nsudo mount -o ro,nouuid /dev/datavg/datalv-snap /mnt/snap\n\n# Back it up, then drop the snapshot to free the CoW space.\ntar czf /backups/data.tar.gz -C /mnt/snap .\nsudo umount /mnt/snap\nsudo lvremove -f /dev/datavg/datalv-snap",
    },
    { kind: "heading", level: 3, text: "Thin provisioning — overcommit, carefully" },
    {
      kind: "prose",
      html:
        "A **thin pool** is a VG-backed pool of extents from which multiple thin LVs allocate lazily. You can create thin LVs whose *declared* size exceeds the pool's actual capacity — 10 LVs of 1 TB on a 4 TB pool — because most won't use their full allocation. The gotcha: if total *actual* usage approaches pool capacity, writes start failing silently. **Monitor thin pool usage and alert aggressively** — some shops alert at 70% pool usage; everyone alerts by 85%.",
    },
    {
      kind: "flip-cards",
      intro: "LVM commands that come up over and over.",
      cards: [
        {
          front: "`pvs`, `vgs`, `lvs`",
          back: "One-line summary of physical volumes, volume groups, and logical volumes. First commands you run to get a mental picture of the storage stack.",
        },
        {
          front: "`pvdisplay`, `vgdisplay`, `lvdisplay`",
          back: "Verbose, multi-line detail for each layer. Use when `pvs`/`vgs`/`lvs` isn't enough — e.g., debugging why a VG refuses to extend.",
        },
        {
          front: "`lvextend -r -L +Nsize /dev/vg/lv`",
          back: "Grow the LV by Nsize AND resize the filesystem on top in one step. The single most-used day-to-day LVM command.",
        },
        {
          front: "`vgextend vg /dev/sdX`",
          back: "Add a new PV to an existing VG. The first step when the VG itself is out of extents.",
        },
        {
          front: "`pvmove /dev/sdX`",
          back: "Migrate all extents off a PV (onto other PVs in the same VG). Used to **safely evacuate** a failing disk from a running system.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "When LVs 'vanish' after a reboot",
      body:
        "If `vgscan` or `lvscan` don't show a VG after boot, check `lvm vgchange -a y <vgname>` — VGs sometimes need activation. For VGs on multi-path devices or iSCSI, the `systemd-udev-settle.service` and `lvm2-pvscan@.service` ordering in your distro matters. Check `journalctl -u lvm2-pvscan@*` for activation errors.",
    },
    {
      kind: "custom-component",
      id: "lvm-stack",
      props: {
        title: "Interactive LVM Stack",
        caption:
          "Click layers to expand. Drag the LV size slider to watch extents flow from VG free-space to the LV and filesystem.",
      },
    },
    {
      kind: "think-about-it",
      scenario:
        "You take a snapshot of `/dev/vg/prod` to run a backup. The backup takes an hour. Partway through, the origin LV is being written to heavily — a bulk import is happening. `lvs` shows the snapshot at 100% utilization and `journalctl` reports 'snapshot invalid'. What happened and how should you have sized it?",
      hint: "Every changed block on the origin is copied to the snapshot's CoW area before being overwritten.",
      answer:
        "A classic (thick) snapshot has a fixed CoW allocation. Every *changed* block on the origin during the snapshot's lifetime gets its original version written into that CoW space. When CoW fills, the snapshot becomes invalid — LVM can no longer reconstruct the original view of a given block, so it drops the whole snapshot to protect the origin. Size it for the **maximum expected change rate × snapshot lifetime**. Rule of thumb: 10-20% of the origin for short-lived backups on quiet data; 50-100% for busy systems or during bulk imports. Or skip the math — use **thin snapshots** (via a thin pool), which draw from a shared pool and don't have a pre-allocated CoW size. For long-lived snapshots (overnight backups on busy systems), thin is almost always the right choice.",
    },
    {
      kind: "knowledge-check",
      question:
        "Walk through the exact sequence of commands you'd run to safely evacuate a failing disk `/dev/sdc` from VG `datavg` without downtime — assuming you have enough free space in the VG on other PVs to hold its contents.",
      answer:
        "(1) `vgs datavg` and `pvs -o +vg_free` to confirm the VG has free space on *other* PVs equal to or greater than the used extents on `/dev/sdc`. If not, add a new disk first: `pvcreate /dev/sdd; vgextend datavg /dev/sdd`. (2) `pvmove /dev/sdc` — LVM migrates every extent currently on `/dev/sdc` to other PVs in the VG, online, without unmounting or disrupting I/O. Progress shown live; resumable if interrupted. (3) Verify `/dev/sdc` is empty: `pvs /dev/sdc` should show `Used: 0`. (4) `vgreduce datavg /dev/sdc` — remove the (now-empty) PV from the VG. (5) `pvremove /dev/sdc` — clear LVM metadata. (6) Now the disk is safe to pull — hot-swap it and RMA. The whole procedure happens with the filesystem mounted, the database running, and no perceptible impact on users beyond slightly reduced I/O throughput during the migration.",
    },
  ],
};

const lxaS8: ChapterSection = {
  id: "lxa-s8",
  topicId: "linux",
  title: "Software RAID, Filesystem Tuning, and I/O Observability",
  subtitle: "What to watch, what to tune, and how to read iostat without wincing.",
  icon: "▦",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Storage is where ops careers live or die. Memory leaks surface in a day; disk failures creep in over weeks. **Knowing the shape of healthy I/O is the only way to recognize when it's slipping**. This chapter is the observability layer that lets you catch a failing drive before it RAID-degrades, and the tuning knobs that let you squeeze real throughput out of modern hardware.",
    },
    {
      kind: "prose",
      html:
        "A monitoring dashboard lights up: `db-shard-17` is missing its 15-minute SLA. Latency graphs show `p99` climbing. You SSH in, run `iostat -xz 1`, and the picture is instant: one device at 99% `%util` with `await` at 250ms while the others are at 5ms. That's a single drive dragging down the whole RAID-10 array. Without iostat, you'd be paging through logs for 20 minutes before reaching the same conclusion. This chapter is how you learn to see that pattern at a glance.",
    },
    { kind: "heading", level: 3, text: "Software RAID — the mdadm lifecycle" },
    {
      kind: "prose",
      html:
        "Linux's software RAID implementation is `md` (multiple devices), managed via the `mdadm` userspace tool. It's mature, performant, and more portable than hardware RAID — your `/dev/md0` travels with the disks, no vendor controller needed. The operations you'll actually do fit on a single page.",
    },
    {
      kind: "code",
      label: "mdadm LIFECYCLE",
      language: "bash",
      code:
        "# Status overview — the single most useful MD command:\ncat /proc/mdstat\n# Example output:\n#   md0 : active raid10 sda1[0] sdb1[1] sdc1[2] sdd1[3]\n#         1953260544 blocks super 1.2 512K chunks 2 near-copies [4/4] [UUUU]\n#         [=====>...........]  resync = 28.4% (555289792/1953260544) ...\n\nmdadm --detail /dev/md0              # verbose status of one array\nmdadm --examine /dev/sda1            # raw superblock on a member\n\n# A drive has failed. Mark it, remove it, add a replacement:\nmdadm /dev/md0 --fail   /dev/sdb1\nmdadm /dev/md0 --remove /dev/sdb1\nmdadm /dev/md0 --add    /dev/sde1\n# md starts rebuilding automatically; `cat /proc/mdstat` shows progress.\n\n# Preemptively stop a drive rebuild by forcing a different member:\nmdadm /dev/md0 --replace /dev/sda1 --with /dev/sde1",
    },
    {
      kind: "bullets",
      items: [
        '**`[UUUU]` is a healthy 4-drive array.** Each `U` is an up member. Any `_` means a member is failed or rebuilding.',
        '**Rebuilds are slow.** A multi-TB array can take 12+ hours. During rebuild, a second-drive failure = data loss on RAID 5, probably data loss on RAID 10 depending on which two fail.',
        '**RAID is not backup.** A `rm -rf` is mirrored instantly across all members. Always have a separate backup chain.',
        '**`/etc/mdadm/mdadm.conf` holds the array definitions** — crucial for automatic assembly at boot. After creating a new array, always `mdadm --detail --scan >> /etc/mdadm/mdadm.conf`.',
      ],
    },
    { kind: "heading", level: 3, text: "Filesystem tuning — ext4 vs XFS at hyperscale" },
    {
      kind: "prose",
      html:
        "Both ext4 and XFS are production-grade, but they make different tradeoffs. XFS is the default for data volumes on modern RHEL; ext4 is widely used and fine for most workloads. The real performance differences show up under sustained parallel I/O and at extreme scales — not on a small `/home`.",
    },
    {
      kind: "table",
      headers: ["Concern", "ext4", "XFS"],
      rows: [
        ["Max volume", "1 EiB", "8 EiB"],
        ["Grow online", "Yes", "Yes"],
        ["Shrink", "Offline only", "**Not supported** — XFS only grows"],
        ["Parallel I/O throughput", "Good", "Excellent (allocation groups scale)"],
        ["Small-file workloads", "Slight edge — smaller inodes by default", "Comparable"],
        ["Defaults on RHEL 8/9", "—", "Default for data volumes"],
        ["`fsck` speed", "Slower on large volumes", "`xfs_repair` is faster"],
      ],
    },
    {
      kind: "collapsible",
      intro: "Mount options and tuning knobs that matter in production.",
      items: [
        {
          title: "`noatime` — skip last-access-time writes",
          body:
            "By default Linux updates a file's atime on every read. On busy filesystems this is a huge hidden write load. `mount -o noatime` disables it — almost always safe. `relatime` (default in most distros now) is a compromise that only updates atime if it's older than mtime/ctime.",
          color: "#50C8FF",
        },
        {
          title: "`discard` vs `fstrim` (SSDs)",
          body:
            "On SSDs, TRIM tells the drive which blocks are freed so it can reclaim them for wear-leveling. `discard` mount option issues TRIM on every delete — slow, not recommended. Better: `nodiscard` and run `fstrim` on a weekly systemd timer (`fstrim.timer` ships with most distros).",
          color: "#FFA832",
        },
        {
          title: "`barrier=1` vs `nobarrier`",
          body:
            "Barriers enforce write ordering across the filesystem's journal. `barrier=1` is the default and safe. Disabling barriers gives a measurable speedup — but on power loss you can lose the journal and corrupt the filesystem. Only disable on hardware with battery-backed cache (or on ephemeral volumes where you don't care).",
          color: "#FF6B6B",
        },
        {
          title: "`inode_readahead_blks` (ext4) / `inode_alignment` (XFS)",
          body:
            "Advanced tuning for specific workloads. Usually best left at defaults unless you've profiled a bottleneck. If you're tuning these, you already have the benchmarks to justify it.",
          color: "#C58AFF",
        },
      ],
    },
    { kind: "heading", level: 3, text: "I/O observability — iostat, iotop, blktrace" },
    {
      kind: "prose",
      html:
        "You can't tune what you can't measure. The core I/O observability toolkit is small and every Linux admin should know it cold.",
    },
    {
      kind: "code",
      label: "THE I/O OBSERVABILITY TOOLKIT",
      language: "bash",
      code:
        "# Fleet-wide: 1-second samples of device-level I/O, with extended stats.\niostat -xz 1\n# -x  extended (await, svctm, %util)\n# -z  suppress devices that had zero activity (cleaner output)\n# 1   sample every second\n\n# Per-process I/O — which process is hammering the disk?\nsudo iotop -oPa\n# -o  only show processes actually doing I/O\n# -P  processes (not threads)\n# -a  accumulate since start\n\n# Block-layer tracing — very detailed, for deep-dive analysis.\nsudo blktrace -d /dev/sda -o - | blkparse -i -\n\n# Latency histograms via eBPF (bcc-tools) — see distribution, not averages:\nsudo biolatency 10 3                # 3 samples of 10-second biolatency histograms",
    },
    {
      kind: "flip-cards",
      intro: "The five `iostat -x` columns that actually tell you something.",
      cards: [
        {
          front: "`r/s` and `w/s`",
          back: "Reads and writes per second. Compare against the device's rated IOPS. An NVMe drive should handle 100K+ IOPS; if you're seeing that much sustained, you're either doing heavy work or have an amplification problem.",
        },
        {
          front: "`await`",
          back: "Average time (ms) a request spent waiting to complete (queue + service). Healthy SSD: <5ms. Healthy NVMe: <1ms. Healthy spinning disk: ~10-20ms. Climbing `await` on one device means that device is saturated or sick.",
        },
        {
          front: "`r_await` and `w_await`",
          back: "Separate awaits for reads vs writes (iostat -x on newer sysstat). Writes usually have lower await thanks to writeback cache; sudden write await climb often = cache exhausted or kernel flushing hard.",
        },
        {
          front: "`%util`",
          back: "Percent of time the device was busy. On spinning disks, 80%+ is saturation. On SSDs/NVMe with parallel queues, `%util` can exceed 100% and isn't a reliable saturation signal — trust latency (await) instead.",
        },
        {
          front: "`aqu-sz` (avgqu-sz)",
          back: "Average queue depth of the device. Deep queues are fine on NVMe (parallelism is the point); but a consistently deep queue on a spinning disk means requests are stacking up faster than they drain.",
        },
      ],
    },
    { kind: "heading", level: 3, text: "I/O schedulers — match the algorithm to the hardware" },
    {
      kind: "prose",
      html:
        "Linux has several block I/O schedulers. Modern kernels (5.x+) use **blk-mq** (multi-queue) with a short list of practical options. The default for your hardware is usually right, but it's worth knowing what's running and why.",
    },
    {
      kind: "table",
      headers: ["Scheduler", "Best for", "Why"],
      rows: [
        ["`none` (noop)", "NVMe, fast SSDs in a VM, ephemeral cloud disks", "The hardware and firmware do their own scheduling; the kernel just hands requests to the device as they come"],
        ["`mq-deadline`", "SATA SSDs, SAS drives, hybrid workloads", "Enforces a maximum latency bound per request — prevents starvation under mixed read/write loads"],
        ["`kyber`", "NVMe under mixed read/write latency-sensitive workloads", "Targets a configurable latency for reads and writes; simpler than BFQ"],
        ["`bfq`", "Desktop-ish or single-user workloads prioritizing interactive responsiveness", "Strong fairness between processes — but overhead is notable on very fast devices"],
      ],
    },
    {
      kind: "code",
      label: "INSPECT AND SET THE SCHEDULER",
      language: "bash",
      code:
        "# See what's configured for a device:\ncat /sys/block/sda/queue/scheduler\n# [mq-deadline] kyber bfq none     (the [bracketed] one is active)\n\n# Change it live (doesn't persist across reboot):\necho none | sudo tee /sys/block/nvme0n1/queue/scheduler\n\n# Persist via udev rule, e.g., /etc/udev/rules.d/60-io-scheduler.rules:\n# ACTION==\"add|change\", KERNEL==\"nvme*\", ATTR{queue/scheduler}=\"none\"",
    },
    {
      kind: "mcq-inline",
      question:
        "You run `iostat -xz 1` during a latency incident. One device shows `%util=99`, `await=250`; the three peer devices in the same array show `%util=20`, `await=3`. The slow device is a mirror of one of the others. What's your first hypothesis?",
      choices: [
        { label: "A", text: "The filesystem is overloaded; tune FS mount options" },
        { label: "B", text: "The RAID is imbalanced; rebuild to redistribute load" },
        { label: "C", text: "The slow device is failing — latency climbing, saturating queue; check `smartctl -a` for pending/reallocated sectors and plan a drive replacement" },
        { label: "D", text: "The I/O scheduler is wrong; switch to BFQ" },
      ],
      correctAnswer: "C",
      explanation:
        "The asymmetry is the tell — same workload, same role (mirror pair), wildly different service times. Healthy peer = the workload is fine. Unhealthy outlier = that specific device is sick. Next step is `smartctl -a /dev/sdX` looking for rising reallocated sector counts, pending sectors, or offline uncorrectable attributes. Plan a proactive replacement; don't wait for it to fail outright (which could cascade into a degraded rebuild window where a second failure loses data).",
    },
    {
      kind: "think-about-it",
      scenario:
        "A teammate says `top` shows high `iowait` on `db-17`. You look — `%wa` is at 40%. But `iostat -xz 1` shows every block device at <10% util and <5ms await. Where's the I/O actually going?",
      hint: "iostat only sees block devices it knows about.",
      answer:
        "High `iowait` with low `%util` on local disks strongly suggests the I/O is happening on **something iostat doesn't see**. Three common culprits: (1) Network I/O — NFS, Ceph, or iSCSI-backed mounts show I/O waits but iostat won't count them as block devices. Check `mount | grep nfs` and `nfsiostat` (or `ceph daemon` tools). (2) A userspace FUSE mount — similar story; tools like `fuse_stat` or `strace` can expose it. (3) Swap — if the box is swapping, the activity is on a block device iostat *does* see, but may not be flagged obviously; check `vmstat 1` for `si`/`so` columns and `free -h` for swap used. Confirm the layer with `pidstat -d 1` (per-process I/O rates) — the process doing the iowait's waits will show up there even if the block device doesn't.",
    },
    {
      kind: "knowledge-check",
      question:
        "You're building a new data volume. It'll hold 20 TB of parallel append-only log data across 8 SAS SSDs. Walk through the storage stack you'd assemble — RAID level, filesystem, and two specific mount options — and justify each choice.",
      answer:
        "(1) **RAID level: RAID 10** (striped mirrors, 4 mirror pairs of 2 drives each). Parallel write performance is much better than RAID 5/6 because there's no parity compute, and rebuild time on a single-drive loss is just one mirror partner copying — hours instead of a days-long RAID 6 rebuild. Capacity hit (50%) is acceptable given performance priority. (2) **Filesystem: XFS**. XFS's allocation groups give real parallel write scaling, and log-append workloads are XFS's sweet spot; it's RHEL's default for data volumes for this reason. Don't pick ext4 for a 20 TB parallel-write volume. (3) **Mount options: `noatime,nobarrier`** — with a big asterisk on `nobarrier`. `noatime` removes the silent write overhead from every read. `nobarrier` gives a measurable speedup because the filesystem doesn't force journal barriers — but **only if the underlying hardware has power-loss protection** (battery-backed controller cache, enterprise SSDs with PLP capacitors). On commodity SSDs without PLP, keep barriers on, full stop. Also set up `fstrim.timer` so TRIM runs weekly, keeping SSD write performance high as the drives age.",
    },
  ],
};

// ── linux-m17 Advanced Networking ───────────────────────────────────────────

const lxaS9: ChapterSection = {
  id: "lxa-s9",
  topicId: "linux",
  title: "Bonds, Bridges, VLANs, and Namespaces",
  subtitle: "How a single Linux host becomes many network identities, or one resilient one.",
  icon: "⟷",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A production DC node is never just \"one interface, one IP.\" It's a bonded pair of NICs across two switches (redundancy), carrying 802.1Q tags for several VLANs (segmentation), with a Linux bridge handing virtual ports to containers (multi-tenancy), and each container isolated in its own network namespace (blast-radius control). Every one of those primitives is a separate kernel feature — and troubleshooting any network problem means knowing which layer is suspect.",
    },
    {
      kind: "prose",
      html:
        "You finish racking a new GPU node and run `ip link`. Two 100 GbE ports, both up. Good. You ping its IP — works. You reboot. Now only one port is up. You ping — still works. You reboot again and the port that came up last time is now down while the *other* one is up. Somewhere in the network config, a **bond** isn't actually bonding — it's just picking one link at random. Without understanding the primitives, you'll chase this for hours. With them, you read the bond mode, the LACP partner state, and the switch-side aggregation config — and fix it in 10 minutes.",
    },
    { kind: "heading", level: 3, text: "Bonding — aggregating multiple NICs" },
    {
      kind: "prose",
      html:
        "A **bond** combines several physical NICs into a single virtual interface. Depending on the mode, it gives you fault tolerance (one NIC fails, the other keeps working), aggregated bandwidth (traffic load-balances across members), or both. The critical choice is the **mode** — get it wrong and the bond either provides no redundancy or silently drops packets.",
    },
    {
      kind: "collapsible",
      intro: "The bond modes you'll actually see in a DC. Click each for when to reach for it.",
      items: [
        {
          title: "Mode 0 — `balance-rr` (round robin)",
          body:
            "Sends packets across members in round-robin order. Maximum bandwidth on a single flow, but packets can arrive out of order — TCP struggles, some applications choke. Use only when the switch supports it explicitly and the workload tolerates reordering.",
          color: "#FF6B6B",
        },
        {
          title: "Mode 1 — `active-backup`",
          body:
            "One NIC carries all traffic; the other is a hot standby. On failure, the standby takes over. **No switch configuration needed** — works with any switches, even different ones. Best for redundancy-without-fancy-switch-config. Limits you to the bandwidth of one NIC.",
          color: "#50C8FF",
        },
        {
          title: "Mode 4 — `802.3ad` (LACP)",
          body:
            "The hyperscale default. LACP (Link Aggregation Control Protocol) negotiates the bond with the switch. Both sides agree on member ports and balance flows across them. Provides both bandwidth and fault tolerance — but requires **LACP configured on the switch side too**, and both NICs usually must connect to the same switch (or an MLAG pair).",
          color: "#7AE87A",
        },
        {
          title: "Mode 6 — `balance-alb` (Adaptive Load Balancing)",
          body:
            "Software-side tricks (ARP rewriting) give you load balancing without switch-side LACP. Clever, but complex, and doesn't work through many switch configurations. Rarely the right choice in a modern DC — use LACP if your switches support it, active-backup if not.",
          color: "#FFA832",
        },
      ],
    },
    {
      kind: "code",
      label: "LACP BOND WITH nmcli (NetworkManager)",
      language: "bash",
      code:
        "# Create the bond device with LACP (802.3ad).\nsudo nmcli connection add type bond con-name bond0 ifname bond0 \\\n    bond.options \"mode=802.3ad,lacp_rate=fast,miimon=100\"\n\n# Add the two physical NICs as bond members.\nsudo nmcli connection add type ethernet con-name bond-ens1f0 \\\n    ifname ens1f0 master bond0\nsudo nmcli connection add type ethernet con-name bond-ens1f1 \\\n    ifname ens1f1 master bond0\n\n# Configure IP on the bond (or on a VLAN sub-interface below it).\nsudo nmcli connection modify bond0 ipv4.method manual \\\n    ipv4.addresses 10.0.12.50/24 ipv4.gateway 10.0.12.1\n\nsudo nmcli connection up bond-ens1f0\nsudo nmcli connection up bond-ens1f1\nsudo nmcli connection up bond0\n\n# Inspect the active state — LACP partner info lives here:\ncat /proc/net/bonding/bond0",
    },
    {
      kind: "callout",
      variant: "info",
      title: "LACP needs both sides",
      body:
        "A Linux box in mode 4 will not form an aggregation with a switch port that isn't configured for LACP. The symptom is \"one link works, the other is 'up' but carries no traffic.\" Check `cat /proc/net/bonding/bond0` — each slave should show `LACP PDU Rate: fast` and `Partner: ...` with a real system ID. Missing partner info = no LACP on the switch side.",
    },
    { kind: "heading", level: 3, text: "VLANs — many networks on one wire" },
    {
      kind: "prose",
      html:
        "A **VLAN** (Virtual LAN, IEEE 802.1Q) is a 4-byte tag prepended to each Ethernet frame that says \"this frame belongs to network X.\" A single physical link can carry dozens of VLANs, each appearing on both sides as a separate interface. In a DC, one bonded pair of NICs often handles a management VLAN, a data VLAN, and a storage VLAN — all over the same copper.",
    },
    {
      kind: "code",
      label: "VLAN SUB-INTERFACES",
      language: "bash",
      code:
        "# Create VLAN 100 on top of bond0.\nsudo ip link add link bond0 name bond0.100 type vlan id 100\nsudo ip link set dev bond0.100 up\nsudo ip addr add 10.10.100.50/24 dev bond0.100\n\n# Persistently with NetworkManager:\nsudo nmcli connection add type vlan con-name bond0.100 \\\n    ifname bond0.100 dev bond0 id 100 \\\n    ipv4.method manual ipv4.addresses 10.10.100.50/24\n\n# Verify the tag is being applied:\nip -d link show bond0.100             # -d shows vlan id + protocol\ntcpdump -nei bond0.100 -v vlan        # confirm tagged frames",
    },
    { kind: "heading", level: 3, text: "Bridges — software switches" },
    {
      kind: "prose",
      html:
        "A **Linux bridge** is a software Ethernet switch running inside the kernel. Frames entering any bridge port can be forwarded to any other bridge port based on MAC learning. Bridges are how containers, VMs, and namespaces share a logical network without each needing its own physical NIC. Docker, KVM, Kubernetes — all use bridges (or something bridge-like).",
    },
    {
      kind: "code",
      label: "CREATE A BRIDGE AND ATTACH INTERFACES",
      language: "bash",
      code:
        "sudo ip link add name br0 type bridge\nsudo ip link set br0 up\n\n# Attach a physical NIC as a bridge port (its IP moves to the bridge).\nsudo ip addr flush dev eth1\nsudo ip link set eth1 master br0\n\n# Attach a virtual (veth) pair — one end on bridge, one inside a namespace.\nsudo ip link add veth0 type veth peer name veth0-peer\nsudo ip link set veth0 master br0\nsudo ip link set veth0 up\n\n# Inspect the bridge learning table:\nbridge fdb show br br0\nip -d link show br0",
    },
    { kind: "heading", level: 3, text: "Network namespaces — kernel-level network isolation" },
    {
      kind: "prose",
      html:
        "A **network namespace** is a separate, isolated kernel network stack — its own interfaces, own routing table, own firewall rules, own sockets. Every container you run is in a namespace. You can also create them directly for tasks like \"run this process as if it were on a different network.\"",
    },
    {
      kind: "code",
      label: "NAMESPACES BY HAND — NO CONTAINER RUNTIME NEEDED",
      language: "bash",
      code:
        "sudo ip netns add ns-blue\nsudo ip netns exec ns-blue ip link show    # shows only 'lo' — its own stack\n\n# Connect the namespace to the host with a veth pair.\nsudo ip link add veth-blue type veth peer name veth-blue-peer\nsudo ip link set veth-blue-peer netns ns-blue\nsudo ip addr add 10.200.0.1/24 dev veth-blue\nsudo ip link set veth-blue up\n\nsudo ip netns exec ns-blue ip addr add 10.200.0.2/24 dev veth-blue-peer\nsudo ip netns exec ns-blue ip link set veth-blue-peer up\n\n# Now from inside the namespace:\nsudo ip netns exec ns-blue ping 10.200.0.1      # reaches the host\nsudo ip netns exec ns-blue ip route             # its own routing table\n\n# When done:\nsudo ip netns del ns-blue",
    },
    {
      kind: "flip-cards",
      intro: "A cheat-sheet of the commands for each primitive.",
      cards: [
        {
          front: "Bond status",
          back: "`cat /proc/net/bonding/bond0` — mode, slaves, LACP partner, MII status. Essential for diagnosing mis-bonded links.",
        },
        {
          front: "VLAN verification",
          back: "`ip -d link show bond0.100` shows the 802.1Q id. `tcpdump -nei bond0.100 vlan` confirms tagged frames.",
        },
        {
          front: "Bridge forwarding db",
          back: "`bridge fdb show br br0` — which MACs the bridge has learned and on which ports. Debugging a \"packet never arrives at VM\" starts here.",
        },
        {
          front: "Enter a namespace",
          back: "`sudo ip netns exec <name> <cmd>` — run a command inside. `sudo nsenter -n -t <PID> <cmd>` to enter a container's namespace by PID.",
        },
        {
          front: "Container's namespace",
          back: "`docker inspect -f '{{.State.Pid}}' container` gives the PID; `nsenter -t PID -n ip addr` shows its network state from the host.",
        },
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "A bonded pair of NICs is configured as mode 4 (LACP). One member's link light is on, but `cat /proc/net/bonding/bond0` shows that slave as `MII Status: up` and `LACP PDU Rate: slow` but no `Partner:` information. Traffic never exits that NIC. What's the root cause and the fix?",
      hint: "LACP is a conversation. What happens if only one side is talking?",
      answer:
        "The switch-side port isn't configured for LACP. The Linux side sends LACPDUs (the protocol heartbeats) but never gets a peer response, so no aggregation is formed. The port is technically 'up' but carries no production traffic. Fix: on the switch, configure the matching ports into an LACP port-channel (names vary: Cisco calls it 'channel-group X mode active', Arista 'port-channel', Juniper 'aggregated-ether-options lacp active'). Once both sides agree, `cat /proc/net/bonding/bond0` shows Partner info with the switch's MAC, and the bond becomes a real aggregation. Meta-lesson: when half a bond works and the other half is 'up but dead', suspect a switch-side misconfiguration before blaming the Linux box.",
    },
    {
      kind: "knowledge-check",
      question:
        "You need to provision a host with: (1) LACP bond across two 25 GbE NICs, (2) management traffic on VLAN 10, (3) data traffic on VLAN 20, (4) a bridge for container networking on VLAN 20, (5) ensure 802.1Q tags are transparent to the switches. Describe the stack from bottom to top and the key configuration for each layer.",
      answer:
        "Bottom to top: (1) **Physical NICs** `ens1f0` and `ens1f1` — no IP, no configuration beyond `up`. (2) **Bond device** `bond0` in mode 802.3ad, both NICs as slaves. Verify LACP partner with `/proc/net/bonding/bond0`. Switches must be configured for LACP port-channel on matching ports. (3) **VLAN sub-interfaces on the bond** — `bond0.10` with the management IP, `bond0.20` for data. The physical layer (NICs/switch) sees tagged frames from the host. (4) **Bridge** `br-data` attached on top of `bond0.20` — give the bridge the host's data IP (if needed), attach container veth pairs as bridge ports. Now every container sees VLAN 20 transparently through the bridge. (5) **802.1Q transparency**: switch ports must be configured as **trunk** mode with VLANs 10 and 20 allowed (and no PVID/native-VLAN conflict). An access-mode port would strip the tag and the host would never see a VLAN-tagged frame. Verify end-to-end with `tcpdump -nei bond0.20 vlan` from the host, confirming the 802.1Q header is present in captured frames.",
    },
  ],
};

const lxaS10: ChapterSection = {
  id: "lxa-s10",
  topicId: "linux",
  title: "TCP Tuning, Conntrack at Scale, and Forensic Tools",
  subtitle: "Making a 100 GbE NIC actually deliver 100 Gbps, and the forensic kit when it doesn't.",
  icon: "⟴",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A brand-new 100 GbE NIC with default kernel settings will deliver about **3 Gbps** on a single TCP flow over a long-distance link. That's not a hardware limit; it's a kernel-defaults limit. Hyperscale networks live or die on the handful of `sysctl` knobs that turn the kernel into a high-bandwidth transport — and the handful of forensic tools that tell you where a flow actually got stuck.",
    },
    {
      kind: "prose",
      html:
        "A team pings you: \"We upgraded the cross-DC link from 10G to 100G. `iperf` still says 3.5 Gbps. Did we waste money?\" You log in. `iperf3 -c remote -P 32` across 32 parallel flows hits 95 Gbps. Single flow is stuck at ~3 Gbps. The hardware is fine — the kernel's **send/receive window** is too small for the bandwidth-delay product of the long link. This entire chapter is the list of knobs that close that gap, plus the tools that tell you when you need to turn them.",
    },
    { kind: "heading", level: 3, text: "TCP tuning — making the kernel ready for modern bandwidth" },
    {
      kind: "prose",
      html:
        "TCP throughput on a single flow is roughly **window size / round-trip time**. With the default 4 MB max window and a 20 ms cross-DC RTT, max single-flow throughput is `4 MB / 20 ms = 200 MB/s ≈ 1.6 Gbps`. Raise the window to 64 MB and suddenly that's 25 Gbps. The Linux kernel has auto-tuning, but it has *ceilings* you may need to raise.",
    },
    {
      kind: "table",
      headers: ["Knob", "What it controls", "Typical DC value"],
      rows: [
        ["`net.core.rmem_max`", "Max receive buffer size for any socket", "134217728 (128 MB)"],
        ["`net.core.wmem_max`", "Max send buffer size for any socket", "134217728"],
        ["`net.ipv4.tcp_rmem`", "min / default / max TCP receive window", "4096 87380 134217728"],
        ["`net.ipv4.tcp_wmem`", "min / default / max TCP send window", "4096 65536 134217728"],
        ["`net.core.netdev_max_backlog`", "Per-CPU packet queue before drop", "300000 (on 100G+ NICs)"],
        ["`net.ipv4.tcp_congestion_control`", "Congestion algorithm", "`bbr` for high-bandwidth/high-RTT"],
        ["`net.ipv4.tcp_notsent_lowat`", "Bytes buffered before app is signaled", "131072 — helps latency-sensitive apps"],
      ],
    },
    {
      kind: "code",
      label: "APPLY AND PERSIST TCP TUNING",
      language: "bash",
      code:
        '# /etc/sysctl.d/99-tcp-tuning.conf\nnet.core.rmem_max = 134217728\nnet.core.wmem_max = 134217728\nnet.ipv4.tcp_rmem = 4096 87380 134217728\nnet.ipv4.tcp_wmem = 4096 65536 134217728\nnet.core.netdev_max_backlog = 300000\nnet.ipv4.tcp_congestion_control = bbr\n\n# Apply immediately without reboot:\nsudo sysctl --system\n\n# Verify active values:\nsysctl net.ipv4.tcp_congestion_control\nsysctl net.core.rmem_max',
    },
    {
      kind: "fill-blank",
      prompt:
        "Your cross-DC link has 20 ms RTT and 100 Gbps bandwidth. Compute the minimum TCP window size (bytes) for a single flow to saturate the link, and write the `sysctl` name you would tune to raise the max receive window.",
      sentence:
        "Bandwidth-delay product: 100 Gbps \u00d7 0.020 s = {0} bytes.\nSysctl to tune: {1}",
      blanks: [
        {
          answer: "250000000",
          alternates: ["250 MB", "250MB", "250000000 bytes", "~250M"],
          hint: "bytes",
        },
        {
          answer: "net.core.rmem_max",
          alternates: ["net.ipv4.tcp_rmem", "rmem_max"],
          hint: "sysctl name",
        },
      ],
      reveal:
        "BDP = 100 Gbps × 0.020 s = 2 × 10⁹ bits = 250 MB. For a single TCP flow to fully saturate a 100 Gbps, 20 ms RTT path, the receiver must be able to advertise a window of at least **~250 MB**. `net.core.rmem_max` sets the ceiling for per-socket receive buffers; `net.ipv4.tcp_rmem` (the third column, max) must also allow that size. At hyperscale, 512 MB or larger isn't unusual. And remember: the **sender's send buffer** (`wmem_max`) needs to match — no point receiving a huge window you can't send into.",
    },
    { kind: "heading", level: 3, text: "BBR — the modern congestion control" },
    {
      kind: "prose",
      html:
        "The legacy TCP congestion control (`cubic`) treats every packet loss as a signal to slow down. That's fine on a loss-prone LAN, terrible on a high-latency link where the queueing model matters more than random loss. **BBR** (Bottleneck Bandwidth and Round-trip propagation time) — developed at Google — actively models the path's bottleneck and keeps the pipe full without relying on loss as a signal. On long-haul links it's often 3-10× faster than cubic.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "BBR requires the `fq` qdisc",
      body:
        "BBR's pacing works correctly only when packets are actually paced by the kernel — which means the `fq` queueing discipline must be active on the egress interface. Set it with `sudo tc qdisc replace dev eth0 root fq`. Some distros default to `fq_codel` or `pfifo_fast`; BBR won't error, just won't perform optimally. Verify with `tc qdisc show dev eth0`.",
    },
    { kind: "heading", level: 3, text: "Jumbo frames end-to-end" },
    {
      kind: "prose",
      html:
        "Default Ethernet MTU is **1500 bytes**. On a 100 GbE link, that's about 8 million packets per second to fill the pipe — each packet costs a bit of CPU to process. **Jumbo frames** (MTU 9000) cut that packet rate by 6×, freeing CPU and reducing per-packet overhead. The catch: every hop in the path — switches, routers, endpoints — must agree on the MTU. One default-1500 interface in the middle and packet fragmentation or drops silently crater performance.",
    },
    {
      kind: "code",
      label: "SET AND VERIFY JUMBO FRAMES",
      language: "bash",
      code:
        "# Configure on the interface:\nsudo ip link set dev bond0 mtu 9000\n# Persistent via NetworkManager:\nsudo nmcli connection modify bond0 802-3-ethernet.mtu 9000\n\n# Verify end-to-end with DF-bit-set ping — if any hop has a smaller MTU, the\n# kernel gets an ICMP fragmentation-needed and this command fails:\nping -M do -s 8972 10.0.12.1\n# 8972 = 9000 MTU - 20 IP header - 8 ICMP header\n\n# Useful for finding where MTU breaks:\ntracepath 10.0.99.1        # reports the path MTU at each hop",
    },
    { kind: "heading", level: 3, text: "Conntrack at scale" },
    {
      kind: "prose",
      html:
        "As covered in the security chapter, conntrack tracks every stateful flow. At high-connection workloads (API gateways, reverse proxies, DNS servers) the default table size is a common bottleneck. Two things worth remembering at scale: (1) raise `nf_conntrack_max` to match load, (2) lower `nf_conntrack_tcp_timeout_established` so idle flows free slots faster.",
    },
    {
      kind: "code",
      label: "CONNTRACK TUNING CHEAT SHEET",
      language: "bash",
      code:
        "# Watch real-time utilization:\nwatch -n 1 'cat /proc/sys/net/netfilter/nf_conntrack_count /proc/sys/net/netfilter/nf_conntrack_max'\n\n# Tune via sysctl:\nsudo sysctl -w net.netfilter.nf_conntrack_max=2097152\nsudo sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=3600\nsudo sysctl -w net.netfilter.nf_conntrack_buckets=524288\n\n# Check for drops:\ndmesg | grep -i conntrack\ncat /proc/net/stat/nf_conntrack",
    },
    { kind: "heading", level: 3, text: "Forensic tools — tcpdump, ss, ethtool" },
    {
      kind: "prose",
      html:
        "When tuning doesn't fix it, you capture and inspect. Three tools cover most investigations.",
    },
    {
      kind: "flip-cards",
      intro:
        "The sockets and packets you actually need to see — one-liners for each tool.",
      cards: [
        {
          front: "`ss -tanp | head`",
          back: "Listing sockets: `-t` TCP, `-a` all, `-n` numeric, `-p` processes. Fast alternative to `netstat`. Add `-e` for details, `-i` for per-socket TCP internals (cwnd, rtt).",
        },
        {
          front: "`ss -s`",
          back: "Summary: counts of TCP/UDP sockets by state. Instantly tells you if you're drowning in `TIME-WAIT` or `CLOSE-WAIT` states.",
        },
        {
          front: "`tcpdump -nei eth0 'tcp and port 443'`",
          back: "Packet capture. `-n` numeric, `-e` Ethernet headers, `-i` interface. Filter expression follows — BPF syntax. For writing to disk: `-w capture.pcap`, then analyze with Wireshark.",
        },
        {
          front: "`ethtool -S eth0 | grep -i error`",
          back: "NIC-level counters: dropped, errors, CRC, framing, collisions. If errors are non-zero and climbing, you have a physical-layer problem — cable, transceiver, NIC card.",
        },
        {
          front: "`ethtool -g eth0`",
          back: "Ring buffer sizes. Raising RX/TX ring sizes to NIC max (often 4096) can cut drops on bursty traffic: `ethtool -G eth0 rx 4096 tx 4096`.",
        },
      ],
    },
    {
      kind: "custom-component",
      id: "packet-stack",
      props: {
        title: "Interactive: packet through the stack",
        caption:
          "Click each layer to inspect what the kernel is doing as a single HTTP GET traverses the full stack — from application socket down through TCP, IP, netfilter, qdisc, and out the NIC.",
      },
    },
    {
      kind: "mcq-inline",
      question:
        "A long-running SSH session to a remote DC suddenly becomes sluggish; ping stays at 20 ms but throughput collapses to a few KB/s. You run `ethtool eth0` and see `Speed: 100000Mb/s Duplex: Full Link detected: yes`. Errors are zero. What's the most likely cause at this layer?",
      choices: [
        { label: "A", text: "Physical-layer link failure" },
        { label: "B", text: "A TCP congestion-control issue — one or more drops on the path plus `cubic`'s aggressive backoff can tank throughput on high-RTT links. BBR + raised socket buffers often resolves" },
        { label: "C", text: "Conntrack table full" },
        { label: "D", text: "VLAN misconfiguration" },
      ],
      correctAnswer: "B",
      explanation:
        "Physical-layer is healthy (speed, duplex, no errors). Ping is normal, so the path is alive. Symptoms — suddenly degraded throughput on a long-RTT link — are the classic cubic-on-lossy-long-haul problem. Switching the congestion control to BBR (and ensuring socket buffers are large enough for the BDP) routinely restores throughput. Conntrack fill would manifest as new connections failing, not existing sessions slowing. VLAN misconfiguration typically breaks connectivity entirely, not just throughput.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You set `rmem_max=134217728` on both ends of a 40G DC-to-DC link. iperf single-flow throughput is still stuck at ~2 Gbps. `tcpdump` shows retransmits under load. RTT is 5 ms. What would you check next?",
      hint: "The receive window has to match the NIC's ability to actually drain packets without drops.",
      answer:
        "A few layers to investigate. (1) Verify the setting actually applies to your socket. `ss -ti` on an active flow prints its current send/recv window (cwnd, wnd). If `wnd` is still small, the app may be using SO_RCVBUF explicitly (overriding kernel defaults), or your sysctl didn't take effect. (2) Check NIC ring buffers: `ethtool -g eth0` — if at default (often 512 or 1024), raise to max (`ethtool -G eth0 rx 4096 tx 4096`). Drops on the ring surface as retransmits. (3) Check `ethtool -S | grep -i drop` and `/proc/net/softnet_stat` — drops on the softirq path, same effect. (4) Confirm `tcp_congestion_control` is `bbr` and the qdisc is `fq`. (5) Look at interrupt affinity: `cat /proc/interrupts | grep eth0` — NIC IRQs bunched on one CPU can bottleneck; use `set_irq_affinity.sh` (or equivalent) to spread them. Each layer — kernel, NIC driver, interrupts — can clip throughput below the TCP window's theoretical max. Walk the stack top-down until you find the limiter.",
    },
    {
      kind: "knowledge-check",
      question:
        "A web-tier node has 500K concurrent TCP connections. `ss -s` shows 450K in `TIME-WAIT`. New connections intermittently fail with \"Cannot assign requested address.\" What's happening and what are two kernel-level mitigations?",
      answer:
        "You've exhausted the **local ephemeral port range**. Every outbound TCP connection from a single source IP to a given (destip, destport) pair needs a unique source port. With 64k max ports and hundreds of thousands of connections piling up in TIME-WAIT (the default 60-second post-close state), you run out. Two kernel-level mitigations: (1) **Widen the ephemeral port range**: `sysctl -w net.ipv4.ip_local_port_range='1024 65000'`. (2) **Reduce TIME-WAIT duration** — `net.ipv4.tcp_fin_timeout=15` halves it. Also consider `net.ipv4.tcp_tw_reuse=1` which lets the kernel reuse TIME-WAIT sockets for new outgoing connections; it's safer than the historically misused `tcp_tw_recycle` (which is gone in modern kernels and should never be re-introduced — it breaks NAT environments). At the application level, use connection pooling so you're not constantly tearing down and opening fresh TCP connections; that's often the real fix.",
    },
  ],
};

// ── linux-m18 Containers & Git ──────────────────────────────────────────────

const lxaS11: ChapterSection = {
  id: "lxa-s11",
  topicId: "linux",
  title: "Containers Explained — Namespaces, cgroups, and Docker in Daily Ops",
  subtitle: "A container is not a VM. It's a process with kernel tricks.",
  icon: "◫",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Containers are the deployment primitive of the modern DC. Knowing how they *actually* work — as regular Linux processes wrapped in namespaces and cgroups — lets you debug them with the same tools you use for anything else: `ps`, `top`, `lsof`, `strace`. Teams that treat containers as opaque 'mini-VMs' are blind when a container misbehaves; teams that see them as processes find the root cause in minutes.",
    },
    {
      kind: "prose",
      html:
        "A service running in a container dies with exit code **137**. You look at `docker logs`: nothing interesting in the app output. You restart. It dies again, exit 137. A teammate says \"something's wrong with Docker.\" It's not — exit code 137 is **128 + 9**, i.e., the container was SIGKILLed (signal 9). By whom? Almost always the kernel's OOM killer, because your `--memory=2G` limit was smaller than the workload wanted. **Every piece of that diagnosis is a standard Linux concept** — signals, exit codes, OOM — not Docker magic. This chapter is the mental model that lets you reach that diagnosis in 30 seconds.",
    },
    { kind: "heading", level: 3, text: "What a container actually is" },
    {
      kind: "prose",
      html:
        "A container is a **regular Linux process** with three kernel features layered on: **namespaces** (isolation of what the process sees), **cgroups** (isolation of how much it can consume), and a **union filesystem** (layered read-only/read-write view of files). Put together, a process thinks it has its own OS — but from the host, it's just `ps`.",
    },
    {
      kind: "collapsible",
      intro:
        "The six namespaces that make up 'container isolation'. Each is a kernel feature you can use independently of Docker.",
      items: [
        {
          title: "PID namespace",
          body:
            "The container's PIDs start over at 1. Inside the container, `ps` shows only its own processes. From the host, all those processes are visible with their real (host) PIDs — you can attach a debugger from outside.",
          color: "#50C8FF",
        },
        {
          title: "NET namespace",
          body:
            "Its own interfaces, routing table, firewall rules, sockets. Covered in chapter 9. This is why two containers on the same host can each bind to port 80 without conflict.",
          color: "#FFA832",
        },
        {
          title: "MNT (mount) namespace",
          body:
            "Its own view of the filesystem tree. A container sees its image's rootfs as `/`, not the host's `/`. Volumes and bind mounts punch holes for specific directories to show through.",
          color: "#7AE87A",
        },
        {
          title: "UTS namespace",
          body:
            "Its own hostname and domain name. That's why `hostname` inside a container returns the container ID (by default) — it's a different UTS namespace from the host.",
          color: "#FF6B6B",
        },
        {
          title: "IPC namespace",
          body:
            "Its own System V IPC and POSIX message queues. Two containers can't see each other's shared memory unless you explicitly share the namespace.",
          color: "#C58AFF",
        },
        {
          title: "USER namespace",
          body:
            "Maps user IDs between the container and the host. UID 0 (root) inside a container can map to an unprivileged UID outside — a real security boundary. Often disabled by default; explicitly enabled for rootless Docker and Kubernetes security contexts.",
          color: "#5AD0D0",
        },
      ],
    },
    {
      kind: "prose",
      html:
        "The **union filesystem** (overlayfs on modern Docker) stacks a read-only image layer with a writable top layer. Multiple containers from the same image share the read-only layers — huge disk savings. Changes happen in the top writable layer and vanish when the container is removed. `/var/lib/docker` is where all of this lives.",
    },
    { kind: "heading", level: 3, text: "Images vs containers" },
    {
      kind: "prose",
      html:
        "An **image** is a static filesystem blueprint — a tarball of layers plus metadata (CMD, ENV, EXPOSE). A **container** is a running (or stopped) process started from an image. One image can launch thousands of containers. Mixing up the two vocabulary-wise is the single biggest source of confusion for newcomers.",
    },
    {
      kind: "table",
      headers: ["", "Image", "Container"],
      rows: [
        ["Analogy", "A class definition", "A running instance"],
        ["Persistence", "Tarball on disk; immutable", "Ephemeral; disappears on `rm`"],
        ["Commands", "`docker images`, `docker pull`, `docker build`", "`docker ps`, `docker run`, `docker rm`"],
        ["Layered", "Yes — dozens of layers often", "Adds one writable layer on top"],
        ["Shared across hosts", "Yes — push/pull to a registry", "No — exists on one host"],
      ],
    },
    { kind: "heading", level: 3, text: "The daily-ops command set" },
    {
      kind: "prose",
      html:
        "Eight commands cover 95% of day-to-day container operations. Everything else is a power-up on these.",
    },
    {
      kind: "code",
      label: "THE EIGHT YOU'LL RUN EVERY DAY",
      language: "bash",
      code:
        'docker ps                     # running containers (add -a for stopped too)\ndocker logs -f --tail=200 <c>  # tail a container\'s stdout/stderr\ndocker exec -it <c> bash       # attach to a running container (bash if available)\ndocker inspect <c>             # full JSON state — networks, mounts, env, config\ndocker stats --no-stream       # CPU/mem/net/io, one snapshot — useful in scripts\ndocker top <c>                 # host-side `ps` for a container\'s processes\ndocker restart <c>             # graceful restart (SIGTERM then SIGKILL after 10s)\ndocker rm -f <c>               # force-remove — skip the SIGTERM\n\n# Diagnostics one-liners:\ndocker inspect -f \'{{.State.Pid}}\' <c>   # get host PID for nsenter\ndocker inspect -f \'{{.State.ExitCode}}\' <c>   # see why it died\ndocker inspect -f \'{{json .NetworkSettings}}\' <c> | jq',
    },
    {
      kind: "fill-blank",
      prompt:
        "A container is crashing on startup with no logs. You want to inspect its *final* exit code and the most recent error, without starting a new container.",
      sentence:
        "Exit code: docker inspect -f '{{ .State.{0} }}' <container>\nStatus:    docker inspect -f '{{ .State.{1} }}' <container>",
      blanks: [
        {
          answer: "ExitCode",
          alternates: ["Exitcode", "exit_code"],
          hint: "camelCase",
        },
        {
          answer: "Error",
          alternates: ["Status"],
          hint: "word",
        },
      ],
      reveal:
        "`docker inspect -f '{{ .State.ExitCode }}' <container>` — returns the numeric exit code of the last run. Common mappings: **0** clean exit, **1** generic error, **125** docker itself errored, **126** invalid command, **127** command not found, **137** SIGKILLed (128+9, usually OOM), **139** SIGSEGV. `.State.Error` holds any Docker-level failure message. Together these two fields tell you whether the container's *application* failed (exit code set by app) or the *kernel/runtime* killed it (exit code 137/139) — crucial for picking the right next step.",
    },
    { kind: "heading", level: 3, text: "Volumes, networks, and the debugging edge" },
    {
      kind: "prose",
      html:
        "Three storage modes: **bind mount** (host path mapped directly — great for dev, risky for portability), **named volume** (Docker manages it — portable, clean, hard to poke at directly), **tmpfs** (memory-backed, gone on exit). Three networks: **bridge** (default — Docker-managed L2), **host** (skip Docker networking entirely — container shares host's stack), **none** (no networking at all — for strict isolation).",
    },
    {
      kind: "code",
      label: "ENTER A CONTAINER'S NAMESPACES FROM THE HOST",
      language: "bash",
      code:
        "# Get the container's host-visible PID.\npid=$(docker inspect -f '{{.State.Pid}}' <container>)\n\n# Run arbitrary commands inside its namespaces — no need for bash-in-image.\nsudo nsenter -t $pid -a  bash       # -a enters ALL namespaces\nsudo nsenter -t $pid -n ss -tlnp    # just the network namespace\nsudo nsenter -t $pid -m ls /etc     # just the mount namespace\n\n# Look at the container's cgroup limits directly:\ncat /sys/fs/cgroup/<slice>/docker-<cid>.scope/memory.max",
    },
    {
      kind: "flip-cards",
      intro: "Commands that unlock containers when `docker logs` doesn't cut it.",
      cards: [
        {
          front: "`docker events`",
          back: "Stream of container lifecycle events from the Docker daemon — start, stop, die, OOM, health-check changes. Essential for understanding WHY a container died when logs are silent.",
        },
        {
          front: "`docker stats --no-stream`",
          back: "Per-container CPU/memory/net/io snapshot. Scriptable (unlike the default interactive stats view). Sorting by `MEM%` identifies the container that's about to OOM.",
        },
        {
          front: "`docker top <c>`",
          back: "Same as `ps` but scoped to one container's processes, shown with host PIDs. When `docker exec` doesn't work (no shell in the image), this is your window in.",
        },
        {
          front: "`docker system df`",
          back: "Disk-usage breakdown: images, containers, volumes, build cache. Often the answer to 'why is /var/lib/docker full?' Prune with `docker system prune` (aggressive) or scoped variants.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Exit code 137 (SIGKILL) ≈ OOM — almost always",
      body:
        "Exit 137 = 128 + 9 = the container received SIGKILL. On a healthy host, this is typically the kernel's OOM killer triggered by the container's cgroup memory limit. Check `dmesg | grep -i oom-killer` and the cgroup's `memory.events` file for `oom_kill` count. Fix: raise the `--memory` limit, or profile the workload and fix the leak.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A container runs fine for 45 minutes, then dies with exit 137. `dmesg` shows no OOM kill. `docker logs` shows the app's normal startup messages. What are two non-OOM causes of exit 137 and how would you distinguish?",
      hint: "SIGKILL has other senders besides the OOM killer.",
      answer:
        "Exit 137 just means SIGKILL was received. Non-OOM senders: (1) **Docker daemon timing out on a stop request**. A `docker stop` sends SIGTERM, waits 10 seconds, then SIGKILL if the container hasn't exited. A poorly-behaved app that ignores SIGTERM gets SIGKILL'd; the exit code is still 137. Check: `docker events` around the time of death for a `stop` event, or `docker inspect` for `State.OOMKilled` (true for OOM). (2) **Liveness probe failures** in Kubernetes or `docker-compose healthcheck` configurations. If the probe fails repeatedly, the orchestrator SIGKILLs the container. Check the orchestrator's logs (kubectl describe, compose output). (3) Less commonly: someone explicitly running `docker kill <c>` from another session. `docker events` again. The diagnostic flow is: check `docker events` for the surrounding timeline, check `docker inspect .State.OOMKilled`, check `dmesg` for kernel-level OOM. That triangulates sender.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague runs `docker run --rm -it ubuntu:22.04 bash` on a production host, pokes around, exits. They didn't pass `--memory` or `--cpus`. What happens if that container ran `stress --vm 1 --vm-bytes 100G` on an 80 GB host? Why, and what's the production-hardening takeaway?",
      answer:
        "The container has **no cgroup memory limit** (default). It competes with every other process on the host for physical memory. When it tries to allocate 100 GB on an 80 GB host, it will rapidly push the host toward OOM. The kernel's OOM killer then picks a victim based on the oom_score — which may be the greedy container, but may *also* be another innocent container or even a system daemon. An unprivileged container with no limit can effectively DoS the entire host. Hardening takeaways: (1) **Never run untrusted workloads without limits** — set `--memory`, `--cpus`, `--pids-limit`, `--ulimit` as policy. (2) In production, enforce limits via the orchestrator (Kubernetes `resources.limits`, systemd service `MemoryMax=`). (3) Consider setting a host-level `vm.overcommit_memory` policy and lowering `oom_score_adj` on critical system services (`-1000` makes them effectively immune to the OOM killer) so that if OOM strikes, the container is the victim — not sshd. (4) For multi-tenant hosts, use **user namespace remapping** plus filesystem quotas plus cgroup limits — defense in depth against a container that tries to consume the whole host.",
    },
  ],
};

const lxaS12: ChapterSection = {
  id: "lxa-s12",
  topicId: "linux",
  title: "Git for Ops — Branches, Bisect, Reverts, and Recovery",
  subtitle: "Every configuration change is now a commit. Your Git fluency is your ops fluency.",
  icon: "⑂",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Infrastructure is code. Your firewall rules, your Ansible playbooks, your Kubernetes manifests, your Terraform state — **all of it lives in Git**. Being fluent in Git isn't a developer luxury anymore; it's the operator's core skill. Knowing `git bisect` saves hours of searching for when a regression landed. Knowing `git revert` vs `git reset` is the difference between a safe rollback and a public force-push that breaks every teammate's working copy.",
    },
    {
      kind: "prose",
      html:
        "Wednesday, 14:03. A colleague pushes a change to the infrastructure repo. Deployment automation applies it fleet-wide. By 14:15 the dashboards are red — a subtle regression in something that's been stable for months. \"Revert the commit!\" someone shouts. You reach for `git reset --hard HEAD~1`. Before you hit enter you remember: that's the command that **rewrites history**. Seven teammates have the original HEAD as their base. A force-push now will destroy their in-flight work. The **right** command is `git revert HEAD` — which creates a *new* commit that undoes the bad one, leaving everyone's history intact. This chapter is the muscle memory of \"right command for the situation.\"",
    },
    { kind: "heading", level: 3, text: "Branching models — merge vs rebase" },
    {
      kind: "prose",
      html:
        "Every team lives somewhere on the merge/rebase spectrum. Neither is \"right\" — each has tradeoffs. Ops repos (where every commit is potentially a production change) usually benefit from a clean linear history; but discarding real history can obscure context too.",
    },
    {
      kind: "table",
      headers: ["", "Merge", "Rebase"],
      rows: [
        ["History", "Preserved — branch structure visible", "Rewritten — linear on top of target"],
        ["`git log --graph`", "Shows the actual topology", "Looks like one continuous thread"],
        ["Safe to share?", "Yes, always", "Only BEFORE pushing — never rebase published commits"],
        ["Conflict resolution", "Once, in the merge commit", "Potentially per rebased commit"],
        ["Use when", "Want full history of how a change was developed", "Want a clean linear history in the target branch"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The golden rule of rebase",
      body:
        "**Never rebase commits that have been pushed** to a branch others rely on. Rebasing published history forces every collaborator to untangle their local state. If you must change a shared branch's history, coordinate explicitly (\"force push to main at 3 PM, everyone rebase your feature branches after\") — and consider just using a revert commit instead.",
    },
    { kind: "heading", level: 3, text: "Bisect — the superpower" },
    {
      kind: "prose",
      html:
        "`git bisect` is a binary search through commit history for the commit that introduced a bug. You mark one commit as 'good' (the regression isn't there) and one as 'bad' (regression present). Git checks out a commit in the middle; you test, tell it good or bad; Git narrows. In `log₂(N)` steps it identifies the exact commit. On a 1024-commit range that's 10 tests instead of reading 1024 diffs.",
    },
    {
      kind: "code",
      label: "BISECT WORKFLOW",
      language: "bash",
      code:
        "git bisect start\ngit bisect bad                 # current HEAD is broken\ngit bisect good v2.4.0         # this tag was known-good\n\n# Git checks out a commit in the middle. Test it. Report:\ngit bisect good                # if bug is NOT present\n# or\ngit bisect bad                 # if bug IS present\n\n# Repeat until Git names the exact first-bad commit.\n# When done:\ngit bisect reset               # return to your original branch\n\n# Automated variant — run a test command for each step:\ngit bisect start HEAD v2.4.0\ngit bisect run ./tests/regression.sh     # Git bisects itself",
    },
    { kind: "heading", level: 3, text: "Revert vs reset — two different hammers" },
    {
      kind: "prose",
      html:
        "These two commands sound similar and do *completely different things*. Mistaking one for the other is how teammates lose work.",
    },
    {
      kind: "collapsible",
      intro:
        "Pick the right hammer for the job. Click each for the exact effect and when to reach for it.",
      items: [
        {
          title: "`git revert <commit>` — create a new undo commit",
          body:
            "Creates a *new* commit whose content is the inverse of `<commit>`. History preserved: the original bad commit stays, followed by the revert. Safe on shared branches. This is the production-rollback tool — `git revert HEAD` for the most recent commit, `git revert <sha>` for an older one.",
          color: "#7AE87A",
        },
        {
          title: "`git reset --soft HEAD~1` — move branch pointer, keep changes staged",
          body:
            "The branch pointer moves back one commit, but your working tree and index keep the reset's changes, staged for re-commit. Useful when you committed too early and want to rework the commit message or split it.",
          color: "#50C8FF",
        },
        {
          title: "`git reset --hard <sha>` — move pointer AND discard all changes",
          body:
            "Drops every commit since `<sha>` from the current branch AND discards any uncommitted work. Fast but **destructive**. Only safe on un-pushed local history. Never on a shared branch.",
          color: "#FF6B6B",
        },
        {
          title: "`git restore --source=<sha> <path>` — checkout one file from one commit",
          body:
            "Modern Git (2.23+) — grab one file's content from any commit without changing the branch. Great for 'I want the old version of this one file' without a full revert.",
          color: "#C58AFF",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Recovery — the reflog and when you thought work was lost" },
    {
      kind: "prose",
      html:
        "Every HEAD movement — commits, checkouts, resets, rebases — is logged in the **reflog**. If you `git reset --hard` over a commit you needed, the commit isn't gone. Git keeps unreachable commits for 30 days by default. `git reflog` shows the history of where HEAD has been. Pair it with `git cherry-pick <sha>` to rescue the commit.",
    },
    {
      kind: "code",
      label: "RECOVERING FROM A BAD RESET",
      language: "bash",
      code:
        'git reflog\n# HEAD@{0} fed5a1c reset: moving to HEAD~5\n# HEAD@{1} 8def123 commit: important change I just lost\n# HEAD@{2} ...\n\n# Bring back that "lost" commit:\ngit cherry-pick 8def123\n\n# Or recover the whole branch state:\ngit reset --hard 8def123\n\n# Nuclear recovery from "I rebased wrong and now everything is broken":\ngit reset --hard ORIG_HEAD      # the automatic "before the rebase" marker',
    },
    { kind: "heading", level: 3, text: "IaC discipline — PR hygiene for configuration changes" },
    {
      kind: "prose",
      html:
        "When your firewall rules, your Ansible roles, and your Kubernetes manifests all live in Git, the same engineering discipline applies as to application code. Most incidents on mature teams trace back to a missing piece of this hygiene.",
    },
    {
      kind: "bullets",
      items: [
        "**Tag releases.** Annotated tags (`git tag -a v2025.04.01 -m '...'`) mark deploy-able points. You can bisect back to them; you can cherry-pick security fixes onto them.",
        "**Signed commits.** `git commit -S` + GPG — cryptographically proves who authored the change. Matters when \"who approved this firewall change?\" turns into a forensic question.",
        "**PR reviews, not direct push.** Every change goes through PR, with at least one reviewer. `git push origin main` from someone's laptop is a liability.",
        "**Short-lived branches.** A feature branch that lives a week is fine; a feature branch that lives a month becomes painful to merge. Small PRs, fast review cycles.",
        "**Meaningful commit messages.** `fix: drop nf_conntrack_tcp_timeout_established to 3600 to relieve table pressure on API gateways` beats `tune conntrack`. Future-you running `git log --oneline` will thank present-you.",
      ],
    },
    {
      kind: "flip-cards",
      intro: "The command set that covers 90% of ops-repo interactions.",
      cards: [
        {
          front: "`git log --oneline --graph --all`",
          back: "Compact visual of all branches. The first thing to run when joining an unfamiliar repo — shows branching strategy at a glance.",
        },
        {
          front: "`git log --follow --patch <file>`",
          back: "Full history of a single file, including its diffs, following renames. The answer to 'when did this line change?' without reading every commit.",
        },
        {
          front: "`git blame <file>`",
          back: "Line-by-line, who last modified each line and in what commit. Pair with `-L 40,60` to scope to a range.",
        },
        {
          front: "`git stash push -m 'wip'`",
          back: "Tuck away uncommitted changes, then `git stash pop` to bring them back. Use when an urgent task interrupts your current work.",
        },
        {
          front: "`git diff --stat <base>...HEAD`",
          back: "Summary of what's changed between a base and your branch — file names and line counts. Useful for PR descriptions or self-review before pushing.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You accidentally pushed a commit to `main` that broke production. Six teammates have already pulled the bad commit. What's the correct rollback?",
      choices: [
        { label: "A", text: "`git reset --hard HEAD~1; git push -f origin main` — rewrite history to erase the bad commit" },
        { label: "B", text: "`git revert HEAD; git push origin main` — create a new commit that undoes the bad change; everyone's history stays consistent" },
        { label: "C", text: "Delete `main` and recreate it from a tag" },
        { label: "D", text: "`git checkout HEAD~1` on everyone's laptops" },
      ],
      correctAnswer: "B",
      explanation:
        "`git revert` creates a *new* commit that's the inverse of the bad one, preserving history and letting everyone's working copy stay consistent. Force-pushing `--hard` over `main` rewrites history — teammates who've pulled the bad commit will find their local `main` diverging from origin, and they'll spend time untangling it. Reserve `reset --hard` + force-push for un-shared local branches only.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A user reports that feature X stopped working two weeks ago but they don't know the exact commit. You have 800 commits in that range. Walk through how you'd use `git bisect` to identify the first-bad commit in under 15 minutes.",
      hint: "Bisect doesn't require you to run Git manually for each step — you can automate.",
      answer:
        "Steps: (1) Confirm a known-good and known-bad: check out two weeks ago (`git log --since=\"2 weeks ago\"` gives the first-out-of-range commit), verify feature X works; `git checkout main`, verify it's broken. (2) `git bisect start`, `git bisect bad`, `git bisect good <good-sha>`. (3) Git checks out the midpoint. Now: **automate**. Write a one-liner that exits 0 if feature X works, non-zero if broken — could be `curl -f http://local/feature-x` or a test script. (4) `git bisect run ./test-feature-x.sh`. Git runs the script at each bisection step and tells you 'first bad commit is <sha>' when done. log₂(800) ≈ 10 steps, at maybe 1 minute per test run = 10 minutes of Git-driving-itself. The disciplined version of this workflow routinely turns 'who knows when it broke' into 'commit X by person Y at time Z' — actionable, assignable, reviewable.",
    },
    {
      kind: "knowledge-check",
      question:
        "A teammate force-pushed over `main` and lost three commits that were on your branch. Your local clone still has them. Walk through the exact recovery procedure and what you'd do to prevent this in the future.",
      answer:
        "Recovery: (1) Your local clone still has the commits reachable via `git reflog` on your `main` branch — you can see the pre-force-push state. `git reflog main` will show entries like `HEAD@{2} 8def123 reset: moving to <force-pushed sha>`. (2) Identify the commit that was the *tip* of main before the force-push (the one in the old reflog before the reset entry). (3) `git branch recovered-main 8def123` — create a branch pointing at the old tip. (4) Cherry-pick or merge the three lost commits back into the current main, or if nothing else has happened, force-push back to the pre-broken state (coordinating with the team). (5) Preserve the old commits as a rescue branch pushed to a special ref (`git push origin HEAD:refs/heads/salvage-YYYYMMDD`) so even if someone prunes your local reflog, the data is safe. Prevention: (1) Enforce **branch protection** on `main` — GitHub/GitLab/Bitbucket all support 'no force push', 'required reviews', 'required status checks'. (2) Require PRs (no direct push). (3) Train the team on `revert` as the default rollback and reserve `reset --hard + force-push` for personal branches only. This becomes a policy, enforced by the hosting platform, not an etiquette hope.",
    },
  ],
};

// ── linux-m19 Cascading Failures ────────────────────────────────────────────

const lxaS13: ChapterSection = {
  id: "lxa-s13",
  topicId: "linux",
  title: "Anatomy of a Cascading Failure",
  subtitle: "How a small break becomes a large outage, and the patterns you learn to see coming.",
  icon: "⬟",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Every large outage in every hyperscale DC you've read about has roughly the same shape: **a small, contained failure hits an amplifier that turns it into a fleet-wide event**. Knowing the amplifiers — retry storms, thundering herds, connection-pool exhaustion, feedback loops — lets you recognize an in-progress cascade at minute 3 rather than minute 30. The cost difference is an order of magnitude.",
    },
    {
      kind: "prose",
      html:
        "02:17. A single DNS resolver returns SERVFAIL for one internal domain. Clients are configured to retry on failure, 3 times, 100 ms apart. Now the resolver sees **3× normal traffic** for that domain. Its CPU spikes. It slows down. *More* retries pile up. *Other* clients behind the now-slow resolver start timing out. *Their* retries pile up. Within 8 minutes every downstream service that depends on that DNS name is effectively unreachable — not because they're broken, but because they're **drowning in retry traffic**. The original SERVFAIL was a 30-second blip. The cascade is a 3-hour outage. This chapter is the toolkit for *seeing this coming* and for stopping it once it's underway.",
    },
    { kind: "heading", level: 3, text: "The core pattern — amplification" },
    {
      kind: "prose",
      html:
        "Every cascading failure has the same three ingredients: a **trigger** (a small failure), an **amplifier** (a mechanism that turns one failure into many), and an **absent brake** (nothing stopping the amplifier from running away). The trigger is usually boring — a bad deploy, a slow disk, one flaky DNS resolver. The amplifier is where the story gets interesting.",
    },
    {
      kind: "collapsible",
      intro: "Six amplifiers that produce most real-world cascades. Each click reveals the mechanism and the brake that prevents it.",
      items: [
        {
          title: "Retry storm",
          body:
            "A client retries on failure. If N clients each retry 3×, a brief failure produces 3N requests, overwhelming whatever was already struggling. **Brake:** exponential backoff + jitter (retries spaced exponentially longer with a random offset) prevents synchronized re-retries; circuit breakers stop retries entirely when downstream health is bad.",
          color: "#FF6B6B",
        },
        {
          title: "Thundering herd",
          body:
            "When a service comes back up after being down, all waiting clients hit it simultaneously. The newly-recovered service is overwhelmed and falls back over. **Brake:** server-side rate limiting on recovery, client-side jittered reconnect backoff, token-bucket admission control.",
          color: "#FFA832",
        },
        {
          title: "Connection-pool exhaustion",
          body:
            "A downstream slows from 10 ms to 500 ms. Client connection pools fill up waiting. Subsequent requests can't acquire a connection and fail. The client itself is now unhealthy even though nothing is 'broken.' **Brake:** bounded pools with fail-fast timeouts, bulkheading (separate pools per downstream so one slow service can't starve others).",
          color: "#50C8FF",
        },
        {
          title: "Log-flood → disk full",
          body:
            "A service starts erroring. Every error writes a verbose stack trace to disk. Disk fills. Now *other* services on the host fail because they can't log. Often the original failure self-resolves, but the disk-full cascade takes hours to clean up. **Brake:** log rotation with size limits, rate-limited logging for repeat errors, logs on a separate volume from service data.",
          color: "#7AE87A",
        },
        {
          title: "Thread-pool / worker-pool starvation",
          body:
            "Workers take longer per request because downstream is slow. Queue grows. New requests wait longer. Eventually the queue is the slowest part. **Brake:** bounded queues that *reject* (not buffer) excess traffic, per-downstream pools, adaptive concurrency limits.",
          color: "#C58AFF",
        },
        {
          title: "Garbage-collection death spiral",
          body:
            "A service under memory pressure spends more time in GC. Throughput drops. Queue grows. Memory needed for the queue grows. More GC. Until the service is GCing 95% of the time and handling almost no requests. **Brake:** memory headroom, bounded queues, horizontal scaling that adds capacity before the spiral starts.",
          color: "#5AD0D0",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Feedback loops — positive is the enemy" },
    {
      kind: "prose",
      html:
        "In control theory, a **positive feedback loop** is one where the output amplifies the input. In a cascading failure, the loop is usually: *more failures → more retries → more load → more failures*. The system can't stabilize because the mechanism that's supposed to recover (retries) is the same mechanism making it worse. **The only way out is to break the loop** — either by removing the amplifier (disable retries) or by adding a brake (rate limits, circuit breakers).",
    },
    {
      kind: "code",
      label: "A REAL LOG-FLOOD CASCADE (abbreviated)",
      language: "text",
      code:
        "01:02:14   Upstream DB replicas reject new connections (replica lag alert)\n01:02:15   app servers log: 'connection refused' at 3,000 req/s\n01:02:20   /var/log grows 200 MB/s per app server\n01:05:30   First app server: /var/log 100% full\n01:05:31   systemd-journald drops messages, app writes to /dev/null\n01:06:04   /var/log is on same volume as app data — writes fail\n01:06:05   app starts 500'ing every request (can't write sessions)\n01:06:12   load balancer marks app server unhealthy\n01:06:14   Remaining app servers now serving 100% of (3x higher) traffic\n01:08:00   All app servers in the same disk-full state\n01:15:00   DB replicas recovered — but fleet is still in failure mode\n02:30:00   Manual cleanup of /var/log begins on 40 app servers\n03:45:00   Full recovery\n\n# Lesson: the DB blip was ~8 minutes. The cascade was 2h 40min.\n# Brake that would have prevented: log rate-limiting on repeat errors\n# OR logs on a dedicated volume.",
    },
    { kind: "heading", level: 3, text: "Warning signals — the leading indicators" },
    {
      kind: "prose",
      html:
        "Cascading failures almost never start with a clean, loud alarm. They start with subtle drifts in metrics that — *if you were watching them* — would have screamed a minute before the dashboard went red. Senior SREs train themselves to watch these leading indicators.",
    },
    {
      kind: "bullets",
      items: [
        "**p99 latency climbing while p50 is flat.** A small fraction of requests is failing slowly — often an early symptom of pool exhaustion, or one bad instance behind a load balancer.",
        "**Retry rate spiking without error rate spiking.** Clients are silently recovering, but the *load* they're generating is climbing. Classic early-phase retry storm.",
        "**Queue depth growing.** Faster than consumer rate. Whether it's an app queue, a conntrack table, or a connection pool — a growing queue is an amplifier in motion.",
        "**GC pause time climbing.** Memory pressure showing up before it's painful. Often precedes the death spiral.",
        "**One host/zone diverging from its peers.** Not 'everything is slow' but 'one rack is slow' — tells you the problem is localized before it spreads.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The 50/90/99/99.9 habit",
      body:
        "Never look at an average latency in an incident — averages hide everything. Always show p50, p90, p99, and p99.9 together. The gap between them tells you *how uneven* the experience is. p50 = 'most users happy'; p99.9 = 'the users already calling support.' A widening gap is a cascade warming up.",
    },
    {
      kind: "custom-component",
      id: "cascading-timeline",
      props: {
        title: "Interactive: the shape of a cascade",
        caption:
          "Scrub the timeline to see how a small trigger grows. Each moment shows the state of the stack, the dominant amplifier, and the brake that would have stopped it.",
      },
    },
    {
      kind: "mcq-inline",
      question:
        "Your monitoring shows error rate steady at 0.1% but retry rate suddenly climbs from 0.1% to 5% across the fleet. Tail latency (p99) has started drifting up. What's most likely happening?",
      choices: [
        { label: "A", text: "Nothing — errors are flat so the system is healthy" },
        { label: "B", text: "An early-phase retry storm: clients are retrying failures that initially succeed on retry (so errors stay low) but the retry *load* is amplifying; the rising p99 indicates downstream pressure" },
        { label: "C", text: "A monitoring bug — retry rate can't exceed error rate" },
        { label: "D", text: "Clock drift in the logging system" },
      ],
      correctAnswer: "B",
      explanation:
        "Error rate staying flat while retry rate climbs is the signature of the 'retry still succeeds but at higher cost' early phase — clients retry after a transient failure, it works, error rate appears fine. But the retry traffic is real load. Rising p99 is downstream starting to strain. If you catch it here, a rate limit or circuit breaker closes the loop; if you don't, p50 follows p99 up within minutes and now everyone notices.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A service is in a retry storm cascade. Every client is retrying 3× with 100 ms spacing. The downstream service is at 300% of normal load and getting slower. Pure intuition says 'fix the downstream' but the team can't make it faster in the next 5 minutes. What do you do to stop the cascade, and what principle guides the choice?",
      hint: "When you can't fix the service, change the shape of the load.",
      answer:
        "You break the amplifier by **removing or throttling the retries**, not by scaling the downstream. Concrete actions: (1) **Reduce retry counts fleet-wide** via config push — 3× retries to 0× or 1×. Yes, you'll see more user-facing errors, but *less* load means the downstream actually recovers. (2) **Add jitter** to whatever retries remain — synchronized retries are an amplifier all on their own. (3) **Rate-limit at the edge** (load balancer or service mesh) — cap requests per second per client so no single misbehaving caller amplifies. (4) **Circuit-break** — have clients short-circuit requests to the struggling service for 30 seconds, serving cached/degraded results. The principle: **in a positive feedback loop, the failure IS the retries, not the original trigger**. Treating the trigger is slower than treating the loop. Expect to trade some availability for stability — a fleet serving 95% of requests is better than a fleet serving 0% of them.",
    },
    {
      kind: "knowledge-check",
      question:
        "You're designing resilience reviews for a new service. List at least four **preventive mechanisms** you would require before the service ships, each aimed at a specific cascading-failure pattern, and explain the pattern each defends against.",
      answer:
        "(1) **Bounded connection pools with fail-fast timeouts** — prevents connection-pool exhaustion cascades. A pool that queues indefinitely turns a slow downstream into an unhealthy client. Pools that reject new requests when full surface the problem quickly rather than hiding it. (2) **Exponential backoff with jitter for all retries, capped at 3 attempts** — prevents retry storms. Synchronous/synchronized retries amplify; backoff+jitter de-synchronize and cap the amplification factor. (3) **Circuit breakers around every external dependency** — prevents thundering herds on recovery and cascading-across-services. When downstream health is bad, the breaker opens and requests fail fast (or serve degraded cached results) instead of piling up. (4) **Log rate-limiting at the service level** (e.g., log-every-nth-error-of-same-type) AND **logs on a dedicated volume** — prevents log-flood-to-disk-full cascades that turn a self-limiting bug into an hours-long outage. (5) **Bounded queues that reject (not infinitely buffer) excess traffic** — prevents queue-depth cascades and GC death spirals. (6) **Per-downstream bulkheading** — one slow dependency can't exhaust resources shared with healthy dependencies. Meta-point: each mechanism costs something (more error rates during stress, added complexity, more observability), and every production service needs *some* of them. Teams that ship without any are one retry storm away from their first cascading outage.",
    },
  ],
};

const lxaS14: ChapterSection = {
  id: "lxa-s14",
  topicId: "linux",
  title: "Incident Response — Shed Load, Communicate, Postmortem",
  subtitle: "What to do in the first five minutes, the next hour, and after the fire is out.",
  icon: "⬠",
  estimatedMinutes: 11,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "How a team **responds** to an incident matters more than what broke. A 30-minute cascade handled well produces a tired team and a sharp postmortem. The same cascade handled badly produces a 4-hour outage, a thrashed team, and an incident that repeats in a month. The practices in this chapter are what distinguish \"team that handles incidents like professionals\" from \"team that makes incidents worse.\"",
    },
    {
      kind: "prose",
      html:
        "03:17 AM. Your phone buzzes. An alert you've never seen before. You're on-call. The dashboards are mostly red. Your heart rate is up and your brain wants to *do something*. This is the moment where the next five decisions decide whether the next hour goes smoothly or terribly. **None of them are about the bug.** They are about staying clear-headed, not making it worse, and keeping humans informed.",
    },
    { kind: "heading", level: 3, text: "The first five minutes — the rules" },
    {
      kind: "bullets",
      items: [
        "**Do not make it worse.** If you don't understand what's happening, don't take unilateral action. Starting a rollback of the wrong thing is how 30-minute incidents become multi-hour ones.",
        "**Open the incident channel. Say something.** Even just \"I'm on this, investigating.\" Other teams know you're engaged; the org isn't stuck wondering.",
        "**Focus on recovery, not root cause.** Understanding why will come later. Right now you're stabilizing. \"Can we shed load? Roll back the last deploy? Disable the feature flag?\" Those are recovery questions.",
        "**Escalate early if you're not sure.** Paging a senior SRE at minute 5 is cheap; paging at minute 45 after the cascade has spread is expensive. Err toward calling for help.",
        "**Write down what you're doing** — even if just in the channel. Future-you writing the postmortem will thank present-you.",
      ],
    },
    { kind: "heading", level: 3, text: "Load shedding — partial service beats no service" },
    {
      kind: "prose",
      html:
        "When a system is in cascade, the fastest way to stabilize it is often to **reduce the load, not increase capacity**. Serving 50% of requests successfully is usually more valuable than serving 100% of requests slowly until everything crashes. Techniques to have pre-wired into production:",
    },
    {
      kind: "code",
      label: "LOAD-SHEDDING PATTERNS",
      language: "text",
      code:
        "# 1. Return 503 with Retry-After — clients back off politely.\n#    HTTP/1.1 503 Service Unavailable\n#    Retry-After: 60\n#\n# 2. Edge rate limit — cap requests per IP/token/tenant at the load balancer.\n#    nginx: limit_req zone=per-ip burst=20 nodelay\n#    envoy: http_filters.rate_limit.rate_limit_service\n#\n# 3. Priority shedding — serve VIP traffic first, reject the rest.\n#    E.g., authenticated dashboard users > anonymous API calls.\n#\n# 4. Circuit breakers — stop calling a failing downstream; serve cached/default.\n#    (Client-side; most service meshes include this out of the box.)\n#\n# 5. Feature flags — disable an expensive, non-critical feature fleet-wide.\n#    E.g., 'disable personalized recommendations, serve generic ones'",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Scaling up during a cascade often makes it worse",
      body:
        "Instinct says 'more capacity = faster recovery.' In a cascade, new instances join the amplifier — they hit the same slow downstream, build up their own retry queues, and worsen the load. Stabilize first (shed load, break the loop), THEN scale. 'Stop amplifying before you scale' is a hard-won lesson.",
    },
    { kind: "heading", level: 3, text: "Communication discipline" },
    {
      kind: "prose",
      html:
        "During an incident, communication IS the work. Two people digging into the same log file unaware of each other is waste. A stakeholder paging the team every 3 minutes asking for updates is waste. The standard pattern is a **single incident channel** with a **designated commander** and a **status cadence**.",
    },
    {
      kind: "table",
      headers: ["Role", "What they do", "What they don't do"],
      rows: [
        ["**Incident Commander**", "Coordinates — decides what to try next, posts status every 15 min, keeps the channel focused", "Does not fix the bug themselves — that's conflict of interest"],
        ["**Responder(s)**", "Diagnose, test hypotheses, implement mitigations", "Don't post speculative updates; report to IC"],
        ["**Comms lead** (large incidents)", "Writes customer-facing status, talks to support", "Doesn't touch production"],
        ["**Scribe**", "Timestamps every meaningful action in the channel", "Doesn't fix or coordinate"],
      ],
    },
    {
      kind: "bullets",
      items: [
        "**One channel per incident.** Not a DM. Not a thread. A pinned channel — tagged with severity, time-started, IC name.",
        "**Status cadence — every 15 min even if nothing has changed.** \"Still investigating the DB slowdown, no update, next check in 15.\" Silence = panic, even if you're actively working.",
        "**Facts vs hypotheses.** Mark them differently. \"DB is returning 500ms p99 (fact). We think it's a lock contention (hypothesis).\" Future-you reading the transcript will appreciate the discipline.",
        "**No blame during the incident.** \"Why did you deploy without review?\" is a postmortem question. During the fire it's a distraction.",
      ],
    },
    { kind: "heading", level: 3, text: "The postmortem — blameless, structured" },
    {
      kind: "prose",
      html:
        "Once the fire is out, you write a **postmortem**. The goal is not \"find who to blame\" — it's \"prevent this from happening again.\" Teams that treat postmortems as blame-finding missions produce defensive engineers who hide failures. Teams that treat them as blameless learning exercises produce resilient systems.",
    },
    {
      kind: "table",
      headers: ["", "Blameless", "Blameful"],
      rows: [
        ["Focus", "System + process gaps", "Individual behavior"],
        ["Question", "How did the system enable this mistake?", "Who did this?"],
        ["Outcome", "Changes in guardrails, automation, training", "Fingers pointed; no structural change"],
        ["Next time", "The mistake is hard to repeat", "People hide mistakes"],
      ],
    },
    {
      kind: "flip-cards",
      intro: "Every good postmortem has these sections — click each for what goes in it.",
      cards: [
        {
          front: "**Summary** (2-3 sentences)",
          back: "What happened, when, impact. Written for someone who'll only read the first paragraph. Example: 'On 2026-03-14 from 02:17-03:45 UTC, 40% of API requests returned 503 due to a retry storm triggered by a single DNS resolver's SERVFAIL. Recovery required reducing retries fleet-wide.'",
        },
        {
          front: "**Timeline**",
          back: "Timestamped facts only. 'T+0: DNS SERVFAIL first observed.' 'T+4m: retry rate rises from 0.1% to 5%.' 'T+12m: p99 exceeds SLO.' 'T+28m: reduced retry count deployed.' Built from the incident channel transcript.",
        },
        {
          front: "**Root cause(s)**",
          back: "Usually several — the trigger, the amplifier, and the absence of a brake. NOT 'a person made a mistake' — 'the system allowed a mistake to cascade.'",
        },
        {
          front: "**What went well**",
          back: "Genuinely important. What parts of the system or process performed correctly? Monitoring caught it fast? Good runbook? Responder escalated early? Name these so you do them again.",
        },
        {
          front: "**What went wrong**",
          back: "Where did we lose time? What did we not know that we should have? Where did the process fail? Be specific, be blameless.",
        },
        {
          front: "**Action items**",
          back: "Each with an owner and a deadline. Not 'we should be more careful' — 'by 2026-04-01, bootstrap service X's config with jittered retry defaults, owner: team Y.'",
        },
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "Complete this postmortem action-item template. Each action needs three specific fields to be actionable.",
      sentence:
        "Action: <description>\nOwner: {0}\nDeadline: {1}\nSuccess criteria: {2}",
      blanks: [
        {
          answer: "person or team",
          alternates: ["team", "person", "individual", "engineer"],
          hint: "who",
        },
        {
          answer: "date",
          alternates: ["deadline", "by date", "timeline"],
          hint: "when",
        },
        {
          answer: "measurable outcome",
          alternates: ["measurable", "observable metric", "concrete test"],
          hint: "how do you know it's done?",
        },
      ],
      reveal:
        "An action item without a **named owner**, a **specific deadline**, and a **measurable success criterion** is not an action — it's a wish. \"The team should improve monitoring\" goes nowhere. \"By 2026-04-15, Maria will add alerting on retry-rate spikes crossing 2× baseline for 5 minutes, verified by triggering a test alert\" is a real commitment. The postmortem discipline that matters most is rigor on action items; loose language here is why the same incident recurs next quarter.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You're on-call and paged at 03:17 for a cascade. You stabilize it by 04:10. The next morning, your manager asks for 'a quick root-cause email' by 10:00 so they can update a stakeholder. What should that email say, and what should it explicitly NOT say?",
      hint: "You're tired, haven't slept, and haven't done the full postmortem yet.",
      answer:
        "The email should be bounded in scope and honest about uncertainty. Include: (1) **What happened** factually — the timeline of impact, not speculation about cause. (2) **What we did** to mitigate. (3) **Current state** — are services stable, are any mitigations still active, is there a risk of recurrence right now. (4) **When a full postmortem will be available** — typically 2-3 business days. The email should NOT contain: (1) Speculation presented as root cause before the postmortem — if you say \"caused by a bad deploy\" and later it turns out to be a DNS issue, trust erodes. (2) Blame of any named person or team. (3) Promises of specific fixes before engineering has reviewed. (4) Technical jargon the stakeholder doesn't need. Template feel: \"Between 02:17 and 03:45, 40% of API traffic returned errors. We mitigated by reducing retry counts. The service is fully recovered and stable. A full postmortem with root cause analysis and action items will be published by Friday.\" That's it. Rigor and humility, not heroics or speculation.",
    },
    {
      kind: "knowledge-check",
      question:
        "Describe the end-to-end workflow of a severe incident, from the first page to the published postmortem — the roles, the artifacts, and the transitions. Use a recent-ish pattern from large engineering orgs as your reference.",
      answer:
        "(1) **Page fires** → on-call responds within target SLO (commonly 5 min for SEV-1). Acknowledges the page so monitoring knows someone is on it. (2) **Incident declared.** On-call opens an incident channel (Slack, Teams, etc.) with a structured name (`#inc-YYYYMMDD-short-description`), posts initial status, and — for SEV-1 and up — pages a designated Incident Commander (IC) separate from themselves. (3) **Roles assigned.** IC coordinates, responders investigate, a scribe timestamps actions, a comms lead handles customer-facing updates. On smaller incidents one person wears multiple hats; on big ones, roles split strictly. (4) **Recovery phase.** Load shedding, rollback, feature flagging — prioritize stabilization over understanding. IC posts status updates on a cadence (every 10-15 min). (5) **Recovery confirmed.** IC declares the incident resolved in the channel with the recovery timestamp. Monitoring confirms steady state for a buffer period (commonly 30 min). (6) **Draft postmortem within 24 hours** by the responders, reviewed by IC. (7) **Postmortem review meeting** — usually 2-5 business days later, blameless format. The team walks through the timeline, agrees on action items, and assigns owners + deadlines. (8) **Postmortem published** to a searchable internal wiki, tagged for future reference (especially when similar incidents recur). (9) **Action-item tracking** in the normal engineering system (Jira/Linear/similar). These are real tickets with deadlines; they get reviewed in weekly operational meetings until closed. The common failure mode: a beautifully written postmortem with great action items that nobody actually does. A good org reviews open action items from the last 6 months at the start of every operational meeting.",
    },
  ],
};

// ── linux-m20 Final Assessment ──────────────────────────────────────────────

const lxaS15: ChapterSection = {
  id: "lxa-s15",
  topicId: "linux",
  title: "Operator Checklists — The 10 Commands, The 8 Questions",
  subtitle: "Fold these into one index card. Carry them. They'll carry you.",
  icon: "✓",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Under pressure, technical ability is not the bottleneck — **recall** is. The difference between a junior who freezes on an unfamiliar alert and a senior who starts moving in under a minute is not intelligence; it's a mental checklist that runs automatically. These lists are the senior's checklist, made explicit.",
    },
    {
      kind: "prose",
      html:
        "You've been on-call for two years. A page fires at 02:35 for a symptom you've never seen before: a service in a different cluster, a metric you don't recognize. You're 40 seconds into the page. **What do you type first?** If you have to think, you've already lost a minute. If you have the checklists below in muscle memory, you start gathering data while your brain catches up. This chapter is the consolidated reference — the one page you want open in another terminal on every on-call shift.",
    },
    { kind: "heading", level: 3, text: "The 10 diagnostic commands" },
    {
      kind: "prose",
      html:
        "A pared-down list of commands you can run in the first 30 seconds of any incident to build a picture of the host's state. Each answers a specific question about a specific layer.",
    },
    {
      kind: "code",
      label: "THE 10",
      language: "bash",
      code:
        "# 1. Who is this host? Is it reachable normally?\nuptime && hostname && id\n\n# 2. What services are broken right now?\nsystemctl list-units --failed\n\n# 3. What just happened in the kernel?\ndmesg -T | tail -50\n\n# 4. Any recent service errors?\njournalctl -p err --since \"30 minutes ago\" | head -40\n\n# 5. Disk — any volume filling?\ndf -h && df -i   # -i for inode exhaustion\n\n# 6. Memory + swap + OOM history.\nfree -h && grep -i 'oom' /var/log/messages /var/log/syslog 2>/dev/null\n\n# 7. CPU + load — and who's hot.\nuptime && top -bn1 | head -20\n\n# 8. Disk I/O — is anything saturated?\niostat -xz 1 3\n\n# 9. Listening ports + connections summary.\nss -tlnp && ss -s\n\n# 10. Processes eating I/O specifically.\n# (iotop needs root; if unavailable, pidstat -d 1 3)\npidstat -d 1 3",
    },
    { kind: "heading", level: 3, text: "The 8 questions to ask before touching a box" },
    {
      kind: "prose",
      html:
        "The fastest way to make an incident worse is to act on an assumption before confirming it. The senior habit is to work through these eight questions — in the first minute — before any destructive command.",
    },
    {
      kind: "bullets",
      items: [
        "**What is this host's role?** Is it primary or secondary? Production or staging? Customer-facing or internal? Reading the wrong role is how a senior engineer accidentally restarts the primary.",
        "**What's currently deployed?** `git log --oneline` in the config/code repo for this host's tier. Is there a deploy in-flight that might be the cause?",
        "**When did it start?** Is the problem growing or stable? A 'new' problem is different from a 'old slowly-worsening' problem. Metrics graphs tell you which.",
        "**What changed?** Code deploys, config pushes, infra upgrades, firmware updates. Pair with the timeline from question 3 — something that changed close to the start time is the suspect.",
        "**Is this the only host/zone affected?** One host = local problem. Zone-wide = shared infrastructure. Fleet-wide = deploy or upstream.",
        "**What's the blast radius of what I'm about to do?** A `systemctl restart` on one host is fine; on a stateful primary it's an incident. A rollback on one instance vs the fleet.",
        "**Who else is looking?** Check the incident channel before you make moves. Two people independently restarting services is how you cause a second outage.",
        "**What's my exit?** If the thing I'm about to try makes it worse, what's my revert? Know the 'undo' before you press enter.",
      ],
    },
    { kind: "heading", level: 3, text: "The 6 classes of failure you'll see" },
    {
      kind: "prose",
      html:
        "Most incidents you'll see at hyperscale fit into one of six shapes. Pattern-matching the shape in the first minute accelerates diagnosis.",
    },
    {
      kind: "table",
      headers: ["Pattern", "Signature", "First move"],
      rows: [
        ["**Cascade**", "Error or retry rate climbing across many services", "Shed load; break the amplifier (rate limit, reduce retries)"],
        ["**Deploy gone bad**", "Problem started within minutes of a known deploy", "Roll back first; diagnose after recovery"],
        ["**Creeping resource**", "Slowly worsening over hours — memory, disk, fds, conntrack", "Identify the leaking resource; restart the leaker while investigating"],
        ["**One-host drift**", "One host diverged from peers", "Drain the host; compare its config to peers"],
        ["**Upstream dependency failure**", "Your service healthy internally, failing on one downstream", "Circuit-break; fall back to cached/degraded; escalate to dep owner"],
        ["**Hardware fault**", "dmesg shows disk/memory errors, one host degraded", "Drain; initiate hardware RMA; don't try to fix in place"],
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "You're paged at 02:35. Your first command — to get a one-line summary of any service that failed to start — is:",
      sentence:
        "systemctl {0} --{1}",
      blanks: [
        {
          answer: "list-units",
          alternates: ["list-unit-files"],
          hint: "subcommand",
        },
        {
          answer: "failed",
          alternates: ["state=failed"],
          hint: "flag",
        },
      ],
      reveal:
        "`systemctl list-units --failed`. This is the single most useful command during any 'something's wrong but I don't know what' moment. It shows every unit that tried to start and couldn't — often the root cause is right there. Follow with `journalctl -xe` for the surrounding events, or `journalctl -u <failed-unit> -n 50` for a specific one.",
    },
    {
      kind: "flip-cards",
      intro: "A few triage patterns worth keeping in muscle memory.",
      cards: [
        {
          front: "\"Everything suddenly slow\"",
          back: "Check `top` (CPU saturation?), `free -h` (memory pressure?), `iostat` (I/O saturated?), `ss -s` (connection count exploded?), and `dmesg` (kernel complaining?). One of these will point to the layer.",
        },
        {
          front: "\"Can't SSH to host\"",
          back: "Ping first. If ping works, SSH daemon or config is broken — use BMC console. If ping fails, it's network — check the rack switch, VLAN, the host's switch port. If even the BMC is unreachable, physical power to the rack.",
        },
        {
          front: "\"Disk 100% full but no obvious culprit\"",
          back: "`du -sh /* | sort -h` to find the heavy directory. Then: `lsof +D /var/log | grep deleted` for space held open by running processes. If the deleter ran but the file is still open, restart the process to release space.",
        },
        {
          front: "\"Service restarted and came up fine; recurs in 20 min\"",
          back: "A leak is filling something — memory, fds, connections, locks. `ss -s`, `ls /proc/<pid>/fd | wc -l` over time, `free -h` trend. Leak is almost always in the code; restart is a band-aid until it's fixed.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The wrongest assumption",
      body:
        "\"If it's working for other users, it must be a user-side issue.\" Sometimes true; often it's a localized failure on the host that user happens to hit (bad load-balancer hashing, sticky session on a degraded instance, DNS cached in their client). Verify with their actual request path before closing as 'works for me.'",
    },
    {
      kind: "think-about-it",
      scenario:
        "A page fires for a symptom you've never seen: `storage-tiering-sync-agent: agent heartbeat missed`. You've never worked on storage tiering. You don't know what this agent does. What's the first minute of your response?",
      hint: "You don't need to understand the system to begin diagnosis.",
      answer:
        "The first-minute work is data-gathering, not problem-solving. (1) **Acknowledge the page**, post in incident channel: \"Paged for storage-tiering-sync-agent heartbeat, investigating, never worked on this before, may escalate.\" Honest, clear, signals who owns the fire. (2) **Find the runbook**: search the internal wiki, `grep` the infrastructure repo for 'storage-tiering-sync-agent'. If there's a runbook, follow it. If not, you've identified a postmortem action item. (3) **Start the 10-command checklist** on any host running the agent — you don't need to understand the agent to see if `systemctl list-units --failed` lists it, if `journalctl -u storage-tiering-sync-agent` shows errors, if the host is healthy in general. (4) **Check git log** for the storage-tiering repo for recent changes. (5) **If still stuck at minute 5**, escalate — page the storage team's on-call. Rule: never spend more than ~5-10 minutes solo on a system you don't own. The combination of the 10 commands, the 8 questions, and early escalation turns \"unfamiliar alert\" into a productive investigation in minutes instead of hours.",
    },
    {
      kind: "knowledge-check",
      question:
        "Summarize the operator's craft as you'd explain it to someone shadowing your first on-call shift. What are the habits that separate a good responder from a bad one?",
      answer:
        "(1) **Data first, action second.** The first few minutes are for building a picture — running the 10 commands, reading the timeline, checking recent changes — not for typing restarts. Premature action turns 30-minute incidents into 3-hour ones. (2) **Ask the 8 questions.** Role? Recent changes? Blast radius? Undo plan? If you can't answer them, pause before any destructive command. (3) **Communicate continuously, not just when you have news.** A 15-minute silence in the incident channel makes everyone assume the worst. 'Still investigating X, no update yet' is better than silence. (4) **Escalate early, not late.** Paging a senior at minute 5 is cheap; paging at minute 45 is expensive. The cost asymmetry is enormous. (5) **Prefer recovery over root cause during the incident.** 'Why did this happen?' is a postmortem question. 'What gets customers working again in the next 5 minutes?' is the incident question. Understanding comes after stability. (6) **Postmortem with rigor.** Blameless, specific action items with owners and deadlines. Without this, the same incident recurs in a month. (7) **Read runbooks, write runbooks.** Every incident where no runbook existed is an action item to write one. Over years, the team's institutional memory lives in runbooks — not in the heads of the three people who have been there longest. The craft is not any single technical skill; it's the disciplined combination of those seven habits.",
    },
  ],
};

const lxaS16: ChapterSection = {
  id: "lxa-s16",
  topicId: "linux",
  title: "Career On-Ramp — What Senior Looks Like, and How To Get There",
  subtitle: "The craft is technical, but the career is about judgment, pattern recognition, and time horizon.",
  icon: "⬘",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "The best DC operators you'll ever work with are not the ones with the deepest knowledge of any single tool. They're the ones with the broadest **pattern library** — who see a new problem and immediately recognize \"this is like that retry-storm we had in 2019\" — and the disciplined habits to avoid repeating old mistakes. This chapter is about the habits and career arc that build that library.",
    },
    {
      kind: "prose",
      html:
        "You've finished the Linux Operations and Advanced Linux tracks. You know the tools. The next phase of the craft is less about acquiring new knowledge and more about **using what you know with judgment and humility**. Senior engineers are not smarter — they're **calmer under pressure, more skeptical of their own assumptions, and better at passing knowledge to peers**. Those are learnable habits. This chapter is about practicing them on purpose.",
    },
    { kind: "heading", level: 3, text: "What 'senior' actually means" },
    {
      kind: "bullets",
      items: [
        "**Runbooks are the product.** A senior's best artifact is often not a fix — it's the clear documentation that lets a junior resolve the next occurrence without paging anyone. Good runbooks shorten future incidents dramatically.",
        "**Judgment over speed.** A senior pauses when something doesn't add up. A junior often plows ahead. The senior's minute of hesitation saves the three hours of cascade.",
        "**Pattern recognition.** \"This is a p99 drift, not an average drift — smells like pool exhaustion.\" That insight comes from having seen it before and labeled it. It's accumulated, not taught.",
        "**Longer time horizon.** Junior: \"restart the service.\" Senior: \"restart now, but this is the third time this month — what's leaking?\" Action plus investigation-order.",
        "**Confidence about limits.** Senior knows which questions are outside their expertise and escalates to the right person without hesitation.",
      ],
    },
    { kind: "heading", level: 3, text: "The culture of good ops teams" },
    {
      kind: "prose",
      html:
        "Technical skill is the entry ticket. The **culture** the team practices determines whether that skill compounds into institutional strength or burns out in 18 months. A few markers of a healthy ops culture:",
    },
    {
      kind: "bullets",
      items: [
        "**Blameless postmortems are standard**, not an occasional nice thing. Every SEV-2 and above gets one. The practice is defended vocally by leadership — \"we don't punish people for mistakes; we punish people for hiding them.\"",
        "**On-call rotation hygiene.** No single person is always on-call. Handoffs are deliberate — the outgoing on-call writes a clear status to the incoming. On-call load is tracked and capped.",
        "**Documentation is a first-class artifact.** Runbooks are linked in alerts. Every service has a 'how to debug this' page. New hires are expected to update docs when they find gaps.",
        "**Pagers are respected.** The team pushes back on alerts that are noisy or not actionable. Every page that isn't useful is a ticket to fix — 'page someone if X' is a serious commitment.",
        "**The art of saying no.** Not every feature request becomes a project. Senior engineers are expected to push back on ideas that add operational burden without justifying the cost.",
      ],
    },
    { kind: "heading", level: 3, text: "Signs you're ready for on-call" },
    {
      kind: "prose",
      html:
        "Before you're handed the pager, a few markers separate 'technically capable' from 'ready to respond alone at 3 AM on day one.'",
    },
    {
      kind: "bullets",
      items: [
        "**You've shadowed at least 2-3 real incidents** end to end — from page to published postmortem — on the systems you'll own.",
        "**You know the runbooks** for the top 5 most-paged alerts for your service. Actually read them; didn't skim.",
        "**You've deployed a change and rolled it back intentionally** at least once, so the rollback muscle memory exists.",
        "**You've used the BMC console** on a real host, not just as a concept. When SSH fails, you know how to reach in.",
        "**You've escalated** at least once during a shadow shift. The habit of asking for help needs to be rehearsed before the real page.",
        "**You've written or updated one runbook.** You know what good looks like because you've produced it.",
      ],
    },
    { kind: "heading", level: 3, text: "The career ladder — impact widens" },
    {
      kind: "table",
      headers: ["Level", "Primary impact", "Key habits being built"],
      rows: [
        ["**L3 / early career**", "Executes tickets well; completes training; takes pages after shadowing", "Learn the tools; practice the checklists; ask questions"],
        ["**L4 / mid**", "Owns a service or area; on-call without supervision; improves runbooks", "Pattern recognition; pushing back on noisy alerts; mentoring newer hires"],
        ["**L5 / senior**", "Owns cross-cutting concerns; reduces incident frequency structurally", "Judgment under pressure; architecture decisions; writing postmortems that teach"],
        ["**L6+ / staff+**", "Owns a whole operational domain; sets standards for the team and org", "Culture shaping; scoping major projects; writing policy that others follow"],
      ],
    },
    {
      kind: "flip-cards",
      intro:
        "Habits worth practicing on purpose — each compounds into seniority faster than hoping to acquire it passively.",
      cards: [
        {
          front: "Write one runbook per incident",
          back: "Even if you didn't run the incident — if you read the postmortem and there's no runbook, write one. You learn by writing; the team benefits by having it.",
        },
        {
          front: "Start a learning log",
          back: "One paragraph after every meaningful thing you debugged. Over years this becomes your personal pattern library. Searchable; no one else needs to see it.",
        },
        {
          front: "Pair-debug openly",
          back: "When a teammate is stuck, offer to pair. Both of you learn. The one watching sees your mental model; the one driving gets unblocked. This is how patterns spread faster than postmortems.",
        },
        {
          front: "Read the postmortems of orgs bigger than yours",
          back: "Google, Meta, AWS, Cloudflare, Stripe, and others publish detailed public postmortems. Read one per week. They're training data for your pattern library.",
        },
        {
          front: "Teach something you just learned",
          back: "The act of explaining solidifies understanding. A 30-minute tech talk, an internal blog post, a written runbook — pick a format and do it monthly.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Burnout is a real risk — notice it early",
      body:
        "On-call is cumulatively tiring. Teams that don't track on-call load produce brilliant engineers who leave in 2 years. Normal signs: you start dreading on-call weeks, sleep poorly the night of a handoff, find it hard to focus after incidents. Speak up early. A manager's job is to redistribute load before an engineer burns out — but only if they know.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A teammate is struggling. They've been pulled into three incidents this week, two postmortems haven't been written, and they snapped at a question in standup. You're a peer, not a manager. What do you actually do?",
      hint: "The kind thing is also the professional thing.",
      answer:
        "Pull them aside privately — not in a channel, not during standup. Open with observation, not diagnosis: \"I noticed this week's been rough. How are you doing?\" Let them talk; resist the urge to problem-solve. If they're struggling, offer concrete help: \"I can take one of the postmortems off your plate\" or \"I can cover tomorrow's shift if you need a break.\" Do not make it conditional on a favor later. If their load is unsustainable and they're reluctant to speak up, gently suggest they talk to their manager — or, if that's stuck, you talk to your manager about the team's on-call load, not about them specifically. Never: triangulate (\"X said you were...\"), escalate behind their back without warning them, or make it a performance conversation. Healthy teams catch each other before the fall; that's cultural work every engineer contributes to, not just managers.",
    },
    {
      kind: "knowledge-check",
      question:
        "You're going to write your first runbook. Walk through what makes a good runbook vs a bad one, and sketch the minimal sections that should exist for any production service.",
      answer:
        "A good runbook is written for **the sleep-deprived on-call at 3 AM who has never seen this alert before**, not for the expert who wrote the service. It's opinionated, structured, and action-first. Sections: (1) **Alert name + description** — the exact string the pager fires with, and a one-line plain-English meaning. (2) **Impact** — who is affected and how (customer-facing error? internal dashboard slow?). 'Is this a SEV-1 or a SEV-3?' should be answerable from this section. (3) **First diagnostic steps** — the 3-5 commands to run first, copy-pasteable. Not 'investigate,' but literally `journalctl -u foo`, `systemctl status foo`, `curl localhost:9090/health` — specific. (4) **Known causes and mitigations** — if the cause is 'disk full on /var/log,' the mitigation is 'ssh in, `du -sh /var/log/*`, find the offender, clear; restart journal-forwarder if needed.' Pair each cause with its mitigation. (5) **Escalation path** — if you can't resolve in N minutes, page whom? What are their Slack handles? What's the Zoom bridge for incidents? (6) **Post-mitigation** — how to verify recovery (metric dashboard link, specific log pattern to confirm). (7) **Links to recent postmortems** involving this alert. Bad runbook characteristics: vague ('check the logs'), outdated (links to a monitoring tool deprecated two years ago), or absent (a page with no runbook is a failed system). Keep runbooks in a searchable wiki linked directly from the alert. Update them every time you find a gap — the next on-call will thank you.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════

export const LINUX_ADVANCED_CHAPTERS: ChapterSection[] = [
  lxaS1, lxaS2, lxaS3, lxaS4, lxaS5, lxaS6, lxaS7, lxaS8,
  lxaS9, lxaS10, lxaS11, lxaS12, lxaS13, lxaS14, lxaS15, lxaS16,
];
