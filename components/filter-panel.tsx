"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterPanelProps {
  selectedFilters: {
    location: string[]
    type: string[]
    organization: string[]
    tags: string[]
  }
  setSelectedFilters: (filters: any) => void
  filters: {
    locations: string[]
    programTypes: string[]
    organizations: string[]
    tags: string[]
  }
}

export default function FilterPanel({ selectedFilters, setSelectedFilters, filters }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    type: true,
    organization: true,
    tags: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const uniqueLocations = Array.from(new Set(filters.locations.filter(Boolean))).sort()
  const uniqueTypes = Array.from(new Set(filters.programTypes.filter(Boolean))).sort()
  const uniqueOrganizations = Array.from(new Set(filters.organizations.filter(Boolean))).sort()
  const uniqueTags = Array.from(new Set(filters.tags.filter(Boolean))).sort()

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="font-semibold text-foreground">Filters</h3>

      {/* Location Filter */}
      <div className="space-y-3 border-b border-border pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          Location
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.location ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.location && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {uniqueLocations.map((location) => (
              <label key={location} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.location.includes(location)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        location: [...selectedFilters.location, location],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        location: selectedFilters.location.filter((l) => l !== location),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{location}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Type Filter */}
      <div className="space-y-3 border-b border-border pb-4">
        <button
          onClick={() => toggleSection("type")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          Program Type
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.type ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.type && (
          <div className="space-y-2">
            {uniqueTypes.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.type.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        type: [...selectedFilters.type, type],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        type: selectedFilters.type.filter((t) => t !== type),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground capitalize">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Organization Filter */}
      <div className="space-y-3 border-b border-border pb-4">
        <button
          onClick={() => toggleSection("organization")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          Organization
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expandedSections.organization ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.organization && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {uniqueOrganizations.map((organization) => (
              <label key={organization} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.organization.includes(organization)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        organization: [...selectedFilters.organization, organization],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        organization: selectedFilters.organization.filter((o) => o !== organization),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{organization}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("tags")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          Tags
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.tags ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.tags && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {uniqueTags.map((tag) => (
              <label key={tag} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.tags.includes(tag)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        tags: [...selectedFilters.tags, tag],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        tags: selectedFilters.tags.filter((t) => t !== tag),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{tag}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
