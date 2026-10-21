import React from 'react';

interface PropertyCardSkeletonProps {
  count?: number;
  variant?: 'investment' | 'plan';
  className?: string;
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  count = 2,
  variant = 'investment',
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton_card_${index}`}
          className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1c] to-[#06080e] border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-2xl animate-gold-pulse"
        >
          {/* Shimmer sweep effect with warm brushed gold sheen */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-amber-400/15 to-transparent pointer-events-none z-10" />

          {variant === 'plan' ? (
            /* Plan Card Skeleton */
            <div className="space-y-4">
              {/* Photo Banner Skeleton */}
              <div className="relative h-44 -mx-5 -mt-5 mb-4 bg-slate-950/80 border-b border-amber-500/20 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-amber-500/10" />
                <div className="absolute top-3 left-3 h-5 w-24 bg-amber-500/10 rounded-full border border-amber-500/20" />
                <div className="absolute top-3 right-3 h-5 w-20 bg-amber-500/20 rounded-full" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <div className="h-3 w-32 bg-slate-700/60 rounded" />
                  <div className="h-3 w-20 bg-emerald-500/20 rounded" />
                </div>
              </div>

              {/* Title & Address */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-amber-400/15 rounded" />
                <div className="h-3 w-5/6 bg-slate-800/80 rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="h-4 w-24 bg-slate-800/60 rounded" />
                  <div className="h-4 w-28 bg-slate-800/60 rounded" />
                </div>
              </div>

              {/* Metrics Box */}
              <div className="bg-slate-950/60 border border-amber-500/10 rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-800/80 rounded" />
                  <div className="h-4 w-24 bg-amber-400/20 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 w-28 bg-slate-800/80 rounded" />
                  <div className="h-4 w-24 bg-emerald-500/20 rounded" />
                </div>
                <div className="h-px bg-slate-800/60 w-full" />
                <div className="flex justify-between items-center">
                  <div className="h-3 w-32 bg-amber-500/15 rounded" />
                  <div className="h-4 w-28 bg-amber-400/25 rounded" />
                </div>
              </div>

              {/* Action Button */}
              <div className="h-10 w-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl border border-amber-500/30" />
            </div>
          ) : (
            /* Active Investment Card Skeleton */
            <div className="space-y-4 animate-pulse">
              {/* Header with Photo Thumbnail */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-800/50 to-amber-500/10 border border-amber-500/20 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-36 bg-amber-400/20 rounded" />
                    <div className="h-4 w-14 bg-emerald-500/20 rounded-full border border-emerald-500/30" />
                  </div>
                  <div className="h-3 w-48 bg-slate-800/70 rounded" />
                  <div className="h-2.5 w-28 bg-slate-800/50 rounded font-mono" />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-800/80">
                <div className="space-y-1">
                  <div className="h-2.5 w-20 bg-slate-800/70 rounded" />
                  <div className="h-4 w-24 bg-slate-700/60 rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-24 bg-slate-800/70 rounded" />
                  <div className="h-4 w-28 bg-amber-400/20 rounded" />
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-900 flex justify-between">
                  <div className="h-2.5 w-28 bg-slate-800/70 rounded" />
                  <div className="h-4 w-28 bg-emerald-400/20 rounded" />
                </div>
              </div>

              {/* Progress Bar Skeleton */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-2.5 w-20 bg-slate-800/60 rounded" />
                  <div className="h-2.5 w-24 bg-slate-800/60 rounded" />
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full w-2/5 bg-gradient-to-r from-amber-500/40 to-emerald-500/40 rounded-full" />
                </div>
              </div>

              {/* Countdown Timer Skeleton */}
              <div className="h-8 w-full bg-slate-950/80 border border-slate-800 rounded-xl" />

              {/* Deed Button Skeleton */}
              <div className="h-9 w-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 bg-amber-400/40 rounded" />
                <div className="h-3 w-44 bg-amber-400/30 rounded" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;
