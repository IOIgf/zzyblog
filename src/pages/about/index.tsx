import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Icon from '@lailai0916/ui/Icon';
import Card from '@lailai0916/ui/Card';
import { COMMUNITY_LIST } from '@site/src/data/community';
import styles from './styles.module.css';

export default function About(): ReactNode {
  return (
    <Layout
      title="关于"
      description="关于 Milk_Dragon 和这个博客"
      wrapperClassName={styles.page}
    >
      <main className={styles.container}>
        <Card className={styles.card}>
          <div className="markdown">
            <Heading as="h1">关于</Heading>
            <p>
              你好，我是 <strong>Milk_Dragon</strong>，一名 OIer 与开发者。
            </p>
            <p>
              这里是我的个人博客，主要记录算法竞赛、数据结构学习笔记，也会写一些编程实践和日常思考。
              建站的想法很简单：把学过的东西写下来，让它们真正变成自己的。
            </p>
            <p>
              本站使用 <Link href="https://docusaurus.io/">Docusaurus</Link>{' '}
              构建，视觉设计受{' '}
              <Link href="https://github.com/lailai0916/lailai0916.github.io">lailai0916</Link>{' '}
              的开源站点启发，评论区由 <Link href="https://giscus.app/">Giscus</Link> 驱动。
            </p>

            <Heading as="h2">联系我</Heading>
            <ul className={styles.contactList}>
              {COMMUNITY_LIST.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={styles.contactLink}>
                    <Icon icon={item.icon} width={18} height={18} />
                    <span>{item.title}</span>
                    <span className={styles.contactText}>{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Heading as="h2">版权</Heading>
            <p>
              本站文章除特别注明外均为原创，转载请注明出处。站点源代码以 MIT 许可证开源在{' '}
              <Link href="https://github.com/IOIgf/zzyblog">GitHub</Link>。
            </p>
          </div>
        </Card>
      </main>
    </Layout>
  );
}
