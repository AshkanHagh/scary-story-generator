import ky from "ky"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const api = ky.create({
  prefixUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  cache: "no-store",
  retry: 0
})

export default api
