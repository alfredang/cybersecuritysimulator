/* Generated from the C628 course data (build_lab_files.py). Do not edit by hand. */
window.LABS = [
 {
  "num": 1,
  "slug": "security-controls",
  "domain": 1,
  "obj": "1.1",
  "title": "Security Controls Categorization",
  "objective": "Classify controls and build each control type on Linux",
  "desc": "The learner classifies real controls by category and type, then implements preventive, deterrent, detective, corrective and compensating controls on one Linux host.",
  "build": "A control matrix, an iptables block with a jump-host exception, a banner, an auditd watch and a restore.",
  "services": "iptables, auditd, ausearch, sshd, sha256sum, column",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y iptables auditd bsdextrautils curl openssh-server"
   },
   {
    "t": "Build the control matrix",
    "cmd": "column -t -s, /root/lab01/controls.csv"
   },
   {
    "t": "Add a technical preventive control",
    "cmd": "iptables -I INPUT -p tcp --dport 23 -j DROP"
   },
   {
    "t": "Add a deterrent and directive control",
    "cmd": "echo \"Banner /etc/issue.net\" > /etc/ssh/sshd_config.d/10-banner.conf && sshd -t"
   },
   {
    "t": "Add a technical detective control",
    "cmd": "auditctl -w /etc/passwd -p wa -k passwd_changes"
   },
   {
    "t": "Add a corrective control",
    "cmd": "sha256sum -c /root/known-good/issue.net.sha256 || cp -a /root/known-good/issue.net /etc/issue.net"
   },
   {
    "t": "Add a compensating control",
    "cmd": "iptables -I INPUT 1 -s 10.10.10.5 -p tcp --dport 23 -j ACCEPT"
   },
   {
    "t": "Map what you built back to the matrix",
    "cmd": "column -t -s, /root/lab01/evidence.csv"
   }
  ],
  "test": "iptables shows LOG, jump-host ACCEPT and DROP rules for port 23, sshd -T shows the banner, ausearch shows the useradd event and the banner hash is OK."
 },
 {
  "num": 2,
  "slug": "cia-aaa",
  "domain": 1,
  "obj": "1.2",
  "title": "CIA Triad and AAA on Linux",
  "objective": "Enforce the CIA triad and demonstrate AAA with Linux tools",
  "desc": "The learner enforces confidentiality, integrity and availability, authenticates a person by password hash and a system by SSH key, grants one least-privilege sudo command and traces it in the logs.",
  "build": "An owner-only file, a hash baseline, a self-healing service, a key login and a scoped sudo rule.",
  "services": "chmod, sha256sum, systemd, chpasswd, openssl passwd, ssh-keygen, sudo, journalctl",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools and create the lab users",
    "cmd": "apt-get update -qq && apt-get install -y openssh-server sudo curl python3"
   },
   {
    "t": "Confidentiality: restrict a file to its owner",
    "cmd": "chmod 600 /home/alice/secret.txt && sudo -u bob cat /home/alice/secret.txt"
   },
   {
    "t": "Integrity: baseline a hash and detect tampering",
    "cmd": "sha256sum -c /root/secret.sha256 || echo \"INTEGRITY FAILED\""
   },
   {
    "t": "Availability: make a service self-heal",
    "cmd": "systemctl kill -s SIGKILL cia-web; sleep 4; systemctl show cia-web -p NRestarts"
   },
   {
    "t": "Authentication of people: verify a password hash",
    "cmd": "openssl passwd -6 -salt \"$SALT\" 'Lab1234!'"
   },
   {
    "t": "Authentication of systems: log in with an SSH key",
    "cmd": "ssh -i /root/svc_backup_key -o BatchMode=yes alice@127.0.0.1 whoami"
   },
   {
    "t": "Authorization: grant one least-privilege sudo command",
    "cmd": "visudo -cf /etc/sudoers.d/alice-ops && sudo -l -U alice"
   },
   {
    "t": "Accounting: trace who did what in the logs",
    "cmd": "journalctl _COMM=sudo --no-pager | grep alice | tail -4"
   }
  ],
  "test": "bob is denied the secret, the tampered hash fails, cia-web restarts itself, the key login works, alice can only restart cia-web, and journalctl shows her sudo use."
 },
 {
  "num": 3,
  "slug": "deception-honeypots",
  "domain": 1,
  "obj": "1.2",
  "title": "Deception: Honeypots, Honeyfiles and Honeytokens",
  "objective": "Deploy honeypots, a honeyfile, a honeytoken and a honeynet",
  "desc": "The learner deploys a low-interaction honeypot, a honeyfile watched by auditd and inotify, a decoy cloud credential with a detection script and a two-decoy honeynet, then summarises the alerts.",
  "build": "A logging honeypot, a watched honeyfile, a honeytoken detector and a namespace honeynet.",
  "services": "python3, netcat, auditd, inotifywait, ip netns, curl",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y auditd inotify-tools netcat-openbsd iproute2 python3 curl"
   },
   {
    "t": "Write a low-interaction honeypot",
    "cmd": "python3 -m py_compile /opt/honeypot/honeypot.py && echo \"honeypot OK\""
   },
   {
    "t": "Deploy the honeypot and simulate an attacker probe",
    "cmd": "printf 'root:toor\\n' | nc -w 3 127.0.0.1 2222"
   },
   {
    "t": "Plant a honeyfile and watch it with auditd",
    "cmd": "auditctl -w /srv/finance/payroll-2026-FINAL.csv -p r -k honeyfile"
   },
   {
    "t": "Raise a real-time honeyfile alert with inotifywait",
    "cmd": "inotifywait -m -e open /srv/finance/payroll-2026-FINAL.csv >> /var/log/honeyfile-alert.log &"
   },
   {
    "t": "Plant a honeytoken and detect its use",
    "cmd": "/usr/local/bin/honeytoken-check.sh"
   },
   {
    "t": "Build a mini honeynet in a network namespace",
    "cmd": "ip netns add honeynet && nc -zv -w 2 10.66.0.2 20-23"
   },
   {
    "t": "Summarise the deception alerts",
    "cmd": "grep HONEYPOT /var/log/honeypot.log | awk '{print $3, $4}' | sort | uniq -c"
   }
  ],
  "test": "The honeypot log shows hits on ports 2222, 21 and 23, auditd records uid=intruder reading the honeyfile, and the check script prints ALERT for the honeytoken."
 },
 {
  "num": 4,
  "slug": "change-management",
  "domain": 1,
  "obj": "1.3",
  "title": "Change Management with Version-Controlled Config",
  "objective": "Run a change from request to backout with version-controlled config",
  "desc": "The learner raises change CHG-1001, analyses impact, tests it on a staging nginx, applies it with a zero-downtime reload in the window, commits it with etckeeper and backs out an unauthorised edit.",
  "build": "A change record, staging test results, an nginx allow and deny list, a git-tracked /etc and a backout.",
  "services": "etckeeper, git, nginx, curl, systemctl",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "DEBIAN_FRONTEND=noninteractive apt-get install -y etckeeper nginx git curl"
   },
   {
    "t": "Put /etc under version control and record the baseline",
    "cmd": "etckeeper commit \"Baseline before CHG-1001\"; git -C /etc log --oneline | head -5"
   },
   {
    "t": "Raise the change request",
    "cmd": "cat /root/change/CHG-1001.txt"
   },
   {
    "t": "Run the impact analysis",
    "cmd": "ss -tlnp | grep nginx; systemctl list-dependencies --reverse nginx.service --no-pager"
   },
   {
    "t": "Stage and test the change",
    "cmd": "nginx -t -p /root/change/staging -c /root/change/staging/nginx.conf"
   },
   {
    "t": "Approve and implement in the maintenance window",
    "cmd": "nginx -t && systemctl reload nginx"
   },
   {
    "t": "Commit the change and update the documentation",
    "cmd": "etckeeper commit \"CHG-1001: nginx admin allow list, deny list, nosniff header\""
   },
   {
    "t": "Detect an unauthorised change and execute the backout plan",
    "cmd": "git -C /etc status --short nginx/ && git -C /etc checkout -- nginx/conf.d/chg-1001.conf"
   }
  ],
  "test": "git log shows the CHG-1001 commit, git status shows no drift, port 8081 returns 200 for the monitoring host, the nosniff header is present and approval is recorded."
 },
 {
  "num": 5,
  "slug": "hashing-signatures",
  "domain": 1,
  "obj": "1.4",
  "title": "Hashing, Salting, and Digital Signatures",
  "objective": "Hash, salt, stretch, HMAC and sign data with OpenSSL",
  "desc": "The learner proves integrity with a checksum manifest, salts and stretches password hashes, adds authenticity with an HMAC, and signs and verifies a purchase order with RSA-3072.",
  "build": "A SHA256SUMS manifest, salted hashes, a PBKDF2 timing test, an HMAC tag and a verified signature.",
  "services": "sha256sum, openssl passwd, openssl kdf, openssl dgst, openssl genpkey, chpasswd",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y openssl coreutils"
   },
   {
    "t": "Hash data and observe fixed length and the avalanche effect",
    "cmd": "echo -n 'Pay Bob 100 SGD' | sha256sum; echo -n 'Pay Bob 900 SGD' | sha256sum"
   },
   {
    "t": "Verify file integrity with a checksum manifest",
    "cmd": "sha256sum -c SHA256SUMS || echo \"INTEGRITY FAILED - do not install\""
   },
   {
    "t": "See why unsalted password hashes are weak",
    "cmd": "cut -d: -f2 unsalted.txt | sort | uniq -d"
   },
   {
    "t": "Salt the hash the way /etc/shadow does",
    "cmd": "openssl passwd -6 -salt \"$(openssl rand -hex 8)\" 'Summer2026!'"
   },
   {
    "t": "Slow attackers down with key stretching",
    "cmd": "time openssl kdf -keylen 32 -kdfopt digest:SHA256 -kdfopt iter:600000 ... PBKDF2"
   },
   {
    "t": "Add authenticity with an HMAC",
    "cmd": "openssl dgst -sha256 -hmac 'SharedLabKey-2026' invoice.txt"
   },
   {
    "t": "Sign a document with a private key",
    "cmd": "openssl dgst -sha256 -sign signer.key -out order.sig order.txt"
   },
   {
    "t": "Tamper with the document and watch verification fail",
    "cmd": "openssl dgst -sha256 -verify signer.pub -signature order.sig order.txt"
   }
  ],
  "test": "sha256sum flags the altered installer, the same password gives two different salted hashes, and the signature shows Verified OK on the original and Verification failure after tampering."
 },
 {
  "num": 6,
  "slug": "symmetric-asymmetric",
  "domain": 1,
  "obj": "1.4",
  "title": "Symmetric vs. Asymmetric Encryption and Key Exchange",
  "objective": "Compare AES, ECC, RSA, X25519 key exchange and hybrid GPG",
  "desc": "The learner encrypts with AES-256, sees ECB leak patterns, compares RSA and ECC key sizes and speed, derives a shared secret with X25519, and inspects the hybrid structure of a GPG message.",
  "build": "An AES-encrypted file, an ECB vs CBC comparison, an X25519 shared secret and a GPG hybrid message.",
  "services": "openssl enc, openssl speed, openssl pkeyutl, gnupg, od",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y gnupg openssl"
   },
   {
    "t": "Encrypt and decrypt with a shared AES-256 key",
    "cmd": "openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -in msg.txt -out msg.aes -pass pass:Lab1234!"
   },
   {
    "t": "Compare ECB and CBC block modes",
    "cmd": "od -An -tx1 -w16 -v blocks.ecb | sort | uniq -c"
   },
   {
    "t": "Compare key lengths and speed",
    "cmd": "openssl speed -seconds 1 rsa3072 ecdsap256"
   },
   {
    "t": "Agree a shared secret with X25519 key exchange",
    "cmd": "openssl pkeyutl -derive -inkey alice-x.key -peerkey bob-x.pub -out alice-shared.bin"
   },
   {
    "t": "Generate an asymmetric GPG key pair",
    "cmd": "gpg --batch --passphrase '' --quick-generate-key 'Alice <alice@lab.local>' rsa3072 sign 1y"
   },
   {
    "t": "Encrypt to the public key and decrypt with the private key",
    "cmd": "gpg --batch --yes --trust-model always -r alice@lab.local -e -o msg.gpg msg.txt"
   },
   {
    "t": "Inspect the hybrid structure of the GPG message",
    "cmd": "gpg --batch --pinentry-mode loopback --passphrase '' --list-packets msg.gpg"
   }
  ],
  "test": "AES and GPG round trips return the plaintext, ECB shows one block repeated four times, Alice and Bob derive identical secrets, and the dump shows a pubkey enc packet."
 },
 {
  "num": 7,
  "slug": "pki-ca",
  "domain": 1,
  "obj": "1.4",
  "title": "PKI: Build Your Own Certificate Authority",
  "objective": "Run a CA lifecycle from CSR to OCSP and CRL revocation",
  "desc": "The learner builds a root CA, issues a wildcard certificate from a CSR, adds the root to the trust store, checks status with an OCSP responder, then revokes it and publishes a CRL.",
  "build": "A root CA, a signed *.lab.local certificate, a live OCSP responder and a CRL with the revoked serial.",
  "services": "openssl req, openssl ca, openssl verify, openssl ocsp, openssl crl, update-ca-certificates",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools and build the CA layout",
    "cmd": "mkdir -p /root/ca/{certs,private,newcerts,crl} && touch /root/ca/index.txt"
   },
   {
    "t": "Create the root CA (the root of trust)",
    "cmd": "openssl req -x509 -new -key private/ca.key -days 3650 -config openssl.cnf -extensions v3_root"
   },
   {
    "t": "Generate a key and a wildcard CSR",
    "cmd": "openssl req -new -newkey rsa:2048 -nodes -subj \"/CN=*.lab.local\" -out web.csr"
   },
   {
    "t": "Sign the CSR as the CA",
    "cmd": "openssl ca -batch -config openssl.cnf -in web.csr -out certs/web.crt"
   },
   {
    "t": "Verify the chain and add the root to the trust store",
    "cmd": "openssl verify -CAfile certs/ca.crt certs/web.crt && update-ca-certificates"
   },
   {
    "t": "Check certificate status with OCSP",
    "cmd": "openssl ocsp -issuer certs/ca.crt -cert certs/web.crt -url http://127.0.0.1:2560"
   },
   {
    "t": "Revoke the certificate and publish a CRL",
    "cmd": "openssl ca -config openssl.cnf -revoke certs/web.crt -crl_reason keyCompromise"
   },
   {
    "t": "Compare self-signed and third-party certificates",
    "cmd": "openssl verify certs/selfsigned.crt; grep -c 'BEGIN CERT' /etc/ssl/certs/ca-certificates.crt"
   }
  ],
  "test": "The certificate carries the *.lab.local SAN, OCSP reports good then revoked, the CRL lists serial 1000, and the self-signed certificate fails verification."
 },
 {
  "num": 8,
  "slug": "threat-actors-mitre-attack",
  "domain": 2,
  "obj": "2.1",
  "title": "Threat Actors & the MITRE ATT&CK Framework",
  "objective": "Profile an APT group's actor type, motivation and ATT&CK techniques",
  "desc": "The learner downloads the MITRE ATT&CK Enterprise JSON and uses jq to profile a real APT group, mapping its actor type, likely motivation and known techniques.",
  "build": "A JSON-driven threat-actor profile tying one APT group to its ATT&CK techniques.",
  "services": "jq, curl",
  "mins": 20,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y jq curl"
   },
   {
    "t": "Download the ATT&CK Enterprise dataset",
    "cmd": "curl -sLo attack.json https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
   },
   {
    "t": "Confirm the dataset loaded",
    "cmd": "jq '.objects | length' attack.json"
   },
   {
    "t": "List the intrusion sets (threat groups)",
    "cmd": "jq -r '.objects[] | select(.type==\"intrusion-set\") | .name' attack.json | sort | head"
   },
   {
    "t": "Profile one group's aliases and description",
    "cmd": "jq -r '.objects[] | select(.type==\"intrusion-set\" and .name==\"APT29\") | {name,aliases,description}' attack.json"
   },
   {
    "t": "Extract the techniques attributed to the group",
    "cmd": "jq -r '.objects[] | select(.type==\"attack-pattern\") | .name' attack.json | sort -u | head"
   },
   {
    "t": "Classify the actor type and motivation",
    "cmd": ""
   },
   {
    "t": "Record the profile as a threat note",
    "cmd": "cat > profile.txt <<'EOF'\nGroup: APT29 ...\nEOF"
   }
  ],
  "test": "The learner produces a profile naming the group's actor type (nation-state), its motivation (espionage) and three mapped ATT&CK technique IDs."
 },
 {
  "num": 9,
  "slug": "phishing-email-analysis",
  "domain": 2,
  "obj": "2.2",
  "title": "Phishing Email Analysis (SPF / DKIM / DMARC)",
  "objective": "Analyze a phishing header and validate SPF, DKIM and DMARC records",
  "desc": "The learner dissects a spoofed email header and queries the claimed sender's SPF, DKIM and DMARC DNS records to prove the message was forged.",
  "build": "A header-analysis workflow that exposes SPF/DKIM/DMARC spoofing.",
  "services": "dnsutils, dig, swaks",
  "mins": 20,
  "steps": [
   {
    "t": "Install the DNS and mail tools",
    "cmd": "apt-get update -qq && apt-get install -y dnsutils swaks"
   },
   {
    "t": "Save a suspicious email header",
    "cmd": "cat > mail.eml <<'EOF'\nFrom: PayPal <service@paypal.com>\nEOF"
   },
   {
    "t": "Read the Received and Return-Path lines",
    "cmd": "grep -Ei 'received|return-path|from' mail.eml"
   },
   {
    "t": "Query the claimed sender's SPF record",
    "cmd": "dig +short TXT paypal.com | grep spf"
   },
   {
    "t": "Pull the DMARC policy",
    "cmd": "dig +short TXT _dmarc.paypal.com"
   },
   {
    "t": "Pull a DKIM selector key",
    "cmd": "dig +short TXT selector1._domainkey.paypal.com"
   },
   {
    "t": "Compare the sending IP to the SPF list",
    "cmd": ""
   },
   {
    "t": "Summarise the verdict",
    "cmd": "echo 'spf=fail dkim=none dmarc=fail -> spoofed'"
   }
  ],
  "test": "The learner shows the sending IP is absent from the real SPF record and concludes spf/dkim/dmarc fail, proving the message is spoofed."
 },
 {
  "num": 10,
  "slug": "sql-injection",
  "domain": 2,
  "obj": "2.3",
  "title": "SQL Injection (SQLi)",
  "objective": "Exploit and then patch a vulnerable login with parameterised queries",
  "desc": "The learner builds a deliberately vulnerable PHP/SQLite login on localhost, bypasses authentication with a manual injection, then fixes it with prepared statements.",
  "build": "A vulnerable login app plus its prepared-statement patch.",
  "services": "sqlite3, php-cli, php-sqlite3, curl",
  "mins": 25,
  "steps": [
   {
    "t": "Install the PHP/SQLite stack",
    "cmd": "apt-get update -qq && apt-get install -y sqlite3 php-cli php-sqlite3 curl"
   },
   {
    "t": "Create the database and a vulnerable login page",
    "cmd": "cat > login.php <<'EOF'\n<?php /* vulnerable */ ?>\nEOF"
   },
   {
    "t": "Start the local PHP server",
    "cmd": "php -S 127.0.0.1:8080 -t . >/tmp/php.log 2>&1 &"
   },
   {
    "t": "Confirm a normal login works",
    "cmd": "curl -s 'http://127.0.0.1:8080/login.php?u=admin&p=s3cret'"
   },
   {
    "t": "Bypass authentication with an injection",
    "cmd": "curl -s \"http://127.0.0.1:8080/login.php?u=admin'--&p=x\""
   },
   {
    "t": "Patch with a parameterised query",
    "cmd": "cat > login.php <<'EOF'\n<?php /* prepared statement */ ?>\nEOF"
   },
   {
    "t": "Verify the injection now fails",
    "cmd": "curl -s \"http://127.0.0.1:8080/login.php?u=admin'--&p=x\""
   }
  ],
  "test": "The learner confirms the injection logs in before the patch and is rejected after switching to bound parameters."
 },
 {
  "num": 11,
  "slug": "xss",
  "domain": 2,
  "obj": "2.3",
  "title": "Cross-Site Scripting (XSS)",
  "objective": "Exploit reflected XSS, then mitigate with output encoding and CSP",
  "desc": "The learner triggers reflected XSS in a tiny PHP page on localhost, then defends with htmlspecialchars output encoding and a Content-Security-Policy header.",
  "build": "A vulnerable search page plus its encoding and CSP mitigations.",
  "services": "php-cli, curl",
  "mins": 20,
  "steps": [
   {
    "t": "Install PHP",
    "cmd": "apt-get update -qq && apt-get install -y php-cli curl"
   },
   {
    "t": "Create a vulnerable reflected page",
    "cmd": "cat > search.php <<'EOF'\n<?php echo $_GET['q']; ?>\nEOF"
   },
   {
    "t": "Start the local server",
    "cmd": "php -S 127.0.0.1:8080 -t . >/tmp/php.log 2>&1 &"
   },
   {
    "t": "Trigger the reflected payload",
    "cmd": "curl -s 'http://127.0.0.1:8080/search.php?q=<b>hi</b>'"
   },
   {
    "t": "Mitigate with output encoding",
    "cmd": "cat > search.php <<'EOF'\n<?php echo htmlspecialchars($_GET['q']); ?>\nEOF"
   },
   {
    "t": "Add a Content-Security-Policy header",
    "cmd": "cat > router.php <<'EOF'\n<?php header(\"Content-Security-Policy: default-src 'self'\"); ?>\nEOF"
   },
   {
    "t": "Confirm encoding and the CSP header",
    "cmd": "curl -sD - 'http://127.0.0.1:8080/search.php?q=<b>hi</b>' | head"
   }
  ],
  "test": "The learner sees the markup render before the fix, then appear escaped with a CSP header served after the fix."
 },
 {
  "num": 12,
  "slug": "memory-vulnerabilities",
  "domain": 2,
  "obj": "2.3",
  "title": "Memory Vulnerabilities & Exploit Mitigations",
  "objective": "Crash a vulnerable C program, then rebuild it with memory protections",
  "desc": "The learner compiles a tiny vulnerable C program, observes a stack-based buffer-overflow crash, then rebuilds it with stack canaries, FORTIFY, PIE and ASLR enabled.",
  "build": "A before/after demo of a buffer overflow and the compiler mitigations that stop it.",
  "services": "gcc, gdb",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y gcc gdb"
   },
   {
    "t": "Write a tiny vulnerable program",
    "cmd": "printf '#include <string.h>\\nint main(int c,char**v){char b[16];strcpy(b,v[1]);return 0;}\\n' > vuln.c"
   },
   {
    "t": "Compile it with protections disabled",
    "cmd": "gcc -fno-stack-protector -z execstack -no-pie -O0 -o vuln_off vuln.c"
   },
   {
    "t": "Trigger the overflow crash",
    "cmd": "./vuln_off $(python3 -c 'print(\"A\"*64)'); echo exit=$?"
   },
   {
    "t": "Check the system ASLR setting",
    "cmd": "cat /proc/sys/kernel/randomize_va_space"
   },
   {
    "t": "Rebuild with the mitigations on",
    "cmd": "gcc -fstack-protector-strong -D_FORTIFY_SOURCE=2 -O2 -pie -fPIE -o vuln_on vuln.c"
   },
   {
    "t": "Confirm the canary now catches the overflow",
    "cmd": "./vuln_on $(python3 -c 'print(\"A\"*64)') 2>&1 | head -1"
   },
   {
    "t": "Verify the binary's protections",
    "cmd": "readelf -d vuln_on | grep -i bind; file vuln_on"
   }
  ],
  "test": "The learner sees a segfault in the unprotected build and a 'stack smashing detected' abort in the hardened build with PIE and ASLR confirmed on."
 },
 {
  "num": 13,
  "slug": "password-attacks",
  "domain": 2,
  "obj": "2.4",
  "title": "Password Attacks: Spraying & Brute Force",
  "objective": "Run controlled brute force and spraying, then detect them in the logs",
  "desc": "The learner brute-forces a local SSH account with hydra, cracks a shadow hash with John, demonstrates spraying, then reads the auth-log signatures each attack leaves.",
  "build": "An attack-and-detect chain covering brute force, cracking and spraying with their log signs.",
  "services": "hydra, john, openssh-server",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools and SSH server",
    "cmd": "apt-get update -qq && apt-get install -y hydra john openssh-server"
   },
   {
    "t": "Create a target account with a weak password",
    "cmd": "useradd -m victim && echo 'victim:password123' | chpasswd"
   },
   {
    "t": "Build a small wordlist",
    "cmd": "printf 'letmein\\npassword123\\nadmin\\n' > words.txt"
   },
   {
    "t": "Brute force SSH against localhost",
    "cmd": "hydra -l victim -P words.txt -t 4 -f ssh://127.0.0.1"
   },
   {
    "t": "Detect the attack in the auth log",
    "cmd": "grep 'Failed password' /var/log/auth.log | tail || journalctl -u ssh | grep 'Failed' | tail"
   },
   {
    "t": "Crack the shadow hash offline with John",
    "cmd": "getent shadow victim > hash.txt && john --wordlist=words.txt hash.txt"
   },
   {
    "t": "Demonstrate password spraying",
    "cmd": "for u in alice bob carol; do hydra -l \"$u\" -p 'Spring2026!' -t 1 -f ssh://127.0.0.1; done"
   },
   {
    "t": "Spot the spraying signature",
    "cmd": "grep 'Failed password' /var/log/auth.log | awk '{print $9}' | sort | uniq -c"
   }
  ],
  "test": "The learner confirms hydra reports the weak password, John reveals the cracked hash, and the log shows many users failing one password (spraying)."
 },
 {
  "num": 14,
  "slug": "malware-static-analysis",
  "domain": 2,
  "obj": "2.4",
  "title": "Malware Static Analysis & Linux IOC Hunting",
  "objective": "Triage a safe sample, then hunt malware indicators on a Linux host",
  "desc": "The learner triages the harmless EICAR test file with file, strings, hashing and YARA, then hunts Linux indicators: a suspicious process, cron persistence and an unusual listening port.",
  "build": "A static-analysis workflow and a Linux IOC-hunting checklist producing hash and YARA indicators.",
  "services": "file, binutils, yara, procps, net-tools",
  "mins": 30,
  "steps": [
   {
    "t": "Install the analysis tools",
    "cmd": "apt-get update -qq && apt-get install -y yara binutils file procps iproute2"
   },
   {
    "t": "Create the safe EICAR test sample",
    "cmd": "printf '%s' 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > sample.txt"
   },
   {
    "t": "Identify the file type and compute the IOC hash",
    "cmd": "file sample.txt && sha256sum sample.txt"
   },
   {
    "t": "Pull printable strings",
    "cmd": "strings sample.txt"
   },
   {
    "t": "Write a YARA rule and scan",
    "cmd": "printf 'rule eicar { strings: $s=\"EICAR-STANDARD\" condition: $s }\\n' > r.yar && yara r.yar sample.txt"
   },
   {
    "t": "Simulate and hunt a suspicious process",
    "cmd": "nohup sleep 6000 >/dev/null 2>&1 & ps -ef | sort -nrk4 | head"
   },
   {
    "t": "Hunt cron persistence",
    "cmd": "ls -la /etc/cron.* /var/spool/cron/crontabs 2>/dev/null; crontab -l 2>/dev/null"
   },
   {
    "t": "Hunt unusual listening ports",
    "cmd": "ss -tlnp | tail -n +2"
   }
  ],
  "test": "The learner confirms the YARA rule matches the sample, records its SHA-256 as an IOC, and lists the suspicious process, cron entry and listening port found during the hunt."
 },
 {
  "num": 15,
  "slug": "dos-detection",
  "domain": 2,
  "obj": "2.4",
  "title": "DoS Simulation and Detection",
  "objective": "Generate a controlled SYN flood, detect it, then rate-limit it",
  "desc": "The learner floods their own loopback with hping3, watches the connection table fill with half-open sockets, then mitigates with SYN cookies and iptables rate-limiting.",
  "build": "A SYN-flood detection-and-mitigation exercise on a local nginx target.",
  "services": "hping3, nginx, iptables",
  "mins": 25,
  "steps": [
   {
    "t": "Install the attacker and target",
    "cmd": "apt-get update -qq && apt-get install -y hping3 nginx iptables"
   },
   {
    "t": "Baseline the connection states",
    "cmd": "ss -s"
   },
   {
    "t": "Launch a loopback-only SYN flood",
    "cmd": "timeout 10 hping3 -S -p 80 --flood 127.0.0.1 &"
   },
   {
    "t": "Watch the half-open connections grow",
    "cmd": "watch -n1 'ss -tan state syn-recv | wc -l' &"
   },
   {
    "t": "Enable SYN cookies",
    "cmd": "sysctl -w net.ipv4.tcp_syncookies=1"
   },
   {
    "t": "Add an iptables rate limit",
    "cmd": "iptables -I INPUT -p tcp --syn --dport 80 -m limit --limit 25/s --limit-burst 50 -j ACCEPT"
   },
   {
    "t": "Re-run the flood and compare",
    "cmd": "timeout 10 hping3 -S -p 80 --flood 127.0.0.1; ss -s"
   }
  ],
  "test": "The learner verifies the SYN-RECV count spikes during the flood and stays bounded after enabling SYN cookies and rate-limiting."
 },
 {
  "num": 16,
  "slug": "linux-hardening",
  "domain": 2,
  "obj": "2.5",
  "title": "Linux Hardening Baseline with Lynis",
  "objective": "Audit, apply CIS-aligned mitigations, and re-score a Linux host",
  "desc": "The learner audits an Ubuntu host with Lynis, applies SSH, sysctl, permission and auto-update hardening, then re-audits to measure the improved hardening index.",
  "build": "A before/after hardening score with CIS-aligned baseline fixes applied.",
  "services": "lynis, unattended-upgrades",
  "mins": 25,
  "steps": [
   {
    "t": "Install Lynis and automatic updates",
    "cmd": "apt-get update -qq && apt-get install -y lynis unattended-upgrades"
   },
   {
    "t": "Run the initial audit and note the score",
    "cmd": "lynis audit system --quick 2>/dev/null | tee lynis-before.txt | grep -i 'hardening index'"
   },
   {
    "t": "Disable unused services",
    "cmd": "systemctl disable --now avahi-daemon cups 2>/dev/null; true"
   },
   {
    "t": "Harden the SSH configuration",
    "cmd": "sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config"
   },
   {
    "t": "Set a directive login banner",
    "cmd": "printf 'Authorised use only. Activity is logged.\\n' > /etc/issue.net"
   },
   {
    "t": "Apply kernel sysctl hardening",
    "cmd": "printf 'kernel.dmesg_restrict=1\\n' > /etc/sysctl.d/99-hardening.conf && sysctl --system >/dev/null"
   },
   {
    "t": "Enable automatic security updates",
    "cmd": "dpkg-reconfigure -f noninteractive unattended-upgrades"
   },
   {
    "t": "Re-audit and compare the hardening index",
    "cmd": "lynis audit system --quick 2>/dev/null | tee lynis-after.txt; grep -i 'hardening index' lynis-*.txt"
   }
  ],
  "test": "The learner confirms the Lynis hardening index climbs 10-15 points between the before and after audits."
 },
 {
  "num": 17,
  "slug": "cloud-shared-responsibility",
  "domain": 3,
  "obj": "3.1",
  "title": "Cloud Shared Responsibility and IAM Least Privilege",
  "objective": "Map cloud responsibilities and enforce least-privilege IAM and IaC",
  "desc": "The learner builds an on-prem/IaaS/PaaS/SaaS responsibility matrix, simulates IAM policy evaluation, replaces a wildcard policy with least privilege, and scans an IaC template for misconfigurations.",
  "build": "A responsibility matrix, an IAM simulator, a least-privilege policy and a clean IaC scan",
  "services": "jq, python3, awk, column (bsdextrautils)",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y jq python3 bsdextrautils"
   },
   {
    "t": "Build the shared responsibility matrix",
    "cmd": "column -s, -t matrix.csv"
   },
   {
    "t": "Query the matrix for who owns each control",
    "cmd": "awk -F, 'NR>1 && $3==\"customer\" {print \"  \" $1}' matrix.csv"
   },
   {
    "t": "Create an over-permissive IAM policy",
    "cmd": "jq -r '.Statement[] | select(.Effect==\"Allow\") | ...' policy-v1.json"
   },
   {
    "t": "Evaluate requests with a policy simulator",
    "cmd": "while read -r act res; do python3 evaluate.py policy-v1.json \"$act\" \"$res\"; done < requests.txt"
   },
   {
    "t": "Rewrite the policy to least privilege and re-evaluate",
    "cmd": "while read -r act res; do python3 evaluate.py policy-v2.json \"$act\" \"$res\"; done < requests.txt"
   },
   {
    "t": "Scan an IaC template for misconfigurations",
    "cmd": "./iac-scan.sh template-v1.json"
   },
   {
    "t": "Fix the template and confirm a clean scan",
    "cmd": "./iac-scan.sh template-v2.json && echo \"Template approved for deployment\""
   }
  ],
  "test": "template-v1 reports 5 findings and template-v2 reports Findings: 0; the v2 policy returns EXPLICIT DENY for s3:DeleteObject and IMPLICIT DENY for iam:CreateUser."
 },
 {
  "num": 18,
  "slug": "container-security-docker",
  "domain": 3,
  "obj": "3.1",
  "title": "Container Security with Docker",
  "objective": "Run containers non-root, read-only, capability-free and capped",
  "desc": "The learner inspects a default root container, builds a non-root image, runs it read-only with all capabilities dropped and resource limits applied, and scans images for known CVEs with Trivy.",
  "build": "A non-root image, a hardened container, a pids-capped container and a Trivy report",
  "services": "docker.io, capsh (libcap2-bin), trivy",
  "mins": 30,
  "steps": [
   {
    "t": "Install Docker and check the engine",
    "cmd": "command -v docker >/dev/null 2>&1 || apt-get install -y docker.io"
   },
   {
    "t": "Run a default container and inspect its privileges",
    "cmd": "capsh --decode=$(docker exec web-default awk '/CapEff/{print $2}' /proc/1/status)"
   },
   {
    "t": "Compare container isolation with the host",
    "cmd": "readlink /proc/1/ns/pid /proc/$PID/ns/pid"
   },
   {
    "t": "Build an image that runs as a non-root user",
    "cmd": "docker build -q -t lab18/app:1.0 . && docker run --rm lab18/app:1.0 id"
   },
   {
    "t": "Harden the container: read-only, no capabilities, no new privileges",
    "cmd": "docker run -d --name app-hardened --read-only --cap-drop ALL --security-opt no-new-privileges:true lab18/app:1.0"
   },
   {
    "t": "Apply resource limits and survive a fork bomb",
    "cmd": "docker run -d --name app-capped --memory 64m --cpus 0.5 --pids-limit 30 lab18/app:1.0"
   },
   {
    "t": "Audit default versus hardened settings",
    "cmd": "docker inspect -f '{{.Name}}: user={{.Config.User}} readonly={{.HostConfig.ReadonlyRootfs}} ...' \"$c\""
   },
   {
    "t": "Scan images for known vulnerabilities",
    "cmd": "trivy image --quiet --scanners vuln --severity HIGH,CRITICAL nginx:1.21-alpine"
   }
  ],
  "test": "app-hardened runs as UID 10001, even root gets 'Read-only file system', CapEff is 0, the capped container refuses to fork past 30 processes, and Trivy lists CVEs for the old image."
 },
 {
  "num": 19,
  "slug": "network-segmentation",
  "domain": 3,
  "obj": "3.2",
  "title": "Network Segmentation and Security Zones",
  "objective": "Segment DMZ, internal and management zones with a default-deny policy",
  "desc": "The learner builds DMZ, internal and management zones as network namespaces, proves a flat network allows lateral movement, then enforces a screened-subnet, jump-server zone policy with iptables.",
  "build": "Three isolated layer 3 zones behind a host router with a logged default-deny chain",
  "services": "ip netns, veth, iptables, netcat, curl, python3",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y iproute2 iptables iputils-ping netcat-openbsd curl"
   },
   {
    "t": "Create three zone namespaces",
    "cmd": "for z in dmz internal mgmt; do ip netns add $z; done"
   },
   {
    "t": "Wire each zone to the host router with veth pairs",
    "cmd": "ip link add veth-$z type veth peer name veth-$z-r"
   },
   {
    "t": "Start services and prove the flat network allows lateral movement",
    "cmd": "ip netns exec dmz nc -zv -w2 10.0.20.2 5432"
   },
   {
    "t": "Apply a default-deny zone policy",
    "cmd": "iptables -A ZONES -s 10.0.20.0/24 -d 10.0.10.0/24 -p tcp --dport 80 -j ACCEPT"
   },
   {
    "t": "Re-test the screened-subnet policy",
    "cmd": "ip netns exec internal curl -s -o /dev/null -w '%{http_code}' http://10.0.10.2/"
   },
   {
    "t": "Read the counters and dropped-packet logs",
    "cmd": "iptables -L ZONES -n -v --line-numbers"
   }
  ],
  "test": "Internal-to-DMZ web returns HTTP 200, DMZ-to-internal port 5432 times out, DMZ-to-management fails, the management zone reaches everything, and the default-deny counter is above zero."
 },
 {
  "num": 20,
  "slug": "firewall-ufw-nftables",
  "domain": 3,
  "obj": "3.2",
  "title": "Stateful Firewall with UFW and nftables",
  "objective": "Build default-deny allow-list firewalls and read rule counters",
  "desc": "The learner builds a UFW allow-list, inspects the netfilter rules it generates, writes a stateful nftables ruleset for a namespaced server, and shows that a layer 4 firewall passes an SQLi payload.",
  "build": "A UFW host policy and an nftables-protected server with per-rule counters",
  "services": "ufw, nftables, iptables, netcat, curl, ip netns",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y ufw nftables netcat-openbsd curl iproute2 iputils-ping"
   },
   {
    "t": "Build a UFW default-deny allow-list",
    "cmd": "ufw default deny incoming && ufw allow 22/tcp && ufw --force enable"
   },
   {
    "t": "Inspect the netfilter rules UFW generated",
    "cmd": "iptables -S ufw-user-input"
   },
   {
    "t": "Disable UFW and build a server namespace",
    "cmd": "ufw --force disable && ip netns add srv"
   },
   {
    "t": "Write a stateful nftables ruleset for the server",
    "cmd": "nft -c -f /root/lab20/srv.nft && echo \"Syntax OK\""
   },
   {
    "t": "Load the ruleset and test allowed versus blocked ports",
    "cmd": "ip netns exec srv nft -f /root/lab20/srv.nft && nc -z -w2 10.20.0.2 23"
   },
   {
    "t": "Read per-rule counters",
    "cmd": "ip netns exec srv nft list chain inet filter input"
   },
   {
    "t": "Compare layer 4 rules with layer 7 filtering",
    "cmd": "curl -s -o /dev/null -w '%{http_code}' \"http://10.20.0.2/?id=1%27%20OR%20%271%27=%271\""
   }
  ],
  "test": "HTTP 80 returns 200, SSH 22 is allowed only from the admin host, Telnet 23 is blocked, the default-deny counter is above zero, and the SQLi request passes the layer 4 rules."
 },
 {
  "num": 21,
  "slug": "waf-modsecurity",
  "domain": 3,
  "obj": "3.2",
  "title": "Web Application Firewall with ModSecurity and the OWASP CRS",
  "objective": "Deploy, enforce and tune a layer 7 WAF with the OWASP CRS",
  "desc": "The learner deploys Apache with ModSecurity and the OWASP CRS, baselines it in DetectionOnly mode, enforces blocking of SQLi, XSS, traversal and command injection, and writes a narrow rule exclusion.",
  "build": "An Apache site protected by the OWASP CRS with a scoped false-positive exclusion",
  "services": "apache2, libapache2-mod-security2, modsecurity-crs, curl",
  "mins": 25,
  "steps": [
   {
    "t": "Install Apache, ModSecurity and the OWASP CRS",
    "cmd": "apt-get install -y apache2 libapache2-mod-security2 modsecurity-crs curl"
   },
   {
    "t": "Create the ModSecurity configuration in DetectionOnly mode",
    "cmd": "cp /etc/modsecurity/modsecurity.conf-recommended /etc/modsecurity/modsecurity.conf"
   },
   {
    "t": "Send an attack in detection-only mode and read the warning",
    "cmd": "grep 'ModSecurity: Warning' /var/log/apache2/error.log | grep -o 'id \"[0-9]*\"' | sort | uniq -c"
   },
   {
    "t": "Switch the rule engine to blocking mode",
    "cmd": "sed -i 's/^SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/modsecurity/modsecurity.conf"
   },
   {
    "t": "Fire SQLi, XSS, traversal and command-injection payloads",
    "cmd": "curl -s -o /dev/null -w \"%{http_code}\\n\" -G --data-urlencode \"$p\" http://127.0.0.1/"
   },
   {
    "t": "Read the matched rule IDs in the logs",
    "cmd": "grep 'ModSecurity' /var/log/apache2/error.log | grep -o 'id \"[0-9]*\"' | sort | uniq -c | sort -rn"
   },
   {
    "t": "Tune a false positive with a narrow exclusion",
    "cmd": "SecRule REQUEST_URI \"@beginsWith /admin/edit\" \"id:1000,...,ctl:ruleRemoveTargetByTag=attack-xss;ARGS:body\""
   }
  ],
  "test": "DetectionOnly returns 200 with logged warnings; in blocking mode all four payloads return 403, a benign search returns 200, and the editor field passes only on /admin/edit."
 },
 {
  "num": 22,
  "slug": "vpn-wireguard",
  "domain": 3,
  "obj": "3.2",
  "title": "Site-to-Site VPN with WireGuard",
  "objective": "Build an encrypted site-to-site tunnel and verify it on the wire",
  "desc": "The learner joins two simulated sites with a WireGuard tunnel, proves with tcpdump that only ciphertext crosses the underlay, and shows AllowedIPs crypto-key routing refusing an unlisted address.",
  "build": "A two-site WireGuard tunnel, a ciphertext-only capture and a crypto-key routing test",
  "services": "wireguard-tools, ip netns, tcpdump, netcat",
  "mins": 25,
  "steps": [
   {
    "t": "Install WireGuard and capture tools",
    "cmd": "apt-get update -qq && apt-get install -y wireguard-tools iproute2 iputils-ping tcpdump netcat-openbsd"
   },
   {
    "t": "Generate a key pair for each site",
    "cmd": "wg genkey | tee siteA.key | wg pubkey > siteA.pub"
   },
   {
    "t": "Create two site namespaces with WireGuard links",
    "cmd": "ip link add wgA type wireguard && ip link set wgA netns siteA"
   },
   {
    "t": "Configure keys, listen ports and allowed IPs",
    "cmd": "ip netns exec siteA wg set wgA private-key siteA.key listen-port 51820 peer ... allowed-ips 10.99.0.2/32"
   },
   {
    "t": "Point each peer at the other's endpoint",
    "cmd": "ip netns exec siteA wg set wgA peer \"$(cat siteB.pub)\" endpoint 127.0.0.1:51821"
   },
   {
    "t": "Verify the tunnel with ping and wg show",
    "cmd": "ip netns exec siteA ping -c3 10.99.0.2 && ip netns exec siteA wg show"
   },
   {
    "t": "Capture the underlay to prove the traffic is encrypted",
    "cmd": "timeout 12 tcpdump -i lo -nn -A -c 20 'udp port 51820 or udp port 51821' > capture.txt"
   },
   {
    "t": "Test crypto-key routing with AllowedIPs",
    "cmd": "ip netns exec siteA ping -c2 -W1 10.99.0.3"
   }
  ],
  "test": "Ping across the tunnel succeeds, wg show reports a recent handshake, the secret message arrives at Site B but never appears in the capture, and traffic to the unlisted 10.99.0.3 is refused."
 },
 {
  "num": 23,
  "slug": "data-classification-dlp",
  "domain": 3,
  "obj": "3.3",
  "title": "Data Classification and Data Loss Prevention",
  "objective": "Classify data, detect PII with DLP, and mask, tokenise and restrict it",
  "desc": "The learner labels files by classification, builds a regex DLP scanner for NRIC/FIN, Luhn-valid cards and emails, catches a mislabelled file, then applies masking, tokenisation, HMAC and permissions.",
  "build": "A labelled data store, a DLP scanner, masked and tokenised outputs, a token vault and need-to-know ACLs",
  "services": "python3 (re, hmac, secrets), openssl, chmod/chown, useradd",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y python3 openssl acl"
   },
   {
    "t": "Create a synthetic data set",
    "cmd": "cat > hr-salaries.csv <<'EOF' ... EOF"
   },
   {
    "t": "Label each file by classification",
    "cmd": "cat > labels.csv <<'EOF' ... EOF"
   },
   {
    "t": "Write a regex DLP scanner with a Luhn check",
    "cmd": "NRIC = re.compile(r\"\\b[STFGM]\\d{7}[A-Z]\\b\")"
   },
   {
    "t": "Run the scan and find the mislabelled file",
    "cmd": "python3 dlp_scan.py data labels.csv"
   },
   {
    "t": "Mask and tokenise the sensitive fields",
    "cmd": "python3 protect.py && python3 protect.py detok \"$TOKEN\""
   },
   {
    "t": "Pseudonymise with a keyed hash instead of a plain hash",
    "cmd": "openssl rand -hex 32 > vault/hmac.key && chmod 600 vault/hmac.key"
   },
   {
    "t": "Apply permission restrictions by classification",
    "cmd": "chown root:hr data/hr-salaries.csv && chmod 640 data/hr-salaries.csv"
   },
   {
    "t": "Re-scan the protected output to confirm no raw PII remains",
    "cmd": "python3 dlp_scan.py out && echo \"Sanitised output is safe to share\""
   }
  ],
  "test": "The scan flags the Public press release containing an NRIC (1 violation), ignores the Luhn-invalid card, the protected output scans clean, and the analyst cannot read Restricted data."
 },
 {
  "num": 24,
  "slug": "disk-encryption-luks",
  "domain": 3,
  "obj": "3.3",
  "title": "Data at Rest: LUKS2 Disk Encryption",
  "objective": "Encrypt data at rest with LUKS2 and manage its keys",
  "desc": "The learner creates a LUKS2 volume on a loop device, proves plaintext is absent from the encrypted image but present on an unencrypted one, rotates the passphrase, adds a keyfile and backs up the header.",
  "build": "An encrypted volume with two key slots, a header backup and a plaintext comparison",
  "services": "cryptsetup, losetup, mkfs.ext4, grep",
  "mins": 20,
  "steps": [
   {
    "t": "Install cryptsetup",
    "cmd": "apt-get update -qq && apt-get install -y cryptsetup"
   },
   {
    "t": "Create a virtual disk on a loop device",
    "cmd": "LOOP=$(losetup -f --show vault.img)"
   },
   {
    "t": "Format the device with LUKS2 and inspect the header",
    "cmd": "cryptsetup luksFormat -q --type luks2 --cipher aes-xts-plain64 --key-size 512 --pbkdf argon2id \"$LOOP\" pass1"
   },
   {
    "t": "Open the volume, create a filesystem and store data",
    "cmd": "cryptsetup open --key-file pass1 \"$LOOP\" vault && mkfs.ext4 -q /dev/mapper/vault"
   },
   {
    "t": "Prove the plaintext is absent from the raw image",
    "cmd": "grep -a -c 'payroll export' vault.img"
   },
   {
    "t": "Rotate the passphrase",
    "cmd": "cryptsetup luksChangeKey \"$LOOP\" --key-file pass1 --pbkdf-memory 65536 pass2"
   },
   {
    "t": "Add a keyfile slot and back up the header",
    "cmd": "cryptsetup luksAddKey \"$LOOP\" --key-file pass2 luks.key && cryptsetup luksHeaderBackup \"$LOOP\" ..."
   }
  ],
  "test": "The unencrypted image shows 1 match and the LUKS image 0, the old passphrase is rejected, and both the new passphrase and the keyfile unlock the volume."
 },
 {
  "num": 25,
  "slug": "tls-hardening",
  "domain": 3,
  "obj": "3.3",
  "title": "Data in Transit: TLS Hardening and Cipher Audit",
  "objective": "Audit and harden an HTTPS server to TLS 1.2/1.3 with HSTS",
  "desc": "The learner stands up a deliberately weak nginx HTTPS site, proves it accepts TLS 1.1 and non-forward-secret ciphers, applies a hardened TLS profile with HSTS, and re-audits with OpenSSL and testssl.sh.",
  "build": "A hardened TLS 1.2/1.3 nginx site with HSTS and before/after audit reports",
  "services": "nginx, openssl s_client, testssl.sh, curl",
  "mins": 25,
  "steps": [
   {
    "t": "Install nginx, OpenSSL and testssl.sh",
    "cmd": "git clone --depth 1 --branch 3.2 https://github.com/testssl/testssl.sh.git /opt/testssl"
   },
   {
    "t": "Create a certificate and a deliberately weak HTTPS site",
    "cmd": "openssl req -x509 -newkey rsa:2048 -nodes -days 30 -keyout ... -subj \"/CN=localhost\""
   },
   {
    "t": "Probe the weak site with openssl s_client",
    "cmd": "echo | openssl s_client -connect 127.0.0.1:443 -tls1_1 -cipher 'DEFAULT:@SECLEVEL=0'"
   },
   {
    "t": "Run a baseline testssl.sh audit",
    "cmd": "/opt/testssl/testssl.sh --quiet --color 0 -p -f -h https://127.0.0.1 > /root/lab25-baseline.txt"
   },
   {
    "t": "Write a hardened TLS configuration",
    "cmd": "cat > /etc/nginx/snippets/tls-hardening.conf <<'EOF' ... EOF"
   },
   {
    "t": "Reload nginx and re-test with openssl s_client",
    "cmd": "nginx -t && systemctl reload nginx && curl -skI https://127.0.0.1/"
   },
   {
    "t": "Re-audit with testssl.sh and compare",
    "cmd": "/opt/testssl/testssl.sh --quiet --color 0 -p -f -h https://127.0.0.1 > /root/lab25-hardened.txt"
   }
  ],
  "test": "After hardening TLS 1.1 returns 'Cipher is (NONE)', TLS 1.3 negotiates TLS_AES_256_GCM_SHA384, HSTS is present, and testssl.sh shows TLS 1 and TLS 1.1 as not offered."
 },
 {
  "num": 26,
  "slug": "backup-recovery",
  "domain": 3,
  "obj": "3.4",
  "title": "Backup and Recovery with restic",
  "objective": "Run encrypted backups, recover from ransomware and replicate off site",
  "desc": "The learner takes encrypted, deduplicated restic snapshots, simulates ransomware, restores and times the clean snapshot, replicates the repository off site with an integrity check, and schedules backups.",
  "build": "An encrypted restic repository, a timed restore, a verified off-site replica and a cron schedule",
  "services": "restic, rsync, cron, python3",
  "mins": 25,
  "steps": [
   {
    "t": "Install restic and rsync",
    "cmd": "apt-get update -qq && apt-get install -y restic rsync python3"
   },
   {
    "t": "Create production data and an encrypted repository",
    "cmd": "export RESTIC_REPOSITORY=/backup RESTIC_PASSWORD_FILE=/root/lab26/restic.pass && restic init"
   },
   {
    "t": "Take a baseline snapshot and prove the repository is encrypted",
    "cmd": "restic backup /data --tag baseline"
   },
   {
    "t": "Change the data and take a second snapshot",
    "cmd": "restic backup /data --tag daily && restic diff \"$OLD\" \"$NEW\""
   },
   {
    "t": "Simulate a ransomware attack",
    "cmd": "for f in /data/*.txt; do echo \"ENCRYPTED_BY_RANSOMWARE\" > \"$f\"; mv \"$f\" \"$f.locked\"; done"
   },
   {
    "t": "Restore the clean snapshot and time the recovery",
    "cmd": "time restic restore latest --target /restore"
   },
   {
    "t": "Replicate the repository off site and verify integrity",
    "cmd": "rsync -a /backup/ /offsite/ && restic -r /offsite check --read-data"
   },
   {
    "t": "Schedule backups and apply a retention policy",
    "cmd": "restic forget --keep-last 1 --dry-run"
   }
  ],
  "test": "The repository holds no plaintext, the restore brings back the pre-ransomware files with 0 locked files left, and restic check on the off-site replica reports no errors."
 },
 {
  "num": 27,
  "slug": "raid-mdadm",
  "domain": 3,
  "obj": "3.4",
  "title": "Storage Resilience with Software RAID (mdadm)",
  "objective": "Build RAID arrays that survive a disk failure and rebuild",
  "desc": "The learner builds a RAID 1 mirror from loop devices, fails a disk and verifies checksums, rebuilds onto a spare, compares RAID 5 capacity, and shows that RAID replicates corruption.",
  "build": "A RAID 1 array that survives failure and rebuilds, plus a three-disk RAID 5 array",
  "services": "mdadm, losetup, mkfs.ext4, sha256sum",
  "mins": 25,
  "steps": [
   {
    "t": "Install mdadm and create virtual disks",
    "cmd": "apt-get install -y mdadm && for d in 1 2 3 4 5 6; do truncate -s 128M disk$d.img; done"
   },
   {
    "t": "Attach the images as loop devices",
    "cmd": "for d in 1 2 3 4 5 6; do losetup -f --show disk$d.img; done | tee loops.txt"
   },
   {
    "t": "Build a RAID 1 mirror and watch it sync",
    "cmd": "yes | mdadm --create /dev/md10 --level=1 --raid-devices=2 --run \"${LO[0]}\" \"${LO[1]}\""
   },
   {
    "t": "Create a filesystem and record checksums",
    "cmd": "sha256sum /mnt/raid/database.bin /mnt/raid/ledger.txt | tee /root/lab27/before.sha256"
   },
   {
    "t": "Fail a disk and prove the data survives",
    "cmd": "mdadm /dev/md10 --fail \"${LO[0]}\" && mdadm /dev/md10 --remove \"${LO[0]}\""
   },
   {
    "t": "Replace the failed disk and rebuild the mirror",
    "cmd": "mdadm /dev/md10 --add \"${LO[2]}\" && cat /proc/mdstat"
   },
   {
    "t": "Build a RAID 5 array and compare capacity",
    "cmd": "yes | mdadm --create /dev/md11 --level=5 --raid-devices=3 --run ..."
   },
   {
    "t": "Show that RAID is not a backup, and save the configuration",
    "cmd": "sha256sum -c /root/lab27/before.sha256; mdadm --detail --scan"
   }
  ],
  "test": "The degraded mirror still passes its checksums, returns to clean with 2 active devices after the rebuild, RAID 5 gives about twice the mirror's capacity, and the corrupted ledger fails on a healthy array."
 },
 {
  "num": 28,
  "slug": "mobile-endpoint-hardening",
  "domain": 4,
  "obj": "4.1",
  "title": "Mobile and Endpoint Hardening Baseline",
  "objective": "Establish, deploy and verify an MDM-style endpoint baseline",
  "desc": "The learner establishes a secure endpoint baseline (passcode, screen lock, encryption, app control, radios, root detection) and proves it with a PASS/FAIL compliance script.",
  "build": "A baseline policy file, a WPA3-Enterprise Wi-Fi profile, the enforced settings and a 9/9 compliance report.",
  "services": "libpam-pwquality, dconf-cli, cryptsetup, jq",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y libpam-pwquality libpwquality-tools dconf-cli cryptsetup jq"
   },
   {
    "t": "Establish the baseline and the Wi-Fi profile",
    "cmd": "mkdir -p /etc/baseline; cat > /etc/baseline/endpoint-baseline.json <<'EOF'"
   },
   {
    "t": "Deploy the passcode policy",
    "cmd": "cat > /etc/security/pwquality.conf.d/50-baseline.conf <<'EOF'  (minlen=12 minclass=3)"
   },
   {
    "t": "Enforce screen lock and idle timeout",
    "cmd": "cat > /etc/profile.d/99-idle-lock.sh <<'EOF'  (TMOUT=600; readonly TMOUT)"
   },
   {
    "t": "Require encryption for the secure folder",
    "cmd": "cryptsetup luksFormat --batch-mode --type luks2 /root/secure-folder.img /root/secure-folder.key"
   },
   {
    "t": "Enforce the app deny-list and block sideloading",
    "cmd": "cat > /etc/apt/preferences.d/99-baseline-deny-list <<'EOF'  (Pin-Priority: -1)"
   },
   {
    "t": "Disable unneeded radios and services, and detect root-level tampering",
    "cmd": "systemctl disable --now bluetooth.service 2>/dev/null || echo 'no bluetooth service'"
   },
   {
    "t": "Verify compliance with a check script",
    "cmd": "cat > /usr/local/sbin/baseline-check <<'EOF'  then run baseline-check"
   }
  ],
  "test": "baseline-check prints 'Result: 9 passed, 0 failed' with exit 0; removing the noexec mount makes one check FAIL with exit 1."
 },
 {
  "num": 29,
  "slug": "appsec-sast-code-signing",
  "domain": 4,
  "obj": "4.1",
  "title": "Application Security: Validation, SAST and Code Signing",
  "objective": "Find and fix injection flaws, then sign and verify a release",
  "desc": "The learner scans a Python app with Bandit, fixes it with input validation and parameterised queries, sets secure cookie flags, GPG-signs a release, detects tampering and sandboxes untrusted code.",
  "build": "A vulnerable and fixed app, before/after Bandit reports, a secure-cookie server and a GPG-signed release.",
  "services": "bandit (venv), gnupg, systemd-run, jq",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "python3 -m venv /opt/sast && /opt/sast/bin/pip install -q bandit"
   },
   {
    "t": "Create the vulnerable application",
    "cmd": "mkdir -p /opt/appsec/vuln; cat > /opt/appsec/vuln/lookup.py <<'EOF'"
   },
   {
    "t": "Run static analysis with Bandit",
    "cmd": "/opt/sast/bin/bandit -r vuln -f json -o bandit-before.json || echo 'issues found'"
   },
   {
    "t": "Confirm the SQL injection dynamically",
    "cmd": "python3 vuln/lookup.py \"x' OR '1'='1\""
   },
   {
    "t": "Fix the code with validation and parameterisation",
    "cmd": "mkdir -p /opt/appsec/fixed; cat > /opt/appsec/fixed/lookup.py <<'EOF'  (allow-list regex)"
   },
   {
    "t": "Issue cookies with secure flags",
    "cmd": "cat > /opt/appsec/cookie_server.py <<'EOF'  (Set-Cookie: Secure; HttpOnly; SameSite)"
   },
   {
    "t": "Sign the release with GPG",
    "cmd": "gpg --batch --gen-key keyparams; gpg --armor --detach-sign lookup-1.0.tar.gz"
   },
   {
    "t": "Detect a tampered release",
    "cmd": "gpg --verify lookup-1.0.tar.gz.asc lookup-1.0-tampered.tar.gz || echo 'SIGNATURE CHECK FAILED'"
   },
   {
    "t": "Run untrusted code in a sandbox",
    "cmd": "systemd-run --wait --pipe -p ProtectSystem=strict -p PrivateNetwork=yes /bin/sh -c '...'"
   }
  ],
  "test": "Bandit on the fixed code exits 0, the fixed app rejects the injection input, and GPG reports 'Good signature' for the original but 'BAD signature' for the tampered copy."
 },
 {
  "num": 30,
  "slug": "data-sanitisation",
  "domain": 4,
  "obj": "4.2",
  "title": "Asset Inventory, Media Sanitisation and Disposal",
  "objective": "Track an asset to disposal and certify the sanitisation",
  "desc": "The learner records an asset's owner and classification, checks retention and legal hold, proves deletion is not sanitisation, wipes a device with shred/dd/blkdiscard, performs a crypto erase and issues a NIST SP 800-88 certificate.",
  "build": "An ITAM folder with inventory, retention schedule, read-back verification and a signed certificate of sanitisation.",
  "services": "util-linux, coreutils, shred, cryptsetup, jq",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y util-linux coreutils e2fsprogs cryptsetup jq bsdextrautils; mkdir -p /root/itam"
   },
   {
    "t": "Build the asset inventory and enumerate this host",
    "cmd": "cat > inventory.csv <<'EOF'  (asset_tag,type,owner,classification,status)"
   },
   {
    "t": "Check retention and legal hold before disposal",
    "cmd": "cat > retention-schedule.csv <<'EOF'  (record_type,retention_period,legal_hold)"
   },
   {
    "t": "Prove that deleting is not sanitising",
    "cmd": "LOOP=$(losetup -f --show retired-disk.img); mkfs.ext4 -q \"$LOOP\"; write then rm; grep -a CONFIDENTIAL"
   },
   {
    "t": "Clear the media with shred",
    "cmd": "shred -v -n 1 -z \"$LOOP\"; grep -a -c 'CONFIDENTIAL' \"$LOOP\" || echo '0 matches'"
   },
   {
    "t": "Use the alternatives: dd zero-fill and blkdiscard",
    "cmd": "dd if=/dev/zero of=\"$LOOP\" bs=1M oflag=direct; blkdiscard -f \"$LOOP\""
   },
   {
    "t": "Verify the result and keep evidence",
    "cmd": "cmp -n \"$SIZE\" \"$LOOP\" /dev/zero && echo VERIFIED; sha256sum \"$LOOP\" | tee verify-hash.txt"
   },
   {
    "t": "Purge by cryptographic erase",
    "cmd": "cryptsetup luksFormat --batch-mode --type luks2 laptop-ssd.img laptop-ssd.key; cryptsetup luksErase --batch-mode"
   },
   {
    "t": "Issue the certificate and close the asset record",
    "cmd": "cat > certificate-SG-DISK-0099.txt <<EOF  (NIST SP 800-88 fields); update inventory status"
   }
  ],
  "test": "grep finds 0 CONFIDENTIAL matches on the wiped image, the certificate shows the Clear level and a 64-hex hash, and the inventory status reads 'Sanitised - certificate on file'."
 },
 {
  "num": 31,
  "slug": "vulnerability-scanning",
  "domain": 4,
  "obj": "4.3",
  "title": "Vulnerability Scanning, Confirmation and Rescan",
  "objective": "Scan, confirm, prioritise, remediate and validate a finding",
  "desc": "The learner scans a deliberately weak web server with Nmap and Nikto, compares the uncredentialed and credentialed views, confirms true vs false positives, prioritises with CVSS and context, remediates and rescans.",
  "build": "A vuln folder with raw scan output, a triage sheet, a CVSS-prioritised register and a before/after report.",
  "services": "apache2, nmap, nikto, curl",
  "mins": 30,
  "steps": [
   {
    "t": "Install the scanners and the target",
    "cmd": "apt-get install -y apache2 nmap nikto curl; systemctl enable --now apache2"
   },
   {
    "t": "Plant realistic weaknesses",
    "cmd": "echo 'db_password=...' > /var/www/html/backup/config.bak; ServerTokens Full; systemctl reload apache2"
   },
   {
    "t": "Run an uncredentialed network scan with Nmap",
    "cmd": "nmap -sV -p 22,80 --script 'http-headers,http-enum,vulners' 127.0.0.1 -oN nmap-before.txt"
   },
   {
    "t": "Scan the web application with Nikto",
    "cmd": "nikto -h http://127.0.0.1 -o nikto-before.txt -Format txt"
   },
   {
    "t": "Add the credentialed view",
    "cmd": "apt-get -s upgrade | grep '^Inst' > missing-patches.txt"
   },
   {
    "t": "Confirm findings as true or false positives",
    "cmd": "curl -sI http://127.0.0.1 | grep -iE 'server|x-frame'; cat > triage.csv <<'EOF'"
   },
   {
    "t": "Prioritise with CVSS and context",
    "cmd": "cat > findings-register.csv <<'EOF'  (id,cvss_base,vector,exposure,priority,due)"
   },
   {
    "t": "Remediate",
    "cmd": "mv /var/www/html/backup/config.bak quarantine/; ServerTokens Prod; Options -Indexes; systemctl reload apache2"
   },
   {
    "t": "Rescan to validate and report",
    "cmd": "nikto -h http://127.0.0.1 -o nikto-after.txt; nmap ... -oN nmap-after.txt; write validation-report.txt"
   }
  ],
  "test": "After remediation the Server header shows no version, both security headers are present, /backup/ returns 403 or 404, and the report shows fewer Nikto findings than before."
 },
 {
  "num": 32,
  "slug": "vulnerability-management-trivy",
  "domain": 4,
  "obj": "4.3",
  "title": "Vulnerability Management Pipeline with Trivy",
  "objective": "Run the vulnerability management cycle end to end with Trivy",
  "desc": "The learner runs package, OS and container scans with Trivy, builds a CVSS-sorted patch queue, enriches it with the CISA KEV feed, records a time-boxed exception, remediates and rescans, then scans for secrets.",
  "build": "A VM-lab folder with JSON scans, a patch queue, a KEV-matched list, an exceptions file and a before/after report.",
  "services": "trivy, curl, jq",
  "mins": 30,
  "steps": [
   {
    "t": "Install Trivy",
    "cmd": "curl -sfL .../trivy/.../install.sh | sh -s -- -b /usr/local/bin v0.74.0; trivy --version"
   },
   {
    "t": "Package monitoring: scan the app's dependencies",
    "cmd": "cat > app/requirements.txt <<'EOF'; trivy fs --format json -o deps-before.json app/"
   },
   {
    "t": "Scan the host operating system",
    "cmd": "trivy rootfs --scanners vuln --pkg-types os --severity HIGH,CRITICAL --skip-dirs /proc,/sys /"
   },
   {
    "t": "Scan a container image",
    "cmd": "trivy image --image-src remote --format json -o image-before.json node:14-alpine"
   },
   {
    "t": "Build a CVSS-sorted patch queue",
    "cmd": "jq -r '...CVSS.nvd.V3Score...' deps-before.json image-before.json | sort -gr > patch-queue.tsv"
   },
   {
    "t": "Add threat intelligence: the CISA KEV feed",
    "cmd": "curl -s -o kev.json .../known_exploited_vulnerabilities.json; grep -Fxf kev-ids.txt"
   },
   {
    "t": "Record a time-boxed exception",
    "cmd": "cat > exceptions.trivyignore <<EOF  ($TOP exp:2026-12-31)"
   },
   {
    "t": "Remediate and validate with a rescan",
    "cmd": "cat > app/requirements.txt <<'EOF'  (upgraded); trivy fs --format json -o deps-after.json app/"
   },
   {
    "t": "Scan for secrets and write the report",
    "cmd": "trivy fs --scanners secret app/; write vm-report.txt"
   }
  ],
  "test": "The report shows fewer dependency findings after the upgrade than before, lists the KEV match count and one open exception, and the CRITICAL gate prints exit 0."
 },
 {
  "num": 33,
  "slug": "siem-wazuh",
  "domain": 4,
  "obj": "4.4",
  "title": "SIEM Alerting and Monitoring with Wazuh",
  "objective": "Aggregate logs, write a detection, tune and query a SIEM",
  "desc": "The learner runs a single-node Wazuh SIEM, aggregates an application log, writes a custom detection, triggers and reads real alerts, reports on them, tunes out a known-good source, queries the REST API and enables archiving.",
  "build": "A working Wazuh manager with a custom log source, a detection and a tuning rule, an alert report and JSON archiving.",
  "services": "wazuh-manager, wazuh-indexer, curl, jq",
  "mins": 30,
  "steps": [
   {
    "t": "Install the Wazuh all-in-one stack",
    "cmd": "curl -sO https://packages.wazuh.com/4.9/wazuh-install.sh; bash wazuh-install.sh -a -i"
   },
   {
    "t": "Confirm the services and collect the API password",
    "cmd": "for s in wazuh-manager wazuh-indexer wazuh-dashboard; do systemctl is-active $s; done"
   },
   {
    "t": "Aggregate an application log and add a custom detection",
    "cmd": "cat >> /var/ossec/etc/ossec.conf <<'EOF'  (<localfile> /var/log/labapp.log)"
   },
   {
    "t": "Generate security events",
    "cmd": "for i in $(seq 1 12); do ssh -o BatchMode=yes baduser$i@127.0.0.1 true 2>/dev/null; done"
   },
   {
    "t": "Read the alerts and build a report",
    "cmd": "jq -c 'select(.rule.id==\"5710\" or ...)' alerts.json | tail; write /root/alert-summary.txt"
   },
   {
    "t": "Tune out a known-good source",
    "cmd": "cat >> /var/ossec/etc/rules/local_rules.xml <<'EOF'  (rule id=100110 level=0)"
   },
   {
    "t": "Query the SIEM through its REST API",
    "cmd": "TOKEN=$(curl -sk -u wazuh:$API_PASS -X POST .../security/user/authenticate?raw=true)"
   },
   {
    "t": "Turn on archiving and check retention",
    "cmd": "sed -i 's|<logall_json>no|<logall_json>yes|' ossec.conf; systemctl restart wazuh-manager"
   }
  ],
  "test": "Alert counts appear for rule 5710 and the custom rule 100100, no level-0 alerts remain in the alert file, and archives.json exists so archiving is on."
 },
 {
  "num": 34,
  "slug": "file-integrity-aide",
  "domain": 4,
  "obj": "4.4",
  "title": "File Integrity Monitoring with AIDE",
  "objective": "Baseline critical files, detect tampering and re-baseline",
  "desc": "The learner baselines critical files with AIDE, detects a defacement, a dropped backdoor and a new account, responds by restoring and quarantining, re-baselines after an approved change and forwards the check to syslog.",
  "build": "A scoped AIDE config and protected baseline, a tamper report, a quarantine folder and a scheduled check to the journal.",
  "services": "aide, cron, logger, journalctl",
  "mins": 25,
  "steps": [
   {
    "t": "Install AIDE",
    "cmd": "apt-get install -y aide; aide --version"
   },
   {
    "t": "Create the content to protect",
    "cmd": "echo '<h1>C628 Bank</h1>' > /srv/webapp/index.html; cp -a to /root/known-good/"
   },
   {
    "t": "Write a scoped AIDE configuration",
    "cmd": "cat > /etc/aide/aide-lab.conf <<'EOF'  (database_in/out, report_url=stdout, selection)"
   },
   {
    "t": "Initialise the baseline and protect it",
    "cmd": "aide --config=/etc/aide/aide-lab.conf --init; cp .db.new .db; chmod 400 .db"
   },
   {
    "t": "Simulate an intrusion",
    "cmd": "echo HACKED > index.html; cp /bin/sh /usr/local/bin/.sysupdate; chmod 4755; useradd -m svc-update"
   },
   {
    "t": "Detect the changes",
    "cmd": "aide --config=/etc/aide/aide-lab.conf --check > /root/aide-tamper-report.txt; echo exit $?"
   },
   {
    "t": "Respond: restore and quarantine",
    "cmd": "cp -a /root/known-good/index.html /srv/webapp/; mv .sysupdate /root/quarantine/; usermod -L svc-update"
   },
   {
    "t": "Re-baseline after the approved change",
    "cmd": "sha256sum -c offhost/aide-db.sha256; aide --config=... --update; cp .db.new .db"
   },
   {
    "t": "Schedule the check and forward it to syslog",
    "cmd": "cat > /etc/cron.d/aide-lab <<'EOF'  (aide --check | logger -t aide-lab)"
   }
  ],
  "test": "The clean check exits 0; after the intrusion the report lists the changed page, the added SUID binary and the new account; after re-baseline the check is clean again."
 },
 {
  "num": 35,
  "slug": "ssh-hardening-fail2ban",
  "domain": 4,
  "obj": "4.5",
  "title": "Secure Remote Access: SSH Hardening and Fail2ban",
  "objective": "Enforce key-only SSH and auto-ban brute-force sources",
  "desc": "The learner replaces password logins with key-only SSH, restricts the protocol to modern cryptography, and lets Fail2ban turn failed-login logs into automatic firewall blocks against a simulated attacker address.",
  "build": "A hardened sshd drop-in with a banner, an Ed25519 key login and a Fail2ban jail that bans 10.10.10.10.",
  "services": "openssh-server, fail2ban, nftables, ssh-keygen",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y openssh-server openssh-client fail2ban python3-systemd nftables; systemctl enable --now ssh"
   },
   {
    "t": "Audit the current exposure",
    "cmd": "sshd -T | grep -Ei '^(port|permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries)'"
   },
   {
    "t": "Create and authorise an Ed25519 key",
    "cmd": "ssh-keygen -t ed25519 -f ~/.ssh/c628_ed25519 -N '' -q; cat *.pub >> ~/.ssh/authorized_keys"
   },
   {
    "t": "Harden sshd with a drop-in file",
    "cmd": "cat > /etc/issue.net <<'EOF'; cat > /etc/ssh/sshd_config.d/01-c628-hardening.conf <<'EOF'"
   },
   {
    "t": "Verify key-only login and the negotiated crypto",
    "cmd": "ssh -i ~/.ssh/c628_ed25519 -o BatchMode=yes root@127.0.0.1 'echo KEY-LOGIN-OK'"
   },
   {
    "t": "Configure the Fail2ban jail",
    "cmd": "ip addr add 10.10.10.10/32 dev lo; cat > /etc/fail2ban/jail.d/sshd-c628.local <<'EOF'"
   },
   {
    "t": "Simulate a brute-force attempt from the attacker address",
    "cmd": "for u in admin oracle test guest ubuntu; do ssh -b 10.10.10.10 ... true; done"
   },
   {
    "t": "Confirm the firewall block, then unban",
    "cmd": "nft list ruleset | grep 10.10.10.10; fail2ban-client set sshd unbanip 10.10.10.10"
   }
  ],
  "test": "sshd -T confirms passwordauthentication no, key login prints KEY-LOGIN-OK, and Fail2ban lists 10.10.10.10 in the banned IP list until it is unbanned."
 },
 {
  "num": 36,
  "slug": "ids-suricata",
  "domain": 4,
  "obj": "4.5",
  "title": "Network IDS with Suricata",
  "objective": "Run Suricata as an IDS, write signatures and read alerts",
  "desc": "The learner runs Suricata as a network IDS on loopback, loads the open ruleset, writes three custom signatures (content, web-attack, scan threshold), generates matching traffic and summarises the alerts from eve.json.",
  "build": "A Suricata sensor on loopback, a custom rule file with three signatures and a jq alert report.",
  "services": "suricata, suricata-update, jq, nmap",
  "mins": 25,
  "steps": [
   {
    "t": "Install Suricata and helpers",
    "cmd": "apt-get install -y suricata jq nmap curl python3; suricata --build-info"
   },
   {
    "t": "Download the open ruleset",
    "cmd": "suricata-update -q || echo 'offline: custom rules still work'"
   },
   {
    "t": "Start a local web server to protect",
    "cmd": "cd /srv/lab36 && nohup python3 -m http.server 8080 --bind 127.0.0.1 &"
   },
   {
    "t": "Write custom signatures",
    "cmd": "cat > /etc/suricata/rules/lab36.rules <<'EOF'  (sid 1000001-1000003)"
   },
   {
    "t": "Run Suricata in IDS mode on loopback",
    "cmd": "suricata -c /etc/suricata/suricata.yaml -i lo -k none -s rules/lab36.rules -l /var/log/suricata -D"
   },
   {
    "t": "Generate suspicious traffic against your own host",
    "cmd": "curl .../secret-admin; curl '...?q=1 UNION SELECT...'; nmap -sS -p 1-200 127.0.0.1"
   },
   {
    "t": "Read and summarise the alerts",
    "cmd": "jq -c 'select(.event_type==\"alert\")' /var/log/suricata/eve.json; count by signature"
   },
   {
    "t": "Tune a noisy rule and compare IDS with IPS",
    "cmd": "cat >> /etc/suricata/threshold.config <<'EOF'  (suppress sig_id 1000003 by_src)"
   }
  ],
  "test": "eve.json contains the three local sids 1000001, 1000002 and 1000003, proving the content rule, the web-attack rule and the scan-threshold rule all fired."
 },
 {
  "num": 37,
  "slug": "edr-osquery",
  "domain": 4,
  "obj": "4.5",
  "title": "Endpoint Detection and Response with osquery",
  "objective": "Turn a host into an EDR sensor and hunt a planted threat",
  "desc": "The learner installs osquery, queries live host state with SQL, schedules a detection pack with osqueryd, plants a suspicious process and cron persistence, hunts them down, then preserves evidence, contains and eradicates.",
  "build": "osquery from the official repo, a scheduled c628-hunt pack logging JSON results and an evidence folder of hashes.",
  "services": "osquery, osqueryd, jq, netcat-openbsd",
  "mins": 25,
  "steps": [
   {
    "t": "Install osquery from the official repository",
    "cmd": "add pkg.osquery.io apt repo (signed-by key); apt-get install -y osquery; osqueryi --version"
   },
   {
    "t": "Ask the endpoint questions with osqueryi",
    "cmd": "osqueryi --json \"SELECT name, pid, path FROM processes ORDER BY resident_size DESC LIMIT 5;\""
   },
   {
    "t": "Baseline the persistence and privilege surface",
    "cmd": "osqueryi --json 'SELECT path,command FROM crontab;' | tee baseline-crontab.json; suid_bin, kernel_modules"
   },
   {
    "t": "Schedule a detection pack with osqueryd",
    "cmd": "cat > /etc/osquery/packs/c628-hunt.conf <<'EOF'; systemctl restart osqueryd"
   },
   {
    "t": "Plant a suspicious process and cron persistence",
    "cmd": "cp nc /tmp/.kworker-update; nohup /tmp/.kworker-update -lk 4444 &; rm; echo cron > /etc/cron.d/..."
   },
   {
    "t": "Hunt for the indicators",
    "cmd": "osqueryi --json \"SELECT pid,path,on_disk FROM processes WHERE on_disk=0 OR path LIKE '/tmp/%';\""
   },
   {
    "t": "Read the detections in the osqueryd telemetry",
    "cmd": "jq -c 'select(.action==\"added\" and (.name|test(\"suspicious_processes\")))' osqueryd.results.log"
   },
   {
    "t": "Respond: preserve evidence, contain, eradicate and confirm",
    "cmd": "cp /proc/$PID/exe /root/edr/evidence; sha256sum; kill $PID; mv cron and suid to evidence"
   }
  ],
  "test": "After response the hunt queries return empty, the results log shows an 'added' then a 'removed' event for suspicious_processes, and the evidence file holds a 64-hex SHA-256 of the planted binary."
 },
 {
  "num": 38,
  "slug": "iam-pam-sudo",
  "domain": 4,
  "obj": "4.6",
  "title": "Identity & Access Management with PAM and sudo",
  "objective": "Provision RBAC users, scope sudo, and enforce password policy",
  "desc": "Provision role-based users, scope sudo per role, add JIT elevation, enforce a pwquality and faillock policy, apply a time-of-day rule, then de-provision a leaver.",
  "build": "RBAC roles with scoped sudo, a self-revoking JIT grant, pwquality, pam_faillock, pam_time and an offboarded account.",
  "services": "sudo, acl, libpam-pwquality, pam_faillock, pam_time, pamtester, chage",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y sudo acl libpam-pwquality libpwquality-tools pamtester"
   },
   {
    "t": "Provision role groups and users",
    "cmd": "while IFS=: read -r u g gecos; do useradd -m -G \"$g\" -c \"$gecos\" \"$u\"; done <<'EOF'"
   },
   {
    "t": "Assign file permissions with DAC and ACLs",
    "cmd": "chown root:auditor /srv/reports; chmod 750 /srv/reports; setfacl -m u:bob:rx /srv/reports"
   },
   {
    "t": "Scope sudo per role (RBAC)",
    "cmd": "cat > /etc/sudoers.d/10-roles <<'EOF' ... ; visudo -cf /etc/sudoers.d/10-roles"
   },
   {
    "t": "Grant a self-revoking JIT privilege",
    "cmd": "systemd-run --unit=jit-revoke-carol --on-active=120 /bin/rm -f /etc/sudoers.d/90-jit-carol"
   },
   {
    "t": "Enforce a password policy",
    "cmd": "cat >> /etc/security/pwquality.conf <<'EOF'; chage -M 365 -m 1 -W 14 alice"
   },
   {
    "t": "Lock out repeated failures with pam_faillock",
    "cmd": "for i in 1 2 3 4 5 6; do echo 'wrong-guess' | pamtester labauth alice authenticate; done; faillock --user alice"
   },
   {
    "t": "Restrict logins by time of day",
    "cmd": "echo 'labauth;*;alice;Wk0800-1900' >> /etc/security/time.conf"
   },
   {
    "t": "De-provision a leaver",
    "cmd": "usermod -L -e 1 -s /usr/sbin/nologin bob; gpasswd -d bob dbops; pkill -KILL -u bob"
   }
  ],
  "test": "90-jit-carol is auto-removed after 2 minutes, roles still work, alice is locked after 5 bad guesses, and bob (the leaver) can no longer authenticate."
 },
 {
  "num": 39,
  "slug": "mfa-totp",
  "domain": 4,
  "obj": "4.6",
  "title": "Multifactor Authentication with TOTP",
  "objective": "Enrol TOTP and enforce two factors through PAM and SSH",
  "desc": "Enrol a user in TOTP, build a password-plus-code PAM service, prove one factor is not enough, test replay protection and backup codes, then enforce MFA for SSH.",
  "build": "A TOTP-enrolled account, a two-factor PAM service, and an SSH Match block demanding keyboard-interactive MFA.",
  "services": "libpam-google-authenticator, oathtool, qrencode, pamtester, openssh-server",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y libpam-google-authenticator oathtool qrencode pamtester openssh-server"
   },
   {
    "t": "Create a user and enrol a TOTP secret",
    "cmd": "sudo -u mfauser google-authenticator -t -d -f -r 10 -R 30 -w 3 -e 5 -q -s /home/mfauser/.google_authenticator"
   },
   {
    "t": "Inspect the shared secret and QR code",
    "cmd": "qrencode -t ANSIUTF8 \"otpauth://totp/C628-Lab:mfauser?secret=$SECRET&issuer=C628-Lab\""
   },
   {
    "t": "Generate codes like an authenticator app",
    "cmd": "oathtool --totp -b \"$SECRET\""
   },
   {
    "t": "Build a two-factor PAM service",
    "cmd": "cat > /etc/pam.d/mfa-lab <<'EOF' (pam_google_authenticator forward_pass + pam_unix use_first_pass)"
   },
   {
    "t": "Prove that one factor is not enough",
    "cmd": "echo 'Labs-Pass-2026' | pamtester mfa-lab mfauser authenticate  # rejected"
   },
   {
    "t": "Log in with both factors, test replay and a backup code",
    "cmd": "echo \"Labs-Pass-2026$(oathtool --totp -b \"$SECRET\")\" | pamtester mfa-lab mfauser authenticate"
   },
   {
    "t": "Enforce MFA for SSH logins",
    "cmd": "printf '\\nMatch User mfauser\\n  AuthenticationMethods keyboard-interactive\\n' >> /etc/ssh/sshd_config; sshd -t"
   }
  ],
  "test": "Password alone is rejected, password plus the current code is accepted, a replayed code is refused, and sshd -T shows keyboard-interactive for mfauser."
 },
 {
  "num": 40,
  "slug": "automation-soar",
  "domain": 4,
  "obj": "4.7",
  "title": "Automation & Orchestration (Mini-SOAR)",
  "objective": "Automate provisioning and an SSH brute-force response playbook",
  "desc": "Automate user provisioning from an HR feed, then build a detect-decide-act-record playbook with guard rails that blocks an attacker, opens a ticket and escalates through a mock API, tested CI-style.",
  "build": "provision.sh, soar.sh, a mock ticketing/paging API, a systemd service running the playbook, and a documented rollback.",
  "services": "jq, shellcheck, iptables, curl, python3, systemd, logger",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y jq shellcheck iptables curl python3"
   },
   {
    "t": "Automate user provisioning from an HR feed",
    "cmd": "provision.sh /etc/soar/hr_feed.csv  # create active staff, add to sg-<dept>, disable leavers"
   },
   {
    "t": "Start a mock ticketing and paging API",
    "cmd": "nohup python3 /usr/local/bin/mock-api.py & ; curl -s -X POST -d '{\"test\":\"ping\"}' http://127.0.0.1:8088/hook"
   },
   {
    "t": "Write the playbook with guard rails",
    "cmd": "cat > /usr/local/bin/soar.sh <<'EOF' (allowlist, THRESHOLD, DRY_RUN guard rails)"
   },
   {
    "t": "Test the playbook the CI way",
    "cmd": "bash -n soar.sh; shellcheck -S warning soar.sh; DRY_RUN=1 soar.sh < /tmp/ci-sample.log"
   },
   {
    "t": "Run the playbook as a service",
    "cmd": "systemctl enable --now soar.service  # journalctl -f -t sshd | soar.sh"
   },
   {
    "t": "Trigger an incident and observe the response",
    "cmd": "for i in $(seq 1 6); do logger -p auth.warning -t sshd 'Failed password ... from 203.0.113.50 ...'; done"
   },
   {
    "t": "Roll back: re-enable access after review",
    "cmd": "iptables -D INPUT -s 203.0.113.50 -j DROP; jq '.status=\"closed\"' \"$T\" > \"$T.tmp\" && mv \"$T.tmp\" \"$T\""
   }
  ],
  "test": "The service is active; a fresh attacker IP is blocked once in iptables, gets one ticket JSON and one escalation in the API log, with no human involved."
 },
 {
  "num": 41,
  "slug": "incident-response-triage",
  "domain": 4,
  "obj": "4.8",
  "title": "Incident Response: Live Triage",
  "objective": "Work an incident through every IR phase in order",
  "desc": "Take a simulated host incident through preparation, detection, analysis, containment, eradication, recovery and lessons learned, collecting hashed volatile evidence before containing.",
  "build": "A case folder of hashed evidence, a contained and eradicated incident, a recovery check and a lessons-learned report.",
  "services": "cron, procps, iproute2, psmisc, lsof, sha256sum, iptables",
  "mins": 30,
  "steps": [
   {
    "t": "Prepare: install tools and open a case",
    "cmd": "mkdir -p /evidence/IR-2026-041; cat > case.txt <<EOF"
   },
   {
    "t": "Simulate the incident (exercise set-up)",
    "cmd": "useradd -m svc-update; echo '* * * * * /tmp/.update.sh' | crontab -u svc-update -; python3 -m http.server 4444 --bind 127.0.0.1"
   },
   {
    "t": "Detect: confirm the alert and list the IoCs",
    "cmd": "ss -tlnp | grep 4444; awk -F: '$3>=1000 {print $1,$3}' /etc/passwd; crontab -u svc-update -l"
   },
   {
    "t": "Analyse: collect volatile evidence in order, then hash",
    "cmd": "ps auxwwf > 01-processes.txt; ss -tunap > 02-sockets.txt; sha256sum 0* > evidence.sha256"
   },
   {
    "t": "Contain: stop the spread without destroying evidence",
    "cmd": "usermod -L -e 1 svc-update; iptables -I INPUT -p tcp --dport 4444 -j DROP; pkill -u svc-update"
   },
   {
    "t": "Eradicate: remove the cause and persistence",
    "cmd": "crontab -u svc-update -r; rm -f /tmp/.update.sh; userdel -r svc-update"
   },
   {
    "t": "Recover: validate the host is clean",
    "cmd": "ss -tlnp | grep -q 4444 || echo clean; sha256sum -c evidence.sha256"
   },
   {
    "t": "Lessons learned: root cause analysis and report",
    "cmd": "cat > report.md <<EOF (five whys + actions); sha256sum report.md | tee -a evidence.sha256"
   }
  ],
  "test": "The case folder holds numbered evidence, report.md and evidence.sha256; every hash verifies OK; no listener, rogue account or cron persistence remains."
 },
 {
  "num": 42,
  "slug": "digital-forensics-acquisition",
  "domain": 4,
  "obj": "4.8",
  "title": "Digital Forensics: Acquisition & Chain of Custody",
  "objective": "Acquire a forensic image with verifiable integrity",
  "desc": "Issue a legal hold, capture volatile data in order of volatility, write-protect a loop-device suspect disk, acquire dd and dcfldd images, verify hashes before and after, examine a read-only copy and preserve the master.",
  "build": "A legal hold, a custody log, write-blocked images with matching SHA-256 hashes, recovered files and a report.",
  "services": "dcfldd, dd, sleuthkit, foremost, losetup, blockdev, sha256sum",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y dcfldd sleuthkit foremost e2fsprogs"
   },
   {
    "t": "Open the case: legal hold and custody form",
    "cmd": "cat > reports/legal-hold-notice.txt <<EOF; printf 'utc_time,item_id,action,handler,location,sha256\\n' > reports/chain-of-custody.csv"
   },
   {
    "t": "Capture volatile data first",
    "cmd": "ps auxww > v02-processes.txt; ss -tunap > v03-network.txt; sha256sum v0* | tee volatile.sha256"
   },
   {
    "t": "Create the suspect disk and write-protect it",
    "cmd": "LOOP=$(losetup -f --show /cases/CASE-042/FIN-LT-0457.raw); blockdev --setro \"$LOOP\""
   },
   {
    "t": "Hash the source before acquisition",
    "cmd": "sha256sum \"$LOOP\" | awk '{print $1}' | tee reports/source-before.sha256"
   },
   {
    "t": "Acquire images with dd and dcfldd",
    "cmd": "dd if=\"$LOOP\" of=images/FIN-LT-0457.dd bs=1M conv=noerror,sync; dcfldd if=\"$LOOP\" of=images/..img hash=sha256 hashlog=..."
   },
   {
    "t": "Verify the images and record custody",
    "cmd": "diff reports/source-before.sha256 reports/source-after.sha256 && echo UNCHANGED"
   },
   {
    "t": "Examine a read-only copy and recover artefacts",
    "cmd": "mount -o ro,noload,loop work/working-copy.dd /mnt/case042; fls -r -d work/working-copy.dd; foremost -c work/foremost.conf -i work/working-copy.dd -o work/carved"
   },
   {
    "t": "Preserve the evidence and write the report",
    "cmd": "chmod 0444 images/*; chattr +i images/FIN-LT-0457.dd; losetup -d \"$LOOP\"; cat > reports/forensic-report.txt <<EOF"
   }
  ],
  "test": "Both image hashes equal the source hash before and after, sha256sum -c reports OK, the deleted file content is recovered and the custody log has an entry per handling step."
 },
 {
  "num": 43,
  "slug": "packet-capture-analysis",
  "domain": 4,
  "obj": "4.9",
  "title": "Packet Capture & Traffic Analysis",
  "objective": "Capture, filter and follow traffic to find cleartext creds",
  "desc": "Capture generated HTTP and DNS traffic with tcpdump, apply capture and display filters, follow a TCP stream, recover cleartext basic-auth credentials, and build a NetFlow-style flow summary.",
  "build": "A saved PCAP, a list of exposed credentials, a reconstructed HTTP conversation and a per-flow summary.",
  "services": "tcpdump, tshark, dnsutils, curl, python3",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get install -y tcpdump tshark dnsutils curl python3"
   },
   {
    "t": "Start a local web service and a capture",
    "cmd": "python3 -m http.server 8080 --bind 127.0.0.1; tcpdump -i any -U -s 0 -w /root/pcap/lab43.pcap 'tcp port 8080 or port 53' &"
   },
   {
    "t": "Generate HTTP, DNS and beaconing traffic",
    "cmd": "curl -s -u alice:Summer2026 http://127.0.0.1:8080/; dig +short example.com"
   },
   {
    "t": "Stop the capture and summarise it",
    "cmd": "pkill -INT tcpdump; capinfos /root/pcap/lab43.pcap; tshark -r ... -q -z io,phs"
   },
   {
    "t": "Apply display filters",
    "cmd": "tshark -r lab43.pcap -Y 'http.request' -T fields -e http.request.method -e http.request.uri"
   },
   {
    "t": "Follow a TCP stream",
    "cmd": "tshark -r lab43.pcap -q -z follow,tcp,ascii,0"
   },
   {
    "t": "Spot cleartext credentials",
    "cmd": "tshark -r lab43.pcap -Y 'http.authorization' -T fields -e http.authbasic  # alice:Summer2026"
   },
   {
    "t": "Build a NetFlow-style summary",
    "cmd": "tshark -r lab43.pcap -T fields -e ip.src -e ip.dst -e tcp.dstport -e frame.len | awk '...'"
   },
   {
    "t": "Hunt for beaconing and DNS tunnelling",
    "cmd": "tshark -r lab43.pcap -Y 'http.request.uri contains \"id=host42\"' -e frame.time_relative | awk '...interval...'"
   }
  ],
  "test": "The PCAP is saved, tshark lists at least 7 HTTP requests and the DNS queries, and alice:Summer2026 is recovered from the capture."
 },
 {
  "num": 44,
  "slug": "log-investigation",
  "domain": 4,
  "obj": "4.9",
  "title": "Log Investigation: Building a Timeline",
  "objective": "Investigate auth and web logs and build an attack timeline",
  "desc": "Generate synthetic auth.log and nginx access-log data, find the brute-force source, the compromised account, the sudo privilege escalation and the web attacks, then merge both logs into one chronological timeline.",
  "build": "Synthetic auth.log and access.log, grep/awk findings, and a merged, time-ordered incident timeline.",
  "services": "grep, awk, sed, sort, uniq, journalctl, logger",
  "mins": 30,
  "steps": [
   {
    "t": "Install the tools and prepare a work area",
    "cmd": "apt-get install -y gawk coreutils; mkdir -p /root/investigation"
   },
   {
    "t": "Generate a synthetic auth.log",
    "cmd": "cat > /root/investigation/auth.log <<'EOF' (brute force + Accepted + sudo)"
   },
   {
    "t": "Generate a synthetic nginx access log",
    "cmd": "cat > /root/investigation/access.log <<'EOF' (traversal, SQLi, XSS, web shell)"
   },
   {
    "t": "Find the brute-force source and count failures",
    "cmd": "grep 'Failed password' auth.log | grep -oE 'from [0-9.]+' | awk '{print $2}' | sort | uniq -c | sort -rn"
   },
   {
    "t": "Find the successful login and link it",
    "cmd": "grep -E 'Accepted .* from 203.0.113.66' auth.log"
   },
   {
    "t": "Find the privilege escalation",
    "cmd": "grep 'sudo:' auth.log | sed -E 's/.*sudo:  *([a-z]+) .*USER=([a-z]+) ; COMMAND=(.*)/\\1 -> \\2 : \\3/'"
   },
   {
    "t": "Investigate the web attacks",
    "cmd": "grep -En '\\.\\./|UNION SELECT|<script>|shell\\.php' access.log"
   },
   {
    "t": "Use journalctl on a live system",
    "cmd": "journalctl -t sshd --since '-5 min' -o short-iso --no-pager | grep 'Accepted\\|Failed'"
   },
   {
    "t": "Build the merged timeline",
    "cmd": "{ grep -E 'Failed|Accepted|sudo:' auth.log | awk ...; awk -F'[][]' ... access.log; } | sort > timeline.txt"
   }
  ],
  "test": "The top attacker is 203.0.113.66 with 8 failures, the webadmin compromise and the 'support' account creation are both found, and timeline.txt holds all merged events in time order."
 },
 {
  "num": 45,
  "slug": "governance-policies",
  "domain": 5,
  "obj": "5.1",
  "title": "Governance: Policies, Standards, Procedures",
  "objective": "Write and enforce governance documents on Linux",
  "desc": "Author a policy, a standard and a procedure as files, enforce them with a login banner, pwquality and sudoers, and map data roles with a RACI chart.",
  "build": "A governance pack: policy, standard, procedure and RACI, enforced on the host",
  "services": "bash, libpam-pwquality, visudo, /etc/issue",
  "mins": 25,
  "steps": [
   {
    "t": "Install the tools",
    "cmd": "apt-get update -qq && apt-get install -y libpam-pwquality"
   },
   {
    "t": "Write the acceptable use policy",
    "cmd": "cat > governance/aup.md <<'EOF' ... EOF"
   },
   {
    "t": "Write the password standard",
    "cmd": "cat > governance/password-standard.md <<'EOF' ... EOF"
   },
   {
    "t": "Enforce the standard with pwquality",
    "cmd": "sed -i 's/^# minlen.*/minlen = 12/' /etc/security/pwquality.conf"
   },
   {
    "t": "Add a directive login banner",
    "cmd": "printf '%s\\n' 'Authorised use only. Activity is monitored.' > /etc/issue.net"
   },
   {
    "t": "Write the onboarding procedure",
    "cmd": "cat > governance/onboarding.md <<'EOF' ... EOF"
   },
   {
    "t": "Apply a least-privilege sudoers rule",
    "cmd": "visudo -cf /etc/sudoers.d/helpdesk"
   },
   {
    "t": "Build the RACI data-roles chart",
    "cmd": "column -t -s, governance/raci.csv"
   }
  ],
  "test": "pwquality rejects a weak password, the banner shows in /etc/issue.net, and raci.csv names owner, controller, processor and custodian."
 },
 {
  "num": 46,
  "slug": "risk-register-cvss",
  "domain": 5,
  "obj": "5.2",
  "title": "Risk Register, CVSS Scoring, and Quantitative Risk",
  "objective": "Build a risk register and score it with CVSS and ALE",
  "desc": "Build a CSV risk register, score a finding with CVSS v3.1, and compute SLE and ALE to justify control spend to the business.",
  "build": "A CSV risk register with CVSS scores, KRIs and a board report",
  "services": "python3, FIRST.org CVSS calculator, column",
  "mins": 25,
  "steps": [
   {
    "t": "Create and view the CSV risk register",
    "cmd": "column -t -s, risk-register.csv"
   },
   {
    "t": "Score R-001 on the FIRST.org CVSS v3.1 calculator",
    "cmd": "https://www.first.org/cvss/calculator/3.1"
   },
   {
    "t": "Compute SLE and ALE in Python",
    "cmd": "python3 -c \"print(200000*0.6*0.5)\""
   },
   {
    "t": "Choose a risk treatment (mitigate vs accept)",
    "cmd": ""
   },
   {
    "t": "Add Key Risk Indicators to a CSV",
    "cmd": "column -t -s, kri.csv"
   },
   {
    "t": "Generate the one-page board risk report",
    "cmd": "cat board-report.md"
   }
  ],
  "test": "The Python output shows ALE 60,000 per year and board-report.md lists the open risks with their treatments."
 },
 {
  "num": 47,
  "slug": "supply-chain-sbom",
  "domain": 5,
  "obj": "5.3",
  "title": "Supply Chain Security: SBOM and Vendor Trust",
  "objective": "Generate an SBOM and verify a vendor download",
  "desc": "Generate a software bill of materials with Syft, verify a vendor download by checksum and GPG signature, and record right-to-audit and questionnaire notes.",
  "build": "An SBOM plus a verified vendor download and a vendor-trust checklist",
  "services": "syft, sha256sum, gpg, curl",
  "mins": 25,
  "steps": [
   {
    "t": "Install Syft",
    "cmd": "curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin"
   },
   {
    "t": "Generate an SBOM of the filesystem",
    "cmd": "syft dir:/usr/bin -o spdx-json=sbom.spdx.json"
   },
   {
    "t": "Read the SBOM component list",
    "cmd": "syft dir:/usr/bin -o table | head"
   },
   {
    "t": "Download a vendor release and its checksum",
    "cmd": "curl -LO https://.../tool.tar.gz && curl -LO https://.../checksums.txt"
   },
   {
    "t": "Verify the SHA-256 checksum",
    "cmd": "sha256sum -c checksums.txt 2>/dev/null | grep OK"
   },
   {
    "t": "Verify the GPG signature",
    "cmd": "gpg --verify tool.tar.gz.asc tool.tar.gz"
   },
   {
    "t": "Write the vendor-trust checklist",
    "cmd": "cat vendor-trust.md"
   }
  ],
  "test": "sbom.spdx.json lists components with versions, the checksum verifies OK, and vendor-trust.md records right-to-audit and questionnaire items."
 },
 {
  "num": 48,
  "slug": "compliance-openscap",
  "domain": 5,
  "obj": "5.4",
  "title": "Compliance Audit with OpenSCAP",
  "objective": "Scan a host against a CIS profile and remediate",
  "desc": "Audit an Ubuntu host against a CIS profile with OpenSCAP, produce the HTML report as compliance evidence, and remediate one failed control.",
  "build": "An OpenSCAP CIS scan, HTML report and a remediated control",
  "services": "openscap-scanner/libopenscap8, ssg-base, ssg-debderived",
  "mins": 25,
  "steps": [
   {
    "t": "Install the SCAP Security Guide content and OpenSCAP scanner",
    "cmd": "apt-get install -y openscap-scanner || apt-get install -y libopenscap8"
   },
   {
    "t": "Select the Ubuntu SCAP datastream",
    "cmd": "DS=$(ls /usr/share/xml/scap/ssg/content/ssg-ubuntu*-ds.xml | head -1)"
   },
   {
    "t": "List available compliance profiles",
    "cmd": "oscap info $DS | grep -A1 Profile | head -20"
   },
   {
    "t": "Run the CIS Level 1 audit",
    "cmd": "oscap xccdf eval --profile ...cis_level1_server --report report.html $DS"
   },
   {
    "t": "Generate the auto-remediation script",
    "cmd": "oscap xccdf generate fix --profile ...cis_level1_server --output remediate.sh $DS"
   },
   {
    "t": "Apply one fix and re-check the rule",
    "cmd": "oscap xccdf eval --rule ...package_telnet_removed $DS"
   }
  ],
  "test": "report.html shows pass/fail per control and the score rises after the single remediation is applied."
 },
 {
  "num": 49,
  "slug": "osint-recon",
  "domain": 5,
  "obj": "5.5",
  "title": "Passive Reconnaissance / OSINT",
  "objective": "Collect a domain footprint using only passive tools",
  "desc": "Gather a domain's public footprint with passive OSINT tools that never send a packet to the target, the reconnaissance phase of an authorised assessment.",
  "build": "A passive recon report for an authorised domain",
  "services": "whois, dnsutils, theHarvester, subfinder, jq",
  "mins": 25,
  "steps": [
   {
    "t": "Install the passive OSINT tools",
    "cmd": "apt-get install -y whois dnsutils python3-pip jq unzip curl"
   },
   {
    "t": "Set an authorised target domain",
    "cmd": "TARGET=example.com"
   },
   {
    "t": "Query WHOIS registrant and dates",
    "cmd": "whois $TARGET | grep -Ei 'registrar|registrant|expiry|name server' | head"
   },
   {
    "t": "Enumerate DNS records (MX, TXT, NS)",
    "cmd": "dig +short MX $TARGET"
   },
   {
    "t": "Discover subdomains passively with subfinder",
    "cmd": "subfinder -silent -d $TARGET | tee subs.txt"
   },
   {
    "t": "Harvest emails and hosts",
    "cmd": "theHarvester -d $TARGET -b crtsh,duckduckgo,bing 2>/dev/null | tail -30"
   },
   {
    "t": "Pull certificate transparency records",
    "cmd": "curl -s \"https://crt.sh/?q=%25.$TARGET&output=json\" | jq -r '.[].name_value' | sort -u | head"
   },
   {
    "t": "Build the recon report",
    "cmd": "cat recon-$TARGET.md"
   }
  ],
  "test": "recon-example.com.md lists the subdomain count plus the domain's DMARC and SPF records, with no traffic sent to the target."
 },
 {
  "num": 50,
  "slug": "active-recon-nmap",
  "domain": 5,
  "obj": "5.5",
  "title": "Active Reconnaissance with Nmap",
  "objective": "Fingerprint a local host with Nmap scans and NSE",
  "desc": "Fingerprint a local host with Nmap host discovery, version and OS detection and NSE scripts, scanning only loopback inside the playground.",
  "build": "An Nmap scan of local nginx and SSH targets, saved in three formats",
  "services": "nmap, nginx, openssh-server",
  "mins": 25,
  "steps": [
   {
    "t": "Install nmap and start nginx + ssh targets",
    "cmd": "apt-get install -y nmap nginx openssh-server"
   },
   {
    "t": "Discover live hosts with a ping scan",
    "cmd": "nmap -sn 127.0.0.0/30"
   },
   {
    "t": "Run a TCP SYN half-open scan",
    "cmd": "nmap -sS -p 1-1024 127.0.0.1"
   },
   {
    "t": "Detect service versions",
    "cmd": "nmap -sV -p 22,80 127.0.0.1"
   },
   {
    "t": "Fingerprint the OS",
    "cmd": "nmap -O 127.0.0.1"
   },
   {
    "t": "Run NSE discovery scripts",
    "cmd": "nmap --script=banner,http-headers,ssh2-enum-algos -p 22,80 127.0.0.1"
   },
   {
    "t": "Review timing templates for stealth vs speed",
    "cmd": "time nmap -T4 -p- 127.0.0.1 | tail"
   },
   {
    "t": "Save results in three report formats",
    "cmd": "nmap -sV -oA scan-127 127.0.0.1"
   }
  ],
  "test": "nmap -sV reports nginx on port 80 and OpenSSH on port 22, and scan-127.xml is written for reporting."
 },
 {
  "num": 51,
  "slug": "pentest-metasploit",
  "domain": 5,
  "obj": "5.5",
  "title": "Penetration Testing in an Authorised Lab",
  "objective": "Exploit a lab target and write the engagement report",
  "desc": "Validate a deliberately vulnerable service inside a local container with Metasploit, capture proof of access, clean up, then write the engagement report.",
  "build": "A Metasploit validation of a lab container and a pentest report",
  "services": "metasploit-framework, docker.io, nmap",
  "mins": 30,
  "steps": [
   {
    "t": "Install Metasploit via the Rapid7 installer",
    "cmd": "curl -sSL https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/.../msfupdate.erb > /tmp/msfinstall"
   },
   {
    "t": "Stand up the authorised vulnerable target in Docker",
    "cmd": "docker run -d --name vuln -p 2121:21 --rm tleemcjr/metasploitable2 ..."
   },
   {
    "t": "Recon the target service banner",
    "cmd": "nmap -sV -p 2121 127.0.0.1"
   },
   {
    "t": "Search Metasploit for matching modules",
    "cmd": "msfconsole -q -x 'search vsftpd; exit'"
   },
   {
    "t": "Validate the finding against the lab target",
    "cmd": "msfconsole -q -x 'use exploit/unix/ftp/vsftpd_234_backdoor; set RHOSTS 127.0.0.1; set RPORT 2121; run; exit'"
   },
   {
    "t": "Capture proof of access",
    "cmd": "sessions -i 1 -c 'id; uname -a; hostname'"
   },
   {
    "t": "Clean up the target container",
    "cmd": "docker rm -f vuln"
   },
   {
    "t": "Write the engagement report",
    "cmd": "cat pentest-report.md"
   }
  ],
  "test": "A session opens against the lab container, id returns the target account as proof, the container is removed and pentest-report.md is written."
 },
 {
  "num": 52,
  "slug": "phishing-awareness-gophish",
  "domain": 5,
  "obj": "5.6",
  "title": "Security Awareness: Phishing Simulation",
  "objective": "Run a phishing simulation end-to-end with metrics",
  "desc": "Run a controlled phishing simulation with GoPhish against an internal MailHog sink, track open and click metrics, and map results to training actions.",
  "build": "A GoPhish campaign with a MailHog SMTP sink and awareness metrics",
  "services": "gophish, docker.io, mailhog, curl, unzip",
  "mins": 25,
  "steps": [
   {
    "t": "Download and unzip the GoPhish binary",
    "cmd": "curl -LO https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip"
   },
   {
    "t": "Bind the admin UI for the playground",
    "cmd": "sed -i 's/127.0.0.1:3333/0.0.0.0:3333/' config.json"
   },
   {
    "t": "Start GoPhish and note the admin password",
    "cmd": "./gophish 2>&1 | grep -Ei 'admin|password' | head -3"
   },
   {
    "t": "Spin up the MailHog SMTP sink",
    "cmd": "docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog"
   },
   {
    "t": "Configure the four GoPhish primitives",
    "cmd": ""
   },
   {
    "t": "Launch the campaign and watch the dashboard",
    "cmd": ""
   },
   {
    "t": "Map click and report rates to training actions",
    "cmd": ""
   }
  ],
  "test": "The campaign dashboard tracks sent, opened and clicked, test emails land in MailHog, and results map to training actions rather than blame."
 }
];
