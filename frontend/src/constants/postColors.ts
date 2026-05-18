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
    bg: 'bg-surface-2',
    border: 'border-gray-600',
    text: 'text-text-primary',
    accent: 'text-text-secondary',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    bg: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
    border: 'border-indigo-400',
    text: 'text-white',
    accent: 'text-indigo-200',
  },
  {
    value: 'violet',
    label: 'Violet',
    bg: 'bg-gradient-to-br from-violet-600 to-violet-800',
    border: 'border-violet-400',
    text: 'text-white',
    accent: 'text-violet-200',
  },
  {
    value: 'pink',
    label: 'Pink',
    bg: 'bg-gradient-to-br from-pink-600 to-rose-700',
    border: 'border-pink-400',
    text: 'text-white',
    accent: 'text-pink-200',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    bg: 'bg-gradient-to-br from-cyan-600 to-teal-700',
    border: 'border-cyan-400',
    text: 'text-white',
    accent: 'text-cyan-200',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    bg: 'bg-gradient-to-br from-emerald-600 to-green-800',
    border: 'border-emerald-400',
    text: 'text-white',
    accent: 'text-emerald-200',
  },
  {
    value: 'orange',
    label: 'Orange',
    bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    border: 'border-orange-400',
    text: 'text-white',
    accent: 'text-orange-200',
  },
  {
    value: 'slate',
    label: 'Slate',
    bg: 'bg-gradient-to-br from-slate-700 to-slate-900',
    border: 'border-slate-400',
    text: 'text-white',
    accent: 'text-slate-300',
  },
  {
    value: 'sky',
    label: 'Sky',
    bg: 'bg-gradient-to-br from-sky-500 to-blue-800',
    border: 'border-sky-400',
    text: 'text-white',
    accent: 'text-sky-200',
  },
  {
    value: 'fuchsia',
    label: 'Fuchsia',
    bg: 'bg-gradient-to-br from-fuchsia-600 to-purple-900',
    border: 'border-fuchsia-400',
    text: 'text-white',
    accent: 'text-fuchsia-200',
  },
  {
    value: 'amber',
    label: 'Amber',
    bg: 'bg-gradient-to-br from-amber-500 to-orange-800',
    border: 'border-amber-400',
    text: 'text-white',
    accent: 'text-amber-100',
  },
  {
    value: 'lime',
    label: 'Lime',
    bg: 'bg-gradient-to-br from-lime-500 to-emerald-800',
    border: 'border-lime-400',
    text: 'text-white',
    accent: 'text-lime-100',
  },
  {
    value: 'rose',
    label: 'Rose',
    bg: 'bg-gradient-to-br from-rose-600 to-red-900',
    border: 'border-rose-400',
    text: 'text-white',
    accent: 'text-rose-200',
  },
  {
    value: 'blue',
    label: 'Blue',
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-900',
    border: 'border-blue-400',
    text: 'text-white',
    accent: 'text-blue-200',
  },
  {
    value: 'stone',
    label: 'Stone',
    bg: 'bg-gradient-to-br from-stone-600 to-neutral-900',
    border: 'border-stone-400',
    text: 'text-white',
    accent: 'text-stone-300',
  },
  {
    value: 'midnight',
    label: 'Midnight',
    bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950',
    border: 'border-blue-500/50',
    text: 'text-white',
    accent: 'text-slate-400',
  },
];

/** Dark-feed post backgrounds — muted jewel tones on near-black. */
export const CREATE_POST_COLORS: PostColorDef[] = [
  {
    value: 'default',
    label: 'Default',
    bg: 'bg-surface-2',
    border: 'border-zinc-600',
    text: 'text-text-primary',
    accent: 'text-text-secondary',
  },
  {
    value: 'blue',
    label: 'Blue',
    bg: 'bg-gradient-to-br from-[#1a3a5c] via-[#0c1829] to-[#050508]',
    border: 'border-blue-500/35',
    text: 'text-white',
    accent: 'text-blue-300/80',
  },
  {
    value: 'violet',
    label: 'Violet',
    bg: 'bg-gradient-to-br from-[#3b2860] via-[#1a1030] to-[#050508]',
    border: 'border-violet-500/35',
    text: 'text-white',
    accent: 'text-violet-300/80',
  },
  {
    value: 'red',
    label: 'Red',
    bg: 'bg-gradient-to-br from-[#4a2030] via-[#1a0a12] to-[#050508]',
    border: 'border-rose-500/35',
    text: 'text-white',
    accent: 'text-rose-300/80',
  },
  {
    value: 'green',
    label: 'Green',
    bg: 'bg-gradient-to-br from-[#144536] via-[#0a1f18] to-[#050508]',
    border: 'border-emerald-500/35',
    text: 'text-white',
    accent: 'text-emerald-300/80',
  },
  {
    value: 'amber',
    label: 'Amber',
    bg: 'bg-gradient-to-br from-[#4a3820] via-[#1f1608] to-[#050508]',
    border: 'border-amber-500/35',
    text: 'text-white',
    accent: 'text-amber-300/80',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    bg: 'bg-gradient-to-br from-[#124848] via-[#0a2222] to-[#050508]',
    border: 'border-cyan-500/35',
    text: 'text-white',
    accent: 'text-cyan-300/80',
  },
  {
    value: 'charcoal',
    label: 'Charcoal',
    bg: 'bg-gradient-to-br from-[#2a2a30] via-[#141418] to-[#050508]',
    border: 'border-zinc-500/35',
    text: 'text-white',
    accent: 'text-zinc-400',
  },
];

export function getPostColorScheme(color: string | undefined) {
  const def =
    CREATE_POST_COLORS.find((c) => c.value === color) ||
    POST_COLOR_DEFS.find((c) => c.value === color) ||
    POST_COLOR_DEFS[0];
  return { bg: def.bg, text: def.text, accent: def.accent };
}

/** Non-default card backgrounds use light text / rings. */
export function isGradientPostBackground(color: string | undefined): boolean {
  return Boolean(color && color !== 'default');
}
