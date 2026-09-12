# FitPulse: Clothing Fit Feedback & Intelligence System
**Hackathon Track:** "Fashion for People"  
**Built with:** React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Node.js, Express, and Hybrid AI / NLP.

---

## 🌟 Executive Overview
Fashion e-commerce suffers from a **\$38 Billion annual return crisis**, with **68% of returns driven by sizing and fit inconsistencies**. Unstructured reviews saying *"fits weird"* or *"shoulders are tight"* remain fragmented across product pages, customer support logs, and return portals, completely disconnected from technical patternmakers and designers.

**FitPulse** bridges this critical gap. It is an end-to-end intelligent feedback and analytics platform that:
1. **Captures** structured clothing-fit feedback through an intuitive, privacy-first 2D human silhouette selector and 1–5 star ratings.
2. **Understands** customer sentiment, defect severity, and problem areas through a hybrid AI categorization layer (supporting Gemini with an offline, zero-latency rule-based NLP fallback).
3. **Improves** future collections by transforming customer complaints into millimeter-level engineering tolerances (+1.5 cm shoulder width, -2 cm waist) ready for factory tech packs.

---

## 🚀 Key Features

### 1. Customer Feedback Flow (7-Step Guided Experience)
- **Step 1: Garment Information**: Brand, Product name, Garment type (*Shirt, T-Shirt, Jeans, Trousers, Dress, Jacket, etc.*), Size purchased, Expected size, Fit preference (*Slim, Regular, Relaxed, Oversized*).
- **Step 2: Interactive Silhouette Selector**: Clickable SVG human anatomy hotspots (*Shoulders, Chest, Waist, Hips, Sleeves, Length, Neck, Arms, Thighs, Rise*), paired with issue sub-pills (*Too Tight, Too Loose, Too Short, Too Long, Fits Correctly*).
- **Step 3: Multi-Dimensional Ratings**: 1–5 stars for Overall Fit, Wearing Comfort & Mobility, and Tag Size Accuracy.
- **Step 4: Natural Language Fit Story**: Freeform customer comment box with one-click test prompts and character counter.
- **Step 5: Optional Fit Photo Upload**: Drag & drop photo upload with privacy disclaimer (*strictly optional; feedback is 100% useful without images*).
- **Step 6: Return Intent**: Identifies if fit dissatisfaction led to a return or exchange.
- **Step 7: Instant AI Feedback Confirmation**: Real-time modal displaying extracted areas, detected defects, sentiment, and defect severity with celebratory confetti.

### 2. Brand & Designer Analytics Dashboard
- **Top 6 KPI Summary Cards**: Total Feedback, Average Fit Rating, Fit Issue Rate %, Return Rate %, Top Issue Category, and Most Affected Size.
- **7 Interactive Analytical Charts**:
  1. *Fit Issues by Body Area* (horizontal bar)
  2. *Issue Type Distribution* (donut chart)
  3. *Problem Rate by Size* (XS to XXL comparison)
  4. *Problems by Garment Type* (volume & defect concentration)
  5. *Customer Sentiment* (AI-classified emotional tone)
  6. *Primary Return Reasons*
  7. *45-Day Trend Over Time* (tracking complaint velocity)
- **Visual Body Fit Heatmap**: Dynamic SVG silhouette displaying defect intensity (*Red: &ge;25%, Orange: 15–24%, Yellow: 6–14%, Green: &lt;6%*). Clicking any body zone filters the entire dashboard.
- **Size-Specific Comparative Intelligence**: Dynamically calculates comparative conclusions between sizes (*e.g., "Size M has 100% more shoulder-fit complaints than Size S"*).
- **AI Actionable Design Recommendations**: Prioritized HIGH, MEDIUM, and LOW design revisions with Problem statement, Empirical evidence, Affected customer %, Suggested action, and Expected business impact.
- **Designer Action Center & Tech Pack Specs**: Concrete measurement delta tables (*+1.5 cm shoulder, -2.0 cm waist, +1.8 cm thigh*), e-commerce size chart guidance, future collection suggestions, and customer segment deep dives.
- **Customer Fit Preference Segmentation**: Granular breakdown across *Slim, Regular, Relaxed,* and *Oversized* fit cohorts.
- **Interactive Feedback Table & Drawer**: Search, sort, filter, and inspect customer reviews with full AI interpretation breakdowns.

### 3. Hackathon Presentation Mode
A dedicated 7-act interactive storytelling slide deck built right into the header for judges:
1. *The Customer Problem*
2. *Frictionless Feedback Capture*
3. *AI Pattern Detection Layer*
4. *Key Fit Anomaly Uncovered*
5. *Empirical Evidence & Telemetry*
6. *Precision Design Recommendations*
7. *Economic & Environmental Impact*

---

## 🛠️ Architecture & Tech Stack

```
clothing-fit-intelligence/
├── server/
│   ├── index.ts               # Express REST API (port 5001)
│   ├── db.ts                  # Persistent JSON storage engine (data/feedback.json)
│   ├── seedData.ts            # 175 realistic fashion fit feedback records
│   ├── nlpEngine.ts           # Hybrid AI analyzer (Gemini API + rule-based NLP fallback)
│   ├── analyticsEngine.ts     # Dynamic statistical KPI & size comparison calculator
│   └── recommendationEngine.ts# AI recommendation & tech pack spec generator
├── client/
│   ├── src/
│   │   ├── api/client.ts      # Typed REST API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx     # Role switcher & presentation mode
│   │   │   ├── LandingPage.tsx# Fashion-tech hero & live metric ticker
│   │   │   ├── CustomerFeedback/
│   │   │   │   ├── FeedbackWizard.tsx
│   │   │   │   ├── BodyAreaSelector.tsx
│   │   │   │   └── FeedbackSuccessModal.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── BrandDashboard.tsx
│   │   │   │   ├── KpiCards.tsx
│   │   │   │   ├── AnalyticsCharts.tsx
│   │   │   │   ├── BodyHeatmap.tsx
│   │   │   │   ├── SizeSpecificAnalysis.tsx
│   │   │   │   ├── AiRecommendations.tsx
│   │   │   │   ├── DesignerActionCenter.tsx
│   │   │   │   ├── CustomerSegments.tsx
│   │   │   │   ├── FeedbackTable.tsx
│   │   │   │   ├── FeedbackDetailModal.tsx
│   │   │   │   └── ExportReportModal.tsx
│   │   │   └── Presentation/
│   │   │       └── HackathonPresentationMode.tsx
│   │   ├── types/index.ts
│   │   └── App.tsx
```

---

## ⚡ Quickstart Guide

### 1. Run the Backend API Server
```powershell
cd server
npm install
npm run dev
# Server listens on http://localhost:5001
```

### 2. Run the Frontend Client
```powershell
cd client
npm install
npm run dev
# Client is accessible at http://localhost:5173
```

---

## 🧪 Sample End-to-End Verification Flow

1. Open `http://localhost:5173` in your browser.
2. Click **"Give Feedback"** (or click **"Autofill Sample Test Case"** inside the form).
3. Select:
   - Garment: **Shirt**
   - Size: **M**
   - Fit preference: **Regular**
   - Body Areas: **Shoulders &rarr; Too Tight**, **Sleeves &rarr; Too Short**
   - Rating: **2 / 5 Stars**
   - Comment: *"The shirt looks good but the shoulders are tight and the sleeves are shorter than expected."*
4. Click **"Submit Feedback"**.
5. Observe the **Instant AI Confirmation Modal** displaying:
   - `Shoulders -> Too Tight`
   - `Sleeves -> Too Short`
   - `Sentiment -> Negative`
   - `Severity -> High/Medium`
6. Click **"View on Brand Dashboard"**.
7. Observe the **Live KPIs and Body Heatmap** update in real time with Shoulders highlighted as the primary high-intensity problem zone.
8. Navigate to **"AI Recommendations"** and inspect:
   - *"Review shoulder width grading for M-size shirts: Increase cross-shoulder measurement by +1.5 cm and widen armhole drop by 0.8 cm."*
9. Open **"Judge Presentation Mode"** from the top bar to experience the storytelling presentation.
