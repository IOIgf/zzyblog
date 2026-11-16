import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Settings() {
  return (
    <Layout title={translate({ id: 'pages.settings.title', message: '设置' })}>
      <main className={styles.container}>
        <h1>{translate({ id: 'pages.settings.title', message: '设置' })}</h1>
        <p className={styles.placeholder}>
          {translate({ id: 'pages.settings.placeholder', message: '此处可放置站点偏好设置（字体、主题、语言等）。请编辑 src/pages/settings/index.tsx 自定义内容。' })}
        </p>
        {/* TODO: 添加主题切换、字体大小、语言偏好等设置项 */}
      </main>
    </Layout>
  );
}