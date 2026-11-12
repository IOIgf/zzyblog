'use strict';

/**
 * Automatically insert `<!-- more -->` when a post has neither a manual more
 * tag nor a `description` in front matter. The marker goes after the first real
 * paragraph, so the homepage shows an excerpt plus the "read more" button.
 */

const MARKER = '<!-- more -->';

function isSkippable(block) {
  const text = block.trim();
  if (!text) return true;
  // Headings, list items, blockquotes, tables, raw HTML, code fences
  if (/^(#{1,6}\s|>|[-*+]\s|\d+\.\s|\||<)/.test(text)) return true;
  if (/^(`{3,}|~{3,})/.test(text)) return true;
  // Image-only or math-only blocks
  if (/^!\[[^\]]*\]\([^)]*\)$/.test(text)) return true;
  if (/^\$\$[\s\S]*\$\$$/.test(text)) return true;
  // Very short blocks such as a bold label
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
    // Standalone heading: skip the heading line, keep looking for a paragraph
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

hexo.extend.filter.register('before_post_render', function(data) {
  if (data.layout !== 'post' || !data.content || data.description) return data;
  if (data.content.includes(MARKER)) return data;

  const lines = data.content.split(/\r?\n/);
  const index = findInsertIndex(lines);
  if (index === -1) return data;

  lines.splice(index, 0, '', MARKER, '');
  data.content = lines.join('\n');
  data.auto_excerpt_inserted = true;
  return data;
});

// The theme already prints the post title above the excerpt, so drop the
// leading in-post heading from the generated excerpt to avoid showing it twice.
hexo.extend.filter.register('after_post_render', function(data) {
  if (!data.auto_excerpt_inserted || !data.excerpt) return data;

  data.excerpt = data.excerpt
    .replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*/, '')
    .trim();
  return data;
}, 20);
