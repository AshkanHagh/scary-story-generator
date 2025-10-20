import SegmentsSection from "../_components/segments-section"
import getSegments from "../_services/get-segments"

type StorySegmentsPageProps = {
  params: Promise<{ storyId: string }>
}

const StorySegmentsPage = async ({ params }: StorySegmentsPageProps) => {
  const { storyId } = await params
  const response = await getSegments(storyId)

  return <SegmentsSection segmentsResponse={response} />
}

export default StorySegmentsPage
