'use client';

import Link from 'next/link';
import { useAuth } from '@/src/auth/AuthProvider';

export default function PendingPage() {
	const { logout } = useAuth();

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6">
			<div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(58,90,64,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(58,90,64,0.08)_1px,transparent_1px)]" />

			<div className="relative z-10 w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-10 text-center text-[#344e41] shadow-sm">
				<p className="mb-3 text-xs font-medium text-[var(--role-customer)]">Account status</p>
				<h1 className="mb-4 text-3xl font-semibold tracking-tight">Role verification pending</h1>
				<p className="mx-auto max-w-xl text-sm text-[#6b705c]">
					Please wait until we verify your role. You will be able to access your dashboard once your role is assigned.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link
						href="/login"
						className="w-full rounded-md border border-[var(--input)] bg-white px-4 py-3 text-xs font-medium text-[#5f6f59] transition-colors hover:border-[var(--border)] hover:text-[#344e41] sm:w-auto"
					>
						Back to login
					</Link>
					<Link
						href="/pending/profile"
						className="w-full rounded-md border border-[var(--input)] bg-white px-4 py-3 text-xs font-medium text-[#5f6f59] transition-colors hover:border-[var(--border)] hover:text-[#344e41] sm:w-auto"
					>
						View profile
					</Link>
					<button
						onClick={logout}
						className="w-full rounded-md border-0 bg-[var(--role-customer)] px-4 py-3 text-xs font-semibold text-black transition-colors hover:opacity-90 sm:w-auto"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
