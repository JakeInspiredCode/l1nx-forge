// ═══════════════════════════════════════════════════════════════
// TERMINAL SIMULATOR — Command Database
// Simulated GPU compute node: gpu-rack12-node07
// ══════════════════════════��════════════════════════════════════

export const HOSTNAME = "gpu-rack12-node07";
export const USER = "ops";
export const PROMPT_USER = "ops@node07";

export interface TerminalCommand {
  output: string;
  description?: string;
}

export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {
  pwd: {
    output: "/home/ops",
    description: "Print working directory",
  },
  ls: {
    output: "Desktop  Documents  scripts  logs  .bashrc  .ssh",
    description: "List directory contents",
  },
  "ls -la": {
    output: `total 48
drwxr-xr-x  6 ops dcteam 4096 Mar 29 08:00 .
drwxr-xr-x  3 root root  4096 Jan 10 12:00 ..
-rw-------  1 ops dcteam  220 Jan 10 12:00 .bash_history
-rw-r--r--  1 ops dcteam 3526 Jan 10 12:00 .bashrc
drwx------  2 ops dcteam 4096 Jan 10 12:00 .ssh
drwxr-xr-x  2 ops dcteam 4096 Mar 29 07:00 Desktop
drwxr-xr-x  2 ops dcteam 4096 Mar 28 14:00 Documents
drwxr-xr-x  2 ops dcteam 4096 Mar 29 08:00 scripts
drwxr-xr-x  2 ops dcteam 4096 Mar 29 06:00 logs`,
    description: "Detailed file listing with hidden files",
  },
  "cat /etc/hostname": {
    output: "gpu-rack12-node07",
    description: "Show hostname",
  },
  uptime: {
    output: " 08:42:31 up 47 days,  3:21,  2 users,  load average: 0.42, 0.38, 0.31",
    description: "System uptime and load averages",
  },
  "free -h": {
    output: `              total        used        free      shared  buff/cache   available
Mem:          128Gi       89Gi       2.1Gi       1.2Gi        37Gi        36Gi
Swap:          16Gi       0.3Gi       15Gi`,
    description: "Memory usage",
  },
  "df -hT": {
    output: `Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda2      ext4   100G   67G   28G  71% /
/dev/nvme0n1p1 xfs    3.5T  2.8T  700G  80% /mnt/ai-data
tmpfs          tmpfs   64G  1.2G   63G   2% /dev/shm
/dev/sdb1      xfs    1.8T  1.1T  700G  61% /mnt/checkpoints`,
    description: "Filesystem usage with types",
  },
  "nvidia-smi": {
    output: `+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.129.03   Driver Version: 535.129.03   CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA H100 80GB    On   | 00000000:17:00.0 Off |                    0 |
| N/A   42C    P0    72W / 700W |    312MiB / 81559MiB |      3%      Default |
|   1  NVIDIA H100 80GB    On   | 00000000:31:00.0 Off |                    0 |
| N/A   39C    P0    68W / 700W |    128MiB / 81559MiB |      0%      Default |
|   2  NVIDIA H100 80GB    On   | 00000000:4B:00.0 Off |                    0 |
| N/A   44C    P0    75W / 700W |  78432MiB / 81559MiB |     97%      Default |
|   3  NVIDIA H100 80GB    On   | 00000000:65:00.0 Off |                    0 |
| N/A   41C    P0    70W / 700W |  78432MiB / 81559MiB |     96%      Default |
+-------------------------------+----------------------+----------------------+`,
    description: "GPU status, temperatures, and utilization",
  },
  "dmesg -T | tail -5": {
    output: `[Sun Mar 29 08:30:01 2026] nvidia 0000:4b:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:31:12 2026] EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)
[Sun Mar 29 08:35:44 2026] XFS (nvme0n1p1): Ending clean mount
[Sun Mar 29 08:40:01 2026] nvidia 0000:65:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:42:30 2026] eth0: link up at 100000Mbps/Full`,
    description: "Recent kernel messages with timestamps",
  },
  "ip addr show": {
    output: `1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.15.107/24 brd 10.42.15.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.16.107/24 brd 10.42.16.255 scope global eth1`,
    description: "Network interfaces and IP addresses",
  },
  "ss -tlnp": {
    output: `State    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
LISTEN   0       128     0.0.0.0:22         0.0.0.0:*         users:(("sshd",pid=1042,fd=3))
LISTEN   0       128     0.0.0.0:9100       0.0.0.0:*         users:(("node_exporter",pid=2891,fd=3))
LISTEN   0       128     0.0.0.0:8080       0.0.0.0:*         users:(("health-agent",pid=3201,fd=5))`,
    description: "Listening TCP ports and processes",
  },
  "lsblk -f": {
    output: `NAME        FSTYPE LABEL UUID                                 MOUNTPOINT
sda
├─sda1      vfat         A1B2-C3D4                             /boot/efi
└─sda2      ext4         a1b2c3d4-e5f6-7890-abcd-ef1234567890 /
nvme0n1
└─nvme0n1p1 xfs          f0e1d2c3-b4a5-9687-fedc-ba0987654321 /mnt/ai-data
sdb
└─sdb1      xfs          11223344-5566-7788-99aa-bbccddeeff00 /mnt/checkpoints`,
    description: "Block devices with filesystem info",
  },
  "systemctl status sshd": {
    output: `● sshd.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Mon 2026-02-10 05:21:31 UTC; 47 days ago
   Main PID: 1042 (sshd)
      Tasks: 1 (limit: 154428)
     Memory: 5.2M
        CPU: 12.431s
     CGroup: /system.slice/ssh.service
             ��─1042 sshd: /usr/sbin/sshd -D`,
    description: "SSH service status",
  },
  "ps aux --sort=-%cpu | head -5": {
    output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      8921 97.2  0.1 183264 12840 ?       Sl   08:30 12:01 /opt/ai/training-worker
root      8922 96.8  0.1 183264 12740 ?       Sl   08:30 11:58 /opt/ai/training-worker
nobody    2891  0.3  0.0  19284  5120 ?       Ssl  Feb10   2:41 /usr/bin/node_exporter
root      1042  0.0  0.0  15420  6084 ?       Ss   Feb10   0:12 sshd: /usr/sbin/sshd -D`,
    description: "Top CPU-consuming processes",
  },
  "smartctl -a /dev/sda | grep -E 'Health|Reallocated|Pending'": {
    output: `SMART overall-health self-assessment test result: PASSED
  5 Reallocated_Sector_Ct   0x0033   100   100   010    Pre-fail  Always       -       0
197 Current_Pending_Sector  0x0012   100   100   000    Old_age   Always       -       0`,
    description: "SMART disk health check",
  },
  "lsof | grep deleted": {
    output: `COMMAND    PID   USER   FD   TYPE DEVICE    SIZE/OFF NODE NAME
rsyslogd  1285   root    7w   REG  8,2  4831838208 1048589 /var/log/syslog.1 (deleted)
nginx     3842   www    12w   REG  8,2   209715200 1048603 /var/log/nginx/access.log.2 (deleted)`,
    description: "Find deleted files still held open by processes",
  },
  "dmidecode -t memory": {
    output: `# dmidecode 3.4
Handle 0x0044, DMI type 17, 92 bytes
Memory Device
        Size: 64 GB
        Locator: DIMM 2B
        Bank Locator: P0_Node0_Channel0_Dimm1
        Type: DDR5
        Speed: 4800 MT/s
        Manufacturer: Samsung
        Serial Number: S4E93AB2110847
        Part Number: M321R8GA0BB0-CQKZJ

Handle 0x0046, DMI type 17, 92 bytes
Memory Device
        Size: 64 GB
        Locator: DIMM 3A
        Bank Locator: P0_Node0_Channel1_Dimm0
        Type: DDR5
        Speed: 4800 MT/s
        Manufacturer: Samsung
        Serial Number: S4E93AB2110912
        Part Number: M321R8GA0BB0-CQKZJ`,
    description: "DIMM details for RMA tickets",
  },
  "find /var -type f -size +100M -mmin -60": {
    output: `/var/log/syslog    142M
/var/log/nvidia-persistenced.log    187M`,
    description: "Large files modified in the last hour",
  },
  "ethtool eth0": {
    output: `Settings for eth0:
        Supported ports: [ FIBRE ]
        Supported link modes: 100000baseSR4/Full
        Speed: 100000Mb/s
        Duplex: Full
        Auto-negotiation: on
        Link detected: yes
        Transceiver: internal`,
    description: "NIC speed, duplex, and link status",
  },
  "ipmitool sensor list | head -10": {
    output: `Inlet Temp       | 22.000     | degrees C  | ok    | na    | na    | na    | 42.0  | 47.0  | na
Exhaust Temp     | 38.000     | degrees C  | ok    | na    | na    | na    | 70.0  | 75.0  | na
CPU1 Temp        | 52.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
CPU2 Temp        | 49.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
Fan1 RPM         | 8400.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
Fan2 RPM         | 8200.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
PSU1 Power       | 820.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
PSU2 Power       | 790.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
System Board Pwr | 1610.000   | Watts      | ok    | na    | na    | na    | 2800  | 3000  | na
DIMM Thrm Mrgn   | 42.000     | degrees C  | ok    | na    | na    | na    | 5.0   | 2.0   | na`,
    description: "IPMI hardware sensor readings",
  },
  "journalctl -b -p err --no-pager | tail -10": {
    output: `Mar 29 06:15:01 gpu-rack12-node07 CRON[4521]: pam_unix(cron:session): session closed for user root
Mar 29 07:00:03 gpu-rack12-node07 nvidia-persistenced[1187]: Failed to query device status for GPU 0000:4B:00.0 (retrying)
Mar 29 07:00:05 gpu-rack12-node07 nvidia-persistenced[1187]: Device query recovered for GPU 0000:4B:00.0
Mar 29 08:31:12 gpu-rack12-node07 kernel: EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)`,
    description: "Error-level journal entries since last boot",
  },
  "cat /proc/cpuinfo | head -20": {
    output: `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model name	: Intel(R) Xeon(R) w9-3495X
stepping	: 4
cpu MHz		: 1900.000
cache size	: 107520 KB
physical id	: 0
siblings	: 112
cpu cores	: 56
bogomips	: 3800.00
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm avx avx2 avx512f`,
    description: "CPU information",
  },
  whoami: {
    output: "ops",
    description: "Current user",
  },
  hostname: {
    output: "gpu-rack12-node07",
    description: "System hostname",
  },
  "uname -a": {
    output: "Linux gpu-rack12-node07 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64 GNU/Linux",
    description: "Full kernel and system information",
  },
  help: {
    output: `Available commands:
  System:     pwd, ls, ls -la, cat /etc/hostname, uptime, whoami, hostname, uname -a
  Memory:     free -h, cat /proc/cpuinfo | head -20
  Disk:       df -hT, lsblk -f, smartctl -a /dev/sda | grep -E 'Health|Reallocated|Pending'
  GPU:        nvidia-smi
  Network:    ip addr show, ss -tlnp, ethtool eth0
  Processes:  ps aux --sort=-%cpu | head -5, systemctl status sshd
  Logs:       dmesg -T | tail -5, journalctl -b -p err --no-pager | tail -10
  Debug:      lsof | grep deleted, dmidecode -t memory, ipmitool sensor list | head -10
  Files:      find /var -type f -size +100M -mmin -60
  Terminal:   clear, help`,
    description: "Show available commands",
  },
};
