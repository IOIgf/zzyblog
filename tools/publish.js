#!/usr/bin/env node
'use strict';

/**
 * 本地自动发布脚本（Typora / 任意 Markdown 编辑器通用）
 *
 * 用法：
 *   node tools/publish.js --once     立即提交并推送一次
 *   node tools/publish.js --watch    监听 source/，停止修改 30 秒后自动提交并推送
 *   node tools/publish.js --dry-run  只显示会提交哪些文件，不真正提交
 *
 * 可选环境变量：
 *   PUBLISH_BRANCH  分支名，默认 main
 *   PUBLISH_DELAY   自动发布的等待毫秒数，默认 30000
 */

const { execFileSync } = require('node:child_process');
const { watch } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'source');
const branch = process.env.PUBLISH_BRANCH || 'main';
const delayMs = Number(process.env.PUBLISH_DELAY || 30000);
const once = process.argv.includes('--once');
const dryRun = process.argv.includes('--dry-run');
const watchMode = process.argv.includes('--watch') || (!once && !dryRun);

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  });
}

function log(...args) {
  console.log('[publish]', ...args);
}

function publish(reason) {
  try {
    git(['add', 'source']);
    const changes = git(['status', '--porcelain', '--', 'source']).trim();

    if (!changes) {
      log('没有需要提交的内容');
      return false;
    }

    if (dryRun) {
      log('dry-run，以下文件会被提交：');
      console.log(changes);
      return true;
    }

    const stamp = new Date().toLocaleString('zh-CN', { hour12: false });
    const message = `post: ${reason} ${stamp}`;

    git(['commit', '-m', message], { stdio: 'inherit' });
    git(['push', 'origin', branch], { stdio: 'inherit' });
    log(`已提交并推送：${message}`);
    return true;
  } catch (error) {
    console.error('[publish] 失败：', error.message);
    console.error('[publish] 如果 push 被拒绝，请先在仓库目录执行：git pull --rebase');
    return false;
  }
}

function startWatch() {
  log(`监听目录：${contentDir}`);
  log(`停止修改 ${delayMs / 1000} 秒后自动提交并推送，按 Ctrl+C 退出`);

  let timer;
  let running = false;

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (running) {
        schedule();
        return;
      }
      running = true;
      publish('auto');
      running = false;
    }, delayMs);
  };

  try {
    watch(contentDir, { recursive: true }, schedule);
  } catch (error) {
    console.error(`[publish] 无法监听 ${contentDir}：${error.message}`);
    process.exit(1);
  }
}

if (watchMode) {
  startWatch();
} else {
  publish('publish');
}
