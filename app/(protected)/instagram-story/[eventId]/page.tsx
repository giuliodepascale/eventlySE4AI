import { getEventById } from "@/data/event";
import StoryGenerator from "@/components/events/story-generator";

interface InstagramPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}


export default async function InstagramPage({ params }: InstagramPageProps) {

  const {eventId} = await params;
const event = await getEventById(eventId as string || '');

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <h2>Evento non trovato</h2>
      </div>
    );
  }

  return <StoryGenerator event={event} />;
};

