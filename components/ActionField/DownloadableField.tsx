import { IconType } from "react-icons/lib";
import { MdDownload, MdDone } from "react-icons/md";
import ActionField from "./ActionField";

export default function DownloadableField({
  text,
  content,
  IconLegend,
  className,
}: {
  text: string;
  content: string;
  IconLegend?: IconType;
  className?: string;
}) {
  function download() {
    const element = document.createElement("a");
    element.href = content;
    element.download = text;
    document.body.appendChild(element);
    element.click();
  }

  return (
    <ActionField
      text={text}
      onAction={download}
      IconLegend={IconLegend}
      IconPassive={MdDownload}
      IconActive={MdDone}
      className={className}
    />
  );
}
