#!/usr/bin/env node
'use strict';

/**
 * Normalize posts for the Docusaurus blog.
 *
 * Typora users can keep writing plain Markdown with a leading `# Title` and no
 * front matter. Before a build/publish, this script adds the front matter
 * Docusaurus needs (title, date, slug, authors) and inserts a `{/* truncate *\/}`
 * excerpt marker after the first real paragraph when no marker exists.
 *
 * The operation is idempotent: files that are already complete are left alone.
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'blog');
const TRUNCATE = '{/* truncate */}';
const SKIP_FILES = new Set(['authors.yml', 'tags.yml', 'authors.yaml', 'tags.yaml']);

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
  })
    .formatToParts(date)
    .reduce((acc, part) => {
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

function makeSlug(file, date) {
  const base = path
    .basename(file, path.extname(file))
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\s+/g, '-');

  const day = date.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return `/${day.replace(/-/g, '/')}/${base}/`;
  }
  return `/${base}/`;
}

function normalizeFile(fullPath) {
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
      title = path.basename(fullPath, path.extname(fullPath));
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

  let date = readValue(frontMatter, 'date');
  if (!date) {
    date = formatShanghaiDate(new Date());
    frontMatter = writeValue(frontMatter, 'date', date);
    changed = true;
  }

  if (!readValue(frontMatter, 'slug')) {
    frontMatter = writeValue(frontMatter, 'slug', makeSlug(fullPath, date));
    changed = true;
  }

  if (!readValue(frontMatter, 'authors')) {
    frontMatter = writeValue(frontMatter, 'authors', 'zzy');
    changed = true;
  }

  // Accept the old Hugo/Hexo excerpt marker as well.
  if (/<!--\s*more\s*-->/.test(body)) {
    body = body.replace(/<!--\s*more\s*-->/g, TRUNCATE);
    changed = true;
  }

  const hasDescription = Boolean(readValue(frontMatter, 'description'));
  const hasMarker = /^\s*\{\s*\/\*\s*truncate\s*\*\/\s*\}\s*$/m.test(body);
  if (!hasDescription && !hasMarker) {
    const lines = body.split('\n');
    const index = findInsertIndex(lines);
    if (index !== -1) {
      lines.splice(index, 0, '', TRUNCATE);
      body = lines.join('\n');
      changed = true;
    }
  }

  body = body
    .replace(/\n{3,}(\{\s*\/\*\s*truncate\s*\*\/\s*\})/g, '\n\n$1')
    .replace(/(\{\s*\/\*\s*truncate\s*\*\/\s*\})\n{3,}/g, '$1\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '') + '\n';

  if (!changed && body === original) return false;

  const output = `---\n${frontMatter.trim()}\n---\n${body}`;
  if (output === original) return false;

  fs.writeFileSync(fullPath, output, 'utf8');
  return true;
}

function collectPosts(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      files.push(...collectPosts(fullPath));
    } else if (
      /\.mdx?$/i.test(entry.name) &&
      !entry.name.startsWith('_') &&
      !SKIP_FILES.has(entry.name)
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = collectPosts(postsDir);
let count = 0;
for (const file of files) {
  if (normalizeFile(file)) {
    count++;
    console.log(`[normalize] 已补全 ${path.relative(root, file)}`);
  }
}

console.log(`[normalize] 检查 ${files.length} 篇文章，更新 ${count} 篇`);
