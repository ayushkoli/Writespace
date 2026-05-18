import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { User } from '../types';
import { authApi } from '../api';

interface UserListModalProps {
  username: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function UserListModal({ username, type, onClose }: UserListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const { data } =
          type === 'followers'
            ? await authApi.getFollowers(username)
            : await authApi.getFollowing(username);
        setUsers(data.data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [username, type]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-list-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full sm:max-w-md max-h-[85vh] sm:max-h-[70vh] bg-surface-2 border border-border/60 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
          <h2 id="user-list-title" className="text-lg font-extrabold text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-text-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-text-secondary font-medium">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {users.map((u) => (
                <li key={u._id}>
                  <Link
                    to={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-3 ring-2 ring-border/50 shrink-0">
                      {u.profilePhoto ? (
                        <img src={u.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-text-muted">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text-primary truncate">{u.name}</p>
                      <p className="text-sm text-text-muted truncate">@{u.username}</p>
                      {u.bio && (
                        <p className="text-sm text-text-secondary truncate mt-0.5">{u.bio}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
