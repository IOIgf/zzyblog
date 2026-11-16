import { type ReactElement } from 'react';
import { translate } from '@docusaurus/Translate';
import type { Props } from '@theme/BlogTagsListPage';
import ArchiveRedirect from '../BlogShared/ArchiveRedirect';

const TITLE = translate({ id: 'blog.pages.tags.title', message: 'Tags' });

export default function BlogTagsListPage(_props: Props): ReactElement {
  return <ArchiveRedirect title={TITLE} />;
}
