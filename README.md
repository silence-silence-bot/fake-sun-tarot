# 伪日塔罗｜Fake Sun Tarot

中英文塔罗网站，包含提问、双日／三日／伪日五芒牌阵、抽牌与揭示、逐位解读、日蚀与空位机制，以及普通和透视两种牌库。

## 本地运行

需要 Node.js 22.13 或更新版本，以及 pnpm 11.25.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

主站位于 `/`，透视牌库位于 `/archive-lab`。

## GitHub Pages

线上地址：<https://silence-silence-bot.github.io/fake-sun-tarot/>

```sh
pnpm run build:github
```

该命令将两个页面导出到 `out/`，包含牌面、卡背、视频、样式和脚本。GitHub Pages 构建使用 `/fake-sun-tarot` 路径前缀。

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。此后推送到 `main` 会自动构建并发布，也可以在 **Actions → Deploy Fake Sun Tarot to GitHub Pages → Run workflow** 手动发布。

迁移到其他账号、仓库名称或自定义域名时，修改 `.github/workflows/pages.yml` 中的 `NEXT_PUBLIC_BASE_PATH` 与 `NEXT_PUBLIC_SITE_URL`。

## 替换卡面

卡面位于 `public/cards/`，编号为 `000.webp` 至 `077.webp`；卡背为 `card-back.webp`。保持 1024 × 1536 比例。编号与牌名见该目录的 `README.md`。

空位牌由页面绘制为纯黑，不需要图片文件。

## 其他构建

`pnpm build` 保留现有 Vinext 构建方式；`pnpm run build:github` 专门生成 GitHub Pages 静态网站。

## 原始框架参考

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
