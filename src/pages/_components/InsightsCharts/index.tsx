// 「洞察」页的轻量图表组件：SVG 趋势图 + 横向条形列表，无第三方图表依赖。
// 放在 _components 下，避免被 Docusaurus pages 插件识别为路由。
import React from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';
import styles from './styles.module.css';

export type TrendPoint = { day: string; visitors: number; views: number };
export type BarItem = {
  name: string;
  views: number;
  /** 站内链接（Docusaurus `to`）。 */
  to?: string;
  /** 外部链接。 */
  href?: string;
};

/** 数字的中文紧凑格式：12345 → 1.2万。 */
export function formatNumber(n: number): string {
  if (n >= 10000) {
    const w = n / 10000;
    const text = w >= 100 ? String(Math.round(w)) : w.toFixed(1).replace(/\.0$/, '');
    return `${text}万`;
  }
  return n.toLocaleString('zh-CN');
}

const W = 640;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

function niceMax(value: number): number {
  if (value <= 5) {
    return 5;
  }
  const exp = 10 ** Math.floor(Math.log10(value));
  const f = value / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * exp;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        {translate({ id: 'pages.insights.empty', message: '暂无数据' })}
      </div>
    );
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxRaw = Math.max(...data.map((d) => Math.max(d.views, d.visitors)), 1);
  const max = niceMax(maxRaw);
  const n = data.length;

  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const points = (key: 'views' | 'visitors') =>
    data.map((d, i) => `${x(i)},${y(d[key])}`).join(' ');

  const area = `${x(0)},${PAD.top + innerH} ${points('views')} ${x(n - 1)},${PAD.top + innerH}`;
  const hitW = innerW / Math.max(n - 1, 1);
  const gridFracs = [0, 0.5, 1];
  const labelIdx = Array.from(
    new Set([0, Math.floor((n - 1) / 2), n - 1].filter((i) => i >= 0 && i < n)),
  );

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img">
        <title>
          {translate(
            {
              id: 'pages.insights.trend.ariaLabel',
              message: '近 {period} 天访问趋势图',
            },
            { period: n },
          )}
        </title>
        {gridFracs.map((f) => (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(max * f)}
              y2={y(max * f)}
              className={styles.gridLine}
            />
            <text
              x={PAD.left - 8}
              y={y(max * f) + 4}
              textAnchor="end"
              className={styles.axisLabel}
            >
              {formatNumber(max * f)}
            </text>
          </g>
        ))}
        <polygon points={area} className={styles.area} />
        <polyline points={points('views')} className={styles.seriesViews} />
        <polyline points={points('visitors')} className={styles.seriesVisitors} />
        {data.map((d, i) => (
          <g key={d.day}>
            <circle cx={x(i)} cy={y(d.views)} r={2.5} className={styles.dotViews} />
            <circle cx={x(i)} cy={y(d.visitors)} r={2.5} className={styles.dotVisitors} />
            <rect
              x={x(i) - hitW / 2}
              width={hitW}
              y={PAD.top}
              height={innerH}
              className={styles.hitArea}
            >
              <title>{`${d.day.slice(5)}　访问 ${d.views} · 访客 ${d.visitors}`}</title>
            </rect>
          </g>
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className={styles.axisLabel}>
            {data[i].day.slice(5)}
          </text>
        ))}
      </svg>
      <div className={styles.legend}>
        <span>
          <i className={clsx(styles.swatch, styles.swatchViews)} />
          {translate({ id: 'pages.insights.trend.legendViews', message: '访问量' })}
        </span>
        <span>
          <i className={clsx(styles.swatch, styles.swatchVisitors)} />
          {translate({ id: 'pages.insights.trend.legendVisitors', message: '访客数' })}
        </span>
      </div>
    </div>
  );
}

export function BarList({ items }: { items: BarItem[] }) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        {translate({ id: 'pages.insights.empty', message: '暂无数据' })}
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.views), 1);
  return (
    <ul className={styles.barList}>
      {items.map((item) => (
        <li key={item.name} className={styles.barRow}>
          <span className={styles.barLabel} title={item.name}>
            {item.href ? (
              <Link href={item.href}>{item.name}</Link>
            ) : item.to ? (
              <Link to={item.to}>{item.name}</Link>
            ) : (
              item.name
            )}
          </span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${(item.views / max) * 100}%` }}
            />
          </span>
          <span className={styles.barValue}>{formatNumber(item.views)}</span>
        </li>
      ))}
    </ul>
  );
}
