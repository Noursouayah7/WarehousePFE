'use client';

import { useAuth } from '@/src/auth/AuthProvider';

export default function PendingPage() {
	const { logout } = useAuth();

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(47,118,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(88,129,87,0.08),transparent_30%),linear-gradient(180deg,var(--background)_0%,var(--secondary)_100%)] px-6">
			<div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />

			<div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--foreground)] shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
				<p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Account status</p>
				<h1 className="mb-4 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)]">Role verification pending</h1>
				<p className="mx-auto max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
					Please wait until we verify your role. You will be able to access your dashboard once your role is assigned.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<button
						onClick={logout}
						className="w-full rounded-full bg-[var(--color-primary)] px-5 py-3 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] transition hover:opacity-90 sm:w-auto"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
