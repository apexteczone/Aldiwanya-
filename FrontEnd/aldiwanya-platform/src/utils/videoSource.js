export function youtubeId(value) {
 try {
  const u=new URL(value),host=u.hostname.toLowerCase().replace(/^www\./,'');
  if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
  const id=host==='youtu.be'?u.pathname.match(/^\/([\w-]{11})\/?$/)?.[1]:
   ['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)?
    (u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/)?.[1]):null;
  return /^[\w-]{11}$/.test(id||'')?id:null;
 }catch{return null;}
}
export function videoSource(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.pathname === "/watch"
            ? url.searchParams.get("v")
            : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
      return /^[\w-]{11}$/.test(id || "")
        ? { kind: "embed", src: "https://www.youtube-nocookie.com/embed/" + id }
        : null;
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const match = url.pathname.match(
        /^\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?\/?$/i,
      );
      const hash = match?.[2] || url.searchParams.get("h");
      return match
        ? {
            kind: "embed",
            src:
              "https://player.vimeo.com/video/" +
              match[1] +
              (hash && /^[a-f0-9]+$/i.test(hash) ? "?h=" + hash : ""),
          }
        : null;
    }
    return { kind: "file", src: url.href };
  } catch {
    return null;
  }
}
