"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterPanelProps {
  selectedFilters: {
    distance: number | null
    city: string[]
    type: string[]
    college: string[]
  }
  setSelectedFilters: (filters: any) => void
  programs: any[]
}

export default function FilterPanel({ selectedFilters, setSelectedFilters, programs }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    distance: true,
    city: true,
    type: true,
    college: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Get unique values
  const uniqueCities = Array.from(new Set(programs.map((p) => p.city))).sort()
  const uniqueTypes = Array.from(new Set(programs.map((p) => p.type))).sort()
  const uniqueColleges = Array.from(new Set(programs.map((p) => p.college))).sort()

  const distances = [10, 25, 50, 100]

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="font-semibold text-foreground">Filters</h3>

      {/* Distance Filter */}
      <div className="space-y-3 border-b border-border pb-4">
        <button
          onClick={() => toggleSection("distance")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          Distance
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.distance ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.distance && (
          <div className="space-y-2">
            {distances.map((distance) => (
              <label key={distance} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="distance"
                  value={distance}
                  checked={selectedFilters.distance === distance}
                  onChange={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      distance: selectedFilters.distance === distance ? null : distance,
                    })
                  }
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">Within {distance} miles</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* City Filter */}
      <div className="space-y-3 border-b border-border pb-4">
        <button
          onClick={() => toggleSection("city")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          City
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.city ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.city && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uniqueCities.map((city) => (
              <label key={city} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.city.includes(city)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        city: [...selectedFilters.city, city],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        city: selectedFilters.city.filter((c) => c !== city),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{city}</span>
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

      {/* College Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("college")}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
        >
          College
          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.college ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.college && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uniqueColleges.map((college) => (
              <label key={college} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.college.includes(college)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters({
                        ...selectedFilters,
                        college: [...selectedFilters.college, college],
                      })
                    } else {
                      setSelectedFilters({
                        ...selectedFilters,
                        college: selectedFilters.college.filter((c) => c !== college),
                      })
                    }
                  }}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{college}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
