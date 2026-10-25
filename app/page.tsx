import type { Metadata } from "next";
import TarotSite from "./TarotSite";

export const metadata: Metadata = {
  title: "伪日塔罗｜Fake Sun Tarot",
  description: "在一个光与热真实、太阳却从未存在的世界里，从 79 张文明档案中辨认相信的功能与代价。",
};

export default function Home() {
  return <TarotSite />;
}
