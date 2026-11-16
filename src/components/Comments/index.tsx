import BrowserOnly from '@docusaurus/BrowserOnly';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Comments({ term }: { term: string }) {
  const { colorMode } = useColorMode();

  return (
    <BrowserOnly fallback={<div />}>
      {() => (
        <Giscus
          repo="IOIgf/blogtalk"
          repoId="R_kgDOTp2CeQ"
          category="Announcements"
          categoryId="DIC_kwDOTp2Cec4DCbcP"
          mapping="specific"
          term={term}
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={colorMode}
          lang="zh-CN"
          loading="lazy"
        />
      )}
    </BrowserOnly>
  );
}
