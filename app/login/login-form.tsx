"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Auth, getCookie, getStoredUser, storeSession } from "@/lib/auth"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = getCookie("access_token")
    const user = getStoredUser()
    if (token && user) {
      router.replace("/")
    }
  }, [router])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const auth = new Auth()
      const response = await auth.login(email.trim(), password)
      storeSession(response.token, response.user)
      router.push("/")
    } catch (err: any) {
      if (err?.code === 5) {
        setNeedsPassword(true)
        setNewPassword("")
        setConfirmPassword("")
        setError("This account needs a password before you can sign in.")
      } else {
        setError(err.message || "Unable to login")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSetup = async (event: FormEvent) => {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const auth = new Auth()
      await auth.setPassword(email.trim(), newPassword)
      setInfo("Password set successfully. Signing you in...")
      setPassword(newPassword)
      const response = await auth.login(email.trim(), newPassword)
      storeSession(response.token, response.user)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Unable to set password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 space-y-6 border border-slate-200/60 dark:border-slate-700/60">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Login to your campus dashboard.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <div className="flex justify-end">
              <Link
                href="/reset-password"
                className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200">
              {info}
            </div>
          )}

          {!needsPassword && (
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          )}
        </form>

        <div className="-mt-2">
          {needsPassword ? (
            <form
              className="space-y-4 border-t border-slate-200/60 pt-4 dark:border-slate-700/60"
              onSubmit={handlePasswordSetup}
            >
              <div className="space-y-2 text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Set a password to continue</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose a password for your account.</p>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="new-password"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="confirm-password"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium shadow-md transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Setting password…" : "Set password and sign in"}
              </button>
            </form>
          ) : (
            <div>
              <a
                href="https://ckpnt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full rounded-xl bg-white text-black py-2.5 text-sm font-medium text-center border border-neutral-300 shadow-sm transition-all duration-200 hover:border-black hover:shadow-md active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-1">
                  Or, get started at ckpnt.com
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
