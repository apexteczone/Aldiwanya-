import useResource from "../../hooks/useResource";
import {
  Empty,
  Hero,
  ResourceState,
  VideoCard,
} from "../../components/common/PlatformUI";
import { PlayCircle } from "lucide-react";
export default function PreviewsPage() {
  const resource = useResource("/previews");
  return (
    <>
      <Hero
        title="جرّب قبل أن تشترك"
        subtitle="شاهد جزءًا من المحتوى التعليمي مجانًا"
        compact
      />
      <section className="site-container section">
        <h2>المعاينات المجانية</h2>
        <ResourceState resource={resource}>
          {resource.data?.length ? (
            <div className="card-grid">
              {resource.data.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
          ) : (
            <Empty icon={PlayCircle}>لا توجد فيديوهات مجانية منشورة بعد.</Empty>
          )}
        </ResourceState>
      </section>
    </>
  );
}
