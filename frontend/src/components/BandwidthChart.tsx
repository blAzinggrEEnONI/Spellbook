import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatisticsDto } from "../types";

interface Props {
  stats: StatisticsDto | null;
}

export function BandwidthChart({ stats }: Props) {
  const data = stats
    ? stats.bandwidth_samples.map((s) => ({
        t: new Date(s.timestamp * 1000).toLocaleTimeString(),
        bps: Math.round(s.bytes_per_second),
        pps: Math.round(s.packets_per_second),
      }))
    : [];

  if (data.length === 0) {
    return <p className="empty">No bandwidth samples yet — keep capturing.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="t" stroke="#cbd5e1" />
        <YAxis stroke="#cbd5e1" />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
        />
        <Line type="monotone" dataKey="bps" stroke="#4ade80" name="Bytes/s" dot={false} />
        <Line type="monotone" dataKey="pps" stroke="#60a5fa" name="Packets/s" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
