'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Users, Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">D&D AI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4">
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
              <Link href="/character-creation">
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </Link>
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <Link href="/characters">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/character-creation">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}