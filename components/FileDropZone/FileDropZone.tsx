import { DragEvent, useRef, useState } from "react";
import styles from "./FileDropZone.module.css";

export default function FileDropZone({
  onFile,
  text,
}: {
  onFile: (e: File) => void;
  text: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange() {
    if (!inputRef.current?.files) return;
    Array.from(inputRef.current.files).forEach(onFile);
    inputRef.current.value = "";
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    console.log("file dropped");
    e.preventDefault();

    if (e.dataTransfer.items) {
      [...e.dataTransfer.items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) onFile(file);
        }
      });
    } else {
      [...e.dataTransfer.files].forEach(onFile);
    }

    setIsDragging(false);
  }

  return (
    <label
      htmlFor="FileDropZone-fileInput"
      className={`${styles.fileLabel} ${
        isDragging ? styles.fileLabelDragging : ""
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div>{text}</div>
      <div className={styles.legend}>(click or drop file)</div>
      <input
        id="FileDropZone-fileInput"
        className={styles.fileInput}
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
      />
    </label>
  );
}
