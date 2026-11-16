import { translate } from '@docusaurus/Translate';

interface CommunityItem {
  id: string;
  title: string;
  text: string;
  icon: string;
  href: string;
  contact?: boolean;
}

export const COMMUNITY_LIST: CommunityItem[] = [
  {
    id: 'github',
    title: translate({
      id: 'data.community.github',
      message: 'GitHub',
    }),
    text: 'IOIgf',
    icon: 'simple-icons:github',
    href: 'https://github.com/IOIgf',
  },
  {
    id: 'email',
    contact: true,
    title: translate({
      id: 'data.community.email',
      message: '邮箱',
    }),
    text: 'zbt662720@outlook.com',
    icon: 'tabler:mail-filled',
    href: 'mailto:zbt662720@outlook.com',
  },
  {
    id: 'rss',
    title: translate({
      id: 'data.community.rss',
      message: 'RSS',
    }),
    text: 'RSS',
    icon: 'simple-icons:rss',
    href: 'https://ccbserver.qzz.io/blog/rss.xml',
  },
];
