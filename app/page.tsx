import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold">D&D AI Adventure</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Create characters and embark on AI-powered D&D 5e adventures
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Character</CardTitle>
              <CardDescription>
                Build a new D&D 5e character with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/character-creation">
                <Button className="w-full">Start Creating</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Characters</CardTitle>
              <CardDescription>
                Browse and manage your existing characters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/characters">
                <Button variant="outline" className="w-full">
                  View Characters
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
