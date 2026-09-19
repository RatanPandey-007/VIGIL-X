"""
Runner script for VIGIL-X FastAPI Backend
"""

import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    print("[VIGIL-X] Launching backend server on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
