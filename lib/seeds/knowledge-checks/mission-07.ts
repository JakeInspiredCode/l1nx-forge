import type { MCQuestion } from "@/lib/types/campaign";

// Mission 7: "Package Management"
// Covers: Section 9 (servers, headless, BMC/IPMI, datacenter infrastructure)
//         Cards (dnf, apt, rpm, controlled updates)

export const MISSION_07_QUESTIONS: MCQuestion[] = [
  {
    id: "m07-q01",
    question: "A server in a datacenter has no monitor, keyboard, or mouse attached. How do you manage it?",
    choices: [
      { label: "A", text: "You can't — someone must be physically present" },
      { label: "B", text: "Via SSH over the network — headless servers are managed entirely through the command line" },
      { label: "C", text: "Through a web browser GUI installed on the server" },
      { label: "D", text: "By connecting a USB drive with pre-written commands" },
    ],
    correctAnswer: "B",
    explanation: "Datacenter servers are headless — no display, no input devices. You SSH in over the network. If the OS is down, you use BMC/IPMI for out-of-band console access.",
  },
  {
    id: "m07-q02",
    question: "The OS has crashed and SSH is unreachable. How can you still access the server without physically visiting the datacenter?",
    choices: [
      { label: "A", text: "You can't — a physical visit is required" },
      { label: "B", text: "Restart the network service remotely via DNS" },
      { label: "C", text: "Use the BMC/IPMI — an independent management controller that works even when the OS is down" },
      { label: "D", text: "Wait for the server to auto-recover and reconnect" },
    ],
    correctAnswer: "C",
    explanation: "BMC (Baseboard Management Controller) / IPMI is a separate processor with its own network interface. It provides console access, power control, and sensor data even when the main OS is completely down.",
  },
  {
    id: "m07-q03",
    question: "Rocky Linux uses `dnf`. Ubuntu uses `apt`. What is the primary purpose of these tools?",
    choices: [
      { label: "A", text: "Monitoring system performance" },
      { label: "B", text: "Managing network connections" },
      { label: "C", text: "Installing, updating, and removing software packages — including automatic dependency resolution" },
      { label: "D", text: "Configuring user permissions" },
    ],
    correctAnswer: "C",
    explanation: "Package managers install software and automatically resolve dependencies (shared libraries a program needs). Without them, you'd manually track and install every library by hand.",
  },
  {
    id: "m07-q04",
    question: "Why would a datacenter team forbid running `apt upgrade` directly on production servers?",
    choices: [
      { label: "A", text: "`apt upgrade` is slower than `dnf upgrade`" },
      { label: "B", text: "Uncontrolled updates can break running services — changes should go through a change management process and be tested first" },
      { label: "C", text: "`apt upgrade` requires a reboot, which causes downtime" },
      { label: "D", text: "Production servers don't have internet access for package downloads" },
    ],
    correctAnswer: "B",
    explanation: "Untested updates can introduce bugs, break APIs, or change configurations. Datacenter teams test updates in staging first, then deploy through controlled change windows with rollback plans.",
  },
  {
    id: "m07-q05",
    question: "A standard datacenter rack is 42U tall. What does 'U' measure?",
    choices: [
      { label: "A", text: "The number of servers the rack can hold" },
      { label: "B", text: "A rack unit — 1.75 inches (44.45 mm) of vertical space for mounting equipment" },
      { label: "C", text: "The power capacity in kilowatts" },
      { label: "D", text: "The cooling airflow rating" },
    ],
    correctAnswer: "B",
    explanation: "A rack unit (U) is a standard height measurement. A 1U server is 1.75\" tall. A 42U rack has 42 mounting positions. A 2U server takes two positions. This standardization lets any vendor's equipment fit any rack.",
  },
  {
    id: "m07-q06",
    question: "Why do datacenter servers have dual power supplies connected to separate PDU circuits?",
    choices: [
      { label: "A", text: "To double the available wattage for the server" },
      { label: "B", text: "One powers the CPU, the other powers the disks" },
      { label: "C", text: "Redundancy — if one power feed or PDU fails, the server stays running on the other" },
      { label: "D", text: "Regulations require two power connections per server" },
    ],
    correctAnswer: "C",
    explanation: "Dual power supplies on separate circuits provide redundancy. A PDU failure, circuit breaker trip, or power supply failure on one side doesn't take the server down.",
  },
  {
    id: "m07-q07",
    question: "You need to check if `nginx` is installed on a Rocky Linux server. Which command?",
    choices: [
      { label: "A", text: "`which nginx`" },
      { label: "B", text: "`apt list --installed | grep nginx`" },
      { label: "C", text: "`rpm -qa | grep nginx`" },
      { label: "D", text: "`find / -name nginx`" },
    ],
    correctAnswer: "C",
    explanation: "Rocky Linux uses RPM packages. `rpm -qa` lists all installed packages; piping through `grep nginx` filters for nginx. On Ubuntu you'd use `dpkg -l | grep nginx` or `apt list --installed`.",
  },
  {
    id: "m07-q08",
    question: "What is the primary function of a Top-of-Rack (ToR) switch?",
    choices: [
      { label: "A", text: "Provides power distribution to all servers in the rack" },
      { label: "B", text: "Aggregates network connections from all servers in the rack and uplinks to the datacenter core network" },
      { label: "C", text: "Manages BMC/IPMI connections for remote management" },
      { label: "D", text: "Monitors temperature and humidity within the rack" },
    ],
    correctAnswer: "B",
    explanation: "A ToR switch connects all servers in a rack (typically 10/25 GbE per server) and provides uplinks (40/100 GbE) to the aggregation or spine layer. This is the first hop in the datacenter network hierarchy.",
  },
];
