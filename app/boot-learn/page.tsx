"use client";

import { useRouter } from "next/navigation";
import BootLearn from "@/components/forge/boot-process/boot-learn";

export default function BootLearnPage() {
  const router = useRouter();

  return (
    <div className="h-screen overflow-hidden bg-v2-bg-deep">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BootLearn onBack={() => router.push("/arsenal")} />
      </main>
    </div>
  );
}
