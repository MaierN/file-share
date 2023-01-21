import { useEffect, useState, ReactNode } from "react";
import { MdContentCopy, MdDone } from "react-icons/md";
import styles from "./CopyableField.module.css";
import { css, keyframes } from "@emotion/react";
import { Id } from "../../shared/types";

export default function CopyableField({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [animate, setAnimate] = useState(false);
  const [done, setDone] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const copyToClipboard = () => {
    setAnimate(true);
    setDone(true);
    navigator.clipboard.writeText(value);

    setTimeoutId(
      setTimeout(() => {
        setDone(false);
      }, 1000)
    );
  };

  const appear = keyframes`
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  `;

  const cssAppear = animate
    ? css`
        animation: ${appear} 0.5s ease;
      `
    : undefined;

  return (
    <div className={styles.field}>
      <div className={className}>{value}</div>
      {done ? (
        <MdDone
          className={`${styles.icon} ${styles.iconDone}`}
          css={cssAppear}
        />
      ) : (
        <MdContentCopy
          className={`${styles.icon} ${styles.iconCopy}`}
          onClick={copyToClipboard}
          css={cssAppear}
        />
      )}
    </div>
  );
}
