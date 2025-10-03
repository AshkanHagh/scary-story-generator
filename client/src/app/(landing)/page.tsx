import BackgroundEffects from "./_components/background-effects"
import AnimatedHeading from "./_components/animated-heading"
import AnimatedButton from "./_components/animated-button"

export default function LandingPage() {
  const title = "Welcome to"
  const subtitle = "Scary Story Generator"
  const smallText = "with AI"
  const description =
    "Unleash your darkest imagination. Let AI craft spine-chilling tales that will haunt your dreams and keep you awake at night."

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
