import { useState } from "react";
import { analyzePcap } from "../api";
import type { AnalyzeResponse } from "../types";

interface Props {
  onResult: (result: AnalyzeResponse) => void;
}

export function PcapUpload({ onResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePcap(file);
      onResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="upload">
      <label className="upload-button">
        {loading ? "Analyzing…" : "Upload pcap"}
        <input
          type="file"
          accept=".pcap,.pcapng"
          onChange={handleFile}
          disabled={loading}
          hidden
        />
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
