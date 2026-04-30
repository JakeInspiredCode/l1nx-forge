import { ALL_MISSIONS } from "@/lib/seeds/campaigns";
import MissionDetailClient from "./mission-detail-client";

export function generateStaticParams() {
  return ALL_MISSIONS.map((m) => ({ missionId: m.id }));
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  return <MissionDetailClient missionId={missionId} />;
}
