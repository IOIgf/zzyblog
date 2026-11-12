'use strict';

/**
 * Append a build id to local CSS/JS URLs so a new deployment never mixes
 * freshly generated HTML with stale cached assets from a previous theme version.
 */
const buildId = Date.now().toString(36);

hexo.extend.filter.register('after_render:html', function(str) {
  return str.replace(
    /(\s(?:src|href)=")(\/(?:js|css)\/[^"?#]+)(?:\?[^"#]*)?(")/g,
    (match, prefix, url, suffix) => `${prefix}${url}?v=${buildId}${suffix}`
  );
});
