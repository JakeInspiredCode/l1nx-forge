import type { MCQuestion } from "@/lib/types/campaign";

// ops-m04 "Documentation & Runbooks" — covers ops-s7 (Runbooks, SOPs) + ops-s8 (Post-Incident Reviews)

export const OPS_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "ops-m04-q01",
    question:
      "A veteran on-call says: \"I don't really use runbooks, I just know this stuff.\" The team treats this as a sign of seniority. Why is it actually a risk, and what's the constructive move?",
    choices: [
      { label: "A", text: "Classic key-person risk — when knowledge lives in one head, MTTR on scenarios they're absent for is catastrophic. Fix: pair the veteran with a writer/junior to extract runbooks. The veteran's expertise scales because the team can act on it when they're not there" },
      { label: "B", text: "It's not a risk; senior engineers shouldn't need docs" },
      { label: "C", text: "Make the veteran write all runbooks alone at night" },
      { label: "D", text: "Replace the veteran with a less senior engineer" },
    ],
    correctAnswer: "A",
    explanation:
      "Expertise trapped in one person's head is the #1 operational risk on small ops teams. The fix isn't to punish the veteran — their knowledge is valuable. It's to *extract* that knowledge into shared documents. Pair programming the runbook writing (\"walk me through what you do when…\") is a concrete tactic that respects the veteran's skill and scales it to the team. Seniority is measured in part by how much of your knowledge is shared rather than private.",
  },
  {
    id: "ops-m04-q02",
    question:
      "Which of the following is the best structure for an operational runbook?",
    choices: [
      { label: "A", text: "Title + scope; Prerequisites; Symptoms; Numbered steps with expected output for each; Validation; Rollback; Escalation; Related links" },
      { label: "B", text: "A paragraph describing the scenario in prose" },
      { label: "C", text: "Just a list of commands" },
      { label: "D", text: "A link to the engineer who knows about it" },
    ],
    correctAnswer: "A",
    explanation:
      "A good runbook is executable by someone who's never seen this scenario before, as long as they can read carefully. That means: clear scope and symptoms (so the reader knows this is the right doc), prerequisites (what they need before starting), numbered explicit steps with validation (what success looks like at each step), rollback (if they make it worse), and escalation (who to call and when). Missing any of these leaves the on-call guessing — and guessing under pressure is how the runbook fails.",
  },
  {
    id: "ops-m04-q03",
    question:
      "During a P2 incident, you open a runbook. Step 4 tells you to run an `ipmitool` command, and it fails with `Error: Unable to establish LAN session`. The runbook has no branch for this. What do you do in the moment, and what do you do afterward?",
    choices: [
      { label: "A", text: "In the moment: escalate or work around — try the BMC web UI, SSH to a bastion, involve NetEng for the mgmt VLAN. Priority is still service recovery. Afterward: file a runbook update adding the \"what if ipmitool fails\" branch. Every undocumented edge case you hit is one you or a teammate will hit again" },
      { label: "B", text: "Stop and wait until the runbook is updated before acting" },
      { label: "C", text: "Follow the next step anyway" },
      { label: "D", text: "File a complaint about the runbook author" },
    ],
    correctAnswer: "A",
    explanation:
      "Runbooks are tools, not commandments. When one fails mid-incident, the priority is still service recovery — escalate, try alternatives, keep the bridge moving. Afterwards is where the discipline lives: file an update. Runbooks improve via exactly this feedback loop — an on-call hits an edge case, writes the branch, next on-call benefits. Teams that don't close this loop end up with runbooks that rot faster than they improve.",
  },
  {
    id: "ops-m04-q04",
    question:
      "What's \"runbook drift,\" and what operational practices prevent it?",
    choices: [
      { label: "A", text: "Drift = the gap between what the runbook says and what the system actually does. Tools/hosts/commands change and the doc doesn't. Prevention: date every runbook (last-reviewed), expire after 6–12 months without review, assign a single owner, link to living dashboards/tools (broken links become obvious), and test via tabletop exercises or game days" },
      { label: "B", text: "Drift is an unrelated weather phenomenon" },
      { label: "C", text: "Drift is prevented by having more runbooks" },
      { label: "D", text: "Drift is unavoidable and can't be mitigated" },
    ],
    correctAnswer: "A",
    explanation:
      "Runbook drift is the silent killer: a doc that's \"there\" but is two years out of date — wrong tool names, deprecated commands, former employees. The key practices: date-stamp last review, explicit ownership, automatic expiry flags, linked live resources (so breaking changes fail visibly), and periodic testing via tabletop/game days. Without those, runbooks become a false comfort that hurts MTTR when they're actually needed.",
  },
  {
    id: "ops-m04-q05",
    question:
      "A PIR concludes: \"Root cause: Alice ran `rm -rf /var/lib/postgresql` by accident. Action item: Alice will be more careful.\" What's wrong with this, and what's the version that actually fixes the system?",
    choices: [
      { label: "A", text: "This is the textbook non-blameless PIR failure — it assigns blame instead of analyzing the system. A good version: Root cause = unrestricted `rm -rf` executed against a critical directory with no confirmation prompt, in an environment where prod and staging shells are visually identical. Action items: safer wrappers, colored prompts/banners distinguishing prod, paired-engineer approval for destructive operations" },
      { label: "B", text: "It's fine — individual accountability matters" },
      { label: "C", text: "Remove all mention of Alice" },
      { label: "D", text: "Assign the issue to Alice alone to fix" },
    ],
    correctAnswer: "A",
    explanation:
      "A PIR that stops at \"the operator was careless\" stopped too early. The real question is *what system let a tired person at 02:30 cause this damage with no safeguard?* That produces fixes — wrappers, prompts, banners, paired approval — that remove the entire failure class, not just this one engineer's next attempt to be careful. Blameless means focused on the system, not exempting bad behavior.",
  },
  {
    id: "ops-m04-q06",
    question:
      "Your team runs thorough PIRs with good documentation and clear action items. Six weeks later, the exact same incident happens. What most likely went wrong, and how do you run things differently next time?",
    choices: [
      { label: "A", text: "Action items weren't actually done — they were filed, deprioritized against features, and faded. Fix: track PIR action items in the same backlog as regular work with explicit priority, weekly ops review to check progress, and auto-reopen the original PIR with highest priority if the issue recurs. PIR writing is easy; PIR follow-through is the discipline" },
      { label: "B", text: "The documentation wasn't good enough" },
      { label: "C", text: "A new team member caused it" },
      { label: "D", text: "Incidents always recur; that's the cost of doing business" },
    ],
    correctAnswer: "A",
    explanation:
      "The most common PIR failure mode is *completion gap*: the review was thorough, action items were written, but nothing was actually shipped. They compete with feature work and lose silently. The fix is structural: track action items in the planning backlog with explicit priority, protect time for them in the weeks after an incident, and auto-reopen on recurrence. Teams that treat action items as suggestions have flat reliability curves; teams that treat them as commitments trend improving.",
  },
  {
    id: "ops-m04-q07",
    question:
      "Why is \"If it isn't documented, it didn't happen\" a useful operational rule, rather than just bureaucratic pedantry?",
    choices: [
      { label: "A", text: "Because a fix in chat history is unfindable in six months; a runbook step that works but isn't written down will be re-invented every incident; an action taken without a ticket has no owner and no tracking. Documentation isn't paperwork — it's the institutional memory that makes the team scale beyond the current on-call's head" },
      { label: "B", text: "Because external auditors require it" },
      { label: "C", text: "Because documentation is a performance metric" },
      { label: "D", text: "It's not useful — it's bureaucratic overhead" },
    ],
    correctAnswer: "A",
    explanation:
      "The rule is about memory, not paperwork. Chat messages scroll off; tribal knowledge walks out when people leave; fixes applied without a ticket are invisible to the next on-call. Treating every change, every action, every lesson as worth documenting transforms incidents from private lore into shared capability. It's the difference between a team that gets better each year and one that repeats its mistakes.",
  },
  {
    id: "ops-m04-q08",
    question:
      "The \"5 whys\" technique asks *why* iteratively to find systemic causes. What's the discipline behind doing it well, and what's the classic failure mode?",
    choices: [
      { label: "A", text: "Discipline: push beyond the technical trigger until you hit an organizational, process, or design cause. Failure mode: stopping at the first plausible answer (usually the technical cause) and writing a PIR that blames a single component or person. The value is in the last 1–2 whys that reveal the organizational problem — a deprioritized safety-tool task, an untracked planned-but-not-done backlog, a missing process" },
      { label: "B", text: "Ask exactly 5 whys, no more, no less" },
      { label: "C", text: "Skip if the cause is obvious" },
      { label: "D", text: "Only use 5 whys for P1 incidents" },
    ],
    correctAnswer: "A",
    explanation:
      "The technique isn't the literal count — it's the *discipline of not stopping early*. The first why usually reaches the technical trigger (\"BGP peer dropped\"), which is a shallow answer. The valuable whys are the last ones that reveal organizational causes: \"why wasn't this caught?\" → \"validation wasn't built\" → \"it was planned but deprioritized\" → \"we don't track planned-but-not-done safety work.\" Those deeper causes produce action items that prevent whole classes of incident, not just the specific one you just had.",
  },
];
