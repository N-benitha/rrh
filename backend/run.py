#!/usr/bin/env python3
"""
Rwanda Resilience Hub - Backend Server
Run this script to start the FastAPI backend server
"""

import uvicorn
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Rwanda Resilience Hub Backend API...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🗺️ Interactive Docs: http://localhost:8000/redoc")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
