import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Horizon — Scale & Architecture chapters (scl-s1 .. scl-s8)
// Each mission (scl-m01..scl-m04) pulls from 2 chapter sections.
// Instructional design mirrors Linux Ops + Power: why-this-matters intros,
// collapsible drill-downs, fill-blank reinforcement, flip-to-recall cards,
// inline MCQs, scenario think-about-its, and knowledge-check prompts.
// ═══════════════════════════════════════════════════════════════════════════

// ── scl-m01 Infrastructure Vocabulary ──────────────────────────────────────

const sclS1: ChapterSection = {
  id: "scl-s1",
  topicId: "scale",
  title: "Server, Host, Node, Box — Same Metal, Different Hats",
  subtitle: "The vocabulary you'll hear on the floor, and the form factors that house it.",
  icon: "◉",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Senior techs mix **server / host / node / box** interchangeably in hallway conversation — and every one of those words means something slightly different to the system of record that's about to page you. Walk into your first shift, grab a ticket that says *\"reseat the blade in chassis 7, slot 4,\"* and you need to know what each word is pointing at **without hesitation**. Precise vocabulary is not pedantry; it's how you avoid touching the wrong box at 02:00.",
    },
    { kind: "heading", level: 3, text: "The compute stack, smallest to largest" },
    {
      kind: "prose",
      html:
        "Start by zooming in — what's physically in front of you when you open a rack — and zoom out. Each layer has a name, and each name comes loaded with context.",
    },
    {
      kind: "table",
      headers: ["Term", "What it *is*", "When you hear it"],
      rows: [
        ["**Component**", "A physical part inside a server — CPU, DIMM, NIC, drive, PSU, fan", "\"The **PSU** in bay 2 is throwing faults\" — RMA-level detail"],
        ["**Server**", "A complete compute system that boots: CPUs, memory, storage, NICs, PSUs, firmware, usually an OS", "\"Install a new **server** in r17-03\" — physical asset"],
        ["**Host**", "The server as seen by software and ops: OS, hostname, network identity", "\"SSH to the **host** — check dmesg\" — OS-level framing"],
        ["**Node**", "A member of a cluster — a role within a larger system", "\"The K8s **node** is NotReady\" — cluster-level framing"],
        ["**Box**", "Slang — any server, any time", "Bridge-call chatter; never in tickets"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "One machine, three hats — simultaneously",
      body:
        "A single physical server can be called a **host** by the sysadmin, a **node** by the Kubernetes scheduler, and a **server** by the inventory system, **all at the same time**. Match your word to the system of record that issued the work. If the ticket says \"node,\" talk about nodes. If the change record says \"server,\" talk about servers. Translate on your own time.",
    },
    { kind: "heading", level: 3, text: "Form factors — what actually sits in the rack" },
    {
      kind: "collapsible",
      intro:
        "Click through each form factor — you'll meet all of them, sometimes in the same rack.",
      items: [
        {
          title: "Rack server",
          body:
            "Self-contained unit sized to slot into a standard **19-inch rack**. Usually **1U, 2U, or 4U** tall. Its own PSUs, fans, mainboard. Cabled individually. Any-vendor mix — you can run Dell next to HPE next to Supermicro in the same rack. Examples: Dell PowerEdge R760, HPE ProLiant DL380.",
          color: "#50C8FF",
        },
        {
          title: "Blade server",
          body:
            "A stripped-down server — mainboard, CPUs, RAM, maybe one drive — that **slides into a shared chassis** alongside other blades. No individual PSUs or fans; the chassis provides them. Denser. Less cabling. Locked to the chassis vendor.",
          color: "#FFC85A",
        },
        {
          title: "Chassis",
          body:
            "The enclosure that houses blades — **8, 10, or 16 blades per chassis** is common. Shared PSUs, shared fans, often a shared network fabric and management module. Examples: HPE BladeSystem c7000, Cisco UCS 5108, Dell PowerEdge M1000e.",
          color: "#FF7A8A",
        },
        {
          title: "Hyperconverged node",
          body:
            "Vendors like Nutanix, VxRail, and Dell EMC use \"**node**\" to mean a purpose-built clustered compute-plus-storage box. Technically a rack server — but called a node because it **only exists as part of a cluster**. Pull one out of the cluster and it's inert.",
          color: "#A855F7",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Blade vs rack — the tradeoff you'll be asked to defend" },
    {
      kind: "table",
      headers: ["", "Rack server", "Blade"],
      rows: [
        ["**Density**", "Lower", "Higher — more CPU per U"],
        ["**Cabling**", "Each server cabled individually", "Shared backplane, much less cabling"],
        ["**Vendor mix**", "Any mix", "Locked to the chassis vendor"],
        ["**Failure blast radius**", "One server", "**Chassis failure drops 8–16 blades at once**"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The blade trap",
      body:
        "Blades look like a win on density and cabling — until the day a chassis PSU, fabric interconnect, or management module fails and takes **every blade inside with it**. That's not a theoretical concern; it's the reason many hyperscale environments avoid blades for compute. Know the blast radius before you fall in love with the cable reduction.",
    },
    {
      kind: "fill-blank",
      prompt: "Translate the ticket into physical action:",
      sentence:
        "A ticket says \"reseat the blade in chassis 7, slot 4.\" That tells you the physical object is a {0} server, that it lives inside a shared {1}, and that the specific location is slot {2}. You will not find it by looking for a rack-mount {3} — it has no individual PSUs of its own.",
      blanks: [
        { answer: "blade", hint: "same word as \"server stripped to essentials\"", alternates: ["Blade"] },
        { answer: "chassis", hint: "the enclosure that houses blades", alternates: ["Chassis", "enclosure"] },
        { answer: "4", hint: "literally", alternates: ["four", "slot 4"] },
        { answer: "server", hint: "generic word for standalone compute", alternates: ["Server", "rack server", "rack-server"] },
      ],
      reveal:
        "A **blade** server slides into a shared **chassis** — here, slot **4** of chassis 7. It won't look like a rack-mount **server** because it has no PSUs, fans, or individual chassis of its own; the host chassis provides all of those.",
    },
    {
      kind: "flip-cards",
      intro: "Quick recall beats before we move to the power side of the vocabulary:",
      cards: [
        {
          front: "What does the *19 inches* in \"19-inch rack\" measure?",
          back:
            "The **distance between the inside edges of the mounting rails**. The rack itself is wider than 19\"; cage-nut-mounted or threaded-rail equipment is 19\" wide between its mounting ears. This is why any rack server from any vendor fits any 19\" rack — the ears line up.",
        },
        {
          front: "Your cluster manager reports a \"**node**\" NotReady. Your inventory system lists the same machine as a \"**server**.\" Your sysadmin wants you to SSH to the \"**host**.\" Three different people, one box. What do you do?",
          back:
            "Answer each one **in their vocabulary**, while treating it as the same physical machine. Don't try to normalize their language; translate silently. The cluster manager needs node-level action (kubectl drain, etc.), the sysadmin needs a host login, the inventory system needs the asset ID updated. Same metal, three hats, three workflows.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A new tech writes in a ticket: \"Rebooted the box in r17-03.\" The senior reviewer comments \"please use the correct term.\" What's the most reliable correction rule?",
      choices: [
        { label: "A", text: "Always use \"node\" in tickets" },
        { label: "B", text: "Use whatever word the system of record uses. If the asset system calls it a server, write server. If the cluster manager calls it a node, write node. \"Box\" is fine for bridge calls but vague enough that it creates ambiguity in durable records" },
        { label: "C", text: "Always use \"server\" in tickets" },
        { label: "D", text: "\"Box\" is fine — senior techs say it all the time" },
      ],
      correctAnswer: "B",
      explanation:
        "Hallway vocabulary and ticket vocabulary are different languages. The ticket needs to match whichever system this action interacts with downstream — asset, change, cluster, monitoring. \"Box\" loses information; pick the specific word and the future reader (maybe you, at 03:00, with the same box in trouble) can retrace the chain without guessing.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You walk into a new DC and a senior tech says \"grab any blade out of chassis 3 — they're identical, we're replacing the whole chassis tomorrow.\" Before you touch anything, what are the two questions you should be asking?",
      hint: "Think about what a *chassis replacement* actually entails.",
      answer:
        "First: **which blades have running workloads, and are they drained?** A chassis replacement is going to drop every blade in it simultaneously — that's the blade blast radius. If workloads haven't been migrated, \"tomorrow\" is going to be a very long outage. Second: **are the replacement blades configured the same way?** New chassis often comes with new blades; MAC addresses change, firmware can differ, network profiles may not match. \"They're identical\" is a senior tech's shorthand for what they *wish* were true — verify by reading the MOP and the drain / cutover plan before trusting it.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain in one paragraph why a single physical server can be called a **host**, a **node**, and a **server** simultaneously — and why precise word choice matters when you're writing a ticket.",
      answer:
        "The three words don't describe different things; they describe the **same machine from three viewpoints**. \"Server\" is the physical, asset-management framing — the thing bolted into a rack with a serial number. \"Host\" is the operating-system framing — the OS, hostname, network identity, what you SSH into. \"Node\" is the cluster/orchestration framing — its role as a member of a larger system (Kubernetes node, Ceph node, Slurm compute node, etc.). All three are true at once; the word you pick signals **which system you're interacting with**. In a ticket, matching the word to the system of record is how downstream automation, searches, and audits find the right context six months later. \"Box\" drops all that context and should stay in hallway speech.",
    },
  ],
};

const sclS2: ChapterSection = {
  id: "scl-s2",
  topicId: "scale",
  title: "Power & Connectivity Language",
  subtitle: "PSU vs PDU vs busbar vs whip; NIC, ToR, DAC, fiber — what each word points to in the rack.",
  icon: "◈",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Half the vocabulary you'll meet in a DC is about **moving power or data from one place to another** — and every piece has a specific name. When a ticket says *\"the whip from tap box 3 needs to be reterminated,\"* if you don't know a whip from a busbar, you can't even ask the right follow-up question. These words are cheap; knowing them is free. Not knowing them is the difference between *\"got it\"* and *\"wait, what?\"* on a bridge call.",
    },
    { kind: "heading", level: 3, text: "Power words — from the server up the chain" },
    {
      kind: "table",
      headers: ["Term", "What it is", "Where it lives"],
      rows: [
        ["**PSU**", "Power Supply Unit — converts AC mains to the DC voltages a server needs. Modern servers have 2+ PSUs for failover", "Inside each server"],
        ["**PDU**", "Power Distribution Unit — the vertical \"smart strip\" inside each rack. Basic / metered / switched / monitored flavors", "Inside each rack (usually two: A-side + B-side)"],
        ["**Busbar**", "A solid copper conductor — often overhead — that distributes power across a row. Racks tap into it via tap boxes or whips", "Above or alongside a row of racks (hyperscale)"],
        ["**Whip**", "A flexible power cable that drops from busbar, tap box, or RPP down into a rack, terminating in the PDU's upstream connector", "Hanging from the ceiling / tray into each rack"],
        ["**RPP**", "Remote Power Panel — mid-tier distribution between main switchgear and rack PDUs. Breaks one big feed into many small rack circuits", "On the DC floor, usually a tall cabinet"],
        ["**UPS**", "Uninterruptible Power Supply — battery-inverted power that bridges the seconds between utility loss and generator start", "Dedicated battery/electrical room"],
        ["**Switchgear**", "Heavy breakers, transfer switches, transformers — utility-facing protection & routing. Facilities territory, not IT", "Utility-room / yard"],
        ["**Generator (genset)**", "Diesel or gas engine that takes over from the UPS when utility is out", "Yard, roof, or generator room"],
        ["**ATS**", "Automatic Transfer Switch — decides whether load rides on utility or generator; switches on outage", "Between generator and load"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "PSU vs PDU — the one pair you cannot swap",
      body:
        "New techs mix these up constantly. **PSU** = the thing *inside a server* that makes DC voltages. **PDU** = the thing *inside a rack* that feeds outlets to servers. If someone says \"pull the PDU,\" you're pulling the rack strip and **every server in the rack goes dark**. If someone says \"pull the PSU,\" you're pulling one supply from one server (and if it's dual-feed, nothing happens). **The words are three letters apart; the blast radius is a whole rack apart.**",
    },
    {
      kind: "heading",
      level: 3,
      text: "Connectivity words — the network side of the rack",
    },
    {
      kind: "collapsible",
      intro:
        "Click each term. You will use all of these on your first day — nothing exotic here, but everything is named.",
      items: [
        {
          title: "NIC (Network Interface Card)",
          body:
            "The network adapter inside a server. Modern servers have **multiple NICs** — one for management (the BMC / IPMI network), one or two for data, sometimes separate ones for storage. Dual NICs let traffic survive a single link or switch failure.",
          color: "#50C8FF",
        },
        {
          title: "ToR switch (Top of Rack)",
          body:
            "The network switch that aggregates every server in the rack. **Named for position, not function** — some deployments actually mount it in the middle of the rack for better cable runs, and it's *still* called a ToR. Every server in the rack connects \"up\" to the ToR, then the ToR connects \"up\" to spine switches.",
          color: "#FFC85A",
        },
        {
          title: "EoR (End of Row)",
          body:
            "An alternative to ToR: **fewer, bigger switches at the end of a row**, with servers cabled directly over long runs. Less common in modern builds because it makes cabling a nightmare. Mostly seen in legacy enterprise installations.",
          color: "#FF7A8A",
        },
        {
          title: "Spine and leaf",
          body:
            "The standard DC network topology. **Leaf switches are the ToRs; spine switches interconnect all the leaves.** Every leaf connects to every spine — so any server is exactly 2 hops from any other server. Scales predictably; fails gracefully; the topology of choice for AI/HPC and any modern hyperscale build.",
          color: "#A855F7",
        },
        {
          title: "Patch panel",
          body:
            "A passive termination block, usually at the top or bottom of the rack, where cables land for clean management. Server cables go to the patch panel; short **patch cords** go from the panel to the switch. Patch panels are why a modern DC doesn't look like a bowl of spaghetti.",
          color: "#06D6A0",
        },
        {
          title: "DAC (Direct Attach Copper)",
          body:
            "A short copper cable with **transceivers built into both ends** — no separate optics. Used for 10/25/40/100 Gbps server-to-ToR runs under ~7 meters. Cheaper and lower-latency than fiber+optics for short runs, which is why most rack-internal uplinks are DAC.",
          color: "#F97316",
        },
        {
          title: "Fiber & optics",
          body:
            "For longer runs (beyond ~5–7 m) or higher speeds (400G+). Requires a **transceiver** — SFP+, SFP28, QSFP28, QSFP-DD — on each end. See the Fiber Optics sector for the full treatment; for now, know that \"there's fiber in that run\" means a pair of optics are involved.",
          color: "#EC4899",
        },
      ],
    },
    {
      kind: "heading", level: 3, text: "The cheat sheet — P's and cables",
    },
    {
      kind: "code",
      label: "WHAT'S WHERE IN A RACK",
      language: "text",
      code:
        "  ┌─ RACK (cabinet / enclosure) ─────────────────┐\n  │   U42  ┌──────────────────────┐               │\n  │        │ Patch panel + ToR    │  ← cables up  │\n  │   ...  │ ← DAC or fiber up    │    to spine   │\n  │        │   from each server   │               │\n  │        │                      │               │\n  │   U01  └──────────────────────┘               │\n  │                                                │\n  │   Vertical PDUs on the sides (0U):             │\n  │     PDU-A (red cords from PSU-1 of each        │\n  │            server) ← whip from tap box A       │\n  │     PDU-B (blue cords from PSU-2 of each       │\n  │            server) ← whip from tap box B       │\n  │                                                │\n  │   A-side & B-side whips come from overhead     │\n  │   BUSBAR or from an RPP elsewhere on the floor │\n  └────────────────────────────────────────────────┘",
    },
    {
      kind: "fill-blank",
      prompt: "Trace the power path from utility to server:",
      sentence:
        "Utility power enters the building at the {0}. If utility fails, the {1} starts and the {2} transfers the load to it. The {3} bridges the gap while the generator stabilizes. From there, power reaches each rack through a flexible {4} hanging down from an overhead {5} (or from an RPP). Inside the rack, the {6} on each side distributes power to outlets, and each server's dual {7}s convert AC to the DC its components need.",
      blanks: [
        { answer: "switchgear", hint: "heavy breakers + transformers", alternates: ["main switchgear"] },
        { answer: "generator", hint: "diesel engine", alternates: ["genset", "gen"] },
        { answer: "ATS", hint: "3-letter transfer device", alternates: ["automatic transfer switch"] },
        { answer: "UPS", hint: "battery bridge", alternates: ["u.p.s"] },
        { answer: "whip", hint: "flexible cable", alternates: ["power whip"] },
        { answer: "busbar", hint: "copper backbone above a row", alternates: ["bus bar", "bus-bar"] },
        { answer: "PDU", hint: "rack strip", alternates: ["pdus", "rack pdu"] },
        { answer: "PSU", hint: "server supply", alternates: ["psus", "power supply"] },
      ],
      reveal:
        "**Switchgear → Generator → ATS → UPS → Whip → Busbar (or RPP) → PDU → PSU.** That's the full chain; each word points at a specific piece of equipment in a specific room or rack. Knowing which one is which is what lets you read a facilities diagram without a translator.",
    },
    {
      kind: "flip-cards",
      intro: "Two connectivity recalls:",
      cards: [
        {
          front: "Why is a **ToR switch** called a ToR even when it's mounted in the middle of the rack?",
          back:
            "Because \"**Top of Rack**\" describes its **role in the topology**, not its physical position. It's the switch that aggregates every server in *that* rack and connects them upward to spine switches. Some builds move it to the middle of the rack for better cable runs to the servers above and below — but the role (rack-aggregation switch, one per rack) is what the name is tracking.",
        },
        {
          front: "When is **DAC** the right choice, and when do you switch to **fiber + optics**?",
          back:
            "DAC wins for **short runs** (typically < 7 m) inside a rack or between adjacent racks — cheaper, lower latency, no separate optics to buy. **Fiber + optics** wins for longer runs (between racks across a row, row-to-row, any run > ~7 m) or when you need speeds / distances DAC doesn't support. A well-designed rack uses DAC inside the rack and fiber to spine switches.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A ticket reads: \"The **whip** on r24-03 is sparking — de-energize the rack and cap it.\" Which of the following is the correct mental model of what you're doing?",
      choices: [
        { label: "A", text: "Pulling a network cable between two switches" },
        { label: "B", text: "De-energizing and isolating the flexible **power cable** that drops from an overhead busbar (or tap box, or RPP) into the rack's PDUs. \"Whip\" always means the power drop; sparking means a damaged conductor or bad termination and is an immediate safety event. \"Cap it\" means terminate the exposed end safely so it can't energize or short until an electrician replaces it" },
        { label: "C", text: "Removing a fiber patch cord" },
        { label: "D", text: "Shutting down a UPS battery string" },
      ],
      correctAnswer: "B",
      explanation:
        "A whip is always a power drop cable — no exceptions in DC vocabulary. Knowing this one word is the difference between an orderly power-safety response (de-energize upstream, call an electrician, cap the end, replace the whip) and wandering around looking for a data cable.",
    },
    {
      kind: "think-about-it",
      scenario:
        "On a bridge call a facilities lead says \"we're hot-swapping the RPP feeding row 12 tomorrow — should be a non-event.\" A junior tech asks \"will that drop the servers?\" What's the disciplined follow-up you should ask, and why?",
      hint: "An RPP is mid-tier between switchgear and rack PDUs. What does \"feeding row 12\" actually imply about redundancy?",
      answer:
        "The disciplined question is: **\"Does this RPP feed both A-side and B-side PDUs for row 12, or just one side?\"** If the RPP is one side of a proper 2N topology, replacing it drops feed A (or B) for the row while B (or A) carries load — truly a non-event for dual-corded servers. If the RPP feeds both sides of some racks (a common misbuild), \"hot-swapping\" it takes those racks dark. The word \"non-event\" hides the assumption. You should also ask whether anyone has audited the row for misplugs — single-fed servers will go dark regardless of the RPP's topology intent. Don't trust the facilities optimism; verify the topology and the physical cord discipline before the maintenance window.",
    },
    {
      kind: "knowledge-check",
      question:
        "A datacenter vocabulary quiz: walk through the journey of **one watt** of AC power from the utility pole to the moment it becomes DC inside a GPU. Name every named device it passes through, in order, and what each one is responsible for.",
      answer:
        "**Utility → Switchgear → ATS → UPS → RPP → Busbar / Whip → PDU → PSU → (DC inside the server).** The utility delivers high-voltage AC to the facility. **Switchgear** is the heavy protection and metering equipment that steps down and routes utility power into the building. **ATS** decides whether the facility rides on utility or generator and switches automatically on outage. **UPS** bridges the 10–30 s gap between utility loss and generator start by inverting battery DC into clean AC. **RPP** (or floor PDU) takes a big feed and splits it into many rack-level circuits. **Busbar** is the overhead copper backbone along a row, and the **whip** is the flexible drop cord from the busbar (or tap box / RPP) into the rack. **PDU** is the vertical strip inside the rack that distributes to outlets. **PSU** is the in-server supply that converts AC to the DC voltages the CPU, GPU, and DIMMs actually consume. The whole chain is serial — one broken link stops flow — which is why a production rack has parallel A-side and B-side chains for every stage of the journey.",
    },
  ],
};

// ── scl-m02 Rack & Cluster Design ──────────────────────────────────────────

const sclS3: ChapterSection = {
  id: "scl-s3",
  topicId: "scale",
  title: "Inside the Rack — U Math, Density, Weight, and A+B",
  subtitle: "What a rack can hold is never just about the U-space.",
  icon: "◐",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Every new tech learns rack math by making the same three mistakes: filling the U-space past what the circuits can carry; ignoring the weight limit until a caster fails; and quietly cross-cabling A-side and B-side because the cable run was easier. All three are preventable with a five-minute check — but only if you know the rack has **three independent budgets** (U, kW, and lbs) and a **fourth discipline** (A/B cabling) that cannot be shortcut. This is the lesson that keeps your first install from being your first incident.",
    },
    { kind: "heading", level: 3, text: "Rack-unit math" },
    {
      kind: "prose",
      html:
        "**1 U = 1.75 inches (44.45 mm).** A 42U rack is 42 × 1.75 = **73.5 inches** of vertical slot space — but you never actually fill a rack from 0 to 42. Reserve space at top and bottom for network and cable management.",
    },
    {
      kind: "code",
      label: "TYPICAL RACK LAYOUT",
      language: "text",
      code:
        "  U42  ┌─────────────────────────────┐\n  U41  │ Patch panel + cable management │  ← reserved top\n  U40  │ ToR switch(es)                 │\n  U39  │                                │\n  ...  │          (servers)             │\n  U03  │                                │\n  U02  │ Ground / cable management      │  ← reserved bottom\n  U01  └─────────────────────────────┘\n         Vertical PDUs on the sides (0U — don't eat U-space)",
    },
    {
      kind: "callout",
      variant: "info",
      title: "A 42U rack holds ~38U of server, not 42U",
      body:
        "Reserve **1–2 U at the top** (patch panel + ToR) and **1–2 U at the bottom** (cable management / horizontal PDU if any). Vertical PDUs mount on the 0U rails on the sides and don't consume U-space. Net: about **38 usable U** for actual server gear in a typical 42U production rack.",
    },
    { kind: "heading", level: 3, text: "Power density — the kW budget per rack" },
    {
      kind: "table",
      headers: ["Density tier", "kW per rack", "Typical workload"],
      rows: [
        ["**Low**", "2–5 kW", "Legacy enterprise, networking gear"],
        ["**Medium**", "5–10 kW", "Standard CPU compute"],
        ["**High**", "10–20 kW", "Modern general compute, some storage"],
        ["**Very high**", "20–40 kW", "GPU servers, dense compute"],
        ["**Ultra-high**", "40–100+ kW", "AI training clusters, liquid-cooled"],
      ],
    },
    {
      kind: "prose",
      html:
        "A single **208V × 30A** circuit delivers ~**5 kW usable** (after the 80% continuous-load derate). A rack drawing 20 kW needs **multiple 30A circuits** or higher-capacity circuits (208V 60A, 415V 3-phase). **You cannot fill a rack with servers past what the circuits can carry**, even if U-space is available. Check the power budget *before* you fill the rack.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "U-space does not equal rack capacity",
      body:
        "A classic mistake: 38U of empty rack, so you load it with 19 × 2U GPU boxes at 2 kW each = **38 kW** in a rack rated for 15 kW. Breakers trip the moment the workload ramps. Capacity is always answered in **kW first, then U**.",
    },
    { kind: "heading", level: 3, text: "Weight and floor loading — the budget nobody checks until it fails" },
    {
      kind: "prose",
      html:
        "Every rack has two weight ratings, and every floor has a third — all measured differently:",
    },
    {
      kind: "table",
      headers: ["Limit", "What it measures", "Typical value"],
      rows: [
        ["**Static load capacity**", "Maximum weight when the rack is bolted into position", "2,500–3,000 lbs"],
        ["**Dynamic load capacity**", "Maximum weight while the rack is rolling on casters", "1,500–2,000 lbs"],
        ["**Floor rating (PSF)**", "Maximum concentrated weight per square foot of floor", "Raised floor: 250–750 PSF. Slab: 750–1,500 PSF"],
      ],
    },
    {
      kind: "prose",
      html:
        "A rack fully loaded with 2U GPU servers can push past **2,000 lbs** before you add PDUs, cabling, or a ToR switch. A 42U rack at 2,500 lbs in a 24\" × 42\" footprint (7 sq ft) lands around **360 PSF** — fine on slab, potentially at the limit for raised-floor tiles. Heavy racks butted side-by-side concentrate load that can exceed a tile's rating for that section.",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Before you roll a loaded rack",
      body:
        "Confirm the target position is cleared for the **static load**, and that every tile along the rolling path supports the **dynamic load** of a moving rack. Facilities maintains a floor-load map for exactly this reason — loaded racks don't go wherever there's empty space. Exceed the dynamic rating on a caster and the frame can twist; exceed a floor-tile rating and the tile can crack under concentrated load.",
    },
    { kind: "heading", level: 3, text: "A-side and B-side — the rule that protects everything else" },
    {
      kind: "prose",
      html:
        "Every production rack has **two independent power feeds**. A-side and B-side come from separate upstream sources — different UPS strings, different switchgear buses, often different generators. Each server has two PSUs, one on each feed.",
    },
    {
      kind: "bullets",
      items: [
        "**One red cord to PDU-A, one blue cord to PDU-B** — every server, every time. Color-coding makes misplugs visible by inspection.",
        "Losing an entire side (maintenance window, breaker trip, fault) is a **non-event** for a correctly-cabled rack — the surviving side carries the whole load.",
        "**Pulling a B-side whip while A is already de-energized drops the load**. Tier classification protects the facility, not your MOP.",
        "Audit: both PDUs of a balanced rack should show **near-equal amperage draw**. A 3:1 or worse split is the signature of silent misplugs.",
      ],
    },
    {
      kind: "fill-blank",
      prompt: "Compute a rack budget end-to-end:",
      sentence:
        "You're installing in a 42U rack fed by two 208V 30A circuits. After reserving 4U for ToR + cable management, you have about {0}U of server space. Each circuit delivers ~{1} kW usable after the 80% derate, so each side is budgeted at {1} kW. If each server draws 600W and has dual PSUs, you can run at most about {2} servers before the kW budget limits you — regardless of how much U-space is still open.",
      blanks: [
        { answer: "38", hint: "42 - 4", alternates: ["thirty-eight"] },
        { answer: "5", hint: "208 × 30 × 0.8 / 1000", alternates: ["5.0", "~5", "5 kW"] },
        { answer: "8", hint: "5 kW / 0.6 kW per server ≈ ?", alternates: ["eight", "~8"] },
      ],
      reveal:
        "**38U** usable, **5 kW** per feed, **~8 servers** at 600W each before kW is the binding constraint. U-space looks roomy; kW is what actually caps you. This is the classic trap — always compute kW *before* you plan the server layout.",
    },
    {
      kind: "flip-cards",
      intro: "Two recalls on rack budgets and cabling:",
      cards: [
        {
          front: "Why is a rack's **dynamic load** capacity lower than its **static load** capacity?",
          back:
            "Because **moving weight is less stable than stationary weight**. Casters can fail under load, and the frame flexes differently in motion than when bolted down. Static capacity assumes the rack is locked to the floor; dynamic capacity is what the casters and frame can handle rolling. Typical gap: ~1,000 lbs difference (e.g., 2,500 lb static vs 1,500 lb dynamic).",
        },
        {
          front: "Why does **clean cabling** matter for *cooling*, not just aesthetics?",
          back:
            "A nest of cables behind a server creates **airflow impedance** — exhaust air has to push through the mess, fans spin faster, hot air recirculates inside the chassis, CPUs and GPUs **thermal-throttle**, performance drops silently, components age faster. The cold aisle can be perfectly cool and the servers can still overheat because the *path* is blocked. Clean cabling is cooling.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're handed a spec that reads \"42U rack, 17 kW usable, 2,500 lb static capacity, raised floor at 500 PSF.\" The design calls for 19 × 2U servers at 800 W each. What's the binding constraint, and what's your decision?",
      choices: [
        { label: "A", text: "The rack holds all 19 — 19 × 2U = 38U fits; approve" },
        { label: "B", text: "**Power is the binding constraint.** 19 × 800W = 15.2 kW at nameplate; under real-world ramp you're near the 17 kW cap and past the 80% derate of one side. Also audit weight: 19 × ~60 lb = ~1,140 lb of server, plus rack + PDUs + cabling can approach 2,000 lb → within static limit but tightens floor-tile margins. Decision: ship 16–17 servers, not 19, and leave kW headroom; don't fill to the wall just because U-space exists" },
        { label: "C", text: "Refuse — the rack is too small" },
        { label: "D", text: "Approve as-is; rack specs are guidelines" },
      ],
      correctAnswer: "B",
      explanation:
        "Every rack has three independent budgets (U, kW, lb) plus a floor rating in PSF. The binding constraint is whichever one you hit *first* under real load — usually kW. \"Guidelines\" is how outages and fires happen; treat every rack budget as a hard cap with headroom.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You audit a new rack and both PDUs show a green dashboard — every server's PSUs are \"healthy.\" But PDU-A reads 19 A and PDU-B reads 6 A. What is almost certainly wrong, and why did every PSU pass its self-check?",
      hint: "PSU self-checks only know what they themselves are plugged into.",
      answer:
        "At least a third of the servers in the rack are **double-plugged into PDU-A** (both PSUs on the A-side strip, none on B). The lopsided draw (19 vs 6 A on what should be balanced loads) is the signature of silent misplugs. Each PSU is individually fine — it has input power and is converting — so it reports \"OK.\" **Redundancy is a property of the pair, not the individual PSU**, and nothing in the self-check validates *which* PDU a PSU is plugged into. The only way to find these is a **physical cord audit**: walk every server and verify one red and one blue cord. The fix is re-dressing the misplugs; the prevention is color-coded cords and inspection at install time.",
    },
    {
      kind: "knowledge-check",
      question:
        "A facilities engineer asks you to install three 2U GPU servers drawing ~10.2 kW each into a rack rated for 17 kW usable, with 38U of free space. What breaks, and what's the disciplined plan instead of \"squeeze them in\"?",
      answer:
        "3 × 10.2 kW = **30.6 kW**, nearly double the 17 kW the rack can carry. U-space isn't the issue — you'd use only 6 U. **kW is.** Under real load, breakers trip within minutes; worst case you create a fire risk from sustained near-breaker-cap current. The disciplined plan is to recognize that **modern GPU servers cannot go in a traditional 30A-class rack**. The rack needs higher-amperage circuits (60 A or 100 A 3-phase), a fresh row-level power design, or fewer servers per rack. Modern AI-DC rack builds target **40–60+ kW per rack** on purpose; retrofitting GPU loads into legacy power is the most common rack-capacity mistake in the industry. Capacity planning is answered in kW and amps first, then U-space.",
    },
  ],
};

const sclS4: ChapterSection = {
  id: "scl-s4",
  topicId: "scale",
  title: "Airflow, Cable Discipline, and the Cluster Hierarchy",
  subtitle: "Why clean cabling is cooling — and how racks roll up into rows, pods, halls, AZs, and regions.",
  icon: "◑",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A thermal incident rarely starts with a CRAH failure. It usually starts with **a rack someone rushed the cabling on six months ago** — and nobody noticed until CPU throttling showed up in a dashboard. Airflow is a path, not a volume: block the path at the intake or the exhaust and the whole chain breaks down, regardless of how cold the cold aisle is. Similarly, knowing the **rack → row → pod → hall → AZ → region** hierarchy is how you translate a \"row 4 is dark\" alarm into action in seconds. The hierarchy is the map. Without it, you're just running around a warehouse.",
    },
    { kind: "heading", level: 3, text: "Cable discipline — the rules of the trade" },
    {
      kind: "bullets",
      items: [
        "**Label every cable on both ends** with source and destination. Future-you at 02:00 will thank present-you.",
        "**Respect bend radius.** Fiber patch cables have a minimum bend radius ~1 inch — kink it and you lose signal silently.",
        "**Use cable management arms** on the back of rack servers so cables don't get pinched or sheared when the server is serviced.",
        "**Slack management.** Not too tight (strain on connectors, ripped copper pairs), not too loose (rat's nest). Service loops should be tidy bundles, not knots.",
        "**Separate power and data.** Don't run Ethernet alongside a power whip for long distances — EMI can cause link issues that look like a flaky switch.",
        "**Color-code A and B.** Red cords for A-side PDU, blue for B-side. Misplugs become visible by inspection.",
      ],
    },
    { kind: "heading", level: 3, text: "Airflow impedance — the invisible kill path" },
    {
      kind: "prose",
      html:
        "Cable management is not aesthetic. A nest of cables behind a server creates **airflow impedance** — resistance to the air the server is trying to push through its chassis. Here's what happens when the exhaust path is blocked:",
    },
    {
      kind: "collapsible",
      intro: "The thermal cascade, step by step:",
      items: [
        {
          title: "1. Internal fans spin faster",
          body:
            "The server's BMC sees rising intake or exhaust temperatures and ramps fans to compensate. More power draw, more noise, more wear on fan bearings. First symptom visible on a dashboard if you're watching fan RPM.",
          color: "#50C8FF",
        },
        {
          title: "2. Hot air recirculates inside the chassis",
          body:
            "Because exhaust can't leave the rack cleanly, it pools behind the server and gets pulled back in on the intake side. The server is now breathing its own exhaust. Internal delta-T climbs rapidly.",
          color: "#FFC85A",
        },
        {
          title: "3. Thermal throttling",
          body:
            "CPUs and GPUs begin **reducing clock speed** to avoid damage. Performance drops — and critically, **there is no OS-level alarm**. Monitoring dashboards show CPU \"busy,\" but throughput has collapsed. Training jobs look normal but run 30% slower.",
          color: "#FF7A8A",
        },
        {
          title: "4. Components age faster",
          body:
            "Sustained high-temperature operation accelerates electromigration in silicon, degrades capacitors, dries out fan bearings. Components that were rated for 5 years of life start failing at 2.",
          color: "#EF4444",
        },
        {
          title: "5. Eventual cascade",
          body:
            "A PSU fails early. A fan seizes. A DIMM throws an ECC error. The root cause was never the component — it was the airflow six months ago. By the time anyone notices, the cabling has long since been forgotten.",
          color: "#A855F7",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The mantra: clean cabling is cooling",
      body:
        "The cold aisle can be at the correct temperature, the CRAH units can be working perfectly, and a poorly cabled rack can still overheat. Airflow is a *path*, not just a volume. This is why \"bad cabling\" is considered a thermal finding on hot-aisle walkthroughs — it is one.",
    },
    { kind: "heading", level: 3, text: "Cooling basics (brief — full detail in Power & Cooling)" },
    {
      kind: "bullets",
      items: [
        "**Hot aisle / cold aisle.** Racks face each other across a cold aisle (intake side); exhausts face each other across a hot aisle.",
        "**Containment.** Physical barriers — curtains, doors, ceiling caps — that prevent hot and cold air from mixing. **HAC** (hot-aisle containment) or **CAC** (cold-aisle containment).",
        "**CRAH / CRAC units.** The coolers on the floor or perimeter that supply cold air and remove hot air.",
        "**Blanking panels.** Solid panels that fill empty U-space so hot air doesn't recirculate through the gap. A rack with missing blanking panels is a rack leaking its hot aisle back into its cold aisle.",
      ],
    },
    { kind: "heading", level: 3, text: "The cluster hierarchy — zooming out from the rack" },
    {
      kind: "code",
      label: "THE HIERARCHY",
      language: "text",
      code:
        "  Server / Node\n    └── Rack  (1 to ~48 servers; kW + lb + U budgets)\n          └── Row  (6 to 20+ racks; shared aisle)\n                └── Pod / Cell  (multiple rows; shared power + network)\n                      └── Data Hall  (multiple pods; one big room)\n                            └── Building  (multiple halls)\n                                  └── Availability Zone  (one or more buildings;\n                                      isolated failure domain)\n                                        └── Region  (multiple AZs;\n                                            e.g., AWS us-east-1)",
    },
    {
      kind: "prose",
      html:
        "Not every DC uses every level. A small enterprise DC might be \"building → rack\" — nothing in between. A hyperscaler has the full stack, with strict failure-domain boundaries at every level. **\"Cluster\"** is a slippery word that can refer to any of these, depending on context: in GPU training, a cluster often means a specific group of hundreds-to-thousands of GPU servers with high-bandwidth interconnect, which may span racks, rows, or a whole pod.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "The hierarchy maps to alarms",
      body:
        "When an alarm fires with scope (\"14 racks in row 4 are dark\"), the hierarchy tells you which tier of infrastructure to look at. **One rack dark** → rack-level (PDU, breaker, ToR). **One row dark** → row-level (floor PDU, row main). **One pod dark** → pod-level (upstream switchgear bus, CRAH zone). Matching scope to tier is how you find the cause in minutes instead of hours.",
    },
    {
      kind: "fill-blank",
      prompt: "Match the alarm scope to the failure domain:",
      sentence:
        "A single server is down → look at the {0}, PSUs, or one PDU outlet. A whole rack is dark → check the rack {1}. A whole row is dark → suspect the row {1} or floor {1}. A whole pod is dark → look at the {2} feeding it. A whole hall or AZ is dark → it's at the {3} or regional level, and you'll be on a much larger bridge call.",
      blanks: [
        { answer: "server", hint: "the single machine itself", alternates: ["Server", "host", "node"] },
        { answer: "PDU", hint: "3-letter rack strip", alternates: ["pdus"] },
        { answer: "switchgear", hint: "heavy-breaker equipment", alternates: ["UPS", "busbar"] },
        { answer: "utility", hint: "where power enters the facility", alternates: ["grid", "facility"] },
      ],
      reveal:
        "**Scope tells you tier.** One server: check the server and its PDU outlet. One rack: the rack PDU. One row: the row/floor PDU. One pod: the upstream switchgear or UPS bus. One hall or AZ: utility, regional grid, or catastrophic facility event. Matching scope to tier is the single most efficient diagnostic move you have.",
    },
    {
      kind: "flip-cards",
      intro: "Recall on cooling airflow and hierarchy:",
      cards: [
        {
          front: "Why are **blanking panels** a common finding on hot-aisle walkthroughs?",
          back:
            "Because missing blanking panels let **hot aisle air recirculate through the gap** back into the cold aisle — mixing hot and cold and defeating the whole point of aisle containment. A rack with a few empty U-slots and no blanking panels is leaking its own exhaust into its own intake. Cheap to fix, big thermal impact, easy to miss.",
        },
        {
          front: "The NOC says **\"one rack is dark.\"** What's your first move?",
          back:
            "Scope is rack-level, so look at **rack-level infrastructure first**: both rack PDUs for tripped breakers, the ToR switch for management issues, and the servers' IPMI to see if they're simply network-isolated rather than unpowered. Don't go upstream to row/pod/utility — scope doesn't support it. If both PDUs look green and IPMI reports them up, then the \"dark\" is actually network, not power.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A customer reports \"CPU is pegged but throughput has collapsed\" on a rack of training servers. Which is the single most likely explanation, and what do you check first?",
      choices: [
        { label: "A", text: "Software regression; roll back the last deploy" },
        { label: "B", text: "**Thermal throttling from airflow impedance.** CPU/GPU silicon drops clock speed when temperatures exceed thresholds; the OS sees CPUs \"busy\" at 100% but throughput falls. First check: inlet/outlet temperatures, fan RPMs, and the back of the rack for obstructed cabling or missing blanking panels. The root cause is usually six months older than the symptom" },
        { label: "C", text: "The CRAH unit must have failed" },
        { label: "D", text: "The workload is broken" },
      ],
      correctAnswer: "B",
      explanation:
        "Throttling is the most common silent performance killer in a real DC. It doesn't alarm; it just makes training jobs run 20–40% slower, which customers feel long before ops does. The signature is \"CPU busy, throughput low\" — that combination is thermal until proven otherwise. And the fix usually isn't the cooling plant; it's the cabling behind the rack.",
    },
    {
      kind: "think-about-it",
      scenario:
        "At 02:00 the NOC pages: \"All of pod 3 is offline.\" Utility and main switchgear are reported healthy by facilities. Rows 3-1 through 3-8 are dark; rows 4-* and 5-* are fine. Where in the hierarchy do you look, what do you ask facilities to check, and what do you *not* do?",
      hint: "Scope = one pod. Neighboring pods are fine. Utility is fine.",
      answer:
        "Scope is **pod-level** — not rack, not row, not facility. That points at pod-level infrastructure: the **upstream switchgear bus** feeding pod 3, the **row PDUs / RPPs** in the pod (if they share upstream), or a pod-level UPS. Ask facilities to check: the switchgear bus and breakers feeding pod 3 specifically, the pod's UPS output, and whether any maintenance was scheduled that touched pod 3 tonight. *Do not* power-cycle servers inside the pod trying to \"recover\" them — they aren't broken, their feed is, and cycling them while the feed is in an uncertain state just adds events to the log. *Do not* reset a tripped pod-level breaker without understanding why it tripped; resetting into a fault is how an outage becomes a fire. The hierarchy narrowed your search from \"anywhere in the DC\" to \"the two or three devices that can fail exactly at pod scope\" — that's the point of knowing it cold.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain in your own words why an alarm like \"**14 racks in row 4 are dark**\" is easier to diagnose than an alarm like \"**several servers are unreachable**.\" Then explain how the cluster hierarchy gives you a specific list of suspect devices.",
      answer:
        "\"14 racks in row 4 are dark\" has **defined scope** — a whole row, contiguous, bounded. That scope maps directly to the hierarchy: rack < row < pod < hall. One row with neighbors healthy points at **row-level infrastructure** — a row main breaker, a floor PDU feeding just that row, or a shared cooling zone if this were a thermal event. The suspect list shrinks to 2–3 devices, and you can get to them and start diagnosing in minutes. \"Several servers are unreachable\" has **no scope** — could be a network issue affecting scattered hosts, could be multiple unrelated failures, could be an application problem. Without scope, you have to start by *building* scope: which servers, which racks, which rows, what patterns? The hierarchy is what turns an unbounded page into a bounded one. It's also why good monitoring groups alarms by rack / row / pod automatically — so the first thing you see is \"where,\" not just \"what.\"",
    },
  ],
};

// ── scl-m03 Data Center Tiers ──────────────────────────────────────────────

const sclS5: ChapterSection = {
  id: "scl-s5",
  topicId: "scale",
  title: "Data Center Tiers — The Uptime Institute Standard",
  subtitle: "Tier I to Tier IV: what each level actually buys you, and what it doesn't.",
  icon: "◒",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "When someone says *\"we're running in a **Tier III** facility,\"* that's shorthand that carries real technical meaning. It tells you **what redundancy to expect**, **what maintenance is possible without downtime**, and **which failures the facility is designed to survive**. As a tech, knowing the tier tells you what's possible during a MOP and what should never happen on a given day. The tier is not a marketing badge — it's a contract between the facility and the workloads running on it.",
    },
    { kind: "heading", level: 3, text: "The Uptime Institute — four tiers, each builds on the last" },
    {
      kind: "callout",
      variant: "info",
      title: "Casual vs official",
      body:
        "People say \"Tier 1, Tier 2\" in hallway conversation, but the Uptime Institute uses **Roman numerals** (Tier I, II, III, IV) and their definitions are the only official ones. Many facilities are **designed to** a tier's standards without being **formally certified** by Uptime — certification is expensive, rigorous, and involves on-site inspection. \"Tier-III-designed\" is common; \"Tier III Certified\" is a stronger claim.",
    },
    {
      kind: "table",
      headers: ["Tier", "Topology", "Availability", "Downtime/year", "Maintenance"],
      rows: [
        ["**Tier I — Basic**", "Single path for power + cooling; no redundancy", "99.671%", "~28.8 hrs", "Requires shutdown; any component failure = outage"],
        ["**Tier II — Redundant Components**", "Single path, but N+1 redundant components", "99.741%", "~22 hrs", "Partial — individual components can fail, but the path is still single"],
        ["**Tier III — Concurrently Maintainable**", "Multiple independent paths; N+1 throughout", "99.982%", "~1.6 hrs", "**Any component or path can be taken offline without disrupting IT load**"],
        ["**Tier IV — Fault Tolerant**", "Two fully independent systems (2N); everything duplicated", "99.995%", "~26 min", "Fully concurrent; also tolerates a single major failure (fire, flood, explosion) without impact"],
      ],
    },
    {
      kind: "collapsible",
      intro: "What each tier actually means in practice:",
      items: [
        {
          title: "Tier I — Basic",
          body:
            "Single utility feed, single UPS, single cooling path. No generator in some builds. A failure *anywhere* in the chain takes the load down. Typical use: small businesses, non-critical workloads, proof-of-concept sites. Not appropriate for production workloads that matter.",
          color: "#EF4444",
        },
        {
          title: "Tier II — Redundant Components",
          body:
            "Still a single upstream path, but with **N+1** redundant UPS modules, N+1 chillers, etc. Individual component failures don't take the site down — but the *path itself* is still single, so a breaker or switchgear failure at the path level does. Typical use: small-to-mid enterprise, some lower-end colocation.",
          color: "#F59E0B",
        },
        {
          title: "Tier III — Concurrently Maintainable",
          body:
            "**This is the key differentiator.** Multiple independent paths throughout. Any component *or any path* can be taken offline for maintenance without disrupting IT load. Replace a UPS battery string, swap a PDU, service a chiller — all during business hours, all without a window. Typical use: standard enterprise and colocation. **The most common tier for business-critical workloads.**",
          color: "#50C8FF",
        },
        {
          title: "Tier IV — Fault Tolerant",
          body:
            "**2N redundancy** — two fully independent systems, completely duplicated, from utility to rack. Not just concurrent maintainability, but **fault tolerance**: the facility is designed to survive a single major failure (fire, flood, equipment explosion) without impacting load. Typical use: financial trading, critical government, highest-tier cloud regions. Costs 3–5× more than Tier I to build and operate.",
          color: "#A855F7",
        },
      ],
    },
    {
      kind: "heading", level: 3, text: "Tiers in practice — where you feel them" },
    {
      kind: "bullets",
      items: [
        "**MOPs (Method of Procedure).** A Tier III facility lets you de-energize one power path at a time for maintenance. A Tier I facility requires a full shutdown window — which is why nobody does serious work in Tier I.",
        "**Failure response.** In Tier IV, losing one PDU should affect **zero** servers. If it does, something is wrong: someone cross-cabled both feeds to the same side, or a PSU has been silently failed for weeks. The tier is the contract — deviation is a finding.",
        "**Customer conversations.** Colocation customers pay more for higher tier. You may be asked \"is this facility Tier III?\" on a sales call. Know the answer and what it implies: concurrent maintainability, N+1, ~1.6 hrs/year max downtime budget.",
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Tier protects the facility, not your application",
      body:
        "A Tier III or IV rating is a statement about **the building's infrastructure**. It doesn't protect you from: cross-cabled A/B misplugs, single-corded devices without an STS, incorrect MOPs that de-energize the *wrong* path, or applications that don't handle a brief transient cleanly. Tier is a floor, not a ceiling — it gives you the *possibility* of survival; your discipline is what actually converts that into uptime.",
    },
    {
      kind: "fill-blank",
      prompt: "Map tiers to availability and real-world downtime:",
      sentence:
        "A Tier {0} facility targets ~99.98% availability and about {1} hours of annual downtime; its key property is {2}. A Tier IV facility uses {3} redundancy — two fully independent systems — and targets {4} minutes of downtime per year.",
      blanks: [
        { answer: "III", hint: "Roman numeral, between II and IV", alternates: ["3", "three"] },
        { answer: "1.6", hint: "less than 2", alternates: ["~1.6", "1.6 hrs", "1.6 hours"] },
        { answer: "concurrent maintainability", hint: "any component or path offline for maintenance", alternates: ["concurrently maintainable", "concurrent-maintainability"] },
        { answer: "2N", hint: "fully duplicated", alternates: ["2n"] },
        { answer: "26", hint: "about 26 min/year", alternates: ["~26", "26 min", "twenty-six"] },
      ],
      reveal:
        "**Tier III = ~99.982% uptime, ~1.6 hr/year, concurrently maintainable.** **Tier IV = 2N, ~26 min/year, fault tolerant.** Memorize these four numbers — they come up on calls and in customer conversations constantly.",
    },
    {
      kind: "flip-cards",
      intro: "Recall on tier distinctions:",
      cards: [
        {
          front: "What's the single-sentence difference between **Tier II** and **Tier III**?",
          back:
            "**Tier II has redundant components but a single path. Tier III has multiple independent paths, so maintenance on any component or any path happens without downtime.** Tier II survives a component failure; Tier III survives a whole-path event, including planned maintenance.",
        },
        {
          front: "A sales engineer claims \"we're Tier IV — we can take zero downtime.\" What's the correction?",
          back:
            "Tier IV allows for ~**26 minutes of permitted downtime per year**, and it protects against *single* catastrophic failures — not every possible failure mode. Multiple simultaneous failures, bad MOPs, and application-level issues still cause outages. \"Tier IV\" is an infrastructure guarantee, not an absolute.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You need to replace a failed UPS module at 14:00 on a Tuesday, under normal business load. Which tier level supports doing this **without customer impact**?",
      choices: [
        { label: "A", text: "Tier I" },
        { label: "B", text: "Tier II" },
        { label: "C", text: "**Tier III or IV.** The defining property of Tier III is *concurrent maintainability* — any component or path can be taken offline for maintenance without disrupting IT load. Tier IV adds 2N fault tolerance on top. Tier I requires a full shutdown; Tier II has redundant components but a single upstream path, so a UPS module swap on the path itself can be at risk" },
        { label: "D", text: "Any tier" },
      ],
      correctAnswer: "C",
      explanation:
        "Concurrent maintainability is the Tier III contract — it's the whole reason you pay for Tier III instead of Tier II. On Tier I or Tier II, maintenance like this requires a scheduled window; on Tier III it's a Tuesday afternoon.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A customer calls and asks \"what's the difference between a **Tier III-designed** DC and a **Tier III Certified** DC — are they the same?\" You're on the phone and need to explain in 60 seconds. What do you say?",
      hint: "Design vs. on-site verification.",
      answer:
        "**Tier III-designed** means the facility was *built* to meet the Uptime Institute's Tier III topology requirements — concurrent maintainability, N+1, multiple paths. It's self-claimed, and usually accurate, but **no outside auditor has verified it**. **Tier III Certified** means Uptime Institute actually came on site, inspected the topology, reviewed the commissioning documents, and issued a certification that the facility both **designed to** and **operates to** Tier III. Certification costs real money and takes months, which is why many excellent facilities are \"designed to Tier III\" but not certified — it's a business-decision gap, not a quality gap. For workloads where the tier guarantee matters (regulated industries, high-SLA customers, compliance audits), **certification is what holds up in a contract**; \"designed to\" is an engineering statement but not a verified guarantee. If the customer needs a certification letter, design isn't enough.",
    },
    {
      kind: "knowledge-check",
      question:
        "A CFO asks why the company shouldn't just build every site to Tier IV since \"higher tier is always better.\" Write a disciplined answer that explains the tradeoff and gives a concrete framework for picking the right tier.",
      answer:
        "Higher tier is **not always better** — it's 3–5× more expensive to build and operate, and it only delivers value if the workload cares about the availability it provides. A Tier IV facility gives ~26 min/year of permitted downtime vs ~1.6 hrs for Tier III; that difference is ~90 min/year of additional uptime, at a cost premium that often exceeds the revenue loss from that downtime. The decision framework is: **what is the cost of downtime per hour for the workloads at this site**, and **what's the cost premium of Tier IV vs Tier III at this location**? For financial trading, critical healthcare, or life-safety systems, the downtime cost is huge and Tier IV is obviously right. For most enterprise workloads, Tier III is the sweet spot — concurrent maintainability, N+1, predictable uptime at a manageable cost. \"Always Tier IV\" is a budget mistake dressed up as risk aversion.",
    },
  ],
};

const sclS6: ChapterSection = {
  id: "scl-s6",
  topicId: "scale",
  title: "Redundancy Notation & Blast Radius",
  subtitle: "N, N+1, 2N, 2N+1 — and why tier classification is not enough.",
  icon: "◓",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Every conversation about resilience eventually hits capacity notation — **N+1, 2N, 2N+1**. Every MOP eventually hits **blast radius** — what breaks if this step fails or runs long. These aren't abstract; they're the two variables that determine whether your next maintenance window is a non-event or a career-defining outage. Memorize the notation. Calculate the blast radius before every touch.",
    },
    { kind: "heading", level: 3, text: "Capacity notation — the vocabulary of redundancy" },
    {
      kind: "table",
      headers: ["Notation", "Meaning", "Concrete example"],
      rows: [
        ["**N**", "Just enough capacity to carry the load", "4 chillers needed, 4 installed — no spare"],
        ["**N+1**", "One extra unit beyond what's needed", "4 needed, 5 installed — tolerates one failure"],
        ["**N+2**", "Two extras", "4 needed, 6 installed — tolerates two failures"],
        ["**2N**", "Two fully independent complete systems", "4 needed, 8 installed — **two independent sets of 4**"],
        ["**2N+1**", "Two independent systems plus a spare", "4 needed, 9 installed"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "N+1 vs 2N — the critical distinction",
      body:
        "**N+1** says \"one component can fail.\" It doesn't say *any whole path can be offline*. If the path itself goes down (maintenance, switchgear fault, fire in an electrical room), N+1 is lost capacity. **2N** says \"an entire path can be offline — for any reason — and the other carries full load.\" This is the only topology AI/GPU datacenters seriously consider, because the economics ($10M+ of silicon per megawatt) can't tolerate a whole-path outage.",
    },
    {
      kind: "prose",
      html:
        "Map to tiers: **Tier III ≈ N+1** (one spare per tier, concurrent maintainability). **Tier IV = 2N or 2N+1** (fully duplicated paths, fault tolerance). Both give you maintenance without downtime; only 2N survives a whole-path failure without degradation.",
    },
    { kind: "heading", level: 3, text: "Blast radius — the discipline before every touch" },
    {
      kind: "prose",
      html:
        "Before you execute any MOP step — before you pull a cable, de-energize a breaker, reseat a module — ask: **what breaks if this action fails or runs longer than planned?** That set of systems / racks / customers is your **blast radius**. It's rarely what it looks like at first glance.",
    },
    {
      kind: "collapsible",
      intro: "Blast-radius examples — how small actions turn into big events:",
      items: [
        {
          title: "\"Just reseating a cable on a spine switch\"",
          body:
            "Blast radius: **the entire pod's network connectivity**. Every server in every rack under that spine relies on it; a misseat takes the spine's uplink down, and if the backup path isn't validated, you've just isolated a pod. This is a bridge-call operation, not a solo task.",
          color: "#EF4444",
        },
        {
          title: "\"Just de-energizing one PDU\"",
          body:
            "Blast radius: **one rack** — *if* every server is correctly A+B cabled. If misplugs exist, the radius expands to every misplugged server, which went dark silently. The PDU itself is small; the human error risk around it is not.",
          color: "#F59E0B",
        },
        {
          title: "\"Just power-cycling a blade chassis\"",
          body:
            "Blast radius: **every blade inside — often 8 to 16 servers at once**. Chassis-level power cycles are never a small event; workloads must be drained, cutover plans must be in place. The blade form factor concentrates blast radius.",
          color: "#FF7A8A",
        },
        {
          title: "\"Just rebooting the ToR switch\"",
          body:
            "Blast radius: **the entire rack's network connectivity** for the duration of the reboot (usually 2–5 minutes). Single-homed servers lose their only path; dual-homed servers fail over to the other ToR if there is one. Know the homing before you press reset.",
          color: "#A855F7",
        },
        {
          title: "\"Just running this firmware update\"",
          body:
            "Blast radius: **every device that takes the update, if it bricks them**. Firmware updates can fail in ways that require a replacement part; a \"simple\" BIOS push across a rack can become a mass RMA event. Staged rollouts and canary devices exist for exactly this reason.",
          color: "#50C8FF",
        },
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Tier classification protects the facility — not your workload",
      body:
        "A Tier III or IV facility is concurrently maintainable, so the **infrastructure** survives your action. The **workloads** still might not. A redundant power path lets you safely work on A-side; it does not save you if you pull B-side while A is already out of service. **Blast radius thinks about the workload; tier thinks about the facility.** You need both.",
    },
    { kind: "heading", level: 3, text: "Common misconceptions — corrected" },
    {
      kind: "table",
      headers: ["Misconception", "Correction"],
      rows: [
        ["\"Tier IV means no downtime ever\"", "**No.** Tier IV allows ~26 min/year of permitted downtime and protects against single major failures — not every possible failure mode"],
        ["\"All tier claims are Uptime-certified\"", "**No.** Many facilities are *designed to* tier standards but never formally certified. Certification is a paid audit process"],
        ["\"Higher tier is always better\"", "**No.** Tier IV costs 3–5× Tier I to build and operate. Pick the tier that matches the workload's cost-of-downtime, not the highest available"],
        ["\"N+1 tolerates a whole-path failure\"", "**No.** N+1 tolerates a single component failure. Whole-path loss requires 2N"],
        ["\"Concurrent maintainability = fault tolerant\"", "**No.** Concurrent maintainability means you can service without downtime. Fault tolerance (Tier IV) means the facility survives a major uncontrolled failure. Different properties"],
      ],
    },
    {
      kind: "fill-blank",
      prompt: "Redundancy notation and blast radius, together:",
      sentence:
        "A datacenter with four CRAH units that only needs three to handle the load is running at {0}+1. Each CRAH can fail and cooling continues — that's the point. If the same DC had *two independent* sets of four CRAHs, it would be running at {1} cooling. Before replacing the B-side CRAH during business hours, the MOP author must calculate the {2} — the set of workloads affected if the replacement runs long or the A-side fails during the window.",
      blanks: [
        { answer: "N", hint: "just one letter", alternates: ["n"] },
        { answer: "2N", hint: "fully duplicated", alternates: ["2n", "2-N", "two N"] },
        { answer: "blast radius", hint: "what breaks if the step fails", alternates: ["blast-radius", "radius"] },
      ],
      reveal:
        "**N+1** (4 installed, 3 needed) tolerates one CRAH failure. **2N** (8 installed in two independent sets) survives a whole-set failure or whole-path maintenance. Before any touch, calculate the **blast radius** — that's the workloads at risk if the step doesn't go clean.",
    },
    {
      kind: "flip-cards",
      intro: "Recall on notation and discipline:",
      cards: [
        {
          front: "What's the difference between **N+1** and **2N** in plain English?",
          back:
            "**N+1** is \"one extra unit beyond what I need.\" Survives single component failures. **2N** is \"two fully independent systems, each capable of carrying the full load alone.\" Survives a whole-path failure. N+1 is a component-level spare; 2N is a path-level spare. You want 2N when the cost of downtime is larger than the cost of duplicating the entire topology.",
        },
        {
          front: "Before touching a cable or breaker, what's the one question great techs always ask?",
          back:
            "**\"What's the blast radius if this fails or runs long?\"** If the answer is bigger than they expected, they escalate or replan before they touch. Great techs rarely get surprised on the back end because they've calculated the front end. Tier classification protects the facility; blast radius is what protects the workload.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A MOP calls for you to reseat a single fiber cable between a leaf switch and a spine switch in a Tier IV facility. The engineer says \"Tier IV means this is a non-event.\" What's the disciplined follow-up?",
      choices: [
        { label: "A", text: "Agree — Tier IV facilities are fault tolerant by definition" },
        { label: "B", text: "Ask: \"What's the blast radius on the workload side if this reseat causes link flap?\" Tier IV guarantees the *facility* survives a single failure; it doesn't protect the workload from a flap that knocks RDMA fabrics into recovery or drops BGP sessions. Verify the other spine uplink is healthy, the routing failover is tested, and single-homed devices below the leaf are absent — then proceed" },
        { label: "C", text: "Refuse — fiber work is always a customer impact" },
        { label: "D", text: "Power down the leaf first to be safe" },
      ],
      correctAnswer: "B",
      explanation:
        "The tier is about the facility; the workload has its own blast radius. Network gear often has \"hitless\" redundancy on paper and very-un-hitless behavior in practice when a link flaps during recovery. Validate the redundancy *before* the reseat, not after.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A senior tech proposes: \"Let's replace all four PDUs in row 12 during business hours on Thursday. The DC is Tier III so it's concurrently maintainable — safe.\" Before you agree or disagree, what are the three questions you should ask?",
      hint: "Tier III says the facility can survive it. That's not the same as the workload surviving it.",
      answer:
        "(1) **\"Are we replacing all four at once, or one at a time?\"** Concurrent maintainability means *one path* can be offline without impact — not *both sides simultaneously*. Replacing all four at once is a whole-rack outage for every rack in the row, Tier III or not. (2) **\"Have we audited the rack cords for misplugs first?\"** If any servers in those racks are double-plugged into a single PDU, they go dark when we pull that PDU, regardless of tier. An audit before the MOP surfaces the hidden risks. (3) **\"Is there a rollback if a replacement PDU fails on install?\"** Concurrent maintainability assumes the new device works; if it doesn't, we're partway through a step with the old device gone and the new one faulted. Every MOP needs a defined undo. \"Tier III so it's safe\" is a phrase that hides three load-bearing assumptions — ask the questions before Thursday.",
    },
    {
      kind: "knowledge-check",
      question:
        "Write a one-paragraph definition of **blast radius** as a discipline, and explain why it's worth calculating even in a Tier IV facility.",
      answer:
        "**Blast radius** is the set of systems, racks, customers, or services that are affected if the action you're about to take fails, runs longer than planned, or produces an unexpected side effect. It's calculated *before* the action, not after. The discipline is: for every MOP step, ask \"what's affected if this step goes wrong?\" and use the answer to decide whether to proceed, escalate, or replan. In a Tier IV facility, the *facility* is fault tolerant — a single major failure doesn't bring the infrastructure down — but the **workload** running on that facility has its own failure modes. A network link flap, a firmware push, a cable reseat can all cause workload-level outages even when the facility is fine. Tier protects the building; blast radius protects the business. Great techs rarely get surprised because they calculate blast radius before they touch anything. The habit adds maybe 30 seconds to each step and prevents hours or days of incident response.",
    },
  ],
};

// ── scl-m04 Hyperscale, Colo, Enterprise, Edge ────────────────────────────

const sclS7: ChapterSection = {
  id: "scl-s7",
  topicId: "scale",
  title: "The Four Operating Models",
  subtitle: "Hyperscale, Colo, Enterprise, Edge — same physics, radically different operations.",
  icon: "◉",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "\"Data center\" covers wildly different operations. A hyperscale facility for Meta or AWS looks nothing like a bank's enterprise server room, which looks nothing like an Equinix colo cage, which looks nothing like a containerized edge POP in a cell-tower parking lot. **The physics is identical; the process and culture couldn't be more different.** Knowing the model helps you translate skills between jobs and sets your expectations when you switch employers. A hyperscale process habit applied in a colo will feel oddly rigid; a colo process habit applied at hyperscale will feel oddly loose. Both can be right *for their context*.",
    },
    { kind: "heading", level: 3, text: "The four models, briefly" },
    {
      kind: "collapsible",
      intro: "Each model has its own operators, scale, density profile, and culture. Click through:",
      items: [
        {
          title: "Hyperscale",
          body:
            "**Operators:** AWS, Microsoft, Google, Meta, Oracle, ByteDance, large AI labs. **Scale:** tens of thousands to millions of servers per region; entire purpose-built buildings. **Equipment:** highly standardized, often custom-designed (OCP — Open Compute Project — hardware is common). Tens of thousands of *identical* servers. **Operations:** heavy automation; techs work in teams doing repetitive, scheduled tasks across large fleets. **Power density:** very high — racks often 20–40+ kW. Liquid cooling increasingly common. **Culture:** software-driven, process-heavy, strict change control.",
          color: "#50C8FF",
        },
        {
          title: "Colocation (Colo)",
          body:
            "**Operators:** Equinix, Digital Realty, CoreSite, Iron Mountain, NTT, CyrusOne. **Model:** the colo provides power, cooling, space, connectivity; customers bring their own servers and rent cage, rack, or cabinet space. **Scale:** a few racks to full buildings. **Equipment:** whatever customers install — huge variety. **Operations:** facility staff may handle \"**remote hands**\" work — physical tasks on customer equipment guided by the customer's remote ops team over the phone or ticket. **Power density:** variable — low-density cages (2–5 kW) coexist with high-density cages in the same building. **Culture:** customer-service oriented. You work with many different customer teams and processes.",
          color: "#FFC85A",
        },
        {
          title: "Enterprise",
          body:
            "**Operators:** any company running its own data center — banks, insurance, healthcare, retail, government, manufacturing. **Scale:** small (server closet) to very large (bank HQ with multiple data halls). **Equipment:** brand-name enterprise gear (Dell, HPE, Cisco, Lenovo). Often over-engineered for reliability and tier compliance. **Operations:** dedicated internal IT or facilities team. Can be formal (ITIL, change boards) or informal, depending on company size. **Power density:** usually medium (5–10 kW). **Culture:** risk-averse, compliance-driven, especially in regulated industries.",
          color: "#FF7A8A",
        },
        {
          title: "Edge",
          body:
            "**Operators:** cellular carriers, CDN providers (Cloudflare, Akamai, Fastly), industrial operators. **Model:** small DCs placed close to end users or industrial sites to reduce latency. Could be a handful of racks at a cell-tower base, a containerized DC in a parking lot, or a small room in a retail store. **Scale:** tiny — 1 to a few dozen racks. **Equipment:** ruggedized, often unattended for long periods; remote management is critical. **Operations:** fewer staff, more remote work; site visits are scheduled and infrequent. **Power density:** low to medium. **Culture:** lean, practical, high uptime demand.",
          color: "#A855F7",
        },
      ],
    },
    { kind: "heading", level: 3, text: "How your job differs, at a glance" },
    {
      kind: "table",
      headers: ["Aspect", "Hyperscale", "Colo", "Enterprise", "Edge"],
      rows: [
        ["**Variety of work**", "Low (standardized fleets)", "High (many customers)", "Medium", "Low–Medium"],
        ["**Documentation burden**", "Heavy", "Heavy (customer-facing)", "Varies", "Medium"],
        ["**Pace**", "Fast (high volume)", "Mixed", "Slower", "Variable"],
        ["**Autonomy**", "Low (tight processes)", "Medium", "Medium–High", "High"],
        ["**Automation exposure**", "Very high", "Medium", "Lower", "Medium"],
        ["**Customer interaction**", "None (internal only)", "Daily", "Internal only", "Low"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Core skills transfer; process and culture don't",
      body:
        "Linux, networking, hardware fundamentals, cable discipline, ticket hygiene, incident response — **these transfer cleanly between all four models**. What doesn't transfer is the *process ecosystem* (change control, documentation expectations, tooling) and *culture* (pace, autonomy, risk tolerance). Expect a **3–6 month ramp** when switching models, even with strong core skills. A hyperscale habit of \"push firmware to 10,000 nodes via automation\" is dangerous in a colo where you'd be pushing across every customer's infra; a colo habit of \"ticket every physical touch\" is slow at hyperscale where automation handles the audit trail.",
    },
    { kind: "heading", level: 3, text: "Remote hands — the colo-specific workflow" },
    {
      kind: "prose",
      html:
        "In a colo, the customer is somewhere else — sometimes on another continent — and the facility staff have physical access to the customer's equipment that the customer doesn't. **Remote hands** is the paid service where facility techs execute physical tasks on customer gear guided by the customer's remote ops team. Classic requests:",
    },
    {
      kind: "bullets",
      items: [
        "\"Please reseat the NIC in the top server of cabinet 17-C and power-cycle it.\"",
        "\"Move the fiber in patch panel A port 8 to port 12.\"",
        "\"Swap the failed drive in slot 4 of r24-01 with the spare in the hot-spare cabinet; email me the replaced drive's serial.\"",
        "\"Photograph the front and back of rack r33-02 and attach to ticket.\"",
      ],
    },
    {
      kind: "prose",
      html:
        "Remote hands discipline: **read the ticket out loud before touching anything** (\"I'm about to reseat the NIC in slot 3 of the server in r17-03, top position, confirm\"), **photograph before and after**, and **never improvise**. The customer doesn't know what you can see; they know what their monitoring reports. Trust is a function of precision.",
    },
    {
      kind: "fill-blank",
      prompt: "Match the DC model to its operator and defining property:",
      sentence:
        "A facility operated by AWS, Meta, or Google running millions of identical servers with heavy automation is {0}. A facility operated by Equinix or Digital Realty where customers rent space and bring their own gear is {1}. A bank's internal server rooms run by its own IT team is {2}. A containerized DC at a cell-tower base designed for latency-sensitive workloads is {3}.",
      blanks: [
        { answer: "hyperscale", hint: "AWS, Meta, Google scale", alternates: ["Hyperscale"] },
        { answer: "colo", hint: "colocation, shared facility", alternates: ["colocation", "Colo", "Colocation"] },
        { answer: "enterprise", hint: "company runs its own DC", alternates: ["Enterprise"] },
        { answer: "edge", hint: "small, close to users", alternates: ["Edge"] },
      ],
      reveal:
        "**Hyperscale** (AWS/Meta/Google, fleet-scale automation) → **Colo** (Equinix/Digital Realty, shared with customer gear) → **Enterprise** (company-owned, internal IT) → **Edge** (small, latency-oriented, often remote). Same physics, four very different jobs.",
    },
    {
      kind: "flip-cards",
      intro: "Recalls on operating model:",
      cards: [
        {
          front: "Why do hyperscale DCs often use **OCP (Open Compute Project)** hardware instead of brand-name Dell / HPE?",
          back:
            "Because at hyperscale, **every design decision is about fleet-level TCO**. OCP strips out features the operator doesn't need (front bezels, redundant components they standardize elsewhere, warranty structures they replace with spares-on-shelf) and produces cheaper, more serviceable gear tuned for racks of 10,000+ identical machines. Dell/HPE optimize for the *customer with one server*; OCP optimizes for the customer with a million. At enterprise scale, the OCP calculus doesn't make sense — you don't have the ops investment to replace vendor support.",
        },
        {
          front: "What does **\"remote hands\"** mean in a colo context?",
          back:
            "Facility staff executing **physical tasks on customer-owned equipment**, guided by the customer's remote ops team. Classic tasks: reseating cables, swapping drives, photographing racks, power-cycling devices. The facility techs don't know the customer's workload; the customer's team doesn't have physical access. Precise ticket language and photographs bridge the gap.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're transitioning from a hyperscale DC (where you pushed firmware across 10,000 servers in a day) to a colocation facility (where you do remote hands across 40 different customer environments). What's the most important mental shift?",
      choices: [
        { label: "A", text: "Nothing changes — fleet automation is fleet automation" },
        { label: "B", text: "**The blast radius model completely inverts.** At hyperscale, your automation is the system of record and one action touches thousands of identical nodes under one change-control framework. In colo, you touch one device at a time, across many different customers' frameworks — each with its own change process, tooling, and risk tolerance. You cannot \"push to many\"; you execute discrete, customer-specific tickets with precise per-touch audit trails. The discipline shifts from \"scale through automation\" to \"precision at the individual touch\"" },
        { label: "C", text: "Slow down everything by 10×" },
        { label: "D", text: "Stop using tickets" },
      ],
      correctAnswer: "B",
      explanation:
        "Hyperscale and colo demand different muscles. Hyperscale rewards building automation that safely moves fast across a fleet. Colo rewards executing precisely within many different customer ecosystems. Both are valid; mixing them — hyperscale speed in a colo, or colo deliberation at hyperscale — produces the worst of both worlds.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A friend who's an experienced enterprise IT tech (one bank, 15 years, everything by ITIL) is interviewing for a DC tech role at a hyperscaler. They ask you: \"What's the one cultural thing I should prepare for that will be most different from my current job?\"",
      hint: "Think about velocity, automation, and decision scope.",
      answer:
        "The single biggest cultural difference is **velocity and the role of automation as the primary safety mechanism**. In an enterprise ITIL shop, safety comes from multi-step human review — CAB meetings, approvals, risk analysis — which takes days and reviews a handful of changes per week. At hyperscale, safety comes from **automation guardrails and canary rollouts**: code validates the change, pushes it to one node, observes for 10 minutes, pushes to 100, observes again, pushes to 10,000. Ten thousand changes per week instead of ten. Your friend will initially feel like the process is reckless — nobody's reviewing each change individually — but the review is automated and probabilistic instead of human and sequential. The mental shift is trusting the automation layer to catch what humans would catch, accepting that individual changes are smaller and more frequent, and leaning into the fleet-scale patterns rather than the individual-server patterns. The skill is the same (don't break production); the *shape of the discipline* is radically different.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain why a DC tech's **core skills** transfer cleanly between hyperscale, colo, enterprise, and edge — but their **process and cultural habits** often don't. Give one concrete example from each model of a habit that only makes sense in that context.",
      answer:
        "Core skills — **Linux, networking, hardware diagnostics, cable discipline, ticket hygiene, incident response** — are about the physics of running a DC, and the physics is the same everywhere. A NIC is a NIC, a ToR is a ToR, airflow is airflow. **Process and culture** live on top of those physics and are optimized for the specific operating model. **Hyperscale:** \"push firmware to 10,000 nodes via automation with canary validation\" — only makes sense when you have thousands of identical devices and an ops organization that invests in automation tooling. In a colo, the same habit is actively dangerous because each device belongs to a different customer. **Colo:** \"photograph every physical action and attach to the ticket\" — essential because the customer cannot see the work and trust is built through artifacts. At hyperscale, taking photos of every touch would be prohibitive and pointless given automation's audit trail. **Enterprise:** \"CAB reviews every production change in a Monday meeting\" — works when the organization values deliberate risk management over velocity. At hyperscale this would halt the business. **Edge:** \"always assume you won't be back for 90 days — over-provision spares and documentation\" — essential when site visits are expensive and infrequent, pointless at a staffed hyperscale facility. The transferable skill is \"know the physics.\" The non-transferable habit is \"know which process ecosystem fits this scale.\" Expect 3–6 months of ramp when switching models even with strong fundamentals.",
    },
  ],
};

const sclS8: ChapterSection = {
  id: "scl-s8",
  topicId: "scale",
  title: "Cloud Regions, AZs, and the Glossary You'll Live In",
  subtitle: "The language that connects your rack to the biggest maps in the industry.",
  icon: "◈",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Once you know the rack and the tier, the vocabulary expands outward — **region, AZ, POP, MSP, dark site, lights-out**. These words live on architecture diagrams, contract documents, and status pages. When AWS says *\"we're opening a new region in us-east-3,\"* that translates to **multiple new buildings across multiple Availability Zones, each a full DC in its own right**. When a customer asks for a \"multi-AZ deployment,\" they're buying isolation that your physical topology has to actually provide. The glossary is the final mile of scale & architecture fluency.",
    },
    { kind: "heading", level: 3, text: "The big-picture glossary" },
    {
      kind: "table",
      headers: ["Term", "What it means", "Real-world example"],
      rows: [
        ["**Cloud region**", "A hyperscaler's geographic cluster of data centers, usually made of multiple Availability Zones", "AWS `us-east-1` (N. Virginia), Azure `East US`, GCP `us-central1`"],
        ["**Availability Zone (AZ)**", "One or more physically separated DCs within a region — isolated failure domains with independent power, cooling, and network", "AWS `us-east-1a`, `us-east-1b`, `us-east-1c`"],
        ["**MSP**", "Managed Service Provider — a company that manages IT infrastructure on behalf of customers, often including DC operations", "Rackspace, Kyndryl, DXC"],
        ["**Dark site**", "A DC with no on-site staff — all operations remote, plus scheduled visits", "Many edge POPs, some hyperscale sites outside major metros"],
        ["**Lights-out**", "Same as dark site, or operations conducted without human presence", "Common phrase in edge-DC and remote-ops contexts"],
        ["**POP (Point of Presence)**", "A small facility — often edge — where a network or service provider connects to local infrastructure", "A Cloudflare POP in a third-tier city; a carrier POP in a colo"],
      ],
    },
    { kind: "heading", level: 3, text: "Region vs AZ — the distinction that shapes SLAs" },
    {
      kind: "prose",
      html:
        "A **region** is geographic — a metropolitan area or broader. An **AZ** is an isolation boundary within the region. The two words are often conflated by customers but have very different operational meanings:",
    },
    {
      kind: "collapsible",
      intro: "Zoom in on region and AZ:",
      items: [
        {
          title: "Region — the geographic unit",
          body:
            "A cloud region is typically a metropolitan area or a state. AWS `us-east-1` is Northern Virginia; `us-west-2` is Oregon. **Latency is low within a region** (typically < 5 ms between AZs) and **higher between regions** (tens to hundreds of ms, depending on geography). Regions are selected for customer needs: data sovereignty, proximity to users, cost, regulatory compliance. Each region has at least 2 — usually 3 or more — AZs.",
          color: "#50C8FF",
        },
        {
          title: "Availability Zone — the isolation unit",
          body:
            "An AZ is **one or more physically separated DCs** within the region, each with **independent power, cooling, and network entry points**. The isolation is by design: if `us-east-1a` suffers a fire or a utility event, `us-east-1b` should be unaffected. AZs are typically kilometers apart, connected by high-bandwidth, low-latency fiber. Customers deploy across multiple AZs to get regional-level uptime despite single-AZ failures.",
          color: "#FFC85A",
        },
        {
          title: "Multi-AZ vs Multi-Region",
          body:
            "**Multi-AZ** gives you isolation against facility-level failures (power, cooling, network at one DC) with minimal added latency. **Multi-Region** gives you isolation against regional events (earthquakes, regional utility failures, BGP issues at the region's edge) but costs significantly more latency and bandwidth. Most workloads run multi-AZ; only the highest-tier workloads run multi-region active-active.",
          color: "#A855F7",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Dark sites and lights-out operations" },
    {
      kind: "prose",
      html:
        "A growing fraction of infrastructure runs at **dark sites** — facilities with no on-site staff. The motivation is usually cost (skilled techs are expensive; small sites can't justify full staffing), geography (rural edge POPs can't attract talent), or both. Dark-site discipline shifts the work:",
    },
    {
      kind: "bullets",
      items: [
        "**Remote management everything.** Every device must be reachable via BMC/IPMI on an out-of-band network, so a wedged server can be recovered without a site visit.",
        "**Spares on shelf, labeled clearly.** When a site visit happens (monthly, quarterly), one tech swaps everything that's flagged — they can't come back next week to try again.",
        "**Runbooks before visits.** The visiting tech often doesn't know the site; a detailed runbook and photographs are how they execute in an unfamiliar environment.",
        "**Longer mean-time-to-repair.** Dark sites accept that replacing a failed component may take days, not hours — so topologies have to tolerate degraded operation in the meantime.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "\"Lights-out\" is a choice, not a default",
      body:
        "The term *lights-out* comes from factory automation (literal lights-out operation means no humans, no lights needed). In DC context it describes operations that function without human presence — either at an unstaffed site or at a staffed site where the software handles events autonomously. \"Lights-out\" is how modern hyperscale environments scale ops staff sub-linearly: 10× the fleet doesn't mean 10× the techs, because the software handles 10× the events.",
    },
    {
      kind: "fill-blank",
      prompt: "Put the big-picture vocabulary together:",
      sentence:
        "A cloud {0} like AWS us-east-1 contains multiple {1}s, each a physically separated datacenter with independent power, cooling, and network. A customer running across three {1}s in the same {0} is protected against a facility-level failure at any one of them. A company that manages infrastructure on another company's behalf is called an {2}. A small edge facility where a network provider connects to local infrastructure is a {3}. A datacenter with no on-site staff is a {4} site.",
      blanks: [
        { answer: "region", hint: "geographic area", alternates: ["Region"] },
        { answer: "AZ", hint: "availability ___", alternates: ["availability zone", "az", "AZs", "azs"] },
        { answer: "MSP", hint: "managed service ___", alternates: ["managed service provider", "msp"] },
        { answer: "POP", hint: "point of ___", alternates: ["point of presence", "pop"] },
        { answer: "dark", hint: "no on-site staff", alternates: ["lights-out"] },
      ],
      reveal:
        "**Region → AZ → DC.** A region is geographic (metro-area). An **AZ** is an isolated failure domain — one or more DCs with independent infrastructure within the region. **MSPs** manage infra on customer's behalf. **POPs** are small edge facilities for network presence. **Dark / lights-out** sites run without on-site staff.",
    },
    {
      kind: "flip-cards",
      intro: "Final recalls — the glossary in action:",
      cards: [
        {
          front: "What's the difference between a **region** and an **AZ**?",
          back:
            "A **region** is geographic (e.g., AWS us-east-1 = N. Virginia). An **AZ** is an **isolated failure domain** within the region — one or more physically separated DCs with independent power, cooling, and network entry. Customers deploy multi-AZ for facility-level isolation; multi-region for regional-level isolation. The region is where; the AZ is how-isolated.",
        },
        {
          front: "Why does multi-AZ deployment give higher availability than multi-DC deployment within one AZ?",
          back:
            "Because an AZ's whole point is **independent infrastructure** — power, cooling, network paths, often generators. Two DCs within one AZ may share an upstream switchgear bus or a utility feeder; two DCs in different AZs don't. Multi-AZ isolates against facility-level failures (fire, flood, utility event) that might take out an entire AZ's DC(s). Multi-DC within one AZ often shares enough upstream infrastructure that a regional fault takes both down.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A customer buys \"multi-AZ\" from a cloud provider. An incident takes down **us-east-1a**. The customer's workload stays up. Six weeks later, a regional BGP issue at the us-east-1 edge makes all of us-east-1 unreachable from the internet. What happens to the customer's workload?",
      choices: [
        { label: "A", text: "Nothing — they're multi-AZ" },
        { label: "B", text: "**It's unreachable.** Multi-AZ protects against facility-level failures within the region — fire, power, cooling, switchgear at one AZ. It does *not* protect against region-level events like edge BGP issues, regional network splits, or metropolitan-scale utility failures. For those, the customer needs **multi-region** deployment with DNS / traffic-routing failover. Multi-AZ is cheaper but has a region-sized ceiling on what it can survive" },
        { label: "C", text: "The AZs automatically migrate to another region" },
        { label: "D", text: "The BGP issue is always the provider's fault, so the customer isn't affected" },
      ],
      correctAnswer: "B",
      explanation:
        "Multi-AZ is a facility-isolation feature; it has nothing to say about region-level events. Customers who need protection above the region level buy multi-region architectures — with the cost, latency, and complexity that implies. Always match the isolation level to the failure modes you're trying to survive.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You've finished all four Scale & Architecture missions. A friend at another company asks: \"I'm joining a DC tech team in three weeks — I've never worked in this world before. What are the first three questions I should ask on day one to orient myself?\"",
      hint: "Think about what you now know but wouldn't have known a few weeks ago.",
      answer:
        "(1) **\"Which operating model is this — hyperscale, colo, enterprise, or edge?\"** The answer dictates everything downstream about process, pace, and the kind of work. (2) **\"What tier is this facility, and is it certified or designed-to?\"** This tells you what maintenance is possible without downtime and what failure modes the facility is expected to survive — a Tier III concurrent-maintainability guarantee shapes every MOP. (3) **\"What's the rack density here — what kW per rack, and what's the largest single-rack load?\"** This is the quickest way to understand whether this is a traditional 5–10 kW environment or a modern 30–60+ kW AI-DC environment, which changes cooling, power, network, and even how you move equipment on the floor. Those three questions land you in the right mental model on day one: **model (the process), tier (the reliability contract), density (the physics).** Everything else — vocabulary, hierarchy, blast radius — fits inside those three answers.",
    },
    {
      kind: "knowledge-check",
      question:
        "You've worked through four missions on scale and architecture. In your own words, summarize the **three most important ideas** you'd want a new DC tech to internalize before their first shift.",
      answer:
        "(1) **Vocabulary has consequences.** Server / host / node / box point at the same machine from different systems — picking the right word matches your action to the right system of record. PSU, PDU, whip, busbar, UPS, generator all describe different devices with different blast radii; mixing them up is how small actions become big events. (2) **Every rack has three independent budgets and one discipline.** U-space, kW, and weight are independent — you can hit the kW limit while U is still open. A+B cabling is the discipline that makes the facility's redundancy actually deliver — misplugs silently defeat everything the infrastructure promises. Calculate the budgets; audit the cords. (3) **Tier protects the facility; blast radius protects the workload.** Tier classification (Uptime I–IV) tells you what the building can survive. Blast radius is the set of workloads affected if *your specific action* fails or runs long. The two are complementary, not interchangeable. A Tier IV facility doesn't save you from an unwise touch on the wrong cable; calculating blast radius before every step does. Internalize those three, and the rest of the scale & architecture vocabulary — hierarchy, redundancy notation, operating models, regions — falls into place as context for how to apply them.",
    },
  ],
};

export const SCALE_CHAPTERS: ChapterSection[] = [
  sclS1,
  sclS2,
  sclS3,
  sclS4,
  sclS5,
  sclS6,
  sclS7,
  sclS8,
];
