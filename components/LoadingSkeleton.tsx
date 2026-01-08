export const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="animate-pulse bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 h-16 rounded-lg border border-cyan-500/20"
      />
    ))}
  </div>
);

export const LoadingCard = () => (
  <div className="animate-pulse bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 h-32 rounded-lg border border-cyan-500/20" />
);

export const LoadingText = () => (
  <div className="animate-pulse bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 h-8 rounded w-3/4" />
);
