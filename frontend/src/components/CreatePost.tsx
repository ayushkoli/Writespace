import { useState } from "react";
import { Image, Palette } from "lucide-react";
import { postApi } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  CREATE_POST_COLORS,
  isGradientPostBackground,
} from "../constants/postColors";
import { compressImage } from "../utils/compressImage";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("default");
  const [showColors, setShowColors] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const color =
    CREATE_POST_COLORS.find((c) => c.value === selectedColor) ||
    CREATE_POST_COLORS[0];
  const onGradient = isGradientPostBackground(selectedColor);

  const inputText = onGradient ? "text-white" : "text-text-primary";
  const inputPlaceholder = onGradient
    ? "placeholder:text-white/45"
    : "placeholder:text-text-muted/80";
  const divider = onGradient ? "border-white/10" : "border-border/50";
  const toolbarBg = onGradient ? "bg-black/15" : "bg-black/20";
  const iconMuted = onGradient
    ? "text-white/70 hover:text-white"
    : "text-text-secondary hover:text-white";
  const labelMuted = onGradient ? color.accent : "text-text-muted";

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setImage(compressed);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(compressed);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("color", selectedColor);
    if (image) formData.append("image", image);

    try {
      const { data } = await postApi.createPost(formData);
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview(null);
      setSelectedColor("default");
      setShowColors(false);
      addToast("Post published!", "success");
      if (data.uploadWarning) addToast(data.uploadWarning, "info");
      onPostCreated?.();
    } catch {
      addToast("Failed to create post", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="px-3 sm:px-6 py-4 md:py-6 animate-fade-in pb-[env(safe-area-inset-bottom)]">
      <div
        className={`w-full rounded-2xl md:rounded-3xl border overflow-hidden transition-smooth ${color.bg} ${onGradient ? "border-white/10" : "border-border/60"}`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 bg-surface-3 ring-2 ${
                onGradient ? "ring-white/20" : "ring-border/50"
              }`}
            >
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-sm font-bold ${onGradient ? "text-white/60" : "text-text-muted"}`}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3 min-h-[140px]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className={`w-full bg-transparent text-base sm:text-lg font-bold focus:outline-none ${inputText} ${inputPlaceholder}`}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? (optional)"
                rows={5}
                className={`w-full resize-none bg-transparent text-[15px] sm:text-base leading-relaxed focus:outline-none min-h-[120px] ${inputText} ${inputPlaceholder}`}
              />
            </div>
          </div>

          {imagePreview && (
            <div
              className={`mt-4 relative rounded-xl overflow-hidden ring-1 ${onGradient ? "ring-white/10" : "ring-border/50"}`}
            >
              <img
                src={imagePreview}
                alt=""
                className="w-full max-h-[280px] md:max-h-[360px] object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 text-xs font-bold text-white touch-manipulation"
              >
                Remove
              </button>
            </div>
          )}

          {showColors && (
            <div className={`mt-4 pt-4 border-t ${divider}`}>
              <p
                className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${labelMuted}`}
              >
                Background
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
                {CREATE_POST_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setSelectedColor(c.value)}
                    className={`aspect-square w-full max-w-[2.75rem] mx-auto rounded-full ${c.bg} transition-smooth touch-manipulation ${
                      selectedColor === c.value
                        ? `ring-2 ${c.border} scale-110 opacity-100`
                        : "opacity-75 hover:opacity-100 hover:scale-105"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t ${divider} ${toolbarBg}`}
        >
          <div className="flex items-center gap-1">
            <label
              className={`p-2.5 rounded-full cursor-pointer transition-smooth touch-manipulation hover:bg-white/10 ${iconMuted}`}
            >
              <Image className="w-[18px] h-[18px]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowColors(!showColors)}
              className={`p-2.5 rounded-full transition-smooth touch-manipulation hover:bg-white/10 ${
                showColors ? "text-white bg-white/10" : iconMuted
              }`}
              aria-label="Pick background color"
            >
              <Palette className="w-[18px] h-[18px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-5 sm:px-8 py-2.5 btn-primary disabled:opacity-40 font-bold rounded-full text-sm touch-manipulation shrink-0"
          >
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
