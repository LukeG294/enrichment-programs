"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { API_BASE_URL, getAccessToken, getStoredUser } from "@/lib/auth"
import type { CounselingProgram } from "@/lib/counseling-programs"

const PROGRAM_DETAILS_ENDPOINT = `${API_BASE_URL}/counseling/programs`

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

const emptyForm = {
  program: "",
  organization: "",
  location: "",
  description: "",
  link: "",
  type: "",
  tags: "",
}

type FormState = typeof emptyForm

type FormErrors = Partial<Record<keyof FormState, string>>

export default function EditOfferingPage() {
  const router = useRouter()
  const params = useParams()
  const offeringId = params?.id

  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [initialData, setInitialData] = useState<FormState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const parsedOfferingId = useMemo(() => {
    if (typeof offeringId === "string") {
      const parsed = Number.parseInt(offeringId, 10)
      return Number.isInteger(parsed) ? parsed : null
    }
    return null
  }, [offeringId])

  useEffect(() => {
    const token = getAccessToken()
    const user = getStoredUser()
    if (!token || !user) {
      router.replace("/login")
    }
  }, [router])

  const hydrateForm = useCallback((program: CounselingProgram) => {
    const nextState: FormState = {
      program: program.program ?? "",
      organization: program.organization ?? "",
      location: program.location ?? "",
      description: program.description ?? "",
      link: program.link ?? "",
      type: program.type ?? "",
      tags: normalizeTags(program.tags).join(", "),
    }
    setFormState(nextState)
    setInitialData(nextState)
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    const user = getStoredUser()

    if (!token || !user) {
      return
    }

    if (!parsedOfferingId) {
      setErrorMessage("Offering ID is invalid.")
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchProgram = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      try {
        const response = await fetch(`${PROGRAM_DETAILS_ENDPOINT}/${parsedOfferingId}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok || !data?.success || !data?.program) {
          throw new Error(data?.message || "Unable to load program")
        }

        const programData: CounselingProgram = {
          id: Number(data.program.id),
          program: String(data.program.program ?? "").trim(),
          organization: String(data.program.organization ?? "").trim(),
          location: data.program.location ? String(data.program.location).trim() : null,
          description: data.program.description ? String(data.program.description).trim() : null,
          link: data.program.link ? String(data.program.link).trim() : null,
          type: data.program.type ? String(data.program.type).trim() : null,
          tags: normalizeTags(data.program.tags),
        }

        hydrateForm(programData)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setErrorMessage("We couldn’t load this offering. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProgram()

    return () => controller.abort()
  }, [hydrateForm, parsedOfferingId])

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

    if (!parsedOfferingId) {
      setErrorMessage("Offering ID is invalid.")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const payload = {
        program: formState.program.trim(),
        organization: formState.organization.trim(),
        location: formState.location.trim() || null,
        description: formState.description.trim() || null,
        link: formState.link.trim() || null,
        type: formState.type.trim() || null,
        tags: formState.tags,
      }

      const response = await fetch(`${PROGRAM_DETAILS_ENDPOINT}/${parsedOfferingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data?.success || !data?.program) {
        throw new Error(data?.message || "Unable to update offering")
      }

      const updatedProgram: CounselingProgram = {
        id: Number(data.program.id),
        program: String(data.program.program ?? "").trim(),
        organization: String(data.program.organization ?? "").trim(),
        location: data.program.location ? String(data.program.location).trim() : null,
        description: data.program.description ? String(data.program.description).trim() : null,
        link: data.program.link ? String(data.program.link).trim() : null,
        type: data.program.type ? String(data.program.type).trim() : null,
        tags: normalizeTags(data.program.tags),
      }

      hydrateForm(updatedProgram)
      setSuccessMessage("Offering updated successfully.")
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setErrorMessage("We couldn’t save your changes. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const token = getAccessToken()
    const user = getStoredUser()

    if (!token || !user) {
      router.replace("/login")
      return
    }

    if (!parsedOfferingId) {
      setErrorMessage("Offering ID is invalid.")
      return
    }

    const confirmed = window.confirm("Delete this offering? This action cannot be undone.")
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${PROGRAM_DETAILS_ENDPOINT}/${parsedOfferingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to delete offering")
      }

      router.replace("/")
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setErrorMessage("We couldn’t delete this offering. Please try again.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const isDirty = initialData
    ? (Object.keys(initialData) as (keyof FormState)[]).some((key) => initialData[key] !== formState[key])
    : false

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-12">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Edit offering</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the details for offering <span className="font-medium text-foreground">{String(offeringId ?? "")}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete offering"}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading offering details...</p>
        ) : (
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
              <label className="text-sm font-medium text-foreground" htmlFor="type">
                Program type
              </label>
              <input
                id="type"
                value={formState.type}
                onChange={(event) => handleChange("type", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                placeholder="Program type"
              />
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
                disabled={isSaving || !isDirty}
              >
                {isSaving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Back to programs
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
