"""
AgriMitra AI 2.0 - Cross-Platform Production Server Launcher
Works seamlessly on Linux, Windows, macOS, Render, Railway, Docker, and VPS.
"""

import os
import sys
import uvicorn
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    host = os.getenv("HOST", "0.0.0.0")

    print("==================================================")
    print("  AgriMitra AI 2.0 - Production Server")
    print(f"  Listening on: http://{host}:{port}")
    print("==================================================")

    uvicorn.run(
        "main:app",
        app_dir=str(BACKEND_DIR),
        host=host,
        port=port,
        reload=False,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
