// Cloudflare Pages Function：把本站的 /gc/stats 同域请求代理到 GoatCounter API。
//
// 设计（无路由参数，兼容 wrangler 3.x 严格的路由校验）：
// - 洞察页只请求自己域名的 /gc/stats?api=<api 子路径>&start=...&limit=...；
// - 本函数在 Cloudflare 边缘服务器把请求转发到 GoatCounter，并在服务端附加
//   Authorization，从而绕开浏览器跨域（CORS）、广告拦截器与客户端网络到
//   goatcounter.com 不通的问题；
// - 只允许白名单内的只读 stats 端点，避免被当成开放代理滥用。
//
// 密钥管理：
// - 默认用下方内置的只读 Key（与 src/config/goatcounter.ts 保持一致）；
// - 在 Cloudflare 控制台设置 secret `GOATCOUNTER_API_KEY` 会优先使用它；
// - 设置 `GOATCOUNTER_UPSTREAM` 可改上游主机（自托管 GoatCounter 时用）。

const DEFAULT_UPSTREAM = 'https://ioigf.goatcounter.com';
const FALLBACK_API_KEY = 'q4iela3kwyulj0ye498ld89x22bk9x6yzpuok198g5vvcoaokr';

// 只允许转发这些只读统计端点（GoatCounter /api/v0 下的对应路径）。
const ALLOWED_API_PATHS = new Set([
  '/stats/total',
  '/stats/hits',
  '/stats/locations',
  '/stats/toprefs',
  '/stats/browsers',
]);

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 同源请求（本站「洞察」页）不需要 CORS 头。这里不返回
  // Access-Control-Allow-Origin: *，避免任意第三方站点借这个代理读取本站统计
  // 数据、消耗上游配额。OPTIONS 只作为浏览器预检的兜底，不开放跨域来源。
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 只服务本站发起的请求：同源 fetch 会带 Origin/Referer，二者的 host 必须与
  // 本站 host 一致。直接打开 /gc/stats（如 curl）没有这两个头，允许调试。
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  for (const header of [origin, referer]) {
    if (header) {
      let host;
      try {
        host = new URL(header).host;
      } catch {
        return new Response(JSON.stringify({ error: 'bad origin' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (host !== url.host) {
        return new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  // api 子路径必须命中白名单，如 /stats/total。
  const apiPath = url.searchParams.get('api') || '';
  if (!ALLOWED_API_PATHS.has(apiPath)) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 透传其余查询参数（start、limit 等）。
  const fwd = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== 'api') {
      fwd.set(key, value);
    }
  }

  const upstreamBase = ((env && env.GOATCOUNTER_UPSTREAM) || DEFAULT_UPSTREAM).replace(/\/+$/, '');
  const apiKey = (env && env.GOATCOUNTER_API_KEY) || FALLBACK_API_KEY;
  const query = fwd.toString();
  const target = `${upstreamBase}/api/v0${apiPath}${query ? `?${query}` : ''}`;

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `upstream request failed: ${String(error)}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
