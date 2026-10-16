import { fileURLToPath } from "node:url";
// Replace only the external YouTube API in automated tests. App + database remain real.
export async function mockYouTube(page) {
  await page.route("https://media.example.test/flower.mp4", (route) =>
    route.fulfill({
      path: fileURLToPath(new URL("./fixtures/flower.mp4", import.meta.url)),
      contentType: "video/mp4",
    }),
  );
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
  window.YT={Player:function(element,options){
   const video=document.createElement('video');video.src='https://media.example.test/flower.mp4';video.controls=true;video.dataset.youtubeId=options.videoId;video.style.cssText='width:100%;height:100%;display:block';
   element.replaceWith(video);
   this.getIframe=()=>video;this.playVideo=()=>video.play();this.pauseVideo=()=>video.pause();this.mute=()=>video.muted=true;this.unMute=()=>video.muted=false;this.destroy=()=>video.remove();
   video.addEventListener('play',()=>options.events.onStateChange({data:1}));
   video.addEventListener('pause',()=>options.events.onStateChange({data:2}));
   setTimeout(()=>options.events.onReady({target:this}),0);
  }};
  window.onYouTubeIframeAPIReady?.();
 `,
    }),
  );
}
