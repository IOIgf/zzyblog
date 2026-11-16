import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Privacy() {
  return (
    <Layout title={translate({ id: 'pages.privacy.title', message: '隐私' })}>
      <main className={styles.container}>
        <h1>{translate({ id: 'pages.privacy.title', message: '隐私政策' })}</h1>
        <p className={styles.placeholder}>
          {translate({ id: 'pages.privacy.placeholder', message: '此处放置隐私政策。请编辑 src/pages/privacy/index.tsx 自定义内容。' })}
        </p>
        {/* TODO: 补充隐私政策正文（数据收集、Cookie、第三方服务等） */}
      </main>
    </Layout>
  );
}