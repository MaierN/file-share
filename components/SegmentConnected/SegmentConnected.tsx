import { useEffect, useRef } from "react";
import useEffectOnce from "../../hooks/useEffectOnce";
import { useSocketContext } from "../SocketHandler";

export default function SegmentConnected() {
  const { serverState, socket } = useSocketContext();
  const connectedTo = serverState.connectedTo!;

  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.stunprotocol.org:3478" },
      ],
    })
  );

  useEffectOnce(() => {
    peerConnection.current.onicecandidate = (e) => {
      socket.emit("rtcIceCandidate", JSON.stringify(e.candidate));
    };

    peerConnection.current.ondatachannel = (e) => {
      const dataChannel = e.channel;
      console.log(`data channel ${dataChannel.label} received`);
      dataChannel.onmessage = (e) => {
        console.log("received message:", e.data);
      };

      dataChannel.send("bonjour du slave");
    };

    if (connectedTo.isMaster) {
      const testDataChannel =
        peerConnection.current.createDataChannel("testDataChannel");
      testDataChannel.onopen = () => {
        console.log(`data ${testDataChannel.label} channel opened`);
      };
      testDataChannel.onmessage = (e) => {
        console.log("received message:", e.data);

        testDataChannel.send("bonjour du master");
      };

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

  return (
    <div>
      This device&apos;s code: {serverState.id}, Other device&apos;s code:{" "}
      {connectedTo.otherId}
    </div>
  );
}
