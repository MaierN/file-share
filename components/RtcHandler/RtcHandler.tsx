import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import useEffectOnce from "../../hooks/useEffectOnce";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import { flushSync } from "react-dom";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

const RtcContext = createContext<
  | {
      send: (message: string) => void;
      lastMessage: string;
    }
  | undefined
>(undefined);

function useRtcContext() {
  const context = useContext(RtcContext);
  if (context === undefined) {
    throw new Error("no RtcContext.Provider found");
  }
  return context;
}

function RtcHandler({ children }: { children: ReactNode }) {
  const { serverState, socket } = useSocketContext();
  const connectedTo = serverState.connectedTo!;
  const dataChannel = useRef<RTCDataChannel>();
  const [lastMessage, _setLastMessage] = useState("");

  const setLastMessage = useCallback(
    (arg: Parameters<typeof _setLastMessage>[0]) => {
      flushSync(() => {
        _setLastMessage(arg);
      });
    },
    []
  );

  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.stunprotocol.org:3478" },
      ],
    })
  );

  useEffectOnce(() => {
    function handleMessage(message: string) {
      console.log("received message:", message);
      setLastMessage(message);
    }

    peerConnection.current.onicecandidate = (e) => {
      socket.emit("rtcIceCandidate", JSON.stringify(e.candidate));
    };

    peerConnection.current.ondatachannel = (e) => {
      dataChannel.current = e.channel;
      console.log(`data channel ${dataChannel.current.label} received`);
      dataChannel.current.onmessage = (e) => handleMessage(e.data);
      dataChannel.current.onerror = (e) =>
        console.error("dataChannel error:", e);
    };

    if (connectedTo.isMaster) {
      const channel = peerConnection.current.createDataChannel("channel");
      channel.onopen = () => {
        console.log(`data ${channel.label} channel opened`);
        dataChannel.current = channel;
      };
      channel.onmessage = (e) => handleMessage(e.data);
      channel.onerror = (e) => console.error("dataChannel error:", e);

      peerConnection.current.createOffer().then((description) => {
        peerConnection.current.setLocalDescription(description).then(() => {
          socket.emit("rtcDescription", JSON.stringify(description));

          console.log("master sent local description:", description);
        });
      });
    }
  });

  useEffect(() => {
    if (connectedTo.otherRtcDescription === undefined) return;

    console.log("setting remote description:", connectedTo.otherRtcDescription);

    peerConnection.current
      .setRemoteDescription(JSON.parse(connectedTo.otherRtcDescription))
      .then(() => {
        if (connectedTo.isMaster) return;

        peerConnection.current.createAnswer().then((answer) => {
          peerConnection.current.setLocalDescription(answer).then(() => {
            socket.emit("rtcDescription", JSON.stringify(answer));

            console.log("slave sent local description:", answer);
          });
        });
      });
  }, [connectedTo.isMaster, connectedTo.otherRtcDescription, socket]);

  useEffect(() => {
    if (connectedTo.otherLastIceCandidate === undefined) return;

    peerConnection.current.addIceCandidate(
      JSON.parse(connectedTo.otherLastIceCandidate)
    );
    console.log("added ice candidate:", connectedTo.otherLastIceCandidate);
  }, [connectedTo.otherLastIceCandidate]);

  const send = useCallback((message: string) => {
    dataChannel.current!.send(message);
  }, []);

  if (dataChannel.current === undefined) {
    return <LoadingIndicator />;
  }

  return (
    <RtcContext.Provider value={{ send, lastMessage }}>
      {children}
    </RtcContext.Provider>
  );
}

export { useRtcContext, RtcHandler };
