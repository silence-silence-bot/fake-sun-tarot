import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { assetPath } from "./asset-path";

export async function generateMetadata(): Promise<Metadata> {
  let origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
    const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    origin = `${protocol}://${host}`;
  }
  const description = "在一个光与热真实、太阳却从未存在的世界里，79 张双语塔罗档案记录共同现实的功能、裂缝与身体代价。";

  return {
    title: "伪日塔罗｜Fake Sun Tarot",
    description,
    icons: {
      icon: assetPath("/favicon.svg"),
      shortcut: assetPath("/favicon.svg"),
    },
    openGraph: {
      title: "伪日塔罗｜Fake Sun Tarot",
      description,
      type: "website",
      url: `${origin}${assetPath("/")}`,
      images: [{ url: `${origin}${assetPath("/og.png")}`, width: 1536, height: 1024, alt: "伪日塔罗三张文明档案牌面" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "伪日塔罗｜Fake Sun Tarot",
      description,
      images: [`${origin}${assetPath("/og.png")}`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
