"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getCategoryColor } from "@/lib/program-categories"

interface FilterPanelProps {
  selectedFilters: {
    location: string[]
    category: string[]
    organization: string[]
    tags: string[]
  }
  setSelectedFilters: (filters: any) => void
  filters: {
    locations: string[]
    categories: string[]
    organizations: string[]
    tags: string[]
  }
}

const STORAGE_KEY = "enrichment-filter-expanded"

type ExpandedSections = {
  location: boolean
  category: boolean
  organization: boolean
  tags: boolean
}

const defaultExpandedSections: ExpandedSections = {
  location: true,
  category: true,
  organization: true,
  tags: true,
}

const isExpandedSections = (value: unknown): value is ExpandedSections => {
  if (!value || typeof value !== "object") {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.location === "boolean" &&
    typeof record.category === "boolean" &&
    typeof record.organization === "boolean" &&
    typeof record.tags === "boolean"
  )
}

export default function FilterPanel({ selectedFilters, setSelectedFilters, filters }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(defaultExpandedSections)

  const toCheckboxId = (prefix: string, value: string) =>
    `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

  const persistExpandedSections = (next: ExpandedSections) => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => {
      const next = {
        ...prev,
        [section]: !prev[section],
      }
      persistExpandedSections(next)
      return next
    })
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (isExpandedSections(parsed)) {
          setExpandedSections(parsed)
          return
        }
      } catch {
        // Ignore invalid local storage entries.
      }
    }

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches
    if (!isDesktop) {
      setExpandedSections({
        location: false,
        category: false,
        organization: false,
        tags: false,
      })
    }
  }, [])

  const uniqueLocations = Array.from(new Set(filters.locations.filter(Boolean))).sort()
  const uniqueCategories = Array.from(new Set(filters.categories.filter(Boolean))).sort()
  const uniqueOrganizations = Array.from(new Set(filters.organizations.filter(Boolean))).sort()
  const uniqueTags = Array.from(new Set(filters.tags.filter(Boolean))).sort()

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border border-border p-6">
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
              {uniqueLocations.map((location) => {
                const checkboxId = toCheckboxId("location", location)
                return (
                  <label key={location} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFilters.location.includes(location)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
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
                    />
                    <span className="text-sm text-muted-foreground">{location}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-3 border-b border-border pb-4">
          <button
            onClick={() => toggleSection("category")}
            className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
          >
            Program Type
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.category ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              {uniqueCategories.map((category) => {
                const checkboxId = toCheckboxId("category", category)
                const color = getCategoryColor(category)
                return (
                  <label key={category} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFilters.category.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedFilters({
                            ...selectedFilters,
                            category: [...selectedFilters.category, category],
                          })
                        } else {
                          setSelectedFilters({
                            ...selectedFilters,
                            category: selectedFilters.category.filter((c) => c !== category),
                          })
                        }
                      }}
                    />
                    {color && <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: color }} />}
                    <span className="text-sm text-muted-foreground">{category}</span>
                  </label>
                )
              })}
              {uniqueCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">No program types available.</p>
              )}
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
              {uniqueOrganizations.map((organization) => {
                const checkboxId = toCheckboxId("organization", organization)
                return (
                  <label key={organization} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFilters.organization.includes(organization)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
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
                    />
                    <span className="text-sm text-muted-foreground">{organization}</span>
                  </label>
                )
              })}
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
              {uniqueTags.map((tag) => {
                const checkboxId = toCheckboxId("tag", tag)
                return (
                  <label key={tag} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFilters.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
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
                    />
                    <span className="text-sm text-muted-foreground">{tag}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
