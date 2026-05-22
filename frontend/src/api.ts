import type { AnalyzeResponse, InterfacesResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export async function getInterfaces(): Promise<InterfacesResponse> {
  const res = await fetch(`${API_BASE}/api/interfaces`);
  if (!res.ok) throw new Error(`GET /api/interfaces → ${res.status}`);
  return res.json();
}

export async function analyzePcap(file: File): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/analyze`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function captureSocketUrl(): string {
  return API_BASE.replace(/^http/, "ws") + "/ws/capture";
}
