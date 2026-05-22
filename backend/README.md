# Spellbook Backend

FastAPI service that wraps [netanal](https://github.com/blAzinggrEEnONI/Network-Traffic-Analyzer) and exposes its capture/analyze functionality to the Spellbook frontend over REST and WebSockets.

## Endpoints

| Method | Path              | Purpose                                                    |
| ------ | ----------------- | ---------------------------------------------------------- |
| GET    | `/api/health`     | Liveness probe                                             |
| GET    | `/api/interfaces` | List capture interfaces + permission state                 |
| POST   | `/api/analyze`    | Upload a `.pcap`/`.pcapng`, return aggregated statistics    |
| WS     | `/ws/capture`     | Start/stop a live capture and stream packets + stats       |

### WebSocket protocol

Client → server:

```json
{ "action": "start", "interface": "eth0", "filter": "tcp port 80", "snapshot_interval": 1.0 }
{ "action": "stop" }
```

Server → client:

```json
{ "type": "packet", "data": { "timestamp": ..., "src_ip": "...", ... } }
{ "type": "stats",  "data": { "total_packets": 42, ... } }
{ "type": "final",  "data": { ... } }
{ "type": "error",  "message": "..." }
```

## Run locally

The backend expects netanal to live at `../../network-traffic-analyzer` (a sibling of the Spellbook checkout).

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ../../network-traffic-analyzer
.venv/bin/pip install -e .

# start the server (reload + auto-discover spellbook)
.venv/bin/python -m uvicorn spellbook.main:app --reload --port 8000
# or
.venv/bin/spellbook-server
```

Live capture needs raw-socket privileges on Linux:

```bash
sudo .venv/bin/python -m uvicorn spellbook.main:app --port 8000
```

## Layout

```
backend/
├── src/spellbook/
│   ├── main.py             # FastAPI app + route handlers
│   ├── capture_stream.py   # Bridges CaptureEngine threads → asyncio.Queue
│   └── serializers.py      # netanal dataclasses → JSON-friendly dicts
└── pyproject.toml
```
