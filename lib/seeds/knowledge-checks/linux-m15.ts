import type { MCQuestion } from "@/lib/types/campaign";

// linux-m15 "Bash Scripting" — covers lxa-s5 (Fundamentals) + lxa-s6 (Fleet Automation)

export const LINUX_M15_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m15-q01",
    question:
      "A script contains `rm -rf $BUILDDIR/` and one day silently deletes everything under `/` instead of a build directory. What's the root cause and the first-line fix?",
    choices: [
      { label: "A", text: "The path wasn't escaped — escape the slashes with `\\/`" },
      { label: "B", text: "`$BUILDDIR` was unset; with `-u` off, the expansion became `rm -rf /`. Fix: add `set -u` (or `set -euo pipefail`) so unset variables abort the script" },
      { label: "C", text: "`rm -rf` should be `rm -r`" },
      { label: "D", text: "The script needed `shopt -s nullglob`" },
    ],
    correctAnswer: "B",
    explanation:
      "Without `set -u`, an unset variable expands to the empty string — so `rm -rf $BUILDDIR/` becomes `rm -rf /`. With `set -u`, the reference to an unset `BUILDDIR` aborts immediately with a clear error. Combine with `set -e` (exit on any failure) and `set -o pipefail` (a pipeline's exit code reflects the first failure) for the standard preamble.",
  },
  {
    id: "linux-m15-q02",
    question:
      "Which quoting style correctly passes through all positional arguments to a wrapped command, preserving each argument as a separate word even if it contains spaces?",
    choices: [
      { label: "A", text: '`$*`' },
      { label: "B", text: '`"$*"`' },
      { label: "C", text: '`"$@"`' },
      { label: "D", text: "`$@`" },
    ],
    correctAnswer: "C",
    explanation:
      '`"$@"` expands each argument as a separate, individually-quoted word — preserving arguments with spaces intact. `"$*"` joins them with the first IFS character into one string. Unquoted `$@` and `$*` both word-split on whitespace inside arguments. The rule: when forwarding arguments, use `"$@"` — every time.',
  },
  {
    id: "linux-m15-q03",
    question:
      "A script has `curl -sS https://api.example.com/data | jq '.items'`. The jq stage fails because curl returned an HTML error page. The script exits 0. What flag fixes this?",
    choices: [
      { label: "A", text: "`set -e` alone" },
      { label: "B", text: "`set -o pipefail`, so the pipeline's exit code reflects the first non-zero stage, not just the last" },
      { label: "C", text: "`curl -f` — fail on HTTP error" },
      { label: "D", text: "Both B and C" },
    ],
    correctAnswer: "D",
    explanation:
      "`curl -f` makes curl exit non-zero on HTTP error (4xx/5xx), so the failure propagates. `set -o pipefail` makes the whole pipeline inherit the first failing stage's exit code (without it, only jq's exit code matters and jq may 'succeed' on garbage input). You want both: `-f` to signal the HTTP failure, `pipefail` to let `set -e` catch it. Defensive curl use: `curl -fsSL` — fail on error, silent progress, show errors, follow redirects.",
  },
  {
    id: "linux-m15-q04",
    question:
      "In bash, what does `${CONFIG_FILE:-/etc/app/default.conf}` do?",
    choices: [
      { label: "A", text: "Assigns `/etc/app/default.conf` to `CONFIG_FILE`" },
      { label: "B", text: "Expands to the value of `CONFIG_FILE` if set and non-empty, otherwise expands to `/etc/app/default.conf` without modifying the variable" },
      { label: "C", text: "Reads the file at that path" },
      { label: "D", text: "Errors if `CONFIG_FILE` isn't set" },
    ],
    correctAnswer: "B",
    explanation:
      "`${VAR:-default}` expands VAR if non-empty, otherwise returns 'default' — it does NOT assign. For assign-if-unset use `${VAR:=default}`. For error-if-unset use `${VAR:?message}`. These three forms cover almost every 'handle an optional env var gracefully' case without a single `if` statement.",
  },
  {
    id: "linux-m15-q05",
    question:
      "A for-loop iterates `for f in $(find /logs -name '*.txt')`. One file is named `access log.txt`. How does the loop see that file?",
    choices: [
      { label: "A", text: "As one entry: `access log.txt`" },
      { label: "B", text: "As two entries: `access` and `log.txt` — word-splitting on the space" },
      { label: "C", text: "It's skipped because find escapes the output" },
      { label: "D", text: "Bash raises a syntax error" },
    ],
    correctAnswer: "B",
    explanation:
      "Unquoted command substitution (`$(find ...)`) gets word-split on IFS (default: space/tab/newline). A filename with a space becomes two tokens. Robust pattern: read into an array with `mapfile -t files < <(find /logs -name '*.txt')` then iterate `for f in \"${files[@]}\"`, or use `find ... -print0 | xargs -0` for null-delimited handling. Also set `IFS=$'\\n\\t'` at the top of scripts to shrink this bug surface.",
  },
  {
    id: "linux-m15-q06",
    question:
      "What is the single most reliable way to ensure a temp directory is removed regardless of whether a script exits normally, errors, or is killed by a signal?",
    choices: [
      { label: "A", text: "`rm -rf \"$tmpdir\"` at the bottom of the script" },
      { label: "B", text: "`trap 'rm -rf \"$tmpdir\"' EXIT INT TERM`" },
      { label: "C", text: "`defer rm -rf \"$tmpdir\"`" },
      { label: "D", text: "`while true; do ...; done` around the whole script" },
    ],
    correctAnswer: "B",
    explanation:
      "The `trap ... EXIT` handler runs on every exit path — clean exit, `set -e` abort, uncaught error, and signals (if you include INT/TERM). `rm -rf` at the bottom only runs on success. Bash has no `defer` keyword. The EXIT trap is the canonical cleanup primitive.",
  },
  {
    id: "linux-m15-q07",
    question:
      "You're running a health check across 3,000 nodes. The serial version takes 45 minutes. Which tool gives you the most straightforward 50-way parallelism with per-job control over output?",
    choices: [
      { label: "A", text: "`cmd1 & cmd2 & wait` — backgrounding each one" },
      { label: "B", text: "`xargs -P 50` — parallel invocations with a fixed concurrency cap" },
      { label: "C", text: "A `for` loop with `sleep 0.1` to stagger" },
      { label: "D", text: "`cmd > /dev/null 2>&1 &` without any coordination" },
    ],
    correctAnswer: "B",
    explanation:
      "`xargs -P 50 -I {} cmd {}` runs up to 50 concurrent invocations, re-fills from the input list as jobs complete, and is available on every box with no installed dependencies. Naked backgrounding (`&`) without any concurrency control is dangerous at 3000 jobs — it'll spawn all of them and likely trip `ulimit -u` or local fd limits. GNU parallel is another option but isn't always installed.",
  },
  {
    id: "linux-m15-q08",
    question:
      "A cron job occasionally runs twice because a previous invocation hasn't finished yet. What's the standard one-line pattern to prevent overlapping executions?",
    choices: [
      { label: "A", text: "Check `ps aux | grep myjob` at the top of the script" },
      { label: "B", text: "Use `flock` on a lockfile — `exec 200>/var/lock/myjob.lock; flock -n 200 || exit 1`" },
      { label: "C", text: "Add `sleep 60` at the start" },
      { label: "D", text: "Set `OnUnitInactiveSec=` in the cron" },
    ],
    correctAnswer: "B",
    explanation:
      "`flock` uses a kernel file lock: the lock is held as long as the file descriptor is open (i.e., the script is running). A second invocation gets `-n` (non-blocking) fail-fast and exits. If the first process crashes, the kernel releases the lock automatically. Checking `ps | grep` has race conditions and matches the grep process itself. `sleep` doesn't prevent anything. `OnUnitInactiveSec` is a systemd timer property, not a cron concept.",
  },
  {
    id: "linux-m15-q09",
    question:
      "A deploy script fails with \"user already exists\" on the second run. Which change makes it idempotent (safe to re-run)?",
    choices: [
      { label: "A", text: "Wrap the whole script in `if [ \"$FIRST_RUN\" ]; then ... fi`" },
      { label: "B", text: "Use `useradd -r deploy 2>/dev/null || true` so the step is a no-op when the user exists" },
      { label: "C", text: "Run the script with `set +e`" },
      { label: "D", text: "Add `rm -rf /etc/passwd` before creating the user" },
    ],
    correctAnswer: "B",
    explanation:
      "Making each step a no-op-on-repeat is idempotency done right. `useradd -r deploy 2>/dev/null || true` ignores the duplicate-user error while still letting the first run create the user. Don't disable `set -e` (it'll hide other failures). Don't nuke `/etc/passwd`. Don't guard on a side-channel 'FIRST_RUN' flag — that's fragile. Apply the same pattern everywhere: `mkdir -p`, `ln -sf`, `install -D`, atomic rename — each tool has an idempotent form.",
  },
  {
    id: "linux-m15-q10",
    question:
      "A script writes state to `/etc/app/config.yaml` with `echo \"$CONFIG\" > /etc/app/config.yaml`. On 1% of runs, readers see an empty or half-written file. What's the fix?",
    choices: [
      { label: "A", text: "Write to `/etc/app/.config.yaml.tmp` first, then `mv` it to the target — `mv` is atomic on the same filesystem, so readers see either old or new, never partial" },
      { label: "B", text: "Add `sleep 1` after the echo" },
      { label: "C", text: "Use `>>` instead of `>`" },
      { label: "D", text: "Wrap the echo in `sudo`" },
    ],
    correctAnswer: "A",
    explanation:
      "`echo ... > file` truncates then writes — readers can (and sometimes do) catch the moment between the truncate and the write completing. `mv` within a filesystem is atomic at the inode level: the target either points to the old file or the new one, never a half-written one. Pattern: write to a tempfile in the same directory (critical — cross-filesystem mv falls back to copy-then-delete, which isn't atomic), then rename. This pattern shows up everywhere — `git` uses it, `rsync --inplace=no` uses it, and so should your scripts.",
  },
];
