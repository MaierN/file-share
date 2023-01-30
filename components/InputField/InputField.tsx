import { InputHTMLAttributes } from "react";
import styles from "./InputField.module.css";
import { IconType } from "react-icons/lib";

export default function InputField({
  Icon,
  ...props
}: { Icon: IconType } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={styles.container}>
      <input className={styles.input} type="text" {...props} />
      <button className={styles.button} type="submit">
        <Icon />
      </button>
    </span>
  );
}
