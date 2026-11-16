import { useEffect, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';
import Icon from '@lailai0916/ui/Icon';
import Badge from '@lailai0916/ui/Badge';
import Card from '@lailai0916/ui/Card';
import { COMMUNITY_LIST } from '@site/src/data/community';
import { formatLocalTime, SHANGHAI_TIME_ZONE } from '@site/src/utils/dateTime';
import SpringAvatar from './_components/SpringAvatar';
import styles from './styles.module.css';

function useTypewriter(words: string[]) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const currentWord = words[index % words.length];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (text !== currentWord) setText(currentWord);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < currentWord.length) {
      timer = setTimeout(() => {
        setText(currentWord.slice(0, text.length + 1));
      }, 140);
    } else if (!deleting && text.length === currentWord.length) {
      timer = setTimeout(() => {
        setDeleting(true);
      }, 1200);
    } else if (deleting && text.length > 0) {
      timer = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1));
      }, 80);
    } else {
      timer = setTimeout(() => {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [deleting, text, words, currentWord]);

  return text;
}

function useLocalTime() {
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    const update = () => setTime(formatLocalTime(new Date(), 'en-GB', SHANGHAI_TIME_ZONE));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const localTime = useLocalTime();

  const navItems = [
    {
      title: translate({ id: 'pages.home.nav.blog', message: '博客' }),
      href: '/blog',
      icon: 'lucide:pen-line',
    },
    {
      title: translate({ id: 'pages.home.nav.tags', message: '标签' }),
      href: '/blog/tags',
      icon: 'lucide:tags',
    },
    {
      title: translate({ id: 'pages.home.nav.archive', message: '归档' }),
      href: '/blog/archive',
      icon: 'lucide:archive',
    },
    {
      title: translate({ id: 'pages.home.nav.about', message: '关于' }),
      href: '/about',
      icon: 'lucide:user-round',
    },
  ];

  const profileTags = [
    {
      label: translate({ id: 'pages.home.tag.china', message: '中国' }),
      icon: 'lucide:flag',
    },
    {
      label: translate({ id: 'pages.home.tag.oier', message: 'OIer' }),
      icon: 'lucide:code-xml',
    },
    {
      label: translate({ id: 'pages.home.tag.developer', message: '开发者' }),
      icon: 'lucide:terminal',
    },
    {
      label: translate({ id: 'pages.home.tag.languages', message: '中文 · English' }),
      icon: 'lucide:languages',
    },
    {
      label: translate({ id: 'pages.home.tag.cpp', message: 'C++' }),
      icon: 'lucide:braces',
    },
  ];

  const identities = [
    translate({ id: 'pages.home.identity.oier', message: 'OIer' }),
    translate({ id: 'pages.home.identity.student', message: '学生' }),
    translate({ id: 'pages.home.identity.developer', message: '开发者' }),
    translate({ id: 'pages.home.identity.blogger', message: '博主' }),
  ];
  const identity = useTypewriter(identities);

  const infoItems = [
    {
      key: 'time',
      value: `${localTime} (UTC+08:00)`,
      icon: 'lucide:clock',
    },
    {
      key: 'github',
      value: '@IOIgf',
      icon: 'simple-icons:github',
      href: 'https://github.com/IOIgf',
    },
    {
      key: 'email',
      value: 'zbt662720@outlook.com',
      icon: 'tabler:mail-filled',
      href: 'mailto:zbt662720@outlook.com',
    },
  ];

  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
      wrapperClassName={styles.home}
      noFooter
    >
      <section className={styles.hero}>
        <div className={styles.bento}>
          <Card className={styles.cardMain}>
            <div className={styles.cardMainInner}>
              <SpringAvatar />
              <div className={styles.intro}>
                <h1 className={styles.name}>Milk_Dragon</h1>
                <p className={styles.role}>
                  {translate({ id: 'pages.home.rolePrefix', message: '我是' })}
                  <span className={styles.roleTyping}>{identity}</span>
                  <span className={styles.roleCursor} aria-hidden="true" />
                </p>
              </div>
            </div>
            <div className={styles.profileTags}>
              {profileTags.map((tag) => (
                <Badge key={tag.label} icon={tag.icon}>
                  {tag.label}
                </Badge>
              ))}
            </div>
          </Card>
          {navItems.map((item, index) => (
            <Card
              key={item.href}
              to={item.href}
              className={clsx(styles.cardNav, styles[`cardNav${index + 1}`])}
              padding="1.25rem"
            >
              <Icon icon={item.icon} className={styles.cardNavIcon} />
              <span className={styles.cardNavTitle}>{item.title}</span>
              <Icon icon="lucide:arrow-up-right" className={styles.cardNavArrow} />
            </Card>
          ))}
          <div className={styles.details}>
            <Card>
              <ul className={styles.infoList}>
                {infoItems.map((item) => (
                  <li key={item.key} className={styles.infoRow}>
                    <Icon icon={item.icon} className={styles.infoRowIcon} />
                    {item.href ? (
                      <Link href={item.href} className={styles.infoRowValue}>
                        {item.value}
                      </Link>
                    ) : (
                      <span className={styles.infoRowValue}>{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className={styles.cardSocial}>
              <span className={styles.cardSocialLabel}>
                {translate({ id: 'pages.home.connect', message: '联系我' })}
              </span>
              <div className={styles.socialLinks}>
                {COMMUNITY_LIST.map((social) => (
                  <Link
                    key={social.id}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.title}
                  >
                    <Icon icon={social.icon} width={20} height={20} />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
