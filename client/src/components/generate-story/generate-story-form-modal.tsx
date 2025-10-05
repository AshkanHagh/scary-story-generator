"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import ModalBase from "@/components/ui/modal-base"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import AiFinalResult from "./ai-final-result"
import api from "@/api/instance"

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

export type GenerateStoryResponse = {
  id: string
  userId: string
  title: string
  script: string
  createdAt: string
  updatedAt: string
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
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState<GenerateStoryResponse | null>(null)

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

    setLoading(true)
    try {
      const result = await api.post<GenerateStoryResponse>("stories").json() // replace with another custom hook
      setAiResult(result)
      onSubmit?.(result)
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!aiResult) return
    onConfirm?.()

    try {
      api.post(`segments/:${aiResult.id}`) // replace with another custom hook
    } catch (error) {
      console.log(error)
    }
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormValues({ title: "", description: "" })
    setAiResult(null)
    setLoading(false)
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
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Enter a title..."
              disabled={loading}
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
              onChange={handleInputChange}
              placeholder="Enter a description..."
              disabled={loading}
              variant="outline"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formValues.description.length}/500 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="min-w-32"
            >
              {loading ? (
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
          isLoading={false}
          onConfirm={handleConfirm}
          response={aiResult}
        />
      )}
    </ModalBase>
  )
}

export default GenerateStoryFormModal
