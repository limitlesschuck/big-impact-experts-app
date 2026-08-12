import EventListPage from "@/components/member/EventListPage";

export const dynamic = "force-dynamic";

export default function ReplaysPage() {
  return (
    <EventListPage
      eventType="panel"
      heading="Past Event Replays"
      subheading="Replays and resources from events you've attended."
      emptyMessage="No past events yet — check back after your first live event."
    />
  );
}
