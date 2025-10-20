import { Navbar } from "@/components/layout/navbar"

const VideosLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default VideosLayout
