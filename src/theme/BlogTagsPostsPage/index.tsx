import { type ReactElement } from 'react';
import type { Props } from '@theme/BlogTagsPostsPage';
import BlogArchive from '../BlogShared/Archive';

export default function BlogTagsPostsPage(props: Props): ReactElement {
  const { items, tag } = props;

  return (
    <BlogArchive
      selected={{
        kind: 'tag',
        permalink: tag.permalink,
        title: tag.label,
        description: tag.description,
        posts: items.map((item) => item.content),
      }}
    />
  );
}
