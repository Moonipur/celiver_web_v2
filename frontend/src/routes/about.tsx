import { createFileRoute } from '@tanstack/react-router'
import { Users, Rocket, Github, Dna } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AboutCard } from '@/components/AboutCard'
import { Footer } from '@/components/Footer'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Future Way of Cancer Screening
        </h1>
        <p className="text-xl text-muted-foreground max-w-175 mx-auto">
          We combine the valuable biomarker, Cell-free DNA, with the Machine
          learning model to create high performance liver cancer prediction.
        </p>
      </section>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <AboutCard
          icon={<Rocket className="w-8 h-8 text-primary" />}
          title="Our Mission"
          description="To provide type-safe, high-performance web solutions for everyone."
        />
        <AboutCard
          icon={<Users className="w-8 h-8 text-primary" />}
          title="The Team"
          description="A global collective of doctors, researchers, and developers."
        />
        <AboutCard
          icon={<Dna className="w-8 h-8 text-primary" />}
          title="The Tech"
          description={
            <>
              Powered by automated capillary electrophoresis, runing cell-free
              DNA size distribution.
            </>
          }
        />
      </div>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 text-center space-y-6">
        <h2 className="text-2xl font-bold">Want to see the code?</h2>
        <div className="flex justify-center gap-4">
          <Button variant="default">Get Started</Button>
          <Button variant="outline">
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
