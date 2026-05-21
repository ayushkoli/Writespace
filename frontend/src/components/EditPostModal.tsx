import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Post } from '../types';
import { postApi } from '../api';
import { useToast } from '../contexts/ToastContext';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSaved: (updated: Post) => void;
}

export default function EditPostModal({ post, onClose, onSaved }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const { data } = await postApi.updatePost(post._id, { title: title.trim(), content: content.trim() });
      addToast('Post updated', 'success');
      onSaved(data.data as Post);
      onClose();
    } catch {
      addToast('Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full sm:max-w-lg glass border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-text-primary">Edit post</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 input-premium rounded-xl text-text-primary font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 input-premium rounded-xl text-text-primary font-medium resize-none min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-white/10 text-text-primary font-bold hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !title.trim() || !content.trim()}
            className="flex-1 py-3 btn-primary rounded-full font-bold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
