# 本地自动发布

适用于 Typora、Markdown 编辑器或任何直接编辑 `source/_posts` 的方式。
脚本只提交 `source/` 下的内容，不会把 `node_modules/`、`public/` 等一起提交。

## 前置条件

- 已安装 Git 和 Node.js 20+
- 已把仓库 clone 到电脑上，并能在仓库目录正常执行 `git push`
- 已执行 `npm install`

## 方式一：写完点一下（推荐）

Windows：双击仓库根目录的 `publish.bat`
macOS / Linux：

```bash
./publish.sh
```

它会执行一次：

```text
git add source
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

脚本会监听 `source/`，停止修改 30 秒后自动 commit + push。
之后你只需要在 Typora 里正常保存，不需要再碰终端。

想改等待时间，可以设置环境变量 `PUBLISH_DELAY`（单位毫秒），例如 60 秒：

```bash
PUBLISH_DELAY=60000 ./watch.sh
```

## 草稿建议

自动监听在写作过程中暂停 30 秒就可能提交一次，所以建议草稿在 Front Matter 里加：

```yaml
published: false
```

Hexo 不会生成 `published: false` 的文章，等写完后改成 `published: true` 或删掉这一行，下一次自动发布后才会公开。

## 常见问题

**push 被拒绝**

说明 GitHub 上有新提交，先执行：

```bash
git pull --rebase
```

再重新发布。

**只想看看会提交什么**

```bash
node tools/publish.js --dry-run
```

**Windows 开机自动启动监听**

按 `Win + R` 输入 `shell:startup`，把 `watch.bat` 的快捷方式放进去即可。
