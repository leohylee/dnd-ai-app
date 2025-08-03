'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Home, Users, Plus, Sword } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">D&D AI</span>
            </Link>

            <nav className="hidden items-center space-x-4 md:flex">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/characters">
                <Button variant="ghost" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Characters
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm">
                  <Sword className="mr-2 h-4 w-4" />
                  Campaigns
                </Button>
              </Link>
              <Link href="/campaign/create">
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile Navigation */}
            <div className="flex items-center space-x-2 md:hidden">
              <Link href="/characters">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm">
                  <Sword className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/campaign/create">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
