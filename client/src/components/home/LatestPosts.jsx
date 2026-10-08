import KnowledgePostCard from './KnowledgePostCard';

export default function LatestPosts({ posts, loading }) {
  return (
    <section className="qh-section" id="latest">
      <div className="qh-section-head">
        <h2>Latest from the community</h2>
        <p>Fresh posts from the network</p>
      </div>
      {loading && <p className="qh-muted">Loading feed…</p>}
      {!loading && !posts?.length && (
        <p className="qh-muted">No posts yet — be the first to publish.</p>
      )}
      <div className="qh-latest-grid">
        {posts.map((p) => (
          <KnowledgePostCard key={p._id} post={p} />
        ))}
      </div>
    </section>
  );
}
