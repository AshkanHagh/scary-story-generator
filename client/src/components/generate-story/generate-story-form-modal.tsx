"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import ModalBase from "@/components/ui/modal-base"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import AiFinalResult from "./ai-final-result"
import useGenerateStory from "@/hooks/use-generate-story"
import { GenerateStoryResponse } from "@/types/story"
import useConfirmStory from "@/hooks/use-confirm-story"
import { useRouter } from "next/navigation"

type FormValues = {
  title: string
  description: string
}

type GenerateStoryFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  onSubmit?: (values: GenerateStoryResponse) => void
  defaultValues?: Partial<FormValues>
}

const transition = { duration: 0.3 }

const GenerateStoryFormModal = ({
  isOpen,
  onClose,
  onConfirm,
  onSubmit,
  defaultValues
}: GenerateStoryFormModalProps) => {
  const [formValues, setFormValues] = useState<FormValues>({
    title: defaultValues?.title ?? "",
    description: defaultValues?.description ?? ""
  })
  const [aiResult, setAiResult] = useState<GenerateStoryResponse | null>(null)
  const { generateStory, isLoading } = useGenerateStory()
  const { confirmStory, isLoading: isConfirming } = useConfirmStory()
  const router = useRouter()

  const isFormValid =
    formValues.title.trim().length >= 3 &&
    formValues.description.trim().length >= 10

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return
    const body = { title: formValues.title, script: formValues.description }
    await generateStory(body, (data) => {
      setAiResult(data)
      onSubmit?.(data)
    })
  }

  const handleConfirm = async () => {
    if (!aiResult) return
    const storyId = aiResult.id

    await confirmStory(storyId, () => {
      onConfirm?.()
      router.push(`/stories/${storyId}`)
    })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormValues({ title: "", description: "" })
    setAiResult(null)
  }

  // ---------- Render ----------
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="STORY GENERATOR">
      {!aiResult ? (
        <motion.form
          key="form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={transition}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title Input */}
          <div className="space-y-2">
            <Input
              id="title"
              label="Title"
              className="tracking-wider font-thin"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Enter a title..."
              disabled={isLoading}
              variant="outline"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground">
              {formValues.title.length}/80 characters
            </p>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Textarea
              id="description"
              label="Description"
              value={formValues.description}
              className="tracking-wider font-thin"
              onChange={handleInputChange}
              placeholder="Enter a description..."
              disabled={isLoading}
              variant="outline"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground">
              {formValues.description.length}/10000 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="min-w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </motion.form>
      ) : (
        <AiFinalResult
          isLoading={isConfirming}
          onConfirm={handleConfirm}
          response={aiResult}
        />
      )}
    </ModalBase>
  )
}

export default GenerateStoryFormModal
