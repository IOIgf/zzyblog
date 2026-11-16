import type { Plugin } from '@docusaurus/types';

interface DocMetadataLike {
  id: string;
  title?: string;
  permalink: string;
  unlisted?: boolean;
  frontMatter: Record<string, unknown>;
}

interface DocCatalogEntry {
  id: string;
  permalink: string;
  title: string;
  /** Original publication date (ISO string); empty when the doc has none. */
  date: string;
}

export default function docsCatalogPlugin(): Plugin {
  return {
    name: 'docs-catalog',
    async allContentLoaded({ allContent, actions }) {
      // allContent is keyed by plugin name, then by plugin instance id:
      //   allContent['docusaurus-plugin-content-docs']['default']
      // Docs content exposes flattened doc metadata via loadedVersions[].docs.
      const instances = Object.values(allContent['docusaurus-plugin-content-docs'] ?? {});
      const docs: DocMetadataLike[] = [];
      for (const raw of instances) {
        const content = raw as {
          loadedVersions?: Array<{ docs?: DocMetadataLike[] }>;
        };
        for (const version of content?.loadedVersions ?? []) {
          docs.push(...(version.docs ?? []));
        }
      }
      const entries: DocCatalogEntry[] = docs
        .filter((doc) => !doc.unlisted)
        .map((doc) => {
          const fm = doc.frontMatter;
          // Unquoted YAML timestamps are parsed as Date objects by js-yaml.
          const rawDate = fm?.date;
          const date =
            rawDate instanceof Date
              ? rawDate.toISOString()
              : typeof rawDate === 'string'
                ? rawDate
                : '';
          return {
            id: doc.id,
            permalink: doc.permalink,
            title: doc.title ?? ((fm?.title as string) ?? doc.id),
            date,
          };
        });
      await actions.createData('docs.json', JSON.stringify(entries));
    },
  };
}
