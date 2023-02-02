import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import useEffectOnce from "../../hooks/useEffectOnce";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

type MessageInfo = {
  id: string;
  timeAdded: number;
  text: string;
};

type ControlMessage = {
  type: string;
  data?: MessageInfo;
};

type FileInfo = {
  id: string;
  name: string;
  size: number;
  timeAdded: number;
  received: number;
  arrayBuffers: ArrayBuffer[];
  objectUrl?: string;
};

type FileChannel = RTCDataChannel & { fileInfo: FileInfo };

const RtcContext = createContext<
  | {
      sendText: (text: string) => void;
      sendFile: (file: File) => void;
      elements: (FileInfo | MessageInfo)[];
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
  const [controlChannel, setControlChannel] = useState<RTCDataChannel>();
  const [ready, setReady] = useState(false);
  const [sendingChannels, setSendingChannels] = useState<{
    [key: string]: FileChannel;
  }>({});
  const [receivingChannels, setReceivingChannels] = useState<{
    [key: string]: FileChannel;
  }>({});
  const [textMessages, setTextMessages] = useState<MessageInfo[]>([]);
  const messageCountRef = useRef(connectedTo.isMaster ? 0 : 1);

  const peerConnection = useRef<RTCPeerConnection | undefined>(undefined);

  useEffectOnce(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:relay.metered.ca:80" },
        {
          urls: "turn:relay.metered.ca:80",
          username: "8abe596f7037054963790fd7",
          credential: "kWTnzEsD2UHkG+Wm",
        },
        {
          urls: "turn:relay.metered.ca:443",
          username: "8abe596f7037054963790fd7",
          credential: "kWTnzEsD2UHkG+Wm",
        },
        {
          urls: "turn:relay.metered.ca:443?transport=tcp",
          username: "8abe596f7037054963790fd7",
          credential: "kWTnzEsD2UHkG+Wm",
        },
      ],
    });
  });

  useEffectOnce(() => {
    function handleControlMessage(message: ControlMessage) {
      const actions: { [key: string]: any } = {
        ready: () => setReady(true),
        text: (data: MessageInfo) => {
          console.log("received text:", data);
          setTextMessages((prev) => [...prev, data]);
        },
      };

      if (actions.hasOwnProperty(message.type)) {
        actions[message.type](message.data);
      } else {
        console.log("unknown control message type:", message);
      }
    }

    function handleControlChannel(channel: RTCDataChannel) {
      channel.onopen = () => {
        console.log(`control channel ${channel.id} ${channel.label} open`);
        setControlChannel(channel);
        channel.send(JSON.stringify({ type: "ready" }));
      };
      channel.onmessage = (e) => handleControlMessage(JSON.parse(e.data));
      channel.onerror = (e) => console.log("control channel error:", e);
    }

    function handleFileMessage(channel: FileChannel, message: any) {
      if (typeof message === "string") {
        channel.fileInfo = JSON.parse(message);
        console.log("file info:", channel.fileInfo);
        setReceivingChannels((prev) => ({
          ...prev,
          [channel.label]: channel,
        }));
      } else {
        const fileInfo = channel.fileInfo;
        fileInfo.arrayBuffers!.push(message);
        fileInfo.received += message.byteLength;

        if (fileInfo.received === fileInfo.size) {
          console.log("file received:", fileInfo);
          const blob = new Blob(fileInfo.arrayBuffers);
          fileInfo.objectUrl = URL.createObjectURL(blob);

          channel.close();
        }

        setReceivingChannels((prev) => ({
          ...prev,
          [channel.label]: channel,
        }));
      }
    }

    function handleFileChannel(channel: RTCDataChannel) {
      channel.binaryType = "arraybuffer";
      channel.onopen = () => {
        console.log(`file dataChannel ${channel.id} ${channel.label} open`);
      };
      channel.onmessage = (e) =>
        handleFileMessage(channel as FileChannel, e.data);
      channel.onerror = (e) => console.log("file channel error:", e);
    }

    peerConnection.current!.onicecandidate = (e) => {
      socket.emit("rtcIceCandidate", JSON.stringify(e.candidate));
    };

    peerConnection.current!.ondatachannel = (e) => {
      if (e.channel.label === "control") {
        handleControlChannel(e.channel);
      } else {
        handleFileChannel(e.channel);
      }
    };

    if (connectedTo.isMaster) {
      const controlChannel =
        peerConnection.current!.createDataChannel("control");

      handleControlChannel(controlChannel);

      peerConnection.current!.createOffer().then((description) => {
        peerConnection.current!.setLocalDescription(description).then(() => {
          socket.emit("rtcDescription", JSON.stringify(description));

          console.log("master sent local description:", description);
        });
      });
    }
  });

  useEffect(() => {
    if (connectedTo.otherRtcDescription === undefined) return;

    console.log("setting remote description:", connectedTo.otherRtcDescription);

    peerConnection
      .current!.setRemoteDescription(
        JSON.parse(connectedTo.otherRtcDescription)
      )
      .then(() => {
        if (connectedTo.isMaster) return;

        peerConnection.current!.createAnswer().then((answer) => {
          peerConnection.current!.setLocalDescription(answer).then(() => {
            socket.emit("rtcDescription", JSON.stringify(answer));

            console.log("slave sent local description:", answer);
          });
        });
      });
  }, [connectedTo.isMaster, connectedTo.otherRtcDescription, socket]);

  useEffect(() => {
    if (connectedTo.otherLastIceCandidate === undefined) return;

    peerConnection.current!.addIceCandidate(
      JSON.parse(connectedTo.otherLastIceCandidate)
    );
    console.log("added ice candidate:", connectedTo.otherLastIceCandidate);
  }, [connectedTo.otherLastIceCandidate]);

  const sendText = useCallback(
    (text: string) => {
      const message = {
        type: "text",
        data: {
          id: "text-" + messageCountRef.current,
          timeAdded: Date.now(),
          text,
        },
      };
      controlChannel!.send(JSON.stringify(message));
      setTextMessages((prev) => [...prev, message.data]);
      messageCountRef.current += 2;
    },
    [controlChannel]
  );

  const sendFile = useCallback((file: File) => {
    const channel = peerConnection.current!.createDataChannel(
      "file-" + messageCountRef.current
    ) as FileChannel;
    messageCountRef.current += 2;
    channel.binaryType = "arraybuffer";

    channel.onopen = async () => {
      channel.fileInfo = {
        id: channel.label,
        name: file.name,
        size: file.size,
        timeAdded: Date.now(),
        arrayBuffers: [],
        received: 0,
      };
      channel.send(JSON.stringify(channel.fileInfo));

      setSendingChannels((prev) => ({
        ...prev,
        [channel.label]: channel,
      }));

      const CHUNK_SIZE = 16384;

      const fileData: ArrayBuffer[] = [];
      const fileDataReady: Promise<void>[] = [];
      for (let i = 0; i < file.size; i += CHUNK_SIZE) {
        const idx = fileData.length;
        fileData.push(new ArrayBuffer(0));
        fileDataReady.push(
          new Promise<void>(async (resolve) => {
            fileData[idx] = await file.slice(i, i + CHUNK_SIZE).arrayBuffer();

            channel.fileInfo.received += fileData[idx].byteLength;
            setSendingChannels((prev) => ({
              ...prev,
              [channel.label]: channel,
            }));

            resolve();
          })
        );
        if (fileDataReady.length >= 20) {
          await Promise.all(fileDataReady);
          fileDataReady.length = 0;
        }
      }
      await Promise.all(fileDataReady);
      console.log("ended reading");

      channel.fileInfo.received = file.size;
      const blob = new Blob(fileData);
      channel.fileInfo.objectUrl = URL.createObjectURL(blob);

      setSendingChannels((prev) => ({
        ...prev,
        [channel.label]: channel,
      }));

      let bufferedAmountLow;
      for (let i = 0; i < fileData.length; i++) {
        if (i !== 0) {
          await bufferedAmountLow;
        }
        channel.send(fileData[i]);

        bufferedAmountLow = new Promise<void>((resolve) => {
          const listener = () => {
            channel.removeEventListener("bufferedamountlow", listener);
            resolve();
          };
          channel.addEventListener("bufferedamountlow", listener);
        });
      }
      console.log("ended sending");
    };
  }, []);

  const elements = useMemo(
    () =>
      ([] as (MessageInfo | FileInfo)[])
        .concat(
          textMessages,
          Object.values(receivingChannels).map((channel) => channel.fileInfo),
          Object.values(sendingChannels).map((channel) => channel.fileInfo)
        )
        .sort((a, b) => b.timeAdded - a.timeAdded),
    [receivingChannels, sendingChannels, textMessages]
  );

  if (!ready) return <LoadingIndicator />;

  return (
    <RtcContext.Provider
      value={{
        sendText,
        sendFile,
        elements,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
}

export type { MessageInfo, FileInfo };
export { useRtcContext, RtcHandler };
