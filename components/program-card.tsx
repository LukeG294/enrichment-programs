import { MapPin, Building2, Tag, BookOpen } from "lucide-react"

interface Program {
  id: string
  name: string
  college: string
  city: string
  distance: number
  type: string
  description: string
  startDate: string
  tuition: string
  keywords: string[]
}

interface ProgramCardProps {
  program: Program
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const typeColors: Record<string, string> = {
    arts: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    business: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    stem: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    internship: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    humanities: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-foreground">{program.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {program.college}
            </div>
          </div>
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${typeColors[program.type]}`}
          >
            {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
          </span>
        </div>

        {/* Location */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{program.city}</span>
          <span className="text-xs">• {program.distance} miles away</span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-foreground/80">{program.description}</p>

        {/* Keywords */}
        <div className="mb-4 flex flex-wrap gap-2">
          {program.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              <Tag className="h-3 w-3" />
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
