import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Link as LinkIcon, MapPin, Settings } from 'lucide-react';
import type { Post } from '../types';
import { authApi, postApi } from '../api';
import PostCard from '../components/PostCard';
import PostGrid from '../components/PostGrid';
import UserListModal from '../components/UserListModal';
import MobilePageHeader from '../components/MobilePageHeader';
import { SkeletonProfile } from '../components/Skeleton';
import { PAGE_SHELL } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ChannelData {
  _id: string;
  name: string;
  username: string;
  bio: string;
  profilePhoto: string;
  country: string;
  website: string;
  isVerified: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
  createdAt?: string;
}

type ListModal = 'followers' | 'following' | null;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState<ListModal>(null);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const isOwnProfile = currentUser?.username === username;

  const fetchData = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const channelRes = await authApi.getUserChannel(username);
      const channelData = channelRes.data.data;
      setChannel(channelData);

      const postsRes = await postApi.getUserPosts(channelData._id);
      setPosts(postsRes.data.data || []);
    } catch {
      setChannel(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleFollow = async () => {
    if (!channel) return;
    try {
      await authApi.followUnfollow(channel._id);
      setChannel({
        ...channel,
        isFollowed: !channel.isFollowed,
        followersCount: channel.isFollowed ? channel.followersCount - 1 : channel.followersCount + 1,
      });
      addToast(channel.isFollowed ? 'Unfollowed' : 'Following', 'success');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  if (!channel) {
    return (
      <div className="p-10 sm:p-16 text-center animate-fade-in">
        <p className="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${PAGE_SHELL} animate-fade-in pb-8`}>
        <MobilePageHeader
          title="Profile"
          showLogo={isOwnProfile}
          onBack={isOwnProfile ? undefined : () => navigate(-1)}
          rightAction={
            isOwnProfile ? (
              <Link
                to="/settings"
                className="p-2.5 rounded-full hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-text-primary" />
              </Link>
            ) : undefined
          }
        />

        <div className="px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="rounded-2xl border border-border/60 bg-surface-2 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full overflow-hidden bg-surface-3 ring-2 ring-border/60">
                  {channel.profilePhoto ? (
                    <img src={channel.profilePhoto} alt={channel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-text-muted">
                      {channel.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">{channel.name}</h1>
                      <p className="text-text-muted font-medium mt-0.5">@{channel.username}</p>
                    </div>

                    {!isOwnProfile && currentUser && (
                      <button
                        type="button"
                        onClick={handleFollow}
                        className={`shrink-0 self-start px-5 sm:px-6 py-2 rounded-full font-bold text-sm transition-all touch-manipulation ${
                          channel.isFollowed
                            ? 'border border-border text-text-primary hover:border-red-500/80 hover:text-red-400'
                            : 'bg-white text-black hover:bg-gray-200'
                        }`}
                      >
                        {channel.isFollowed ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {channel.bio && (
                    <p className="text-text-primary text-[15px] sm:text-base leading-relaxed">{channel.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                    {channel.country && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {channel.country}
                      </span>
                    )}
                    {channel.website && (
                      <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <a href={channel.website} target="_blank" rel="noopener noreferrer" className="text-white hover:underline truncate">
                          {channel.website}
                        </a>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      Joined {new Date(channel.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setListModal('following')}
                      className="px-3.5 py-2 rounded-xl border border-border/70 bg-surface-3/40 hover:bg-surface-3/70 active:bg-surface-3 transition-colors touch-manipulation"
                    >
                      <strong className="text-text-primary font-extrabold tabular-nums">{channel.followingCount}</strong>{' '}
                      <span className="text-text-muted">Following</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListModal('followers')}
                      className="px-3.5 py-2 rounded-xl border border-border/70 bg-surface-3/40 hover:bg-surface-3/70 active:bg-surface-3 transition-colors touch-manipulation"
                    >
                      <strong className="text-text-primary font-extrabold tabular-nums">{channel.followersCount}</strong>{' '}
                      <span className="text-text-muted">Followers</span>
                    </button>
                    <span className="px-3.5 py-2 rounded-xl border border-border/70 bg-surface-3/40">
                      <strong className="text-text-primary font-extrabold tabular-nums">{channel.postsCount}</strong>{' '}
                      <span className="text-text-muted">Posts</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 px-1">
          <h2 className="text-sm font-extrabold text-text-secondary uppercase tracking-widest mb-3 px-1">Posts</h2>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 p-10 sm:p-16 text-center bg-surface-2/20">
              <p className="text-xl font-extrabold text-text-primary mb-2">No posts yet</p>
              <p className="text-text-secondary">When they post, their posts will show up here.</p>
            </div>
          ) : (
            <PostGrid>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </PostGrid>
          )}
        </div>
      </div>

      {listModal && username && (
        <UserListModal username={username} type={listModal} onClose={() => setListModal(null)} />
      )}
    </>
  );
}
