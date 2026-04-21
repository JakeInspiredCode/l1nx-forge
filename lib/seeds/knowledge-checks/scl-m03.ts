import type { MCQuestion } from "@/lib/types/campaign";

// scl-m03 "Data Center Tiers" — covers scl-s5 (Uptime Institute Tier I-IV) + scl-s6 (Redundancy notation & blast radius)

export const SCL_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "scl-m03-q01",
    question:
      "What is the single most important property that distinguishes **Tier III** from **Tier II**?",
    choices: [
      { label: "A", text: "Tier III has more generators" },
      { label: "B", text: "**Concurrent maintainability.** Tier II has redundant components (N+1 UPS modules, N+1 chillers) but only a single upstream path, so maintenance on that path requires downtime. Tier III has **multiple independent paths** — any component *or* any path can be taken offline for maintenance without disrupting IT load. This is the defining Tier III guarantee and the reason it's the most common tier for business-critical workloads" },
      { label: "C", text: "Tier III is always certified by the Uptime Institute" },
      { label: "D", text: "Tier III costs less to build than Tier II" },
    ],
    correctAnswer: "B",
    explanation:
      "Concurrent maintainability is the Tier III contract. It's what lets you swap a UPS battery string, service a chiller, or replace a PDU during business hours without a window. Tier II lacks this because the upstream path is still single.",
  },
  {
    id: "scl-m03-q02",
    question:
      "A customer asks: \"We're running in a **Tier III-designed** facility — is that the same as **Tier III Certified**?\" What's the correct answer?",
    choices: [
      { label: "A", text: "Yes — the terms are interchangeable" },
      { label: "B", text: "No. **\"Designed to\"** means the facility was *built* to meet Tier III topology requirements (concurrent maintainability, N+1, multiple paths) — self-claimed, usually accurate, but unaudited. **\"Certified\"** means Uptime Institute has been on site, inspected the topology, reviewed commissioning, and issued a certification that the facility both designed-to and operates-to Tier III. Certification costs real money and takes months; for workloads where the guarantee matters contractually, certification is what holds up — \"designed to\" is engineering commentary" },
      { label: "C", text: "Designed is stricter than certified" },
      { label: "D", text: "Only Tier IV can be certified" },
    ],
    correctAnswer: "B",
    explanation:
      "This distinction comes up in customer conversations constantly. Designed-to is a common, defensible claim; certified is a stronger, audited claim. Know which you have before signing contracts that reference it.",
  },
  {
    id: "scl-m03-q03",
    question:
      "A customer is choosing between Tier III and Tier IV for a new deployment. The CFO says \"always pick Tier IV because higher is better.\" What's the disciplined counter-argument?",
    choices: [
      { label: "A", text: "Tier IV is not actually more reliable" },
      { label: "B", text: "Tier IV costs **3–5× more** than Tier III to build and operate, and the availability gain is roughly 90 min/year (Tier III ~1.6 hr downtime/year vs Tier IV ~26 min). For workloads where the cost-of-downtime-per-hour is less than the Tier IV premium, Tier III is the disciplined choice. The right framework: compare **cost of downtime × permitted downtime delta** against **Tier IV capital + operating premium**, and pick the tier that matches the workload's actual availability requirement" },
      { label: "C", text: "Tier IV uses more power so it's worse" },
      { label: "D", text: "Higher tier is always better; the CFO is right" },
    ],
    correctAnswer: "B",
    explanation:
      "\"Always Tier IV\" is a budget mistake dressed as risk aversion. The 90 min/year gap is valuable for trading, critical healthcare, and life-safety — but most enterprise workloads can't justify the premium. Match tier to workload cost-of-downtime, not to what sounds best.",
  },
  {
    id: "scl-m03-q04",
    question:
      "A design document specifies **N+1** redundancy for the UPS system. The facilities lead claims this is sufficient for a new AI training cluster. What's the correct critique?",
    choices: [
      { label: "A", text: "N+1 is always enough" },
      { label: "B", text: "N+1 tolerates a **single component failure** — one UPS module can fail and cooling / power continues. It does *not* tolerate a **whole-path failure** (a switchgear fault, a maintenance window, a cascading issue in one UPS system taking the whole bus with it). For AI clusters with $10M+ of silicon per megawatt, a whole-path outage eats enormous business cost. **2N** — two fully independent paths, each capable of carrying full load alone — is the standard for AI DCs. The capital premium is paid back by zero-downtime path maintenance and whole-path fault tolerance" },
      { label: "C", text: "N+1 and 2N are identical" },
      { label: "D", text: "N+1 gives higher uptime than 2N" },
    ],
    correctAnswer: "B",
    explanation:
      "N+1 is about components; 2N is about paths. At modern AI economics, tolerating whole-path outages is existential. The industry has moved decisively to 2N for new AI-DC builds.",
  },
  {
    id: "scl-m03-q05",
    question:
      "Which statement most accurately describes the notation **2N+1**?",
    choices: [
      { label: "A", text: "Two sets of N+1" },
      { label: "B", text: "**Two fully independent complete systems (2N), plus one additional spare.** Example: if N=4 chillers needed, 2N+1 = 9 installed — two independent sets of 4, plus 1 spare that can join either set. Rare outside ultra-high-availability sites (critical trading, certain government), but used where the cost of downtime justifies both path redundancy *and* an additional component spare beyond it" },
      { label: "C", text: "Two independent systems with a backup UPS" },
      { label: "D", text: "The same as N+2" },
    ],
    correctAnswer: "B",
    explanation:
      "2N+1 stacks: 2N gives you two independent paths, and the +1 gives you one more spare on top. Not common, but a real specification for sites that need the absolute maximum redundancy.",
  },
  {
    id: "scl-m03-q06",
    question:
      "Before reseating a single fiber cable between a leaf and spine switch in a Tier IV facility, a senior engineer says \"Tier IV is fault-tolerant, so this is a non-event.\" What's the disciplined follow-up?",
    choices: [
      { label: "A", text: "Agree — Tier IV is always safe for network work" },
      { label: "B", text: "Ask: **\"What's the blast radius on the workload side?\"** Tier IV guarantees the *facility* survives a single failure; it doesn't protect the workload from a link flap that knocks RDMA fabrics into recovery, drops BGP sessions, or triggers storage-cluster healing. Verify the other spine uplink is healthy, routing failover is tested, and no single-homed devices hang off the leaf. **Tier protects the facility; blast radius protects the workload.** You need both" },
      { label: "C", text: "Power down the leaf first as a safety measure" },
      { label: "D", text: "Refuse to proceed — fiber work is always customer-impact" },
    ],
    correctAnswer: "B",
    explanation:
      "Tier and blast radius are complementary, not interchangeable. Tier is an infrastructure guarantee; blast radius is a per-action workload calculation. Great techs ask the blast-radius question on every step, regardless of tier.",
  },
  {
    id: "scl-m03-q07",
    question:
      "A rack has an RPP feeding it that the facilities team is about to replace during business hours. They claim it's safe because \"the rack is dual-corded and on a 2N topology.\" What's the most important thing to verify before you agree?",
    choices: [
      { label: "A", text: "Whether the new RPP is the same brand" },
      { label: "B", text: "**That the RPP only feeds one side of the rack's 2N topology — not both.** If the RPP feeds both A-side and B-side PDUs (a common misbuild), replacing it drops the whole rack, \"2N\" notwithstanding. Separately, audit the racks it feeds for **misplugs**: any server with both PSUs on the side this RPP feeds will go dark when the RPP is offline. Only after both audits is \"safe\" an honest description" },
      { label: "C", text: "Whether the team has the right tools" },
      { label: "D", text: "Whether the maintenance window is long enough" },
    ],
    correctAnswer: "B",
    explanation:
      "2N topology is a design intent that the physical installation must actually implement. An RPP that feeds both sides defeats the 2N guarantee; misplugs defeat the server-level A+B guarantee. Always audit both before trusting the topology claim.",
  },
  {
    id: "scl-m03-q08",
    question:
      "Which of the following is a correct pairing of notation and tier?",
    choices: [
      { label: "A", text: "Tier II ≈ 2N" },
      { label: "B", text: "**Tier III ≈ N+1 with multiple paths (concurrent maintainability); Tier IV ≈ 2N or 2N+1 (fault tolerance).** Tier I is essentially N (no redundancy); Tier II is N+1 components on a single path. The progression is: more redundancy + more path-independence as you go up the tiers. The notation captures capacity; the tier captures the combination of capacity, maintainability, and fault tolerance" },
      { label: "C", text: "Tier I ≈ N+1" },
      { label: "D", text: "Tier IV ≈ N" },
    ],
    correctAnswer: "B",
    explanation:
      "Memorize the pairing: Tier III → N+1 paths, concurrently maintainable; Tier IV → 2N+, fault tolerant. This is how tier claims map to specific redundancy requirements in an engineering review.",
  },
];
