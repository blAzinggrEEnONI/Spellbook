# Spellbook

A web dashboard for [netanal](https://github.com/blAzinggrEEnONI/Network-Traffic-Analyzer). Streams live packet captures and pcap-file analyses from a FastAPI backend over WebSockets, and renders them with live Recharts panels in a React + TypeScript frontend.

## Stack

- **Backend:** FastAPI · Uvicorn · netanal (Scapy)
- **Frontend:** Vite · React · TypeScript · Recharts

## Features

- Upload a `.pcap` or `.pcapng` file and see protocol distribution, top talkers, and bandwidth over time.
- Live capture mode — pick an interface, set a BPF filter, and watch packets stream in over WebSockets with rolling 1-second stats snapshots.
- Dark, dense dashboard layout designed for at-a-glance investigation.

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

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for details — including the WebSocket protocol contract.
