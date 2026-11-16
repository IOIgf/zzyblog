// Cloudflare Pages Function：把本站的 /gc/... 同域请求代理到 GoatCounter。
//
// 作用：
// - 洞察页只请求自己域名下的 /gc/api/v0/...，完全绕开浏览器跨域（CORS）；
// - 请求不落到 *.goatcounter.com，因此不会被广告拦截器误拦；
// - 由 Cloudflare 边缘服务器在服务端转发到 GoatCounter，客户端网络到
//   goatcounter.com 不通时也能取到数据；
// - API Key 只在服务端附加，不再随前端 JS 下发。
//
// 部署：Cloudflare Pages（Git 集成）会自动识别本目录，无需额外配置。
// 若想在 Cloudflare 控制台用 secret 管理 Key：设置 `GOATCOUNTER_API_KEY`，
// 它会优先于下面的 FALLBACK 值。

const UPSTREAM = 'https://ioigf.goatcounter.com';
const FALLBACK_API_KEY = 'q4iela3kwyulj0ye498ld89x22bk9x6yzpuok198g5vvcoaokr';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 去掉 /gc 前缀后只允许转发 GoatCounter API，避免被当成开放代理滥用。
  const rest = url.pathname.replace(/^\/gc\/?/, '');
  if (!rest.startsWith('api/v0/')) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 预检请求（跨域调试场景）。
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
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

  const apiKey = (env && env.GOATCOUNTER_API_KEY) || FALLBACK_API_KEY;
  const target = `${UPSTREAM}/${rest}${url.search}`;

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
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `upstream request failed: ${String(error)}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
