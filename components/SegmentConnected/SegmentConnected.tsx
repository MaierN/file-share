import { useRef, ChangeEvent, useState, FormEvent } from "react";
import { MdSend } from "react-icons/md";
import FileDropZone from "../FileDropZone/FileDropZone";
import InputField from "../InputField/InputField";
import { useRtcContext } from "../RtcHandler/RtcHandler";
import ElementList from "./ElementList/ElementList";
import styles from "./SegmentConnected.module.css";

export default function SegmentConnected() {
  const { sendText, sendFile, elements } = useRtcContext();
  const [textInput, setTextInput] = useState("");

  function handleFile(file: File) {
    console.log("sending file", file);
    // TODO add file size limit
    sendFile(file);
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
          <FileDropZone onFile={handleFile} text={"send file..."} />
        </div>
        <div className={styles.subContainer}>
          <form onSubmit={handleSendMessage}>
            <InputField
              placeholder="...or send text"
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
