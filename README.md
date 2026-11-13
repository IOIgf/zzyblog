# zzyblog

Milk_Dragon's blog，使用 [Hugo](https://gohugo.io/) + [FixIt](https://github.com/hugo-fixit/FixIt) 构建，部署在 Cloudflare Pages。

## 本地使用

```bash
npm install
npm run server     # http://localhost:1313/
npm run build      # 构建到 public/
```

写文章：

- 文章目录：`content/posts/`
- 图片等静态资源：`static/`
- 自定义样式：`assets/scss/custom.scss`
- 发布：双击 `publish.bat`，或运行 `node tools/publish.js --once`
- 自动发布：双击 `watch.bat`，或运行 `node tools/publish.js --watch`

Typora 里正常保存即可。发布脚本会自动补全缺失的 `title`、`date`、`slug` 和 `<!--more-->` 摘要标记。

## 目录结构

```text
config/_default/     Hugo 站点配置
content/posts/       文章（Typora 写作目录）
static/              图片、验证文件、_redirects
assets/scss/         自定义 SCSS
layouts/             少量自定义模板/注入
themes/FixIt/        FixIt 主题（Git submodule，固定 v1.0.0-rc.2）
tools/               自动发布、文章规范化脚本
source/              旧 Hexo 内容（迁移期保留，可回滚）
```

## Cloudflare Pages 设置

在 Cloudflare Pages 项目的 **Settings → Build & deployments** 中设置：

| 配置项 | 值 |
| --- | --- |
| Framework preset | None / Hugo |
| Build command | `npm run build` |
| Build output directory | `public` |
| Root directory | 留空 |
| `HUGO_VERSION` | `0.169.0` |
| `NODE_VERSION` | `20` |

构建命令会先初始化 `themes/FixIt` 子模块，再运行 `node tools/normalize-posts.js`，最后执行 `hugo --gc --minify`。

FixIt 需要 Dart Sass。仓库的 `sass-embedded` 开发依赖会在 `npm install` 时提供 `sass` 命令，Hugo 会自动使用它。

## 旧 Hexo 回滚

迁移期间旧文件仍在仓库里。若需要临时回滚：

1. 把 Cloudflare 的 Build command 改回 `npm run build:hexo`
2. 或直接执行 `npx hexo generate`，输出目录仍是 `public`

确认 Hugo 版本稳定后，可以再删除 Hexo 相关配置、`source/`、`scripts/` 和依赖。

## 迁移说明

- 文章 URL 保持为 `/:year/:month/:day/:slug/`，与旧站一致。
- Giscus 继续使用 `pathname` 映射，旧评论不会丢失。
- 深色模式、VS Code Dark+ 代码配色、Fira Code、滚动条和图片亮度已迁移。
- 旧 Hexo 的搜索提交插件只在 `hexo deploy` 时运行，自动发布流程原本不会触发；Hugo 版本暂未保留该功能。
