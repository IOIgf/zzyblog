import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  algoSidebar: [
    'algo/index',
    {
      type: 'category',
      label: '基础',
      link: {
        type: 'generated-index',
        description: '本章介绍 OI 中常用的基础技巧，如前缀和与差分。',
      },
      items: ['algo/basic/prefix-sum'],
    },
    {
      type: 'category',
      label: '数据结构',
      link: {
        type: 'generated-index',
        description: '数据结构是在计算机中存储、组织数据的方式。',
      },
      items: ['algo/ds/sparse-table', 'algo/ds/seg'],
    },
    {
      type: 'category',
      label: '图论',
      link: {
        type: 'generated-index',
        description: '图论是数学的一个分支，图是图论的主要研究对象。',
      },
      items: ['algo/graph/tree/lca'],
    },
  ],
};

export default sidebars;
