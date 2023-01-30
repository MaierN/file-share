import { IconType } from "react-icons/lib";
import { MdContentCopy, MdDone } from "react-icons/md";
import ActionField from "./ActionField";

export default function CopyableField({
  value,
  IconLegend,
  className,
}: {
  value: string;
  IconLegend?: IconType;
  className?: string;
}) {
  return (
    <ActionField
      text={value}
      onAction={() => navigator.clipboard.writeText(value)}
      IconLegend={IconLegend}
      IconPassive={MdContentCopy}
      IconActive={MdDone}
      className={className}
    />
  );
}
