"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/nav";
import FilesystemGame from "@/components/forge/explorer/filesystem-game";

function FilesystemNavigatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "label" ? "label" : "learn";

  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <FilesystemGame mode={mode as "learn" | "label"} onBack={() => router.push("/arsenal")} />
      </main>
    </div>
  );
}

export default function FilesystemNavigatorPage() {
  return (
    <Suspense>
      <FilesystemNavigatorContent />
    </Suspense>
  );
}
