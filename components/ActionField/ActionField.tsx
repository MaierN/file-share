import { useEffect, useState, ReactNode } from "react";
import styles from "./ActionField.module.css";
import { css, keyframes } from "@emotion/react";
import { IconType } from "react-icons/lib";

export default function ActionField({
  text,
  onAction,
  IconLegend,
  IconPassive,
  IconActive,
  disabled = false,
  className,
}: {
  text: string;
  onAction: () => void;
  IconLegend?: IconType;
  IconPassive: IconType;
  IconActive: IconType;
  disabled?: boolean;
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

  const handleClick = () => {
    if (disabled) return;

    setAnimate(true);
    setDone(true);
    onAction();

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
    <span className={styles.field}>
      {IconLegend === undefined ? null : (
        <div className={styles.legend}>
          <IconLegend className={styles.legendIcon} />
        </div>
      )}
      <div className={`${styles.text} ${className}`}>{text}</div>
      <div>
        {done ? (
          <IconActive
            className={`${styles.icon} ${styles.iconActive}`}
            css={cssAppear}
          />
        ) : (
          <IconPassive
            className={`${styles.icon} ${styles.iconPassive} ${
              disabled ? styles.disabled : ""
            }`}
            onClick={handleClick}
            css={cssAppear}
          />
        )}
      </div>
    </span>
  );
}
