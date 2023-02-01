import { RtcHandler } from "../RtcHandler/RtcHandler";
import SegmentConnected from "../SegmentConnected/SegmentConnected";
import SegmentConnection from "../SegmentConnection/SegmentConnection";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import styles from "./Index.module.css";
import { Poppins } from "@next/font/google";
import { SocketHandler } from "../SocketHandler/SocketHandler";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });

function SubPage() {
  const router = useRouter();
  const sentRef = useRef(false);
  const { serverState, socket } = useSocketContext();

  useEffect(() => {
    if (typeof router.query.code === "string" && !sentRef.current) {
      sentRef.current = true;
      socket.emit("connectTo", router.query.code);
    }
  }, [router.query, socket]);

  return serverState.connectedTo === undefined ? (
    typeof router.query.code === "string" ? (
      <LoadingIndicator />
    ) : (
      <SegmentConnection />
    )
  ) : (
    <RtcHandler>
      <SegmentConnected />
    </RtcHandler>
  );
}

export default function Index() {
  return (
    <main className={`${styles.main} ${poppins.className}`}>
      <SocketHandler>
        <SubPage />
      </SocketHandler>
    </main>
  );
}
