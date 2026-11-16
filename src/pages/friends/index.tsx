import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Friends() {
  return (
    <Layout title={translate({ id: 'pages.friends.title', message: '朋友' })}>
      <main className={styles.container}>
        <h1>{translate({ id: 'pages.friends.title', message: '朋友' })}</h1>
        <p className={styles.placeholder}>
          {translate({ id: 'pages.friends.placeholder', message: '此处将展示友链/朋友圈。请编辑 src/pages/friends/index.tsx 自定义内容。' })}
        </p>
        {/* TODO: 添加友链卡片、RSS 聚合、互访统计等 */}
      </main>
    </Layout>
  );
}