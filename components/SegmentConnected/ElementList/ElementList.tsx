import CopyableField from "../../ActionField/CopyableField";
import { FileInfo, MessageInfo } from "../../RtcHandler/RtcHandler";
import styles from "./ElementList.module.css";
import { css, keyframes } from "@emotion/react";
import DownloadableField from "../../ActionField/DownloadableField";
import { MdDescription, MdEditNote } from "react-icons/md";

function FileElement({ fileInfo }: { fileInfo: FileInfo }) {
  return (
    <DownloadableField
      text={fileInfo.name}
      IconLegend={MdDescription}
      content={fileInfo.objectUrl!}
    />
  );
}

function MessageElement({ messageInfo }: { messageInfo: MessageInfo }) {
  return <CopyableField value={messageInfo.text} IconLegend={MdEditNote} />;
}

export default function ElementList({
  elements,
}: {
  elements: (FileInfo | MessageInfo)[];
}) {
  const animAppear = keyframes`
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  `;

  const cssAnim = css`
    animation: ${animAppear} 0.2s ease 0.1s both;
  `;

  return (
    <div className={styles.container}>
      {elements.map((element) => (
        <div key={element.id} className={styles.ghostElement}>
          {"text" in element ? (
            <MessageElement key={element.id} messageInfo={element} />
          ) : (
            <FileElement key={element.id} fileInfo={element} />
          )}
        </div>
      ))}
      {elements.map((element, idx) => (
        <div
          key={element.id}
          css={cssAnim}
          className={styles.element}
          style={{ transform: `translateY(${idx * 100}%)` }}
        >
          {"text" in element ? (
            <MessageElement key={element.id} messageInfo={element} />
          ) : (
            <FileElement key={element.id} fileInfo={element} />
          )}
        </div>
      ))}
    </div>
  );
}
