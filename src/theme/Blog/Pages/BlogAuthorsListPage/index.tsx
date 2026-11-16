import { type ReactNode } from 'react';
import { translate } from '@docusaurus/Translate';
import type { Props } from '@theme/Blog/Pages/BlogAuthorsListPage';
import ArchiveRedirect from '../../../BlogShared/ArchiveRedirect';

const TITLE = translate({ id: 'blog.pages.authors.title', message: 'Authors' });

export default function BlogAuthorsListPage(_props: Props): ReactNode {
  return <ArchiveRedirect title={TITLE} />;
}
