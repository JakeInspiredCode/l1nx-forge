"use client";

import { useRouter } from "next/navigation";
import CommandDissector from "@/components/forge/explorer/command-dissector";

export default function CommandDissectorPage() {
  const router = useRouter();

  return (
    <div className="h-screen overflow-hidden bg-v2-bg-deep">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CommandDissector onBack={() => router.push("/arsenal")} />
      </main>
    </div>
  );
}
