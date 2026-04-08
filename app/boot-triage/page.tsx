"use client";

import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import BootTriage from "@/components/forge/boot-process/boot-triage";

export default function BootTriagePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BootTriage onBack={() => router.push("/arsenal")} />
      </main>
    </div>
  );
}
