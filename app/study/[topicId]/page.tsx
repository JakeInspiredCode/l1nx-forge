import { TOPICS } from "@/lib/types";
import TopicStudyClient from "./topic-study-client";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topicId: t.id }));
}

export default async function TopicStudyPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return <TopicStudyClient topicId={topicId} />;
}
