import SegmentConnected from "../SegmentConnected/SegmentConnected";
import SegmentConnection from "../SegmentConnection/SegmentConnection";
import { useSocketContext } from "../SocketHandler";

export default function Index() {
  const { serverState } = useSocketContext();

  if (serverState.connectedTo === undefined) {
    return <SegmentConnection />;
  } else {
    return <SegmentConnected />;
  }
}
