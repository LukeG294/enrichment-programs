"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, Search, X } from "lucide-react"
import ProgramCard from "@/components/program-card"
import FilterPanel from "@/components/filter-panel"
import type { CounselingProgram } from "@/lib/counseling-programs"
import Image from "next/image"

const PROGRAMS_ENDPOINT = "https://api.ckpnt.com/counseling/programs"
const FILTERS_ENDPOINT = "https://api.ckpnt.com/counseling/programs/filters"
const PAGE_SIZE = 6

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  return []
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    location: [] as string[],
    type: [] as string[],
    organization: [] as string[],
    tags: [] as string[],
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [debouncedFilters, setDebouncedFilters] = useState(selectedFilters)
  const [programs, setPrograms] = useState<CounselingProgram[]>([])
  const [availableFilters, setAvailableFilters] = useState({
    locations: [] as string[],
    programTypes: [] as string[],
    organizations: [] as string[],
    tags: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPrograms, setTotalPrograms] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setDebouncedFilters(selectedFilters)
    }, 350)

    return () => clearTimeout(timeout)
  }, [searchQuery, selectedFilters])

  const fetchPrograms = useCallback(async ({
    pageToLoad,
    append,
    signal,
  }: {
    pageToLoad: number
    append: boolean
    signal?: AbortSignal
  }) => {
    if (pageToLoad === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setErrorMessage(null)

    try {
      if (pageToLoad > 1) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      const queryParams = new URLSearchParams({
        page: String(pageToLoad),
        limit: String(PAGE_SIZE),
      })

      if (debouncedSearchQuery.trim()) {
        queryParams.set("search", debouncedSearchQuery.trim())
      }

      if (debouncedFilters.organization.length > 0) {
        queryParams.set("organization", debouncedFilters.organization.join(","))
      }

      if (debouncedFilters.type.length > 0) {
        queryParams.set("type", debouncedFilters.type.join(","))
      }

      if (debouncedFilters.tags.length > 0) {
        queryParams.set("tags", debouncedFilters.tags.join(","))
      }

      if (debouncedFilters.location.length > 0) {
        debouncedFilters.location.forEach((location) => {
          queryParams.append("location", location)
        })
      }

      const response = await fetch(`${PROGRAMS_ENDPOINT}?${queryParams.toString()}`, { signal })

      if (!response.ok) {
        throw new Error("Request failed")
      }

      const data = await response.json()

      if (!data?.success || !Array.isArray(data.programs)) {
        throw new Error("Unexpected response")
      }

      const mappedPrograms: CounselingProgram[] = data.programs.map((program: any) => ({
        id: Number(program.id),
        program: String(program.program ?? "").trim(),
        organization: String(program.organization ?? "").trim(),
        location: program.location ? String(program.location).trim() : null,
        description: program.description ? String(program.description).trim() : null,
        link: program.link ? String(program.link).trim() : null,
        type: program.type ? String(program.type).trim() : null,
        tags: normalizeTags(program.tags),
      }))

      setPrograms((prevPrograms) => (append ? [...prevPrograms, ...mappedPrograms] : mappedPrograms))
      setPage(pageToLoad)
      const totalCount = typeof data.total === "number" ? data.total : mappedPrograms.length
      setTotalPrograms(totalCount)
      setHasMore(pageToLoad * PAGE_SIZE < totalCount)
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setErrorMessage("We couldn’t load programs right now. Please try again later.")
        setPrograms([])
        setTotalPrograms(0)
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [debouncedFilters, debouncedSearchQuery])

  useEffect(() => {
    const controller = new AbortController()

    setHasMore(true)
    fetchPrograms({ pageToLoad: 1, append: false, signal: controller.signal })

    return () => controller.abort()
  }, [fetchPrograms])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 240)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const fetchFilters = async () => {
      try {
        const response = await fetch(FILTERS_ENDPOINT, { signal: controller.signal })

        if (!response.ok) {
          throw new Error("Request failed")
        }

        const data = await response.json()

        if (!data?.success || !data.filters) {
          throw new Error("Unexpected response")
        }

        setAvailableFilters({
          locations: Array.isArray(data.filters.locations) ? data.filters.locations : [],
          programTypes: Array.isArray(data.filters.programTypes) ? data.filters.programTypes : [],
          organizations: Array.isArray(data.filters.organizations) ? data.filters.organizations : [],
          tags: Array.isArray(data.filters.tags) ? data.filters.tags : [],
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAvailableFilters({
            locations: [],
            programTypes: [],
            organizations: [],
            tags: [],
          })
        }
      }
    }

    void fetchFilters()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry?.isIntersecting && !isLoadingMore && !isLoading && hasMore) {
          void fetchPrograms({ pageToLoad: page + 1, append: true })
        }
      },
      { rootMargin: "120px" }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [fetchPrograms, hasMore, isLoading, isLoadingMore, page])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedFilters({
      location: [],
      type: [],
      organization: [],
      tags: [],
    })
  }

  const hasActiveFilters =
    searchQuery ||
    selectedFilters.location.length > 0 ||
    selectedFilters.type.length > 0 ||
    selectedFilters.organization.length > 0 ||
    selectedFilters.tags.length > 0

  const isInitialLoading = isLoading && programs.length === 0 && !errorMessage
  const isRefreshing = isLoading && programs.length > 0
  const resultsLabel = isInitialLoading
    ? "Loading programs..."
    : `${totalPrograms} program${totalPrograms !== 1 ? "s" : ""} found`

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border ">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Image src="/ljcds.png" alt="La Jolla Country Day School logo" width={48} height={48} priority />
            <h1 className="text-3xl font-bold text-foreground">Summer Enrichment Opportunities</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by program name, organization, or tag..."
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
                {selectedFilters.type.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedFilters({
                        ...selectedFilters,
                        type: selectedFilters.type.filter((value) => value !== type),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                  >
                    {type}
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
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2
                  className={`text-lg font-semibold text-foreground transition-opacity duration-300 ${
                    isRefreshing ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <span className="tabular-nums">{resultsLabel}</span>
                </h2>
                {isRefreshing && (
                  <span className="text-sm text-muted-foreground">Updating results...</span>
                )}
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
            ) : programs.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 transition-opacity duration-300 md:grid-cols-2 ${
                    isRefreshing ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
                <div ref={loadMoreRef} className="mt-6 flex justify-center text-sm text-muted-foreground">
                  {isLoadingMore
                    ? "Loading more programs..."
                    : hasMore
                    ? "Scroll to load more programs."
                    : "You’ve reached the end of the list."}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">No programs match your search criteria. Try adjusting your filters.</p>
              </div>
            )}
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
