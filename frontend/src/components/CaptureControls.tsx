import { useEffect, useState } from "react";
import { getInterfaces } from "../api";

interface Props {
  connected: boolean;
  running: boolean;
  onStart: (opts: { interface?: string; filter?: string }) => void;
  onStop: () => void;
}

export function CaptureControls({ connected, running, onStart, onStop }: Props) {
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [canCapture, setCanCapture] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getInterfaces()
      .then((res) => {
        setInterfaces(res.interfaces);
        setCanCapture(res.can_capture);
        setPermissionMessage(res.permission_message);
        if (res.interfaces.length > 0) setSelected(res.interfaces[0]);
      })
      .catch((err) => setPermissionMessage(`Failed to load interfaces: ${err.message}`));
  }, []);

  return (
    <div className="capture-controls">
      <label>
        Interface
        <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={running}>
          {interfaces.map((iface) => (
            <option key={iface} value={iface}>
              {iface}
            </option>
          ))}
        </select>
      </label>
      <label>
        BPF filter
        <input
          type="text"
          placeholder="e.g. tcp port 80"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={running}
        />
      </label>
      {running ? (
        <button onClick={onStop}>Stop capture</button>
      ) : (
        <button
          onClick={() => onStart({ interface: selected || undefined, filter: filter || undefined })}
          disabled={!connected || !canCapture}
        >
          Start capture
        </button>
      )}
      <span className={`status-dot ${connected ? "ok" : "bad"}`} title={connected ? "Connected" : "Disconnected"} />
      {!canCapture && permissionMessage && (
        <p className="warn">{permissionMessage}</p>
      )}
    </div>
  );
}
