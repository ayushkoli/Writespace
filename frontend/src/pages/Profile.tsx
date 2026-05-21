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
import ConfirmDialog from '../components/ConfirmDialog';
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
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
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

  const performFollowUnfollow = async () => {
    if (!channel) return;
    try {
      const wasFollowed = channel.isFollowed;
      await authApi.followUnfollow(channel._id);
      setChannel({
        ...channel,
        isFollowed: !channel.isFollowed,
        followersCount: channel.isFollowed ? channel.followersCount - 1 : channel.followersCount + 1,
      });
      if (!wasFollowed) {
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 1200);
      }
      addToast(channel.isFollowed ? 'Unfollowed' : 'Following', 'success');
    } catch {
      // ignore
    }
  };

  const handleFollowClick = () => {
    if (!channel) return;
    if (channel.isFollowed) {
      setShowUnfollowConfirm(true);
    } else {
      performFollowUnfollow();
    }
  };

  const renderStats = (isMobile: boolean) => {
    if (!channel) return null;

    if (isMobile) {
      return (
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <button
            type="button"
            onClick={() => setListModal('following')}
            className="flex flex-col items-center justify-center w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white transition-all active:bg-white/10 active:border-white/20 touch-manipulation cursor-pointer focus:outline-none"
          >
            <span className="text-base font-extrabold tabular-nums leading-none">{channel.followingCount}</span>
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase mt-1">Following</span>
          </button>

          <button
            type="button"
            onClick={() => setListModal('followers')}
            className="flex flex-col items-center justify-center w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white transition-all active:bg-white/10 active:border-white/20 touch-manipulation cursor-pointer focus:outline-none"
          >
            <span className="text-base font-extrabold tabular-nums leading-none">{channel.followersCount}</span>
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase mt-1">Followers</span>
          </button>

          <div className="flex flex-col items-center justify-center w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white">
            <span className="text-base font-extrabold tabular-nums leading-none">{channel.postsCount}</span>
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase mt-1">Posts</span>
          </div>
        </div>
      );
    }

    // Desktop Layout
    return (
      <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8">
        <button
          type="button"
          onClick={() => setListModal('following')}
          className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl"
        >
          <div className="flex items-center justify-center min-w-[3.75rem] h-14 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-extrabold tabular-nums transition-smooth group-hover:border-white/20 group-hover:bg-white/10">
            {channel.followingCount}
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-widest uppercase transition-smooth group-hover:text-text-primary">
            Following
          </span>
        </button>

        <button
          type="button"
          onClick={() => setListModal('followers')}
          className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl"
        >
          <div className="flex items-center justify-center min-w-[3.75rem] h-14 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-extrabold tabular-nums transition-smooth group-hover:border-white/20 group-hover:bg-white/10">
            {channel.followersCount}
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-widest uppercase transition-smooth group-hover:text-text-primary">
            Followers
          </span>
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center min-w-[3.75rem] h-14 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-extrabold tabular-nums">
            {channel.postsCount}
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-widest uppercase">
            Posts
          </span>
        </div>
      </div>
    );
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
          <div className={`rounded-2xl border matte-card overflow-hidden transition-all duration-300 ${
            isGlowing ? 'animate-glow' : 'border-border/60'
          }`}>
            <div className="p-4 sm:p-6">
              {/* Desktop layout */}
              <div className="hidden md:flex flex-row items-center justify-between gap-6">
                {/* Left side: Profile Info */}
                <div className="flex flex-row items-start gap-5 flex-1 min-w-0">
                  <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden bg-white/5 ring-2 ring-white/10">
                    {channel.profilePhoto ? (
                      <img src={channel.profilePhoto} alt={channel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-text-muted">
                        {channel.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{channel.name}</h1>
                      <p className="text-text-muted font-medium mt-0.5">@{channel.username}</p>
                    </div>

                    {channel.bio && (
                      <p className="text-text-primary text-base leading-relaxed">{channel.bio}</p>
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
                  </div>
                </div>

                {/* Right side: Stats & Follow Button */}
                <div className="flex flex-col items-stretch gap-3.5 shrink-0">
                  {renderStats(false)}

                  {isOwnProfile ? (
                    <Link
                      to="/settings"
                      className="flex items-center justify-center w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white font-extrabold text-sm uppercase tracking-widest transition-smooth hover:bg-white/10 hover:border-white/20 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    currentUser && (
                      <button
                        type="button"
                        onClick={handleFollowClick}
                        className={`w-full h-12 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-smooth touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                          channel.isFollowed
                            ? 'border border-white/10 bg-white/5 text-white hover:border-red-500/50 hover:text-red-400 hover:bg-red-950/20'
                            : 'bg-white text-black hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {channel.isFollowed ? 'Following' : 'Follow'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Mobile layout */}
              <div className="block md:hidden space-y-4">
                {/* Row 1: Avatar & Info Side-by-Side */}
                <div className="flex items-center gap-4.5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-white/5 ring-2 ring-white/10">
                    {channel.profilePhoto ? (
                      <img src={channel.profilePhoto} alt={channel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-extrabold text-text-muted">
                        {channel.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight leading-tight">{channel.name}</h1>
                    <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">@{channel.username}</p>
                  </div>
                </div>

                {/* Row 2: Bio, Name & Info */}
                <div className="space-y-3">
                  {channel.bio && (
                    <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{channel.bio}</p>
                  )}

                  {/* Row 3: Metadata */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted">
                    {channel.country && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {channel.country}
                      </span>
                    )}
                    {channel.website && (
                      <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <a href={channel.website} target="_blank" rel="noopener noreferrer" className="text-white hover:underline truncate">
                          {channel.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      Joined {new Date(channel.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Row 4: Stats counts in 3 columns grid */}
                {renderStats(true)}

                {/* Row 5: Follow / Edit Button */}
                {isOwnProfile ? (
                  <Link
                    to="/settings"
                    className="flex items-center justify-center w-full h-10 rounded-xl border border-white/10 bg-white/5 text-white font-extrabold text-xs uppercase tracking-widest transition-smooth hover:bg-white/10 hover:border-white/30 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  currentUser && (
                    <button
                      type="button"
                      onClick={handleFollowClick}
                      className={`w-full h-10 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-smooth touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                        channel.isFollowed
                          ? 'border border-white/10 bg-white/5 text-white'
                          : 'bg-white text-black border border-transparent'
                      }`}
                    >
                      {channel.isFollowed ? 'Following' : 'Follow'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 px-3 sm:px-6">
          <h2 className="text-sm font-extrabold text-text-secondary uppercase tracking-widest mb-3">Posts</h2>
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

      {channel && (
        <ConfirmDialog
          isOpen={showUnfollowConfirm}
          title={`Unfollow @${channel.username}?`}
          message="Their posts will no longer show up in your feed. You can follow them again later."
          confirmLabel="Unfollow"
          cancelLabel="Cancel"
          danger={true}
          onClose={() => setShowUnfollowConfirm(false)}
          onConfirm={async () => {
            await performFollowUnfollow();
            setShowUnfollowConfirm(false);
          }}
        />
      )}
    </>
  );
}
