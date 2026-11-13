# 本地自动发布

适用于 Typora、Markdown 编辑器或任何直接编辑 `content/posts` 的方式。
脚本只提交 `content/`、`static/`、`assets/` 下的内容，不会把 `node_modules/`、`public/`、`resources/` 等一起提交。

## 前置条件

- 已安装 Git 和 Node.js 20+
- 已把仓库 clone 到电脑上，并能在仓库目录正常执行 `git push`
- 已执行 `npm install`
- 已安装 Hugo extended 0.166+（本地预览/构建用）

## 方式一：写完点一下（推荐）

Windows：双击仓库根目录的 `publish.bat`
macOS / Linux：

```bash
./publish.sh
```

它会执行一次：

```text
node tools/normalize-posts.js
git add content static assets
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

脚本会监听 `content/`、`static/`、`assets/`，停止修改 30 秒后自动 commit + push。
之后你只需要在 Typora 里正常保存，不需要再碰终端。

想改等待时间，可以设置环境变量 `PUBLISH_DELAY`（单位毫秒），例如 60 秒：

```bash
PUBLISH_DELAY=60000 ./watch.sh
```

## 文章标题与日期

推荐在 Front Matter 里写标题和日期：

```yaml
---
title: 论土豆
date: 2026-11-12T21:00:00+08:00
tags: [随笔]
---
```

如果完全没写 Front Matter，发布脚本会自动：

1. 把正文第一行的 `# 标题` 当作文章标题，并把这个一级标题从正文里去掉；
2. 用发布时间补上 `date`；
3. 用文件名补上 `slug`，保证 URL 稳定；
4. 在第一段后面插入 `<!--more-->`，让首页显示摘要。

自动补全只会在发布/构建前运行，文件补全一次后不会反复修改。

## 草稿建议

自动监听在写作过程中暂停 30 秒就可能提交一次，所以建议草稿在 Front Matter 里加：

```yaml
draft: true
```

Hugo 不会生成 `draft: true` 的文章，等写完后改成 `draft: false` 或删掉这一行，下一次自动发布后才会公开。

## 本地预览

```bash
npm run server
```

打开 `http://localhost:1313/`。预览会包含草稿（`-D`）。

## 本地构建

```bash
npm run build
```

构建结果在 `public/`。Hugo 需要 Dart Sass；仓库的 `sass-embedded` 开发依赖会提供 `sass` 命令。

## 认证配置（重要）

GitHub 已经不支持用账号密码推送。如果 `git push` 时提示：

```text
Password authentication is not supported for Git operations.
```

需要用 **Personal Access Token（PAT）** 或 **SSH** 二选一。

### 方式 A：PAT（最简单）

1. 打开 https://github.com/settings/tokens
2. 点 `Generate new token`，勾选 `repo`（fine-grained token 则给 `IOIgf/zzyblog` 的 `Contents: Read and write`）
3. 生成后复制 `ghp_...` 或 `github_pat_...`
4. 在仓库目录执行一次，让 Git 记住凭据：

```bash
git config --global credential.helper manager
```

5. 重新发布。提示输入时：
   - `Username`: `IOIgf`
   - `Password`: 粘贴刚才的 token（输入时不会显示字符）

如果 `manager` 不可用，改用：

```bash
git config --global credential.helper store
```

这会把 token 明文保存在 `%USERPROFILE%\.git-credentials`，仅建议在自己的电脑上使用。

### 方式 B：SSH

1. 生成密钥（如果已经有 `%USERPROFILE%\.ssh\id_ed25519.pub` 可跳过）：

```bash
ssh-keygen -t ed25519 -C "zzyblog"
```

2. 用记事本打开 `%USERPROFILE%\.ssh\id_ed25519.pub`，复制全部内容
3. 添加到 https://github.com/settings/keys
4. 把仓库地址改成 SSH：

```bash
git remote set-url origin git@github.com:IOIgf/zzyblog.git
ssh -T git@github.com
```

看到 `Hi IOIgf!` 就表示成功。

## 常见问题

**push 被拒绝**

如果提示 `non-fast-forward` 或 `rejected`，说明 GitHub 上有新提交，先执行：

```bash
git pull --rebase
```

再重新发布。

**提示 Password authentication is not supported**

按上面的「认证配置」设置 PAT 或 SSH。

**本地已经有 commit 但 push 失败了**

重新双击 `publish.bat` 即可，脚本会自动推送未推送的提交，不会重复提交。

**只想看看会提交什么**

```bash
node tools/publish.js --dry-run
```

**Windows 开机自动启动监听**

按 `Win + R` 输入 `shell:startup`，把 `watch.bat` 的快捷方式放进去即可。
