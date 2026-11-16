import { type ReactElement } from 'react';
import PostsListLayout from '../BlogShared/PostsListLayout';
import type { Props as BlogListPageProps } from '@theme/BlogListPage';

export default function BlogListPage(props: BlogListPageProps): ReactElement {
  const { metadata, items } = props;

  return (
    <PostsListLayout
      title={metadata.blogTitle}
      description={metadata.blogDescription}
      items={items}
      meta={metadata}
    />
  );
}
