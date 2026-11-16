/**
 * GoatCounter 网站统计配置。
 *
 * GoatCounter：https://goatcounter.com （开源、免 GDPR 声明的隐私友好统计服务）
 *
 * 使用步骤：
 * 1. 在 GoatCounter 上注册并创建站点（免费版足够个人博客使用）：
 *    - 云版：站点会分配一个域名 code，如 `https://yourcode.goatcounter.com`
 *    - 自托管：部署到你自己的域名，如 `https://stats.example.com`
 * 2. 创建 API Key（账号 → 右上角用户名 → API；只读权限即可）：
 *    https://goatcounter.com/help/api
 * 3. 把下面的字段填好并把 `enabled` 改为 `true`。
 *
 * 填好后：
 * - 全站会自动上报访问（通过注入官方 count.js，含 SPA 路由切换）；
 * - 「洞察」页（/insights）会从 API 拉取数据并渲染看板。
 */
export type GoatCounterConfig = {
  /** 总开关。false 时不注入统计脚本，洞察页显示未配置提示。 */
  enabled: boolean;
  /**
   * 跟踪脚本地址。
   * 云版用官方公共地址 `https://gc.zgo.at/count.js`；
   * 自托管用 `https://你的域名/count.js`（可配 SRI，见官方文档 "Use SRI with count.js?"）。
   */
  scriptSrc: string;
  /**
   * 访问上报端点（count.js 的 `data-goatcounter` 属性）。
   * 云版：`https://<code>.goatcounter.com/count`；
   * 自托管：`https://你的域名/count`。
   */
  endpoint: string;
  /**
   * API 主机（不带 `/api/v0` 后缀）。
   * 云版：`https://<code>.goatcounter.com`；
   * 自托管：`https://你的域名`。
   * 若浏览器直连被 CORS 拦截，可在 Web 服务器加一个转发到 GoatCounter
   * 的 `/gc-api` 代理并指向它（见「洞察」页的错误提示）。
   */
  apiHost: string;
  /** API Key（账号 → API 中创建，只读即可）。 */
  apiKey: string;
  /** 是否允许本地（localhost/内网）请求上报，方便本地调试；默认 true。 */
  allowLocal: boolean;
};

export const goatCounterConfig: GoatCounterConfig = {
  enabled: true,
  scriptSrc: 'https://gc.zgo.at/count.js',
  endpoint: 'https://ioigf.goatcounter.com/count',
  apiHost: 'https://ioigf.goatcounter.com',
  apiKey: 'q4iela3kwyulj0ye498ld89x22bk9x6yzpuok198g5vvcoaokr',
  allowLocal: true,
};

/** 是否已具备上报访问所需的配置。 */
export function isTrackingConfigured(): boolean {
  const { enabled, endpoint } = goatCounterConfig;
  return enabled && endpoint.length > 0;
}

/** 是否已具备从 API 拉取数据所需的配置。 */
export function isInsightsConfigured(): boolean {
  const { enabled, apiHost, apiKey } = goatCounterConfig;
  return enabled && apiHost.length > 0 && apiKey.length > 0;
}
