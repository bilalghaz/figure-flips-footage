# Figure Flips Footage — Pedar-X Data Viewer for macOS

A modern, native-feeling macOS app for analyzing **Pedar-X plantar-pressure data** with speed and clarity.  
Built for gait labs, biomechanics researchers, and clinics that want publish-ready insights **without wrestling with spreadsheets**.

<p align="center">
  <img src="docs/hero.png" alt="Figure Flips Footage – Heatmap & COP timeline" width="820">
</p>

---

## Table of Contents
- [Highlights](#highlights)
- [What You Can Do](#what-you-can-do)
- [Supported Data](#supported-data)
- [Getting Started](#getting-started)
- [Typical Workflow](#typical-workflow)
- [Metrics Explained](#metrics-explained)
- [Regions](#regions)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)
- [Build & Development](#build--development)
- [Deployment (Lovable)](#deployment-lovable)
- [Roadmap](#roadmap)
- [Privacy](#privacy)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Highlights

- **Instant visualization** — Load a Pedar-X export and see synchronized left/right heatmaps with an animated timeline.
- **COP tracking** — Center-of-pressure path per frame and per step, with ML/AP excursions and path length.
- **Step detection** — Automatic stance segmentation using force/pressure thresholds (tunable, with smoothing).
- **Region analysis** — Presets (hind/mid/fore; medial/lateral) + **custom masks**; per-region peak/mean, area, load.
- **Clean exports** — One-click CSV/XLSX per step & per region; optional frame-level time series.
- **Local & fast** — All processing happens on your Mac. No cloud, no uploads.

---

## What You Can Do

- Compare **left vs right**, **trial vs trial**.
- Normalize pressures by **body weight** (BW).
- Apply **low-pass filtering** to stabilize noisy signals.
- Batch process multiple files for cohorts and reports.

---

## Supported Data

- **Pedar-X export formats:** `.ASC` and `.XLSX` (standard Pedar-X).  
- Optional **step events / markers** can be imported to override auto detection.

> **Tip:** If you’re unsure which export to use, pick the one that includes **per-sensor pressures** and **timestamps**.

---

## Getting Started

### Quick Start (App User)
1. **Open a file** – Drag a Pedar-X export into the window or use **File → Open… (⌘O)**.  
2. **Set trial info** – Enter **body weight** for normalization and optional notes (e.g., *Treadmill 4 km/h*).  
3. **Review heatmaps** – Scrub the timeline or press **Space** to play/pause. COP paths render on top.  
4. **Detect steps** – **Analyze → Detect Steps**; adjust thresholds if needed and re-run.  
5. **Regions & metrics** – **Regions → Presets** or define **Custom** masks. Watch metrics update live.  
6. **Export** – **File → Export Results…** (CSV/XLSX). Optionally include frame-level series.

<p align="center">
  <img src="docs/timeline.gif" alt="Timeline scrub + COP" width="820">
</p>

---

## Metrics Explained

- **Peak pressure (kPa)** — Highest pressure in a region during stance.
- **Mean pressure (kPa)** — Average pressure in that region over stance duration.
- **Contact area (cm²)** — Area above the contact threshold.
- **Load (%BW)** — Pressure integrated over area/time, normalized by body weight.
- **COP path length (cm)** — Total COP travel during stance (stability/progression proxy).
- **ML/AP COP excursion (cm)** — Medial–lateral and anterior–posterior ranges of COP.

---

## Regions

**Presets**
- Forefoot / Midfoot / Hindfoot  
- Medial / Lateral split

**Custom masks**
- Draw regions on the sensor map.
- Save & reuse across trials.
- Export/import masks as JSON to keep studies consistent.

<p align="center">
  <img src="docs/regions.png" alt="Region presets and custom masks" width="820">
</p>

---

## Keyboard Shortcuts

- **Space** — Play/Pause  
- **← / →** — Previous/Next frame  
- **⌘O** — Open file  
- **⌘E** — Export results  
- **R** — Toggle region overlay  
- **C** — Toggle COP path

*(If you changed shortcuts in code, mirror them here.)*

---

## Troubleshooting

**File won’t open**  
Ensure it’s a Pedar-X export (`.ASC` or `.XLSX`). Large files may take a moment to parse.

**No steps detected**  
Lower the detection threshold or increase sensitivity under **Analyze → Step Detection Settings**.

**Metrics look too high/low**  
Confirm **body weight** and verify **normalization** is enabled.

**Region metrics missing**  
Enable at least one region (preset or custom) before exporting.

---

## Tech Stack

- **Vite** — lightning-fast dev server & bundler  
- **TypeScript** — robust typing for safer code  
- **React** — modular UI architecture  
- **shadcn/ui** — modern, accessible UI components  
- **Tailwind CSS** — utility-first styling for speed & consistency

> Built for maintainability and extension: add new visualizations, metrics, or exports with minimal friction.

---

## Build & Development

You’ll need **Node.js** and **npm**. If you don’t have Node installed, we recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
# 1) Clone the repository
git clone https://github.com/bilalghaz/figure-flips-footage.git
cd figure-flips-footage

# 2) Install dependencies
npm i

# 3) Start the development server (hot reload)
npm run dev

# 4) Build for production
npm run build
