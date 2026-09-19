#!/usr/bin/env python3
"""
SentinelAI Backend Runner
Run directly with: python run.py
"""
import uvicorn
import os
import sys

# Ensure current directory is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("==========================================================")
    print("  Starting SentinelAI Backend (Role B)")
    print("  Swagger API Docs: http://127.0.0.1:8000/docs")
    print("  API Base URL:     http://127.0.0.1:8000/api")
    print("==========================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
