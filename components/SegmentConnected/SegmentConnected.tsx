import { useSocketContext } from "../SocketHandler";

export default function SegmentConnected() {
  const { serverState } = useSocketContext();
  const connectedTo = serverState.connectedTo!;
  return (
    <div>
      This device&apos;s code: {serverState.id}, Other device&apos;s code:{" "}
      {connectedTo.otherId}
    </div>
  );
}
