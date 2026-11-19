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
          className="pm-card rounded-2xl p-5 relative overflow-hidden"
        >
          {variant === 'plan' ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-44 -mx-5 -mt-5 mb-4 bg-[var(--pm-surface-subtle)] border-b border-[var(--pm-border)]" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-[var(--pm-surface-subtle)] rounded" />
                <div className="h-3 w-5/6 bg-[var(--pm-surface-subtle)] rounded" />
              </div>
              <div className="border-y border-[var(--pm-border)] py-3 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-[var(--pm-surface-subtle)] rounded" />
                  <div className="h-4 w-24 bg-[var(--pm-surface-subtle)] rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-[var(--pm-surface-subtle)] rounded" />
                  <div className="h-4 w-20 bg-[var(--pm-surface-subtle)] rounded" />
                </div>
              </div>
              <div className="h-10 w-full bg-[var(--pm-surface-subtle)] rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--pm-border)]">
                <div className="w-14 h-14 rounded-xl bg-[var(--pm-surface-subtle)] shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-36 bg-[var(--pm-surface-subtle)] rounded" />
                  <div className="h-3 w-48 bg-[var(--pm-surface-subtle)] rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-[var(--pm-surface-subtle)] rounded-lg" />
                <div className="h-10 bg-[var(--pm-surface-subtle)] rounded-lg" />
              </div>
              <div className="h-2 w-full bg-[var(--pm-surface-subtle)] rounded-full" />
              <div className="h-9 w-full bg-[var(--pm-surface-subtle)] rounded-lg" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;
