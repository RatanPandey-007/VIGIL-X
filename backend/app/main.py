"""
VIGIL-X: Dynamic Reliability Sentinel
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)
Main FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router as api_router
from app.simulation.live_engine import live_sim_controller

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize synthetic generator, lot fingerprints, and ML models
    live_sim_controller.initialize()
    yield
    # Shutdown: Clean up resources if necessary

app = FastAPI(
    title="VIGIL-X: Dynamic Reliability Sentinel",
    description="AI-Driven Anomaly Detection & Early Drift Prediction in Component Burn-In (SIH26170 / ISRO)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "VIGIL-X: Dynamic Reliability Sentinel",
        "tagline": "Smart India Hackathon 2026 (SIH26170 / ISRO)",
        "docs": "/docs",
        "api_root": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
