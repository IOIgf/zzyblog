# 本地写作与自动发布

适用于 Typora、其他 Markdown 编辑器，或直接编辑 `blog/` 的方式。
脚本只提交 `blog/` 和 `static/`，不会把 `node_modules/`、`public/`、`.docusaurus/` 一起提交。

## 前置条件

- 已安装 Git 和 Node.js 20.19+
- 已把仓库 clone 到电脑上，并能在仓库目录正常执行 `git push`
- 已执行 `npm install`
- 已安装 Typora 或其他 Markdown 编辑器

## 方式一：写完点一下（推荐）

Windows：双击仓库根目录的 `publish.bat`
macOS / Linux：

```bash
./publish.sh
```

它会执行一次：

```text
node tools/normalize-posts.js
git add blog static
git commit -m "post: publish ..."
git push origin main
```

推送后 Cloudflare Pages 会自动构建，几十秒后线上更新。

## 方式二：完全自动（挂着监听）

Windows：双击 `watch.bat`，保持窗口开着。
macOS / Linux：

```bash
./watch.sh
```

脚本会监听 `blog/`、`static/`，停止修改 30 秒后自动 commit + push。
之后你只需要在 Typora 里正常保存，不需要再碰终端。

想改等待时间，可以设置环境变量 `PUBLISH_DELAY`（单位毫秒），例如 60 秒：

```bash
PUBLISH_DELAY=60000 ./watch.sh
```

## 在 Typora 中写作

把 Typora 的文章保存到仓库的 `blog/` 目录即可，文件名就是 URL 的最后一段，例如：

```text
blog/论土豆.md
```

推荐在 Front Matter 里写标题和日期：

```yaml
---
title: 论土豆
date: 2026-11-12T21:00:00+08:00
tags: [algorithm]
---
```

如果完全没写 Front Matter，发布脚本会自动：

1. 把正文第一行的 `# 标题` 当作文章标题，并把这个一级标题从正文里去掉；
2. 用发布时间补上 `date`；
3. 按 `/年/月/日/文件名/` 的旧站格式补上 `slug`，保证 URL 稳定；
4. 补上 `authors: zzy`；
5. 在第一段后面插入 `{/* truncate */}`，让首页显示摘要。

自动补全只会在发布/构建前运行，文件补全一次后不会反复修改。

## 草稿建议

自动监听在写作过程中暂停 30 秒就可能提交一次，所以建议草稿在 Front Matter 里加：

```yaml
draft: true
```

Docusaurus 不会生成 `draft: true` 的文章，等写完后改成 `draft: false` 或删掉这一行，下一次自动发布后才会公开。

## 本地预览

```bash
npm run start
```

浏览器打开 `http://localhost:3000`。预览前也会自动补全文章信息。
