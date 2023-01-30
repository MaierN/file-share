import { RtcHandler } from "../RtcHandler/RtcHandler";
import SegmentConnected from "../SegmentConnected/SegmentConnected";
import SegmentConnection from "../SegmentConnection/SegmentConnection";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import styles from "./Index.module.css";
import { Poppins } from "@next/font/google";
import { SocketHandler } from "../SocketHandler/SocketHandler";
import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });

function SubPage({ link = false }: { link?: boolean }) {
  const router = useRouter();
  const { serverState, socket } = useSocketContext();

  useEffect(() => {
    if (link && typeof router.query.id === "string") {
      socket.emit("connectTo", router.query.id);
    }
  }, [link, socket, router.query]);

  return serverState.connectedTo === undefined ? (
    link ? (
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

export default function Index({ link = false }: { link?: boolean }) {
  return (
    <main className={`${styles.main} ${poppins.className}`}>
      <SocketHandler>
        <SubPage link={link} />
      </SocketHandler>
    </main>
  );
}
