export type Protocol =
  | "TCP"
  | "UDP"
  | "ICMP"
  | "DNS"
  | "HTTP"
  | "HTTPS"
  | "ARP"
  | "OTHER";

export interface PacketDto {
  timestamp: number;
  src_ip: string;
  dst_ip: string;
  protocol: Protocol;
  size: number;
  src_port: number | null;
  dst_port: number | null;
  src_mac: string | null;
  dst_mac: string | null;
}

export interface EndpointDto {
  ip_address: string;
  packets_sent: number;
  packets_received: number;
  bytes_sent: number;
  bytes_received: number;
  total_packets: number;
  total_bytes: number;
}

export interface BandwidthSampleDto {
  timestamp: number;
  bytes_per_second: number;
  packets_per_second: number;
}

export interface StatisticsDto {
  start_time: number;
  end_time: number;
  duration_seconds: number;
  total_packets: number;
  total_bytes: number;
  average_bandwidth: number;
  protocol_distribution: Record<string, number>;
  protocol_bytes: Record<string, number>;
  protocol_percentages: Record<string, number>;
  top_talkers: EndpointDto[];
  conversations: { endpoint_a: string; endpoint_b: string; packets: number; bytes_total: number }[];
  bandwidth_samples: BandwidthSampleDto[];
}

export interface AnalyzeResponse {
  filename: string;
  packet_count: number;
  statistics: StatisticsDto;
}

export type WsEvent =
  | { type: "packet"; data: PacketDto }
  | { type: "stats"; data: StatisticsDto }
  | { type: "final"; data: StatisticsDto }
  | { type: "error"; message: string };

export interface InterfacesResponse {
  interfaces: string[];
  can_capture: boolean;
  permission_message: string;
}
