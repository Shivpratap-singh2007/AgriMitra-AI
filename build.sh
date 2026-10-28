#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=================================================="
echo "  AgriMitra AI - Render Automated Build"
echo "=================================================="

# 1. Install Python dependencies
echo ">>> Installing Python requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 2. Build Frontend React SPA
if command -v npm &> /dev/null; then
    echo ">>> Installing Node dependencies & Building React SPA..."
    npm --prefix frontend install
    npm --prefix frontend run build
    echo ">>> Frontend build succeeded!"
else
    echo ">>> Note: npm not found in build container, proceeding with existing dist"
fi

echo "=================================================="
echo "  Build Completed Successfully!"
echo "=================================================="
