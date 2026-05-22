# Spellbook Frontend

Vite + React + TypeScript dashboard. Talks to the FastAPI backend at `http://127.0.0.1:8000` (override with `VITE_API_BASE`).

## Run locally

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## Build

```bash
npm run build   # tsc + vite build → dist/
npm run preview # serve the built bundle
```

## Layout

```
frontend/src/
├── App.tsx                       # mode switch + dashboard layout
├── api.ts                        # REST client
├── types.ts                      # DTOs shared with the backend
├── hooks/useCaptureSocket.ts     # WebSocket lifecycle + state
└── components/
    ├── CaptureControls.tsx       # interface picker + BPF filter + start/stop
    ├── PcapUpload.tsx            # file upload for /api/analyze
    ├── ProtocolPie.tsx           # recharts PieChart
    ├── TopTalkers.tsx            # recharts horizontal BarChart
    ├── BandwidthChart.tsx        # recharts LineChart
    └── PacketFeed.tsx            # rolling table of recent packets
```
