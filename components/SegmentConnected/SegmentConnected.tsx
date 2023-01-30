import { useRef, ChangeEvent, useState, FormEvent } from "react";
import { MdSend } from "react-icons/md";
import InputField from "../InputField/InputField";
import { useRtcContext } from "../RtcHandler/RtcHandler";
import ElementList from "./ElementList/ElementList";
import styles from "./SegmentConnected.module.css";

export default function SegmentConnected() {
  const { sendText, sendFile, elements } = useRtcContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textInput, setTextInput] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    Array.from(e.target.files).forEach((file) => {
      console.log("sending file", file);
      sendFile(file);
    });

    e.target.value = "";
  }

  function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!textInput) return;
    sendText(textInput);
    setTextInput("");
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.subContainer}>
          send file{" "}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        </div>
        <div className={styles.subContainer}>
          <form onSubmit={handleSendMessage}>
            <InputField
              placeholder="send text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              Icon={MdSend}
            />
          </form>
        </div>
      </div>
      <div className={styles.separator} />
      <div>
        <ElementList elements={elements} />
      </div>
    </>
  );
}
