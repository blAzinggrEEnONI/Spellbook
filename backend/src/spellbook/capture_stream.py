"""
Bridges netanal's threaded CaptureEngine into an asyncio-friendly stream.

CaptureEngine fires its on_packet callback from a worker thread. The WebSocket
endpoint needs to consume those packets from the event loop, so we hand them
across the thread boundary via asyncio.Queue with call_soon_threadsafe.
"""

from __future__ import annotations

import asyncio
from typing import Any

from netanal.capture import CaptureEngine
from netanal.models import CaptureConfig, PacketInfo

from .serializers import packet_to_dict, statistics_to_dict


class CaptureStream:
    """Wraps CaptureEngine and exposes packet + snapshot events to async consumers."""

    def __init__(self, config: CaptureConfig) -> None:
        self._config = config
        self._loop = asyncio.get_running_loop()
        self._queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=1024)
        self._engine = CaptureEngine(config=config, on_packet=self._on_packet)
        self._snapshot_task: asyncio.Task[None] | None = None

    def _on_packet(self, packet: PacketInfo) -> None:
        # Runs on the netanal worker thread; hop back to the loop.
        event = {"type": "packet", "data": packet_to_dict(packet)}
        self._loop.call_soon_threadsafe(self._safe_put, event)

    def _safe_put(self, event: dict[str, Any]) -> None:
        if self._queue.full():
            # Drop oldest to keep the stream responsive under load.
            try:
                self._queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
        self._queue.put_nowait(event)

    async def _snapshot_loop(self, interval_seconds: float) -> None:
        while True:
            await asyncio.sleep(interval_seconds)
            snapshot = {
                "type": "stats",
                "data": statistics_to_dict(self._engine.statistics),
            }
            await self._queue.put(snapshot)

    def start(self, snapshot_interval_seconds: float = 1.0) -> None:
        self._engine.start()
        self._snapshot_task = self._loop.create_task(
            self._snapshot_loop(snapshot_interval_seconds)
        )

    def stop(self) -> dict[str, Any]:
        if self._snapshot_task is not None:
            self._snapshot_task.cancel()
            self._snapshot_task = None
        final_stats = self._engine.stop()
        return {"type": "final", "data": statistics_to_dict(final_stats)}

    async def events(self) -> Any:
        while True:
            yield await self._queue.get()

    @property
    def is_running(self) -> bool:
        return self._engine.is_running
