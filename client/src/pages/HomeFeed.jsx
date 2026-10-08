import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import WorkspaceShell from '../components/workspace/WorkspaceShell';
import HeroSection from '../components/home/HeroSection';
import FeaturedPosts from '../components/home/FeaturedPosts';
import ContinueLearning from '../components/home/ContinueLearning';
import AIKnowledgeSection from '../components/home/AIKnowledgeSection';
import ExploreTopics from '../components/home/ExploreTopics';
import TrendingPosts from '../components/home/TrendingPosts';
import LatestPosts from '../components/home/LatestPosts';

export default function HomeFeed() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('latest');
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    let ok = true;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res =
          isAuthenticated && feedType === 'for-you'
            ? await api.get('/recommend/feed')
            : await api.get('/posts');
        if (!ok) return;
        setPosts(res.data.posts || res.data || []);
      } catch {
        if (ok) setPosts([]);
      } finally {
        if (ok) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      ok = false;
    };
  }, [isAuthenticated, feedType]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAttempts([]);
      return undefined;
    }
    let ok = true;
    api
      .get('/learn/progress/me')
      .then((r) => {
        if (ok) setAttempts(Array.isArray(r.data) ? r.data : r.data?.attempts || []);
      })
      .catch(() => {
        if (ok) setAttempts([]);
      });
    return () => {
      ok = false;
    };
  }, [isAuthenticated]);

  const list = Array.isArray(posts) ? posts : [];

  const tagStats = useMemo(() => {
    const map = new Map();
    for (const p of list) {
      for (const t of p.tags || []) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [list]);

  return (
    <WorkspaceShell
      title="Home"
      subtitle="Your knowledge feed"
      actions={
        <>
          <Link to="/search" className="ag-btn-ghost">
            Search
          </Link>
          <Link to="/write" className="ag-btn-primary">
            + New post
          </Link>
        </>
      }
    >
      <div className="qh-home">
        <div className="qh-feed-tabs">
          <button
            type="button"
            className={feedType === 'for-you' ? 'on' : ''}
            onClick={() => setFeedType('for-you')}
          >
            For You
          </button>
          <button
            type="button"
            className={feedType === 'latest' ? 'on' : ''}
            onClick={() => setFeedType('latest')}
          >
            Latest
          </button>
        </div>

        <HeroSection />
        <FeaturedPosts posts={list} />
        <ContinueLearning attempts={attempts} />
        <AIKnowledgeSection />
        <ExploreTopics tags={tagStats} />
        <TrendingPosts posts={list} />
        <LatestPosts posts={list} loading={loading} />
      </div>
    </WorkspaceShell>
  );
}
