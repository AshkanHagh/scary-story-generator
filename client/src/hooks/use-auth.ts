import api from "@/api/instance"
import { Auth } from "@/types/auth"
import { wait } from "@/utils"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true)

  const auth = async () => {
    setIsLoading(true)
    try {
      await wait()
      const response = await api
        .get<Auth>("anonymous", { retry: { limit: 3 } })
        .json()
      sessionStorage.setItem("token", response.token)
    } catch (error) {
      console.log(error)
      toast.error("Failed to load your data!", {
        description: "Please refresh and try again",
        duration: 5000
      })
      sessionStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const currentToken = sessionStorage.getItem("token")
    if (currentToken) {
      setIsLoading(false)
      return
    }
    auth()
  }, [])

  return { auth, isLoading }
}
export default useAuth
