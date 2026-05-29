# 🐝 Pollination Manager — Hortgro Standards & Guidelines Hub

A modern, interactive, and responsive B2B web application designed to help South African deciduous fruit growers optimize crop yields by adhering to **Hortgro Science Pollination Standards & guidelines** and the **Western Cape Bee Association (WCBA)** charter. 

🌐 **Live Deployment:** [https://pollination-landing-page.vercel.app](https://pollination-landing-page.vercel.app)

---

## 📋 Table of Contents
- [Features](#-features)
- [Interactive Tools](#-interactive-tools)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Hortgro Compliance Specifications](#-hortgro-compliance-specifications)
- [License](#-license)

---

## ✨ Features

- **Pillars of Pollination:** In-depth compliance guides detailing hive strength quality audits, spatial arrangement recommendations, and chemical spray safety contracts.
- **Crop Specializations:** Specific recommendations and stocking densities for Apples (Standard & High Density), Pears & Stone Fruits, Specialized Seed Crops, and Berries.
- **Strategic Bio-Deployment Timeline:** Step-by-step guidance on Orchard Site Auditing, Bio-Asset Prep, Night-time Placement, and Post-Bloom Retrieval.
- **Regional Pollination Calendar:** Interactive calendar detailing crop bloom windows across key Western Cape deciduous fruit regions (Elgin/Grabouw, Ceres, Stellenbosch/Paarl, etc.) with category filtering.
- **Grower Booking/Inquiry Form:** Seamless lead-generation form enabling growers to inquire about beekeeping services for specific crop requirements.

---

## 🛠️ Interactive Tools

The hub is equipped with a custom client-side Interactive Toolkit:

1. **Hortgro Hive Calculator:** 
   - Dynamically calculates the recommended number of hives, minimum bee frames, minimum brood frames, and suggested hive group sites based on crop type and farm area (hectares).
   - Estimates costs based on the official WCBA suggested tariffs.
2. **Bee Foraging Flight Simulator:** 
   - Uses environmental parameters (Orchard Temperature, Wind Speed, Sky Conditions) to calculate flight viability and explain how weather impacts pollination efficiency.
3. **Orchard Compliance Audit:** 
   - Interactive checklist assessing hive strength, arrangement strategy, and spray safety protocols, generating a real-time compliance score and actionable audit advice.
4. **Grower-Beekeeper Contract Builder:** 
   - Generates a print-ready legal draft of the Pollination Service Agreement reflecting Hortgro and WCBA guidelines, with dynamic text injection for farm names, hives, rates, and target dates.

---

## 💻 Tech Stack

The application is built using a lightweight, performant, and dependency-free stack:
- **HTML5:** Semantic structure.
- **CSS3:** Custom responsive layout, styled with modern CSS variables, smooth animations, glassmorphism UI elements, and a clean dark/amber theme.
- **JavaScript (ES6):** Client-side logic for the interactive calculator, weather simulator, audit checklist, calendar filtering, contract generator, and inquiry form modals.
- **Vercel CLI:** Used for continuous zero-configuration deployment.

---

## 📁 Directory Structure

```text
Pollination landing page/
├── index.html       # Main Hub HTML structure & templates
├── style.css        # Theme, layout variables, and components CSS
├── app.js           # Interactive tools, simulator, and form JS logic
├── README.md        # Documentation
└── images/          # Assets and responsive illustrations
    ├── logo.png
    ├── boundary_map.png
    ├── hive_clusters.png
    ├── deciduous_orchard.png
    ├── plum_pollination.jpg
    ├── seed_pollination.png
    └── berry_pollination.png
```

---

## 🚀 Getting Started

Since the project is a client-side static site, no local compilation or package installations are required to run it:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jacquesrbarben-ai/Pollination-landing-page.git
   ```
2. **Open the project:**
   Simply double-click `index.html` in your file explorer, or serve it locally using a simple HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```
3. Open `http://localhost:8000` (or the corresponding port) in your web browser.

---

## 🌐 Deployment

This project is configured for direct deployment on **Vercel**:

To deploy changes to the live site:
1. Install the Vercel CLI locally (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. Run deployment command in the root folder:
   ```bash
   vercel --prod
   ```

---

## 🐝 Hortgro Compliance Specifications

For reference, the app integrates the following core charter requirements:
* **Hive Strength:** Hives must have at least 8 frames covered in bees and 4 frames of active brood.
* **Hive Placements:** Must be placed in circular groupings of 4–10 hives, spaced no further than 400 meters apart.
* **Chemical Guidelines:** Strictly zero insecticide application during bloom. Rest-breakers must be completed 2 weeks prior. Notification to beekeepers must be given at least 48 hours before spraying within a 3km radius.
