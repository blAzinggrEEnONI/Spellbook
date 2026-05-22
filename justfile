set shell := ["bash", "-cu"]

backend := "backend"
frontend := "frontend"
netanal := "../network-traffic-analyzer"

# Show available recipes
default:
    @just --list

# One-time setup: create venv, install netanal + spellbook editable, install frontend deps
setup:
    cd {{backend}} && python3 -m venv .venv
    cd {{backend}} && .venv/bin/pip install -e {{netanal}}
    cd {{backend}} && .venv/bin/pip install -e .
    cd {{frontend}} && npm install

# Run the FastAPI backend with reload
backend:
    cd {{backend}} && .venv/bin/python -m uvicorn spellbook.main:app --reload --port 8000

# Run the FastAPI backend with sudo (for live packet capture on Linux)
backend-sudo:
    cd {{backend}} && sudo .venv/bin/python -m uvicorn spellbook.main:app --port 8000

# Run the Vite dev server
frontend:
    cd {{frontend}} && npm run dev

# Type-check + build the frontend
build-frontend:
    cd {{frontend}} && npm run build

# Quick smoke test against /api/analyze using a synthetic pcap
smoke:
    cd {{backend}} && .venv/bin/python -c "from scapy.all import IP, TCP, Ether, wrpcap; \
        wrpcap('/tmp/spellbook_smoke.pcap', [Ether()/IP(src='10.0.0.1', dst='10.0.0.2')/TCP(sport=1, dport=80)])"
    curl -s -X POST -F "file=@/tmp/spellbook_smoke.pcap" http://127.0.0.1:8000/api/analyze | head -c 400 ; echo
