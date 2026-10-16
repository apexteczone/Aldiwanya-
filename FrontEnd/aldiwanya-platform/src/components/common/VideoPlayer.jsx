import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { youtubeId, videoSource } from "../../utils/videoSource";
let youtubeReady;
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeReady)
    youtubeReady = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timer = window.setTimeout(() => {
        youtubeReady = null;
        reject(new Error("timeout"));
      }, 20000);
      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timer);
        previous?.();
        resolve(window.YT);
      };
      const existing = document.querySelector("script[data-youtube-player]");
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.dataset.youtubePlayer = "true";
        script.onerror = () => {
          window.clearTimeout(timer);
          script.remove();
          youtubeReady = null;
          reject(new Error("load"));
        };
        document.head.appendChild(script);
      }
    });
  return youtubeReady;
}
function YouTubePlayer({ id, title, onPlay, onError }) {
  const holder = useRef(null),
    container = useRef(null),
    player = useRef(null),
    callbacks = useRef({ onPlay, onError });
  const [state, setState] = useState({
      ready: false,
      playing: false,
      muted: false,
      error: "",
    }),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    callbacks.current = { onPlay, onError };
  }, [onPlay, onError]);
  useEffect(() => {
    let disposed = false,
      instance;
    const element = document.createElement("div");
    holder.current.replaceChildren(element);
    loadYouTube()
      .then((YT) => {
        if (disposed) return;
        instance = new YT.Player(element, {
          host: "https://www.youtube-nocookie.com",
          videoId: id,
          width: "100%",
          height: "100%",
          playerVars: {
            controls: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!disposed) {
                instance.getIframe().title = title || "فيديو الدرس";
                setState({
                  ready: true,
                  playing: false,
                  muted: false,
                  error: "",
                });
              }
            },
            onStateChange: (e) => {
              if (!disposed) {
                setState((s) => ({ ...s, playing: e.data === 1 }));
                if (e.data === 1) callbacks.current.onPlay?.();
              }
            },
            onError: () => {
              if (!disposed) {
                setState((s) => ({
                  ...s,
                  error:
                    "تعذر تشغيل الفيديو. قد يكون غير متاح أو لا يسمح بالتضمين.",
                }));
                callbacks.current.onError?.();
              }
            },
          },
        });
        player.current = instance;
      })
      .catch(() => {
        if (!disposed)
          setState((s) => ({
            ...s,
            error: "تعذر تحميل مشغل الفيديو. تحقق من اتصال الإنترنت.",
          }));
      });
    return () => {
      disposed = true;
      instance?.destroy();
      player.current = null;
    };
  }, [id, title, revision]);
  const retry = () => {
    setState({ ready: false, playing: false, muted: false, error: "" });
    setRevision((v) => v + 1);
  };
  return (
    <div className="lesson-video-player" ref={container}>
      <div className="lesson-video-frame" ref={holder} />
      {!state.ready && !state.error && (
        <p role="status" className="player-status">
          جاري تحميل الفيديو…
        </p>
      )}
      {state.error && (
        <p role="alert" className="player-status">
          {state.error}{" "}
          <button type="button" onClick={retry}>
            حاول مجددًا
          </button>
        </p>
      )}
      <div className="lesson-player-controls" dir="rtl">
        <span>{title || "فيديو الدرس"}</span>
        <button
          type="button"
          disabled={!state.ready}
          aria-label={state.playing ? "إيقاف مؤقت" : "تشغيل الفيديو"}
          onClick={() =>
            state.playing
              ? player.current.pauseVideo()
              : player.current.playVideo()
          }
        >
          {state.playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          type="button"
          disabled={!state.ready}
          aria-label={state.muted ? "تشغيل الصوت" : "كتم الصوت"}
          onClick={() => {
            state.muted ? player.current.unMute() : player.current.mute();
            setState((s) => ({ ...s, muted: !s.muted }));
          }}
        >
          {state.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          type="button"
          aria-label="ملء الشاشة"
          onClick={() => {
            const result = document.fullscreenElement
              ? document.exitFullscreen?.()
              : container.current?.requestFullscreen?.();
            result?.catch(() => {});
          }}
        >
          <Maximize size={19} />
        </button>
      </div>
    </div>
  );
}
export default function VideoPlayer({
  videoId,
  src,
  title,
  poster,
  onPlay,
  onError,
}) {
  const id = videoId || youtubeId(src);
  if (id && /^[\w-]{11}$/.test(id))
    return (
      <YouTubePlayer
        key={id}
        id={id}
        title={title}
        onPlay={onPlay}
        onError={onError}
      />
    );
  const source = videoSource(src);
  if (!source)
    return <p role="status">أدخل رابط فيديو HTTPS صالحًا لعرض المعاينة.</p>;
  if (source.kind === "embed")
    return (
      <iframe
        title={title || "معاينة الفيديو"}
        src={source.src}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ width: "100%", aspectRatio: "16/9", border: 0 }}
      />
    );
  return (
    <video
      src={source.src}
      poster={poster || undefined}
      controls
      playsInline
      preload="metadata"
      onPlay={onPlay}
      onError={onError}
      style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain" }}
    >
      <track kind="captions" />
    </video>
  );
}
