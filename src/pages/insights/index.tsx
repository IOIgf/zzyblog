import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Insights() {
  return (
    <Layout title={translate({ id: 'pages.insights.title', message: '洞察' })}>
      <main className={styles.container}>
        <h1>{translate({ id: 'pages.insights.title', message: '洞察' })}</h1>
        <p className={styles.placeholder}>
          {translate({ id: 'pages.insights.placeholder', message: '此处将展示思考碎片、读书笔记等。请编辑 src/pages/insights/index.tsx 自定义内容。' })}
        </p>
        {/* TODO: 添加洞察卡片、标签筛选、时间轴等 */}
      </main>
    </Layout>
  );
}