"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Nav from "@/components/nav";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStories } from "@/lib/convex-hooks";

const DEFAULT_STORIES = [
  { storyId: "story-1", question: "Why xAI?", framework: "Mission + Scale + Background Fit",
    answer: "xAI's mission to understand the true nature of the universe resonates deeply with me. Colossus represents the most ambitious infrastructure build in AI — 100K+ GPUs operating as a single system. My background combines military discipline and rapid deployment experience with hands-on data center operations at Meta. I thrive in high-stakes environments where speed and precision both matter. xAI's culture of moving fast and building big is exactly where I want to be." },
  { storyId: "story-2", question: "Tell me about a time you worked under pressure.", framework: "STAR — Military Training",
    answer: "**Situation**: During a field exercise, our communications equipment failed 2 hours before a critical coordination window with allied units.\n\n**Task**: As the communications lead, I needed to restore comms or establish an alternative before the window closed.\n\n**Action**: I triaged the equipment, identified the failed component (antenna amplifier), and jury-rigged a solution using a backup unit from a different system. Simultaneously, I established a relay through a neighboring unit's equipment as a backup plan. I communicated status to command every 15 minutes.\n\n**Result**: Comms were restored 40 minutes before the window. The coordination went smoothly. I documented the failure mode and the fix, which became part of our unit's emergency procedures." },
  { storyId: "story-3", question: "Describe a process you improved.", framework: "STAR — Automation / Efficiency",
    answer: "**Situation**: The server provisioning process was largely manual — technicians followed a 47-step checklist on paper, leading to inconsistencies and an average provisioning time of 4 hours per server.\n\n**Task**: I was tasked with reducing provisioning time and error rate for a new deployment wave of 200 servers.\n\n**Action**: I analyzed the checklist, identified 30 steps that could be automated, and wrote a provisioning script that handled BIOS configuration, OS installation, network setup, and validation checks. I tested the script on 5 servers, iterated on edge cases, then trained the team.\n\n**Result**: Provisioning time dropped from 4 hours to 45 minutes per server. Error rate went from ~12% to under 2%. The 200-server deployment finished 3 days ahead of schedule." },
  { storyId: "story-4", question: "How do you handle documentation and handoffs?", framework: "Process + Tools + Examples",
    answer: "I treat documentation as a force multiplier. If I fix something at 2 AM, the next person on shift should be able to handle the same issue without calling me. My approach: I maintain runbooks for every recurring procedure with step-by-step instructions, expected outputs, and rollback procedures. I use ticketing systems (Jira/ServiceNow) for every change, linking to the relevant runbook. For handoffs, I use a structured template: current state, pending actions, known issues, and escalation paths." },
  { storyId: "story-5", question: "What would your first 30 days look like?", framework: "Learn / Shadow / Document / Ship",
    answer: "**Week 1 — Learn**: Absorb everything. Understand the physical layout, systems inventory, monitoring stack, escalation procedures, and team norms. Read every runbook.\n\n**Week 2 — Shadow**: Ride along with experienced technicians on every type of task. Observe how the team handles incidents. Start building mental models of common failure patterns.\n\n**Week 3 — Document**: Fill documentation gaps I noticed in weeks 1-2. Update outdated runbooks. Start a personal knowledge base of tribal knowledge.\n\n**Week 4 — Ship**: Take on tasks independently with a senior tech as backup. Complete at least one server deployment, one troubleshooting ticket, and one maintenance procedure solo." },
  { storyId: "story-6", question: "Why should we hire you?", framework: "Military + Technical + Builder Mindset",
    answer: "Three things set me apart. First, **military discipline** — I've operated under pressure in environments where mistakes have real consequences. I'm reliable, punctual, and I don't cut corners. Second, **technical depth** — I've built and maintained data center infrastructure hands-on. I understand servers, networking, power, and cooling not just theoretically but from turning wrenches and running cables. Third, **builder mindset** — I don't just maintain systems, I improve them. I automate repetitive tasks, document tribal knowledge, and look for ways to reduce MTTR. Colossus needs people who can operate at scale with that combination of reliability and initiative. That's me." },
];

export default function StoriesPage() {
  const convexStories = useStories();
  const upsertStory = useMutation(api.forgeStories.upsert);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [seeded, setSeeded] = useState(false);

  // Seed default stories if DB is empty
  useEffect(() => {
    if (convexStories.length === 0 && !seeded) {
      setSeeded(true);
      DEFAULT_STORIES.forEach((s) => upsertStory(s));
    }
  }, [convexStories.length, seeded, upsertStory]);

  const stories = convexStories.length > 0 ? convexStories : DEFAULT_STORIES;

  const startEdit = (story: typeof stories[number]) => {
    setEditing(story.storyId);
    setEditText(story.answer);
  };

  const saveEdit = (story: typeof stories[number]) => {
    upsertStory({ storyId: story.storyId, question: story.question, framework: story.framework, answer: editText });
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-forge-bg"><Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-2 mono">Story Bank</h1>
        <p className="text-forge-text-dim text-sm mb-6">Pre-loaded behavioral answer frameworks. Edit and refine for your background.</p>
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.storyId} className="bg-forge-surface border border-forge-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-lg">{story.question}</h2>
                  <span className="text-xs text-forge-accent mono">{story.framework}</span>
                </div>
                <button onClick={() => editing === story.storyId ? saveEdit(story) : startEdit(story)}
                  className="text-xs px-3 py-1 rounded border border-forge-border hover:border-forge-accent text-forge-text-dim hover:text-forge-accent transition-colors">
                  {editing === story.storyId ? "Save" : "Edit"}
                </button>
              </div>
              {editing === story.storyId ? (
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={12}
                  className="w-full bg-forge-surface-2 border border-forge-border rounded-lg p-4 text-sm resize-y focus:border-forge-accent focus:outline-none" />
              ) : (
                <div className="markdown-content text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{story.answer}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
