import { motion } from "framer-motion"
import { Check, Edit, Sparkles } from "lucide-react"
import Button from "../ui/button"
import { toast } from "sonner"
import { GenerateStoryResponse } from "@/types/story"

type AiFinalResultProps = {
  onConfirm: () => Promise<void>
  response: GenerateStoryResponse
  isLoading: boolean
}

const AiFinalResult = ({
  onConfirm,
  response,
  isLoading
}: AiFinalResultProps) => {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex items-center justify-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="font-sans text-sm font-medium text-muted-foreground">
            AI-Revised Title
          </label>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-border bg-muted/50 p-4"
          >
            <p className="font-sans text-lg tracking-wider text-foreground">
              {response.title}
            </p>
          </motion.div>
        </div>

        <div className="space-y-2">
          <label className="font-sans text-sm font-medium text-muted-foreground">
            AI-Revised Description
          </label>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border max-h-56 border-border bg-muted/50 p-4 overflow-y-auto"
          >
            <p className="font-sans leading-relaxed tracking-wide text-foreground">
              {response.script}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end gap-3"
      >
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => toast.info("Coming soon!")}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          disabled={isLoading}
          type="button"
          onClick={onConfirm}
          className="min-w-32"
        >
          <Check className="mr-2 size-4" />
          Confirm
        </Button>
      </motion.div>
    </motion.div>
  )
}
export default AiFinalResult
