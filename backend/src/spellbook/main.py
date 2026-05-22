"""Spellbook FastAPI application — REST + WebSocket facade over netanal."""

from __future__ import annotations

import asyncio
import tempfile
from contextlib import suppress
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from netanal.analyzer import analyze_pcap_file
from netanal.capture import check_capture_permissions, get_available_interfaces
from netanal.models import CaptureConfig
from netanal.statistics import StatisticsCollector

from .capture_stream import CaptureStream
from .serializers import statistics_to_dict

app = FastAPI(
    title="Spellbook",
    description="Web dashboard backend for netanal — streams pcap analysis and live captures.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/interfaces")
def interfaces() -> dict[str, Any]:
    can_capture, message = check_capture_permissions()
    return {
        "interfaces": get_available_interfaces(),
        "can_capture": can_capture,
        "permission_message": message,
    }


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith((".pcap", ".pcapng")):
        raise HTTPException(status_code=400, detail="Upload must be a .pcap or .pcapng file")

    with tempfile.NamedTemporaryFile(suffix=".pcap", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        packets = analyze_pcap_file(str(tmp_path))
        collector = StatisticsCollector()
        collector.start()
        for packet in packets:
            collector.record_packet(packet)
        stats = collector.get_statistics()
        return {
            "filename": file.filename,
            "packet_count": len(packets),
            "statistics": statistics_to_dict(stats),
        }
    finally:
        with suppress(OSError):
            tmp_path.unlink()


@app.websocket("/ws/capture")
async def capture_ws(websocket: WebSocket) -> None:
    """
    Live capture protocol:
      client → {"action": "start", "interface": "eth0", "filter": "tcp", "snapshot_interval": 1.0}
      client → {"action": "stop"}
      server → {"type": "packet", "data": {...}}
      server → {"type": "stats", "data": {...}}
      server → {"type": "final", "data": {...}}
      server → {"type": "error", "message": "..."}
    """
    await websocket.accept()
    stream: CaptureStream | None = None
    forward_task: asyncio.Task[None] | None = None

    async def forward_events(active_stream: CaptureStream) -> None:
        try:
            async for event in active_stream.events():
                await websocket.send_json(event)
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001 — best-effort error reporting to client
            with suppress(Exception):
                await websocket.send_json({"type": "error", "message": str(exc)})

    try:
        while True:
            message = await websocket.receive_json()
            action = message.get("action")

            if action == "start":
                if stream is not None and stream.is_running:
                    await websocket.send_json(
                        {"type": "error", "message": "Capture already running"}
                    )
                    continue
                config = CaptureConfig(
                    interface=message.get("interface") or None,
                    bpf_filter=message.get("filter") or None,
                    packet_count=message.get("packet_count") or None,
                    timeout_seconds=message.get("timeout_seconds") or None,
                )
                try:
                    stream = CaptureStream(config)
                    stream.start(
                        snapshot_interval_seconds=float(
                            message.get("snapshot_interval", 1.0)
                        )
                    )
                except Exception as exc:  # noqa: BLE001 — surface netanal failures to the UI
                    await websocket.send_json({"type": "error", "message": str(exc)})
                    stream = None
                    continue
                forward_task = asyncio.create_task(forward_events(stream))

            elif action == "stop":
                if stream is None:
                    await websocket.send_json(
                        {"type": "error", "message": "No capture running"}
                    )
                    continue
                final = stream.stop()
                if forward_task is not None:
                    forward_task.cancel()
                    with suppress(asyncio.CancelledError):
                        await forward_task
                    forward_task = None
                await websocket.send_json(final)
                stream = None

            else:
                await websocket.send_json(
                    {"type": "error", "message": f"Unknown action: {action!r}"}
                )

    except WebSocketDisconnect:
        pass
    finally:
        if forward_task is not None:
            forward_task.cancel()
            with suppress(asyncio.CancelledError):
                await forward_task
        if stream is not None and stream.is_running:
            stream.stop()


def run() -> None:
    """Entry point for `spellbook-server`."""
    import uvicorn

    uvicorn.run("spellbook.main:app", host="127.0.0.1", port=8000, reload=True)
