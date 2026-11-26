"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp, GraduationCap, Search, X } from "lucide-react"
import ProgramCard from "@/components/program-card"
import FilterPanel from "@/components/filter-panel"
import type { CounselingProgram } from "@/lib/counseling-programs"
import { loadPrograms } from "@/lib/programs"
import { PROGRAM_CATEGORIES } from "@/lib/program-categories"
import Image from "next/image"

const PAGE_SIZE = 6

// An env var explicitly set to "" (e.g. in .env.local) means "turn this off"
// and must be told apart from one that's simply unset, so these compare
// against undefined rather than using `||`.
const SITE_HEADING = process.env.NEXT_PUBLIC_SITE_HEADING || "Summer Enrichment Opportunities"
const LOGO_PATH =
  process.env.NEXT_PUBLIC_LOGO_PATH !== undefined ? process.env.NEXT_PUBLIC_LOGO_PATH : "/ljcds.png"
const LOGO_ALT =
  process.env.NEXT_PUBLIC_LOGO_ALT !== undefined
    ? process.env.NEXT_PUBLIC_LOGO_ALT
    : "La Jolla Country Day School logo"
const RESOURCE_LINK_LABEL =
  process.env.NEXT_PUBLIC_RESOURCE_LINK_LABEL !== undefined
    ? process.env.NEXT_PUBLIC_RESOURCE_LINK_LABEL
    : "Letter of Recommendation Policy"
const RESOURCE_LINK_URL =
  process.env.NEXT_PUBLIC_RESOURCE_LINK_URL !== undefined
    ? process.env.NEXT_PUBLIC_RESOURCE_LINK_URL
    : "https://docs.google.com/document/d/1VuRe9v97OJVgCZ6biSROmiFRgc9XbdIQ5U0T5KZLVk4/edit?tab=t.0#heading=h.2r84iwffua82"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    location: [] as string[],
    category: [] as string[],
    organization: [] as string[],
    tags: [] as string[],
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [debouncedFilters, setDebouncedFilters] = useState(selectedFilters)
  const [programs, setPrograms] = useState<CounselingProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setDebouncedFilters(selectedFilters)
    }, 350)

    return () => clearTimeout(timeout)
  }, [searchQuery, selectedFilters])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setErrorMessage(null)

    loadPrograms()
      .then((data) => {
        if (!cancelled) {
          setPrograms(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("We're making some changes right now, sorry for the inconvenience. Please try again soon.")
          setPrograms([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 240)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const availableFilters = useMemo(() => {
    const locations = new Set<string>()
    const organizations = new Set<string>()
    const tags = new Set<string>()

    programs.forEach((program) => {
      if (program.location) locations.add(program.location)
      if (program.organization) organizations.add(program.organization)
      program.tags.forEach((tag) => tags.add(tag))
    })

    return {
      locations: Array.from(locations),
      organizations: Array.from(organizations),
      tags: Array.from(tags),
      categories: [...PROGRAM_CATEGORIES],
    }
  }, [programs])

  const filteredPrograms = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase()

    return programs.filter((program) => {
      if (query) {
        const haystack = [program.program, program.organization, program.description ?? "", program.location ?? "", ...program.tags]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(query)) {
          return false
        }
      }

      if (debouncedFilters.location.length > 0 && (!program.location || !debouncedFilters.location.includes(program.location))) {
        return false
      }

      if (debouncedFilters.category.length > 0 && (!program.category || !debouncedFilters.category.includes(program.category))) {
        return false
      }

      if (debouncedFilters.organization.length > 0 && !debouncedFilters.organization.includes(program.organization)) {
        return false
      }

      if (debouncedFilters.tags.length > 0 && !debouncedFilters.tags.some((tag) => program.tags.includes(tag))) {
        return false
      }

      return true
    })
  }, [programs, debouncedSearchQuery, debouncedFilters])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearchQuery, debouncedFilters])

  const visiblePrograms = filteredPrograms.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPrograms.length

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry?.isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: "120px" }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFilters({
      location: [],
      category: [],
      organization: [],
      tags: [],
    })
  }

  const hasActiveFilters =
    searchQuery ||
    selectedFilters.location.length > 0 ||
    selectedFilters.category.length > 0 ||
    selectedFilters.organization.length > 0 ||
    selectedFilters.tags.length > 0

  const isInitialLoading = isLoading && programs.length === 0 && !errorMessage
  const showEmptyState = !isLoading && !errorMessage && filteredPrograms.length === 0
  const resultsLabel = isInitialLoading
    ? "Loading programs..."
    : `${filteredPrograms.length} program${filteredPrograms.length !== 1 ? "s" : ""} found`

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border ">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            {LOGO_PATH && <Image src={LOGO_PATH} alt={LOGO_ALT} width={48} height={48} priority />}
            <h1 className="text-3xl font-bold text-foreground">{SITE_HEADING}</h1>
          </div>

          {RESOURCE_LINK_URL && (
            <button
              type="button"
              onClick={() => {
                window.open(RESOURCE_LINK_URL)
              }}
              className="mb-6 flex w-full items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-left transition hover:bg-primary/15"
            >
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
              <span className="flex flex-wrap items-center gap-x-2">
                <span className="font-semibold text-primary underline-offset-4 hover:underline">
                  {RESOURCE_LINK_LABEL}
                </span>
              </span>
            </button>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by program name, organization, or keywords..."
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
              filters={availableFilters}
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
                {selectedFilters.location.map((location) => (
                  <button
                    key={location}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        location: selectedFilters.location.filter((value) => value !== location),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {location}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedFilters.category.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        category: selectedFilters.category.filter((value) => value !== category),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {category}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedFilters.organization.map((organization) => (
                  <button
                    key={organization}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        organization: selectedFilters.organization.filter((value) => value !== organization),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {organization}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedFilters.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        tags: selectedFilters.tags.filter((value) => value !== tag),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button onClick={clearFilters} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  <span>{resultsLabel}</span>
                </h2>
              </div>
            </div>

            {/* Programs Grid */}
            {errorMessage ? (
              <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
                {errorMessage}
              </div>
            ) : isInitialLoading ? (
              <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
                Fetching the latest opportunities...
              </div>
            ) : visiblePrograms.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {visiblePrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
                <div
                  ref={loadMoreRef}
                  className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground"
                >
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="rounded-full border border-border px-4 py-2 font-medium text-foreground transition hover:bg-muted"
                    >
                      Load more programs
                    </button>
                  ) : (
                    <span>You’ve reached the end of the list.</span>
                  )}
                </div>
              </>
            ) : showEmptyState ? (
              <div className="rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">No programs match your search criteria. Try adjusting your filters.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Jump to top"
        className={`fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full border border-border bg-background/90 p-3 text-foreground shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-background ${
          showScrollTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </main>
  )
}
