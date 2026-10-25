import type { Metadata } from "next";
import ArchiveLab from "./ArchiveLab";

export const metadata: Metadata = {
  title: "牌库交互实验｜伪日塔罗",
  description: "伪日塔罗横屏牌库交互实验，不影响现有牌库。",
};

export default function ArchiveLabPage() {
  return <ArchiveLab />;
}
