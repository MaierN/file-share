import { useRef, ChangeEvent, useState, FormEvent } from "react";
import { MdLogin } from "react-icons/md";
import { useRtcContext } from "../RtcHandler/RtcHandler";
import { useSocketContext } from "../SocketHandler/SocketHandler";
import ElementList from "./ElementList/ElementList";

export default function SegmentConnected() {
  const { serverState } = useSocketContext();
  const connectedTo = serverState.connectedTo!;
  const { sendText, sendFile, elements } = useRtcContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textInput, setTextInput] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    console.log(e, e.target.files);
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
    <div>
      <div>
        This device&apos;s code: {serverState.id}, Other device&apos;s code:{" "}
        {connectedTo.otherId}, {elements.length}
      </div>
      <div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="other device's code"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button type="submit">
            <MdLogin />
          </button>
        </form>
      </div>
      <div>
        <ElementList elements={elements} />
      </div>
    </div>
  );
}
