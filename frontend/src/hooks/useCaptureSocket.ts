import { useCallback, useEffect, useRef, useState } from "react";
import { captureSocketUrl } from "../api";
import type { PacketDto, StatisticsDto, WsEvent } from "../types";

interface StartOptions {
  interface?: string;
  filter?: string;
  snapshotInterval?: number;
  packetCount?: number;
  timeoutSeconds?: number;
}

interface UseCaptureSocketResult {
  connected: boolean;
  running: boolean;
  stats: StatisticsDto | null;
  recentPackets: PacketDto[];
  error: string | null;
  start: (opts: StartOptions) => void;
  stop: () => void;
}

const RECENT_PACKET_BUFFER = 50;

export function useCaptureSocket(): UseCaptureSocketResult {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [recentPackets, setRecentPackets] = useState<PacketDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(captureSocketUrl());
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => {
      setConnected(false);
      setRunning(false);
    };
    socket.onerror = () => setError("WebSocket connection failed");
    socket.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as WsEvent;
        if (event.type === "packet") {
          setRecentPackets((prev) =>
            [event.data, ...prev].slice(0, RECENT_PACKET_BUFFER),
          );
        } else if (event.type === "stats") {
          setStats(event.data);
        } else if (event.type === "final") {
          setStats(event.data);
          setRunning(false);
        } else if (event.type === "error") {
          setError(event.message);
        }
      } catch (e) {
        setError(`Bad WS payload: ${(e as Error).message}`);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const start = useCallback((opts: StartOptions) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    setError(null);
    setRecentPackets([]);
    setStats(null);
    setRunning(true);
    socket.send(
      JSON.stringify({
        action: "start",
        interface: opts.interface,
        filter: opts.filter,
        snapshot_interval: opts.snapshotInterval ?? 1.0,
        packet_count: opts.packetCount,
        timeout_seconds: opts.timeoutSeconds,
      }),
    );
  }, []);

  const stop = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ action: "stop" }));
  }, []);

  return { connected, running, stats, recentPackets, error, start, stop };
}
