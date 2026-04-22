import type { MCQuestion } from "@/lib/types/campaign";

// linux-m20 "Final Assessment" — 15 questions spanning m13..m19

export const LINUX_M20_QUESTIONS: MCQuestion[] = [
  // ── systemd (m13) ─────────────────────────────────────────────────
  {
    id: "linux-m20-q01",
    question:
      "A service unit has `Requires=postgresql.service` but no `After=`. At boot, sometimes the service fails to connect to postgres. What's the correct unit-file fix?",
    choices: [
      { label: "A", text: "Add `Restart=on-failure`" },
      { label: "B", text: "Add `After=postgresql.service` — Requires pulls in the dep but doesn't order the start; both can launch in parallel without the After" },
      { label: "C", text: "Change `Requires=` to `Needs=`" },
      { label: "D", text: "Add `BindsTo=` in place of `Requires=`" },
    ],
    correctAnswer: "B",
    explanation:
      "Ordering and requirement are orthogonal in systemd. `Requires=` guarantees the dep is started; `After=` orders the starts. You almost always need both. Without `After=`, the dependent service may race ahead and fail to connect to a not-yet-ready postgres.",
  },
  {
    id: "linux-m20-q02",
    question:
      "A service with `MemoryMax=4G` gets OOM-killed within seconds of starting. The cgroup shows it hitting 4.0G before death. What's happening?",
    choices: [
      { label: "A", text: "MemoryMax is broken in your kernel version" },
      { label: "B", text: "MemoryMax is a hard cap enforced by the kernel. The workload needs more than 4G, or has a leak. Options: raise the limit, use `MemoryHigh=` for throttling, or fix the leak" },
      { label: "C", text: "cgroups are disabled — check /sys/fs/cgroup" },
      { label: "D", text: "The limit only applies after 60 seconds" },
    ],
    correctAnswer: "B",
    explanation:
      "MemoryMax is a hard cap — when the cgroup tries to allocate past it, the kernel OOM-kills the offender. That's by design. If the workload genuinely needs more memory, raise the limit. For graceful degradation instead of hard kills, use `MemoryHigh=` which throttles before killing. If the growth is unbounded, the cgroup just exposed a real leak.",
  },

  // ── security (m14) ────────────────────────────────────────────────
  {
    id: "linux-m20-q03",
    question:
      "You're about to set the default input policy to DROP on a remote host. Which pre-step is critical?",
    choices: [
      { label: "A", text: "Disable IPv6" },
      { label: "B", text: "Pre-seed a rule to accept `ct state established,related` — otherwise the new policy drops your open SSH session's packets the moment it applies" },
      { label: "C", text: "Switch to nftables first" },
      { label: "D", text: "Reboot to clear conntrack" },
    ],
    correctAnswer: "B",
    explanation:
      "Without an ESTABLISHED+RELATED accept rule, your open SSH session's packets get dropped by the new default-deny policy and your terminal hangs — classic remote-lockout. Always pre-seed the stateful accept before tightening the policy, and ideally schedule an `at` job that auto-flushes the ruleset in 5 minutes as a deadman switch.",
  },
  {
    id: "linux-m20-q04",
    question:
      "A teammate sets `setenforce 0` in prod \"so the deploy works.\" A month later, a known nginx CVE compromises the box. How would you coach them?",
    choices: [
      { label: "A", text: "Treat SELinux denials as bugs to fix, not features to disable. The workflow is: `ausearch -m avc -ts recent | audit2why`, then either toggle an SELinux boolean, apply the correct file context with `semanage fcontext + restorecon`, or generate a targeted policy module. Disabling SELinux globally removes the MAC layer for every service" },
      { label: "B", text: "SELinux is fine to disable in production — it's only for labs" },
      { label: "C", text: "They should switch to AppArmor" },
      { label: "D", text: "Coverage is unnecessary since the CVE was external" },
    ],
    correctAnswer: "A",
    explanation:
      "SELinux `enforcing` is a production safety net: it would have contained the CVE's damage by refusing unauthorized file access even after RCE. `setenforce 0` is a diagnostic tool, not a fix. The right workflow — `ausearch` → `audit2why` → targeted fix — addresses the specific denial without removing protection for every other service on the host.",
  },

  // ── bash (m15) ────────────────────────────────────────────────────
  {
    id: "linux-m20-q05",
    question:
      "A script contains `rm -rf $BUILDDIR/` and one night silently wipes files under `/`. What single line at the top would have prevented this?",
    choices: [
      { label: "A", text: "`set -x`" },
      { label: "B", text: "`set -euo pipefail` — `-u` in particular makes an unset `$BUILDDIR` abort the script instead of silently expanding to empty" },
      { label: "C", text: "`shopt -s nullglob`" },
      { label: "D", text: "`export PATH=/usr/bin`" },
    ],
    correctAnswer: "B",
    explanation:
      "Without `set -u`, an unset `$BUILDDIR` expands to empty string — `rm -rf /` happens. With `set -u`, referencing an unset variable aborts immediately. Combine with `set -e` (exit on error) and `set -o pipefail` (pipeline exit codes) for the standard safe-by-default preamble.",
  },
  {
    id: "linux-m20-q06",
    question:
      "You need to run a health check across 3,000 hosts. Serial is 45 minutes. What's the standard approach for 50-way parallelism with per-host timeout?",
    choices: [
      { label: "A", text: "`for host in $(cat hosts); do ssh $host uptime & done; wait`" },
      { label: "B", text: "`xargs -a hosts.txt -P 50 -I {} ssh -o ConnectTimeout=5 -o BatchMode=yes {} uptime` — bounded concurrency, per-host timeout, no prompting" },
      { label: "C", text: "A for-loop with `sleep 0.1` between calls" },
      { label: "D", text: "Run it 3000 times in series with `timeout 1`" },
    ],
    correctAnswer: "B",
    explanation:
      "`xargs -P 50` runs up to 50 jobs concurrently, refilling as jobs finish. `ConnectTimeout=5` stops unreachable hosts from blocking a worker. `BatchMode=yes` prevents any password/host-key prompts. Available on every Linux box with no installed dependencies. Bare backgrounding (`&`) without a concurrency cap spawns all 3000 at once and trips local fd/process limits.",
  },

  // ── storage (m16) ─────────────────────────────────────────────────
  {
    id: "linux-m20-q07",
    question:
      "A production node's `/var` LV is 97% full at 02:00. The VG has 50 GB of free extents. Which command adds 20 GB with zero downtime?",
    choices: [
      { label: "A", text: "Boot into rescue and `resize2fs`" },
      { label: "B", text: "`lvextend -r -L +20G /dev/rootvg/varlv` — extends the LV and resizes the filesystem on top, online, in one step" },
      { label: "C", text: "`umount /var; lvextend; mount /var`" },
      { label: "D", text: "`dd if=/dev/zero ...`" },
    ],
    correctAnswer: "B",
    explanation:
      "`lvextend -r` extends the LV and invokes the filesystem's resize tool automatically — `xfs_growfs` for XFS, `resize2fs` for ext4. The mounted filesystem stays live. This is LVM's headline capability: growing storage under a running production workload without any unmount or reboot.",
  },
  {
    id: "linux-m20-q08",
    question:
      "A RAID 10 array's iostat shows one device with `%util=99, await=250ms` while three peers are at `%util=20, await=3ms`. Same workload. First diagnostic?",
    choices: [
      { label: "A", text: "`fsck -y` the slow device" },
      { label: "B", text: "`smartctl -a /dev/sdX` — asymmetric latency on mirror-peer devices is the signature of one drive going bad; check for rising reallocated sectors, pending sectors, offline uncorrectable" },
      { label: "C", text: "Reboot to rebalance" },
      { label: "D", text: "Increase the I/O scheduler queue depth" },
    ],
    correctAnswer: "B",
    explanation:
      "When three peers handle the same workload at normal latency and one outlier is saturated, that outlier is going bad. SMART exposes the early-failure signals. Proactive replacement during a maintenance window beats waiting for a hard failure that could cascade into a degraded rebuild window.",
  },

  // ── networking (m17) ──────────────────────────────────────────────
  {
    id: "linux-m20-q09",
    question:
      "You configure a Linux bond in mode 802.3ad (LACP) but `cat /proc/net/bonding/bond0` shows no `Partner:` info and one slave carries no traffic. Fix?",
    choices: [
      { label: "A", text: "Increase `miimon`" },
      { label: "B", text: "Configure the switch-side ports as an LACP port-channel — LACP is a negotiation between both endpoints; if the switch isn't speaking LACP, no aggregation forms and one link goes silent" },
      { label: "C", text: "Switch to mode 0 (round-robin)" },
      { label: "D", text: "Upgrade the kernel" },
    ],
    correctAnswer: "B",
    explanation:
      "LACP requires both sides. Linux sends LACPDUs; without matching LACP config on the switch port, it has no partner, so no aggregation. The 'up but no Partner' state in `/proc/net/bonding/bond0` is the unambiguous diagnostic. Fix on the switch side: `channel-group X mode active` (Cisco) or vendor equivalent.",
  },
  {
    id: "linux-m20-q10",
    question:
      "Your iperf single-flow maxes at 3 Gbps on a 100 Gbps DC-to-DC link with 20 ms RTT. Hardware is fine. What's the most likely kernel cause?",
    choices: [
      { label: "A", text: "iperf is UDP-only" },
      { label: "B", text: "Kernel TCP send/receive buffers are too small for the link's bandwidth-delay product (BDP = 100 Gbps × 20 ms ≈ 250 MB); raise `net.core.rmem_max`/`wmem_max` and the `tcp_rmem`/`tcp_wmem` ceilings, and consider BBR congestion control" },
      { label: "C", text: "MTU mismatch" },
      { label: "D", text: "NIC driver is limiting throughput" },
    ],
    correctAnswer: "B",
    explanation:
      "Single-flow TCP throughput ≈ window / RTT. Default buffers cap out at a few MB, producing 1-3 Gbps on a 20 ms link regardless of actual bandwidth. Raising the buffer ceilings (and pairing with BBR for long-haul) is the canonical kernel-side fix.",
  },

  // ── containers / git (m18) ────────────────────────────────────────
  {
    id: "linux-m20-q11",
    question:
      "A container dies with exit code 137. `docker inspect -f '{{.State.OOMKilled}}'` is true. What happened?",
    choices: [
      { label: "A", text: "The container received SIGKILL from the kernel's OOM killer — the cgroup memory limit was hit and the kernel killed the offender. Fix: raise the limit or fix the leak" },
      { label: "B", text: "The application quit cleanly" },
      { label: "C", text: "Docker daemon restarted" },
      { label: "D", text: "A network issue" },
    ],
    correctAnswer: "A",
    explanation:
      "Exit 137 = 128 + 9 = SIGKILL. With `OOMKilled=true`, the sender was the kernel's OOM killer responding to a cgroup memory-limit violation. Options: raise `--memory` if the workload genuinely needs more, profile for a leak if unbounded growth is the cause, or set a soft `--memory-reservation` to get graceful degradation instead of a hard kill.",
  },
  {
    id: "linux-m20-q12",
    question:
      "You accidentally pushed a bad commit to `main`. Six teammates have pulled it. Correct rollback?",
    choices: [
      { label: "A", text: "`git reset --hard HEAD~1; git push -f origin main` — rewrite history" },
      { label: "B", text: "`git revert HEAD; git push origin main` — new commit inverts the bad one, everyone's history stays consistent" },
      { label: "C", text: "Delete `main` and recreate from a tag" },
      { label: "D", text: "Force everyone to reclone" },
    ],
    correctAnswer: "B",
    explanation:
      "`git revert` creates a new commit that inverts the bad one — history preserved, safe on shared branches. Force-pushing rewrites published history and breaks every teammate who pulled, creating a new incident on top of your first one. Reserve `reset --hard + force push` for un-shared local branches only.",
  },

  // ── cascading / incidents (m19) ───────────────────────────────────
  {
    id: "linux-m20-q13",
    question:
      "During a cascade, your instinct is to add more server capacity. Why is that often wrong?",
    choices: [
      { label: "A", text: "Capacity is expensive" },
      { label: "B", text: "New instances join the amplifier — they hit the same slow downstream, build their own retry queues, and worsen load. Stabilize first (shed load, break the feedback loop), then scale" },
      { label: "C", text: "Scaling requires a deploy pipeline" },
      { label: "D", text: "Operating hours policy" },
    ],
    correctAnswer: "B",
    explanation:
      "In a cascade, the bottleneck is usually not capacity — it's the amplifier (retries, thundering herd, pool exhaustion). More instances amplify the amplifier. The rule: stop the amplification first (rate limits, reduced retries, circuit breakers), then add capacity. 'Stop amplifying before you scale.'",
  },
  {
    id: "linux-m20-q14",
    question:
      "Which action item is well-written for a postmortem?",
    choices: [
      { label: "A", text: "\"Improve monitoring\"" },
      { label: "B", text: "\"By 2026-04-15, Maria will add alerting on retry-rate spikes crossing 2x baseline for 5 minutes, verified by firing a synthetic test alert\"" },
      { label: "C", text: "\"Be more careful with deploys\"" },
      { label: "D", text: "\"Consider a Rust rewrite\"" },
    ],
    correctAnswer: "B",
    explanation:
      "A real action item names an owner, a deadline, and a measurable success criterion. Vague aspirations (\"improve monitoring,\" \"be more careful\") don't produce change. Rigor on action items is the discipline that separates postmortems that prevent recurrence from those that merely describe the incident.",
  },

  // ── operator craft (m20) ──────────────────────────────────────────
  {
    id: "linux-m20-q15",
    question:
      "You're paged at 03:00 for a symptom on a service you've never worked on. What's the professional first move?",
    choices: [
      { label: "A", text: "Try things until one works" },
      { label: "B", text: "Acknowledge the page, post in the incident channel that you're investigating and unfamiliar with the service, search for a runbook, run the 10 diagnostic commands to build a picture, and escalate early (~5-10 min) if you can't make progress. Over-escalating is cheap; under-escalating is expensive" },
      { label: "C", text: "Wait for a senior to wake up naturally" },
      { label: "D", text: "Reboot the server and see if it helps" },
    ],
    correctAnswer: "B",
    explanation:
      "The professional pattern: acknowledge, communicate, gather data, escalate early. Never spend more than 5-10 minutes solo on a system you don't own — paging the owner at minute 5 is cheap, paging at minute 45 after cascade has spread is expensive. Blind rebooting an unfamiliar service risks turning a recoverable issue into data loss. Honesty about unfamiliarity ('never worked on this') is a strength, not a weakness.",
  },
];
