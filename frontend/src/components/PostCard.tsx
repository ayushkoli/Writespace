import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bookmark, MessageCircle, Trash2 } from "lucide-react";
import type { Post, User } from "../types";
import { postApi } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { listIncludesUserId } from "../utils/postEngagement";
import {
  getPostColorScheme,
  isGradientPostBackground,
} from "../constants/postColors";
import ConfirmDialog from "./ConfirmDialog";

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

const renderContentWithLinks = (text: string, className: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        const isUrl = /^https?:\/\/[^\s]+$/.test(part);
        return isUrl ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 underline underline-offset-2 hover:text-blue-300 break-all transition-colors"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
};

export default function PostCard({ post, onDelete }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(() =>
    listIncludesUserId(post.likes, user?._id),
  );
  const [isSaved, setIsSaved] = useState(() =>
    listIncludesUserId(post.saves, user?._id),
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [saveCount, setSaveCount] = useState(post.saves.length);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    setIsLiked(listIncludesUserId(post.likes, user?._id));
    setIsSaved(listIncludesUserId(post.saves, user?._id));
    setLikeCount(post.likes.length);
    setSaveCount(post.saves.length);
  }, [post._id, user?._id, post.likes, post.saves]);

  const author = (typeof post.userId === "string" ? {} : post.userId) as User;
  const colorScheme = getPostColorScheme(post.color);
  const onGradient = isGradientPostBackground(post.color);
  const isOwner =
    user &&
    (typeof post.userId === "object"
      ? (post.userId as User)._id === user._id
      : post.userId === user._id);

  const contentLength = post.content?.length ?? 0;
  const isLong = contentLength > 200;

  const openPost = () => navigate(`/post/${post._id}`);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || likeBusy) return;
    setLikeBusy(true);
    try {
      const { data } = await postApi.toggleLike(post._id);
      const updated = data.data as Post;
      setIsLiked(listIncludesUserId(updated.likes, user._id));
      setLikeCount(updated.likes.length);
    } catch {
      // ignore
    } finally {
      setLikeBusy(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || saveBusy) return;
    setSaveBusy(true);
    try {
      const { data } = await postApi.toggleSave(post._id);
      const updated = data.data as Post;
      setIsSaved(listIncludesUserId(updated.saves, user._id));
      setSaveCount(updated.saves.length);
    } catch {
      // ignore
    } finally {
      setSaveBusy(false);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDeletePost = async () => {
    setDeleteBusy(true);
    try {
      await postApi.deletePost(post._id);
      setDeleteDialogOpen(false);
      onDelete?.();
    } catch {
      // ignore
    } finally {
      setDeleteBusy(false);
    }
  };

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
      <article
        role="button"
        tabIndex={0}
        onClick={openPost}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPost();
          }
        }}
        className={`${colorScheme.bg} rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border ${colorScheme.border} touch-manipulation bg-clip-padding ${
          isLong ? "p-4 sm:p-6" : "p-4 sm:p-5"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <Link
            to={`/profile/${author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 touch-manipulation"
          >
            <div
              className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${
                onGradient ? "ring-white/20" : "ring-white/10"
              }`}
            >
              {author.profilePhoto ? (
                <img
                  src={author.profilePhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-satoshi font-black bg-white/5 text-text-secondary">
                  {author.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1 flex-wrap leading-tight">
              <Link
                to={`/profile/${author.username}`}
                onClick={(e) => e.stopPropagation()}
                className={`font-satoshi font-bold text-[15px] ${colorScheme.text} truncate touch-manipulation`}
              >
                {author.name}
              </Link>
              <span
                className={`${colorScheme.accent} text-sm truncate max-w-[120px] sm:max-w-none`}
              >
                @{author.username}
              </span>
              <span className={`${colorScheme.accent} text-sm shrink-0`}>·</span>
              <time className={`${colorScheme.accent} text-sm shrink-0`}>
                {timeAgo(post.createdAt)}
              </time>
            </div>
          </div>
        </div>

        {post.title && (
          <h3
            className={`font-satoshi font-black text-lg sm:text-xl mb-1.5 ${colorScheme.text} leading-tight`}
          >
            {post.title}
          </h3>
        )}

        {post.content &&
          renderContentWithLinks(
            post.content,
            `${colorScheme.text} text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words`,
          )}

        {post.image && (
          <div
            className={`mt-3 rounded-xl md:rounded-2xl overflow-hidden ring-1 ${
              onGradient ? "ring-white/10" : "ring-border"
            }`}
          >
            <img
              src={post.image}
              alt=""
              className="w-full h-auto max-h-[280px] md:max-h-[300px] object-cover"
            />
          </div>
        )}

        <div
          className={`flex items-center justify-between mt-4 pt-3 border-t ${
            onGradient ? "border-white/10" : "border-border"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center flex-1 justify-around sm:justify-start sm:gap-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPost();
              }}
              className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] -my-1 px-2 rounded-full ${colorScheme.accent} font-medium touch-manipulation`}
              aria-label={`${post.comments.length} replies`}
            >
              <MessageCircle className="w-[18px] h-[18px] sm:w-4 sm:h-4" />
              <span className="text-sm tabular-nums">{post.comments.length}</span>
            </button>

            <button
              type="button"
              disabled={!user || likeBusy}
              onClick={handleLike}
              className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] -my-1 px-2 rounded-full disabled:opacity-40 touch-manipulation ${
                isLiked ? "text-pink-500" : `${colorScheme.accent}`
              }`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-[18px] h-[18px] sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm font-bold tabular-nums">{likeCount}</span>
            </button>

            <button
              type="button"
              disabled={!user || saveBusy}
              onClick={handleSave}
              className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] -my-1 px-2 rounded-full disabled:opacity-40 touch-manipulation ${
                isSaved ? "text-white" : `${colorScheme.accent}`
              }`}
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark
                className={`w-[18px] h-[18px] sm:w-4 sm:h-4 ${isSaved ? "fill-current" : ""}`}
              />
              <span className="text-sm font-bold tabular-nums">{saveCount}</span>
            </button>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={openDeleteDialog}
              className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full ${colorScheme.accent} touch-manipulation`}
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </article>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete this post?"
        message="This cannot be undone. The post will be removed from your profile and feeds."
        confirmLabel="Delete"
        loading={deleteBusy}
        onClose={() => !deleteBusy && setDeleteDialogOpen(false)}
        onConfirm={confirmDeletePost}
      />
    </>
  );
}
