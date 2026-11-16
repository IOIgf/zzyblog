import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Travel() {
  return (
    <Layout title={translate({ id: 'pages.travel.title', message: '旅行' })}>
      <main className={styles.container}>
        <h1>{translate({ id: 'pages.travel.title', message: '旅行' })}</h1>
        <p className={styles.placeholder}>
          {translate({ id: 'pages.travel.placeholder', message: '此处将展示旅行记录。请编辑 src/pages/travel/index.tsx 自定义内容。' })}
        </p>
        {/* TODO: 添加旅行地图、照片、行程等内容 */}
      </main>
    </Layout>
  );
}