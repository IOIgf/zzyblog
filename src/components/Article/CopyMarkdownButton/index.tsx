import CopyButton from '@lailai0916/ui/CopyButton';
import { useCallback, useEffect, useRef } from 'react';
import { translate } from '@docusaurus/Translate';
import { trackEvent } from '@site/src/utils/analytics';

declare const require: any;

// Each blog .md is registered as a lazy chunk via raw-loader, kept out of the
// initial bundle (no extra static files emitted). We prefetch the current
// page's chunk on mount rather than inside the click, so the click handler can
// write to the clipboard synchronously — awaiting the chunk inside the click
// let the first click's network fetch outlast its user activation, so the first
// copy always failed.
const blogMdxCtx = require.context('!!raw-loader!@site/blog', true, /\.mdx?$/, 'lazy');

// metadata.source example: @site/blog/2026/07/31/ST表-RMQ.md
function resolveSource(source: string): { ctx: any; key: string } | null {
  const m = source.match(/^@site\/blog\/(.+\.mdx?)$/);
  if (!m) return null;
  return { ctx: blogMdxCtx, key: './' + m[1] };
}

const COPY_LABEL = translate({
  id: 'components.article.copyMarkdown',
  message: 'Copy Markdown',
});
const COPIED_LABEL = translate({
  id: 'components.article.copyMarkdownCopied',
  message: 'Copied!',
});
const COPY_ERROR_LABEL = translate({
  id: 'components.article.copyMarkdownError',
  message: 'Copy failed',
});

export default function CopyMarkdownButton({ source }: { source: string }) {
  const textRef = useRef<string | null>(null);
  const loadRef = useRef<Promise<string> | null>(null);
  const sourceVersionRef = useRef(0);

  const invalidateRequests = useCallback(() => {
    sourceVersionRef.current++;
  }, []);

  const loadSource = useCallback(() => {
    const resolved = resolveSource(source);
    if (!resolved) return null;
    const version = sourceVersionRef.current;
    const promise: Promise<string> = resolved.ctx(resolved.key).then(
      (mod: { default: string }) => {
        if (version === sourceVersionRef.current) textRef.current = mod.default;
        return mod.default;
      },
      (error: unknown) => {
        if (version === sourceVersionRef.current) loadRef.current = null;
        throw error;
      }
    );
    loadRef.current = promise;
    return promise;
  }, [source]);

  useEffect(() => {
    invalidateRequests();
    textRef.current = null;
    loadRef.current = null;
    loadSource()?.catch(() => {});
    return invalidateRequests;
  }, [loadSource, invalidateRequests]);

  const value = useCallback(() => {
    if (textRef.current != null) return textRef.current;
    return loadRef.current ?? loadSource() ?? Promise.reject(new Error('Unknown Markdown source'));
  }, [loadSource]);

  if (!resolveSource(source)) return null;
  return (
    <CopyButton
      iconOnly
      size="xs"
      value={value}
      onCopied={() => trackEvent('copy_success', { surface: 'article', format: 'markdown' })}
      label={COPY_LABEL}
      copiedLabel={COPIED_LABEL}
      errorLabel={COPY_ERROR_LABEL}
    />
  );
}
