# 🛡️ RoadGuard Maharashtra — Safer Roads, Stronger Maharashtra

> **Smart India Hackathon (SIH) Project**  
> An institutional, citizen-driven civic infrastructure reporting platform bridging Maharashtra citizens and the Public Works Department (PWD) for rapid pothole detection, geotagged evidence verification, and transparent repair tracking across all 36 districts.

---

## 📌 Executive Overview

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **RoadGuard Maharashtra** |
| **Domain** | Civic Tech, Smart Governance, Road Infrastructure & GIS Telemetry |
| **Stakeholders** | Citizens of Maharashtra, Municipal Corporations, Maharashtra PWD Engineers & Field Crews |
| **Core Value** | Report potholes in under 60 seconds with live camera proof & GPS geotagging; track repair progress with end-to-end accountability |
| **Tech Stack** | Vanilla JS (ES6+), HTML5, CSS3 Custom Properties, Node.js, Express, SQLite3, Leaflet GIS, Lucide Vector Icons |

---

## 🎯 Problem Statement & Solution

### ⚠️ The Problem
- **Unreported Road Hazards**: Potholes and asphalt erosion cause severe vehicular damage and fatal accidents.
- **Reporting Friction**: Existing grievance portals are complex, lack mobile responsiveness, and require tedious registration.
- **Lack of Transparency**: Citizens file complaints with no feedback loop on whether road crews were dispatched or if repairs were completed.
- **Administrative Blind Spots**: PWD officials lack real-time GIS heatmaps, telemetry, and unified contractor management.

### ✅ The RoadGuard Solution
1. **60-Second Citizen Reporting**: Instant photo evidence via live hardware camera feed with automated browser GPS geotagging.
2. **Dual-Mode Dashboard**:
   - **Citizen View**: Clean, citizen-dedicated Complaint Status Portal with visual 4-stage repair lifecycle stepper (`01 Filed` → `02 Inspected` → `03 In Repair` → `04 Resolved`), real-time status filters, and PWD inspection notes.
   - **Admin Command Center**: Role-guarded GIS Command Center with highway telemetry, CCTV camera feeds, resolution rate gauges, and contractor dispatch controls.
3. **Unified Authentication in User Login Section**: Multi-tab authentication (`Citizen Login`, `Sign Up (OTP)`, and `Official Admin`) with simulated SMS OTP verification, Google One-Tap, and departmental PWD administrative access.
4. **Inclusive Accessibility**: Multi-lingual interface (English, Hindi, Marathi) with WCAG AA compliance and 4 dynamic design themes.

---

## 🚀 Key Features

- **📸 Live Hardware Camera Capture**: Native `navigator.mediaDevices.getUserMedia` camera HUD with crosshairs, flash effect, and rear/front lens flip.
- **📍 Automated GPS Geotagging**: Accurate coordinates (Latitude, Longitude, Reverse-Geocoded District/Ward) attached to every report.
- **🔐 Dual-Mode Smart Dashboard**:
  - **Citizen Portal**: Shows personal complaints, live status filter pills, search bar, and inspection notes.
  - **Admin GIS Command Center**: High-tech dark GIS console visible strictly upon PWD administrator authentication (`admin / admin123`).
- **🛣️ Interactive Maharashtra GIS Map**: Interactive Leaflet maps visualizing National Highways (NH48, NH65, NH52) and district clusters (Mumbai, Pune, Nashik, Nagpur, Aurangabad).
- **📱 Mobile-First & Offline Resilient**: Hybrid data architecture syncs with Express + SQLite3 REST API and falls back to persistent client-side storage if offline.
- **🌐 Trilingual Localization**: Full Marathi (`mr`), Hindi (`hi`), and English (`en`) interface translation.

---

## 📊 Presentation / PPT Slide Deck Structure

Use this outline directly to create a winning 8–10 slide pitch deck:

### Slide 1: Title & Vision
- **Title**: RoadGuard Maharashtra
- **Subtitle**: AI-Ready Citizen Infrastructure & Road Safety Network
- **Tagline**: *"Safer Roads \| Stronger Maharashtra"*
- **Team Info & Track**: Smart India Hackathon — Smart Vehicles & Infrastructure

### Slide 2: Problem Statement
- High accident rates due to delayed road repairs.
- Cumbersome municipal complaint procedures with zero transparency.
- Absence of centralized, geotagged GIS dashboards for field engineers.

### Slide 3: Proposed Solution
- Lightweight, zero-install mobile web platform.
- 3-step reporting workflow: **Snap & Geotag → Submit → Live Lifecycle Tracking**.
- Public Works Department (PWD) integration with contractor accountability.

### Slide 4: Citizen Experience & Reporting Flow
- Live camera snapshot & GPS location autodetect.
- Quick mobile OTP login & Google One-Tap integration.
- Personal Complaint Status Portal with 4-stage visual progress stepper.

### Slide 5: PWD Official GIS Command Center (Admin View)
- Secured admin access (`admin / admin123`).
- Live highway telemetry & interactive GIS status markers.
- CCTV highway stream simulation (NH48).
- Real-time resolution rate gauge (78%) & 7D/30D/90D complaint trend analytics.
- Central complaint registry with status update workflows.

### Slide 6: Technical Architecture & System Design
- **Frontend**: Lightweight Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 Custom Properties (Design Tokens), Leaflet.js.
- **Backend**: Node.js & Express RESTful API (`/api/complaints`, `/api/stats`).
- **Database**: SQLite3 relational schema (`complaints` and `status_history`).
- **Security & Session**: Role-based sessionStorage gate, simulated OTP cryptographic token.

### Slide 7: Key Differentiators & Impact Metrics
- **SLA**: 72-hour targeted field response SLA across 36 districts.
- **Transparency**: 100% geotagged photographic proof for every complaint.
- **Accessibility**: Multi-language support (English, Hindi, Marathi) and 4 UI themes (Light Civic, Dark GIS, Minimalist, Brutalist).

### Slide 8: Future Roadmap & Scalability
- **Phase 1 (Current)**: Mobile-first civic portal with GIS mapping & OTP auth.
- **Phase 2**: On-device AI computer vision for automatic pothole depth/severity classification.
- **Phase 3**: Integration with state WhatsApp chatbot and automatic contractor billing milestones.

---

## 🖼️ Presentation Screenshots & Visuals (`images/`)

All high-resolution demonstration screenshots, UI mockups, and logos have been collected in the [`images/`](file:///Users/pravinkumar/Projects/pothole-reporter/images/) folder (also aliased as [`screenshots/`](file:///Users/pravinkumar/Projects/pothole-reporter/screenshots/)) for your presentation:

| File Name | Description / Recommended Slide |
| :--- | :--- |
| `official_roadguard_logo.png` | Official high-resolution RoadGuard Maharashtra logo (Title Slide) |
| `reference_ui_design_showcase.jpg` | 4-design theme matrix and layout variations reference |
| `preview_dashboard_no_admin.png` | Citizen Complaint Status Portal (clean citizen view without admin options) |
| `preview_user_login_official_admin_form.png` | User Login section with integrated Official Admin Login tab & credentials |
| `preview_fresh_citizen_dashboard.png` | Citizen Complaint Status Portal with 4-stage stepper (Slide 4) |
| `preview_admin_gis_dashboard_active.png` | Guarded Admin GIS Command Center with highway telemetry (Slide 5) |
| `preview_report.png` | Pothole reporting form with live camera & GPS geotagging (Slide 4) |
| `preview_camera_modal.png` | Live hardware camera HUD with snapshot viewfinder |
| `preview_dash_user_activities.png` | User activity feed with dynamic complaint status tracking |
| `preview_about.png` | Institutional PWD about section and SLA impact metrics (Slide 7) |
| `preview_login_page.png` | Citizen mobile OTP login & Google One-Tap authentication |
| `step2_mobile_preview.png` | Mobile-first responsive view & bottom navigation bar |

---

## 🛠️ Quick Start & Local Execution

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation & Run
```bash
# 1. Clone repository & install dependencies
git clone <repo-url>
cd pothole-reporter
npm install

# 2. Start the Backend & Static File Server
npm start
# Server runs on: http://localhost:3000

# Alternative: Run standalone static preview
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

### Demo Credentials
- **Citizen User**: Use any valid 10-digit mobile number with quick OTP `[⚡ Auto-Fill Code]` or click `Sign in with Google`.
- **PWD Administrator**:
  - **Username**: `admin`
  - **Password**: `admin123`

---

## 👥 Contributors & Acknowledgements
- Developed for **Smart India Hackathon (SIH)**.
- Public Works Department (PWD), Government of Maharashtra.

