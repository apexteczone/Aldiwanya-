import { videoSource } from "../../utils/videoSource";
export default function VideoPlayer({ src, title, poster, onPlay, onError }) {
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
        onLoad={onPlay}
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
