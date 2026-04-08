"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@/lib/convex-shim";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Chunk = { label: string; summary: string; content: string };
type Story = {
  storyId: string;
  question: string;
  framework: string;
  answer: string;
  chunks?: Chunk[];
};

const DEFAULT_STORIES: Story[] = [
  {
    storyId: "story-1",
    question: "Tell me about yourself.",
    framework: "~85s — Identity + Background + Thread",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Who I am now",
        content:
          "I'm Jacob Sumsion. I lead the server break-fix team at Meta's Eagle Mountain campus — 1M+ servers across three data centers, including the GPU fleet running AI training and inference. My day-to-day is building and running the team: hiring, onboarding, training, scheduling, 1-on-1s, and driving MTTD/MTTR improvements. When the hard problems hit — the ones my techs can't crack — I'm the escalation point.",
      },
      {
        label: "B",
        summary: "Where I came from",
        content:
          "Before Meta I built the automation engineer function from scratch at NICE inContact — took a role that didn't exist and created the pipeline end-to-end, cutting hundreds of hours of manual NOC work. Before that, seven years in the Army — Armored Crewman and Counterintelligence Special Agent, TS/SCI clearance, deployments to Iraq and Afghanistan.",
      },
      {
        label: "C",
        summary: "The thread + closer",
        content:
          "What connects all of it: I build systems that make operations faster and more reliable — training programs from zero, a published iOS app for hardware identification, figuring out how to do more with less and keep good people. **xAI is building at a scale and speed that matches how I operate, and Colossus is the mission I want to be part of.**",
      },
    ],
  },
  {
    storyId: "story-2",
    question: "Why xAI / Why this role?",
    framework: "~72s — Scale + Speed + Mission",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Scale",
        content:
          "Three reasons. First, scale — Colossus is the largest GPU training cluster on the planet, pushing toward a million GPUs with gigawatt-scale power and liquid cooling as standard. I've led teams at the 1M-server level at Meta, so I understand what fleet-scale operations demand — both the technical problems and the people problems.",
      },
      {
        label: "B",
        summary: "Speed",
        content:
          "Second, speed — Colossus 1 stood up in 122 days. That's a pace where every hour of MTTR matters and initiative gets rewarded instead of routed through six approval layers. My background building roles and processes from zero means I produce in ambiguity, not despite it.",
      },
      {
        label: "C",
        summary: "Mission + family",
        content:
          "Third, mission — **I want to work where reducing MTTD by five minutes on a rack of GPUs translates directly into recovered training throughput for Grok.** My family and I are ready for the move to Memphis because this is the work that matters most to me right now.",
      },
    ],
  },
  {
    storyId: "story-3",
    question: "Walk me through your current role and biggest impact.",
    framework: "~88s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation",
        content:
          "**S:** I lead the break-fix team at Meta — 1M+ servers across three data centers, including GPU nodes for AI training and inference. My scope is the full team lifecycle: hiring, onboarding, scheduling, 1-on-1s, performance. I'm also the escalation point for problems my techs can't resolve.",
      },
      {
        label: "B",
        summary: "Task",
        content:
          "**T:** When I came in, troubleshooting was inconsistent. No structured training cadence, tribal knowledge walked out with every departure, and retention was a challenge — people leave faster when they don't feel like they're growing.",
      },
      {
        label: "C",
        summary: "Action",
        content:
          "**A:** I built a weekly training curriculum from scratch — hardware diagnostics, electrical, networking, security. That addressed the skill gap and the retention problem together. Then I saw techs couldn't ID FRU components by sight, causing chain-of-custody errors on data-bearing drives. So I taught myself Swift and published a native iOS app — photo quizzes, FRU modules, chain-of-custody training — on my own time, zero budget.",
      },
      {
        label: "D",
        summary: "Result + thesis",
        content:
          "**R:** **Junior techs started resolving issues that previously escalated to me.** Chain-of-custody errors dropped. The app became a team standard. And training cadence helped retention. That's the multiplier: I don't just fix servers, I build the team that fixes servers.",
      },
    ],
  },
  {
    storyId: "story-4",
    question: "Tell me about a time you resolved a critical issue under pressure.",
    framework: "~85s — STAR + Escalation",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation",
        content:
          "**S:** P1 at Meta — a batch of GPU nodes dropped out of the training pool simultaneously. Multiple racks, tickets flooding in, and my team was troubleshooting per-node.",
      },
      {
        label: "B",
        summary: "Task",
        content:
          "**T:** I needed to take over triage, determine systemic versus independent failures, and restore compute before the training run's checkpoint window closed.",
      },
      {
        label: "C",
        summary: "Action",
        content:
          "**A:** I pulled the team off individual tickets and triaged at the fleet level: BMC/IPMI data across affected nodes for common indicators, then fiber light levels across the racks. Pattern jumped out — contaminated connectors on recently re-cabled patch panels. I directed the team to clean and verify every connector in the affected rows instead of chasing per-node symptoms.",
      },
      {
        label: "D",
        summary: "Result",
        content:
          "**R:** **Detection to full restoration in under an hour on 200+ nodes — previous incidents of that class took 4+ hours with per-node troubleshooting.** Wrote the runbook entry with photos, added a mandatory post-recable inspection to the SOP.",
      },
      {
        label: "E",
        summary: "Escalation example",
        content:
          "Separately — I had a GPU that refused firmware upgrades no matter what we tried. I worked it as an escalation, exhausted our options, and filed directly with the firmware provider. That's my lane: the problems that stump the team come to me.",
      },
    ],
  },
  {
    storyId: "story-5",
    question: "Describe a process improvement or automation you drove.",
    framework: "~66s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** At NICE inContact, the NOC was burning hundreds of hours per month on manual tasks — health checks, incident responses, config verifications. The automation engineer role didn't exist. I was hired as a tools engineer and saw the gap.",
      },
      {
        label: "B",
        summary: "Action",
        content:
          "**A:** I built the function from the ground up — pipeline from user story intake through delivery. Created runbooks on Splunk, BMC, and Rundeck so the NOC could self-serve on observability and automated response. Every automation shipped with documentation and training so the team owned it after handoff.",
      },
      {
        label: "C",
        summary: "Result + bridge",
        content:
          "**R:** **Eliminated hundreds of hours of manual work per month — NOC went from reactive firefighting to proactive monitoring.** Same muscle I'll apply at Colossus: if three techs do a diagnostic step manually every shift, I script it and document it so the whole team benefits.",
      },
    ],
  },
  {
    storyId: "story-6",
    question: "Tell me about a time you showed initiative without being asked.",
    framework: "~62s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** At Meta, technicians were struggling to identify FRU components by sight across different server generations — causing break-fix delays and chain-of-custody errors on data-bearing drives. No training tool existed for visual identification.",
      },
      {
        label: "B",
        summary: "Action",
        content:
          "**A:** On my own time, I taught myself Swift — no prior iOS experience — designed the app, built photo-based quizzes for every major FRU type and ERAD component, included chain-of-custody flows, and published it to the App Store.",
      },
      {
        label: "C",
        summary: "Result + identity",
        content:
          "**R:** **Zero budget, zero permission, published production app that became a team standard.** Directly reduced risk of mishandled storage — which at hyperscale is a security and compliance issue, not just efficiency. That's my default: see a gap, build the fix, ship it.",
      },
    ],
  },
  {
    storyId: "story-7",
    question: "How do you handle documentation, SOPs, and handoffs?",
    framework: "~82s — Process + Culture",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** At Meta, constant team rotation — new techs arriving, experienced ones leaving. Without living documentation, every departure takes institutional knowledge and every arrival resets the learning curve.",
      },
      {
        label: "B",
        summary: "Action — methodology",
        content:
          '**A:** I built the documentation culture on my team. The training curriculum I created comes with SOPs. I trained my techs to document during the fix, not after — purpose, steps, verification, rollback. When I take an escalation, I model it: the P1 fiber runbook I wrote has photos of contaminated versus clean connectors — because at 3 a.m. a tech needs visual reference, not paragraphs. I also review my team\'s docs and give feedback, because if a runbook only makes sense to the author, it\'s not a runbook.',
      },
      {
        label: "C",
        summary: "Result",
        content:
          "**R:** **Junior techs resolving issues independently that used to escalate to me — because the docs are specific enough to follow without guessing.** Every issue solved without calling me proves the documentation works. At Colossus I'll be writing the ops playbook during construction — that's when documentation has the highest leverage.",
      },
    ],
  },
  {
    storyId: "story-8",
    question: "Describe a time you coordinated cross-functionally.",
    framework: "~65s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** At Meta, 20+ tickets had accumulated involving hardware, network, provisioning, and engineering — each touching multiple owners, no coordinator. Queue growing, SLA clocks running.",
      },
      {
        label: "B",
        summary: "Action",
        content:
          "**A:** I triaged the entire queue — linked related tickets to stop duplicate work, added context to each escalation so receiving teams could act without questions, built filtered views so every team had a live picture of their piece. Held a 15-minute standup with the four team leads to align priorities.",
      },
      {
        label: "C",
        summary: "Result + Jira bridge",
        content:
          "**R:** **Cleared the backlog 40% faster than SLA.** The filtered views and labeling convention stuck after that sprint. I also have direct Jira experience from leading support and success at Stellar Cyber, so I'm comfortable in whatever ticketing system xAI uses.",
      },
    ],
  },
  {
    storyId: "story-9",
    question: "What does your first 30 days look like?",
    framework: "~62s — Week-by-week",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Week 1",
        content:
          "Days 1–7: Get my hands dirty again. Shadow senior techs on every rack-and-stack, fiber run, liquid cooling check, break-fix call. Learn the Colossus tooling, monitoring stack, and ticket workflows. I'm coming from a lead role, so I need to re-earn hands-on credibility — and I'm eager to.",
      },
      {
        label: "B",
        summary: "Week 2",
        content:
          "Days 8–15: Start owning tickets with oversight. Document three processes I observe — not to critique, but to capture knowledge that may only exist in people's heads. Submit as draft SOPs for team review.",
      },
      {
        label: "C",
        summary: "Weeks 3–4 + thesis",
        content:
          "Days 16–30: Own a full ticket backlog independently. Ship one automation or script with documentation. Present a baseline MTTD/MTTR analysis with one concrete improvement recommendation. **The pattern: absorb, document, then ship.**",
      },
    ],
  },
  {
    storyId: "story-10",
    question: "Conflict or disagreement with a teammate.",
    framework: "~61s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** At Meta, a teammate wanted to skip chain-of-custody verification on data-bearing drives during a high-volume decommission sprint — we were behind on timeline. I needed to maintain the security requirement without damaging the relationship or blowing the deadline.",
      },
      {
        label: "B",
        summary: "Action",
        content:
          '**A:** Pulled him aside privately. Walked through a past incident where a mishandled drive created a compliance escalation. Then: "Let\'s solve both problems." We co-wrote a 2-minute streamlined checklist that preserved every critical verification but cut non-essential paperwork. I offered to run the first batch with him so it wasn\'t just my idea imposed on his workflow.',
      },
      {
        label: "C",
        summary: "Result + principle",
        content:
          '**R:** **Checklist became team standard. Relationship stayed strong. Zero compliance issues after.** The key: treat it as a shared engineering problem — "how do we go fast AND stay secure" — not a compliance lecture.',
      },
    ],
  },
  {
    storyId: "story-11",
    question: "How do you prioritize a queue of 20+ tickets?",
    framework: "~56s — Method",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "First pass",
        content:
          "First pass: severity. P1 and P2 to the top — anything impacting AI training uptime gets immediate attention because a down GPU rack bleeds compute every minute.",
      },
      {
        label: "B",
        summary: "Second pass",
        content:
          "Second pass: quick wins. If I can close three tickets in 15 minutes, I do it — clears mental load, reduces queue noise for cross-functional teams.",
      },
      {
        label: "C",
        summary: "Third pass",
        content:
          "Third pass: pattern detection. Are five of these the same root cause? Then I'm solving one problem, not five. That's where fleet-scale experience matters — at Meta with 1M+ servers, you look for the systemic signal before you start swapping parts.",
      },
      {
        label: "D",
        summary: "Throughout",
        content:
          "**Throughout: communicate status.** I update the ticket system in real time so no one is waiting without knowing where things stand. Silent queues breed escalations.",
      },
    ],
  },
  {
    storyId: "story-12",
    question: "Tell me about a mistake and how you handled it.",
    framework: "~60s — STAR",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Situation + Task",
        content:
          "**S/T:** Early in a rack deployment at Meta, I mislabeled a fiber run during a high-volume cabling session. If it shipped to provisioning, every troubleshooting step downstream would reference the wrong path.",
      },
      {
        label: "B",
        summary: "Action",
        content:
          "**A:** Caught it during POST verification before handoff. Owned it immediately. Re-cabled, corrected the label, then updated the labeling SOP with step-by-step photos and trained the team that same week.",
      },
      {
        label: "C",
        summary: "Result + principle",
        content:
          "**R:** **Turned a 10-minute error into a permanent process improvement.** The lesson: when you find a gap in the gate, you fix the gate — not just the instance.",
      },
    ],
  },
  {
    storyId: "story-13",
    question: "What excites you about the construction-phase environment?",
    framework: "~54s — Pattern match",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "What Colossus is",
        content:
          "Colossus is still writing the playbook — gigawatt-scale power, liquid cooling at Blackwell rack densities, hundreds of thousands of GPUs, a third site ramping in Southaven. The SOPs don't exist yet, and the people who build them define how the operation runs for years.",
      },
      {
        label: "B",
        summary: "Pattern from my career",
        content:
          "That's where I'm most productive. At NICE inContact I created a role that didn't exist. At Meta I created the training program from scratch. In the Army I operated where the manual hadn't been written because the situation was new.",
      },
      {
        label: "C",
        summary: "Thesis",
        content:
          "**I don't need a mature playbook to be effective — I write the playbook.** Colossus construction is where that skill has the highest leverage.",
      },
    ],
  },
  {
    storyId: "story-14",
    question:
      "How does your military background prepare you for on-call, physical demands, and schedule flexibility?",
    framework: "~45s — Credentials + Bridge",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "Physical credentials",
        content:
          "Seven years active duty — Iraq, Afghanistan, multiple stateside installations. 24/7 ops tempo was baseline. Height, high-noise, loads far heavier than 35 pounds, getting it done safely every time.",
      },
      {
        label: "B",
        summary: "Mental discipline bridge",
        content:
          "The Army also gave me structured decision-making under sleep deprivation and uncertainty — exactly what a 3 a.m. P1 call requires. You run the sequence: detect, isolate, diagnose, repair, verify, document. Military discipline is why that holds even when I'm tired.",
      },
      {
        label: "C",
        summary: "Closer",
        content:
          "**On-call, weekends, physical requirements — these aren't sacrifices. They're the operating conditions I was trained in.**",
      },
    ],
  },
  {
    storyId: "story-15",
    question: "Why should we hire you over other candidates?",
    framework: "~54s — Differentiator",
    answer: "",
    chunks: [
      {
        label: "A",
        summary: "What others have vs. what I bring",
        content:
          "Because I don't just maintain infrastructure — I build the systems around it. Other candidates will have hardware experience. I bring the combination: 1M-server fleet leadership at Meta, a published iOS training app built from scratch, an automation function created from zero at NICE inContact, seven years of military execution.",
      },
      {
        label: "B",
        summary: "How I reduce MTTD/MTTR",
        content:
          "I reduce MTTD and MTTR systematically — not by working faster on individual tickets, but by writing runbooks, building tools, and training the team so the entire operation improves. And I do it without being asked.",
      },
      {
        label: "C",
        summary: "Closer",
        content:
          "**Colossus needs operators who produce at construction speed. My track record is building from zero in every role I've held.** That's not a talking point — it's a pattern you can verify across my entire career.",
      },
    ],
  },
];

function ChunkBlock({
  chunk,
  forceHidden,
  onSave,
}: {
  chunk: Chunk;
  forceHidden: boolean;
  onSave: (updated: Chunk) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(chunk.content);
  const [editSummary, setEditSummary] = useState(chunk.summary);
  const isOpen = !forceHidden && open;

  const handleSave = () => {
    onSave({ ...chunk, content: editContent, summary: editSummary });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditContent(chunk.content);
    setEditSummary(chunk.summary);
    setEditing(false);
  };

  return (
    <div className="border border-forge-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => !forceHidden && setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
          forceHidden
            ? "opacity-40 cursor-default"
            : "hover:bg-forge-surface-2 cursor-pointer"
        }`}
      >
        <span className="text-forge-accent mono text-xs font-bold shrink-0 w-5">
          {chunk.label}
        </span>
        <span className="text-forge-text-dim">{chunk.summary}</span>
        {!forceHidden && (
          <span className="ml-auto text-forge-text-dim/50 text-xs shrink-0">
            {isOpen ? "▾" : "▸"}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-forge-border/30">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-forge-text-dim shrink-0">Summary:</label>
                <input
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="flex-1 bg-forge-surface-2 border border-forge-border rounded px-2 py-1 text-sm focus:border-forge-accent focus:outline-none"
                />
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full bg-forge-surface-2 border border-forge-border rounded-lg p-3 text-sm resize-y focus:border-forge-accent focus:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="text-xs px-3 py-1 rounded border border-forge-border text-forge-text-dim hover:text-forge-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs px-3 py-1 rounded border border-forge-accent text-forge-accent hover:bg-forge-accent/10 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chunk.content}
                </ReactMarkdown>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className="absolute top-0 right-0 text-xs px-2 py-0.5 rounded border border-forge-border text-forge-text-dim hover:text-forge-accent hover:border-forge-accent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoriesPage() {
  const convexStoriesRaw = useQuery(api.forgeStories.getAll);
  const upsertStory = useMutation(api.forgeStories.upsert);
  const [seeded, setSeeded] = useState(false);
  const [hiddenStories, setHiddenStories] = useState<Set<string>>(new Set());

  const isLoading = convexStoriesRaw === undefined;
  const convexStories = convexStoriesRaw ?? [];

  useEffect(() => {
    if (!isLoading && convexStories.length === 0 && !seeded) {
      setSeeded(true);
      DEFAULT_STORIES.forEach((s) => upsertStory(s));
    }
  }, [isLoading, convexStories.length, seeded, upsertStory]);

  const stories: Story[] =
    convexStories.length > 0
      ? convexStories.map((s) => ({
          storyId: s.storyId,
          question: s.question,
          framework: s.framework,
          answer: s.answer,
          chunks: s.chunks as Chunk[] | undefined,
        }))
      : DEFAULT_STORIES;

  const toggleHide = (storyId: string) => {
    setHiddenStories((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  const saveChunk = (story: Story, updatedChunk: Chunk) => {
    const newChunks = (story.chunks ?? []).map((c) =>
      c.label === updatedChunk.label ? updatedChunk : c
    );
    upsertStory({
      storyId: story.storyId,
      question: story.question,
      framework: story.framework,
      answer: story.answer,
      chunks: newChunks,
    });
  };

  const allHidden = hiddenStories.size === stories.length;
  const toggleAll = () => {
    if (allHidden) {
      setHiddenStories(new Set());
    } else {
      setHiddenStories(new Set(stories.map((s) => s.storyId)));
    }
  };

  return (
    <div className="min-h-screen bg-v2-bg-deep">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1 mono">Story Bank</h1>
            <p className="text-forge-text-dim text-sm">
              15 behavioral answers with collapsible chunks. Hide chunks to
              practice recall.
            </p>
          </div>
          <button
            onClick={toggleAll}
            className="text-xs px-3 py-1.5 rounded border border-forge-border hover:border-forge-accent text-forge-text-dim hover:text-forge-accent transition-colors shrink-0 mt-1"
          >
            {allHidden ? "Reveal All" : "Hide All"}
          </button>
        </div>

        <div className="space-y-5">
          {stories.map((story, idx) => {
            const isHidden = hiddenStories.has(story.storyId);
            const chunks = story.chunks ?? [];

            return (
              <div
                key={story.storyId}
                className="bg-forge-surface border border-forge-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-forge-text-dim/40 mono text-xs font-bold">
                      {idx + 1}.
                    </span>
                    <h2 className="font-semibold text-base leading-snug">
                      {story.question}
                    </h2>
                  </div>
                  <button
                    onClick={() => toggleHide(story.storyId)}
                    className="text-xs px-2.5 py-1 rounded border border-forge-border hover:border-forge-accent text-forge-text-dim hover:text-forge-accent transition-colors shrink-0 ml-3"
                  >
                    {isHidden ? "Show" : "Hide"}
                  </button>
                </div>
                <span className="text-xs text-forge-accent/70 mono ml-5 block mb-3">
                  {story.framework}
                </span>

                {!isHidden && chunks.length > 0 && (
                  <div className="space-y-1.5 ml-5">
                    {chunks.map((chunk) => (
                      <ChunkBlock
                        key={chunk.label}
                        chunk={chunk}
                        forceHidden={false}
                        onSave={(updated) => saveChunk(story, updated)}
                      />
                    ))}
                  </div>
                )}

                {!isHidden && chunks.length === 0 && story.answer && (
                  <div className="markdown-content text-sm leading-relaxed ml-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {story.answer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-forge-surface border border-forge-border rounded-xl p-5">
          <h2 className="font-semibold text-base mb-3 mono">Practice Notes</h2>
          <div className="text-sm text-forge-text-dim space-y-3">
            <div>
              <span className="text-forge-accent font-semibold">Drill daily:</span>{" "}
              Q1, Q2, Q4, Q15 — opener, "why xAI," pressure story, closer.
            </div>
            <div>
              <span className="text-forge-accent font-semibold">Drill 2x/week:</span>{" "}
              Q3, Q5, Q6, Q13 — strongest differentiators (iOS app, automation,
              construction fit).
            </div>
            <div>
              <span className="text-forge-accent font-semibold">Drill 1x/week:</span>{" "}
              Q7–Q12, Q14 — more formulaic, get the structure then let them
              flow.
            </div>
            <div className="pt-2 border-t border-forge-border/50 text-xs">
              <strong>Chunk practice:</strong> Deliver chunk [A] out loud until
              it flows. Chain A+B, then A+B+C. If any chunk takes &gt;20s of
              hesitation to start, isolate and drill it. If any answer runs past
              90s, cut the weakest sentence.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
