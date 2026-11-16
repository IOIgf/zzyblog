import { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import TagsListInline from '@theme/TagsListInline';
import EditMetaRow from '@theme/EditMetaRow';
import Comments from '@site/src/components/Comments';

// Giscus discussions for the four OI notes were keyed by the old Hugo
// pathname (mapping="specific"). Reuse those terms so existing threads
// follow the notes into /docs; other docs start a fresh thread on their
// own permalink.
const LEGACY_COMMENTS_TERMS: Record<string, string> = {
  'algo/basic/prefix-sum': '/2026/07/31/前缀和-二维前缀和/',
  'algo/ds/seg': '/2026/08/04/线段树/',
  'algo/ds/sparse-table': '/2026/07/31/ST表-RMQ/',
  'algo/graph/tree/lca': '/2026/07/31/树上-LCA/',
};

export default function DocItemFooter(): ReactNode {
  const { metadata } = useDoc();
  const { editUrl, lastUpdatedAt, lastUpdatedBy, tags } = metadata;
  const term = LEGACY_COMMENTS_TERMS[metadata.id] ?? metadata.permalink;

  return (
    <footer className={clsx(ThemeClassNames.docs.docFooter, 'docusaurus-mt-lg')}>
      {tags.length > 0 && (
        <div
          className={clsx(
            'row margin-top--sm',
            ThemeClassNames.docs.docFooterTagsRow,
          )}>
          <div className="col">
            <TagsListInline tags={tags} />
          </div>
        </div>
      )}
      <EditMetaRow
        className={clsx('margin-top--sm', ThemeClassNames.docs.docFooterEditMetaRow)}
        editUrl={editUrl}
        lastUpdatedAt={lastUpdatedAt}
        lastUpdatedBy={lastUpdatedBy}
      />
      <div className="margin-top--md">
        <Comments term={term} />
      </div>
    </footer>
  );
}
