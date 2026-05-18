import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Bookmark, MessageCircle, Trash2, Pencil } from 'lucide-react';
import type { Post, User, Comment } from '../types';
import { postApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { listIncludesUserId } from '../utils/postEngagement';
import { getPostColorScheme, isGradientPostBackground } from '../constants/postColors';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import MobilePageHeader from '../components/MobilePageHeader';
import { SkeletonPostCard } from '../components/Skeleton';
import { PAGE_SHELL } from '../components/Layout';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [engagementBusy, setEngagementBusy] = useState<'like' | 'save' | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deletePostOpen, setDeletePostOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchPost = async () => {
    if (!postId) return;
    try {
      const { data } = await postApi.getPostById(postId);
      setPost(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleComment = async () => {
    if (!comment.trim() || !postId) return;
    setSubmitting(true);
    try {
      await postApi.addComment(postId, comment);
      setComment('');
      fetchPost();
      addToast('Reply posted', 'success');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePost = async () => {
    if (!post) return;
    setDeleteBusy(true);
    try {
      await postApi.deletePost(post._id);
      setDeletePostOpen(false);
      addToast('Post deleted', 'success');
      window.history.back();
    } catch {
      // ignore
    } finally {
      setDeleteBusy(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentId || !postId) return;
    setDeleteBusy(true);
    try {
      await postApi.deleteComment(postId, deleteCommentId);
      setDeleteCommentId(null);
      fetchPost();
      addToast('Reply deleted', 'success');
    } catch {
      // ignore
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post || engagementBusy) return;
    setEngagementBusy('like');
    try {
      const { data } = await postApi.toggleLike(post._id);
      const updated = data.data as Post;
      setPost((prev) =>
        !prev ? null : { ...prev, likes: updated.likes, saves: updated.saves, userId: updated.userId }
      );
    } catch {
      // ignore
    } finally {
      setEngagementBusy(null);
    }
  };

  const handleSave = async () => {
    if (!user || !post || engagementBusy) return;
    setEngagementBusy('save');
    try {
      const { data } = await postApi.toggleSave(post._id);
      const updated = data.data as Post;
      setPost((prev) =>
        !prev ? null : { ...prev, likes: updated.likes, saves: updated.saves, userId: updated.userId }
      );
    } catch {
      // ignore
    } finally {
      setEngagementBusy(null);
    }
  };

  if (loading) {
    return (
      <div className={`${PAGE_SHELL} animate-fade-in px-3 sm:px-6 pt-4 pb-12`}>
        <MobilePageHeader title="Post" showLogo={false} onBack={() => window.history.back()} />
        <div className="mt-4 space-y-4">
          <SkeletonPostCard />
          <div className="rounded-3xl border border-border/60 bg-surface-2/30 h-28 animate-pulse-soft" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <p className="text-2xl font-extrabold text-text-primary mb-2">Post not found</p>
      </div>
    );
  }

  const author = (typeof post.userId === 'string' ? {} : post.userId) as User;
  const colorScheme = getPostColorScheme(post.color);
  const onGradient = isGradientPostBackground(post.color);
  const liked = listIncludesUserId(post.likes, user?._id);
  const saved = listIncludesUserId(post.saves, user?._id);
  const isOwner =
    user &&
    (typeof post.userId === 'object' ? (post.userId as User)._id === user._id : post.userId === user._id);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <>
    <div className={`${PAGE_SHELL} animate-fade-in pb-8 md:pb-12`}>
      <MobilePageHeader title="Post" showLogo={false} onBack={() => window.history.back()} />

      <div className="px-3 sm:px-6 pt-3 sm:pt-6 space-y-3 sm:space-y-4">
        <article
          className={`${colorScheme.bg} rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-lg md:shadow-xl shadow-black/20`}
        >
          <div className="p-4 sm:p-8">
            <div className="flex gap-4">
              <Link to={`/profile/${author.username}`} className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${
                    onGradient ? 'ring-white/20' : 'ring-border'
                  }`}
                >
                  {author.profilePhoto ? (
                    <img src={author.profilePhoto} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-extrabold bg-surface-3 text-text-muted">
                      {author.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/profile/${author.username}`}
                    className={`font-extrabold text-lg ${colorScheme.text} hover:opacity-80 transition truncate`}
                  >
                    {author.name}
                  </Link>
                  <span className={`${colorScheme.accent} text-sm font-medium`}>@{author.username}</span>
                  <span className={`${colorScheme.accent} text-sm`}>·</span>
                  <time className={`${colorScheme.accent} text-sm font-medium`}>{timeAgo(post.createdAt)}</time>
                </div>

                {post.title && (
                  <h2 className={`mt-4 font-satoshi font-black text-xl sm:text-2xl ${colorScheme.text} leading-tight`}>
                    {post.title}
                  </h2>
                )}

                <p
                  className={`${post.title ? 'mt-3' : 'mt-4'} text-xl sm:text-2xl ${colorScheme.text} whitespace-pre-wrap break-words leading-relaxed font-semibold`}
                >
                  {post.content}
                </p>

                {post.image && (
                  <div
                    className={`mt-5 rounded-2xl overflow-hidden ring-1 ${
                      onGradient ? 'ring-white/10' : 'ring-border'
                    }`}
                  >
                    <img src={post.image} alt="" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}

                <div
                  className={`flex flex-wrap items-center gap-6 sm:gap-8 mt-6 pt-6 border-t ${
                    onGradient ? 'border-white/10' : 'border-border'
                  } text-sm`}
                >
                  <span className={colorScheme.text}>
                    <strong className="font-extrabold text-base">{post.likes.length}</strong>{' '}
                    <span className={`${colorScheme.accent} font-medium`}>Likes</span>
                  </span>
                  <span className={colorScheme.text}>
                    <strong className="font-extrabold text-base">{post.comments.length}</strong>{' '}
                    <span className={`${colorScheme.accent} font-medium`}>Replies</span>
                  </span>
                  <span className={colorScheme.text}>
                    <strong className="font-extrabold text-base">{post.saves.length}</strong>{' '}
                    <span className={`${colorScheme.accent} font-medium`}>Saves</span>
                  </span>
                </div>

                <div
                  className={`flex flex-wrap items-center gap-2 sm:gap-3 mt-5 pt-5 border-t ${
                    onGradient ? 'border-white/10' : 'border-border'
                  }`}
                >
                  <button
                    type="button"
                    className={`rounded-full p-2.5 transition-colors ${colorScheme.accent} hover:text-cyan-400 ${
                      onGradient ? 'hover:bg-white/10' : 'hover:bg-white/5'
                    }`}
                    aria-label="Replies"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    disabled={!user || engagementBusy !== null}
                    onClick={handleLike}
                    className={`rounded-full p-2.5 transition-colors disabled:opacity-40 ${
                      liked ? 'text-pink-500' : `${colorScheme.accent} hover:text-pink-400`
                    } ${onGradient ? 'hover:bg-white/10' : 'hover:bg-white/5'}`}
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-6 h-6 ${liked ? 'fill-current scale-105' : ''}`} />
                  </button>

                  <button
                    type="button"
                    disabled={!user || engagementBusy !== null}
                    onClick={handleSave}
                    className={`rounded-full p-2.5 transition-colors disabled:opacity-40 ${
                      saved ? 'text-white' : `${colorScheme.accent} hover:text-white`
                    } ${onGradient ? 'hover:bg-white/10' : 'hover:bg-white/5'}`}
                    aria-label={saved ? 'Unsave' : 'Save'}
                  >
                    <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                  </button>

                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowEdit(true)}
                        className={`rounded-full p-2.5 ml-auto transition-colors ${colorScheme.accent} hover:text-white ${
                          onGradient ? 'hover:bg-white/10' : 'hover:bg-white/5'
                        }`}
                        aria-label="Edit post"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePostOpen(true)}
                        className={`rounded-full p-2.5 transition-colors ${colorScheme.accent} hover:text-red-500 ${
                          onGradient ? 'hover:bg-white/10' : 'hover:bg-white/5'
                        }`}
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>

        {user && (
          <div className="rounded-3xl border border-border/60 bg-surface-2/30 p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-3 ring-2 ring-border/50">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-text-muted">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full resize-none border-none bg-transparent text-text-primary placeholder-text-muted focus:outline-none min-h-[72px] text-lg leading-relaxed"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={submitting || !comment.trim()}
                    className="px-6 py-2.5 btn-primary disabled:opacity-50 font-bold rounded-full text-sm"
                  >
                    {submitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border/60 bg-surface-2/20 overflow-hidden">
          {post.comments.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <p className="text-xl font-extrabold text-text-primary mb-2">No replies yet</p>
              <p className="text-text-secondary">Be the first to reply.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {post.comments.map((c: Comment) => {
                const commentAuthor = (typeof c.writtenBy === 'string' ? {} : c.writtenBy) as User;
                const ownReply =
                  user &&
                  (typeof c.writtenBy === 'object' && c.writtenBy !== null
                    ? (c.writtenBy as User)._id === user._id
                    : String(c.writtenBy) === String(user._id));
                return (
                  <li key={c._id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-surface-3 ring-2 ring-border/40">
                        {commentAuthor.profilePhoto ? (
                          <img
                            src={commentAuthor.profilePhoto}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-extrabold text-text-muted">
                            {commentAuthor.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-extrabold text-text-primary text-sm">{commentAuthor.name}</span>
                          <span className="text-text-muted text-sm font-medium">@{commentAuthor.username}</span>
                          <span className="text-text-muted/50 text-sm">·</span>
                          <time className="text-text-muted text-sm font-medium">{timeAgo(c.createdAt)}</time>
                        </div>
                        <p className="mt-2 text-text-secondary text-base leading-relaxed">{c.content}</p>
                        {ownReply && (
                          <button
                            type="button"
                            onClick={() => setDeleteCommentId(c._id)}
                            className="mt-3 text-sm text-text-muted hover:text-red-500 font-medium transition-colors rounded-lg px-1 -mx-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>

    {showEdit && post && (
      <EditPostModal
        post={post}
        onClose={() => setShowEdit(false)}
        onSaved={(updated) => setPost((prev) => (prev ? { ...prev, title: updated.title, content: updated.content } : prev))}
      />
    )}

    <ConfirmDialog
      isOpen={deletePostOpen}
      title="Delete this post?"
      message="This cannot be undone. The post and all replies will be removed."
      confirmLabel="Delete"
      loading={deleteBusy}
      onClose={() => !deleteBusy && setDeletePostOpen(false)}
      onConfirm={confirmDeletePost}
    />

    <ConfirmDialog
      isOpen={Boolean(deleteCommentId)}
      title="Delete this reply?"
      message="This cannot be undone."
      confirmLabel="Delete"
      loading={deleteBusy}
      onClose={() => !deleteBusy && setDeleteCommentId(null)}
      onConfirm={confirmDeleteComment}
    />
    </>
  );
}
