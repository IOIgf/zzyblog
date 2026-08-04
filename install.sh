#!/bin/bash
# 安装 Pandoc（以 Ubuntu 为例）
apt-get update && apt-get install -y pandoc

# 继续执行正常的依赖安装
npm install
