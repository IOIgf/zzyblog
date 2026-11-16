// A quiet hello for anyone who opens the DevTools console.
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const accent =
    getComputedStyle(document.documentElement).getPropertyValue('--ifm-color-primary').trim() ||
    '#1d9bf0';

  const wordmark = `color:${accent};font-size:40px;font-weight:800;letter-spacing:-0.03em`;
  const muted = 'color:#8899a6;font-size:13px;line-height:1.6';

  console.log('%cMilk_Dragon', wordmark);
  console.log(
    '%cOIer · Developer · Blogger — https://ccbserver.qzz.io\n' +
      'Source: https://github.com/IOIgf/zzyblog',
    muted
  );
}
