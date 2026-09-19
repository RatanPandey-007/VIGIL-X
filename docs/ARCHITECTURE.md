# VIGIL-X: Dynamic Reliability Sentinel
## System Architecture & Technical Specification
**Smart India Hackathon 2026 | Problem Statement: SIH26170**
**AI-Driven Anomaly Detection in Component Burn-In & Screening**
**Organization: Indian Space Research Organisation (ISRO)**
**Theme: Smart Automation | Category: Software**

---

### 1. The Core Engineering Problem in Component Burn-In

In high-reliability space applications (launch vehicles, orbital satellites, deep-space payloads), microelectronic semiconductor parts are subjected to environmental stress screening (burn-in) for up to 168 hours under elevated thermal and electrical conditions. Conventional screening practices face two critical limitations:

1. **Static Limits vs Lot-Relative Variance**: Conventional test rigs compare parametric measurements strictly against fixed datasheet boundaries (e.g. Quiescent Leakage Current $I_{sb} < 85\,\mu\text{A}$ or Case Temperature $T < 125^\circ\text{C}$). A defective component whose wafer lot nominally exhibits $28\,\mu\text{A} \pm 1.5\,\mu\text{A}$ can drift upward to $62\,\mu\text{A}$. Because $62\,\mu\text{A} < 85\,\mu\text{A}$, traditional testing marks this component as **PASS**, allowing a latent defect (e.g., gate oxide breakdown, electro-migration precursor) to slip into spacecraft subsystems where it causes catastrophic infant mortality.
2. **Delayed 168-Hour Bottleneck**: Conventional screening requires completing the full 168 hours before a pass/fail determination can be verified. Rigs are tied up for over a week even when an incipient failure could be predicted with high confidence after early burn-in (e.g. 24 hours).

---

### 2. Dual-Capability Intelligence: Module A & Module B

VIGIL-X addresses the exact core mandate of SIH26170 without transforming the problem into generic predictive maintenance or computer vision:

```
                  ┌────────────────────────────────────────┐
                  │       BURN-IN PARAMETRIC STREAM        │
                  │ (Temperature, Standby Current, Rail V, │
                  │     Operating Current, Dissipation)    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    DATA QUALITY GATE      │
                        │ (Sensory glitches vs      │
                        │    physical degradation)  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ LOT RELIABILITY FINGERPRINT│
                        │ (Median, MAD, Envelopes,  │
                        │   Inter-param Correlation)│
                        └───────┬───────────┬───────┘
                                │           │
              ┌─────────────────┘           └─────────────────┐
              ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│           MODULE A            │               │           MODULE B            │
│   DYNAMIC OUTLIER DETECTION   │               │     EARLY DRIFT PREDICTOR     │
│ ───────────────────────────── │               │ ───────────────────────────── │
│ • Robust Statistical Z (MAD)  │               │ • Input: 0h and 24h Telemetry │
│ • Envelope Violation Metric   │               │ • Target: 168h Value (Isb, T) │
│ • Slope / Trend Divergence    │               │ • Gradient Boosted Regressor  │
│ • Multivariate Isolation Forest│              │ • 90% Empirical Residual Band │
│ ───────────────────────────── │               │ • Confidence Score (0-100%)   │
│ Output: Anomaly Score (0-100) │               │ Output: 168h Forecast & Drift │
└──────────────┬────────────────┘               └───────────────┬───────────────┘
               │                                                │
               └─────────────────┐            ┌─────────────────┘
                                 ▼            ▼
                        ┌───────────────────────────┐
                        │    TIME-TO-RISK ENGINE    │
                        │ (Dynamic remaining hours  │
                        │  to safety trajectory)    │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ SCREENING DECISION ENGINE │
                        │  (ACCEPT / WATCH / HOLD)  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ RELIABILITY EVIDENCE CHAIN│
                        │ (8-Stage Traceable Audit  │
                        │   + What-If Counterfactual)│
                        └───────────────────────────┘
```

---

### 3. Mathematical & Algorithmic Formulation

#### 3.1 Robust Lot Baseline (Fingerprinting)
To ensure defective components cannot skew the baseline of a wafer lot cohort $L$:
$$\text{Median}_p(t) = \text{median}\big(\{x_{i, p}(t) \mid i \in L\}\big)$$
$$\text{MAD}_p(t) = \text{median}\big(\big|x_{i, p}(t) - \text{Median}_p(t)\big|\big)$$
$$\text{Upper Envelope}_p(t) = \text{Median}_p(t) + 2.5 \times 1.4826 \times \text{MAD}_p(t)$$
$$\text{Lower Envelope}_p(t) = \text{Median}_p(t) - 2.5 \times 1.4826 \times \text{MAD}_p(t)$$

#### 3.2 Module A: Hybrid Anomaly Score
Composite anomaly scoring combines statistical robust distance ($Z_{MAD}$), lot envelope breach severity ($E_{viol}$), Isolation Forest multivariate anomaly probability ($I_{forest}$), and slope drift acceleration ($S_{dev}$):
$$Z_{i, p} = \frac{|x_{i, p} - \text{Median}_p|}{1.4826 \times \text{MAD}_p}$$
$$\text{Score}_{\text{Anomaly}} = 0.50 \times \text{Score}_{\text{LotDev}} + 0.30 \times \text{Score}_{\text{IForest}} + 0.20 \times \text{Score}_{\text{Slope}}$$

#### 3.3 Module B: Early Drift Predictor & Residual Uncertainty
Using features extracted over the early screening window $[0\text{h}, 24\text{h}]$:
$$\vec{f}_i = [x_{i, p}(0), x_{i, p}(24), \Delta_{0\to 24}, \text{Var}_{0\to 24}]$$
$$\hat{y}_{168} = \mathcal{M}_{\text{XGBoost}}(\vec{f}_i)$$
Uncertainty interval (90% coverage):
$$I_{90}(168) = \big[\hat{y}_{168} - 1.645\,\sigma_{\text{resid}},\; \hat{y}_{168} + 1.645\,\sigma_{\text{resid}}\big]$$

#### 3.4 Time-to-Risk Calculation
Rather than outputting static numbers, the system evaluates the continuous trajectory intersection:
$$t_{\text{breach}} = \min \big\{ t \in [24, 168] \mid \hat{y}(t) \ge Y_{\text{safety}} \big\}$$
$$\text{Time-to-Risk} = \max(0,\; t_{\text{breach}} - t_{\text{current}})$$

---

### 4. Differentiator: The Reliability Evidence Chain

Every decision is inspectable through 8 linked stages:
1. **Raw Parametric Data**: Sensor readings at evaluation time.
2. **Lot Baseline**: Median and MAD dispersion of component's production lot.
3. **Lot-Relative Deviation**: Robust Z-scores per channel.
4. **Trend & Drift Acceleration**: Observed slope divergence from lot velocity.
5. **Module A Anomaly Score**: Combined ensemble score (0-100) and degradation modes.
6. **Module B 168h Forecast**: Gradient regression endpoint with safety thresholds.
7. **Uncertainty Bounds**: Empirical validation residual interval and confidence level.
8. **Screening Recommendation & Time-to-Risk**: Decision rule and remaining burn-in runway.

Includes model-based **Counterfactual Sensitivity**:
- **Why?**: Primary, Secondary, and Tertiary contributing parametric channels.
- **What-If?**: Simulated outcome if component conformed to nominal lot baseline.

---

### 5. Research Prototype Disclaimer
All telemetry and screening metrics are evaluated on synthetically modeled physical degradation cohorts. The system is designed as an **AI-assisted screening decision tool** and does not replace formal aerospace flight hardware qualification procedures.
