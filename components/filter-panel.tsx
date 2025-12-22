"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { CounselingProgramType } from "@/lib/counseling-program-types"

interface FilterPanelProps {
  selectedFilters: {
    location: string[]
    type: number[]
    organization: string[]
    tags: string[]
  }
  setSelectedFilters: (filters: any) => void
  filters: {
    locations: string[]
    programTypes: CounselingProgramType[]
    organizations: string[]
    tags: string[]
  }
  canEdit?: boolean
  onCreateType?: (payload: { name: string; color: string }) => Promise<void>
  onUpdateType?: (typeId: number, updates: { name: string; color: string }) => Promise<void>
  onDeleteType?: (typeId: number) => Promise<void>
}

const STORAGE_KEY = "enrichment-filter-expanded"

type ExpandedSections = {
  location: boolean
  type: boolean
  organization: boolean
  tags: boolean
}

const defaultExpandedSections: ExpandedSections = {
  location: true,
  type: true,
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
    typeof record.type === "boolean" &&
    typeof record.organization === "boolean" &&
    typeof record.tags === "boolean"
  )
}

export default function FilterPanel({
  selectedFilters,
  setSelectedFilters,
  filters,
  canEdit = false,
  onCreateType,
  onUpdateType,
  onDeleteType,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(defaultExpandedSections)
  const [isManagingTypes, setIsManagingTypes] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6")
  const [typeError, setTypeError] = useState<string | null>(null)
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null)
  const [editingTypeName, setEditingTypeName] = useState("")
  const [editingTypeColor, setEditingTypeColor] = useState("#3b82f6")

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
        type: false,
        organization: false,
        tags: false,
      })
    }
  }, [])

  const uniqueLocations = Array.from(new Set(filters.locations.filter(Boolean))).sort()
  const uniqueTypes = useMemo(() => {
    const seen = new Map<number, CounselingProgramType>()
    filters.programTypes.forEach((type) => {
      if (!seen.has(type.id)) {
        seen.set(type.id, type)
      }
    })
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [filters.programTypes])
  const uniqueOrganizations = Array.from(new Set(filters.organizations.filter(Boolean))).sort()
  const uniqueTags = Array.from(new Set(filters.tags.filter(Boolean))).sort()

  const beginEditType = (type: CounselingProgramType) => {
    setEditingTypeId(type.id)
    setEditingTypeName(type.name)
    setEditingTypeColor(type.color)
    setTypeError(null)
  }

  const cancelEditType = () => {
    setEditingTypeId(null)
    setEditingTypeName("")
    setEditingTypeColor("#3b82f6")
  }

  const handleCreateType = async () => {
    if (!onCreateType) {
      return
    }
    if (!newTypeName.trim()) {
      setTypeError("Type name is required.")
      return
    }
    if (!newTypeColor.trim()) {
      setTypeError("Type color is required.")
      return
    }
    setTypeError(null)
    try {
      await onCreateType({ name: newTypeName.trim(), color: newTypeColor.trim() })
      setNewTypeName("")
      setNewTypeColor("#3b82f6")
    } catch (error) {
      setTypeError(error instanceof Error ? error.message : "Unable to create type.")
    }
  }

  const handleUpdateType = async () => {
    if (!onUpdateType || editingTypeId === null) {
      return
    }
    if (!editingTypeName.trim()) {
      setTypeError("Type name is required.")
      return
    }
    if (!editingTypeColor.trim()) {
      setTypeError("Type color is required.")
      return
    }
    setTypeError(null)
    try {
      await onUpdateType(editingTypeId, { name: editingTypeName.trim(), color: editingTypeColor.trim() })
      cancelEditType()
    } catch (error) {
      setTypeError(error instanceof Error ? error.message : "Unable to update type.")
    }
  }

  const handleDeleteType = async (typeId: number) => {
    if (!onDeleteType) {
      return
    }
    const confirmed = window.confirm("Delete this program type? This cannot be undone.")
    if (!confirmed) {
      return
    }
    setTypeError(null)
    try {
      await onDeleteType(typeId)
    } catch (error) {
      setTypeError(error instanceof Error ? error.message : "Unable to delete type.")
    }
  }

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
              {uniqueTypes.map((type) => {
                const checkboxId = toCheckboxId("type", type.name)
                return (
                  <label key={type.id} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFilters.type.includes(type.id)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedFilters({
                            ...selectedFilters,
                            type: [...selectedFilters.type, type.id],
                          })
                        } else {
                          setSelectedFilters({
                            ...selectedFilters,
                            type: selectedFilters.type.filter((t) => t !== type.id),
                          })
                        }
                      }}
                    />
                    <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-sm text-muted-foreground">{type.name}</span>
                  </label>
                )
              })}
              {uniqueTypes.length === 0 && (
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

      {canEdit && onCreateType && (
        <div className="space-y-3 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setIsManagingTypes((prev) => !prev)}
            className="flex w-full items-center justify-between font-medium text-foreground"
          >
            Manage program types
            <ChevronDown className={`h-4 w-4 transition-transform ${isManagingTypes ? "rotate-180" : ""}`} />
          </button>
          {isManagingTypes && (
            <div className="space-y-3">
              {typeError ? <p className="text-xs text-destructive">{typeError}</p> : null}
              <div className="grid gap-2">
                <label className="text-xs font-medium text-foreground" htmlFor="new-type-name">
                  Add new type
                </label>
                <input
                  id="new-type-name"
                  value={newTypeName}
                  onChange={(event) => setNewTypeName(event.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                  placeholder="Type name"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTypeColor}
                    onChange={(event) => setNewTypeColor(event.target.value)}
                    className="h-8 w-10 rounded border border-border bg-background p-0"
                    aria-label="Pick a type color"
                  />
                  <span className="text-xs">{newTypeColor}</span>
                  <button
                    type="button"
                    onClick={() => void handleCreateType()}
                    className="ml-auto rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {uniqueTypes.map((type) => (
                  <div key={type.id} className="rounded-md border border-border bg-background p-2">
                    {editingTypeId === type.id ? (
                      <div className="space-y-2">
                        <input
                          value={editingTypeName}
                          onChange={(event) => setEditingTypeName(event.target.value)}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingTypeColor}
                            onChange={(event) => setEditingTypeColor(event.target.value)}
                            className="h-8 w-10 rounded border border-border bg-background p-0"
                            aria-label="Edit type color"
                          />
                          <span className="text-xs">{editingTypeColor}</span>
                          <button
                            type="button"
                            onClick={() => void handleUpdateType()}
                            className="ml-auto rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditType}
                            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="text-xs text-foreground">{type.name}</span>
                        <button
                          type="button"
                          onClick={() => beginEditType(type)}
                          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                          aria-label={`Edit ${type.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteType(type.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10"
                          aria-label={`Delete ${type.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
