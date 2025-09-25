import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code2, Play, Save, Settings, Sun, Moon, Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-provider"

export function Header({ onRunCode, onSave }: { onRunCode: () => void, onSave: () => void }) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
             <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-lg text-foreground tracking-tighter">AI Coder</h1>
        </div>
        <Badge variant="outline" className="hidden sm:flex items-center">
          v1.0.0
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="default" size="sm" className="hidden sm:flex bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onRunCode}>
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
        
        <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/your-repo" target="_blank">
                    <Github className="h-4 w-4" />
                </a>
            </Button>
        </div>

      </div>
    </header>
  )
}
