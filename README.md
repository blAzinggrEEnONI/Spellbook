# Spellbook

A web dashboard for [netanal](https://github.com/blAzinggrEEnONI/Network-Traffic-Analyzer). Streams live packet captures and pcap-file analyses from a FastAPI backend over WebSockets, and renders traffic visualizations in a modern React frontend.

## Stack

- **Backend:** FastAPI · Uvicorn · netanal (Scapy)
- **Frontend:** Vite · React · TypeScript · Recharts

## Features

- **Upload & Analyze:** Upload a `.pcap` or `.pcapng` file and instantly view protocol distribution, top talkers, and bandwidth over time with detailed packet-level breakdowns.
- **Live Capture Mode:** Pick a network interface, set a BPF filter, and watch packets stream in real-time over WebSockets with rolling 1-second statistics snapshots and instant protocol classification.
- **Dark, Dense Dashboard Layout:** Designed for at-a-glance investigation with minimal scrolling—perfect for incident response and network troubleshooting workflows.

## Layout

```
Spellbook/
├── backend/      # FastAPI + WebSocket server wrapping netanal
├── frontend/     # Vite + React + TS dashboard
└── justfile      # one-liner recipes for setup + dev
```

## Quick start

Assumes [`network-traffic-analyzer`](https://github.com/blAzinggrEEnONI/Network-Traffic-Analyzer) is checked out as a sibling directory (`../network-traffic-analyzer`).

```bash
# from the Spellbook repo root
just setup

# in one terminal
just backend         # or `just backend-sudo` for live capture on Linux

# in another
just frontend        # http://localhost:5173
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for details — including the WebSocket protocol contract, environment configuration, and troubleshooting.
