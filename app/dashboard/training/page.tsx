import EventListPage from "@/components/member/EventListPage";

export const dynamic = "force-dynamic";

export default function TrainingPage() {
  return (
    <EventListPage
      eventType="training"
      heading="Workshops & Training"
      subheading="Hands-on training sessions and workshops from our experts."
      emptyMessage="No workshops or training sessions yet — check back soon."
    />
  );
}
