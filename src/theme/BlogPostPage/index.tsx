import { type ReactElement } from 'react';
import clsx from 'clsx';
import BlogScaffold from '../BlogShared/Scaffold';
import Card from '@lailai0916/ui/Card';
import Summary from '@site/src/components/Article/Summary';
import Comments from '@site/src/components/Comments';
import { PostHeader, PostFooter, PostPaginator } from '../BlogShared/PostChrome';
import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import { BlogPostProvider } from '@docusaurus/plugin-content-blog/client';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import MDXContent from '@theme/MDXContent';
import styles from './styles.module.css';

import type { Props } from '@theme/BlogPostPage';

// Giscus discussions were created with pathname mapping on the old Hugo site.
// Recreate the exact same term, independent of the new /blog prefix.
function legacyDiscussionTerm(permalink: string): string {
  const path = permalink.replace(/^\/blog/, '');
  try {
    return encodeURI(decodeURI(path));
  } catch {
    return encodeURI(path);
  }
}

export default function BlogPostPage(props: Props): ReactElement {
  const BlogPostContent = props.content;
  const { metadata, frontMatter } = props.content;
  const summary = (frontMatter as { summary?: string }).summary;

  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}
      >
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <BlogScaffold
          toc={props.content.toc}
          title={metadata.title}
          description={metadata.description}
        >
          <Card className={styles.postCard}>
            <article id="blog-post-container">
              <PostHeader metadata={metadata} frontMatter={frontMatter as Record<string, unknown>} />
              {summary && <Summary content={summary} />}
              <div className="markdown">
                <MDXContent>
                  <BlogPostContent />
                </MDXContent>
              </div>
              <PostFooter metadata={metadata} />
            </article>
            <div className={styles.comments}>
              <Comments term={legacyDiscussionTerm(metadata.permalink)} />
            </div>
          </Card>
          <PostPaginator prevItem={metadata.prevItem} nextItem={metadata.nextItem} />
        </BlogScaffold>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
