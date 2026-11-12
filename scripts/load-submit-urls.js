'use strict';

/**
 * Wrapper to load hexo-submit-urls-to-search-engine plugin.
 * The plugin's index.js expects `hexo` to be global.
 * We manually register the generator and deployers.
 */

const generator = require('hexo-submit-urls-to-search-engine/lib/generator');
const baidu = require('hexo-submit-urls-to-search-engine/lib/baidu_submitter');
const bing = require('hexo-submit-urls-to-search-engine/lib/bing_submitter');
const google = require('hexo-submit-urls-to-search-engine/lib/google_submitter');

hexo.extend.generator.register('cjh_url_generator', generator);
hexo.extend.deployer.register('cjh_baidu_url_submitter', baidu);
hexo.extend.deployer.register('cjh_bing_url_submitter', bing);
hexo.extend.deployer.register('cjh_google_url_submitter', google);