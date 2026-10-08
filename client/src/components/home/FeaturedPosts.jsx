import KnowledgePostCard from './KnowledgePostCard';

export default function FeaturedPosts({ posts }) {
  if (!posts?.length) return null;
  return (
    <section className="qh-section">
      <div className="qh-section-head">
        <h2>Featured for you</h2>
        <p>Curated from the live feed</p>
      </div>
      <div className="qh-featured-grid">
        {posts.slice(0, 3).map((p) => (
          <KnowledgePostCard key={p._id} post={p} variant="featured" />
        ))}
      </div>
    </section>
  );
}
