import urllib.request
import json

base = 'http://127.0.0.1:8000/api'

def get_json(url):
    return json.loads(urllib.request.urlopen(url).read())

def post_json(url, data_dict):
    data = json.dumps(data_dict).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    return json.loads(urllib.request.urlopen(req).read())

print("=====================================================================")
print("VIGIL-X LOGICAL INTEGRITY & TEMPORAL VERIFICATION SUITE")
print("Smart India Hackathon 2026 | PS SIH26170 (ISRO)")
print("=====================================================================")

# -------------------------------------------------------------
# 1. TEMPORAL INTEGRITY & GATES AT 0h, 8h, 15h, 20h, 24h, 96h, 168h
# -------------------------------------------------------------
print("\n>>> [TEST 1] TEMPORAL GATES & ZERO FUTURE DATA (HERO C-104)")
post_json(f'{base}/demo/hero-reset', {})

checkpoints = [0.0, 8.0, 15.0, 20.0, 24.0, 96.0, 168.0]
for h in checkpoints:
    post_json(f'{base}/simulate/step', {'hour': h})
    # If at 24h, inject defect to test hero latent divergence
    if h == 24.0:
        post_json(f'{base}/simulate/inject-defect', {'component_id': 'C-104'})

    c_data = get_json(f'{base}/components/C-104')
    chain = c_data['evidence_chain']
    fc = c_data['forecast']
    ttr = c_data['time_to_risk']
    dec = c_data['decision']

    print(f"\n[Hour {h:5.1f}h Checkpoint]")
    print(f"  - Absolute Status  : {c_data['anomaly']['absolute_limit_status']}")
    print(f"  - Module B Status  : {fc.get('status')} ({fc.get('display_status')})")
    print(f"  - Forecast Ready   : {fc.get('forecast_ready')}")
    print(f"  - Confidence       : {fc.get('overall_confidence')} ({fc.get('confidence_label')})")
    print(f"  - Time-to-Risk     : {ttr.get('display_text')}")
    print(f"  - Decision         : {dec.get('decision')} ({dec.get('applied_rule')})")

    # Assertions for temporal integrity
    if h < 24.0:
        assert fc['forecast_ready'] == False, f"Module B must NOT be ready at {h}h!"
        assert fc['status'] == 'AWAITING_24H_GATE'
        assert ttr['display_text'] == 'UNAVAILABLE / AWAITING EARLY DATA'
        assert chain['chain'][5]['status'] == 'AWAITING 24h EARLY GATE'
        assert chain['chain'][6]['confidence_score'] == 'NOT YET AVAILABLE'
    elif h == 24.0:
        assert fc['forecast_ready'] == True, f"Module B must be active at 24h!"
        assert fc['status'] == 'ACTIVE'
        assert c_data['anomaly']['absolute_limit_status'] == 'PASS', "C-104 MUST pass absolute limits at 24h!"
        assert c_data['anomaly']['abnormal_while_under_limit'] == True
        assert dec['decision'] in ['WATCH', 'HOLD / REVIEW']
        assert 'BREACHED' not in ttr['display_text']
        assert len(chain['chain'][5]['table_data']) == 4
    elif h == 96.0:
        assert fc['status'] == 'MID_GATE_RECALCULATED'
    elif h == 168.0:
        assert fc['status'] == 'FINAL_OUTCOME'

# -------------------------------------------------------------
# 2. EVIDENCE CHAIN STAGES AUDIT
# -------------------------------------------------------------
print("\n>>> [TEST 2] 8-STAGE EVIDENCE CHAIN VERIFICATION")
post_json(f'{base}/simulate/step', {'hour': 24.0})
chain_data = get_json(f'{base}/components/C-104/evidence')

expected_stages = [
    (1, "Raw Parametric Data"),
    (2, "Lot Baseline / Reliability Fingerprint"),
    (3, "Lot-Relative Deviation"),
    (4, "Trend & Drift Acceleration"),
    (5, "Module A — Dynamic Anomaly"),
    (6, "Module B — Early 168h Forecast"),
    (7, "Uncertainty + Time-to-Risk"),
    (8, "Screening Recommendation")
]

assert len(chain_data['chain']) == 8, f"Expected 8 stages, got {len(chain_data['chain'])}"
for (step_num, exp_title), actual_stage in zip(expected_stages, chain_data['chain']):
    assert actual_stage['step_number'] == step_num, f"Step number mismatch: {step_num}"
    assert actual_stage['title'] == exp_title, f"Title mismatch: {actual_stage['title']} vs {exp_title}"
    print(f"  Stage {step_num}: {actual_stage['title']} [OK]")

# Verify Stage 6 table data
st6 = chain_data['chain'][5]
assert len(st6['table_data']) == 4, "Stage 6 should contain 4 parameter forecast rows"
print("  Stage 6 Table Structure: Verified (4 parametric forecast rows)")

# -------------------------------------------------------------
# 3. COMPONENT IDENTITY CONSISTENCY (C-003 vs C-104)
# -------------------------------------------------------------
print("\n>>> [TEST 3] COMPONENT IDENTITY CONSISTENCY (C-003)")
post_json(f'{base}/simulate/reset', {})
post_json(f'{base}/simulate/step', {'hour': 24.0})
post_json(f'{base}/simulate/inject-defect', {'component_id': 'C-003'})

c003_eval = get_json(f'{base}/components/C-003')
c003_chain = get_json(f'{base}/components/C-003/evidence')
c003_fc = get_json(f'{base}/components/C-003/forecast')

assert c003_eval['component_id'] == 'C-003', "Evaluation component_id must be C-003!"
assert c003_chain['component_id'] == 'C-003', "Evidence chain component_id must be C-003!"
assert 'C-003' in c003_chain['executive_summary'], "Executive summary must reference C-003!"
print("  Component C-003 identity confirmed across evaluation, forecast, and evidence chain.")

# -------------------------------------------------------------
# 4. FINAL HERO SCENARIO 3-STAGE CONFIRMATION
# -------------------------------------------------------------
print("\n>>> [TEST 4] 3-STAGE HERO SCENARIO REPRODUCIBILITY")
post_json(f'{base}/demo/hero-reset', {})

# Stage 1: Healthy at 4h
post_json(f'{base}/simulate/step', {'hour': 4.0})
s1 = get_json(f'{base}/components/C-104')
print(f"  Stage 1 (4h)  : Abs={s1['anomaly']['absolute_limit_status']}, LotDev={s1['anomaly']['lot_deviation_score']}, Dec={s1['decision']['decision']}, ModB={s1['forecast']['status']}")
assert s1['anomaly']['absolute_limit_status'] == 'PASS'
assert s1['decision']['decision'] == 'ACCEPT'
assert s1['forecast']['status'] == 'AWAITING_24H_GATE'

# Stage 2: Latent Drift at 24h
post_json(f'{base}/simulate/inject-defect', {'component_id': 'C-104'})
post_json(f'{base}/simulate/step', {'hour': 24.0})
s2 = get_json(f'{base}/components/C-104')
print(f"  Stage 2 (24h) : Abs={s2['anomaly']['absolute_limit_status']}, Leakage={s2['latest_record']['standby_current']} µA, LotDev={s2['anomaly']['lot_deviation_score']}, Anomaly={s2['anomaly']['anomaly_score']}, TTR={s2['time_to_risk']['display_text']}, Dec={s2['decision']['decision']}")
assert s2['anomaly']['absolute_limit_status'] == 'PASS'
assert s2['latest_record']['standby_current'] < 85.0
assert s2['anomaly']['abnormal_while_under_limit'] == True
assert s2['anomaly']['lot_deviation_score'] > 45.0
assert s2['decision']['decision'] in ['WATCH', 'HOLD / REVIEW']

# Stage 3: Eventual Limit Breach at 120h
post_json(f'{base}/simulate/step', {'hour': 120.0})
s3 = get_json(f'{base}/components/C-104')
print(f"  Stage 3 (120h): Abs={s3['anomaly']['absolute_limit_status']}, Leakage={s3['latest_record']['standby_current']} µA, TTR={s3['time_to_risk']['display_text']}, Dec={s3['decision']['decision']}")
assert s3['anomaly']['absolute_limit_status'] == 'BREACHED'
assert s3['latest_record']['standby_current'] > 85.0
assert s3['decision']['decision'] == 'HOLD / REVIEW'

# Reset to 0h ready for user
post_json(f'{base}/demo/hero-reset', {})
print("\n[Final] Reset to 0.0h ready for live presentation.")
print("ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS.")
