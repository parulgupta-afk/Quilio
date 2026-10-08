import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../UserAvatar';
import { postHref, readingMinutes, cleanExcerpt, categoryLabel } from './utils';

export default function KnowledgePostCard({ post, variant = 'default' }) {
  const { isAuthenticated } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const href = postHref(post);
  const mins = readingMinutes(post);
  const excerpt = cleanExcerpt(post, variant === 'featured' ? 110 : 140);

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || busy) return;
    setBusy(true);
    try {
      if (bookmarked) {
        await api.delete(`/social/bookmark/${post._id}`);
        setBookmarked(false);
      } else {
        await api.post(`/social/bookmark/${post._id}`);
        setBookmarked(true);
      }
    } catch {
      /* already bookmarked etc. */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link to={href} className={`qh-card qh-card-${variant}`}>
      <div className="qh-card-media">
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt="" loading="lazy" />
        ) : (
          <div className="qh-card-media-fallback" aria-hidden>
            <span>{(post.title || 'Q').charAt(0)}</span>
          </div>
        )}
        <span className="qh-card-cat">{categoryLabel(post)}</span>
      </div>
      <div className="qh-card-body">
        <h3 className="qh-card-title">{post.title}</h3>
        {excerpt && <p className="qh-card-desc">{excerpt}</p>}
        <div className="qh-card-meta">
          <div className="qh-card-author">
            <UserAvatar
              src={post.author?.avatarUrl}
              name={post.author?.name}
              size={22}
            />
            <span>{post.author?.name || 'Author'}</span>
          </div>
          <span className="qh-card-read">{mins} min</span>
        </div>
        <div className="qh-card-foot">
          <div className="qh-card-tags">
            {(post.tags || []).slice(0, 3).map((t) => (
              <span key={t}>#{t}</span>
            ))}
            <span className="qh-ai-pill">AI</span>
          </div>
          <button
            type="button"
            className={`qh-bookmark ${bookmarked ? 'on' : ''}`}
            onClick={toggleBookmark}
            aria-label="Bookmark"
            title="Bookmark"
          >
            {bookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
    </Link>
  );
}
