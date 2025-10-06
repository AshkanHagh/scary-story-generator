import { Segment } from "../_types"
import SegmentCard from "./segment-card"

type SegmentsGridProps = {
  segments: Segment[]
}

const SegmentsGrid = ({ segments }: SegmentsGridProps) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-11 items-start"
      role="list"
      aria-label="Story segments"
    >
      {segments.map((segment, index) => (
        <SegmentCard key={segment.id} segment={segment} index={index} />
      ))}
    </div>
  )
}
export default SegmentsGrid
