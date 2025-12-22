"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { API_BASE_URL, getAccessToken, getStoredUser } from "@/lib/auth"
import type { CounselingProgramType } from "@/lib/counseling-program-types"

const PROGRAMS_ENDPOINT = `${API_BASE_URL}/counseling/programs`
const PROGRAM_TYPES_ENDPOINT = `${API_BASE_URL}/counseling/program-types`

const emptyForm = {
  program: "",
  organization: "",
  location: "",
  description: "",
  link: "",
  programTypeId: "",
  tags: "",
}

type FormState = typeof emptyForm

type FormErrors = Partial<Record<keyof FormState, string>>

export default function NewOfferingPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [programTypes, setProgramTypes] = useState<CounselingProgramType[]>([])

  useEffect(() => {
    const token = getAccessToken()
    const user = getStoredUser()
    if (!token || !user) {
      router.replace("/login")
    }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()

    const fetchProgramTypes = async () => {
      try {
        const response = await fetch(PROGRAM_TYPES_ENDPOINT, { signal: controller.signal })
        const data = await response.json()

        if (!response.ok || !data?.success || !Array.isArray(data.programTypes)) {
          throw new Error("Unable to load types")
        }

        const mappedTypes: CounselingProgramType[] = data.programTypes
          .map((type: any) => ({
            id: Number(type.id),
            name: String(type.name ?? "").trim(),
            color: String(type.color ?? "").trim(),
          }))
          .filter((type: CounselingProgramType) => Number.isInteger(type.id) && type.name)

        setProgramTypes(mappedTypes)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setProgramTypes([])
        }
      }
    }

    void fetchProgramTypes()

    return () => controller.abort()
  }, [])

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }))
    setSuccessMessage(null)
  }

  const validateForm = () => {
    const nextErrors: FormErrors = {}

    if (!formState.program.trim()) {
      nextErrors.program = "Program name is required."
    }

    if (!formState.organization.trim()) {
      nextErrors.organization = "Organization is required."
    }

    if (formState.link && !/^https?:\/\//i.test(formState.link.trim())) {
      nextErrors.link = "Include a full URL starting with http or https."
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    const token = getAccessToken()
    const user = getStoredUser()

    if (!token || !user) {
      router.replace("/login")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setCreatedId(null)

    try {
      const payload = {
        program: formState.program.trim(),
        organization: formState.organization.trim(),
        location: formState.location.trim() || null,
        description: formState.description.trim() || null,
        link: formState.link.trim() || null,
        program_type: formState.programTypeId ? Number(formState.programTypeId) : null,
        tags: formState.tags,
      }

      const response = await fetch(PROGRAMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data?.success || !data?.program) {
        throw new Error(data?.message || "Unable to create program")
      }

      setFormState(emptyForm)
      setCreatedId(typeof data.program.id === "number" ? data.program.id : Number(data.program.id))
      setSuccessMessage("Program created successfully.")
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setErrorMessage("We couldn’t create this program. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-12">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Add a new program</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create a new summer enrichment offering.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Back to programs
          </Link>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}{" "}
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSave()
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="program">
              Program name
            </label>
            <input
              id="program"
              value={formState.program}
              onChange={(event) => handleChange("program", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="Program name"
              required
            />
            {formErrors.program ? <p className="text-xs text-destructive">{formErrors.program}</p> : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="organization">
              Organization
            </label>
            <input
              id="organization"
              value={formState.organization}
              onChange={(event) => handleChange("organization", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="Organization"
              required
            />
            {formErrors.organization ? <p className="text-xs text-destructive">{formErrors.organization}</p> : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              value={formState.location}
              onChange={(event) => handleChange("location", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="Location"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="programTypeId">
              Program type
            </label>
            <select
              id="programTypeId"
              value={formState.programTypeId}
              onChange={(event) => handleChange("programTypeId", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <option value="">Select a program type</option>
              {programTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              value={formState.tags}
              onChange={(event) => handleChange("tags", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="link">
              Link
            </label>
            <input
              id="link"
              value={formState.link}
              onChange={(event) => handleChange("link", event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="https://..."
            />
            {formErrors.link ? <p className="text-xs text-destructive">{formErrors.link}</p> : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={formState.description}
              onChange={(event) => handleChange("description", event.target.value)}
              className="min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              placeholder="Describe the offering"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Create program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
