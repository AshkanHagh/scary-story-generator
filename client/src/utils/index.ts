export const wait = async (delay: number = 2000) => {
  return await new Promise((resolve) => setTimeout(resolve, delay))
}
