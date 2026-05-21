import { useEffect } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Red destructive confirm button */
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  danger = true,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-label="Close"
        disabled={loading}
      />
      <div className="relative w-full sm:max-w-sm glass border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-slide-up">
        <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-muted text-sm font-medium mb-6">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-full border border-white/10 text-text-primary font-bold text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors disabled:opacity-50 border ${
              danger
                ? 'bg-[#f4212e] hover:bg-[#d81a27] text-white border-transparent'
                : 'bg-white text-black hover:bg-white/90 border-transparent'
            }`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
