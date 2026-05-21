export interface PostColorDef {
  value: string;
  label: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
}

/** Presets for post card backgrounds (CreatePost swatches + PostCard / PostDetail themes). */
export const POST_COLOR_DEFS: PostColorDef[] = [
  {
    value: 'default',
    label: 'Default',
    bg: 'glass-card',
    border: 'border-white/5 hover:border-white/10',
    text: 'text-text-primary',
    accent: 'text-text-secondary',
  },
  {
    value: 'blue',
    label: 'Blue',
    bg: 'bg-blue-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    bg: 'bg-indigo-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'sky',
    label: 'Sky',
    bg: 'bg-sky-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'midnight',
    label: 'Midnight',
    bg: 'bg-blue-950/20 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    bg: 'bg-cyan-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'violet',
    label: 'Violet',
    bg: 'bg-violet-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'fuchsia',
    label: 'Fuchsia',
    bg: 'bg-fuchsia-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'pink',
    label: 'Pink',
    bg: 'bg-pink-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    bg: 'bg-emerald-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'green',
    label: 'Green',
    bg: 'bg-green-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'lime',
    label: 'Lime',
    bg: 'bg-lime-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'orange',
    label: 'Orange',
    bg: 'bg-orange-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'amber',
    label: 'Amber',
    bg: 'bg-amber-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'red',
    label: 'Red',
    bg: 'bg-red-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'rose',
    label: 'Rose',
    bg: 'bg-rose-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'slate',
    label: 'Slate',
    bg: 'bg-slate-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'stone',
    label: 'Stone',
    bg: 'bg-zinc-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'charcoal',
    label: 'Charcoal',
    bg: 'bg-zinc-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
];

/** Dark-feed post backgrounds — translucent jewel tones on near-black. */
export const CREATE_POST_COLORS: PostColorDef[] = [
  {
    value: 'default',
    label: 'Default',
    bg: 'glass-card',
    border: 'border-white/10 hover:border-white/15',
    text: 'text-text-primary',
    accent: 'text-text-secondary',
  },
  {
    value: 'blue',
    label: 'Blue',
    bg: 'bg-blue-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    bg: 'bg-cyan-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'violet',
    label: 'Violet',
    bg: 'bg-violet-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'pink',
    label: 'Pink',
    bg: 'bg-pink-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'green',
    label: 'Green',
    bg: 'bg-green-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'orange',
    label: 'Orange',
    bg: 'bg-orange-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
  {
    value: 'charcoal',
    label: 'Charcoal',
    bg: 'bg-zinc-900/15 backdrop-blur-2xl backdrop-saturate-150',
    border: 'border-white/10',
    text: 'text-white',
    accent: 'text-text-secondary',
  },
];

export function getPostColorScheme(color: string | undefined) {
  const def =
    CREATE_POST_COLORS.find((c) => c.value === color) ||
    POST_COLOR_DEFS.find((c) => c.value === color) ||
    POST_COLOR_DEFS[0];
  return { bg: def.bg, border: def.border, text: def.text, accent: def.accent };
}

/** Non-default card backgrounds use light text / rings. */
export function isGradientPostBackground(color: string | undefined): boolean {
  return Boolean(color && color !== 'default');
}
