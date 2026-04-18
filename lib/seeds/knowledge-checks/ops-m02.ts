import type { MCQuestion } from "@/lib/types/campaign";

// ops-m02 "Change Management" — covers ops-s3 (Changes, Risk, Rollback) + ops-s4 (Maintenance Windows, MOPs)

export const OPS_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "ops-m02-q01",
    question:
      "A statistic often cited on ops teams: most outages are not caused by hardware failures. What's the honest summary of where outages actually come from, and what does that mean for how a team spends its time?",
    choices: [
      { label: "A", text: "A majority are self-inflicted — deploys, config changes, firmware flashes, cabling mistakes. Hardware fails on a schedule the industry has made peace with; the tractable lever is change management. Teams improve reliability more by tightening change discipline than by chasing hardware perfection" },
      { label: "B", text: "Outages are random and mostly unavoidable" },
      { label: "C", text: "Nearly all outages are hardware failures" },
      { label: "D", text: "Outages are caused by external actors most of the time" },
    ],
    correctAnswer: "A",
    explanation:
      "At fleet scale, hardware failures are expected and handled by redundancy and fast replacement. Human-made outages — a bad deploy, a typo in a config, an untested firmware flash — are the category with the highest leverage for improvement. That's why change management gets as much attention as incident response in mature ops orgs: preventing the bad deploy is almost always cheaper than recovering from it.",
  },
  {
    id: "ops-m02-q02",
    question:
      "Three categories of change are typically defined: standard, normal, and emergency. Which best describes how each is reviewed?",
    choices: [
      { label: "A", text: "Standard: pre-approved via the SOP itself, no separate review. Normal: reviewed by CAB before execution, with risk assessment and rollback plan. Emergency: minimal pre-review, full post-review, done with compressed but still careful staging" },
      { label: "B", text: "All three go through CAB" },
      { label: "C", text: "None need review if the engineer is senior enough" },
      { label: "D", text: "Only emergency changes need review" },
    ],
    correctAnswer: "A",
    explanation:
      "Standard changes are routine, low-risk, frequent (replace a disk, rotate a key) — reviewing each one is wasteful; the SOP itself is the pre-approval. Normal changes are non-routine; the CAB adds value by catching conflicts and missing rollback plans. Emergency changes can't wait, so they're reviewed after-the-fact in a post-incident review — but staging and discipline still apply during execution.",
  },
  {
    id: "ops-m02-q03",
    question:
      "Before any production change, what single question should be answered, and what happens if the answer is unclear?",
    choices: [
      { label: "A", text: "\"If this goes wrong, how do I undo it?\" If the answer is \"I don't know\" or \"I can't,\" the change is not ready to apply. A rollback plan must be written, tested, and staged before the change begins" },
      { label: "B", text: "\"How long will it take?\"" },
      { label: "C", text: "\"Has the CEO approved it?\"" },
      { label: "D", text: "\"Can we do it during business hours?\"" },
    ],
    correctAnswer: "A",
    explanation:
      "Rollback is the one line of defense against unknown-unknowns in any change. A change without a tested rollback is a one-way door — if anything surprises you mid-change, you have no way back. The rollback must be *more* than a wish: file staged, procedure written, and ideally dry-run in staging. \"We'll restore from backup if needed\" is a rollback *only* if you've recently verified that the restore works and have timed how long it takes.",
  },
  {
    id: "ops-m02-q04",
    question:
      "An engineer proposes pushing a new kernel to all 2,000 GPU nodes tonight \"because QA already tested it on 4 nodes in the lab.\" What's the discipline issue, and what's the correct counter-proposal?",
    choices: [
      { label: "A", text: "Lab tests on 4 nodes prove the kernel boots, not that it survives fleet-wide under real workloads with diverse hardware revisions. The correct counter-proposal is staged rollout: canary on 1 node → 1 rack → 10% → 50% → 100%, with go/no-go gates at each step. Takes longer but limits blast radius to recoverable sizes" },
      { label: "B", text: "QA testing is sufficient for any change" },
      { label: "C", text: "Deploy all at once for consistency" },
      { label: "D", text: "Only test in production" },
    ],
    correctAnswer: "A",
    explanation:
      "Fleet-wide one-shot deploys from small lab tests are the classic catastrophic change pattern. Real fleets have hardware revision mixes, long-running workloads, and driver-version edge cases that labs don't simulate. Staged rollout — 1, few, 10%, 50%, 100% — turns a 2,000-node risk into a contained one. You move faster not by shipping bigger batches, but by making small batches safe and fast to ship.",
  },
  {
    id: "ops-m02-q05",
    question:
      "During a maintenance window, step 7 of 14 in the MOP fails unexpectedly — the firmware tool reports `Device not found`. Steps 1–6 succeeded. What's the correct action?",
    choices: [
      { label: "A", text: "Skip step 7 and continue" },
      { label: "B", text: "Halt. Every serious MOP has an explicit rule: failures not covered in the step's \"if fails\" clause require halting and invoking the rollback procedure. Back out to a known-good state, close the window, reconvene to debug, reschedule" },
      { label: "C", text: "Improvise a fix and proceed" },
      { label: "D", text: "Call the vendor before doing anything" },
    ],
    correctAnswer: "B",
    explanation:
      "A MOP is a contract. You don't improvise inside a time-bounded window with 30 people watching and production on the other side of each step. Halt, rollback, close the window, debug in calm conditions, reschedule. Skipping a failed step or improvising is exactly how contained maintenance becomes an uncontrolled outage. The cost of a postponed window is a day; the cost of an improvised fix can be hours of production pain.",
  },
  {
    id: "ops-m02-q06",
    question:
      "An engineer argues: \"Let's skip the dry run for this firmware upgrade — we've done similar ones before and the window is tight.\" What's the real cost being weighed, and what's usually the right call?",
    choices: [
      { label: "A", text: "Dry runs catch typos, missing tooling, and wrong environment assumptions — cheap to find in staging Friday, expensive at 02:30 Saturday. \"Similar\" is not \"identical.\" The right call is almost always to dry-run, even if it compresses the window, because discovering issues live forces rollback" },
      { label: "B", text: "Dry runs are cosmetic — skip when time-pressured" },
      { label: "C", text: "Only dry-run for emergency changes" },
      { label: "D", text: "Dry-running doubles the change cost" },
    ],
    correctAnswer: "A",
    explanation:
      "Dry runs surface the cheapest class of bug — typos, permissions, wrong assumed versions. A 20-minute dry run in staging catches these for near-zero cost; finding them at 02:30 in a live window costs hours and often triggers rollback. \"We've done similar before\" breeds complacency — similar is not identical, and the difference is exactly where bugs hide. The disciplined answer is to dry-run unless physically impossible; window pressure is a reason to plan better, not to skip validation.",
  },
  {
    id: "ops-m02-q07",
    question:
      "Which best describes the distinction between SOP, MOP, and runbook?",
    choices: [
      { label: "A", text: "SOP: general repeatable process (\"how we replace a failed disk\"). MOP: specific task on a specific day (\"replace disk sda in r17-03 on 2026-04-22\"). Runbook: troubleshooting / scenario response (\"when GPU falls off the bus, do this\")" },
      { label: "B", text: "They're synonyms for the same document" },
      { label: "C", text: "SOP is for management; MOP is for engineers; runbook is for customers" },
      { label: "D", text: "SOPs are out of date; MOPs are current; runbooks are aspirational" },
    ],
    correctAnswer: "A",
    explanation:
      "Each serves a distinct purpose. SOPs are *class-level* templates — how a category of work is done. MOPs are execution artifacts — the concrete, literal plan for one specific event. Runbooks are response-oriented — what to do when a particular scenario unfolds. Good ops orgs have all three and keep them separate; conflating them produces documents that are too abstract to execute or too specific to reuse.",
  },
  {
    id: "ops-m02-q08",
    question:
      "A MOP has 14 steps. Each step includes an explicit \"validation\" — a command and expected output. Why is this explicit validation critical, rather than trusting exit codes from commands?",
    choices: [
      { label: "A", text: "Commands can return exit code 0 while failing to produce the observable state change you intended — a silent-failure mode. Explicit validation (check state, not just exit code) catches these silent failures before you proceed to step 8 on a broken step 7. The hidden-failure path is the most dangerous in maintenance windows" },
      { label: "B", text: "Validations are for compliance audits" },
      { label: "C", text: "Validations are unnecessary if the MOP has been dry-run" },
      { label: "D", text: "Exit codes are always accurate in Linux" },
    ],
    correctAnswer: "A",
    explanation:
      "Silent failures — commands that return 0 without doing what they were supposed to — are the most dangerous class of bug in a MOP. `systemctl stop slurmd` might return 0 but the service might still be running; the intended effect (\"node drained\") must be verified against observable state (`sinfo` shows DRAIN), not assumed from a command's exit code. This discipline prevents the cascade where step 7 silently fails and step 8 is executed on an invalid state.",
  },
];
