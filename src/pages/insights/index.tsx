import { useCallback, useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Card from '@lailai0916/ui/Card';
import Icon from '@lailai0916/ui/Icon';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';
import { goatCounterConfig, isInsightsConfigured } from '@site/src/config/goatcounter';
import {
  fetchInsightsData,
  PERIODS,
  type InsightsData,
  type Period,
  GoatCounterApiError,
} from '@site/src/utils/goatcounter';
import { BarList, formatNumber, TrendChart, type BarItem } from '../_components/InsightsCharts';
import styles from './styles.module.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: InsightsData };

function toBarItems(pages: InsightsData['topPages']): BarItem[] {
  return pages.map((p) => {
    const isInternal = p.path.startsWith('/');
    return {
      name: p.title,
      views: p.views,
      to: isInternal ? p.path : undefined,
      href: isInternal ? undefined : p.path,
    };
  });
}

function toReferrerItems(items: InsightsData['referrers']): BarItem[] {
  return items.map((i) => ({
    name: i.name,
    views: i.views,
    href: i.name && i.name !== '直接访问' ? `https://${i.name}` : undefined,
  }));
}

export default function Insights() {
  const insightsConfigured = isInsightsConfigured();
  const [period, setPeriod] = useState<Period>(30);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchInsightsData(period);
      setState({ status: 'ready', data });
    } catch (error) {
      setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
    }
  }, [period]);

  useEffect(() => {
    if (insightsConfigured) {
      void load();
    }
  }, [insightsConfigured, load]);

  const missing: string[] = [];
  if (!goatCounterConfig.enabled) {
    missing.push('enabled');
  }
  if (!goatCounterConfig.endpoint) {
    missing.push('endpoint');
  }
  if (!goatCounterConfig.proxyPath) {
    if (!goatCounterConfig.apiHost) {
      missing.push('apiHost');
    }
    if (!goatCounterConfig.apiKey) {
      missing.push('apiKey');
    }
  }

  // 「查看完整面板」链接：优先用 dashboardUrl，其次回退到 apiHost。
  const dashboardHref = goatCounterConfig.dashboardUrl || goatCounterConfig.apiHost;

  return (
    <Layout
      title="洞察"
      description="Milk_Dragon 博客的网站访问数据分析"
      wrapperClassName={styles.page}
    >
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>{translate({ id: 'pages.insights.title', message: '洞察' })}</h1>
          <p className={styles.subtitle}>
            {translate({
              id: 'pages.insights.subtitle',
              message: '本站的访问数据分析，数据由 GoatCounter 实时提供',
            })}
            {insightsConfigured && dashboardHref !== '' && (
              <>
                {'　'}
                <Link href={dashboardHref} className={styles.dashboardLink}>
                  <Icon icon="tabler:external-link" width={14} height={14} />
                  {translate({ id: 'pages.insights.dashboardLink', message: '查看完整面板' })}
                </Link>
              </>
            )}
          </p>
        </header>

        {!insightsConfigured ? (
          <Card padding="20px" className={styles.setupCard}>
            <h2 className={styles.cardTitle}>
              <Icon icon="tabler:settings" width={18} height={18} />
              {translate({
                id: 'pages.insights.setup.title',
                message: '尚未接入网站统计',
              })}
            </h2>
            <p>
              {translate({
                id: 'pages.insights.setup.intro',
                message:
                  '本页通过 GoatCounter（开源、隐私友好的访问统计服务）展示本站的访问数据。' +
                  '完成以下配置后，全站访问会自动上报，本页也会显示数据看板。',
              })}
            </p>
            <ol className={styles.setupSteps}>
              <li>
                在 <Link href="https://goatcounter.com/signup">GoatCounter</Link> 注册并创建站点
                （免费；也可以 <Link href="https://github.com/arp242/goatcounter">自托管</Link>）。
              </li>
              <li>在 GoatCounter 账号（右上角用户名 → API）创建一个只读 API Key。</li>
              <li>
                编辑{' '}
                <Link href="https://github.com/IOIgf/zzyblog/blob/main/src/config/goatcounter.ts">
                  src/config/goatcounter.ts
                </Link>{' '}
                填入 endpoint；把 API Key 放进仓库根目录的{' '}
                <Link href="https://github.com/IOIgf/zzyblog/blob/main/functions/gc/stats.js">
                  functions/gc/stats.js
                </Link>
                （已内置），保持 proxyPath 为「/gc」，并将 enabled 设为 true，然后重新构建发布。
              </li>
            </ol>
            {missing.length > 0 && (
              <p className={styles.setupMissing}>
                {translate({
                  id: 'pages.insights.setup.missing',
                  message: '当前尚未填写的配置项：',
                })}
                <code className={styles.missingCode}>{missing.join('、')}</code>
              </p>
            )}
          </Card>
        ) : (
          <>
            <div className={styles.periodTabs} role="group">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={clsx(styles.periodTab, p === period && styles.periodTabActive)}
                  onClick={() => setPeriod(p)}
                >
                  {translate({ id: 'pages.insights.period', message: '近 {days} 天' }, { days: p })}
                </button>
              ))}
            </div>

            {state.status === 'loading' && (
              <div className={styles.skeletonGrid} aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <Card key={`s1-${i}`} padding="16px" className={styles.skeletonCard}>
                    <div className={clsx(styles.skeletonBar, styles.skeletonBarWide)} />
                    <div className={styles.skeletonBar} />
                  </Card>
                ))}
                <Card padding="16px" className={clsx(styles.skeletonCard, styles.trendSpan)}>
                  <div className={styles.skeletonBar} />
                </Card>
                <Card padding="16px" className={styles.skeletonCard}>
                  <div className={styles.skeletonBar} />
                  <div className={styles.skeletonBar} />
                </Card>
                <Card padding="16px" className={clsx(styles.skeletonCard, styles.skeletonList)}>
                  <div className={styles.skeletonBar} />
                </Card>
              </div>
            )}

            {state.status === 'error' && (
              <Card padding="20px" className={styles.errorCard}>
                <h2 className={styles.cardTitle}>
                  <Icon icon="tabler:alert-triangle" width={18} height={18} />
                  {translate({ id: 'pages.insights.error.title', message: '数据加载失败' })}
                </h2>
                <p className={styles.errorMessage}>{state.error.message}</p>
                {state.error instanceof GoatCounterApiError && state.error.code === 'auth' && (
                  <p className={styles.errorHint}>
                    {translate({
                      id: 'pages.insights.error.authHint',
                      message:
                        '请检查 API Key 是否有效：代理模式见 functions/gc/stats.js，' +
                        '直连模式见 src/config/goatcounter.ts。',
                    })}
                  </p>
                )}
                {state.error instanceof GoatCounterApiError && state.error.code === 'forbidden' && (
                  <p className={styles.errorHint}>
                    {translate({
                      id: 'pages.insights.error.forbiddenHint',
                      message: '该 API Key 没有此站点的数据读取权限，请在 GoatCounter 账号中检查 Key 的权限。',
                    })}
                  </p>
                )}
                <button type="button" className={styles.retryButton} onClick={() => void load()}>
                  <Icon icon="tabler:refresh" width={14} height={14} />
                  {translate({ id: 'pages.insights.error.retry', message: '重新加载' })}
                </button>
              </Card>
            )}

            {state.status === 'ready' && (
              <div className={styles.dashboard}>
                <div className={styles.summaryGrid}>
                  <Card padding="14px" className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Icon icon="tabler:eye" width={16} height={16} />
                    </div>
                    <div>
                      <div className={styles.summaryValue}>{formatNumber(state.data.allTimeViews)}</div>
                      <div className={styles.summaryLabel}>
                        {translate({ id: 'pages.insights.card.allTime', message: '累计访问量' })}
                      </div>
                    </div>
                  </Card>
                  <Card padding="14px" className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Icon icon="tabler:clock" width={16} height={16} />
                    </div>
                    <div>
                      <div className={styles.summaryValue}>{formatNumber(state.data.todayViews)}</div>
                      <div className={styles.summaryLabel}>
                        {translate({ id: 'pages.insights.card.today', message: '今日访问' })}
                      </div>
                    </div>
                  </Card>
                  <Card padding="14px" className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Icon icon="tabler:calendar" width={16} height={16} />
                    </div>
                    <div>
                      <div className={styles.summaryValue}>{formatNumber(state.data.periodViews)}</div>
                      <div className={styles.summaryLabel}>
                        {translate(
                          { id: 'pages.insights.card.period', message: '近 {days} 天访问' },
                          { days: state.data.period },
                        )}
                      </div>
                    </div>
                  </Card>
                  <Card padding="14px" className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Icon icon="tabler:chart-bar" width={16} height={16} />
                    </div>
                    <div>
                      <div className={styles.summaryValue}>
                        {formatNumber(Math.round(state.data.periodViews / state.data.period))}
                      </div>
                      <div className={styles.summaryLabel}>
                        {translate(
                          { id: 'pages.insights.card.average', message: '日均访问（近 {days} 天）' },
                          { days: state.data.period },
                        )}
                      </div>
                    </div>
                  </Card>
                </div>

                <Card padding="20px" className={styles.trendCard}>
                  <h2 className={styles.cardTitle}>
                    <Icon icon="tabler:chart-line" width={18} height={18} />
                    {translate(
                      { id: 'pages.insights.trend.title', message: '访问趋势（近 {days} 天）' },
                      { days: state.data.period },
                    )}
                  </h2>
                  <TrendChart data={state.data.trend} />
                </Card>

                <Card padding="20px" className={styles.sectionCard}>
                  <h2 className={styles.cardTitle}>
                    <Icon icon="tabler:document" width={18} height={18} />
                    {translate(
                      { id: 'pages.insights.topPages.title', message: '热门页面（近 {days} 天）' },
                      { days: state.data.period },
                    )}
                  </h2>
                  <BarList items={toBarItems(state.data.topPages)} />
                </Card>

                <Card padding="20px" className={styles.sectionCard}>
                  <h2 className={styles.cardTitle}>
                    <Icon icon="tabler:world" width={18} height={18} />
                    {translate(
                      { id: 'pages.insights.locations.title', message: '地区分布（近 {days} 天）' },
                      { days: state.data.period },
                    )}
                  </h2>
                  <BarList
                    items={state.data.locations.map((i) => ({ name: i.name, views: i.views }))}
                  />
                </Card>

                <Card padding="20px" className={styles.sectionCard}>
                  <h2 className={styles.cardTitle}>
                    <Icon icon="tabler:share" width={18} height={18} />
                    {translate(
                      { id: 'pages.insights.referrers.title', message: '推荐来源（近 {days} 天）' },
                      { days: state.data.period },
                    )}
                  </h2>
                  <BarList items={toReferrerItems(state.data.referrers)} />
                </Card>

                <Card padding="20px" className={styles.sectionCard}>
                  <h2 className={styles.cardTitle}>
                    <Icon icon="tabler:device-desktop" width={18} height={18} />
                    {translate(
                      { id: 'pages.insights.browsers.title', message: '浏览器分布（近 {days} 天）' },
                      { days: state.data.period },
                    )}
                  </h2>
                  <BarList
                    items={state.data.browsers.map((i) => ({ name: i.name, views: i.views }))}
                  />
                </Card>

                <p className={styles.footnote}>
                  {translate({
                    id: 'pages.insights.footnote',
                    message:
                      '数据约每 10 秒更新；统计由 GoatCounter 提供，不收集个人身份信息。' +
                      '数据基于浏览器指纹识别会话，可能被广告拦截器误拦，实际访问量略高于显示值。',
                  })}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}

