// GoatCounter JSON API（v0）客户端：供「洞察」页拉取统计看板数据。
// 文档：https://goatcounter.com/help/api
import { goatCounterConfig } from '@site/src/config/goatcounter';

export type Period = 7 | 30 | 90;
export const PERIODS: Period[] = [7, 30, 90];

export type TrendPoint = { day: string; visitors: number; views: number };
export type NamedStat = { name: string; views: number };
export type PageStat = { path: string; title: string; views: number };

export type InsightsData = {
  period: Period;
  /** 建站以来的累计访问量。 */
  allTimeViews: number;
  /** 建站以来累计事件数（如埋点事件）。 */
  allTimeEvents: number;
  /** 今天（0 点起）的访问量。 */
  todayViews: number;
  /** 所选周期内的总访问量。 */
  periodViews: number;
  /** 所选周期内按天的趋势。 */
  trend: TrendPoint[];
  topPages: PageStat[];
  locations: NamedStat[];
  referrers: NamedStat[];
  browsers: NamedStat[];
};

// ---------------------------------------------------------------------------
// API 原始响应类型（对应 OpenAPI 定义）
// ---------------------------------------------------------------------------

type HitListStat = {
  day: string;
  daily?: number;
  hourly?: number[];
  monthly?: number;
  weekly?: number;
};

type HitList = {
  path: string;
  path_id: number;
  title?: string;
  count: number;
  max?: number;
  stats?: HitListStat[];
};

type HitStat = {
  id?: string;
  name?: string;
  count: number;
  ref_scheme?: string;
};

type TotalResponse = {
  total: number;
  total_events?: number;
  stats: HitListStat[];
};

type HitsResponse = {
  hits: HitList[];
  total?: number;
  more?: boolean;
};

type StatsResponse = {
  stats: HitStat[];
  more?: boolean;
};

// ---------------------------------------------------------------------------
// 基础请求
// ---------------------------------------------------------------------------

export class GoatCounterApiError extends Error {
  readonly code: 'auth' | 'forbidden' | 'rate-limit' | 'http' | 'network';
  readonly status?: number;

  constructor(code: GoatCounterApiError['code'], message: string, status?: number) {
    super(message);
    this.name = 'GoatCounterApiError';
    this.code = code;
    this.status = status;
  }
}

function apiBase(): string {
  return goatCounterConfig.apiHost.replace(/\/+$/, '');
}

/** 是否走同域代理（proxyPath 非空）。 */
function useProxy(): boolean {
  return goatCounterConfig.proxyPath.length > 0;
}

/** 拼接查询串（encodeURIComponent，与 GoatCounter 对 start 等参数均兼容）。 */
function qs(params: Record<string, string | number>): string {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

async function apiGet<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const query = qs(params);
  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (useProxy()) {
    // 同域代理：只请求自己域名（或绝对地址），Key 由代理在服务端附加。
    const proxy = goatCounterConfig.proxyPath.replace(/\/+$/, '');
    url = `${proxy}/api/v0${path}${query}`;
  } else {
    // 直连：浏览器跨域请求 GoatCounter，携带 Authorization。
    url = `${apiBase()}/api/v0${path}${query}`;
    headers.Authorization = `Bearer ${goatCounterConfig.apiKey}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch {
    throw new GoatCounterApiError(
      'network',
      useProxy()
        ? '无法通过本站 /gc 代理连接 GoatCounter API。请确认仓库根目录已包含 functions/gc/[[...rest]].js 并已重新部署。'
        : '无法连接 GoatCounter API（网络或跨域 CORS 错误）。可改用同域代理：在仓库根目录添加 functions/gc/[[...rest]].js，并在 src/config/goatcounter.ts 中设置 proxyPath。',
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string; errors?: Record<string, string[]> };
      detail = body.error ?? (body.errors ? Object.values(body.errors).join('；') : '');
    } catch {
      // 非 JSON 错误体，忽略
    }
    if (res.status === 401) {
      throw new GoatCounterApiError(
        'auth',
        detail ? `${detail}（HTTP 401）` : 'API Key 无效或未提供（HTTP 401）',
        401,
      );
    }
    if (res.status === 403) {
      throw new GoatCounterApiError(
        'forbidden',
        detail ? `${detail}（HTTP 403）` : 'API Key 没有该站点的数据读取权限（HTTP 403）',
        403,
      );
    }
    if (res.status === 429) {
      throw new GoatCounterApiError(
        'rate-limit',
        detail ? `${detail}（HTTP 429）` : '请求过于频繁（HTTP 429）',
        429,
      );
    }
    throw new GoatCounterApiError(
      'http',
      detail ? `${detail}（HTTP ${res.status}）` : `请求失败（HTTP ${res.status}）`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// 时间工具
// ---------------------------------------------------------------------------

/** 建站以来的统计起点（GoatCounter 站点最早也不会早于这个时间）。 */
const ALL_TIME_START = '2000-01-01T00:00:00.000Z';

function startOfDay(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function dateRange(days: number): string[] {
  const daysList: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    daysList.push(d.toISOString().slice(0, 10));
  }
  return daysList;
}

// ---------------------------------------------------------------------------
// 请求节流（GoatCounter 速率限制约 4 req/s，这里按 250ms 间隔发起请求）
// ---------------------------------------------------------------------------

const STAGGER_MS = 250;

function withStagger<T>(task: () => Promise<T>, index: number): Promise<T> {
  if (index === 0) {
    return task();
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      task().then(resolve, reject);
    }, index * STAGGER_MS);
  });
}

// ---------------------------------------------------------------------------
// 看板数据
// ---------------------------------------------------------------------------

function buildTrend(period: Period, stats: HitListStat[]): TrendPoint[] {
  const byDay = new Map<string, HitListStat>();
  for (const stat of stats) {
    byDay.set(stat.day, stat);
  }
  return dateRange(period).map((day) => {
    const stat = byDay.get(day);
    const hourly = stat?.hourly ?? [];
    return {
      day,
      visitors: stat?.daily ?? 0,
      views: hourly.reduce((sum, n) => sum + n, 0),
    };
  });
}

function namedStats(stats: HitStat[], limit: number, fallbackName: string): NamedStat[] {
  return stats
    .map((s) => ({ name: s.name || fallbackName, views: s.count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function fetchInsightsData(period: Period): Promise<InsightsData> {
  const periodStart = startOfDay(period - 1);
  const [allTime, today, periodStats, hits, locations, referrers, browsers] = await Promise.all([
    withStagger(() => apiGet<TotalResponse>('/stats/total', { start: ALL_TIME_START }), 0),
    withStagger(() => apiGet<TotalResponse>('/stats/total', { start: startOfDay(0) }), 1),
    withStagger(() => apiGet<TotalResponse>('/stats/total', { start: periodStart }), 2),
    withStagger(() => apiGet<HitsResponse>('/stats/hits', { start: periodStart, limit: 8 }), 3),
    withStagger(() => apiGet<StatsResponse>('/stats/locations', { start: periodStart }), 4),
    withStagger(() => apiGet<StatsResponse>('/stats/toprefs', { start: periodStart }), 5),
    withStagger(() => apiGet<StatsResponse>('/stats/browsers', { start: periodStart }), 6),
  ]);

  return {
    period,
    allTimeViews: allTime.total,
    allTimeEvents: allTime.total_events ?? 0,
    todayViews: today.total,
    periodViews: periodStats.total,
    trend: buildTrend(period, periodStats.stats ?? []),
    topPages: (hits.hits ?? [])
      .map((h) => ({ path: h.path, title: h.title || h.path, views: h.count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    locations: namedStats(locations.stats ?? [], 6, '未知'),
    referrers: namedStats(referrers.stats ?? [], 6, '直接访问'),
    browsers: namedStats(browsers.stats ?? [], 5, '未知'),
  };
}
