import { type ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';
import type { TOCItem } from '@docusaurus/mdx-loader';

import { translate } from '@docusaurus/Translate';
import Segmented from '@lailai0916/ui/Segmented';
import TableOfContents from '@site/src/components/Article/TableOfContents';
import styles from './styles.module.css';

type BlogNavKey = 'blog' | 'tags' | 'archive' | 'about';

function useActiveBlogNav(): BlogNavKey {
  const { pathname } = useLocation();
  const tagsBase = useBaseUrl('/blog/tags');
  const archiveBase = useBaseUrl('/blog/archive');
  const authorsBase = useBaseUrl('/blog/authors');
  const aboutBase = useBaseUrl('/about');

  const startsWith = (base: string) =>
    pathname === base || pathname === `${base}/` || pathname.startsWith(`${base}/`);

  if (startsWith(aboutBase)) return 'about';
  if (startsWith(tagsBase)) return 'tags';
  if (startsWith(archiveBase) || startsWith(authorsBase)) return 'archive';
  return 'blog';
}

function BlogSectionNav() {
  const active = useActiveBlogNav();
  const blogHref = useBaseUrl('/blog');
  const tagsHref = useBaseUrl('/blog/tags');
  const archiveHref = useBaseUrl('/blog/archive');
  const aboutHref = useBaseUrl('/about');

  return (
    <nav
      aria-label={translate({
        id: 'blog.menu.sectionsAriaLabel',
        message: '博客栏目',
      })}
    >
      <Segmented<BlogNavKey>
        className={styles.sectionNav}
        value={active}
        orientation="horizontal"
        stackAt={360}
        items={[
          {
            value: 'blog',
            label: translate({ id: 'blog.menu.blog', message: '博客' }),
            href: blogHref,
          },
          {
            value: 'tags',
            label: translate({ id: 'blog.menu.tags', message: '标签' }),
            href: tagsHref,
          },
          {
            value: 'archive',
            label: translate({ id: 'blog.menu.archive', message: '归档' }),
            href: archiveHref,
          },
          {
            value: 'about',
            label: translate({ id: 'blog.menu.about', message: '关于' }),
            href: aboutHref,
          },
        ]}
      />
    </nav>
  );
}

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
  toc?: readonly TOCItem[];
};

export default function BlogScaffold({ title, description, children, toc }: Props) {
  const hasToc = toc && toc.length > 0;

  return (
    <Layout title={title} description={description}>
      <div className={styles.container}>
        <main className={styles.main}>
          <BlogSectionNav />
          {hasToc && (
            <div className={styles.postTocInline}>
              <TableOfContents toc={toc} withCard={false} collapsible />
            </div>
          )}
          {children}
        </main>
        {hasToc && (
          <aside className={styles.postTocDesktop}>
            <TableOfContents toc={toc} withCard={false} />
          </aside>
        )}
      </div>
    </Layout>
  );
}
