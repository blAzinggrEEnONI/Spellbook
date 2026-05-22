import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatisticsDto } from "../types";

const COLORS: Record<string, string> = {
  TCP: "#4ade80",
  UDP: "#60a5fa",
  ICMP: "#f59e0b",
  DNS: "#a78bfa",
  HTTP: "#fb7185",
  HTTPS: "#22d3ee",
  ARP: "#facc15",
  OTHER: "#94a3b8",
};

interface Props {
  stats: StatisticsDto | null;
}

export function ProtocolPie({ stats }: Props) {
  const data = stats
    ? Object.entries(stats.protocol_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (data.length === 0) {
    return <p className="empty">No protocol data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
