"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import ProgramCard from "@/components/program-card"
import FilterPanel from "@/components/filter-panel"
import { PROGRAMS } from "@/lib/programs-data"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    distance: null as number | null,
    city: [] as string[],
    type: [] as string[],
    college: [] as string[],
  })

  const filteredPrograms = useMemo(() => {
    return PROGRAMS.filter((program) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          program.name.toLowerCase().includes(query) ||
          program.college.toLowerCase().includes(query) ||
          program.description.toLowerCase().includes(query) ||
          program.keywords.some((k) => k.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Distance filter
      if (selectedFilters.distance !== null && program.distance > selectedFilters.distance) {
        return false
      }

      // City filter
      if (selectedFilters.city.length > 0 && !selectedFilters.city.includes(program.city)) {
        return false
      }

      // Type filter
      if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(program.type)) {
        return false
      }

      // College filter
      if (selectedFilters.college.length > 0 && !selectedFilters.college.includes(program.college)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedFilters])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFilters({
      distance: null,
      city: [],
      type: [],
      college: [],
    })
  }

  const hasActiveFilters =
    searchQuery ||
    selectedFilters.distance ||
    selectedFilters.city.length > 0 ||
    selectedFilters.type.length > 0 ||
    selectedFilters.college.length > 0

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">College Program Explorer</h1>
            <p className="mt-2 text-muted-foreground">Discover the perfect college program for your future</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by program name, keywords, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              programs={PROGRAMS}
            />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    Search: {searchQuery}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedFilters.distance && (
                  <button
                    onClick={() => setSelectedFilters({ ...selectedFilters, distance: null })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    Within {selectedFilters.distance} mi
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedFilters.city.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        city: selectedFilters.city.filter((x) => x !== c),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {c}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedFilters.type.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        type: selectedFilters.type.filter((x) => x !== t),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {t}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedFilters.college.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        college: selectedFilters.college.filter((x) => x !== c),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {c}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
              </h2>
            </div>

            {/* Programs Grid */}
            {filteredPrograms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  No programs match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
