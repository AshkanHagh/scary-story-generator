import ky from "ky"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const api = ky.create({
  prefixUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  cache: "no-store",
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = sessionStorage.getItem("token")
        if (token) {
          request.headers.set("token", token)
        }
      }
    ]
  }
})

export default api
