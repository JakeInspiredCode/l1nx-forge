# Linux — Study Guide

Linux is the operating system running on virtually every server in modern data centers, including the compute nodes, storage servers, and management infrastructure at xAI's Colossus cluster. As a Datacenter Operations Technician, you need working fluency with the Linux command line to troubleshoot hardware issues, diagnose software failures, manage processes, and maintain the systems that power GPU compute workloads.

This guide covers the eight competency areas listed in the xAI job posting.

## 1. Navigating the Filesystem

Linux organizes everything in a single directory tree rooted at `/`. Key directories for DC Ops work:

| Path | Contents |
|---|---|
| `/var/log` | System and application logs. Note: `/var/log/dmesg` is a boot-time snapshot of the kernel ring buffer, not a live log — use the `dmesg` command or `journalctl -k` for current kernel messages. |
| `/etc` | Configuration files |
| `/proc` | Virtual filesystem exposing kernel and process info |
| `/sys` | Virtual filesystem exposing hardware and driver info |
| `/dev` | Device files (disks, GPUs, serial ports) |
| `/tmp` | Temporary files, cleared on reboot |
| `/home` | User home directories |
| `/opt` | Optional/third-party software |
| `/mnt`, `/media` | Mount points for external filesystems |

Essential navigation commands:

```bash
pwd                     # Print current directory
cd /var/log             # Change to /var/log
cd ..                   # Move up one level
cd ~                    # Move to home directory
cd -                    # Return to previous directory
ls -la                  # List all files with details (permissions, size, timestamps)
ls -lh                  # Human-readable file sizes
tree -L 2               # Directory tree, 2 levels deep
```

Absolute paths start from `/` (e.g., `/var/log/syslog`). Relative paths start from your current directory (e.g., `../etc/hosts`). In DC Ops, prefer absolute paths in scripts and documentation — they work regardless of where you run them.

## 2. File Manipulation

Creating, copying, moving, and deleting files are daily operations — moving logs for analysis, copying configs before changes, cleaning up temp files.

```bash
touch newfile.txt                    # Create empty file or update timestamp
cp source.txt dest.txt               # Copy file
cp -r /etc/nginx /backup/nginx       # Copy directory recursively
mv oldname.txt newname.txt           # Rename / move
rm unwanted.txt                      # Delete file (no undo)
rm -rf /tmp/old_logs/                # Delete directory recursively (use with extreme care)
mkdir -p /opt/scripts/monitoring     # Create directory and parents
```

Viewing and searching file contents:

```bash
cat /etc/hostname                    # Print entire file
less /var/log/syslog                 # Paginated viewer (q to quit)
dmesg -T | head -n 50               # First 50 kernel messages (with timestamps)
tail -n 100 /var/log/syslog         # Last 100 lines
tail -f /var/log/syslog             # Follow log output in real time
grep "error" /var/log/syslog        # Search for pattern in file
grep -ri "gpu" /var/log/            # Recursive, case-insensitive search
wc -l /var/log/syslog               # Count lines in file
```

Redirection and pipes:

```bash
dmesg | grep -i "error"             # Pipe dmesg output into grep
ls -la > listing.txt                # Redirect stdout to file (overwrite)
echo "note" >> logfile.txt          # Append to file
command 2>&1 | tee output.log       # Capture stdout+stderr, display and save
```

## 3. User Permissions

Linux permissions control who can read, write, and execute files. The permission model uses three scopes: owner (u), group (g), and others (o), each with read (r=4), write (w=2), and execute (x=1) bits.

```bash
ls -la script.sh
# -rwxr-xr-- 1 ops dcteam 2048 Jan 15 09:30 script.sh
#  ^^^           owner: read+write+execute (7)
#     ^^^        group: read+execute (5)
#        ^^^     others: read only (4)
```

```bash
chmod 755 script.sh                  # Owner: rwx, group: r-x, others: r-x
chmod u+x script.sh                  # Add execute for owner only
chmod -R 750 /opt/monitoring/        # Recursive permission change
chown ops:dcteam script.sh           # Change owner and group
chown -R ops:dcteam /opt/scripts/    # Recursive ownership change
```

Special permissions relevant to DC Ops:

- **SUID** (4xxx): File runs as the file owner, not the executing user. Example: `/usr/bin/passwd` runs as root so users can change their own passwords. Security risk if misapplied.
- **SGID** (2xxx): On directories, new files inherit the directory's group. Useful for shared team directories.
- **Sticky bit** (1xxx): On directories, only the file owner can delete their files. Applied to `/tmp` by default.

```bash
sudo usermod -aG docker ops         # Add user 'ops' to 'docker' group
groups ops                           # List groups for user
id ops                               # Show UID, GID, and all group memberships
```

## 4. Package Management

Data center servers typically run either RHEL-family (RHEL, CentOS, Rocky Linux, AlmaLinux) or Debian-family (Ubuntu, Debian) distributions. Each uses a different package manager.

**RHEL-family (dnf/yum):**

```bash
dnf search htop                      # Search for package
dnf install htop -y                  # Install package
dnf upgrade                          # Upgrade all packages (update is a deprecated alias)
dnf remove htop                      # Remove package
dnf list installed                   # List installed packages
rpm -qa | grep nvidia                # Query installed RPMs by name
rpm -qi nvidia-driver                # Package info (version, vendor, install date)
```

**Debian-family (apt):**

```bash
apt update                           # Refresh package index
apt search htop                      # Search
apt install htop -y                  # Install
apt upgrade                          # Upgrade all packages
apt remove htop                      # Remove (keep config)
apt purge htop                       # Remove including config
dpkg -l | grep nvidia                # List installed .deb packages
```

In production data centers, package updates are controlled — you don't run `apt upgrade` on a production node without a maintenance window and a change ticket. Repositories are often mirrored internally to prevent untested updates from reaching servers.

## 5. Filesystem Types

Different workloads and use cases call for different filesystems.

| Filesystem | Use Case | Key Traits |
|---|---|---|
| ext4 | General purpose, boot partitions | Journaling, mature, widely supported. Vendor-supported up to 50 TiB volume, 16 TiB max file size. The file size cap is a key reason XFS is preferred for large dataset and checkpoint workloads. |
| XFS | Large files, high throughput | Default on RHEL, excellent parallel I/O, no practical file size limit for DC workloads, max 8 EiB volume. Cannot be shrunk (only grown). |
| tmpfs | Temporary in-memory storage | Lives in RAM, lost on reboot, very fast |
| NFS | Network-shared storage | Remote mount over network, used for shared configs and home dirs |
| ZFS | Storage pools with built-in integrity | Checksumming, snapshots, compression, copy-on-write |
| Btrfs | Copy-on-write with snapshots | Subvolumes, checksumming, less mature than ZFS for production |

Working with filesystems:

```bash
df -hT                               # Show mounted filesystems with types and usage
lsblk                                # List block devices and partitions
mount | column -t                    # Show all mounts, formatted
blkid                                # Show UUIDs and filesystem types for block devices
mkfs.ext4 /dev/sdb1                  # Format partition as ext4
mount /dev/sdb1 /mnt/data            # Mount a partition
umount /mnt/data                     # Unmount
cat /etc/fstab                       # Persistent mount configuration
```

In DC Ops, you'll encounter filesystem issues: full disks causing service failures (`df -h` to check usage, `du -sh /*` to find what's consuming space), read-only remounts caused by disk errors (check `dmesg` for I/O errors), and NFS stale handles on network-mounted storage.

## 6. Process Management

Every running program is a process. Managing processes is core to troubleshooting server issues — finding what's consuming CPU or memory, restarting failed services, and identifying zombie or stuck processes.

```bash
ps aux                               # List all processes with details
ps aux --sort=-%mem | head -20       # Top 20 by memory usage
top                                  # Interactive process viewer (q to quit)
htop                                 # Enhanced interactive viewer (if installed)
kill <PID>                           # Send SIGTERM (graceful shutdown)
kill -9 <PID>                        # Send SIGKILL (force kill — last resort)
killall <process_name>               # Kill all processes by name
```

**systemd** manages services on modern Linux distributions:

```bash
systemctl status nvidia-persistenced # Check service status
systemctl start sshd                 # Start a service
systemctl stop sshd                  # Stop a service
systemctl restart networking         # Restart a service
systemctl enable sshd                # Enable service to start on boot
systemctl disable sshd               # Disable auto-start
journalctl -u sshd -f               # Follow logs for a specific service
journalctl --since "1 hour ago"      # Logs from the last hour
```

**Signals:** `SIGTERM` (15) asks a process to shut down gracefully. `SIGKILL` (9) forces immediate termination — the process gets no chance to clean up. Always try SIGTERM first. `SIGHUP` (1) is often used to reload configuration without restarting.

**Zombie processes** appear as `Z` in `ps` output. They've finished executing but their parent hasn't collected their exit status. Usually harmless in small numbers but can indicate a buggy parent process.

## 7. Troubleshooting and Debugging

Systematic troubleshooting is the core of DC Ops work. Your goal is to reduce MTTD (mean time to detect) and MTTR (mean time to repair).

**Log analysis:**

```bash
journalctl -p err --since today      # Errors from today
dmesg | tail -50                     # Recent kernel messages (hardware errors, driver issues)
dmesg -T                             # dmesg with human-readable timestamps
cat /var/log/syslog                  # General system log (Debian/Ubuntu)
cat /var/log/messages                # General system log (RHEL)
```

**Hardware diagnostics:**

```bash
lspci                                # List PCI devices (GPUs, NICs, storage controllers)
lspci -v | grep -i nvidia            # Detailed info on NVIDIA devices
lsusb                                # List USB devices
dmidecode -t memory                  # Memory DIMM details (requires root)
smartctl -a /dev/sda                 # SMART disk health data
sensors                              # CPU/board temperatures (lm-sensors package)
nvidia-smi                           # GPU status, temperature, memory, utilization
```

**Network diagnostics:**

```bash
ip addr show                         # Show network interfaces and IPs
ip link show                         # Interface link status (up/down)
ping -c 4 <host>                     # Basic connectivity test
traceroute <host>                    # Path to destination
ss -tlnp                             # Show listening TCP ports with process names
curl -v http://host:port/health      # Test HTTP endpoint with verbose output
ethtool eth0                         # NIC details (speed, duplex, link status)
```

**Disk and I/O:**

```bash
iostat -xz 1                         # Per-disk I/O stats, 1-second intervals
iotop                                # I/O by process (if installed)
df -h                                # Filesystem usage
du -sh /var/log/*                    # Size of each item in /var/log
```

**Memory:**

```bash
free -h                              # Memory and swap usage
vmstat 1                             # Virtual memory stats, 1-second interval
cat /proc/meminfo                    # Detailed memory info
```

## 8. Bash Scripting

Scripts automate repetitive tasks — health checks, log rotation, batch operations, and monitoring. In DC Ops, even simple scripts save significant time across thousands of nodes.

```bash
#!/bin/bash
# Basic script structure

# Variables
LOGDIR="/var/log"
THRESHOLD=90

# Command substitution + conditionals
disk_usage=$(df / --output=pcent | tail -1 | tr -d ' %')
if [ "$disk_usage" -gt "$THRESHOLD" ]; then
    echo "WARNING: Disk usage above ${THRESHOLD}% (currently ${disk_usage}%)"
fi

# Loops
for host in node01 node02 node03; do
    ssh "$host" "uptime"
done

# Functions
check_gpu() {
    nvidia-smi --query-gpu=name,temperature.gpu --format=csv,noheader
}

# Command substitution
HOSTNAME=$(hostname)
DATE=$(date +%Y-%m-%d)

# Exit codes
# 0 = success, non-zero = failure
exit 0
```

Common patterns for DC Ops scripts:

```bash
# Quick health check across multiple nodes
for node in $(cat /etc/hosts_list); do
    echo "--- $node ---"
    ssh "$node" "uptime; df -h / | tail -1; nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader" 2>/dev/null || echo "UNREACHABLE"
done

# Find and compress old logs
find /var/log -name "*.log" -mtime +7 -exec gzip {} \;
```

Key scripting concepts for interviews: shebang line (`#!/bin/bash`), variables and quoting (double quotes preserve variables, single quotes are literal), exit codes (`$?`), conditionals (`if/then/elif/else/fi`), loops (`for/while`), functions, and command substitution (`$(command)`).

> **Colossus Context**
> xAI's Colossus cluster runs on Linux across its GPU compute nodes, management servers, and infrastructure systems. At the scale of Colossus — one of the largest GPU training clusters in the world, built in the Memphis area — Linux administration isn't a background skill, it's a primary tool. You'll use it to diagnose GPU node failures via `nvidia-smi` and `dmesg`, troubleshoot network connectivity between nodes in the training fabric, check filesystem health on nodes where models are loaded, and manage the services that keep the cluster running. The job posting emphasizes MTTD and MTTR as the two key metrics. Strong Linux fundamentals directly reduce both: faster diagnosis means faster detection, and confident command-line work means faster repair. Scripting skills are especially valuable at this scale — a health check that saves 30 seconds per node saves hours across a fleet of thousands.

---

# Linux — Card Deck

## Tier 1 — Foundations

### CARD linux-001
- tier: 1
- type: easy
- difficulty: 1
- front: What command prints the absolute path of your current working directory?
- back: `pwd` (print working directory). Outputs the full path from root, e.g., `/home/ops/scripts`.

### CARD linux-002
- tier: 1
- type: easy
- difficulty: 1
- front: What command changes your current directory to `/var/log`?
- back: `cd /var/log`. This is an absolute path change. Use `cd -` to return to the previous directory.

### CARD linux-003
- tier: 1
- type: easy
- difficulty: 1
- front: What does `ls -la` display that `ls` alone does not?
- back: `ls -la` shows hidden files (those starting with `.`) via the `-a` flag and long-format details via `-l`: permissions, owner, group, size, and modification timestamp.

### CARD linux-004
- tier: 1
- type: easy
- difficulty: 1
- front: What is the root of the Linux filesystem hierarchy?
- back: `/` (forward slash). All files and directories branch from this single root. There are no drive letters like in Windows.

### CARD linux-005
- tier: 1
- type: easy
- difficulty: 1
- front: What is stored in `/var/log`?
- back: System and application log files. Examples: `syslog` or `messages` (general system log), `auth.log` (authentication events). Note: `/var/log/dmesg` is a boot-time snapshot only — not updated after initial boot on modern systemd distros. Use the `dmesg` command or `journalctl -k` for current kernel messages.

### CARD linux-006
- tier: 1
- type: easy
- difficulty: 1
- front: What is stored in `/etc`?
- back: System-wide configuration files. Examples: `/etc/hostname`, `/etc/fstab` (filesystem mounts), `/etc/hosts`, `/etc/ssh/sshd_config`.

### CARD linux-007
- tier: 1
- type: easy
- difficulty: 1
- front: What is `/proc` and what kind of information does it expose?
- back: `/proc` is a virtual filesystem (not on disk) that exposes kernel and process information at runtime. Examples: `/proc/cpuinfo` (CPU details), `/proc/meminfo` (memory stats), `/proc/<PID>/status` (per-process info).

### CARD linux-008
- tier: 1
- type: easy
- difficulty: 1
- front: What is the difference between an absolute path and a relative path?
- back: An absolute path starts from `/` (e.g., `/var/log/syslog`) and works from any location. A relative path starts from the current directory (e.g., `../log/syslog`) and depends on where you are. Use absolute paths in scripts and documentation.

### CARD linux-009
- tier: 1
- type: easy
- difficulty: 1
- front: What command creates an empty file or updates the timestamp of an existing file?
- back: `touch <filename>`. If the file exists, it updates the access and modification timestamps without changing content. If it doesn't exist, it creates an empty file.

### CARD linux-010
- tier: 1
- type: easy
- difficulty: 1
- front: What command copies a directory and all its contents recursively?
- back: `cp -r <source_dir> <dest_dir>`. The `-r` (recursive) flag is required for directories — without it, `cp` will fail on a directory.

### CARD linux-011
- tier: 1
- type: easy
- difficulty: 1
- front: What is the difference between `rm` and `rm -rf`?
- back: `rm` deletes a single file. `rm -rf` deletes recursively (`-r`) and force-skips confirmation prompts (`-f`). Extremely dangerous with wrong paths — there is no undo.

### CARD linux-012
- tier: 1
- type: easy
- difficulty: 1
- front: What command creates a directory including any missing parent directories?
- back: `mkdir -p /path/to/new/dir`. The `-p` flag creates parent directories as needed instead of failing when an intermediate directory doesn't exist.

### CARD linux-013
- tier: 1
- type: easy
- difficulty: 1
- front: What does `tail -f /var/log/syslog` do?
- back: Follows the file in real time, displaying new lines as they are appended. Essential for watching log output during live troubleshooting. Press `Ctrl+C` to stop.

### CARD linux-014
- tier: 1
- type: easy
- difficulty: 1
- front: What command searches for a text pattern inside a file?
- back: `grep "<pattern>" <file>`. Example: `grep "error" /var/log/syslog`. Add `-i` for case-insensitive, `-r` for recursive directory search, `-n` for line numbers.

### CARD linux-015
- tier: 1
- type: easy
- difficulty: 1
- front: What does the pipe operator `|` do in Linux?
- back: It sends the standard output (stdout) of the command on the left as standard input (stdin) to the command on the right. Example: `dmesg | grep -i "error"` filters kernel messages for errors.

### CARD linux-016
- tier: 1
- type: easy
- difficulty: 1
- front: What is the difference between `>` and `>>` in shell redirection?
- back: `>` redirects output to a file, overwriting existing content. `>>` appends to the file without overwriting. Example: `echo "note" >> log.txt` adds a line to `log.txt`.

### CARD linux-017
- tier: 1
- type: easy
- difficulty: 1
- front: What do the three permission fields represent in `-rwxr-xr--`?
- back: Owner (rwx = read+write+execute), Group (r-x = read+execute), Others (r-- = read only). Each field has three bits for read, write, and execute.

### CARD linux-018
- tier: 1
- type: easy
- difficulty: 1
- front: What numeric value represents `rwxr-xr-x` in octal permission notation?
- back: `755`. Owner: r(4)+w(2)+x(1)=7. Group: r(4)+x(1)=5. Others: r(4)+x(1)=5.

### CARD linux-019
- tier: 1
- type: easy
- difficulty: 1
- front: What command changes the owner and group of a file?
- back: `chown <owner>:<group> <file>`. Example: `chown ops:dcteam script.sh`. Add `-R` for recursive on directories.

### CARD linux-020
- tier: 1
- type: easy
- difficulty: 1
- front: What does the SUID permission bit do on an executable file?
- back: When set, the file executes with the permissions of the file's owner rather than the user running it. Example: `/usr/bin/passwd` has SUID set so normal users can update the password file owned by root.

### CARD linux-021
- tier: 1
- type: easy
- difficulty: 1
- front: What command adds a user to a supplementary group without removing them from existing groups?
- back: `sudo usermod -aG <group> <username>`. The `-a` (append) flag is critical — without it, the user is removed from all groups except the one specified.

### CARD linux-022
- tier: 1
- type: easy
- difficulty: 1
- front: What package manager is used on RHEL, Rocky Linux, and AlmaLinux?
- back: `dnf` (Dandified YUM). It replaced `yum` as the default package manager. Both commands still work on most RHEL-family systems, with `yum` aliased to `dnf`.

### CARD linux-023
- tier: 1
- type: easy
- difficulty: 1
- front: What package manager is used on Ubuntu and Debian?
- back: `apt` (Advanced Package Tool). Use `apt update` to refresh the package index before installing. The older `apt-get` command still works but `apt` is preferred for interactive use.

### CARD linux-024
- tier: 1
- type: easy
- difficulty: 1
- front: What command lists all installed RPM packages on a RHEL-family system?
- back: `rpm -qa`. Pipe to `grep` to filter: `rpm -qa | grep nvidia`. Use `rpm -qi <package>` for detailed info on a specific package.

### CARD linux-025
- tier: 1
- type: easy
- difficulty: 1
- front: Why should you not run `apt upgrade` or `dnf update` on a production server without a change ticket?
- back: Uncontrolled updates can introduce breaking changes, kernel updates that require reboots, or driver incompatibilities. Production environments use controlled maintenance windows, internal repository mirrors, and change management processes.

### CARD linux-026
- tier: 1
- type: easy
- difficulty: 1
- front: What filesystem is the default on RHEL/Rocky Linux?
- back: XFS. It supports very large volumes (up to 8 EiB), has excellent parallel I/O performance, and is well-suited for large file workloads.

### CARD linux-027
- tier: 1
- type: easy
- difficulty: 1
- front: What does the `ext4` filesystem provide that makes it resilient to crashes?
- back: Journaling. ext4 writes metadata changes to a journal before committing them to disk, so if a crash occurs mid-write, the filesystem can replay the journal to recover to a consistent state.

### CARD linux-028
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows mounted filesystems with their types and disk usage?
- back: `df -hT`. `-h` gives human-readable sizes (GB, MB). `-T` includes the filesystem type column (ext4, xfs, tmpfs, etc.).

### CARD linux-029
- tier: 1
- type: easy
- difficulty: 1
- front: What command lists block devices and their partition layouts?
- back: `lsblk`. Shows device names, sizes, types, and mount points in a tree structure. Useful for identifying disks and partitions on a server.

### CARD linux-030
- tier: 1
- type: easy
- difficulty: 1
- front: What file defines persistent filesystem mounts in Linux?
- back: `/etc/fstab`. Each line specifies a device (or UUID), mount point, filesystem type, mount options, and dump/fsck settings. Errors in fstab can prevent a system from booting.

### CARD linux-031
- tier: 1
- type: easy
- difficulty: 1
- front: What is `tmpfs` and where is it typically used?
- back: `tmpfs` is a filesystem that lives in RAM (and swap if needed). It's very fast but data is lost on reboot. Commonly mounted at `/tmp` and `/dev/shm`.

### CARD linux-032
- tier: 1
- type: easy
- difficulty: 1
- front: What command lists all running processes with full details?
- back: `ps aux`. `a` = all users, `u` = user-oriented format (shows owner, CPU%, MEM%), `x` = include processes not attached to a terminal.

### CARD linux-033
- tier: 1
- type: easy
- difficulty: 1
- front: What is the difference between `kill <PID>` and `kill -9 <PID>`?
- back: `kill <PID>` sends SIGTERM (signal 15), asking the process to shut down gracefully. `kill -9 <PID>` sends SIGKILL (signal 9), forcing immediate termination with no cleanup. Always try SIGTERM first.

### CARD linux-034
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows the status of a systemd service?
- back: `systemctl status <service_name>`. Shows whether the service is active/inactive, its PID, recent log output, and whether it's enabled to start on boot.

### CARD linux-035
- tier: 1
- type: easy
- difficulty: 1
- front: What command views logs for a specific systemd service?
- back: `journalctl -u <service_name>`. Add `-f` to follow in real time, or `--since "1 hour ago"` to filter by time.

### CARD linux-036
- tier: 1
- type: easy
- difficulty: 1
- front: What does `systemctl enable <service>` do versus `systemctl start <service>`?
- back: `start` runs the service immediately. `enable` configures it to start automatically on boot. They are independent — you usually need both: `systemctl enable --now <service>` does both at once.

### CARD linux-037
- tier: 1
- type: easy
- difficulty: 1
- front: What is a zombie process?
- back: A process that has finished executing but still has an entry in the process table because its parent hasn't called `wait()` to collect its exit status. Shows as `Z` in `ps` output. Usually harmless in small numbers but indicates a buggy parent.

### CARD linux-038
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows recent kernel messages, including hardware errors and driver events?
- back: `dmesg`. Add `| tail -50` for recent entries, or `-T` for human-readable timestamps. Critical for diagnosing hardware failures — disk errors, memory (ECC) errors, GPU issues, and NIC problems all appear here.

### CARD linux-039
- tier: 1
- type: easy
- difficulty: 1
- front: What command lists PCI devices on a server, such as GPUs, NICs, and storage controllers?
- back: `lspci`. Add `-v` for verbose details or pipe through `grep` to filter: `lspci | grep -i nvidia`.

### CARD linux-040
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows network interfaces and their IP addresses?
- back: `ip addr show` (or `ip a` for short). Shows all interfaces, their state (UP/DOWN), IPv4/IPv6 addresses, and MAC addresses. Replaces the deprecated `ifconfig`.

### CARD linux-041
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows listening TCP ports and the processes using them?
- back: `ss -tlnp`. `-t` = TCP, `-l` = listening, `-n` = numeric (no DNS resolution), `-p` = show process name. Replaces the older `netstat -tlnp`.

### CARD linux-042
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows disk I/O statistics per device?
- back: `iostat -xz 1`. `-x` = extended stats (including await, %util), `-z` = skip idle devices, `1` = refresh every second. Part of the `sysstat` package.

### CARD linux-043
- tier: 1
- type: easy
- difficulty: 1
- front: What command displays memory and swap usage in human-readable format?
- back: `free -h`. Shows total, used, free, shared, buff/cache, and available memory. The "available" column is the best indicator of how much memory is actually free for new processes.

### CARD linux-044
- tier: 1
- type: easy
- difficulty: 1
- front: What does `nvidia-smi` display?
- back: GPU status including: GPU name/model, temperature, power draw, memory usage (used/total), GPU utilization percentage, and running processes. Essential for monitoring GPU compute nodes.

### CARD linux-045
- tier: 1
- type: easy
- difficulty: 1
- front: What is the shebang line and why is it the first line of a bash script?
- back: `#!/bin/bash`. It tells the system which interpreter to use when the script is executed directly. Without it, the system may use a different default shell, causing unexpected behavior.

### CARD linux-046
- tier: 1
- type: easy
- difficulty: 1
- front: What is the meaning of exit code `0` versus a non-zero exit code?
- back: Exit code `0` means success. Any non-zero value means failure. The specific non-zero value can indicate the type of error. Check the last command's exit code with `echo $?`.

### CARD linux-047
- tier: 1
- type: easy
- difficulty: 1
- front: What is the difference between single quotes and double quotes in bash?
- back: Single quotes (`'...'`) treat everything literally — no variable expansion. Double quotes (`"..."`) expand variables and command substitutions. Example: `echo "$HOME"` prints your home path; `echo '$HOME'` prints the literal string `$HOME`.

### CARD linux-048
- tier: 1
- type: easy
- difficulty: 1
- front: What does `$(command)` do in a bash script?
- back: Command substitution — it executes `command` and replaces `$(command)` with its output. Example: `DATE=$(date +%Y-%m-%d)` stores today's date in the `DATE` variable. Preferred over the older backtick syntax.

### CARD linux-049
- tier: 1
- type: easy
- difficulty: 1
- front: What does `/dev` contain and why is it important for hardware troubleshooting?
- back: `/dev` contains device files that represent hardware and virtual devices. Examples: `/dev/sda` (first disk), `/dev/nvidia0` (first GPU), `/dev/ttyS0` (serial port). Missing device files can indicate driver failures or hardware not being detected.

### CARD linux-050
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows the SMART health status of a disk drive?
- back: `smartctl -a /dev/sda` (from the `smartmontools` package). Displays disk health attributes, error logs, and self-test results. Look for reallocated sectors, pending sectors, and uncorrectable errors as indicators of imminent disk failure.

### CARD linux-051
- tier: 1
- type: easy
- difficulty: 1
- front: What does `ethtool eth0` show?
- back: NIC details including link speed (e.g., 25Gbps, 100Gbps), duplex setting, auto-negotiation status, and whether the link is detected. Useful for verifying physical network connectivity and speed mismatches.

### CARD linux-052
- tier: 1
- type: easy
- difficulty: 1
- front: What command shows which disk or partition is using the most space?
- back: `du -sh /*` shows the size of each top-level directory. Drill down into the largest with `du -sh /var/*`, etc. Combine with `sort -h` to rank by size: `du -sh /* 2>/dev/null | sort -h`.

## Tier 2 — Application

### CARD linux-053
- tier: 2
- type: intermediate
- difficulty: 2
- front: A server's root filesystem is at 95% capacity and services are failing. Walk through how you would identify what is consuming space and safely free it.
- back: 1. `df -h` to confirm which filesystem is full and its mount point. 2. `du -sh /* | sort -h` to find the largest top-level directories. 3. Drill into the largest (often `/var/log` or `/tmp`): `du -sh /var/log/* | sort -h`. 4. Check for deleted-but-held files: `lsof +D /var/log | grep deleted` — a process can hold a file descriptor open on a deleted file, preventing space reclaim. 5. Compress or remove old logs: `find /var/log -name "*.log" -mtime +7 -exec gzip {} \;`. 6. If a deleted file is held open, restart the holding process to release the descriptor. 7. Verify: `df -h` again to confirm space is freed.

### CARD linux-054
- tier: 2
- type: intermediate
- difficulty: 2
- front: What is the difference between `ext4` and `XFS`, and when would you choose one over the other?
- back: ext4: mature, widely supported, supports volumes up to 1 EiB, good for general-purpose use and boot partitions. Can be shrunk offline. XFS: default on RHEL, supports volumes up to 8 EiB, superior parallel I/O performance, better for large files and high-throughput workloads. Cannot be shrunk (only grown). Choose ext4 for boot partitions and general use; choose XFS for data volumes, especially with large sequential I/O patterns like those in GPU compute workloads.

### CARD linux-055
- tier: 2
- type: intermediate
- difficulty: 2
- front: How would you find all files modified in the last 24 hours under `/var/log`?
- back: `find /var/log -type f -mtime -1`. `-type f` restricts to files. `-mtime -1` means modification time less than 1 day ago. To find files modified within the last 30 minutes: `find /var/log -type f -mmin -30`. Add `-name "*.log"` to filter by extension.

### CARD linux-056
- tier: 2
- type: intermediate
- difficulty: 2
- front: A process is consuming 98% of CPU on a compute node. How do you identify it and what are your options for handling it?
- back: 1. `top` or `htop` — sort by CPU (press `P` in top) to identify the PID and process name. 2. `ps aux | grep <PID>` for full command-line details. 3. Options: (a) `kill <PID>` to send SIGTERM for graceful shutdown. (b) `kill -9 <PID>` if SIGTERM is ignored (last resort). (c) `renice +10 <PID>` to lower its scheduling priority if it's legitimate but too aggressive. (d) If it's a known service: `systemctl restart <service>`. 4. Investigate root cause — check the process's logs, recent changes, and whether it's expected behavior under load.

### CARD linux-057
- tier: 2
- type: intermediate
- difficulty: 2
- front: What is the sticky bit and why is it set on `/tmp`?
- back: The sticky bit (octal `1xxx`, shown as `t` in the permission string) on a directory means only the file's owner (or root) can delete or rename files within it, even if others have write permission on the directory. It's set on `/tmp` because `/tmp` is world-writable — without the sticky bit, any user could delete any other user's temporary files.

### CARD linux-058
- tier: 2
- type: intermediate
- difficulty: 2
- front: How do you check if a systemd service failed to start and diagnose why?
- back: 1. `systemctl status <service>` — shows "failed" or "inactive" with recent log output. 2. `journalctl -u <service> --no-pager -n 50` — last 50 log lines for that service. 3. `journalctl -u <service> -p err` — only error-level messages. 4. Check the service's config: `systemctl cat <service>` to see the unit file, which tells you what binary it runs, as what user, and with what arguments. 5. Common causes: missing binary, wrong permissions, port conflict, missing dependency, bad config file.

### CARD linux-059
- tier: 2
- type: intermediate
- difficulty: 2
- front: Explain what `2>&1` does and give a practical example.
- back: `2>&1` redirects file descriptor 2 (stderr) to file descriptor 1 (stdout), merging error output with standard output. Practical example: `nvidia-smi 2>&1 | tee /tmp/gpu_check.log` — captures both normal output and errors to a log file while also displaying on screen. Without `2>&1`, errors would go to the terminal but not the file.

### CARD linux-060
- tier: 2
- type: intermediate
- difficulty: 2
- front: A server's NFS mount shows "Stale file handle" errors. What does this mean and how do you resolve it?
- back: A stale NFS handle means the client's cached reference to a remote file or directory is no longer valid — typically because the server exported a different filesystem, the export was restarted, or the underlying path changed. Resolution: 1. Try `umount -f /mnt/nfs_share` (force unmount). If busy: `umount -l /mnt/nfs_share` (lazy unmount — detaches immediately, cleans up when no longer in use). 2. Re-mount: `mount -t nfs server:/export /mnt/nfs_share`. 3. If persistent, check the NFS server's export status and `/etc/exports` configuration. 4. Verify network connectivity to the NFS server.

### CARD linux-061
- tier: 2
- type: intermediate
- difficulty: 2
- front: How does `journalctl` differ from reading log files in `/var/log`?
- back: `journalctl` reads from the systemd journal, a structured binary log. Advantages: filter by service (`-u`), priority level (`-p`), time range (`--since`, `--until`), and boot (`-b`). Supports following (`-f`) and JSON output (`-o json`). Traditional `/var/log` files are plain text, managed by `rsyslog` or `syslog-ng`, and require `grep`/`awk` for filtering. Many systems use both — the journal captures systemd service output, while `/var/log` may hold application-specific logs.

### CARD linux-062
- tier: 2
- type: intermediate
- difficulty: 2
- front: You need to run a script on a server that should continue running after you disconnect your SSH session. What are your options?
- back: 1. `nohup ./script.sh &` — `nohup` ignores the SIGHUP signal sent on disconnect, `&` puts it in background. Output goes to `nohup.out`. 2. `screen` or `tmux` — start a terminal multiplexer session, run the script inside it, then detach (`Ctrl+A D` for screen, `Ctrl+B D` for tmux). Reattach later with `screen -r` or `tmux attach`. 3. `systemd-run --scope ./script.sh` — runs under systemd, survives disconnect. tmux/screen is preferred for interactive sessions; nohup for fire-and-forget scripts.

### CARD linux-063
- tier: 2
- type: intermediate
- difficulty: 2
- front: What does `lsof +D /var/log | grep deleted` reveal and why is it useful?
- back: It shows files in `/var/log` that have been deleted from the filesystem but are still held open by a running process. The disk space occupied by these files is not freed until the process closes the file descriptor or is restarted. This is a common cause of "phantom" disk usage — `df` shows the disk full, but `du` reports less space used than expected. Restarting the holding process releases the space.

### CARD linux-064
- tier: 2
- type: intermediate
- difficulty: 2
- front: How do you check which ports a server is listening on and identify the associated processes?
- back: `ss -tlnp` for TCP, `ss -ulnp` for UDP. `-t/-u` = protocol, `-l` = listening only, `-n` = numeric ports (no DNS), `-p` = show process name/PID. Example output: `LISTEN 0 128 0.0.0.0:22 users:(("sshd",pid=1234,fd=3))`. For a comprehensive view: `ss -tulnp`. If a port conflict is preventing a service from starting, this tells you which process is already bound to that port.

### CARD linux-065
- tier: 2
- type: intermediate
- difficulty: 2
- front: What information does `/proc/meminfo` provide that `free -h` does not?
- back: `/proc/meminfo` provides granular detail including: `Buffers` (block device cache), `Cached` (page cache), `SwapCached`, `Active`/`Inactive` memory (recently used vs. reclaimable), `Dirty` (pages waiting to be written to disk), `Shmem` (shared memory/tmpfs), `HugePages_Total`/`HugePages_Free` (huge page allocations, relevant for GPU/DPDK workloads), and `SReclaimable` (reclaimable slab memory). `free` summarizes these into higher-level categories.

### CARD linux-066
- tier: 2
- type: intermediate
- difficulty: 2
- front: Explain the difference between `SIGTERM`, `SIGKILL`, and `SIGHUP`. When would you use each?
- back: `SIGTERM` (15): "Please shut down." The process can catch it, clean up resources, and exit gracefully. Always try this first. `SIGKILL` (9): "Die immediately." Cannot be caught or ignored. The kernel terminates the process with no cleanup. Use only when SIGTERM fails. `SIGHUP` (1): Historically "hangup." Many daemons interpret it as "reload your configuration." Example: `kill -HUP <nginx_pid>` reloads nginx config without a full restart. Also sent to processes when their controlling terminal disconnects (which is why `nohup` exists).

### CARD linux-067
- tier: 2
- type: intermediate
- difficulty: 2
- front: A server shows high `iowait` in `top`. What does this indicate and how do you investigate?
- back: High `iowait` means CPUs are idle waiting for disk I/O to complete. This indicates a storage bottleneck. Investigation: 1. `iostat -xz 1` — look for devices with high `%util` (near 100%) and high `await` (average I/O wait time in ms). 2. `iotop` — shows which processes are generating the most I/O. 3. `dmesg` — check for disk errors or controller issues. 4. `smartctl -a /dev/sdX` — check SMART health for failing drives. Common DC Ops causes: failing disk, RAID rebuild in progress, runaway logging process, or insufficient disk throughput for the workload.

### CARD linux-068
- tier: 2
- type: intermediate
- difficulty: 2
- front: How do you write a bash `for` loop that SSHs into a list of nodes and runs `uptime`?
- back: ```bash
for node in node01 node02 node03; do
    echo "--- $node ---"
    ssh "$node" "uptime" 2>/dev/null || echo "UNREACHABLE"
done
```
Or read from a file: `for node in $(cat /etc/node_list); do ...`. The `2>/dev/null` suppresses SSH errors, and `|| echo "UNREACHABLE"` prints a fallback if the SSH command fails (non-zero exit code).

### CARD linux-069
- tier: 2
- type: intermediate
- difficulty: 2
- front: What is the purpose of the `blkid` command and when would you use it in DC Ops?
- back: `blkid` displays the UUID, filesystem type, and label for block devices. Use it when: (a) Configuring `/etc/fstab` — UUIDs are preferred over device names like `/dev/sdb1` because device names can change between boots. (b) Identifying which filesystem type is on a partition before mounting. (c) Troubleshooting boot issues where a UUID in fstab no longer matches after a disk replacement.

### CARD linux-070
- tier: 2
- type: intermediate
- difficulty: 2
- front: What does `dmidecode -t memory` show and why is it useful for server hardware troubleshooting?
- back: It reads the system's DMI/SMBIOS data to show physical memory details: DIMM slot locations, module size, speed, manufacturer, part number, and serial number. Useful in DC Ops for: identifying which slot has a failed DIMM (correlate with ECC error logs from `dmesg` or `edac-util`), verifying memory configuration after hardware changes, and documenting installed hardware for asset management. Requires root.

### CARD linux-071
- tier: 2
- type: intermediate
- difficulty: 2
- front: What is a `systemd` unit file and where are they stored?
- back: A unit file defines how systemd manages a service, mount, timer, or other resource. Key fields: `[Service]` section specifies `ExecStart` (command to run), `User`, `Restart` policy, and dependencies (`After=`, `Requires=`). Standard locations: `/usr/lib/systemd/system/` (vendor defaults), `/etc/systemd/system/` (admin overrides — takes precedence). View a service's unit file with `systemctl cat <service>`. After editing, run `systemctl daemon-reload` to pick up changes.

### CARD linux-072
- tier: 2
- type: intermediate
- difficulty: 2
- front: How would you check if a filesystem was remounted as read-only and diagnose the cause?
- back: 1. `mount | grep <mount_point>` — check the options column for `ro` (read-only) vs. `rw` (read-write). 2. If read-only: check `dmesg` for I/O errors or filesystem corruption messages. Kernel remounts filesystems read-only to prevent data loss when it detects disk errors. 3. Check `smartctl -a /dev/sdX` for disk health. 4. Check RAID status if applicable: `cat /proc/mdstat` for software RAID, or vendor tools (e.g., `storcli`, `megacli`) for hardware RAID. 5. If the disk is healthy and the filesystem is just marked dirty: `fsck` after unmounting (or on next reboot) can repair it.

## Tier 3 — Scenarios

### CARD linux-073
- tier: 3
- type: scenario
- difficulty: 3
- front: You receive an alert that a GPU compute node has stopped responding to health checks. You can still SSH into the node. Walk through your diagnostic process.
- back: 1. `uptime` — check if the node recently rebooted (uptime near zero) or if load average is abnormally high. 2. `dmesg -T | tail -50` — look for hardware errors (GPU Xid errors, ECC memory errors, NIC link failures, disk I/O errors). 3. `nvidia-smi` — check GPU status, temperature, utilization. If nvidia-smi hangs or returns errors, the GPU driver may have crashed. 4. `top` or `ps aux --sort=-%cpu | head` — identify if a process is saturating CPU or if the system is in a bad state. 5. `journalctl --since "10 minutes ago" -p err` — recent service errors. 6. `free -h` — check for OOM (out of memory) conditions; also check `dmesg` for OOM killer entries. 7. `ss -tlnp` — verify the health check service is still listening. 8. Based on findings: restart the health check agent, restart the GPU driver (`modprobe -r nvidia && modprobe nvidia`), or escalate for hardware replacement. 9. Document all findings in the incident ticket.

### CARD linux-074
- tier: 3
- type: scenario
- difficulty: 3
- front: A developer reports that their scheduled job isn't running. The job is managed by a systemd timer. How do you troubleshoot?
- back: 1. `systemctl list-timers --all | grep <timer_name>` — verify the timer is loaded and check when it last triggered and when it's next scheduled. 2. `systemctl status <timer_name>.timer` — check if the timer unit is active. 3. `systemctl status <timer_name>.service` — check the associated service's status. If it shows "failed," the job ran but crashed. 4. `journalctl -u <timer_name>.service -n 50` — read the service's logs for error output. 5. `systemctl cat <timer_name>.timer` — verify the `OnCalendar=` or `OnBootSec=` schedule is correct. 6. `systemctl cat <timer_name>.service` — verify the `ExecStart=` command, working directory, user, and permissions. 7. Common causes: timer not enabled (`systemctl enable <timer>.timer`), service unit has wrong path or permissions, dependency service not running.

### CARD linux-075
- tier: 3
- type: scenario
- difficulty: 3
- front: You are given a list of 200 server hostnames and asked to check which ones have more than 90% disk usage on the root partition. How would you approach this?
- back: Write a quick bash script:
```bash
#!/bin/bash
while read -r host; do
    usage=$(ssh -o ConnectTimeout=5 "$host" "df --output=pcent / | tail -1 | tr -d ' %'" 2>/dev/null)
    if [ -z "$usage" ]; then
        echo "UNREACHABLE: $host"
    elif [ "$usage" -gt 90 ]; then
        echo "ALERT: $host at ${usage}%"
    fi
done < /path/to/host_list.txt
```
Key elements: `-o ConnectTimeout=5` prevents hanging on unreachable nodes. `df --output=pcent /` gives only the percentage for root. `tr -d ' %'` strips whitespace and the percent sign for numeric comparison. Output can be redirected to a report file. For faster execution across 200 nodes, consider `parallel` or `xargs -P` for concurrent SSH sessions.

### CARD linux-076
- tier: 3
- type: scenario
- difficulty: 3
- front: `dmesg` on a server shows repeated `mce: [Hardware Error]` messages referencing a specific CPU socket. What are MCE errors and what actions do you take?
- back: MCE (Machine Check Exception) errors are reported by the CPU when it detects a hardware fault — typically correctable or uncorrectable memory (ECC) errors, cache errors, or bus errors. Actions: 1. `mcelog --client` or `rasdaemon` — get decoded MCE details including error type, CPU, and memory controller/DIMM. 2. If errors are correctable (CE) and infrequent: monitor closely, document in asset management. 3. If errors are uncorrectable (UE) or correctable errors are increasing rapidly: drain workloads from the node, mark it for maintenance, and schedule hardware replacement (DIMM or CPU depending on the error source). 4. Cross-reference with `dmidecode -t memory` to identify the physical DIMM slot. 5. File a hardware RMA ticket with the vendor, including the MCE log output and DIMM/CPU serial numbers.

### CARD linux-077
- tier: 3
- type: scenario
- difficulty: 3
- front: A service that was running fine yesterday fails to start after a server reboot. `systemctl status` shows "dependency failed." How do you diagnose and resolve?
- back: 1. `systemctl status <service>` — read the full output for which dependency failed. 2. `systemctl cat <service>` — check the `After=`, `Requires=`, and `Wants=` directives to see what the service depends on. 3. `systemctl status <dependency>` — check each dependency. One or more will be in a failed state. 4. `journalctl -u <failed_dependency>` — read its logs to find the root cause. 5. Common causes: a mount point in `/etc/fstab` failed (e.g., NFS server unreachable, bad UUID after disk replacement), a network target not reached (e.g., DHCP timeout), or a required service has a config error. 6. Fix the root dependency first, then `systemctl restart <service>`. 7. Run `systemctl list-dependencies <service>` to see the full dependency tree and verify all are active.

### CARD linux-078
- tier: 3
- type: scenario
- difficulty: 3
- front: You need to replace a failed data disk on a server running a software RAID array (mdadm). Walk through the process.
- back: 1. Identify the failed disk: `cat /proc/mdstat` shows array status with `[U_]` indicating a degraded member. `mdadm --detail /dev/md0` for full detail including the path of the failed device. 2. Remove the failed disk from the array: `mdadm --manage /dev/md0 --remove /dev/sdb1`. 3. Physically replace the disk (or have DC Ops do the hot-swap if supported). 4. Partition the new disk to match the original: `sgdisk -R /dev/sdb /dev/sda` (copy partition table from the healthy disk). 5. Add the new disk to the array: `mdadm --manage /dev/md0 --add /dev/sdb1`. 6. Monitor the rebuild: `watch cat /proc/mdstat` — shows rebuild progress and ETA. 7. Update `/etc/mdadm/mdadm.conf` if needed: `mdadm --detail --scan >> /etc/mdadm/mdadm.conf`. 8. Document the disk swap: old serial number, new serial number, array name, timestamp.

### CARD linux-079
- tier: 3
- type: scenario
- difficulty: 3
- front: A node's `nvidia-smi` output shows "ERR!" for GPU temperature and `N/A` for utilization on one of four GPUs. What do you do?
- back: 1. Note which GPU index (e.g., GPU 2) is reporting errors. 2. `dmesg -T | grep -i "nvidia\|xid"` — look for NVIDIA Xid errors (e.g., Xid 79 indicates a GPU fell off the bus). 3. `lspci | grep -i nvidia` — check if the GPU is still visible on the PCI bus. If missing, the GPU may have physically failed or the PCIe slot has a problem. 4. Try a GPU driver reset: `nvidia-smi -r` (if supported) or `modprobe -r nvidia && modprobe nvidia`. 5. If the GPU does not recover after a driver reset, a full node reboot may be needed. 6. If the GPU still shows errors after reboot: mark the node as degraded, drain its workloads, and file a hardware ticket for GPU replacement. Include the GPU serial number (`nvidia-smi -q | grep Serial`), Xid error codes, and slot position. 7. Verify the remaining 3 GPUs are functioning normally.

### CARD linux-080
- tier: 3
- type: scenario
- difficulty: 3
- front: You've been asked to set up a shared directory `/opt/dc_logs` where all members of the `dcteam` group can create files, but users can only delete their own files. How do you configure this?
- back: ```bash
sudo mkdir /opt/dc_logs
sudo chown root:dcteam /opt/dc_logs
sudo chmod 1770 /opt/dc_logs
```
Breakdown: `1` = sticky bit (users can only delete their own files). `7` = owner (root) has full access. `7` = group (dcteam) has read, write, and execute (can create and list files). `0` = others have no access. Optionally add the SGID bit (`chmod 2770` or `chmod 3770` for both) so new files automatically inherit the `dcteam` group, preventing "I can't read your file" issues.

### CARD linux-081
- tier: 3
- type: scenario
- difficulty: 3
- front: The OOM (out-of-memory) killer has terminated a critical process on a server. How do you find out what happened and prevent recurrence?
- back: 1. `dmesg -T | grep -i "oom\|killed process"` — find the OOM killer invocation. It logs which process was killed, its memory usage, and the system's memory state at the time. 2. `journalctl -k | grep -i oom` — alternate way to find kernel OOM messages. 3. Analyze the log: the kernel prints a table of all processes and their memory usage at the time of the OOM event, plus the total memory available. Identify what consumed the memory. 4. Prevention options: (a) Add more RAM if the workload legitimately needs it. (b) Set memory limits via `systemd` cgroups (`MemoryMax=` in the service's unit file). (c) Adjust the OOM score for critical processes: `echo -1000 > /proc/<PID>/oom_score_adj` to protect them from the OOM killer (use sparingly). (d) If a memory leak caused it, escalate to the application team.

### CARD linux-082
- tier: 3
- type: scenario
- difficulty: 3
- front: You need to securely transfer a large log archive from a remote server to your workstation. The file is 2 GB. What methods are available and what are the trade-offs?
- back: 1. `scp user@remote:/path/to/file.tar.gz /local/path/` — simple, encrypted over SSH. No resume on interruption. 2. `rsync -avzP user@remote:/path/to/file.tar.gz /local/path/` — preferred. `-a` = archive mode, `-z` = compression in transit, `-P` = progress display + partial transfer resume. If the connection drops, re-running the same command resumes where it left off. 3. `sftp user@remote` — interactive file transfer, also over SSH. 4. For very large or frequent transfers: consider `rsync` with `--bwlimit=<kbps>` to avoid saturating the network link. In a DC environment with internal high-speed networks, bandwidth is less of a concern, but for cross-datacenter transfers it matters.

### CARD linux-083
- tier: 3
- type: scenario
- difficulty: 3
- front: After a kernel update and reboot, a server's network interfaces have changed names (e.g., `eth0` is now `ens3`). Services that reference the old name are failing. What happened and how do you fix it?
- back: Modern Linux uses "predictable network interface names" based on hardware location (ens = PCI slot, eno = onboard, enp = PCI bus/slot). This naming was introduced by systemd/udev to prevent name changes when hardware changes. After a kernel update, udev rules may be regenerated, or a new kernel may handle the renaming differently. Fixes: 1. `ip link show` — identify the new names. 2. Update config files that reference interface names: network config in `/etc/netplan/*.yaml` (Ubuntu) or `/etc/sysconfig/network-scripts/ifcfg-*` (RHEL). 3. Update any firewall rules, routing configs, or application configs that reference the old name. 4. If you need consistent naming, create a udev rule in `/etc/udev/rules.d/` to map MAC addresses to specific interface names. 5. `netplan apply` (Ubuntu) or `nmcli connection reload && nmcli connection up <name>` (RHEL with NetworkManager).

### CARD linux-084
- tier: 3
- type: scenario
- difficulty: 2
- front: You need to find which process is listening on port 8080 and stop it so a new service can bind to that port. Walk through the steps.
- back: 1. `ss -tlnp | grep 8080` — shows the process name and PID bound to port 8080. Example output: `LISTEN ... 0.0.0.0:8080 users:(("python3",pid=4567,fd=5))`. 2. Verify the process: `ps aux | grep 4567` — confirm what it is before killing it. 3. If it's a systemd service: `systemctl stop <service_name>` (cleaner than killing directly). 4. If it's a standalone process: `kill 4567` (SIGTERM first). Wait a few seconds, verify it's gone with `ss -tlnp | grep 8080`. 5. If it persists: `kill -9 4567`. 6. Start the new service and verify it binds: `ss -tlnp | grep 8080` should now show the new process.

### CARD linux-085
- tier: 3
- type: scenario
- difficulty: 3
- front: A team member accidentally ran `chmod -R 777 /etc` on a server. What is the impact and how do you recover?
- back: Impact: every file in `/etc` is now world-readable, writable, and executable. This breaks SSH (sshd refuses to start if config file permissions are too open), can break `sudo` (sudoers file must be 0440), disrupts services that verify config file permissions, and is a severe security exposure. Recovery: 1. If SSH is still working, act immediately. 2. **Best option:** Restore `/etc` permissions from a known-good backup or snapshot. 3. **If no backup:** On a matching system with correct permissions, generate a reference: `find /etc -printf '%m %p\n' > /tmp/etc_perms.txt`, then apply it to the broken system. 4. **Emergency fixes** for critical services: `chmod 0644 /etc/ssh/sshd_config`, `chmod 0440 /etc/sudoers`, `chmod 0600 /etc/shadow`, `chmod 0644 /etc/passwd`. 5. Reinstalling packages can also restore correct permissions: `apt install --reinstall <package>` or `rpm --setperms <package>`. 6. Document the incident and how it was resolved.

### CARD linux-086
- tier: 3
- type: scenario
- difficulty: 2
- front: You want to monitor GPU temperatures across 50 nodes every 5 minutes and log any node where a GPU exceeds 85°C. How would you implement this?
- back: Create a script:
```bash
#!/bin/bash
LOGFILE="/var/log/gpu_temp_alerts.log"
THRESHOLD=85
while read -r node; do
    temps=$(ssh -o ConnectTimeout=5 "$node" \
        "nvidia-smi --query-gpu=index,temperature.gpu --format=csv,noheader,nounits" 2>/dev/null)
    if [ -z "$temps" ]; then
        echo "$(date) UNREACHABLE $node" >> "$LOGFILE"
        continue
    fi
    while IFS=', ' read -r idx temp; do
        if [ "$temp" -gt "$THRESHOLD" ]; then
            echo "$(date) ALERT $node GPU$idx ${temp}C" >> "$LOGFILE"
        fi
    done <<< "$temps"
done < /etc/gpu_nodes.txt
```
Schedule with a cron job: `*/5 * * * * /opt/scripts/gpu_temp_check.sh`. Or use a systemd timer for better logging integration.

## Tier 4 — Incident Branching

### CARD linux-087
- tier: 4
- type: scenario
- difficulty: 3
- front: Monitoring alerts: GPU node `gpu-rack12-node07` has not reported metrics for 10 minutes. You are the on-call DC Ops technician. Begin your investigation.
- steps:
  1. You attempt to SSH into the node. The connection times out after 10 seconds. What is your next step? | Attempt out-of-band access via the BMC/IPMI interface: `ipmitool -I lanplus -H gpu-rack12-node07-bmc -U admin chassis status`. This bypasses the host OS and network stack to check if the hardware is powered on and responsive. Also check the top-of-rack switch to see if the node's port is up.
  2. BMC responds. Chassis power is on. The BMC SOL (serial-over-LAN) console shows the system is stuck at a kernel panic screen with the message "Kernel panic - not syncing: Fatal Machine Check." What do you do? | Capture the full kernel panic output from the SOL console — screenshot or copy the text for the incident ticket. This is a hardware-triggered kernel panic (Machine Check Exception). Before rebooting, check `ipmitool sel list` to read the System Event Log for hardware fault details (which component reported the error). Then issue `ipmitool chassis power cycle` to reboot the node.
  3. The node reboots. You SSH in and run `dmesg -T`. You see repeated messages: `mce: [Hardware Error]: Machine check events logged` and `EDAC MC0: 1 CE on DIMM 3A`. The node appears functional but correctable errors are accumulating. How do you proceed? | The EDAC (Error Detection and Correction) message identifies correctable ECC memory errors on a specific DIMM in slot 3A. Actions: (a) Check the error rate — if CEs are frequent (more than a few per hour), the DIMM is degrading. (b) Run `dmidecode -t memory` to identify the physical DIMM module (serial, part number). (c) Mark the node as degraded in the fleet management system so new workloads aren't scheduled on it. (d) If workloads are currently running, coordinate with the scheduling team to drain gracefully. (e) File a hardware RMA ticket with the DIMM details and MCE/EDAC log excerpts.
  4. While reviewing the node, you also notice that `nvidia-smi` shows GPU 2 reporting `ECC Errors: Volatile Uncorrectable: 4`. The other 3 GPUs show zero. What additional action do you take? | Uncorrectable ECC errors on a GPU are more severe than correctable ones — they indicate data corruption in GPU memory. Add this to the hardware ticket. The node now needs both a DIMM replacement (slot 3A) and a GPU inspection/replacement (GPU 2). Before sending the node for repair: `nvidia-smi -q -i 2` to capture full diagnostics. Reset the ECC counter won't fix the underlying issue. The node should not run training workloads until both issues are resolved, as GPU memory errors corrupt training data and DIMM errors can cause further kernel panics.
- back: Full resolution path: Network unreachable → BMC/IPMI out-of-band access → Kernel panic from Machine Check Exception identified → SEL checked for hardware details → Power cycle → Post-boot diagnostics reveal correctable DIMM errors (EDAC) and uncorrectable GPU ECC errors → Node drained and marked degraded → Hardware RMA for both DIMM and GPU. Key principles: (1) Always use out-of-band management when in-band access fails. (2) Capture evidence before rebooting. (3) Check SEL before power cycling. (4) After recovery, look beyond the initial symptom — this node had two simultaneous hardware issues.

### CARD linux-088
- tier: 4
- type: scenario
- difficulty: 3
- front: Alert: A cluster of 8 GPU nodes in Rack 15 all simultaneously stopped responding to pings. Individual node BMCs are also unreachable. What's your approach?
- steps:
  1. All 8 nodes and their BMCs are unreachable simultaneously. What is the most likely failure domain and what do you check first? | Simultaneous failure of 8 nodes points to shared infrastructure, not individual node failures. Check the top-of-rack (ToR) switch first — if it failed, all nodes and BMCs connected to it lose network connectivity. Try to SSH into the ToR switch management IP from another network. If the ToR is unreachable, check physically: are the switch LEDs on? Also check the PDU feeding Rack 15 — a power loss would take down everything.
  2. You arrive at Rack 15. The switch LEDs are dark. The servers appear to be running (fan noise, front panel LEDs on). What do you conclude and what next? | The ToR switch has lost power or failed. Servers are up (powered by a different circuit or PDU), but they can't reach the network. Check the PDU port feeding the switch — is the breaker tripped? Check the power cable. If the PDU shows the outlet is live but the switch is dark, the switch PSU has failed. If the PDU outlet is off, reset the breaker or re-seat the power connection.
  3. You re-seat the switch's power cable and it boots up. The nodes start responding to pings within 2 minutes as the switch re-establishes links. However, you notice 2 of the 8 nodes have not recovered network connectivity. What do you investigate? | With the switch back online and 6 of 8 nodes recovered, the 2 remaining nodes likely have a different issue. Check: (a) `ethtool` or switch port status for those 2 nodes — are their links up? (b) Try the BMC interface — if the BMC network port also fails to come up, the NIC or cabling may have been damaged. (c) Physically inspect the network cables from those 2 nodes to the switch — reseat both ends. (d) Try a different switch port. (e) If the physical layer checks out, the host may need a network service restart or reboot.
  4. After resolving the immediate outage, what preventive measures and documentation do you recommend? | Documentation: Incident ticket with full timeline, root cause (switch power loss), contributing factors, and resolution steps. Preventive measures: (a) If the switch was on a single power feed, recommend dual-power with redundant PSUs on separate PDU circuits. (b) Add monitoring for switch uptime/availability — the 10-minute detection gap is too long. (c) If the switch lacks redundant PSUs, ensure a cold spare switch is available in the DC. (d) Review the 2 nodes that didn't auto-recover — if a NIC failed, that's a separate hardware issue to track.
- back: Full resolution: 8-node outage → Shared infrastructure hypothesis → ToR switch identified as failed (power loss) → Physical inspection → Power cable re-seated → Switch rebooted → 6/8 nodes recovered → 2 remaining nodes investigated individually (physical layer check) → Post-incident: dual power feeds recommended, monitoring gap identified. Key principle: Simultaneous multi-node failures almost always point to shared infrastructure (switch, PDU, circuit breaker, or cabling), not coincidental individual failures.

### CARD linux-089
- tier: 4
- type: scenario
- difficulty: 3
- front: Alert: Node `gpu-rack03-node12` reports "Read-only file system" errors. Applications are failing to write logs and temporary files. You need to restore service with minimal downtime.
- steps:
  1. You SSH into the node. Running `touch /tmp/test` returns "Read-only file system." What is your initial diagnosis and what do you check? | The kernel has remounted one or more filesystems as read-only, which it does automatically when it detects I/O errors or filesystem corruption to prevent further data loss. Check: `mount | grep " / "` to confirm root is `ro`. Then `dmesg -T | tail -100` to look for the I/O errors or filesystem errors that triggered the remount. Also check `dmesg` for messages about disk hardware errors (e.g., SCSI errors, SATA link resets, or NVMe errors).
  2. `dmesg` shows: `EXT4-fs error: I/O error on device sda2, logical block 524288` followed by `EXT4-fs: Remounting filesystem read-only`. What are your options to restore write access? | Options: (a) **Quick attempt**: `mount -o remount,rw /` to remount read-write. This may work temporarily but if the underlying disk has a hardware fault, errors will recur. (b) **Better**: Before remounting, check disk health with `smartctl -a /dev/sda`. If SMART shows failing attributes (reallocated sectors, pending sectors, uncorrectable errors), the disk is failing and needs replacement. (c) If SMART is clean, the errors may be transient (cable issue, controller glitch). Remount rw, run `fsck` at next maintenance window (requires unmount or single-user boot for root filesystem).
  3. `smartctl` shows 148 reallocated sectors and 12 current pending sectors — the disk is degrading. The node runs production GPU workloads. How do you handle the workload and the disk? | (a) Drain the node immediately — notify the scheduler to stop assigning new work and allow current jobs to complete (or terminate if the filesystem state makes them unrecoverable). (b) Remount read-write temporarily if needed to let running jobs save checkpoints: `mount -o remount,rw /`. (c) Once drained, mark the node for maintenance. (d) File a hardware ticket for disk replacement with SMART data, disk serial number, and the node's location. (e) If the node uses an OS disk + separate data disks, verify the data disks are healthy too.
  4. The disk is replaced and the node is rebuilt. What steps confirm the node is ready to return to production? | (a) Verify the new disk's SMART health baseline: `smartctl -a /dev/sda`. (b) Confirm the filesystem is mounted read-write: `mount | grep sda`. (c) Run a write test: `dd if=/dev/zero of=/tmp/testfile bs=1M count=100 && rm /tmp/testfile`. (d) Verify all services are running: `systemctl list-units --failed` should show no failures. (e) Check GPU health: `nvidia-smi` should show all GPUs healthy. (f) Run the standard node health check script. (g) Remove the maintenance flag and add the node back to the scheduling pool. (h) Monitor the node closely for 24 hours after return to production.
- back: Full resolution: Read-only filesystem → dmesg reveals I/O errors → SMART confirms disk degradation → Node drained → Disk replaced → Node rebuilt and validated → Returned to production with monitoring. Key principles: (1) Read-only remount is a protective mechanism — always check the underlying cause before simply remounting rw. (2) SMART data tells you whether the disk is failing or if the error was transient. (3) Drain workloads before hardware maintenance. (4) Validate thoroughly before returning a node to production.

### CARD linux-090
- tier: 4
- type: scenario
- difficulty: 3
- front: It's 3:00 AM. You get paged: "25% of GPU nodes in zone 2 reporting high memory utilization — all above 95% on host RAM (not GPU memory)." No single process is obvious from the initial alert. Investigate.
- steps:
  1. You SSH into one of the affected nodes. `free -h` shows 125 GB of 128 GB used. `top` sorted by memory shows no single process using more than 8 GB. Where is the memory going and how do you investigate further? | When no single process is the culprit, check for: (a) Kernel slab memory: `slabtop` or `cat /proc/meminfo | grep Slab` — the kernel's internal memory allocations (dentry cache, inode cache) can grow large. (b) Page cache: check `Cached` and `Buffers` in `/proc/meminfo` — if cached is high, memory is being used for disk cache, which is usually fine (it's reclaimable). (c) `cat /proc/meminfo | grep -E "MemTotal|MemAvailable|Buffers|Cached|Slab|SReclaimable"`. The key question: is `MemAvailable` low, or is the memory mostly reclaimable cache?
  2. `MemAvailable` is genuinely low at 1.2 GB. `Slab` shows 45 GB and `SReclaimable` shows 42 GB of that. What does this tell you and what can you do? | 42 GB of reclaimable slab memory is abnormally high. This is typically the dentry/inode cache grown excessively — common when a process has traversed millions of files (e.g., a monitoring agent scanning filesystems, or a `find` command over a massive directory tree). You can reclaim slab memory: `echo 2 > /proc/sys/vm/drop_caches` drops the dentry/inode cache. `echo 3` drops page cache + dentry/inode cache. This is safe for a temporary fix but the real question is: what caused the cache to grow this large?
  3. After dropping caches, memory usage drops to 60%. But the question is why 25% of zone 2 nodes are affected simultaneously. What do you investigate next? | Simultaneous occurrence across many nodes points to a shared cause: (a) Was a new monitoring agent or cron job recently deployed to these nodes? Check `crontab -l` and recent deployments. (b) Was a filesystem scan or backup tool run on these nodes? (c) Check `/var/log` for recently started batch jobs. (d) `ps aux` — look for processes like `find`, `locate`, `updatedb`, backup agents, or monitoring collectors that scan large filesystem trees. (e) Check if these nodes share a common NFS mount whose content recently grew. The fix isn't just dropping caches — it's identifying and throttling the scanning process.
  4. You discover a newly deployed inventory agent (`/opt/monitoring/inventory-scan`) that runs hourly via cron, recursively scanning all mounted filesystems to catalog file counts and sizes. It was deployed to zone 2 yesterday. What is your resolution? | (a) Immediate: disable the cron job on affected nodes to stop the bleeding: `crontab -e` or remove the entry from `/etc/cron.d/`. (b) Drop caches on affected nodes to restore memory: `echo 3 > /proc/sys/vm/drop_caches`. (c) Escalate to the team that deployed the agent — the scan approach needs to be reworked (e.g., scan only specific paths instead of all mounts, or use `ionice`/`nice` to limit resource impact). (d) Document the incident: root cause was an unbounded filesystem scan inflating kernel slab caches across the fleet. (e) Recommend adding memory usage alerts that trigger at a lower threshold (e.g., 85%) for earlier detection. (f) Before the agent is redeployed, it should be tested on a single node with resource monitoring.
- back: Full resolution: Fleet-wide memory pressure → No single process culprit → Kernel slab investigation reveals massive dentry/inode cache → Cache dropped for immediate relief → Simultaneous occurrence pattern → Newly deployed inventory agent identified as root cause → Cron job disabled → Agent team notified for fix → Monitoring threshold tightened. Key principles: (1) When no single process explains memory usage, check kernel memory (slab, page cache). (2) Fleet-wide simultaneous symptoms point to shared config changes or deployments. (3) Dropping caches is a symptom fix — always find the root cause. (4) New agents/tools deployed to production nodes should be resource-tested first.
