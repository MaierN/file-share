import CopyableField from "../../ActionField/CopyableField";
import { FileInfo, MessageInfo } from "../../RtcHandler/RtcHandler";
import styles from "./ElementList.module.css";
import { css, keyframes } from "@emotion/react";
import DownloadableField from "../../ActionField/DownloadableField";
import { MdDescription, MdEditNote } from "react-icons/md";

function FileElement({ fileInfo }: { fileInfo: FileInfo }) {
  let text = fileInfo.name;
  if (fileInfo.received < fileInfo.size) {
    text = `(${Math.round(
      (fileInfo.received / fileInfo.size) * 100
    )}%) ${text}`;
  }

  return (
    <DownloadableField
      text={text}
      IconLegend={MdDescription}
      content={fileInfo.objectUrl}
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
  const animOpen = keyframes`
    from {
      max-height: 0px;
    }

    to {
      max-height: 2.7rem;
    }
  `;

  const animAppear = keyframes`
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  `;

  const cssAnim = css`
    animation: ${animOpen} 0.2s ease both, ${animAppear} 0.2s ease 0.2s both;
  `;

  return (
    <div className={styles.container}>
      {elements.length ? (
        elements.map((element, idx) => (
          <div key={element.id} css={cssAnim} className={styles.element}>
            {"text" in element ? (
              <MessageElement key={element.id} messageInfo={element} />
            ) : (
              <FileElement key={element.id} fileInfo={element} />
            )}
          </div>
        ))
      ) : (
        <div className={styles.empty}>No files/messages yet</div>
      )}
    </div>
  );
}
