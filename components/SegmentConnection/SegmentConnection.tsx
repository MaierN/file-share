import QRCode from "react-qr-code";
import CopyableField from "../ActionField/CopyableField";
import styles from "./SegmentConnection.module.css";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import { MdLogin } from "react-icons/md";
import { FormEvent, useState } from "react";
import InputField from "../InputField/InputField";

export default function SegmentConnection() {
  const { serverState, socket } = useSocketContext();
  const [otherId, setOtherId] = useState("");
  const selfUrl = `${window.location.origin}${window.location.pathname}?code=${serverState.id}`;

  function handleConnect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    socket.emit("connectTo", otherId);
  }

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.title}>Open this link on another device</div>
        <div className={styles.qrcodeContainer}>
          <QRCode value={selfUrl} className={styles.qrcode} />
        </div>
        <CopyableField value={selfUrl} className={styles.link} />
      </div>
      <div className={styles.separator} />
      <div className={styles.subContainer}>
        <div className={styles.title}>Or connect using a code</div>
        <form className={styles.connectForm} onSubmit={handleConnect}>
          <InputField
            placeholder="other device's code"
            value={otherId}
            onChange={(e) => setOtherId(e.target.value.toUpperCase())}
            Icon={MdLogin}
            autoFocus
          />
        </form>
        <div className={styles.subtitle}>This device&apos;s code:</div>
        <CopyableField value={serverState.id} />
      </div>
    </div>
  );
}
