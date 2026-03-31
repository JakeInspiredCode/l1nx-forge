"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-forge-surface border border-forge-border rounded-xl p-8 max-w-md text-center">
        <h2 className="text-lg font-semibold text-forge-danger mb-2">Something went wrong</h2>
        <p className="text-sm text-forge-text-dim mb-4">{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset}
          className="px-4 py-2 bg-forge-accent text-white rounded-lg text-sm hover:bg-forge-accent/80 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
