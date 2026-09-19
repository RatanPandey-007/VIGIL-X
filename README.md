# VIGIL-X: Dynamic Reliability Sentinel

> **Smart India Hackathon 2026 | Problem Statement: SIH26170**  
> **AI-Driven Anomaly Detection in Component Burn-In & Screening**  
> **Organization: Indian Space Research Organisation (ISRO)**  
> **Category: Software | Theme: Smart Automation**  

```
=============================================================================
  ██╗   ██╗██╗ ██████╗ ██╗██╗     ██╗  ██╗
  ██║   ██║██║██╔════╝ ██║██║     ╚██╗██╔╝
  ██║   ██║██║██║  ███╗██║██║      ╚███╔╝ 
  ╚██╗ ██╔╝██║██║   ██║██║██║      ██╔██╗ 
   ╚████╔╝ ██║╚██████╔╝██║███████╗██╔╝ ██╗
    ╚═══╝  ╚═╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝
   DYNAMIC RELIABILITY SENTINEL • SPACE-GRADE COMPONENT SCREENING
=============================================================================
```

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![SIH26170](https://img.shields.io/badge/SIH-2026--SIH26170-orange.svg)](#)

---

## 1. Executive Summary

Electronic components utilized in ISRO launch vehicles, satellites, and scientific payloads undergo environmental stress screening (burn-in) for up to 168 hours to eliminate infant mortality. Conventional screening relies strictly on **fixed datasheet limits at the 168-hour mark**.

**The Fatal Flaw of Conventional Screening:**  
A component whose lot nominally operates at $28\,\mu\text{A} \pm 1.5\,\mu\text{A}$ can slowly drift upward to $62\,\mu\text{A}$. Because $62\,\mu\text{A}$ is still below the absolute datasheet limit of $85\,\mu\text{A}$, conventional testing marks this component as **PASS**. The latent defect escapes into space hardware and triggers mission failure.

**VIGIL-X introduces a dual-capability reliability intelligence platform:**
- **Module A — Dynamic Outlier Detection**: Extracts robust lot-level baseline fingerprints (median, MAD, envelopes) and hybrid anomaly scores (robust statistical distance, lot envelope deviation, slope divergence, Isolation Forest) that detect abnormal drift even when absolute limits have not been breached.
- **Module B — Early Drift Predictor**: Uses early $0\text{h} \to 24\text{h}$ measurements and early-behavior feature engineering to predict the $168\text{h}$ outcome using tree-based gradient regression with statistical uncertainty bounds ($90\%$ confidence interval).
- **Core Differentiator — Reliability Evidence Chain**: An 8-stage traceable, auditable explanation model (`Raw Data` $\to$ `Lot Baseline` $\to$ `Deviation` $\to$ `Drift Trend` $\to$ `Anomaly Score` $\to$ `168h Forecast` $\to$ `Uncertainty` $\to$ `Time-to-Risk` $\to$ `Screening Recommendation`).
- **Time-to-Risk Engine**: Dynamically calculates the exact remaining operational burn-in runway until a projected safety violation occurs (e.g., $37\,\text{h}$, $84\,\text{h}$, $>168\,\text{h}$).

---

## 2. System Architecture

```
                                  VIGIL-X PIPELINE
                                  
   +-------------------------------------------------------------------------+
   |                        RAW PARAMETRIC TELEMETRY                         |
   |   (Temperature, Quiescent Leakage, Voltage Rail, Active Current, Power)  |
   +------------------------------------+------------------------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                           DATA QUALITY GATE                             |
   |   Checks: Missing cells, duplicate timestamps, impossible values,       |
   |           single-sample sensor noise vs multi-hour physical drift       |
   +------------------------------------+------------------------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                       LOT RELIABILITY FINGERPRINT                       |
   |   Robust statistics: Median(t), MAD(t), 2.5 MAD Upper/Lower Envelopes   |
   +------------------+----------------------------------+-------------------+
                      |                                  |
                      v                                  v
   +----------------------------------+ +-----------------------------------+
   |             MODULE A             | |             MODULE B              |
   |    DYNAMIC OUTLIER DETECTION     | |       EARLY DRIFT PREDICTOR       |
   | • Robust MAD Z-Scores            | | • Inputs: 0h & 24h Early Telemetry|
   | • Envelope Violation Severity    | | • Target: 168h Endpoint Values    |
   | • Slope / Trend Divergence       | | • Gradient Boosted Regression     |
   | • Multivariate Isolation Forest  | | • 90% Empirical Residual Band     |
   | Output: Anomaly Score (0-100)    | | Output: 168h Forecast & Drift     |
   +------------------+---------------+ +-----------------+-----------------+
                      |                                   |
                      +-----------------+-----------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                           TIME-TO-RISK ENGINE                           |
   |   Calculates dynamic intersection between forecasted trajectory and     |
   |   configured safety threshold (e.g. 37h, 84h, >168h, UNCERTAIN)         |
   +------------------------------------+------------------------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                        SCREENING DECISION ENGINE                        |
   |   Transparent rules: ACCEPT | WATCH | HOLD / REVIEW                     |
   +------------------------------------+------------------------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                       RELIABILITY EVIDENCE CHAIN                        |
   |   8-stage auditable audit trail + "Why?" & "What-If?" Sensitivity       |
   +-------------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | XGBoost, Scikit-learn (Isolation Forest, Random Forest), NumPy, Pandas, SciPy |
| **Storage / Data** | JSON / CSV / In-memory streaming cache |
| **Design Language** | High-reliability space mission control, deep-space dark palette (`#06090F`), aerospace telemetry typography |

---

## 4. Quickstart & Installation

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm 9+

### 1. Start the Backend API
In a terminal:
```bash
# Navigate to backend directory
cd d:\VIGIL-X\backend

# (Optional) Activate your python environment if using one

# Run the backend server
python scripts/run_backend.py
```
*Backend will start on `http://127.0.0.1:8000`.*  
*API documentation available at `http://127.0.0.1:8000/docs`.*

### 2. Start the Frontend Application
In a separate terminal:
```bash
# Navigate to frontend directory
cd d:\VIGIL-X\frontend

# Start Vite development server
npm run dev
```
*Frontend will launch at `http://localhost:5173`.*

---

## 5. The Hero Demo: Step-by-Step Guide for Judges

The Hero Demo demonstrates the central scenario required by SIH26170 in under 30 seconds:

1. **Deterministic Reset**:
   - Click the **`Hero Demo (C-104)`** button in the header.
   - Component `C-104` from `LOT-A17` resets to **0.0h**.
   - State: **`ACCEPT`**, Absolute Limit: **`PASS`**, Lot Deviation: **`LOW`**.
2. **Inspect Baseline Lot Envelope**:
   - Notice the shaded blue band (**Lot Normal Envelope** based on Median $\pm 2.5 \times \text{MAD}$).
   - Notice the horizontal red line (**Absolute Engineering Limit**: $85\,\mu\text{A}$ / $125^\circ\text{C}$).
3. **Start Accelerated Burn-In**:
   - Click the **Play** button (`▶`) at $10\text{x}$ or $50\text{x}$ speed.
   - Simulation hour ticks forward smoothly.
4. **Inject Latent Defect**:
   - In the **Live Burn-In Lab** tab, click **`Inject Latent Defect (C-104)`**.
   - Watch the subtle progressive failure progression unfold:
     - **0–8h**: Nominal behavior indistinguishable from healthy parts.
     - **8–15h**: Incipient thermal drift ($+0.15^\circ\text{C}/\text{h}$).
     - **15–20h**: Current variability and leakage jitter begins escalating.
     - **20–24h**: Component trajectory crosses the Lot Normal Envelope ($>2.5\,\text{MAD}$).
     - **24h Early Gate**: Module B unlocks and computes the $168\text{h}$ forecast.
     - **24h+**: Forecast diverges toward the configured safety boundary.
5. **Observe the Core Scenario**:
   - **Absolute Limit**: **`PASS`** (Quiescent leakage is $\sim 36\,\mu\text{A}$, far below the $85\,\mu\text{A}$ datasheet ceiling).
   - **Lot Relative**: **`ANOMALOUS`** (Outlier score $80+/100$).
   - **Time-to-Risk**: **`37 h`** (Dynamic calculation of remaining runway to boundary breach).
   - **Decision**: Transitions to **`HOLD / REVIEW`**.
6. **Inspect the Reliability Evidence Chain**:
   - Click **`Inspect Reliability Evidence Chain`**.
   - Walk the judge through all 8 auditable stages.
   - Click **`Why?`** to show the top parametric contributors ($I_{sb}$ and Temperature).
   - Click **`What-If?`** to inspect the counterfactual sensitivity analysis comparing current trajectory against the lot median baseline.

---

## 6. Project Structure

```
d:\VIGIL-X\
├── backend\
│   ├── app\
│   │   ├── config.py                 # Domain constants, absolute limits, lot configs
│   │   ├── main.py                   # FastAPI app, CORS, lifespan startup
│   │   ├── api\
│   │   │   └── routes.py             # REST endpoints (health, metrics, components, lots, alerts)
│   │   ├── core\
│   │   │   ├── data_quality.py       # Data quality gate (noise vs physical drift)
│   │   │   ├── lot_fingerprint.py    # Robust lot statistics (median, MAD, envelopes)
│   │   │   ├── module_a_anomaly.py   # Hybrid anomaly engine (robust z, slope, iForest)
│   │   │   ├── module_b_predictor.py # Early drift predictor (0h/24h -> 168h XGBoost/RF)
│   │   │   ├── time_to_risk.py       # Dynamic calculation of remaining hours
│   │   │   ├── decision_engine.py    # Screening Decision Engine (transparent rules)
│   │   │   ├── evidence_chain.py     # 8-stage evidence chain & counterfactuals
│   │   │   └── model_validation.py   # Synthetic holdout validation metrics
│   │   └── simulation\
│   │       ├── generator.py          # Parametric multi-lot burn-in generator
│   │       └── live_engine.py        # Live clock, accelerated playback, defect injector
│   ├── tests\
│   │   └── test_engine.py            # Automated pytest test suite
│   ├── scripts\
│   │   └── run_backend.py            # Backend server runner
│   └── requirements.txt
├── frontend\
│   ├── src\
│   │   ├── App.tsx                   # Main React application
│   │   ├── types\index.ts            # TypeScript interfaces
│   │   ├── services\api.ts           # REST API client
│   │   ├── components\
│   │   │   ├── Header.tsx            # Mission control header & controls
│   │   │   ├── ReliabilityEnvelopeChart.tsx # Centerpiece trajectory visualization
│   │   │   ├── EvidenceChainModal.tsx# 8-stage evidence chain & sensitivity modal
│   │   │   ├── DecisionBadge.tsx     # ACCEPT / WATCH / HOLD badges
│   │   │   └── DataQualityBadge.tsx  # Data quality status badge
│   │   └── views\
│   │       ├── OverviewDashboard.tsx # Command center with top KPIs
│   │       ├── LiveBurnInLab.tsx     # Accelerated laboratory workbench
│   │       ├── LotIntelligenceView.tsx # Lot fingerprints & component roster
│   │       ├── ComponentForensicsView.tsx # Deep-dive forensic analysis
│   │       ├── ModelValidationView.tsx # Dynamic synthetic benchmark metrics
│   │       └── TraditionalVsVigilXView.tsx # Comparative architecture matrix
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs\
│   └── ARCHITECTURE.md               # Deep technical & mathematical documentation
└── README.md
```

---

## 7. Critical Honesty & Synthetic Data Disclaimer

> [!IMPORTANT]
> **SIMULATION / RESEARCH PROTOTYPE DISCLAIMER**
> 1. Because real proprietary flight burn-in datasets are restricted, this system utilizes a clearly labeled, physically grounded synthetic burn-in telemetry generator.
> 2. This prototype is designed strictly as an **AI-Assisted Screening Decision Tool** to prioritize engineer review and quarantine latent defective units early.
> 3. It does **not** claim to represent real ISRO flight telemetry or replace formal aerospace flight qualification protocols without empirical test-rig validation.

---

## 8. Verification & Test Results

Run the backend test suite:
```bash
python -m pytest backend/tests/test_engine.py -v
```
**Results:** `6 passed in 7.23s` (100% test pass rate covering synthetic generator, data quality gate, lot fingerprinting, Module A outlier detection, Module B early drift predictor, time-to-risk engine, evidence chain assembly, and FastAPI endpoints).

Run the frontend build:
```bash
cd frontend && npm run build
```
**Results:** `✓ built in 37.97s` with zero TypeScript errors.
