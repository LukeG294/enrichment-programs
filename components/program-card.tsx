import { useState } from "react"
import { Building2, ExternalLink, MapPin, Tag } from "lucide-react"
import type { CounselingProgram } from "@/lib/counseling-programs"

interface ProgramCardProps {
  program: CounselingProgram
  canEdit?: boolean
}

export default function ProgramCard({ program, canEdit = false }: ProgramCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const typeLabel = program.programTypeName?.trim() || "program"
  const hasTypeColor = Boolean(program.programTypeColor)
  const typeBadgeStyle = hasTypeColor ? { backgroundColor: program.programTypeColor, color: "#fff" } : undefined
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
              hasTypeColor ? "text-white" : "bg-muted text-muted-foreground"
            }`}
            style={typeBadgeStyle}
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
            {hasLongDescription && !isDescriptionExpanded && "…"}
            {hasLongDescription && (
              <>
                <span aria-hidden="true"> </span>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="inline-flex items-center text-primary hover:underline"
                >
                  {isDescriptionExpanded ? "Show less" : "Show all"}
                </button>
              </>
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

        {(program.link || canEdit) && (
          <div className="flex flex-wrap items-center gap-3">
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
            {canEdit && (
              <a
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-muted"
                href={`/offerings/${program.id}/edit`}
              >
                Edit offering
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
