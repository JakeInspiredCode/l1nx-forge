"use client";

import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import CommandDissector from "@/components/forge/explorer/command-dissector";

export default function CommandDissectorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CommandDissector onBack={() => router.push("/arsenal")} />
      </main>
    </div>
  );
}
