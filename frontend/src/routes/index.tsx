import { createFileRoute, Link } from '@tanstack/react-router'
import { Footer } from '@/components/Footer'
import { ArrowRight, Zap, Shield, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureItem } from '@/components/FeatureItem'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* --- Hero Section --- */}
      <section className="relative pt-20 px-4 md:pt-32">
        <div className="container mx-auto text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-1 rounded-full">
            Now Powered by CEliver 1.0
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
            Higher Performance. <br /> Early liver cancer detection.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-150 mx-auto">
            The liquid biopsy platform for screening early liver cancer.
            <br /> Faster, Affordable, and Accurate of Cell-free DNA.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/about">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureItem
            icon={<Zap className="h-10 w-10 text-yellow-500" />}
            title="Blazing Fast"
            description="Zero-config SSR and optimized bundling for instant page loads."
          />
          <FeatureItem
            icon={<Shield className="h-10 w-10 text-blue-500" />}
            title="Type-Safe Routing"
            description="Catch broken links at build time, not in production."
          />
          <FeatureItem
            icon={<Layout className="h-10 w-10 text-purple-500" />}
            title="Shadcn Integrated"
            description="Beautiful, accessible components styled with Tailwind CSS."
          />
        </div>
      </section>

      {/* --- Social Proof / Mini-CTA --- */}
      <section className="container mx-auto px-4 py-16 bg-muted/50 rounded-3xl border text-center">
        <h2 className="text-3xl font-bold mb-6">
          Trusted by developers worldwide
        </h2>
        <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale">
          {/* Replace with actual logos or text-based placeholders */}
          <span className="font-bold text-2xl">ACME CORP</span>
          <span className="font-bold text-2xl">GLOBEX</span>
          <span className="font-bold text-2xl">SOYLENT</span>
        </div>
      </section>

      <Footer />
    </div>
  )
}
