"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getAccessToken, getStoredUser } from "@/lib/auth"

export default function EditOfferingPage() {
  const router = useRouter()
  const params = useParams()
  const offeringId = params?.id

  useEffect(() => {
    const token = getAccessToken()
    const user = getStoredUser()
    if (!token || !user) {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-12">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Edit offering</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Editing for offering <span className="font-medium text-foreground">{String(offeringId ?? "")}</span>.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          This is a placeholder for editing tools. Wire this up to your offerings editor once the API endpoints are ready.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Back to programs
          </Link>
        </div>
      </div>
    </div>
  )
}
