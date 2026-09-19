"""
Vercel Serverless Entrypoint for VIGIL-X FastAPI Backend
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)
"""

import sys
import os

# Add backend directory to sys.path so app.* imports work seamlessly in serverless execution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.simulation.live_engine import live_sim_controller

# Serverless resilience: Ensure simulation engine and ML models are initialized on cold start
try:
    if not live_sim_controller.initialized:
        live_sim_controller.initialize()
except Exception as e:
    print(f"[Vercel Startup Notice] Lazy init triggered: {e}")
