import SegmentsSection from "../_components/segments-section"
import { StorySegmentsResponse } from "../_types"

const StorySegmentsPage = () => {
  const mockData: StorySegmentsResponse = {
    isCompleted: false,
    segments: [
      {
        id: "0012c7fc-0ea9-41d9-b205235-5f669d7a8d90",
        storyId: "f427bce8-4682-4917-99b6-12541eff859d",
        order: 4,
        text: "One night, driven to the edge, Ethan decided to confront whatever haunted him.\nHe stood before the closet, the source of the loudest whispers.\nThe door creaked as he opened it, revealing darkness deeper than night.\nHe stepped inside.",
        imageUrl: "https://placehold.co/1920x1080",
        status: "pending",
        createdAt: "2025-10-03T11:19:12.742Z",
        updatedAt: "2025-10-03T11:19:14.600Z"
      },
      {
        id: "0012c7fc-0e235a9-41d9-b205-5f669d7a8d90",
        storyId: "f427bce8-4682-4917-99b6-12541eff859d",
        order: 2,
        text: "One night, driven to the edge, Ethan decided to confront whatever haunted him.\nHe stood before the closet, the source of the loudest whispers.\nThe door creaked as he opened it, revealing darkness deeper than night.\nHe stepped inside.",
        imageUrl: "https://placehold.co/1920x1080",
        status: "completed",
        createdAt: "2025-10-03T11:19:12.742Z",
        updatedAt: "2025-10-03T11:19:14.600Z"
      },
      {
        id: "0012c7fc-2350ea9-41d9-b205-5f669d7a8d90",
        storyId: "f427bce8-4682-4917-99b6-12541eff859d",
        order: 1,
        text: "One night, driven to the edge, Ethan decided to confront whatever haunted him.\nHe stood before the closet, the source of the loudest whispers.\nThe door creaked as he opened it, revealing darkness deeper than night.\nHe stepped inside.",
        imageUrl: "https://placehold.co/1920x1080",
        status: "completed",
        createdAt: "2025-10-03T11:19:12.742Z",
        updatedAt: "2025-10-03T11:19:14.600Z"
      },
      {
        id: "0012c7fc-0ea9-41d9-b205-5f2355669d7a8d90",
        storyId: "f427bce8-4682-4917-99b6-12541eff859d",
        order: 3,
        text: "One night, driven to the edge, Ethan decided to confront whatever haunted him.\nHe stood before the closet, the source of the loudest whispers.\nThe door creaked as he opened it, revealing darkness deeper than night.\nHe stepped inside.",
        imageUrl: "https://placehold.co/1920x1080",
        status: "completed",
        createdAt: "2025-10-03T11:19:12.742Z",
        updatedAt: "2025-10-03T11:19:14.600Z"
      },
      {
        id: "0012c7fc-0ea9-41d9-b205123-5f2355669d7a8d90",
        storyId: "f427bce8-4682-4917-99b6-12541eff859d",
        order: 5,
        text: "One night, driven to the edge, Ethan decided to confront whatever haunted him.\nHe stood before the closet, the source of the loudest whispers.\nThe door creaked as he opened it, revealing darkness deeper than night.\nHe stepped inside.",
        imageUrl: "https://placehold.co/1920x1080",
        status: "completed",
        createdAt: "2025-10-03T11:19:12.742Z",
        updatedAt: "2025-10-03T11:19:14.600Z"
      }
    ]
  }

  return <SegmentsSection segmentsResponse={mockData} />
}

export default StorySegmentsPage
