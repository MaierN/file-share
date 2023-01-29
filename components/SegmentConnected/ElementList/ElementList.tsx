import { FileInfo, MessageInfo } from "../../RtcHandler/RtcHandler";

function FileElement({ fileInfo }: { fileInfo: FileInfo }) {
  return (
    <div>
      <div>File name: {fileInfo.name}</div>
      <div>File size: {fileInfo.size}</div>
      <div>Received: {fileInfo.received}</div>
      {fileInfo.objectUrl && (
        <a href={fileInfo.objectUrl} download={fileInfo.name}>
          Download
        </a>
      )}
    </div>
  );
}

function MessageElement({ messageInfo }: { messageInfo: MessageInfo }) {
  return <div>{messageInfo.text}</div>;
}

export default function ElementList({
  elements,
}: {
  elements: (FileInfo | MessageInfo)[];
}) {
  return (
    <div>
      {elements.map((element) => {
        if ("text" in element) {
          return <MessageElement key={element.id} messageInfo={element} />;
        } else {
          return <FileElement key={element.id} fileInfo={element} />;
        }
      })}
    </div>
  );
}
