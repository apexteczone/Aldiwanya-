// Adapted from Mayar's URL extraction. Never fetch an administrator-supplied URL.
export function extractYouTubeVideoId(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('أدخل رابط YouTube صحيحًا.', {cause:422}); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new Error('يجب استخدام رابط YouTube آمن.', {cause:422});
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  let id;
  if (host === 'youtu.be') id = url.pathname.match(/^\/([\w-]{11})\/?$/)?.[1];
  else if (['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/)?.[1];
  }
  if (!id || !/^[\w-]{11}$/.test(id)) throw new Error('أدخل رابط فيديو YouTube صحيحًا، وليس رابط قناة أو قائمة تشغيل.', {cause:422});
  return id;
}
