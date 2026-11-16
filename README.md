# Milk_Dragon's blog

个人博客，记录算法竞赛、数据结构与编程实践。

- 站点：<https://ccbserver.qzz.io>
- 框架：[Docusaurus](https://docusaurus.io/)
- 评论：[Giscus](https://giscus.app/)
- 部署：Cloudflare Pages

## 本地开发

需要 Node.js 20.19+。

```bash
npm install
npm run start
```

构建：

```bash
npm run build
```

输出目录是 `public/`。

## 部署

Cloudflare Pages 设置：

```text
构建命令：npm run build
输出目录：public
环境变量：NODE_VERSION=20
```

`static/CNAME` 保持自定义域名 `ccbserver.qzz.io`。旧的 Hexo/Hugo 地址由
`static/_redirects` 以 `301` 跳转到 `/blog/...`，Giscus 讨论仍按旧路径匹配。

## 写文章

文章放在 `blog/`，推荐使用 Typora 直接保存 Markdown。写完运行：

```bash
npm run publish
```

或双击 `publish.bat`（Windows）。也可以运行 `npm run publish:watch` / `watch.bat`，保存后自动提交并推送。

详细说明见 [`tools/README.md`](tools/README.md)。

## 文章 URL

旧站文章地址仍然可用：

```text
/2026/07/31/ST表-RMQ/
```

Docusaurus 中的实际页面位于 `/blog/2026/07/31/ST表-RMQ/`，旧地址通过 `static/_redirects` 做 `301` 跳转。Giscus 评论的 term 仍按旧站路径生成，因此已有讨论会继续显示。

## 设计来源

站点结构与视觉设计参考了 [lailai0916/lailai0916.github.io](https://github.com/lailai0916/lailai0916.github.io)（MIT License），并使用了其开源的 [`@lailai0916/ui`](https://github.com/lailai0916/ui) 组件库。原仓库的文档内容未复制到本站。

## License

站点源代码采用 [MIT License](LICENSE)。文章内容版权归作者所有，转载请注明出处。
