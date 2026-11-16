import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocCardList from '@theme/DocCardList';
import { type ComponentProps } from 'react';
import clsx from 'clsx';

import GitHub from '@lailai0916/ui/GitHub';
import Quote from '@lailai0916/ui/Quote';
import Divider from '@lailai0916/ui/Divider';
import MarkdownLink from '@site/src/components/MarkdownLink';
import styles from './styles.module.css';

function MarkdownDivider({ className, ...props }: ComponentProps<typeof Divider>) {
  return <Divider {...props} className={clsx(styles.divider, className)} />;
}

export default {
  ...MDXComponents,
  a: MarkdownLink,
  hr: MarkdownDivider,
  Tabs,
  TabItem,
  DocCardList,
  GitHub,
  Quote,
  Divider,
};
