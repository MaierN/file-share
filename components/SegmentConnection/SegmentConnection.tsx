import QRCode from "react-qr-code";
import CopyableField from "../CopyableField/CopyableField";
import styles from "./SegmentConnection.module.css";
import { useSocketContext } from "../SocketHandler";
import { MdLogin } from "react-icons/md";
import { FormEvent, useState } from "react";

export default function SegmentConnection() {
  const { selfId } = useSocketContext();
  const [otherId, setOtherId] = useState<string>("");
  const selfUrl = `${window.location.origin}/link/${selfId}`;

  function handleConnect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("ok");
  }

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.title}>Open this link on another device</div>
        <QRCode value={selfUrl} className={styles.qrcode} />
        <CopyableField value={selfUrl} className={styles.link} />
      </div>
      <div className={styles.separator} />
      <div className={styles.subContainer}>
        <div className={styles.title}>Or connect using a code</div>
        <form className={styles.connectForm} onSubmit={handleConnect}>
          <input
            className={styles.idInput}
            type="text"
            placeholder="other device's code"
            value={otherId}
            onChange={(e) => setOtherId(e.target.value)}
          />
          <button className={styles.connectButton} type="submit">
            <MdLogin />
          </button>
        </form>
        <div className={styles.subtitle}>This device&apos;s code:</div>
        <CopyableField value={selfId} />
      </div>
    </div>
  );
}
