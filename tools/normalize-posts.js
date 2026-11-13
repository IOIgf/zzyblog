#!/usr/bin/env node
'use strict';

/**
 * Normalize posts for Hugo.
 *
 * Typora users can keep writing plain Markdown with a leading `# Title` and no
 * front matter. Before a build/publish, this script adds the front matter Hugo
 * needs (title, date, slug) and inserts a `<!--more-->` excerpt marker after the
 * first real paragraph when no description/marker exists.
 *
 * The operation is idempotent: files that are already complete are left alone.
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'content', 'posts');
const MARKER = '<!--more-->';

function formatShanghaiDate(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

function splitFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { frontMatter: null, body: raw };
  return {
    frontMatter: match[1],
    body: raw.slice(match[0].length),
  };
}

function readValue(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function writeValue(frontMatter, key, value) {
  const line = `${key}: ${JSON.stringify(value)}`;
  const regex = new RegExp(`^${key}:.*$`, 'm');
  if (regex.test(frontMatter)) return frontMatter.replace(regex, line);
  const base = frontMatter.trim();
  return base ? `${base}\n${line}` : line;
}

function isSkippable(block) {
  const text = block.trim();
  if (!text) return true;
  if (/^(#{1,6}\s|>|[-*+]\s|\d+\.\s|\||<)/.test(text)) return true;
  if (/^(`{3,}|~{3,})/.test(text)) return true;
  if (/^!\[[^\]]*\]\([^)]*\)$/.test(text)) return true;
  if (/^\$\$[\s\S]*\$\$$/.test(text)) return true;
  const plain = text.replace(/[*_`$\\[\]()#>-]/g, '').replace(/\s/g, '');
  return plain.length < 12;
}

function findInsertIndex(lines) {
  let inFence = false;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      inFence = !inFence;
      i++;
      continue;
    }
    if (inFence || trimmed === '') {
      i++;
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed)) {
      i++;
      continue;
    }

    const start = i;
    while (i < lines.length) {
      const current = lines[i].trim();
      if (current === '' || /^(`{3,}|~{3,})/.test(current)) break;
      if (i > start && /^#{1,6}\s/.test(current)) break;
      i++;
    }

    const block = lines.slice(start, i).join('\n');
    if (!isSkippable(block)) return i;
  }

  return -1;
}

function normalizeFile(file) {
  const fullPath = path.join(postsDir, file);
  const original = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  let { frontMatter, body } = splitFrontMatter(original);
  let changed = false;

  if (frontMatter === null) {
    frontMatter = '';
    changed = true;
  }

  let title = readValue(frontMatter, 'title');
  if (!title) {
    const heading = body.match(/^\s*#\s+(.+?)\s*(?:\n|$)/);
    if (heading) {
      title = heading[1].replace(/[*_`~]/g, '').trim();
      body = body.slice(heading[0].length).replace(/^\n+/, '');
      changed = true;
    } else {
      title = path.basename(file, '.md');
    }
    frontMatter = writeValue(frontMatter, 'title', title);
    changed = true;
  } else {
    // A leading H1 that duplicates the front matter title is redundant.
    const heading = body.match(/^\s*#\s+(.+?)\s*(?:\n|$)/);
    if (heading) {
      const headingText = heading[1].replace(/[*_`~]/g, '').trim();
      if (headingText === title) {
        body = body.slice(heading[0].length).replace(/^\n+/, '');
        changed = true;
      }
    }
  }

  if (!readValue(frontMatter, 'date')) {
    frontMatter = writeValue(frontMatter, 'date', formatShanghaiDate(new Date()));
    changed = true;
  }

  if (!readValue(frontMatter, 'slug')) {
    const slug = path.basename(file, '.md').replace(/\s+/g, '-');
    frontMatter = writeValue(frontMatter, 'slug', slug);
    changed = true;
  }

  const hasDescription = Boolean(readValue(frontMatter, 'description'));
  const hasMarker = /<!--\s*more\s*-->/.test(body);
  if (!hasDescription && !hasMarker) {
    const lines = body.split('\n');
    const index = findInsertIndex(lines);
    if (index !== -1) {
      lines.splice(index, 0, '', MARKER);
      body = lines.join('\n');
      changed = true;
    }
  }

  body = body
    .replace(/\n{3,}(<!--\s*more\s*-->)/g, '\n\n$1')
    .replace(/(<!--\s*more\s*-->)\n{3,}/g, '$1\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '') + '\n';

  if (!changed && body === original) return false;

  const output = `---\n${frontMatter.trim()}\n---\n${body}`;
  if (output === original) return false;

  fs.writeFileSync(fullPath, output, 'utf8');
  return true;
}

if (!fs.existsSync(postsDir)) {
  console.log('[normalize] content/posts 不存在，跳过');
  process.exit(0);
}

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.md') && !file.startsWith('_'));

let count = 0;
for (const file of files) {
  if (normalizeFile(file)) {
    count++;
    console.log(`[normalize] 已补全 ${file}`);
  }
}

console.log(`[normalize] 检查 ${files.length} 篇文章，更新 ${count} 篇`);
