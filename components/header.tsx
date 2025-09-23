import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code2, Play, Save, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">AI Coder</h1>
        </div>
        <Badge variant="secondary" className="text-xs">
          v1.0.0
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button variant="ghost" size="sm">
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
