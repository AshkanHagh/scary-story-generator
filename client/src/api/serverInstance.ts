import ky from "ky"
import { cookies } from "next/headers"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const serverApi = ky.create({
  prefixUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 80000,
  cache: "no-store",
  retry: 0,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = (await cookies()).get("token")?.value
        console.log(token)
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      }
    ]
  }
})
