import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import type { Post } from '../types';
import { postApi } from '../api';
import PostCard from '../components/PostCard';
import PostGrid from '../components/PostGrid';
import MobilePageHeader from '../components/MobilePageHeader';
import { SkeletonFeed } from '../components/Skeleton';
import { PAGE_SHELL } from '../components/Layout';

export default function Saved() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await postApi.getSavedPosts();
        setPosts(data.data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className={PAGE_SHELL}>
      <MobilePageHeader title="Saved" />

      {loading ? (
        <SkeletonFeed />
      ) : posts.length === 0 ? (
        <div className="px-6 py-14 sm:p-16 text-center animate-fade-in">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-text-muted" />
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-text-primary mb-2">No saved posts</p>
          <p className="text-text-secondary text-sm sm:text-lg">Bookmark posts to find them later.</p>
        </div>
      ) : (
        <PostGrid>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </PostGrid>
      )}
    </div>
  );
}
