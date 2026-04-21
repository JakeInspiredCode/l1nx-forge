import type { MCQuestion } from "@/lib/types/campaign";

// scl-m04 "Hyperscale, Colo, Enterprise, Edge" — covers scl-s7 (Four operating models) + scl-s8 (Regions, AZs, glossary)

export const SCL_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "scl-m04-q01",
    question:
      "You're transitioning from a hyperscale DC (where automation pushes firmware to 10,000 identical servers in a day) to a colocation facility (where you do remote hands across 40 different customer environments). What's the most important mental shift?",
    choices: [
      { label: "A", text: "Nothing — fleet automation translates directly" },
      { label: "B", text: "**The blast-radius model inverts.** Hyperscale rewards automation moving fast across a fleet of identical nodes under one change-control framework. Colo demands **precision at the individual touch** across many different customer ecosystems, each with its own change processes, tooling, and risk tolerance. You cannot \"push to many\"; you execute discrete, customer-specific tickets with precise per-touch audit trails. The discipline shifts from \"scale through automation\" to \"precision at the individual action\"" },
      { label: "C", text: "Slow everything down by 10×" },
      { label: "D", text: "Stop using tickets entirely" },
    ],
    correctAnswer: "B",
    explanation:
      "Hyperscale and colo demand different muscles. Hyperscale = safe automation over fleets; colo = precise execution across many environments. Applying hyperscale speed in a colo is reckless; applying colo deliberation at hyperscale is slow.",
  },
  {
    id: "scl-m04-q02",
    question:
      "A customer buys \"multi-AZ\" deployment for their workload in AWS us-east-1. Six weeks later, a regional BGP issue at the us-east-1 edge makes the whole region unreachable from the internet. What happens to the customer's workload?",
    choices: [
      { label: "A", text: "Nothing — multi-AZ protects them from everything" },
      { label: "B", text: "**It's unreachable.** Multi-AZ protects against **facility-level failures within the region** — fire, power, cooling, or switchgear at one AZ. It does *not* protect against **region-level events** like edge BGP issues, metropolitan utility failures, or regional network splits. For those, customers need **multi-region** deployments with DNS / traffic-routing failover. Multi-AZ is cheaper but has a region-sized ceiling on what it can survive" },
      { label: "C", text: "AZs automatically migrate to another region" },
      { label: "D", text: "The customer is never affected by BGP issues" },
    ],
    correctAnswer: "B",
    explanation:
      "Multi-AZ is a facility-isolation feature; region-level events exceed its scope. Customers who need protection above the region level buy multi-region — with the cost, latency, and complexity that implies. Match the isolation level to the failure modes you want to survive.",
  },
  {
    id: "scl-m04-q03",
    question:
      "A customer asks: \"What's the difference between a **region** and an **Availability Zone**?\" What's the clearest explanation?",
    choices: [
      { label: "A", text: "They're the same thing, just different names" },
      { label: "B", text: "A **region** is **geographic** — a metropolitan area or broader (AWS us-east-1 = N. Virginia). An **AZ** is an **isolated failure domain** within the region — one or more physically separated DCs with **independent power, cooling, and network** entry points. Latency is low within a region (typically < 5 ms between AZs) and higher between regions. Customers deploy multi-AZ for facility-level isolation; multi-region for regional-level isolation. The region is *where*; the AZ is *how-isolated*" },
      { label: "C", text: "A region is a building; an AZ is a rack" },
      { label: "D", text: "A region is smaller than an AZ" },
    ],
    correctAnswer: "B",
    explanation:
      "Region = geography. AZ = isolation. Cloud customers conflate these constantly; the distinction shapes what their multi-AZ / multi-region deployments actually protect against.",
  },
  {
    id: "scl-m04-q04",
    question:
      "Why do hyperscale operators frequently use **OCP (Open Compute Project)** hardware instead of brand-name Dell or HPE servers?",
    choices: [
      { label: "A", text: "OCP is cheaper per unit with no tradeoffs" },
      { label: "B", text: "**OCP optimizes for fleet-level TCO** — it strips out features the hyperscaler doesn't need (decorative bezels, certain redundancies they handle elsewhere, vendor warranty structures they replace with spares-on-shelf) in exchange for cheaper, more serviceable gear. It makes sense when you have racks of 10,000+ identical machines and a deep ops investment. Dell/HPE optimize for customers with a small number of servers; OCP optimizes for customers with a million. **At enterprise scale, OCP usually doesn't make sense** — you don't have the ops investment to replace vendor support" },
      { label: "C", text: "OCP is open source so it's always better" },
      { label: "D", text: "Hyperscalers build their own CPUs inside OCP boxes" },
    ],
    correctAnswer: "B",
    explanation:
      "OCP is a fleet-economics play. The tradeoffs only make sense at hyperscale — specifically, when you have the ops scale to internalize what vendor support would otherwise do. Trying to use OCP-style approaches in a 50-server enterprise site is how you end up with no support path when something breaks.",
  },
  {
    id: "scl-m04-q05",
    question:
      "What is **remote hands**, and why is precision so important in that workflow?",
    choices: [
      { label: "A", text: "A type of automation in hyperscale facilities" },
      { label: "B", text: "**Facility staff executing physical tasks on customer-owned equipment**, guided by the customer's remote ops team (which is often in a different city, country, or continent). Classic tasks: reseat a cable, swap a drive, photograph a rack, power-cycle a device. Precision matters because **the customer cannot see what you see** — trust is built through ticket clarity, read-backs (\"I'm about to reseat the NIC in slot 3 of r17-03, top position, confirm\"), and before/after photographs. Improvisation destroys trust; precision builds the colo relationship" },
      { label: "C", text: "A type of firmware update" },
      { label: "D", text: "A billing category for emergency response" },
    ],
    correctAnswer: "B",
    explanation:
      "Remote hands is the core colo-specific workflow. Facility techs have physical access the customer doesn't; the customer has context the techs don't. Bridging that gap cleanly — via precise language, read-backs, and photos — is a significant professional skill.",
  },
  {
    id: "scl-m04-q06",
    question:
      "A growing fraction of edge infrastructure runs at **dark sites** — facilities with no on-site staff. Which of the following is a core discipline that dark-site operations rely on?",
    choices: [
      { label: "A", text: "Assuming techs will visit weekly for maintenance" },
      { label: "B", text: "**Remote-management-everything**: every device reachable via BMC/IPMI on an out-of-band network so a wedged server can be recovered without a site visit. **Spares on shelf** labeled clearly so a visiting tech can swap anything flagged. **Runbooks before visits** so the tech (often unfamiliar with this specific site) can execute precisely. **Tolerating longer MTTR** — topologies must stay functional during degraded periods because replacing a failed component may take days" },
      { label: "C", text: "Putting larger servers in place of multiple smaller ones" },
      { label: "D", text: "Eliminating redundancy to save cost" },
    ],
    correctAnswer: "B",
    explanation:
      "Dark-site operations depend on shifting work from reactive on-site response to proactive remote management, spare provisioning, and runbook authorship. The topology itself has to tolerate degraded states because fast repair isn't available.",
  },
  {
    id: "scl-m04-q07",
    question:
      "You're joining a new DC tech team and want to orient quickly. Which three questions give you the most context on day one?",
    choices: [
      { label: "A", text: "Where's the break room, when is payday, what's the dress code?" },
      { label: "B", text: "**(1) Which operating model is this — hyperscale, colo, enterprise, or edge?** Answers everything about process, pace, and culture. **(2) What tier is this facility, and is it certified or designed-to?** Tells you what maintenance is possible without downtime and which failure modes the facility expects to survive. **(3) What's the rack density — kW per rack, largest single-rack load?** Distinguishes traditional 5–10 kW from modern 30–60+ kW AI-DC environments, which changes everything about cooling, power, network, and equipment handling" },
      { label: "C", text: "How many techs are on shift, what's the break policy, which PPE is required?" },
      { label: "D", text: "What's the CEO's email, how do I escalate, who's the head of HR?" },
    ],
    correctAnswer: "B",
    explanation:
      "Model, tier, density — those three answers land you in the right mental model on day one. Everything else (vocabulary, hierarchy, blast radius, process) fits inside those three.",
  },
  {
    id: "scl-m04-q08",
    question:
      "A DC tech with strong enterprise experience is joining a hyperscaler. What's the biggest cultural shift they should prepare for?",
    choices: [
      { label: "A", text: "Slower pace and more review per change" },
      { label: "B", text: "**Velocity and the role of automation as the primary safety mechanism.** Enterprise (ITIL) shops rely on human review — CAB meetings, multi-step approvals — which handles a handful of changes per week. Hyperscale relies on **automation guardrails and canary rollouts**: validate the change in code, push to 1 node, observe 10 min, push to 100, push to 10,000. The safety review is automated and probabilistic instead of human and sequential. Initially feels reckless — it isn't; it's just a different shape of the same discipline. The skill (don't break production) is the same; the *shape* of how that skill is expressed is radically different" },
      { label: "C", text: "Learning a new operating system" },
      { label: "D", text: "Nothing significant changes" },
    ],
    correctAnswer: "B",
    explanation:
      "The hardest cultural shift for an experienced enterprise tech moving to hyperscale is trusting automation as the safety layer instead of requiring human review of each individual change. Same discipline, very different shape — and a 3–6 month ramp is normal even for strong techs.",
  },
];
