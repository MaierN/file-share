import { useRef, ChangeEvent, useState, FormEvent } from "react";
import { MdSend } from "react-icons/md";
import InputField from "../InputField/InputField";
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
        Share file:
        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        Share text:
        <form onSubmit={handleSendMessage}>
          <InputField
            placeholder="..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            Icon={MdSend}
          />
        </form>
      </div>
      <div>
        <ElementList elements={elements} />
      </div>
    </div>
  );
}
