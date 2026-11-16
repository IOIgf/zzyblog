import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { simpleHash } from '@docusaurus/utils';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const siteUrl = 'https://ccbserver.qzz.io';
const siteTitle = "Milk_Dragon's blog";
const siteDescription = '一个专注于分享算法、编程和思考的个人博客。';
const storageNamespace = simpleHash(`${siteUrl}/`, 3);

const config: Config = {
  title: siteTitle,
  tagline: siteDescription,
  favicon: 'img/logo.svg',
  url: siteUrl,
  baseUrl: '/',
  trailingSlash: true,

  future: {
    v4: true,
    faster: true,
  },

  organizationName: 'IOIgf',
  projectName: 'zzyblog',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  storage: { namespace: storageNamespace },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        htmlLang: 'zh-CN',
        label: '简体中文',
        direction: 'ltr',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          routeBasePath: 'blog',
          blogTitle: '博客',
          blogDescription: siteDescription,
          postsPerPage: 'ALL',
          blogSidebarCount: 0,
          showReadingTime: true,
          showLastUpdateTime: true,
          editUrl: 'https://github.com/IOIgf/zzyblog/tree/main/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          feedOptions: {
            type: 'all',
            xslt: true,
            title: siteTitle,
            description: siteDescription,
            copyright: 'Copyright © 2026 Milk_Dragon',
            language: 'zh-CN',
          },
          processBlogPosts: async ({ blogPosts }) => {
            const pinned = blogPosts.filter((p) => p.metadata.frontMatter.pinned === true);
            const rest = blogPosts.filter((p) => p.metadata.frontMatter.pinned !== true);
            return [...pinned, ...rest];
          },
        },
        pages: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      hideOnScroll: true,
      title: siteTitle,
      logo: {
        alt: "Milk_Dragon's logo",
        src: 'img/logo.svg',
      },
      items: [
        { label: '首页', to: '/', position: 'left' },
        { label: '博客', to: '/blog', position: 'left' },
        { label: '标签', to: '/blog/tags', position: 'left' },
        { label: '归档', to: '/blog/archive', position: 'left' },
        { label: '关于', to: '/about', position: 'left' },
        {
          href: 'https://github.com/IOIgf',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: '内容',
          items: [
            { label: '博客', to: '/blog' },
            { label: '标签', to: '/blog/tags' },
            { label: '归档', to: '/blog/archive' },
          ],
        },
        {
          title: '关于',
          items: [
            { label: '关于本站', to: '/about' },
            { label: 'GitHub', href: 'https://github.com/IOIgf' },
            { label: 'RSS', href: 'https://ccbserver.qzz.io/blog/rss.xml' },
          ],
        },
      ],
      copyright: `Copyright © 2026 <a href="https://ccbserver.qzz.io">Milk_Dragon</a>. Built with <a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">Docusaurus</a>.`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark,
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    metadata: [
      { name: 'google-site-verification', content: '0656ac2f11589f69' },
      { name: 'msvalidate.01', content: '1BE4ACAAF79D3D574E46DB50D86D2D76' },
    ],
  } satisfies Preset.ThemeConfig,

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  clientModules: [
    require.resolve('./src/clientModules/consoleSignature.ts'),
    require.resolve('./src/clientModules/katexCopyTex.ts'),
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexDocs: false,
        blogRouteBasePath: '/blog',
      },
    ],
  ],

  plugins: [
    require.resolve('./src/plugins/externalFonts/index.ts'),
    require.resolve('./src/plugins/blogCatalog/index.ts'),
  ],
};

export default config;
