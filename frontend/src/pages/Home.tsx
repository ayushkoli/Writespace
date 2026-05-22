import { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types';
import { postApi } from '../api';
import PostCard from '../components/PostCard';
import PostGrid from '../components/PostGrid';
import MobilePageHeader from '../components/MobilePageHeader';
import { SkeletonFeed } from '../components/Skeleton';
import { PAGE_SHELL } from '../components/Layout';

type FeedTab = 'all' | 'following';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FeedTab>('all');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } =
        tab === 'following' ? await postApi.getFollowingFeed() : await postApi.getAllPosts();
      setPosts(data.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchPosts();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchPosts]);

  return (
    <div className={PAGE_SHELL}>
      <MobilePageHeader title="Home">
        <div className="flex border-t border-border/60 md:border-0 md:mt-4 md:-mb-px">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors border-b-2 touch-manipulation ${
              tab === 'all'
                ? 'border-white text-text-primary'
                : 'border-transparent text-text-secondary active:bg-white/5'
            }`}
          >
            For you
          </button>
          <button
            type="button"
            onClick={() => setTab('following')}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors border-b-2 touch-manipulation ${
              tab === 'following'
                ? 'border-white text-text-primary'
                : 'border-transparent text-text-secondary active:bg-white/5'
            }`}
          >
            Following
          </button>
        </div>
      </MobilePageHeader>

      {loading ? (
        <SkeletonFeed />
      ) : posts.length === 0 ? (
        <div className="px-6 py-14 sm:p-16 text-center animate-fade-in">
          <p className="text-lg sm:text-2xl font-extrabold text-text-primary mb-2 tracking-tight">
            {tab === 'following' ? 'Nothing from people you follow' : 'Nothing here yet'}
          </p>
          <p className="text-text-secondary text-sm sm:text-lg leading-relaxed">
            {tab === 'following'
              ? 'Follow accounts to see their posts in this feed.'
              : 'Be the first to post something.'}
          </p>
        </div>
      ) : (
        <PostGrid>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={fetchPosts} />
          ))}
        </PostGrid>
      )}
    </div>
  );
}
