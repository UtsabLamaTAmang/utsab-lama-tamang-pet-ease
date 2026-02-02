import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
    return (
        <div className="container mx-auto p-8 space-y-8">
            <section className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Pet Project Frontend</h1>
                <p className="text-xl text-muted-foreground">
                    Initialized successfully with Shadcn UI and custom theme.
                </p>
                <div className="flex gap-4">
                    <Button>Primary Action</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Card Example
                            <Badge variant="default">New</Badge>
                        </CardTitle>
                        <CardDescription>A demo card using Shadcn UI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This card demonstrates the use of Shadcn components within the new project structure.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
