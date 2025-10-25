import BackgroundEffects from "./_components/background-effects"
import AnimatedHeading from "./_components/animated-heading"
import AnimatedButton from "./_components/animated-button"

export default function LandingPage() {
  const title = "Welcome to"
  const subtitle = "Scary Story Generator"
  const smallText = "with AI"
  const description =
    "Dive into the shadows of your mind. Let AI weave terrifying stories that will send shivers down your spine and linger in your thoughts long after the lights go out."

  return (
    <BackgroundEffects>
      <div className="flex flex-col items-center gap-8 px-4">
        <AnimatedHeading
          title={title}
          subtitle={subtitle}
          smallText={smallText}
          description={description}
        />
        <AnimatedButton />
      </div>
    </BackgroundEffects>
  )
}
