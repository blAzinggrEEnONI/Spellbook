import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatisticsDto } from "../types";

interface Props {
  stats: StatisticsDto | null;
}

export function TopTalkers({ stats }: Props) {
  const data = stats
    ? stats.top_talkers.slice(0, 10).map((t) => ({
        ip: t.ip_address,
        bytes: t.total_bytes,
        packets: t.total_packets,
      }))
    : [];

  if (data.length === 0) {
    return <p className="empty">No endpoint data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" stroke="#cbd5e1" />
        <YAxis type="category" dataKey="ip" stroke="#cbd5e1" width={120} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          formatter={(value) => `${Number(value).toLocaleString()} bytes`}
        />
        <Bar dataKey="bytes" fill="#4ade80" />
      </BarChart>
    </ResponsiveContainer>
  );
}
