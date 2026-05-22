import { useState } from "react";
import "./App.css";
import { BandwidthChart } from "./components/BandwidthChart";
import { CaptureControls } from "./components/CaptureControls";
import { PacketFeed } from "./components/PacketFeed";
import { PcapUpload } from "./components/PcapUpload";
import { ProtocolPie } from "./components/ProtocolPie";
import { TopTalkers } from "./components/TopTalkers";
import { useCaptureSocket } from "./hooks/useCaptureSocket";
import type { AnalyzeResponse, StatisticsDto } from "./types";

type Mode = "live" | "pcap";

export default function App() {
  const [mode, setMode] = useState<Mode>("live");
  const [pcapResult, setPcapResult] = useState<AnalyzeResponse | null>(null);
  const capture = useCaptureSocket();

  const stats: StatisticsDto | null =
    mode === "live" ? capture.stats : pcapResult?.statistics ?? null;

  return (
    <div className="app">
      <header>
        <h1>📖 Spellbook</h1>
        <p className="subtitle">Live dashboard for netanal — packets, protocols, talkers.</p>
      </header>

      <nav className="mode-switch">
        <button
          className={mode === "live" ? "active" : ""}
          onClick={() => setMode("live")}
        >
          Live capture
        </button>
        <button
          className={mode === "pcap" ? "active" : ""}
          onClick={() => setMode("pcap")}
        >
          Analyze pcap
        </button>
      </nav>

      <section className="controls">
        {mode === "live" ? (
          <CaptureControls
            connected={capture.connected}
            running={capture.running}
            onStart={(opts) =>
              capture.start({ interface: opts.interface, filter: opts.filter })
            }
            onStop={capture.stop}
          />
        ) : (
          <PcapUpload onResult={setPcapResult} />
        )}
        {capture.error && mode === "live" && (
          <p className="error">⚠️ {capture.error}</p>
        )}
      </section>

      <section className="summary">
        <SummaryCard label="Packets" value={stats?.total_packets ?? 0} />
        <SummaryCard label="Bytes" value={stats?.total_bytes ?? 0} />
        <SummaryCard
          label="Duration (s)"
          value={(stats?.duration_seconds ?? 0).toFixed(1)}
        />
        <SummaryCard
          label="Avg B/s"
          value={Math.round(stats?.average_bandwidth ?? 0)}
        />
      </section>

      <section className="grid">
        <Panel title="Protocol distribution">
          <ProtocolPie stats={stats} />
        </Panel>
        <Panel title="Top talkers">
          <TopTalkers stats={stats} />
        </Panel>
        <Panel title="Bandwidth over time" wide>
          <BandwidthChart stats={stats} />
        </Panel>
        {mode === "live" && (
          <Panel title="Recent packets" wide>
            <PacketFeed packets={capture.recentPackets} />
          </Panel>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="summary-card">
      <div className="summary-label">{label}</div>
      <div className="summary-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`panel ${wide ? "wide" : ""}`}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
