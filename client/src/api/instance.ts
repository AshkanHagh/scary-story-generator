import ky from "ky"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const api = ky.create({
  prefixUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 80000,
  cache: "no-store",
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = sessionStorage.getItem("token")
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      }
    ]
  }
})
