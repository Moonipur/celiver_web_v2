import { Link } from '@tanstack/react-router'
import { Github, Twitter, Linkedin, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Command className="h-6 w-6 text-primary" />
              <span>CEliver</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              High performance liquid biopsy platform for early liver cancer
              detection.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Connect
            </h3>

            <div className="text-sm text-muted-foreground">
              Tel: (+66)-XXX-XXX-XXX
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} CEliver, Cancer Research Unit, CMUTEAM</p>
          <p>Faculty of Medicine, Chiang Mai University</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
