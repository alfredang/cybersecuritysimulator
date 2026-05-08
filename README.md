<div align="center">

# Cybersecurity Threat Simulation Lab

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A safe, modern, single-page web app for learning how 10 common cybersecurity threats work — and how to defend against them.**

[Live Demo](https://alfredang.github.io/cybersecuritysimulator/) · [Report Bug](https://github.com/alfredang/cybersecuritysimulator/issues) · [Request Feature](https://github.com/alfredang/cybersecuritysimulator/issues)

</div>

## Screenshot

![Screenshot](screenshot.png)

## About

The **Cybersecurity Threat Simulation Lab** is a purely educational, browser-based playground that helps learners visualize and understand 10 of the most common cybersecurity threats — without using any real malware, exploit code, or live attack tooling.

Every "attack" is a controlled visualization built from fictional data. There is no backend, no database, no network calls, and no executable payloads. All explanations focus on conceptual understanding, warning signs, and prevention.

### Key Features

| Module | What it teaches |
|---|---|
| **Phishing Simulator** | Identify red flags in 18 fictional emails across 6 categories (banking, tech, work, delivery, social, lottery) |
| **Annotated Walkthrough** | Step-by-step guided tour of a fake phishing email — clue by clue |
| **URL Inspector** | Paste any URL and get a 0–100 risk score with detailed checks (HTTP, punycode, lookalike brands, shorteners, etc.) |
| **XSS Simulator** | Compare unsafe vs escaped output side by side (no script execution) |
| **SQL Injection Simulator** | Mock login form using in-memory data — never queries a real DB |
| **Password Strength Lab** | Entropy-based scoring with crack-time estimates and improvement tips |
| **Malware Demo** | Animated terminal showing a fictional scan-and-quarantine sequence |
| **Virus Visualizer** | CSS grid showing conceptual infection spread |
| **Ransomware Demo** | Fake locked-screen overlay with countdown — clearly labeled simulation |
| **Social Engineering Trainer** | 12 scenarios across 8 tactics (pretexting, baiting, vishing, smishing, BEC, etc.) with running score |
| **Weak Passwords** | Side-by-side weak vs strong examples with crack-time estimates |
| **Data Leakage Estimator** | Toggle good practices and see your leak risk score change |
| **Final Quiz + Certificate** | 10-question assessment with downloadable certificate-style result |

### Safety Promise

- No real malware, viruses, or exploit code
- No live phishing pages or credential harvesting
- No backend, no database, no external network calls
- Pure HTML / CSS / vanilla JavaScript
- All scenarios use fictional names and data
- Local-first — runs entirely in the browser

## Tech Stack

| Category | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) — no framework |
| Logic | Vanilla JavaScript (ES6+) — no libraries |
| Persistence | Browser `localStorage` |
| Hosting | GitHub Pages (static) |

Total dependencies: **zero**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                           │
│                                                         │
│   ┌──────────────┐   ┌──────────────────────────────┐   │
│   │   Sidebar    │   │     Main Content Area        │   │
│   │  Navigation  │──▶│                              │   │
│   │  (12 items)  │   │  Dashboard / Threat Modules  │   │
│   └──────────────┘   └──────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │             script.js (Vanilla JS)              │   │
│   │  ┌────────────┐  ┌───────────┐  ┌────────────┐  │   │
│   │  │  Phishing  │  │   XSS /   │  │   Social   │  │   │
│   │  │  + URL     │  │   SQLi    │  │ Engineering│  │   │
│   │  │  Inspector │  │ Simulator │  │  Trainer   │  │   │
│   │  └────────────┘  └───────────┘  └────────────┘  │   │
│   │  ┌────────────┐  ┌───────────┐  ┌────────────┐  │   │
│   │  │  Password  │  │  Malware  │  │ Final Quiz │  │   │
│   │  │    Lab     │  │  / Virus  │  │ + Certif.  │  │   │
│   │  │            │  │   / Ran.  │  │            │  │   │
│   │  └────────────┘  └───────────┘  └────────────┘  │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│              ┌────────────────────────┐                 │
│              │   localStorage         │                 │
│              │  (theme, progress,     │                 │
│              │   quiz score)          │                 │
│              └────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
cybersecuritysimulator/
├── index.html         # Single-page app shell with all sections
├── style.css          # Theming, layout, components, responsive rules
├── script.js          # All interactive logic (modules, quiz, state)
├── screenshot.png     # README preview image
└── README.md          # You are here
```

## Getting Started

### Prerequisites

Any modern web browser. That's it.

### Run Locally

Clone the repo:

```bash
git clone https://github.com/alfredang/cybersecuritysimulator.git
cd cybersecuritysimulator
```

Open directly in a browser:

```bash
open index.html      # macOS
xdg-open index.html  # Linux
start index.html     # Windows
```

Or run a local static server (recommended for consistent paths):

```bash
# Python 3
python3 -m http.server 8000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

### GitHub Pages (this repo)

This repository deploys automatically to GitHub Pages on every push to `main` via the workflow at `.github/workflows/deploy.yml`.

Live URL: **https://alfredang.github.io/cybersecuritysimulator/**

### Any Static Host

Because the app is pure HTML/CSS/JS, you can drop the three files on any static host:

- **Netlify** — drag the folder into the Netlify dashboard
- **Vercel** — `vercel deploy` from the project root
- **Cloudflare Pages** — connect the repo
- **AWS S3 + CloudFront** — upload the three files
- Any plain web server (nginx, Apache, Caddy)

## Contributing

Contributions are welcome — whether that's new threat modules, more phishing examples, accessibility improvements, or translations.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-idea`
3. Commit your changes: `git commit -m "Add your idea"`
4. Push the branch: `git push origin feature/your-idea`
5. Open a Pull Request

For larger changes, please open an issue first to discuss the direction.

## Educational Use

This lab is well-suited for:

- Cybersecurity awareness training (corporate or academic)
- Bootcamp / academy intro modules
- Self-paced learning for non-technical users
- Demonstrations and workshops

## Developed By

**[Tertiary Infotech Academy Pte Ltd](https://www.tertiarycourses.com.sg)**
Singapore-based provider of professional IT and cybersecurity training.

## Acknowledgements

- Threat definitions inspired by **OWASP** and **NIST** public guidance
- UI patterns informed by modern dashboard design conventions
- Built with the assistance of **Claude Code**

---

<div align="center">

If this project helped you learn something new, please star the repo.

</div>
