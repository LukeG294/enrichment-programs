"use client"
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation"
import { Auth } from "@/lib/auth"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams()

  const resetToken = useMemo(() => {
    return searchParams.get("token") ?? ""
  }, [searchParams])

  useEffect(() => {
    setError(null);
    setInfo(null);
    setSuccess(false);
    setLoading(false);
  }, [resetToken]);

  const handleRequestReset = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSuccess(false);
    setLoading(true);

    try {
      const auth = new Auth();
      await auth.requestPasswordReset(email.trim());
      setInfo('If that email exists, a reset link will be sent.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unable to request reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSuccess(false);

    if (!resetToken) {
      setError('Reset token missing. Please use the link from your email.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const auth = new Auth();
      await auth.resetPassword(resetToken, newPassword);
      setInfo('Password reset successfully. You can now sign in.');
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = Boolean(resetToken);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Head>
        <title>{isResetMode ? 'Set a new password' : 'Forgot your password?'}</title>
      </Head>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 space-y-6 border border-slate-200/60 dark:border-slate-700/60">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {isResetMode ? 'Choose a new password' : 'Reset your password'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isResetMode
              ? 'Enter a new password to finish resetting your account.'
              : 'We will email you a link to reset your password.'}
          </p>
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

        {isResetMode ? (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="new-password">
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirm-password">
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
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Updating password…' : 'Reset password'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRequestReset}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          {success ? 'All set. ' : ''}
          <Link href="/login" className="font-medium text-slate-700 underline-offset-2 hover:underline dark:text-slate-200">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
