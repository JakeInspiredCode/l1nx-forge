"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-v2-bg-deep flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">!</div>
        <h2 className="text-xl font-semibold mono mb-2">Something went wrong</h2>
        <p className="text-forge-text-dim text-sm mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-forge-accent text-white rounded-xl font-medium hover:bg-forge-accent/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
