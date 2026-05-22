import type { PacketDto } from "../types";

interface Props {
  packets: PacketDto[];
}

export function PacketFeed({ packets }: Props) {
  if (packets.length === 0) {
    return <p className="empty">Packets will appear here once a capture starts.</p>;
  }

  return (
    <table className="packet-feed">
      <thead>
        <tr>
          <th>Time</th>
          <th>Proto</th>
          <th>Source</th>
          <th>Destination</th>
          <th>Bytes</th>
        </tr>
      </thead>
      <tbody>
        {packets.map((p, i) => (
          <tr key={`${p.timestamp}-${i}`}>
            <td>{new Date(p.timestamp * 1000).toLocaleTimeString()}</td>
            <td>{p.protocol}</td>
            <td>
              {p.src_ip}
              {p.src_port !== null ? `:${p.src_port}` : ""}
            </td>
            <td>
              {p.dst_ip}
              {p.dst_port !== null ? `:${p.dst_port}` : ""}
            </td>
            <td>{p.size}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
