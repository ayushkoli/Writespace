import { PAGE_SHELL } from './Layout';

export function SkeletonPostCard() {
  return (
    <div className="rounded-3xl border border-border/50 bg-surface-2/40 p-5 sm:p-6 animate-pulse-soft">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-surface-3 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-surface-3 rounded-lg" />
          <div className="h-3 w-20 bg-surface-3 rounded-lg" />
        </div>
      </div>
      <div className="h-5 w-3/4 max-w-[200px] bg-surface-3 rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-surface-3 rounded-lg" />
        <div className="h-4 w-5/6 bg-surface-3 rounded-lg" />
        <div className="h-4 w-2/3 bg-surface-3 rounded-lg" />
      </div>
      <div className="flex gap-6 mt-5 pt-4 border-t border-border/40">
        <div className="h-4 w-10 bg-surface-3 rounded-lg" />
        <div className="h-4 w-10 bg-surface-3 rounded-lg" />
        <div className="h-4 w-10 bg-surface-3 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonPostGrid({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => (
    <SkeletonPostCard key={i} />
  ));

  return (
    <>
      <div className="flex flex-col gap-3 px-3 py-3 md:hidden">{items}</div>
      <div className="hidden md:block p-5">
        <div className="columns-2 lg:columns-3 gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="break-inside-avoid mb-4 p-[1px]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** @deprecated use SkeletonPostCard */
export function SkeletonPost() {
  return <SkeletonPostCard />;
}

export function SkeletonProfile() {
  return (
    <div className={`${PAGE_SHELL} animate-fade-in px-3 sm:px-6 pt-4 sm:pt-6 pb-10`}>
      <div className="rounded-2xl border border-border/60 bg-surface-2 p-5 sm:p-6 animate-pulse-soft">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-3 shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-6 w-40 bg-surface-3 rounded-lg" />
            <div className="h-4 w-24 bg-surface-3 rounded-lg" />
            <div className="h-4 w-full max-w-xs bg-surface-3 rounded-lg" />
            <div className="flex gap-4 pt-1">
              <div className="h-4 w-16 bg-surface-3 rounded" />
              <div className="h-4 w-16 bg-surface-3 rounded" />
              <div className="h-4 w-12 bg-surface-3 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <SkeletonPostGrid count={4} />
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return <SkeletonPostGrid count={6} />;
}

export function SkeletonSidebar() {
  return (
    <div className="p-5 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-6 h-6 bg-surface-3 rounded-lg animate-pulse-soft" />
          <div className="h-4 w-20 bg-surface-3 rounded hidden xl:block animate-pulse-soft" />
        </div>
      ))}
    </div>
  );
}
