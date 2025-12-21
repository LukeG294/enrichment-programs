import { useState } from "react"
import { Building2, ExternalLink, MapPin, Tag } from "lucide-react"
import type { CounselingProgram } from "@/lib/counseling-programs"

interface ProgramCardProps {
  program: CounselingProgram
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const typeColors: Record<string, string> = {
    arts: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    business: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    stem: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    internship: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    humanities: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  }

  const typeLabel = program.type?.trim() || "program"
  const description = program.description?.trim() ?? ""
  const maxDescriptionLength = 160
  const hasLongDescription = description.length > maxDescriptionLength
  const visibleDescription =
    hasLongDescription && !isDescriptionExpanded
      ? `${description.slice(0, maxDescriptionLength).trimEnd()}`
      : description

  return (
    <div className="overflow-hidden rounded-lg border border-border  transition-all hover:shadow-md">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-foreground">{program.program}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {program.organization}
            </div>
          </div>
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              program.type ? typeColors[program.type] ?? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
          </span>
        </div>

        {/* Location */}
        {program.location && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{program.location}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="mb-4 text-sm text-foreground/80">
            {visibleDescription}
            {hasLongDescription && !isDescriptionExpanded && "… "}
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                className="ml-1 inline-flex items-center text-primary hover:underline"
              >
                {isDescriptionExpanded ? "Show less" : "Show all"}
              </button>
            )}
          </p>
        )}

        {/* Tags */}
        {program.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {program.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {program.link && (
          <a
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            href={program.link}
            target="_blank"
            rel="noreferrer"
          >
            Learn more
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}
