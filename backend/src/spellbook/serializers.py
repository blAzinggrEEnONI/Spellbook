"""
Serializers — convert netanal dataclasses into JSON-friendly dicts.

netanal exposes frozen dataclasses with tuple-keyed dicts (conversations) and
StrEnum protocols, which json.dumps cannot handle directly. These helpers
flatten everything to plain primitives that the React frontend can consume.
"""

from __future__ import annotations

from typing import Any

from netanal.models import (
    BandwidthSample,
    CaptureStatistics,
    ConversationStats,
    EndpointStats,
    PacketInfo,
)


def packet_to_dict(packet: PacketInfo) -> dict[str, Any]:
    return {
        "timestamp": packet.timestamp,
        "src_ip": packet.src_ip,
        "dst_ip": packet.dst_ip,
        "protocol": str(packet.protocol),
        "size": packet.size,
        "src_port": packet.src_port,
        "dst_port": packet.dst_port,
        "src_mac": packet.src_mac,
        "dst_mac": packet.dst_mac,
    }


def endpoint_to_dict(endpoint: EndpointStats) -> dict[str, Any]:
    return {
        "ip_address": endpoint.ip_address,
        "packets_sent": endpoint.packets_sent,
        "packets_received": endpoint.packets_received,
        "bytes_sent": endpoint.bytes_sent,
        "bytes_received": endpoint.bytes_received,
        "total_packets": endpoint.total_packets,
        "total_bytes": endpoint.total_bytes,
    }


def conversation_to_dict(conv: ConversationStats) -> dict[str, Any]:
    return {
        "endpoint_a": conv.endpoint_a,
        "endpoint_b": conv.endpoint_b,
        "packets": conv.packets,
        "bytes_total": conv.bytes_total,
    }


def bandwidth_sample_to_dict(sample: BandwidthSample) -> dict[str, Any]:
    return {
        "timestamp": sample.timestamp,
        "bytes_per_second": sample.bytes_per_second,
        "packets_per_second": sample.packets_per_second,
    }


def statistics_to_dict(stats: CaptureStatistics, top_n: int = 10) -> dict[str, Any]:
    return {
        "start_time": stats.start_time,
        "end_time": stats.end_time,
        "duration_seconds": stats.duration_seconds,
        "total_packets": stats.total_packets,
        "total_bytes": stats.total_bytes,
        "average_bandwidth": stats.average_bandwidth,
        "protocol_distribution": {
            str(proto): count for proto, count in stats.protocol_distribution.items()
        },
        "protocol_bytes": {
            str(proto): byte_count for proto, byte_count in stats.protocol_bytes.items()
        },
        "protocol_percentages": {
            str(proto): pct for proto, pct in stats.get_protocol_percentages().items()
        },
        "top_talkers": [endpoint_to_dict(e) for e in stats.get_top_talkers(top_n)],
        "conversations": [
            conversation_to_dict(c) for c in stats.conversations.values()
        ],
        "bandwidth_samples": [
            bandwidth_sample_to_dict(s) for s in stats.bandwidth_samples
        ],
    }
