// ═══════════════════════════════════════════════════════════════
// INCIDENT DRILL SCENARIOS
// Extracted from linux-ops-forge + expanded
// ═════════════════════��═════════════════════════════════════════

export interface ScenarioStep {
  prompt: string;
  hints: string[];
  answer: string;
  keyTerms: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "intermediate" | "advanced" | "expert";
  topicTags: string[];
  steps: ScenarioStep[];
  summary: string;
  keyPrinciple: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "gpu-node-unresponsive",
    title: "GPU Node Unresponsive — Live Incident",
    description: "A GPU compute node has stopped reporting metrics. You're on-call. Triage from alert to resolution.",
    difficulty: "advanced",
    topicTags: ["hardware", "linux", "ops-processes"],
    steps: [
      {
        prompt: "ALERT: gpu-rack12-node07 has not reported metrics for 10 minutes. You're on-call. What's your first move?",
        hints: ["Think about in-band vs out-of-band access", "What if SSH times out?"],
        answer: "Attempt SSH first. If it times out, use out-of-band access via BMC/IPMI: ipmitool -I lanplus -H gpu-rack12-node07-bmc chassis status. Also check the top-of-rack switch port status.",
        keyTerms: ["SSH", "BMC", "IPMI", "ipmitool", "out-of-band"],
      },
      {
        prompt: "BMC responds — chassis is powered on. SOL console shows: 'Kernel panic - not syncing: Fatal Machine Check.' What now?",
        hints: ["Capture evidence before taking action", "Check the System Event Log"],
        answer: "Capture the kernel panic output from SOL console for the incident ticket. Check ipmitool sel list for hardware fault details. Then issue ipmitool chassis power cycle to reboot.",
        keyTerms: ["capture", "SOL", "sel list", "power cycle", "evidence"],
      },
      {
        prompt: "Node reboots. dmesg shows: 'EDAC MC0: 1 CE on DIMM 3A' — correctable ECC errors accumulating. How do you proceed?",
        hints: ["Is the DIMM degrading?", "What info do you need for the RMA?"],
        answer: "Check error rate — frequent CEs mean the DIMM is degrading. Run dmidecode -t memory to identify the physical DIMM (serial, part number). Mark node as degraded in fleet management. Drain workloads gracefully. File hardware RMA ticket with DIMM details and EDAC log excerpts.",
        keyTerms: ["EDAC", "dmidecode", "degraded", "drain", "RMA", "serial"],
      },
      {
        prompt: "While reviewing, nvidia-smi shows GPU 2 has 4 volatile uncorrectable ECC errors. Other GPUs show zero. What additional action?",
        hints: ["Uncorrectable > correctable in severity", "Can this node run training safely?"],
        answer: "Uncorrectable GPU ECC errors indicate data corruption in GPU memory. Add to the hardware ticket — node now needs both DIMM replacement (slot 3A) and GPU inspection/replacement (GPU 2). Capture nvidia-smi -q -i 2 diagnostics. Node must NOT run training workloads until both issues are resolved.",
        keyTerms: ["uncorrectable", "corruption", "nvidia-smi -q", "training", "both"],
      },
    ],
    summary: "Full path: Network unreachable → BMC/IPMI → Kernel panic (MCE) → SEL check → Power cycle → Post-boot: DIMM ECC + GPU ECC errors → Node drained → Dual RMA filed.",
    keyPrinciple: "Always exhaust remote diagnostics before dispatching to the floor. Capture evidence before rebooting. Look beyond the initial symptom.",
  },
  {
    id: "disk-full-mystery",
    title: "Phantom Disk Full — Production Alert",
    description: "Root filesystem shows 100% full but du disagrees. Services are failing. Find the ghost.",
    difficulty: "intermediate",
    topicTags: ["linux", "ops-processes"],
    steps: [
      {
        prompt: "ALERT: gpu-rack08-node03 root filesystem at 100%. Services failing to write logs. What's your first diagnostic step?",
        hints: ["Which commands show disk usage from different perspectives?", "Compare filesystem-level vs directory-level usage"],
        answer: "Run df -hT to confirm which filesystem is full and the mount point. Then run du -sh /* | sort -h to see what's consuming space. Compare the two — if df shows full but du shows significantly less, you have deleted-but-held files.",
        keyTerms: ["df", "du", "compare", "mount"],
      },
      {
        prompt: "df shows /dev/sda2 at 100% (100G). du -sh / reports only 52G used. Where's the missing 48G?",
        hints: ["What happens to disk space when a file is deleted but a process still has it open?", "There's a specific tool for finding these"],
        answer: "A process is holding open a deleted file. The file is gone from the directory listing but the disk blocks aren't freed until the file descriptor is closed. Run lsof | grep deleted to find the culprit process and file.",
        keyTerms: ["lsof", "deleted", "file descriptor", "process"],
      },
      {
        prompt: "lsof shows rsyslogd holding a 45G deleted syslog.1 file. How do you reclaim the space without losing current logs?",
        hints: ["You can't just rm it again — it's already deleted", "Think about what happens when you restart the process"],
        answer: "Restart rsyslogd: systemctl restart rsyslog. This closes the old file descriptor, freeing the 45G. Then investigate why the log grew so large — check log rotation config in /etc/logrotate.d/rsyslog. Consider adding size limits and more frequent rotation.",
        keyTerms: ["restart", "rsyslog", "logrotate", "rotation", "file descriptor"],
      },
      {
        prompt: "Space reclaimed. How do you prevent this from happening again?",
        hints: ["Think about monitoring and log management", "What configuration controls log file sizes?"],
        answer: "1. Fix logrotate config: ensure maxsize is set and rotation frequency is adequate. 2. Add monitoring alert for disk usage at 80% threshold (not just critical at 95%). 3. Consider using journald with SystemMaxUse= to cap journal size. 4. Set up a weekly cron to check for large deleted-but-held files: lsof +D /var/log | grep deleted.",
        keyTerms: ["logrotate", "monitoring", "threshold", "journald", "cron"],
      },
    ],
    summary: "Root full → df vs du mismatch → lsof finds deleted-but-held 45G syslog → restart rsyslogd → fix logrotate config → add proactive monitoring.",
    keyPrinciple: "When df and du disagree, think deleted-but-held files. Always fix the root cause (log rotation) not just the symptom.",
  },
  {
    id: "network-flapping",
    title: "NIC Flapping — Intermittent Connectivity",
    description: "A compute node keeps losing network connectivity for 5-10 seconds at a time. Training jobs are failing with NCCL timeouts.",
    difficulty: "advanced",
    topicTags: ["networking", "hardware", "linux"],
    steps: [
      {
        prompt: "ALERT: gpu-rack15-node02 has had 12 link-down events in the last hour. NCCL training jobs are timing out. Where do you start?",
        hints: ["Check the interface state and error counters", "Look at both the OS and physical layer"],
        answer: "Check dmesg -T | grep -i 'link\\|eth' for kernel-level link events with timestamps. Then ethtool eth0 to check current link state, speed, and duplex. Also check ethtool -S eth0 for error counters — CRC errors, frame errors, and carrier errors point to physical layer issues.",
        keyTerms: ["dmesg", "ethtool", "link", "CRC", "error counters"],
      },
      {
        prompt: "ethtool -S eth0 shows 847 rx_crc_errors and climbing. Link speed is bouncing between 100Gbps and 25Gbps. What does this tell you?",
        hints: ["CRC errors indicate data corruption on the wire", "Speed negotiation changes suggest physical issues"],
        answer: "CRC errors + speed flapping strongly suggests a physical layer problem: bad cable, dirty fiber connector, or a failing transceiver (SFP/QSFP). The NIC is auto-negotiating down to a lower speed when signal quality degrades. This is NOT a software issue.",
        keyTerms: ["physical", "cable", "transceiver", "SFP", "QSFP", "auto-negotiat"],
      },
      {
        prompt: "You're heading to the floor. What's your systematic approach to isolate whether it's the cable, transceiver, or switch port?",
        hints: ["Swap one variable at a time", "Check the switch side too"],
        answer: "1. Visual inspect: check for bent pins, dirty connectors, tight bend radius on fiber. 2. Clean fiber connectors with IPA wipes. 3. Check switch port: show interface counters on the ToR switch for matching errors. 4. Swap the cable first (cheapest component). 5. If errors persist, swap the transceiver. 6. If still failing, try a different switch port. 7. Only one variable at a time — otherwise you can't identify root cause.",
        keyTerms: ["inspect", "clean", "swap", "switch port", "one variable", "cable", "transceiver"],
      },
      {
        prompt: "Cable swap fixed it — CRC errors stopped, link is stable at 100Gbps. What do you do to close this out?",
        hints: ["Documentation and prevention", "What about the failed cable?"],
        answer: "1. Monitor for 15-30 minutes to confirm stability. 2. Label the bad cable and remove from inventory (don't reuse). 3. Update the incident ticket with root cause: faulty cable between node02 port eth0 and ToR switch port Eth1/15. 4. Check adjacent ports/cables in the same bundle for similar issues (batch failure). 5. Verify NCCL training jobs resume successfully.",
        keyTerms: ["monitor", "label", "incident", "root cause", "adjacent", "NCCL"],
      },
    ],
    summary: "Link flapping → dmesg + ethtool diagnostics → CRC errors indicate physical layer → systematic swap isolation → bad cable identified → replaced and documented.",
    keyPrinciple: "CRC errors and speed flapping almost always mean physical layer. Swap one variable at a time to isolate. Never reuse a bad cable.",
  },
  {
    id: "permission-lockout",
    title: "Permission Disaster — Locked Out of Production",
    description: "Someone ran a recursive chmod and now critical services are failing. SSH still works but sudo doesn't.",
    difficulty: "intermediate",
    topicTags: ["linux", "ops-processes"],
    steps: [
      {
        prompt: "ALERT: Multiple services failing on gpu-rack03-node11. You SSH in successfully but sudo gives 'sudo: /etc/sudoers is owned by uid 1000, should be 0'. What happened?",
        hints: ["What would cause sudoers ownership to change?", "Think about recursive permission changes"],
        answer: "Someone ran chown -R or chmod -R on a parent directory that included /etc. The sudoers file must be owned by root (uid 0) with mode 0440. Without working sudo, you need an alternative path to root.",
        keyTerms: ["chown", "chmod", "recursive", "sudoers", "root", "0440"],
      },
      {
        prompt: "You can't sudo. How do you get root access to fix this?",
        hints: ["Are there other ways to become root?", "Think about out-of-band access"],
        answer: "Options: 1. If root password is known: su - root. 2. BMC/IPMI SOL console may have a root session. 3. Boot into single-user/rescue mode via IPMI. 4. If another node has SSH keys to this node as root, use that. 5. Physical console access. In a DC environment, IPMI rescue mode is usually fastest.",
        keyTerms: ["su", "IPMI", "rescue", "single-user", "console", "root password"],
      },
      {
        prompt: "You're now root via IPMI console. What's your systematic approach to fixing the permissions?",
        hints: ["Fix the critical files first", "What's the correct ownership and permissions for key system files?"],
        answer: "Fix critical files first: 1. chown root:root /etc/sudoers && chmod 0440 /etc/sudoers. 2. chown root:root /etc/shadow && chmod 0640 /etc/shadow. 3. chown root:root /etc/passwd && chmod 0644 /etc/passwd. 4. For broader repair: rpm -a --setperms (RHEL) or apt install --reinstall on affected packages (Debian). 5. Check /etc/ssh/ permissions — sshd is picky about key file permissions.",
        keyTerms: ["chown", "chmod", "sudoers", "shadow", "passwd", "rpm", "setperms", "ssh"],
      },
      {
        prompt: "Permissions are restored and services are recovering. How do you prevent this from happening again?",
        hints: ["Think about guardrails and monitoring", "What audit trail exists?"],
        answer: "1. Check auth.log / secure log + bash_history to identify who ran the bad command and when. 2. Implement AIDE or similar file integrity monitoring on /etc. 3. Restrict recursive chown/chmod in production — use a wrapper script that refuses to run on system directories. 4. Add this as a post-mortem item and training scenario. 5. Consider immutable infrastructure where /etc changes require a deploy pipeline.",
        keyTerms: ["audit", "history", "integrity", "monitoring", "post-mortem", "immutable"],
      },
    ],
    summary: "Recursive chown broke sudoers → used IPMI for root access → restored critical file permissions → repaired system-wide with rpm --setperms → audited and added guardrails.",
    keyPrinciple: "Always have an out-of-band path to root. Fix critical auth files first (sudoers, shadow, passwd). Use package manager to restore system-wide permissions.",
  },
  {
    id: "gpu-thermal-shutdown",
    title: "GPU Thermal Cascade — Cooling Failure",
    description: "Multiple GPUs are hitting thermal limits. Training jobs are crashing across a rack. Could be a cooling issue.",
    difficulty: "expert",
    topicTags: ["hardware", "power-cooling", "ops-processes"],
    steps: [
      {
        prompt: "ALERT: 6 of 8 nodes in rack 19 reporting GPU temperatures above 85°C. nvidia-smi shows throttling on all affected nodes. What's your initial assessment?",
        hints: ["If it's affecting multiple nodes in the same rack, is it likely a software issue?", "What shared resource do all nodes in a rack have?"],
        answer: "Multiple nodes in the same rack = almost certainly a shared infrastructure issue, not individual node problems. Top suspects: rack-level cooling failure (CRAC/CRAH unit, rear door heat exchanger), blocked airflow (failed fans, obstructed exhaust), or facility coolant issue. Check the rack-level environmental sensors and BMS/DCIM dashboard first.",
        keyTerms: ["cooling", "rack", "infrastructure", "CRAC", "airflow", "BMS", "DCIM", "sensors"],
      },
      {
        prompt: "BMS shows the rear door heat exchanger for rack 19 has coolant flow at zero. Inlet water temperature is normal for adjacent racks. What now?",
        hints: ["The heat exchanger needs coolant flow to work", "Is this something you can fix or do you need to escalate?"],
        answer: "Zero coolant flow to one rack's heat exchanger = likely a closed valve, failed pump, or leak in the coolant loop for that rack. Immediate actions: 1. Drain GPU workloads from all rack 19 nodes to prevent thermal damage. 2. Escalate to facilities/mechanical team for coolant system inspection. 3. Open an emergency maintenance ticket. 4. Do NOT power off nodes unless temps exceed shutdown threshold — graceful drain is safer.",
        keyTerms: ["drain", "workload", "facilities", "coolant", "valve", "pump", "escalate", "graceful"],
      },
      {
        prompt: "Facilities found a closed isolation valve — someone shut it during maintenance yesterday and forgot to reopen. Coolant is flowing again. How do you bring the rack back online?",
        hints: ["Don't just slam all workloads back immediately", "Verify thermal recovery first"],
        answer: "1. Wait for GPU temperatures to drop below 60°C across all nodes (monitor via nvidia-smi -l 5). 2. Run GPU health checks: nvidia-smi -q for any new ECC errors that occurred during thermal stress. 3. Bring nodes back one at a time, monitoring temps under load. 4. Run a short test workload on each node before returning to production. 5. Verify no GPUs suffered permanent damage from extended thermal stress.",
        keyTerms: ["temperature", "cool", "health check", "ECC", "one at a time", "test workload", "monitor"],
      },
      {
        prompt: "All nodes are back and healthy. What process changes do you recommend?",
        hints: ["How do you prevent the same mistake?", "What monitoring should catch this earlier?"],
        answer: "1. Post-mortem: valve was left closed after maintenance — need a maintenance completion checklist that includes verifying coolant flow. 2. Add coolant flow monitoring alerts per rack (not just temperature — flow drops before temps rise). 3. Require two-person signoff for any coolant system valve changes. 4. Tag valves with last-changed date and operator name. 5. Integrate rack-level thermal alerts with the workload scheduler so it can auto-drain before damage occurs.",
        keyTerms: ["post-mortem", "checklist", "flow monitoring", "alert", "two-person", "auto-drain", "scheduler"],
      },
    ],
    summary: "Multi-node thermal alerts → rack-level cooling failure → zero coolant flow → closed isolation valve → drain workloads → facilities fix → phased recovery → process improvements.",
    keyPrinciple: "Multi-node symptoms in the same rack = shared infrastructure problem. Drain workloads immediately to prevent hardware damage. Monitor coolant flow, not just temperature.",
  },
];
