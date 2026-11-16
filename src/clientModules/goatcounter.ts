// GoatCounter 访问跟踪 clientModule：注入官方 count.js，并手动上报
// Docusaurus 的客户端路由切换（SPA）。
//
// 原理（见官方文档 https://goatcounter.com/help/spa）：
// - 通过 `window.goatcounter = { no_onload: true }` 关闭 count.js 的自动上报，
//   改由这里在「当前路由 + 每次 pushState/popstate」时调用 `goatcounter.count()`，
//   保证每个路由切换只上报一次，且 URL 是 Docusaurus 规范化之后的结果；
// - count.js 是异步加载的，轮询等待其暴露 `count()` 方法后再开始上报；
// - 上报前调用 `filter()`，跳过被 GoatCounter 过滤掉的请求（本地地址、爬虫等）。
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { goatCounterConfig, isTrackingConfigured } from '@site/src/config/goatcounter';

declare global {
  interface Window {
    goatcounter?: {
      count?: (vars?: Record<string, unknown>) => void;
      filter?: () => string | false;
      no_onload?: boolean;
      allow_local?: boolean;
    };
  }
}

if (ExecutionEnvironment.canUseDOM && isTrackingConfigured()) {
  // 防止模块被重复初始化（如热更新）导致路由上报被包装多次
  const globalFlag = (window as { __gcTrackInstalled?: boolean }).__gcTrackInstalled;
  if (!globalFlag) {
    (window as { __gcTrackInstalled?: boolean }).__gcTrackInstalled = true;

    // 必须在 count.js 加载前设置，否则首次访问可能先于设置自动上报。
    window.goatcounter = {
      no_onload: true,
      ...(goatCounterConfig.allowLocal ? { allow_local: true } : {}),
    };

    const script = document.createElement('script');
    script.src = goatCounterConfig.scriptSrc;
    script.async = true;
    script.setAttribute('data-goatcounter', goatCounterConfig.endpoint);
    document.head.appendChild(script);

    const currentPath = () => location.pathname + location.search + location.hash;

    function track(): void {
      const gc = window.goatcounter;
      if (!gc?.count) {
        return;
      }
      const filterReason = gc.filter ? gc.filter() : false;
      if (filterReason) {
        if (process.env.NODE_ENV === 'development') {
          console.info(`[goatcounter] 本次访问被过滤：${filterReason}`);
        }
        return;
      }
      gc.count({ path: currentPath() });
    }

    // count.js 异步加载；等它暴露 count() 后再上报当前路由（初始加载的一次计数）。
    // 若脚本被广告拦截器屏蔽，count() 永远不会出现，轮询最多持续 30 秒。
    let ready = false;
    let polls = 0;
    const timer = window.setInterval(() => {
      polls += 1;
      if (window.goatcounter?.count) {
        window.clearInterval(timer);
        ready = true;
        track();
        return;
      }
      if (polls >= 300) {
        window.clearInterval(timer);
      }
    }, 100);

    // Docusaurus 通过 history.pushState 做客户端导航；浏览器前进/后退触发 popstate。
    const originalPushState = window.history.pushState;
    window.history.pushState = function pushState(
      this: History,
      ...args: Parameters<typeof originalPushState>
    ): void {
      const result = originalPushState.apply(this, args);
      if (ready) {
        track();
      }
      return result;
    };

    window.addEventListener('popstate', () => {
      if (ready) {
        track();
      }
    });
  }
}

export {};
