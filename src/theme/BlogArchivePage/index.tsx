import { type ReactElement } from 'react';
import type { Props } from '@theme/BlogArchivePage';
import BlogArchive from '../BlogShared/Archive';

export default function BlogArchivePage(props: Props): ReactElement {
  return <BlogArchive posts={props.archive?.blogPosts} />;
}
