'use strict';

/**
 * If a post was created without YAML front matter, use its first Markdown H1
 * as the title and remove that heading from the body. The theme already prints
 * the post title above the content, so keeping the H1 would show it twice.
 */
hexo.extend.filter.register('before_post_render', function(data) {
  if (data.layout !== 'post' || !data.content) return data;
  if (data.title && String(data.title).trim()) return data;

  const match = data.content.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
  if (!match) return data;

  const title = match[1].replace(/[*_`~]/g, '').trim();
  if (!title) return data;

  data.title = title;
  data.content = data.content.slice(match[0].length).replace(/^\s*\n/, '');
  return data;
});
