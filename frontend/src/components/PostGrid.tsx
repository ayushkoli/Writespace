import { type ReactNode, Children } from 'react';

interface PostGridProps {
  children: ReactNode[];
}

/** Mobile: single-column timeline. Desktop: masonry columns. */
export default function PostGrid({ children }: PostGridProps) {
  return (
    <>
      <div className="flex flex-col gap-3 px-3 py-3 md:hidden">{children}</div>
      <div className="hidden md:block p-5">
        <div className="columns-2 lg:columns-3 gap-4">
          {Children.map(children, (child) => (
            <div className="break-inside-avoid mb-4 p-[1px]">
              {child}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
