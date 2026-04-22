import type { MCQuestion } from "@/lib/types/campaign";

// linux-m18 "Containers & Git" — covers lxa-s11 (Containers) + lxa-s12 (Git for Ops)

export const LINUX_M18_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m18-q01",
    question:
      "A container died with exit code 137 (`docker inspect -f '{{.State.ExitCode}}'` returns 137). What does this most likely indicate?",
    choices: [
      { label: "A", text: "The application exited cleanly" },
      { label: "B", text: "The container received SIGKILL (signal 9); 128+9=137. Most commonly the kernel's OOM killer fired because the cgroup memory limit was hit, or the Docker daemon SIGKILLed it after a `stop` timeout" },
      { label: "C", text: "A permission-denied from SELinux" },
      { label: "D", text: "The image failed to pull" },
    ],
    correctAnswer: "B",
    explanation:
      "Exit code 137 = 128 (killed by signal) + 9 (SIGKILL). The sender is usually the kernel's OOM killer (check `dmesg | grep oom-killer` and `docker inspect -f '{{.State.OOMKilled}}'`), occasionally the Docker daemon enforcing a stop-timeout, rarely a manual `docker kill`. Distinguishing: `docker events` for the timeline, `.State.OOMKilled` for the OOM confirmation.",
  },
  {
    id: "linux-m18-q02",
    question:
      "Which describes a Linux container accurately?",
    choices: [
      { label: "A", text: "A full virtual machine with its own kernel" },
      { label: "B", text: "A regular Linux process isolated via namespaces (PID, NET, MNT, UTS, IPC, USER) and constrained via cgroups, with a layered filesystem" },
      { label: "C", text: "A hypervisor-managed sandbox like VMware" },
      { label: "D", text: "A chroot jail" },
    ],
    correctAnswer: "B",
    explanation:
      "A container is a process with kernel-provided isolation (namespaces for *what it can see*) and resource control (cgroups for *how much it can use*), built on top of a union filesystem (overlayfs). No separate kernel, no hypervisor. That's why you can debug containers with standard Linux tools — they're just processes with a richer isolation story.",
  },
  {
    id: "linux-m18-q03",
    question:
      "The `docker logs` for a failing container are empty. You need to see the container's actual filesystem and process state from the host. What's the most direct approach?",
    choices: [
      { label: "A", text: "Rebuild the image from scratch" },
      { label: "B", text: "Get the container PID with `docker inspect -f '{{.State.Pid}}'` and then `sudo nsenter -t <pid> -a` to enter all of its namespaces — you can run any command from the host inside the container's environment, even if the image has no shell" },
      { label: "C", text: "Reboot the host" },
      { label: "D", text: "Switch to `docker exec`" },
    ],
    correctAnswer: "B",
    explanation:
      "`docker exec` requires a shell or command that exists inside the image — often missing in stripped-down production images (distroless, scratch, etc.). `nsenter -t <pid> -a` uses the host's binaries to enter the container's kernel namespaces; you can run any host command there, see mount points, read `/proc`, inspect network state. The most powerful debugging technique for minimal-image containers.",
  },
  {
    id: "linux-m18-q04",
    question:
      "A container is started without `--memory`. It begins allocating 100 GB on an 80 GB host. What happens at the kernel level?",
    choices: [
      { label: "A", text: "Docker automatically caps memory at the host size" },
      { label: "B", text: "The host enters memory pressure; the OOM killer runs. It may pick the runaway container, but it may also kill another container or even a system daemon based on oom_score" },
      { label: "C", text: "The container's malloc returns NULL gracefully" },
      { label: "D", text: "The kernel swaps aggressively until everything finishes" },
    ],
    correctAnswer: "B",
    explanation:
      "Without `--memory`, the container has no cgroup memory limit and competes for physical memory with every other process. Under pressure, the kernel's OOM killer picks a victim based on oom_score — which isn't guaranteed to be the offender. A single misbehaving container can effectively DoS the whole host, or worse, get a critical service killed. Production rule: always set resource limits on containers, or let the orchestrator enforce them.",
  },
  {
    id: "linux-m18-q05",
    question:
      "You committed a change to `main` that broke production. Six teammates have pulled the bad commit. What is the safe rollback?",
    choices: [
      { label: "A", text: "`git reset --hard HEAD~1 && git push -f origin main`" },
      { label: "B", text: "`git revert HEAD && git push origin main` — creates a new commit that undoes the bad one; everyone's history stays consistent" },
      { label: "C", text: "Delete the `main` branch and recreate from the previous commit" },
      { label: "D", text: "Ask everyone to run `git reset --hard HEAD~1` on their laptops" },
    ],
    correctAnswer: "B",
    explanation:
      "`git revert` makes a *new* commit whose content is the inverse of the bad one. History is preserved, everyone's copies still align with origin, no force-push drama. `reset --hard` + force-push rewrites published history and causes pain for every teammate who pulled. Reserve `reset --hard` for un-pushed local cleanup only.",
  },
  {
    id: "linux-m18-q06",
    question:
      "Feature X has been broken for about two weeks but nobody knows when it started failing. You have ~800 commits in that range. What's the fastest way to identify the exact regressing commit?",
    choices: [
      { label: "A", text: "Read each commit's diff manually" },
      { label: "B", text: "`git bisect start; git bisect bad; git bisect good <2-weeks-ago>; git bisect run ./test-feature-x.sh` — Git binary-searches the range automatically, running the test at each step; finds the first-bad commit in ~log₂(800) ≈ 10 steps" },
      { label: "C", text: "Revert every commit one by one until it works" },
      { label: "D", text: "Check `git log --grep feature-x`" },
    ],
    correctAnswer: "B",
    explanation:
      "`git bisect` is a binary search through commit history. Automating it with `git bisect run <script>` reduces operator effort to writing a single test command. For 800 commits, ~10 bisection steps identify the exact first-bad commit — a huge time savings over any manual strategy.",
  },
  {
    id: "linux-m18-q07",
    question:
      "You accidentally ran `git reset --hard HEAD~5` and lost five commits you hadn't pushed. What's the recovery?",
    choices: [
      { label: "A", text: "They're gone — reset is destructive" },
      { label: "B", text: "Use `git reflog` to find the pre-reset HEAD SHA, then `git reset --hard <that-sha>` to restore — Git keeps unreachable commits for 30 days by default" },
      { label: "C", text: "Pull from origin to get them back" },
      { label: "D", text: "Run `git fsck` and pray" },
    ],
    correctAnswer: "B",
    explanation:
      "`git reflog` is a journal of every HEAD movement. After a bad reset, the old HEAD is still in the reflog even though it's 'unreachable' in the normal sense. Grab its SHA and `git reset --hard` back to it. Git keeps unreachable objects for 30 days (the `gc.reflogExpire` default) — plenty of time for most recovery. The commits aren't pulled from origin because they were never there; they live locally in the object database.",
  },
  {
    id: "linux-m18-q08",
    question:
      "What's the key distinction between `git revert` and `git reset --hard`?",
    choices: [
      { label: "A", text: "They're synonyms" },
      { label: "B", text: "`revert` creates a new commit that inverts a previous one (history preserved, safe on shared branches). `reset --hard` moves the branch pointer and discards commits (rewrites history, only safe on local un-shared state)" },
      { label: "C", text: "`revert` is for untracked files; `reset --hard` is for tracked files" },
      { label: "D", text: "`revert` requires network access; `reset --hard` doesn't" },
    ],
    correctAnswer: "B",
    explanation:
      "Different semantics, different blast radius. `revert` adds a commit — additive, auditable, shareable. `reset --hard` moves the branch pointer *backwards* and destroys both the commit link and any uncommitted work. The rule of thumb: `revert` for anything that's been pushed; `reset` for local tidying only.",
  },
  {
    id: "linux-m18-q09",
    question:
      "An operations repo stores firewall rules, Ansible playbooks, and Kubernetes manifests. Which of these policies most prevents \"mystery change to production\" incidents?",
    choices: [
      { label: "A", text: "Daily full-repo backups" },
      { label: "B", text: "Branch protection on `main` (no direct push, required PR review, required status checks), signed commits, and meaningful commit messages" },
      { label: "C", text: "Encrypting the repo contents" },
      { label: "D", text: "Restricting repo access to one person" },
    ],
    correctAnswer: "B",
    explanation:
      "The forensic question in an incident is \"who changed what, when, and was it reviewed?\" Branch protection + required PR + signed commits + clear commit messages answers all four. Backups help recovery but not attribution. Encryption is unrelated. One-person access is the fastest way to stop progress and create a single point of failure.",
  },
  {
    id: "linux-m18-q10",
    question:
      "Which command shows the current TCP congestion window, smoothed RTT, and retransmit counts for every active socket on the host?",
    choices: [
      { label: "A", text: "`netstat -s` — system-wide aggregates only" },
      { label: "B", text: "`ss -ti` — `-t` for TCP, `-i` for per-socket internals including cwnd, rto, rtt, retransmits, wscale" },
      { label: "C", text: "`ip -s socket`" },
      { label: "D", text: "`tcpdump -i any`" },
    ],
    correctAnswer: "B",
    explanation:
      "`ss -ti` (TCP, with internals) prints per-socket TCP metrics — cwnd, smoothed RTT, retransmit count, scaling, and more. Essential for diagnosing per-flow problems (single-flow slow while peers fine is a strong hint toward TCP-level tuning). `netstat -s` is for system-wide trends; `tcpdump` captures packets, not socket state. Note: this question revisits m17 material since debugging containers often involves checking the network layer beneath them.",
  },
];
